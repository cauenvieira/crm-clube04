import type { FastifyInstance } from "fastify";

import * as whatsappWebhookService from "../services/whatsapp-webhook-service.js";
import { validateBody } from "../validation/common.js";
import { whatsappInboundSchema } from "../validation/whatsapp-webhook-schemas.js";

export async function registerWhatsappWebhookRoutes(app: FastifyInstance): Promise<void> {
  app.post("/api/webhooks/whatsapp/inbound", async (request, reply) => {
    const input = validateBody(whatsappInboundSchema, request.body);
    const result = await whatsappWebhookService.processWhatsappInbound(input);
    return reply.code(result.created.message ? 201 : 200).send({ data: result });
  });
}
