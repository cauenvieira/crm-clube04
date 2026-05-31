import { z } from "zod";

import { paginationQuerySchema } from "./common.js";

export const actionItemStatusSchema = z.enum([
  "pendente",
  "em_andamento",
  "concluido",
  "ignorado",
  "reagendado"
]);

export const actionItemListQuerySchema = paginationQuerySchema.extend({
  status: actionItemStatusSchema.optional(),
  type: z.string().optional()
});

export type ActionItemListQuery = z.infer<typeof actionItemListQuerySchema>;
