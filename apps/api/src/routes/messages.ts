import type { FastifyInstance } from "fastify";

import * as messageService from "../services/message-service.js";
import { validateBody, validateQuery } from "../validation/common.js";
import { messageCreateSchema, messageListQuerySchema } from "../validation/message-schemas.js";

export async function registerMessageRoutes(app: FastifyInstance): Promise<void> {
  app.post("/api/messages", async (request, reply) => {
    const input = validateBody(messageCreateSchema, request.body);
    const result = await messageService.createMessage(input);
    return reply.code(result.created ? 201 : 200).send(result);
  });

  app.get("/api/messages", async (request) => {
    const query = validateQuery(messageListQuerySchema, request.query);
    return { data: await messageService.listMessages(query) };
  });
}
