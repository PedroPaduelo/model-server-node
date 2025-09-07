import { decode, verify } from "jsonwebtoken";
import type { Socket } from "socket.io";

const JWT_SECRET = String(process.env.JWT_SECRET);

export async function jwtVerify<T>(token: string): Promise<T> {
  return new Promise((resolve, reject) => {
    verify(token, JWT_SECRET, (err, decoded) => {
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

    socket.user_id = decoded.sub;
    next();
  } catch (error) {
    next(new Error("Não autorizado."));
  }
}
