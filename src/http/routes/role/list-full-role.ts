import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import { BadRequestError } from "@/http/routes/_errors";
import { can } from "@/lib/can";
import { prisma } from "@/lib/prisma";
import { auth } from "@/middlewares/auth";

export const routePermissionsListFull = [
  {
    service: "Role",
    permissions: "ALL_ADM",
    describe: "ALL",
    function: "ALL",
  },
  {
    service: "Role",
    permissions: "LIST_FULL_ROLE",
    describe: "List all roles",
    function: "listFullRole",
  },
];

export async function listFullRole(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      "/:slug/roles",
      {
        schema: {
          tags: ["Role"],
          summary: "List full Roles of a company",
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
          }),
          response: {
            200: z.object({
              roles: z.array(
                z.object({
                  id: z.string().uuid(),
                  name: z.string(),
                  status: z.string(),
                  permissions: z.array(z.string()),
                })
              ),
            }),
          },
        },
      },
      async (request, reply) => {
        const { slug } = request.params;

        const { company, role } = await request.getUserMembership(slug);
        await can(routePermissionsListFull, role.permissions);

        const roles = await prisma.role.findMany({
          where: {
            companyId: company.id,
          },
          select: {
            id: true,
            name: true,
            status: true,
            permissions: true,
          },
        });

        if (!roles) {
          throw new BadRequestError("Roles not found");
        }

        return reply.send({ roles });
      }
    );
}
