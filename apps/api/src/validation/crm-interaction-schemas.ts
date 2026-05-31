import { z } from "zod";

import { dateTimeSchema, paginationQuerySchema, uuidSchema } from "./common.js";

export const crmInteractionCreateSchema = z.object({
  contact_id: uuidSchema.optional(),
  lead_id: uuidSchema.optional(),
  customer_id: uuidSchema.optional(),
  pet_id: uuidSchema.optional(),
  interaction_type: z.string().trim().min(1),
  channel: z.string().optional(),
  responsible: z.string().optional(),
  result: z.string().optional(),
  notes: z.string().optional(),
  next_action_at: dateTimeSchema.optional(),
  increment_attempts: z.boolean().default(false)
}).refine((data) => data.contact_id || data.lead_id || data.customer_id || data.pet_id, {
  message: "Informe ao menos um vinculo"
});

export const crmInteractionListQuerySchema = paginationQuerySchema.extend({
  contact_id: uuidSchema.optional(),
  lead_id: uuidSchema.optional(),
  customer_id: uuidSchema.optional(),
  pet_id: uuidSchema.optional()
});

export type CrmInteractionCreateInput = z.infer<typeof crmInteractionCreateSchema>;
export type CrmInteractionListQuery = z.infer<typeof crmInteractionListQuerySchema>;
