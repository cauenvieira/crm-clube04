import * as summaryRepository from "../repositories/operational-summary-repository.js";

const operationalTimezone = "America/Sao_Paulo";

export async function getOperationalSummary() {
  const generatedAt = new Date();
  const window = await summaryRepository.getOperationalDayWindow(operationalTimezone);
  const windowStartIso = toIsoOrNull(window?.window_start);
  const windowEndIso = toIsoOrNull(window?.window_end);

  if (!windowStartIso || !windowEndIso) {
    throw new Error("Operational day window nao disponivel");
  }

  const [actionItemsRow, leadsRow, messagesRow] = await Promise.all([
    summaryRepository.getActionItemsSummary(windowStartIso, windowEndIso),
    summaryRepository.getLeadsSummary(),
    summaryRepository.getMessagesSummary(windowStartIso, windowEndIso)
  ]);

  return {
    generatedAt: generatedAt.toISOString(),
    timezone: operationalTimezone,
    businessDate: toStringOrEmpty(window?.business_date),
    window: {
      start: windowStartIso,
      end: windowEndIso
    },
    actionItems: {
      pendente: toInt(actionItemsRow?.pendente),
      emAndamento: toInt(actionItemsRow?.em_andamento),
      concluidoHoje: toInt(actionItemsRow?.concluido_hoje),
      ignoradoHoje: toInt(actionItemsRow?.ignorado_hoje),
      vencidos: toInt(actionItemsRow?.vencidos)
    },
    leads: {
      novoLead: toInt(leadsRow?.novo_lead),
      comFollowUpVencido: toInt(leadsRow?.com_follow_up_vencido),
      semInteracao24h: toInt(leadsRow?.sem_interacao_24h)
    },
    messages: {
      inboundHoje: toInt(messagesRow?.inbound_hoje),
      ultimaInboundEm: toIsoOrNull(messagesRow?.ultima_inbound_em)
    }
  };
}

function toInt(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim()) return Number.parseInt(value, 10);
  return 0;
}

function toStringOrEmpty(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function toIsoOrNull(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "string") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
  }
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString();
  }
  return null;
}
