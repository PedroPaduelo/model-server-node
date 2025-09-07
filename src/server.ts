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

import { createCompany } from "@/http/routes/company";
import { env } from "@/lib/env";
import { listFullCompanies } from "./http/routes/company/list-companies-by-user";
import { createDomain } from "./http/routes/domain/create-domain";
import { createRole } from "./http/routes/role/create-role";
import { deleteRole } from "./http/routes/role/delete-role";
import { getRole } from "./http/routes/role/get-role";
import { listFullRole } from "./http/routes/role/list-full-role";
import { updateRole } from "./http/routes/role/updata-role";
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

app.register(createCompany);
app.register(listFullCompanies);
app.register(createDomain);

app.register(createRole);
app.register(getRole);
app.register(listFullRole);
app.register(updateRole);
app.register(deleteRole);


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
