import type { FastifyInstance } from "fastify";

import { fastifyPlugin } from "fastify-plugin";

import { UnauthorizedError } from "@/http/routes/_errors";
import { prisma } from "@/lib/prisma";

export const auth = fastifyPlugin(async (app: FastifyInstance) => {
  app.addHook("preHandler", async (request) => {
    request.getCurrentUserId = async () => {
      try {
        const { sub } = await request.jwtVerify<{ sub: string }>();

        return sub;
      } catch {
        throw new UnauthorizedError("Invalid token");
      }
    };

    request.getUserMembership = async (slug: string) => {
      const userId = await request.getCurrentUserId();

      const member = await prisma.member.findFirst({
        where: {
          userId,
          company: {
            slug,
          },
        },
        include: {
          company: true,
          role: true,
        },
        
      });

      if (!member) {
        throw new UnauthorizedError(`You're not a member of this company.`);
      }

      const { company, role, ...membership } = member;
      return {
        company,
        role,
        membership,
      };
    };
  });
});
