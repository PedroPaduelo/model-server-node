import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import { BadRequestError } from "@/http/routes/_errors";
import { prisma } from "@/lib/prisma";
import { auth } from "@/middlewares/auth";
import { DOMAINS_BLACKLIST } from "@/utils/constants";

const domainRegex =
  /^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:[a-z0-9-]*[a-z0-9])$/i;

export const createDomain = async (app: FastifyInstance) => {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      "/company/:slug/domain",
      {
        schema: {
          tags: ["Company"],
          summary: "Create a new domain for a company",
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
          }),
          body: z.object({
            domain: z.string().regex(domainRegex, {
              message: "Invalid domain",
            }),
            onlyEmail: z.boolean().optional().default(false),
          }),
          response: {
            201: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { slug } = request.params;
        const { domain, onlyEmail } = request.body;

        if (DOMAINS_BLACKLIST.includes(domain)) {
          throw new BadRequestError("Unable to complete registration");
        }

        const { company, role } = await request.getUserMembership(slug);

        if (!role.permissions.includes("ALL_ADM")) {
          throw new BadRequestError("You're not allowed to create a domain");
        }

        if (company.domainsUsage >= company.domainsLimit) {
          throw new BadRequestError("You've reached the limit of domains");
        }

        const domainExists = await prisma.customDomain.findFirst({
          where: {
            domain,
          },
        });

        if (domainExists) {
          throw new BadRequestError("Domain already exists");
        }

        await prisma.customDomain.create({
          data: {
            domain,
            companyId: company.id,
            onlyEmail,
            primary: company.domainsUsage === 0,
          },
        });

        await prisma.company.update({
          where: {
            id: company.id,
          },
          data: {
            domainsUsage: {
              increment: 1,
            },
          },
        });

        reply.status(201).send();
      }
    );
};
