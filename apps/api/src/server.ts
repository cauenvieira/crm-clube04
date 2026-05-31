import Fastify from "fastify";

import { env } from "./config/env.js";
import { closePostgres } from "./db/postgres.js";
import { registerRoutes } from "./routes/index.js";
import { closeRedis } from "./services/redis.js";

const app = Fastify({
  logger: true
});

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
