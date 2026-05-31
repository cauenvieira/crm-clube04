import type { FastifyInstance } from "fastify";

import * as crmInteractionService from "../services/crm-interaction-service.js";
import { validateBody, validateQuery } from "../validation/common.js";
import { crmInteractionCreateSchema, crmInteractionListQuerySchema } from "../validation/crm-interaction-schemas.js";

export async function registerCrmInteractionRoutes(app: FastifyInstance): Promise<void> {
  app.post("/api/crm-interactions", async (request, reply) => {
    const input = validateBody(crmInteractionCreateSchema, request.body);
    const interaction = await crmInteractionService.createCrmInteraction(input);
    return reply.code(201).send({ data: interaction });
  });

  app.get("/api/crm-interactions", async (request) => {
    const query = validateQuery(crmInteractionListQuerySchema, request.query);
    return { data: await crmInteractionService.listCrmInteractions(query) };
  });
}
