import type { FastifyInstance } from "fastify";

import { BadRequestError, UnauthorizedError } from "@/http/routes/_errors";
import { hasZodFastifySchemaValidationErrors } from "fastify-type-provider-zod";
import { ZodError, z } from "zod";
import { generateErrorMessage } from "zod-error";

type FastifyErrorHandler = FastifyInstance["errorHandler"];

const ErrorSchema = z.object({
  error: z.object({
    code: z.enum(["unprocessable_entity"]),
    message: z.string({
      description: "A human readable error message.",
    }),
  }),
});

export type ErrorResponse = z.infer<typeof ErrorSchema>;

export function fromZodError(error: ZodError): ErrorResponse {
  return {
    error: {
      code: "unprocessable_entity",
      message: generateErrorMessage(error.issues, {
        maxErrors: 1,
        delimiter: {
          component: ": ",
        },
        path: {
          enabled: true,
          type: "objectNotation",
          label: "",
        },
        code: {
          enabled: true,
          label: "",
        },
        message: {
          enabled: true,
          label: "",
        },
      }),
    },
  };
}

export const errorHandler: FastifyErrorHandler = (error, request, reply) => {
  if (hasZodFastifySchemaValidationErrors(error)) {
    reply.status(400).send({
      message: "Validation error",
      errors: error.validation.map((error) => ({
        message: error.message,
        path: error.params.issue.path.join(", "),
      })),
    });
  }

  if (error instanceof ZodError) {
    console.log(JSON.stringify(error, null, 2));
    reply.status(422).send(fromZodError(error));
  }

  if (error instanceof BadRequestError) {
    console.log(JSON.stringify(error, null, 2));
    reply.status(400).send({
      message: error.message,
    });
  }

  if (error instanceof UnauthorizedError) {
    console.log(JSON.stringify(error, null, 2));
    reply.status(401).send({
      message: error.message,
    });
  }

  console.log(JSON.stringify(error, null, 2));

  // send error to some observability platform

  reply.status(500).send({ message: "Internal server error" });
};
