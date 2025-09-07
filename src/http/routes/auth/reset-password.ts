import { hash } from "bcryptjs";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import { UnauthorizedError } from "@/http/routes/_errors/unauthorized-error";
import { prisma } from "@/lib/prisma";

export async function resetPassword(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/password/reset",
    {
      schema: {
        tags: ["Auth"],
        summary: "Reset password",
        body: z.object({
          code: z.string(),
          password: z.string().min(6),
        }),
        response: {
          204: z.null(),
        },
      },
    },
    async (request, reply) => {
      const { code, password } = request.body;

      const tokenFromCode = await prisma.token.findUnique({
        where: { id: code },
      });

      if (!tokenFromCode) {
        throw new UnauthorizedError();
      }

      if (tokenFromCode.type !== "PASSWORD_RECOVER") {
        throw new UnauthorizedError();
      }

      const hasExpired = new Date(tokenFromCode.expiresAt) < new Date();

      if (hasExpired) {
        await prisma.token.deleteMany({
          where: {
            id: code,
          },
        });

        throw new UnauthorizedError();
      }

      const passwordHash = await hash(password, 6);

      await prisma.user.update({
        where: {
          id: tokenFromCode.userId,
        },
        data: {
          password: passwordHash,
        },
      });

      await prisma.token.deleteMany({
        where: {
          id: code,
        },
      });

      return reply.status(204).send();
    }
  );
}
