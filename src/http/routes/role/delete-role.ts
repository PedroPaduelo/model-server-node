import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import { BadRequestError } from "@/http/routes/_errors";
import { can } from "@/lib/can";
import { prisma } from "@/lib/prisma";
import { auth } from "@/middlewares/auth";

export const routePermissionsDelete = [
  {
    service: "Role",
    permissions: "ALL_ADM",
    describe: "ALL",
    function: "ALL",
  },
  {
    service: "Role",
    permissions: "DELETE_ROLE",
    describe: "Delete a role",
    function: "deleteRole",
  },
];

export async function deleteRole(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .delete(
      "/:slug/role/:id",
      {
        schema: {
          tags: ["Role"],
          summary: "Delete a role",
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
            id: z.string(),
          }),
          response: {
            201: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { slug, id } = request.params;

        const { company, role } = await request.getUserMembership(slug);
        await can(routePermissionsDelete, role.permissions);

        const roleExists = await prisma.role.findUnique({
          where: {
            id,
            companyId: company.id,
          },
        });

        if (!roleExists) {
          throw new BadRequestError("Role not found");
        }

        await prisma.role.update({
          where: {
            id,
            companyId: company.id,
          },
          data: {
            status: "DELETED",
            deletedAt: new Date(),
          },
        });

        return reply.code(201).send();
      }
    );
}
