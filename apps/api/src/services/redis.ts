import { Redis } from "ioredis";

import { env } from "../config/env.js";

export const redis = new Redis({
  host: env.redis.host,
  port: env.redis.port,
  lazyConnect: true,
  maxRetriesPerRequest: 1
});

export async function checkRedis(): Promise<boolean> {
  if (redis.status === "wait") {
    await redis.connect();
  }

  const response = await redis.ping();
  return response === "PONG";
}

export async function closeRedis(): Promise<void> {
  redis.disconnect();
}
