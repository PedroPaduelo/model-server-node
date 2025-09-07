import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import { BadRequestError } from "@/http/routes/_errors";
import { prisma } from "@/lib/prisma";
import { auth } from "@/middlewares/auth";
import { RESERVED_SLUGS } from "@/utils/constants";
import { STATUS, TICKET_TYPE_STATUS } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

export const createCompany = async (app: FastifyInstance) => {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      "/company",
      {
        schema: {
          tags: ["Company"],
          summary: "Create a new company",
          security: [{ bearerAuth: [] }],
          body: z.object({
            name: z.string(),
            slug: z.string().min(3),
          }),
          response: {
            201: z.null(),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId();
        const { name, slug } = request.body;

        if (RESERVED_SLUGS.includes(slug)) {
          throw new BadRequestError("Slug is reserved");
        }

        const companiesByUser = await prisma.company.findMany({
          where: {
            ownerId: userId,
          },
        });

        if (companiesByUser.length >= 1) {
          throw new BadRequestError("You can't create more than 1 company");
        }

        const companyWithSameSlug = await prisma.company.findUnique({
          where: {
            slug,
          },
        });

        if (companyWithSameSlug) {
          throw new BadRequestError("Company with same slug already exists");
        }

        const uuidRole = uuidv4();
        await prisma.company.create({
          data: {
            name,
            slug,
            ownerId: userId,
            userUsage: 1,

            role: {
              create: {
                id: uuidRole,
                name: "Administrator",
                permissions: ["ALL_ADM"],
                createdById: userId,
                updatedById: userId,
              },
            },

            members: {
              create: {
                userId,
                roleId: uuidRole,
              },
            },

            consumerTypeDocument: {
              createMany: {
                data: [
                  {
                    name: "CNPJ",
                    createdById: userId,
                    updatedById: userId,
                  },
                  {
                    name: "CPF",
                    createdById: userId,
                    updatedById: userId,
                  },
                  {
                    name: "RG",
                    createdById: userId,
                    updatedById: userId,
                  },
                  {
                    name: "E-MAIL",
                    createdById: userId,
                    updatedById: userId,
                  },
                ],
              },
            },

            ticketServiceForm: {
              createMany: {
                data: [
                  {
                    name: "Atendimento Nível 1",
                    createdById: userId,
                    updatedById: userId,
                  },
                  {
                    name: "Atendimento Nível 2",
                    createdById: userId,
                    updatedById: userId,
                  },
                  {
                    name: "Atendimento Nível 3",
                    createdById: userId,
                    updatedById: userId,
                  },
                ],
              },
            },

            ticketType: {
              createMany: {
                data: [
                  {
                    name: "Dúvida",
                    createdById: userId,
                    updatedById: userId,
                    status: STATUS.ACTIVE,
                  },
                  {
                    name: "Sugestão",
                    createdById: userId,
                    updatedById: userId,
                    status: STATUS.ACTIVE,
                  },
                  {
                    name: "Problema",
                    createdById: userId,
                    updatedById: userId,
                    status: STATUS.ACTIVE,
                  },
                  {
                    name: "Atendimento",
                    createdById: userId,
                    updatedById: userId,
                    status: STATUS.ACTIVE,
                  },
                ],
              },
            },

            ticketStage: {
              createMany: {
                data: [
                  {
                    name: "Bot",
                    createdById: userId,
                    updatedById: userId,
                  },
                  {
                    name: "Aberto",
                    createdById: userId,
                    updatedById: userId,
                  },
                  {
                    name: "Em andamento",
                    createdById: userId,
                    updatedById: userId,
                  },
                  {
                    name: "Fechado",
                    createdById: userId,
                    updatedById: userId,
                  },
                ],
              },
            },

            ticketStatus: {
              createMany: {
                data: [
                  {
                    name: "Aberto",
                    type: TICKET_TYPE_STATUS.NEW,
                    createdById: userId,
                    updatedById: userId,
                  },
                  {
                    name: "Em andamento",
                    type: TICKET_TYPE_STATUS.PENDING,
                    createdById: userId,
                    updatedById: userId,
                  },
                  {
                    name: "Fechado",
                    type: TICKET_TYPE_STATUS.CLOSED,
                    createdById: userId,
                    updatedById: userId,
                  },
                ],
              },
            },
          },
        });

        return reply.status(201).send();
      }
    );
};
