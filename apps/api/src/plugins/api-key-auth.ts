import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import { env } from "../config/env.js";

const protectedPrefix = "/api/";

export async function registerApiKeyAuth(app: FastifyInstance): Promise<void> {
  app.addHook("onRequest", async (request, reply) => {
    if (!shouldProtect(request)) return;
    if (!env.crmApiSecret) return;

    const apiKey = getHeaderValue(request.headers["x-crm-api-key"]);

    if (apiKey !== env.crmApiSecret) {
      return unauthorized(reply);
    }
  });
}

function shouldProtect(request: FastifyRequest): boolean {
  return request.url === "/api" || request.url.startsWith(protectedPrefix);
}

function getHeaderValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function unauthorized(reply: FastifyReply) {
  return reply.code(401).send({
    error: "unauthorized",
    message: "API key ausente ou invalida"
  });
}
