import type { FastifyInstance } from "fastify";

import * as leadService from "../services/lead-service.js";
import * as leadOperationalService from "../services/lead-operational-service.js";
import { validateBody, validateParams, validateQuery } from "../validation/common.js";
import { idParamSchema } from "../validation/contact-schemas.js";
import {
  leadCreateSchema,
  leadExportQuerySchema,
  leadListQuerySchema,
  leadPatchSchema,
  leadSearchQuerySchema
} from "../validation/lead-schemas.js";
import {
  leadContactOutcomeCreateSchema,
  leadOperationalParamsSchema
} from "../validation/lead-operational-schemas.js";

export async function registerLeadRoutes(app: FastifyInstance): Promise<void> {
  app.post("/api/leads", async (request, reply) => {
    const input = validateBody(leadCreateSchema, request.body);
    const lead = await leadService.createLead(input);
    return reply.code(201).send({ data: lead });
  });

  app.get("/api/leads/search", async (request) => {
    const query = validateQuery(leadSearchQuerySchema, request.query);
    return await leadService.searchLeads(query);
  });

  app.get("/api/leads/export.csv", async (request, reply) => {
    const query = validateQuery(leadExportQuerySchema, request.query);
    const csv = await leadService.exportLeadsCsv(query);
    const fileDate = new Date().toISOString().slice(0, 10);
    return reply
      .header("content-type", "text/csv; charset=utf-8")
      .header("content-disposition", `attachment; filename="leads-clube04-${fileDate}.csv"`)
      .send(csv);
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

  app.get("/api/leads/:leadId/operational-context", async (request) => {
    const { leadId } = validateParams(leadOperationalParamsSchema, request.params);
    return { data: await leadOperationalService.getLeadOperationalContext(leadId) };
  });

  app.post("/api/leads/:leadId/contact-outcomes", async (request, reply) => {
    const { leadId } = validateParams(leadOperationalParamsSchema, request.params);
    const input = validateBody(leadContactOutcomeCreateSchema, request.body);
    const result = await leadOperationalService.registerLeadContactOutcome(leadId, input);
    return reply.code(201).send({ data: result });
  });
}
