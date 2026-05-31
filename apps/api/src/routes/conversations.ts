import type { FastifyInstance } from "fastify";

import * as conversationService from "../services/conversation-service.js";
import * as messageService from "../services/message-service.js";
import { validateBody, validateParams, validateQuery, paginationQuerySchema } from "../validation/common.js";
import { idParamSchema } from "../validation/contact-schemas.js";
import { conversationCreateSchema, conversationListQuerySchema } from "../validation/conversation-schemas.js";

export async function registerConversationRoutes(app: FastifyInstance): Promise<void> {
  app.post("/api/conversations", async (request, reply) => {
    const input = validateBody(conversationCreateSchema, request.body);
    const conversation = await conversationService.createConversation(input);
    return reply.code(201).send({ data: conversation });
  });

  app.get("/api/conversations", async (request) => {
    const query = validateQuery(conversationListQuerySchema, request.query);
    return { data: await conversationService.listConversations(query) };
  });

  app.get("/api/conversations/:id", async (request) => {
    const { id } = validateParams(idParamSchema, request.params);
    return { data: await conversationService.getConversation(id) };
  });

  app.get("/api/conversations/:id/messages", async (request) => {
    const { id } = validateParams(idParamSchema, request.params);
    const query = validateQuery(paginationQuerySchema, request.query);
    return {
      data: await messageService.listConversationMessages(id, query.limit, query.offset)
    };
  });
}
