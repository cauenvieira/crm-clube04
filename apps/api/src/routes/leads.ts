import type { FastifyInstance } from "fastify";

import * as leadService from "../services/lead-service.js";
import * as manualLeadService from "../services/manual-lead-service.js";
import { validateBody, validateParams, validateQuery } from "../validation/common.js";
import { idParamSchema } from "../validation/contact-schemas.js";
import {
  leadCreateSchema,
  leadListQuerySchema,
  leadPatchSchema,
  leadSearchQuerySchema
} from "../validation/lead-schemas.js";

export async function registerLeadRoutes(app: FastifyInstance): Promise<void> {
  app.post("/api/leads", async (request, reply) => {
    const input = validateBody(leadCreateSchema, request.body);
    const lead = await leadService.createLead(input);
    return reply.code(201).send({ data: lead });
  });

  app.get("/api/leads/search", async (request) => {
    const query = validateQuery(leadSearchQuerySchema, request.query);
    return await manualLeadService.searchLeads(query);
  });

  app.get("/api/leads", async (request) => {
    const query = validateQuery(leadListQuerySchema, request.query);
    return { data: await leadService.listLeads(query) };
  });

  app.get("/api/leads/:id", async (request) => {
    const { id } = validateParams(idParamSchema, request.params);
    return { data: await leadService.getLead(id) };
  });

  app.patch("/api/leads/:id", async (request) => {
    const { id } = validateParams(idParamSchema, request.params);
    const input = validateBody(leadPatchSchema, request.body);
    return { data: await leadService.updateLead(id, input) };
  });
}
