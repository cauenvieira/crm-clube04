import { z } from "zod";

import { dateTimeSchema, paginationQuerySchema, uuidSchema } from "./common.js";

export const providerSchema = z.enum(["waha", "whatsapp", "manual", "outro"]);

export const conversationCreateSchema = z.object({
  contact_id: uuidSchema,
  channel: z.string().trim().min(1).default("whatsapp"),
  provider: providerSchema,
  provider_conversation_id: z.string().optional(),
  status: z.string().default("open"),
  started_at: dateTimeSchema.optional(),
  last_message_at: dateTimeSchema.optional()
});

export const conversationListQuerySchema = paginationQuerySchema.extend({
  contact_id: uuidSchema.optional(),
  provider: providerSchema.optional(),
  status: z.string().optional()
});

export type ConversationCreateInput = z.infer<typeof conversationCreateSchema>;
export type ConversationListQuery = z.infer<typeof conversationListQuerySchema>;
