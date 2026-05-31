import type { FastifyInstance } from "fastify";

import * as actionItemService from "../services/action-item-service.js";
import { validateParams, validateQuery } from "../validation/common.js";
import { idParamSchema } from "../validation/contact-schemas.js";
import { actionItemListQuerySchema } from "../validation/action-item-schemas.js";

export async function registerActionItemRoutes(app: FastifyInstance): Promise<void> {
  app.post("/api/action-items/generate", async (_request) => {
    return await actionItemService.generateActionItems();
  });

  app.get("/api/action-items", async (request) => {
    const query = validateQuery(actionItemListQuerySchema, request.query);
    return { data: await actionItemService.listActionItems(query) };
  });

  app.post("/api/action-items/:id/complete", async (request) => {
    const { id } = validateParams(idParamSchema, request.params);
    return { data: await actionItemService.completeActionItem(id) };
  });

  app.post("/api/action-items/:id/cancel", async (request) => {
    const { id } = validateParams(idParamSchema, request.params);
    return { data: await actionItemService.cancelActionItem(id) };
  });
}
