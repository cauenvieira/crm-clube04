import type { FastifyInstance } from "fastify";

import * as operationalSummaryService from "../services/operational-summary-service.js";

export async function registerOperationalSummaryRoutes(app: FastifyInstance): Promise<void> {
  app.get("/api/operational-summary", async () => {
    return await operationalSummaryService.getOperationalSummary();
  });
}
