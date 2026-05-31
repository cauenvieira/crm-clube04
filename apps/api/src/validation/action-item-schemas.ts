import { z } from "zod";

import { paginationQuerySchema, uuidSchema } from "./common.js";

export const actionItemStatusSchema = z.enum([
  "pendente",
  "em_andamento",
  "concluido",
  "ignorado",
  "reagendado"
]);

export const actionItemListQuerySchema = paginationQuerySchema.extend({
  status: actionItemStatusSchema.optional(),
  priority: z.coerce.number().int().optional(),
  type: z.string().optional(),
  lead_id: uuidSchema.optional()
});

export type ActionItemStatus = z.infer<typeof actionItemStatusSchema>;
export type ActionItemListQuery = z.infer<typeof actionItemListQuerySchema>;
