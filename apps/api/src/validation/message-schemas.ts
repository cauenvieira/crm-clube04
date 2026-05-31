import { z } from "zod";

import { dateTimeSchema, paginationQuerySchema, uuidSchema } from "./common.js";
import { providerSchema } from "./conversation-schemas.js";

export const messageDirectionSchema = z.enum(["inbound", "outbound", "system"]);

export const messageCreateSchema = z.object({
  conversation_id: uuidSchema,
  provider: providerSchema.optional(),
  provider_message_id: z.string().optional(),
  direction: messageDirectionSchema,
  message_type: z.string().default("text"),
  from_number: z.string().optional(),
  to_number: z.string().optional(),
  body: z.string().optional(),
  media_url: z.string().url().optional(),
  timestamp: dateTimeSchema.default(() => new Date().toISOString()),
  raw_payload: z.unknown().optional()
});

export const messageListQuerySchema = paginationQuerySchema.extend({
  contact_id: uuidSchema.optional(),
  conversation_id: uuidSchema.optional(),
  provider: providerSchema.optional()
});

export type MessageCreateInput = z.infer<typeof messageCreateSchema>;
export type MessageListQuery = z.infer<typeof messageListQuerySchema>;
