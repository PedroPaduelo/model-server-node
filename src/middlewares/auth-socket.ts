import { decode, verify } from "jsonwebtoken";
import type { Socket } from "socket.io";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";

export async function jwtVerify<T>(token: string): Promise<T> {
  return new Promise((resolve, reject) => {
    verify(token, env.JWT_SECRET, (err, decoded) => {
      if (err) return reject(err);
      resolve(decoded as T);
    });
  });
}

export function decodeToken<T>(token: string): T | null {
  const decoded = decode(token);
  return decoded as T | null;
}

export async function authenticate(
  socket: Socket,
  next: (err?: Error) => void
) {
  try {
    const token: string = socket.handshake.auth.token.replace(/"/g, "");
    const decoded = await jwtVerify<{ sub: string }>(token);

    const user = await prisma.user.findUnique({
      where: {
        id: decoded.sub,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
      },
    });

    if (!user) {
      return next(new Error("User not found or inactive"));
    }

    socket.user_id = decoded.sub;
    socket.user = user;
    next();
  } catch (error) {
    next(new Error("Não autorizado."));
  }
}
