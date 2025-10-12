import { hash } from "bcryptjs";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import { BadRequestError } from "@/http/routes/_errors";
import { prisma } from "@/lib/prisma";
import { EMAILS_BLACKLIST } from "@/utils/constants";

export const createAccount = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/users",
    {
      schema: {
        tags: ["Auth"],
        summary: "Create a new account",
        body: z.object({
          name: z.string(),
          email: z.string().email(),
          password: z.string().min(6),
        }),
        response: {
          201: z.null(),
        },
      },
    },
    async (request, reply) => {
      const { name, email, password } = request.body;

      if (EMAILS_BLACKLIST.includes(email)) {
        throw new BadRequestError("Unable to complete registration");
      }

      const userWithSameEmail = await prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (userWithSameEmail) {
        throw new BadRequestError("User with same email already exists");
      }

      const passwordHash = await hash(password, 6);
      const [firstName, ...restName] = name.split(" ");
      const lastName = restName.join(" ");

      await prisma.user.create({
        data: {
          fullName: name,
          firstName,
          lastName,
          email,
          password: passwordHash,
        },
      });

      return reply.status(201).send();
    }
  );
};
