import Fastify from "fastify";
import { ZodError } from "zod";

import { env } from "./config/env.js";
import { closePostgres } from "./db/postgres.js";
import { registerApiKeyAuth } from "./plugins/api-key-auth.js";
import { registerRoutes } from "./routes/index.js";
import { closeRedis } from "./services/redis.js";
import { ApiError } from "./utils/api-error.js";

const app = Fastify({
  logger: true
});

app.setErrorHandler((error, _request, reply) => {
  if (error instanceof ZodError) {
    return reply.code(400).send({
      error: "validation_error",
      message: "Payload invalido",
      details: error.issues
    });
  }

  if (error instanceof ApiError) {
    return reply.code(error.statusCode).send({
      error: "api_error",
      message: error.message,
      details: error.details
    });
  }

  const httpError = error as { statusCode?: number; message?: string };
  if (httpError.statusCode && httpError.statusCode >= 400 && httpError.statusCode < 500) {
    return reply.code(httpError.statusCode).send({
      error: "request_error",
      message: httpError.message ?? "Requisicao invalida"
    });
  }

  app.log.error(error);
  return reply.code(500).send({
    error: "internal_error",
    message: "Erro interno"
  });
});

await registerApiKeyAuth(app);
await registerRoutes(app);

const close = async () => {
  await app.close();
  await closePostgres();
  await closeRedis();
};

process.on("SIGINT", () => {
  close().finally(() => process.exit(0));
});

process.on("SIGTERM", () => {
  close().finally(() => process.exit(0));
});

await app.listen({
  host: "0.0.0.0",
  port: env.appPort
});
