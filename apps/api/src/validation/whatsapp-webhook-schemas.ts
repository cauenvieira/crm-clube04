import { z } from "zod";

import { dateTimeSchema } from "./common.js";
import { providerSchema } from "./conversation-schemas.js";
import { messageDirectionSchema } from "./message-schemas.js";

export const whatsappInboundSchema = z.object({
  provider: providerSchema,
  providerMessageId: z.string().trim().min(1),
  providerConversationId: z.string().trim().min(1),
  fromNumber: z.string().trim().min(1),
  toNumber: z.string().trim().min(1),
  contactName: z.string().trim().min(1).optional(),
  body: z.string().optional(),
  messageType: z.string().default("text"),
  direction: messageDirectionSchema.default("inbound"),
  timestamp: dateTimeSchema,
  source: z.string().default("whatsapp"),
  campaign: z.string().optional(),
  rawPayload: z.unknown().optional()
});

export type WhatsappInboundInput = z.infer<typeof whatsappInboundSchema>;
