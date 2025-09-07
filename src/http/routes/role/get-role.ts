import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import { BadRequestError } from "@/http/routes/_errors";
import { can } from "@/lib/can";
import { prisma } from "@/lib/prisma";
import { auth } from "@/middlewares/auth";

export const routePermissionsGet = [
  {
    service: "Role",
    permissions: "ALL_ADM",
    describe: "ALL",
    function: "ALL",
  },
  {
    service: "Role",
    permissions: "GET_ROLE",
    describe: "Get Role details",
    function: "getRole",
  },
];

export async function getRole(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      "/:slug/role/:id",
      {
        schema: {
          tags: ["Role"],
          summary: "Get Role details",
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
            id: z.string(),
          }),
          response: {
            200: z.object({
              role: z.object({
                id: z.string().uuid(),
                name: z.string(),
                status: z.string(),
                permissions: z.array(z.string()),
              }),
            }),
          },
        },
      },
      async (request, reply) => {
        const { slug, id } = request.params;

        const { company, role } = await request.getUserMembership(slug);
        await can(routePermissionsGet, role.permissions);

        const roleExists = await prisma.role.findUnique({
          where: {
            id,
            companyId: company.id,
          },
          select: {
            id: true,
            name: true,
            status: true,
            permissions: true,
          },
        });

        if (!roleExists) {
          throw new BadRequestError("Role not found");
        }

        return reply.send({ role: roleExists });
      }
    );
}
