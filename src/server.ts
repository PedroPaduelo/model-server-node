import fastifyCors from "@fastify/cors";
import fastifyJwt from "@fastify/jwt";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUI from "@fastify/swagger-ui";
import { fastify } from "fastify";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";

import { errorHandler } from "@/http/error-handler";
import {
  authenticateWithPassword,
  createAccount,
  getProfile,
  requestPasswordRecover,
  resetPassword,
} from "@/http/routes/auth";


import { env } from "@/lib/env";

import { setupSocketIO } from "./socket";

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setSerializerCompiler(serializerCompiler);
app.setValidatorCompiler(validatorCompiler);

app.setErrorHandler(errorHandler);

app.register(fastifyCors);

app.register(fastifySwagger, {
  openapi: {
    openapi: "3.1.0",
    info: {
      title: "Nommand Desk - API",
      version: "0.0.1",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  transform: jsonSchemaTransform,
});

app.register(fastifySwaggerUI, {
  routePrefix: "/docs",
});

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
});

app.register(createAccount);
app.register(authenticateWithPassword);
app.register(getProfile);
app.register(requestPasswordRecover);
app.register(resetPassword);


app
  .listen({
    port: env.PORT,
    host: "0.0.0.0",
  })
  .then((address) => {
    console.log(`Server is running on port ${address}`);
    setupSocketIO(app);
  })
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
