import { z } from "zod";

import { uuidSchema } from "./common.js";

const canonicalLeadContactOutcomeValues = [
  "continuar_atendimento",
  "agendamento_realizado",
  "sem_resposta",
  "cliente_convertido",
  "enviar_analise_lideranca",
  "perdido",
  "desqualificado",
  "nutricao_campanha"
] as const;

const legacyOutcomeAliases = {
  nao_respondeu: "sem_resposta",
  chamar_depois: "continuar_atendimento",
  agendou: "agendamento_realizado",
  sem_interesse: "perdido",
  dados_invalidos: "desqualificado",
  escalar_lideranca: "enviar_analise_lideranca",
  virou_cliente: "cliente_convertido",
  enviar_nutricao: "nutricao_campanha"
} as const;

const leadContactOutcomeInputValues = [
  ...canonicalLeadContactOutcomeValues,
  ...Object.keys(legacyOutcomeAliases)
] as [string, ...string[]];

export const leadContactOutcomeSchema = z.enum(canonicalLeadContactOutcomeValues);

const leadContactOutcomeInputSchema = z.enum(leadContactOutcomeInputValues).transform<LeadContactOutcome>((outcome) => {
  return ((legacyOutcomeAliases as Record<string, LeadContactOutcome>)[outcome] ?? outcome) as LeadContactOutcome;
});

export const leadContactChannelSchema = z.enum([
  "whatsapp",
  "telefone",
  "presencial",
  "outro"
]);

export const leadLossReasonSchema = z.enum([
  "preco",
  "localizacao",
  "sem_taxi_dog",
  "ja_resolveu",
  "nao_tem_interesse",
  "outro"
]);

const ymdSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use formato YYYY-MM-DD");

export const leadOperationalParamsSchema = z.object({
  leadId: uuidSchema
});

export const leadContactOutcomeCreateSchema = z
  .object({
    actionItemId: uuidSchema.optional(),
    outcome: leadContactOutcomeInputSchema,
    channel: leadContactChannelSchema.default("whatsapp"),
    attendant: z.string().trim().min(1).max(120).optional(),
    summary: z.string().trim().min(1).max(2000).optional(),
    reason: z.string().trim().min(1).max(120).optional(),
    nextActionAt: ymdSchema.optional(),
    scheduledAt: ymdSchema.optional(),
    messageTemplateId: z.string().trim().min(1).max(120).optional(),
    renderedMessage: z.string().trim().min(1).max(4000).optional()
  })
  .superRefine((input, ctx) => {
    if (
      input.outcome === "continuar_atendimento" && !input.nextActionAt
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["nextActionAt"],
        message: "nextActionAt e obrigatorio para este outcome"
      });
    }

    if (input.outcome === "agendamento_realizado" && !input.scheduledAt && !input.summary) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["summary"],
        message: "Informe scheduledAt ou summary para agendamento_realizado"
      });
    }

    if (input.outcome === "cliente_convertido" && !input.summary) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["summary"],
        message: "summary e obrigatorio para cliente_convertido"
      });
    }

    if (
      (
        input.outcome === "desqualificado" ||
        input.outcome === "enviar_analise_lideranca" ||
        input.outcome === "nutricao_campanha"
      ) &&
      !input.reason &&
      !input.summary
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["reason"],
        message: "reason ou summary e obrigatorio para este outcome"
      });
    }

    if (input.outcome === "perdido" && !input.reason) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["reason"],
        message: "reason e obrigatorio para perdido"
      });
    }

    if (input.outcome === "perdido" && input.reason) {
      const parsed = leadLossReasonSchema.safeParse(input.reason);
      if (!parsed.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["reason"],
          message:
            "reason invalido para perdido. Use: preco, localizacao, sem_taxi_dog, ja_resolveu, nao_tem_interesse ou outro"
        });
      }
    }
  });

export type LeadContactOutcome = z.infer<typeof leadContactOutcomeSchema>;
export type LeadContactChannel = z.infer<typeof leadContactChannelSchema>;
export type LeadLossReason = z.infer<typeof leadLossReasonSchema>;
export type LeadOperationalParams = z.infer<typeof leadOperationalParamsSchema>;
export type LeadContactOutcomeCreateInput = z.infer<typeof leadContactOutcomeCreateSchema>;
