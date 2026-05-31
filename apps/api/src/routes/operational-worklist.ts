import type { FastifyInstance } from "fastify";

import * as worklistService from "../services/operational-worklist-service.js";
import { validateQuery } from "../validation/common.js";
import { operationalWorklistQuerySchema } from "../validation/operational-worklist-schemas.js";

export async function registerOperationalWorklistRoutes(app: FastifyInstance): Promise<void> {
  app.get("/api/operational-worklist", async (request) => {
    const query = validateQuery(operationalWorklistQuerySchema, request.query);
    return await worklistService.getOperationalWorklist(query.limit);
  });
}
