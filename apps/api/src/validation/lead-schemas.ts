import { z } from "zod";

import { contactCreateSchema } from "./contact-schemas.js";
import { dateTimeSchema, paginationQuerySchema, uuidSchema } from "./common.js";

export const leadStatusSchema = z.enum([
  "novo_lead",
  "em_atendimento",
  "aguardando_resposta",
  "em_negociacao",
  "agendado",
  "compareceu",
  "nao_compareceu",
  "perdido",
  "desqualificado",
  "reativar_depois"
]);

const leadFieldsSchema = z.object({
  pet_name: z.string().optional(),
  pet_breed: z.string().optional(),
  pet_size: z.string().optional(),
  service_interest: z.string().optional(),
  source: z.string().optional(),
  campaign: z.string().optional(),
  status: leadStatusSchema.default("novo_lead"),
  assigned_to: z.string().optional(),
  first_message_at: dateTimeSchema.optional(),
  last_interaction_at: dateTimeSchema.optional(),
  next_action_at: dateTimeSchema.optional(),
  attempts_count: z.number().int().min(0).optional(),
  qualified: z.boolean().optional(),
  macro_reason: z.string().optional(),
  micro_reason: z.string().optional(),
  loss_reason: z.string().optional(),
  final_conclusion: z.string().optional()
});

export const leadCreateSchema = leadFieldsSchema.extend({
  contact_id: uuidSchema.optional(),
  contact: contactCreateSchema.optional()
}).refine((data) => data.contact_id || data.contact, {
  message: "Informe contact_id ou contact"
});

export const leadPatchSchema = leadFieldsSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  "Informe ao menos um campo para atualizar"
);

export const leadListQuerySchema = paginationQuerySchema.extend({
  status: leadStatusSchema.optional(),
  assigned_to: z.string().optional(),
  next_action_before: dateTimeSchema.optional(),
  source: z.string().optional(),
  campaign: z.string().optional()
});

export type LeadCreateInput = z.infer<typeof leadCreateSchema>;
export type LeadPatchInput = z.infer<typeof leadPatchSchema>;
export type LeadListQuery = z.infer<typeof leadListQuerySchema>;
