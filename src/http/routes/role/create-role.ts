import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import { BadRequestError } from "@/http/routes/_errors";
import { can } from "@/lib/can";
import { prisma } from "@/lib/prisma";
import { auth } from "@/middlewares/auth";

export const routePermissionsCreate = [
  {
    service: "Role",
    permissions: "ALL_ADM",
    describe: "ALL",
    function: "ALL",
  },
  {
    service: "Role",
    permissions: "CREATE_ROLE",
    describe: "Create a role",
    function: "createRole",
  },
];

export const createRole = async (app: FastifyInstance) => {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      "/:slug/roles",
      {
        schema: {
          tags: ["Role"],
          summary: "Create a new custom role",
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
          }),
          body: z.object({
            name: z.string({
              required_error: "Name is required",
            }),
            permissions: z.array(z.string(), {
              required_error: "Permissions are required",
            }),
          }),
          response: {
            201: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { slug } = request.params;
        const { name, permissions } = request.body;

        const { company, role, membership } = await request.getUserMembership(
          slug
        );
        await can(routePermissionsCreate, role.permissions);

        const roleExists = await prisma.role.findFirst({
          where: {
            name,
            companyId: company.id,
          },
        });

        if (roleExists) {
          throw new BadRequestError("Role already exists");
        }

        await prisma.role.create({
          data: {
            name,
            permissions,
            companyId: company.id,
            createdById: membership.userId,
            updatedById: membership.userId,
          },
        });

        reply.status(201).send();
      }
    );
};
