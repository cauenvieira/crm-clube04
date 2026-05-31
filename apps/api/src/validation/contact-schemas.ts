import { z } from "zod";

import { paginationQuerySchema, uuidSchema } from "./common.js";

export const contactTypeSchema = z.enum(["lead", "cliente", "lead_e_cliente", "outro"]);

export const contactCreateSchema = z.object({
  name: z.string().trim().min(1).optional(),
  phone: z.string().trim().min(1).optional(),
  normalized_phone: z.string().trim().min(1).optional(),
  email: z.string().email().optional(),
  source: z.string().trim().min(1).optional(),
  external_customer_id: z.string().trim().min(1).optional(),
  type: contactTypeSchema.default("lead"),
  notes: z.string().optional()
});

export const contactPatchSchema = contactCreateSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  "Informe ao menos um campo para atualizar"
);

export const contactListQuerySchema = paginationQuerySchema.extend({
  normalized_phone: z.string().optional(),
  source: z.string().optional(),
  type: contactTypeSchema.optional()
});

export const idParamSchema = z.object({
  id: uuidSchema
});

export type ContactCreateInput = z.infer<typeof contactCreateSchema>;
export type ContactPatchInput = z.infer<typeof contactPatchSchema>;
export type ContactListQuery = z.infer<typeof contactListQuerySchema>;
