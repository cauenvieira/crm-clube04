export class FrontendApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number
  ) {
    super(message);
  }
}

export type OperationalSummary = {
  generatedAt: string;
  timezone: string;
  businessDate: string;
  window?: { start: string; end: string };
  actionItems: {
    pendente: number;
    emAndamento: number;
    concluidoHoje: number;
    ignoradoHoje: number;
    vencidos: number;
  };
  leads: {
    novoLead: number;
    comFollowUpVencido: number;
    semInteracao24h: number;
  };
  messages: {
    inboundHoje: number;
    ultimaInboundEm: string | null;
  };
};

export type WorklistActionItem = {
  id: string;
  type: string;
  status: string;
  title: string;
  priority: number;
  dueAt: string | null;
  leadId: string | null;
  contactId: string | null;
  contactName: string | null;
  normalizedPhone: string | null;
  leadStatus: string | null;
  leadSource: string | null;
  leadCampaign: string | null;
  reason: string | null;
  createdAt: string | null;
};

export type OperationalWorklist = {
  generatedAt: string;
  timezone: string;
  businessDate: string;
  limit: number;
  actionItems: {
    pendentes: WorklistActionItem[];
    vencidos: WorklistActionItem[];
    retomarAtendimento: WorklistActionItem[];
    followUpsAgendados: WorklistActionItem[];
    revisaoLideranca: WorklistActionItem[];
    novosLeads: WorklistActionItem[];
  };
  leads: {
    followUpVencido: unknown[];
    semInteracao24h: unknown[];
  };
  messages: {
    ultimasInbound: Array<{
      id: string;
      body: string | null;
      createdAt: string | null;
      provider: string;
      providerMessageId: string | null;
      contactName: string | null;
      normalizedPhone: string | null;
    }>;
  };
};

export type ManualLeadPayload = {
  tutorName: string;
  phone: string;
  entryMethod: string;
  attendant: string;
  nextAction: string;
  nextActionAt: string;
  petName?: string;
  breed?: string;
  estimatedWeight?: string;
  serviceInterest?: string;
  initialNote?: string;
};

export type ManualLeadResponse = {
  contact_id: string;
  lead_id: string;
  action_item_id: string;
  created: {
    contact: boolean;
    lead: boolean;
    action_item: boolean;
    interaction: boolean;
  };
  linked: {
    existing_contact: boolean;
    existing_active_lead: boolean;
    existing_action_item: boolean;
  };
  duplicate: {
    active_lead: boolean;
  };
  message: string;
};

type SearchLeadItem = {
  contact: {
    id: string;
    name: string | null;
    phone: string | null;
    normalized_phone: string | null;
    source: string | null;
  };
  active_lead: {
    id: string;
    status: string;
    source: string | null;
    campaign: string | null;
    assigned_to: string | null;
    next_action_at: string | null;
  } | null;
  open_action_items: Array<{
    id: string;
    type: string;
    status: string;
    title: string;
    due_at: string | null;
  }>;
};

export async function getOperationalSummary(apiKey: string) {
  return await requestJson<OperationalSummary>("/api/operational-summary", { apiKey });
}

export async function getOperationalWorklist(apiKey: string, limit: number) {
  return await requestJson<OperationalWorklist>(`/api/operational-worklist?limit=${limit}`, { apiKey });
}

export async function completeActionItem(apiKey: string, actionItemId: string) {
  await requestJson(`/api/action-items/${actionItemId}/complete`, {
    method: "POST",
    apiKey,
    body: {}
  });
}

export async function ignoreActionItem(apiKey: string, actionItemId: string) {
  await requestJson(`/api/action-items/${actionItemId}/cancel`, {
    method: "POST",
    apiKey,
    body: {}
  });
}

export async function createManualLead(apiKey: string, payload: ManualLeadPayload) {
  const response = await requestJson<{ data: ManualLeadResponse }>("/api/manual-leads", {
    method: "POST",
    apiKey,
    body: payload
  });
  return response.data;
}

export async function searchLeads(apiKey: string, input: { phone?: string; q?: string; limit?: number }) {
  const search = new URLSearchParams();
  if (input.phone) search.set("phone", input.phone);
  if (input.q) search.set("q", input.q);
  if (input.limit) search.set("limit", String(input.limit));
  const response = await requestJson<{ data: SearchLeadItem[] }>(`/api/leads/search?${search.toString()}`, {
    apiKey
  });
  return response.data;
}

async function requestJson<T = unknown>(
  path: string,
  options: {
    method?: "GET" | "POST" | "PATCH";
    apiKey: string;
    body?: unknown;
  }
): Promise<T> {
  const headers: Record<string, string> = {
    "x-crm-api-key": options.apiKey
  };
  if (options.body !== undefined) headers["content-type"] = "application/json";

  const response = await fetch(path, {
    method: options.method ?? "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body)
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : {};

  if (!response.ok) {
    const message = typeof payload?.message === "string" ? payload.message : `Erro HTTP ${response.status}`;
    throw new FrontendApiError(message, response.status);
  }

  return payload as T;
}
