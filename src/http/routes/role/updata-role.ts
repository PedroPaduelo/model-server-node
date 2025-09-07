import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import { BadRequestError } from "@/http/routes/_errors";
import { can } from "@/lib/can";
import { prisma } from "@/lib/prisma";
import { auth } from "@/middlewares/auth";

export const routePermissionsUpdate = [
  {
    service: "Role",
    permissions: "ALL_ADM",
    describe: "ALL",
    function: "ALL",
  },
  {
    service: "Role",
    permissions: "UPDATE_ROLE",
    describe: "Update a role",
    function: "updateRole",
  },
];

export async function updateRole(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .put(
      "/:slug/role/:id",
      {
        schema: {
          tags: ["Role"],
          summary: "Update a role",
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
            id: z.string(),
          }),
          body: z.object({
            name: z.string(),
            permissions: z.array(z.string()),
          }),
          response: {
            201: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { slug, id } = request.params;
        const { name, permissions } = request.body;

        const { company, role } = await request.getUserMembership(slug);
        await can(routePermissionsUpdate, role.permissions);

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
            name,
            permissions,
          },
        });

        return reply.code(201).send();
      }
    );
}
