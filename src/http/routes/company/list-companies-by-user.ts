import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { auth } from "@/middlewares/auth";

export async function listFullCompanies(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      "/companies",
      {
        schema: {
          tags: ["Company"],
          summary: "List full companies",
          security: [{ bearerAuth: [] }],
          response: {
            200: z.object({
              companies: z.array(
                z.object({
                  id: z.string(),
                  name: z.string(),
                  slug: z.string(),
                })
              ),
            }),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId();
        const companies = await prisma.company.findMany({
          where: {
            ownerId: userId,
          },
          select: {
            id: true,
            name: true,
            slug: true,
          },
        });

        return reply.send({ companies });
      }
    );
}
