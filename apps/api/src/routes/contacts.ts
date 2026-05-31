import type { FastifyInstance } from "fastify";

import * as contactService from "../services/contact-service.js";
import { idParamSchema, contactCreateSchema, contactListQuerySchema, contactPatchSchema } from "../validation/contact-schemas.js";
import { validateBody, validateParams, validateQuery } from "../validation/common.js";

export async function registerContactRoutes(app: FastifyInstance): Promise<void> {
  app.post("/api/contacts", async (request, reply) => {
    const input = validateBody(contactCreateSchema, request.body);
    const result = await contactService.createContact(input);
    return reply.code(result.created ? 201 : 200).send(result);
  });

  app.get("/api/contacts", async (request) => {
    const query = validateQuery(contactListQuerySchema, request.query);
    return { data: await contactService.listContacts(query) };
  });

  app.get("/api/contacts/:id", async (request) => {
    const { id } = validateParams(idParamSchema, request.params);
    return { data: await contactService.getContact(id) };
  });

  app.patch("/api/contacts/:id", async (request) => {
    const { id } = validateParams(idParamSchema, request.params);
    const input = validateBody(contactPatchSchema, request.body);
    return { data: await contactService.updateContact(id, input) };
  });
}
