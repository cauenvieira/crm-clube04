import type { FastifyInstance } from "fastify";

import * as actionItemService from "../services/action-item-service.js";
import { validateQuery } from "../validation/common.js";
import { actionItemListQuerySchema } from "../validation/action-item-schemas.js";

export async function registerActionItemRoutes(app: FastifyInstance): Promise<void> {
  app.post("/api/action-items/generate", async (_request) => {
    return await actionItemService.generateActionItems();
  });

  app.get("/api/action-items", async (request) => {
    const query = validateQuery(actionItemListQuerySchema, request.query);
    return { data: await actionItemService.listActionItems(query) };
  });
}
