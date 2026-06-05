import {
  asArray,
  asRecord,
  asString,
  assert,
  assertStatus,
  request
} from "../smoke/smoke-api-helpers.js";
import { buildRunPayloadSource, buildTestNote, buildTestPhone, buildTestTutorName } from "./test-data.js";
import type { TestRunContext } from "./test-run.js";

export type CreatedScenarioLead = {
  contactId: string;
  leadId: string;
  actionItemId: string;
  phone: string;
};

export type LeadOutcomePayload = {
  actionItemId?: string;
  outcome: string;
  channel?: string;
  attendant?: string;
  summary?: string;
  reason?: string;
  nextActionAt?: string;
  scheduledAt?: string;
};

let phoneIndex = 0;

export async function createScenarioManualLead(
  run: TestRunContext,
  suffix: string,
  options?: {
    nextAction?: string;
    nextActionAt?: string;
    entryMethod?: string;
    campaign?: string;
    initialNote?: string;
  }
): Promise<CreatedScenarioLead> {
  phoneIndex += 1;
  const phone = buildTestPhone(run, phoneIndex);
  const nextActionAt = options?.nextActionAt ?? addDays(todayYmd(), 1);
  const response = await request(run.apiBaseUrl, run.apiSecret, "POST", "/api/manual-leads", {
    body: {
      tutorName: buildTestTutorName(run, suffix),
      phone,
      entryMethod: options?.entryMethod ?? buildRunPayloadSource(run),
      attendant: run.attendantMarker,
      entryDate: todayYmd(),
      nextAction: options?.nextAction ?? "fazer_follow_up",
      nextActionAt,
      petName: `Pet ${suffix}`,
      campaign: options?.campaign ?? buildRunPayloadSource(run),
      initialNote: options?.initialNote ?? buildTestNote(run, suffix)
    }
  });
  assertStatus(response, 201);
  const data = asRecord(asRecord(response.body).data);
  return {
    contactId: asString(data.contact_id, "manual.contact_id"),
    leadId: asString(data.lead_id, "manual.lead_id"),
    actionItemId: asString(data.action_item_id, "manual.action_item_id"),
    phone
  };
}

export async function registerLeadOutcome(
  run: TestRunContext,
  leadId: string,
  payload: LeadOutcomePayload
) {
  const response = await request(run.apiBaseUrl, run.apiSecret, "POST", `/api/leads/${leadId}/contact-outcomes`, {
    body: {
      channel: "whatsapp",
      attendant: run.attendantMarker,
      ...payload
    }
  });
  assertStatus(response, 201);
  return asRecord(asRecord(response.body).data);
}

export async function getLead(run: TestRunContext, leadId: string) {
  const response = await request(run.apiBaseUrl, run.apiSecret, "GET", `/api/leads/${leadId}`);
  assertStatus(response, 200);
  return asRecord(asRecord(response.body).data);
}

export async function getLeadOperationalContext(run: TestRunContext, leadId: string) {
  const response = await request(run.apiBaseUrl, run.apiSecret, "GET", `/api/leads/${leadId}/operational-context`);
  assertStatus(response, 200);
  return asRecord(asRecord(response.body).data);
}

export async function listLeadActionItems(run: TestRunContext, leadId: string) {
  const response = await request(run.apiBaseUrl, run.apiSecret, "GET", `/api/action-items?lead_id=${leadId}&limit=100`);
  assertStatus(response, 200);
  return asArray(asRecord(response.body).data).map((item) => asRecord(item));
}

export async function getOperationalWorklist(run: TestRunContext, limit = 50) {
  const response = await request(run.apiBaseUrl, run.apiSecret, "GET", `/api/operational-worklist?limit=${limit}`);
  assertStatus(response, 200);
  return asRecord(response.body);
}

export function findActionItem(
  items: Record<string, unknown>[],
  options: { type?: string; status?: string; id?: string }
) {
  return items.find((item) => {
    if (options.id && item.id !== options.id) return false;
    if (options.type && item.type !== options.type) return false;
    if (options.status && item.status !== options.status) return false;
    return true;
  });
}

export function assertLeadInList(list: unknown, leadId: string, label: string): void {
  const items = asArray(list).map((item) => asRecord(item));
  assert(
    items.some((item) => item.id === leadId || item.lead_id === leadId || item.leadId === leadId),
    `${label} nao contem lead esperado`
  );
}

export function todayYmd() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
}

export function addDays(ymd: string, days: number) {
  const [year, month, day] = ymd.split("-").map((part) => Number.parseInt(part, 10));
  const base = new Date(Date.UTC(year, month - 1, day));
  base.setUTCDate(base.getUTCDate() + days);
  return formatYmd(base);
}

export function ymdToOperationalIso(ymd: string) {
  return `${ymd}T03:00:00.000Z`;
}

function formatYmd(value: Date) {
  const yyyy = value.getUTCFullYear();
  const mm = String(value.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(value.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
