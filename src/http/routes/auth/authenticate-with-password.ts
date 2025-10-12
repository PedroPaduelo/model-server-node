import { compare } from "bcryptjs";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import { BadRequestError } from "@/http/routes/_errors";
import { prisma } from "@/lib/prisma";

const authenticateWithPasswordSchema = z.object({
  user: z.object({
    id: z.string().uuid(),
    fullName: z.string().nullable(),
    email: z.string().email(),
    avatarUrl: z.string().url().nullable(),
  }),
  token: z.string(),
});

export async function authenticateWithPassword(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/sessions/password",
    {
      schema: {
        tags: ["Auth"],
        summary: "Authenticate with e-mail & password",
        body: z.object({
          email: z.string().email(),
          password: z.string(),
        }),
        response: {
          201: z.object({
            user: z.object({
              id: z.string().uuid(),
              fullName: z.string().nullable(),
              email: z.string().email(),
              avatarUrl: z.string().url().nullable(),
            }),
            token: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { email, password } = request.body;

      const userFromEmail = await prisma.user.findUnique({
        select: {
          id: true,
          password: true,
          fullName: true,
          email: true,
          avatarUrl: true,
        },
        where: {
          email,
        },
      });

      if (!userFromEmail) {
        throw new BadRequestError("Invalid credentials.");
      }

      if (userFromEmail.password === null) {
        throw new BadRequestError(
          "User does not have a password, use social login."
        );
      }

      const isPasswordValid = await compare(password, userFromEmail.password);

      if (!isPasswordValid) {
        throw new BadRequestError("Invalid credentials.");
      }

      const token = await reply.jwtSign(
        {
          sub: userFromEmail.id,
        },
        {
          sign: {
            expiresIn: "7d",
          },
        }
      );

      return reply.status(201).send({
        ...authenticateWithPasswordSchema.parse({ user: userFromEmail, token }),
      });
    }
  );
}
