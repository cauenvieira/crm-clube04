import type { FastifyInstance } from "fastify";

import * as manualLeadService from "../services/manual-lead-service.js";
import { validateBody } from "../validation/common.js";
import { manualLeadCreateSchema } from "../validation/manual-lead-schemas.js";

export async function registerManualLeadRoutes(app: FastifyInstance): Promise<void> {
  app.post("/api/manual-leads", async (request, reply) => {
    const input = validateBody(manualLeadCreateSchema, request.body);
    const data = await manualLeadService.createManualLead(input);
    return reply.code(data.created.lead ? 201 : 200).send({ data });
  });
}
