import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import { BadRequestError } from "@/http/routes/_errors";
import { prisma } from "@/lib/prisma";
import { auth } from "@/middlewares/auth";

export async function getProfile(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      "/profile",
      {
        schema: {
          tags: ["Auth"],
          summary: "Get authenticated user profile",
          security: [{ bearerAuth: [] }],
          response: {
            200: z.object({
              id: z.string().uuid(),
              fullName: z.string().nullable(),
              email: z.string().email(),
              avatarUrl: z.string().url().nullable(),
              ownsCompanies: z.array(
                z.object({
                  id: z.string().uuid(),
                  name: z.string(),
                })
              ),
            }),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId();

        const user = await prisma.user.findUnique({
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
            ownsCompanies: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          where: {
            id: userId,
          },
        });

        if (!user) {
          throw new BadRequestError("User not found");
        }
        return reply.send(user);
      }
    );
}
