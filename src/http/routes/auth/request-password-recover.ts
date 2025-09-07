import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

export async function requestPasswordRecover(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/password/recover",
    {
      schema: {
        tags: ["Auth"],
        summary: "Request password recover",
        body: z.object({
          email: z.string().email(),
        }),
        response: {
          201: z.null(),
        },
      },
    },
    async (request, reply) => {
      const { email } = request.body;

      const userFromEmail = await prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (!userFromEmail) {
        return reply.status(201).send();
      }

      await prisma.token.deleteMany({
        where: {
          userId: userFromEmail.id,
          type: "PASSWORD_RECOVER",
        },
      });

      // 1 hour
      const expires = new Date(new Date().getTime() + 3600 * 1000);

      const { id: code } = await prisma.token.create({
        data: {
          type: "PASSWORD_RECOVER",
          userId: userFromEmail.id,
          expiresAt: expires,
        },
      });

      // TODO: Send e-mail with password recover link
      console.log("Password recover token:", code);

      return reply.status(201).send();
    }
  );
}
