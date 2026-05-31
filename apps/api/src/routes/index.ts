import type { FastifyInstance } from "fastify";

import { registerActionItemRoutes } from "./action-items.js";
import { registerContactRoutes } from "./contacts.js";
import { registerConversationRoutes } from "./conversations.js";
import { registerCrmInteractionRoutes } from "./crm-interactions.js";
import { registerHealthRoutes } from "./health.js";
import { registerLeadRoutes } from "./leads.js";
import { registerMessageRoutes } from "./messages.js";
import { registerOperationalSummaryRoutes } from "./operational-summary.js";
import { registerWhatsappWebhookRoutes } from "./whatsapp-webhook.js";

export async function registerRoutes(app: FastifyInstance): Promise<void> {
  await registerHealthRoutes(app);
  await registerContactRoutes(app);
  await registerLeadRoutes(app);
  await registerConversationRoutes(app);
  await registerMessageRoutes(app);
  await registerCrmInteractionRoutes(app);
  await registerActionItemRoutes(app);
  await registerOperationalSummaryRoutes(app);
  await registerWhatsappWebhookRoutes(app);
}
