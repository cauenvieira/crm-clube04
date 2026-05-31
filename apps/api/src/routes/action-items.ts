import type { FastifyInstance } from "fastify";

import * as actionItemService from "../services/action-item-service.js";
import { validateQuery } from "../validation/common.js";
import { actionItemListQuerySchema } from "../validation/action-item-schemas.js";

export async function registerActionItemRoutes(app: FastifyInstance): Promise<void> {
  app.get("/api/action-items", async (request) => {
    const query = validateQuery(actionItemListQuerySchema, request.query);
    return { data: await actionItemService.listActionItems(query) };
  });
}
