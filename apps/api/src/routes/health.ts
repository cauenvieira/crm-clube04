import type { FastifyInstance } from "fastify";

import { checkPostgres } from "../db/postgres.js";
import { checkRedis } from "../services/redis.js";

type DependencyStatus = "ok" | "error";

export async function registerHealthRoutes(app: FastifyInstance): Promise<void> {
  app.get("/health", async (_request, reply) => {
    const [postgres, redis] = await Promise.allSettled([
      checkPostgres(),
      checkRedis()
    ]);

    const body = {
      api: "ok" as const,
      postgres: statusFromResult(postgres),
      redis: statusFromResult(redis),
      checkedAt: new Date().toISOString()
    };

    const httpStatus = body.postgres === "ok" && body.redis === "ok" ? 200 : 503;
    return reply.code(httpStatus).send(body);
  });
}

function statusFromResult(result: PromiseSettledResult<boolean>): DependencyStatus {
  return result.status === "fulfilled" && result.value ? "ok" : "error";
}
