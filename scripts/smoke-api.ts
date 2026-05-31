import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

type HttpResult = {
  status: number;
  body: unknown;
};

type TestContext = {
  contactId?: string;
  leadId?: string;
  conversationId?: string;
  providerMessageId?: string;
};

loadDotEnv();

const apiBaseUrl = (process.env.API_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const apiSecret = process.env.CRM_API_SECRET?.trim();
const context: TestContext = {};
const results: { name: string; ok: boolean; error?: string }[] = [];

const tests: Array<[string, () => Promise<void>]> = [
  ["GET /health sem header retorna 200", testHealth],
  ["GET /api/contacts sem header respeita protecao", testContactsWithoutHeader],
  ["POST /api/contacts com API key cria ou retorna contato", testCreateContact],
  ["POST /api/leads cria lead ligado ao contato", testCreateLead],
  ["GET /api/leads?status=novo_lead lista o lead criado", testListLeadByStatus],
  ["POST /api/conversations cria conversa", testCreateConversation],
  ["POST /api/messages cria mensagem", testCreateMessage],
  ["POST /api/messages repetido nao duplica", testMessageIdempotency],
  ["GET /api/conversations/:id/messages retorna uma mensagem", testConversationMessages],
  ["POST /api/crm-interactions registra interacao", testCreateCrmInteraction],
  ["GET /api/action-items retorna lista", testActionItems]
];

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});

async function main() {
  for (const [name, test] of tests) {
    try {
      await test();
      results.push({ name, ok: true });
      console.log(`OK - ${name}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      results.push({ name, ok: false, error: message });
      console.error(`ERRO - ${name}`);
      console.error(`  ${message}`);
    }
  }

  const failed = results.filter((result) => !result.ok);
  console.log("");
  console.log(`Resumo: ${results.length - failed.length}/${results.length} testes OK`);

  if (failed.length > 0) {
    process.exitCode = 1;
  }
}

async function testHealth() {
  const response = await request("GET", "/health", { auth: false });
  assertStatus(response, 200);
}

async function testContactsWithoutHeader() {
  const response = await request("GET", "/api/contacts", { auth: false });
  if (apiSecret) {
    assertStatus(response, 401);
  } else {
    assertStatus(response, 200);
  }
}

async function testCreateContact() {
  const stamp = Date.now();
  const response = await request("POST", "/api/contacts", {
    body: {
      name: "Smoke Test Tutor",
      phone: `1198888${stamp}`,
      source: "smoke-test",
      type: "lead"
    }
  });

  assertOneOfStatus(response, [200, 201]);
  const body = asRecord(response.body);
  const contact = asRecord(body.contact);
  context.contactId = asString(contact.id, "contact.id");
}

async function testCreateLead() {
  const response = await request("POST", "/api/leads", {
    body: {
      contact_id: required(context.contactId, "contactId"),
      pet_name: "Smoke",
      service_interest: "banho",
      source: "smoke-test",
      campaign: "smoke-api",
      status: "novo_lead"
    }
  });

  assertStatus(response, 201);
  const data = asRecord(asRecord(response.body).data);
  context.leadId = asString(data.id, "lead.id");
}

async function testListLeadByStatus() {
  const response = await request("GET", "/api/leads?status=novo_lead");
  assertStatus(response, 200);
  const data = asArray(asRecord(response.body).data);
  const found = data.some((item) => asRecord(item).id === context.leadId);
  assert(found, "Lead criado nao apareceu na listagem filtrada por status");
}

async function testCreateConversation() {
  const stamp = Date.now();
  const response = await request("POST", "/api/conversations", {
    body: {
      contact_id: required(context.contactId, "contactId"),
      channel: "whatsapp",
      provider: "manual",
      provider_conversation_id: `smoke-conv-${stamp}`
    }
  });

  assertStatus(response, 201);
  const data = asRecord(asRecord(response.body).data);
  context.conversationId = asString(data.id, "conversation.id");
}

async function testCreateMessage() {
  context.providerMessageId = `smoke-msg-${Date.now()}`;
  const response = await createSmokeMessage();
  assertStatus(response, 201);
  const body = asRecord(response.body);
  assert(body.created === true, "Primeira mensagem deveria retornar created:true");
}

async function testMessageIdempotency() {
  const response = await createSmokeMessage();
  assertStatus(response, 200);
  const body = asRecord(response.body);
  assert(body.created === false, "Mensagem repetida deveria retornar created:false");
}

async function testConversationMessages() {
  const response = await request(
    "GET",
    `/api/conversations/${required(context.conversationId, "conversationId")}/messages`
  );
  assertStatus(response, 200);
  const messages = asArray(asRecord(response.body).data);
  const matching = messages.filter(
    (message) => asRecord(message).provider_message_id === context.providerMessageId
  );
  assert(matching.length === 1, `Esperava 1 mensagem idempotente, encontrou ${matching.length}`);
}

async function testCreateCrmInteraction() {
  const response = await request("POST", "/api/crm-interactions", {
    body: {
      contact_id: required(context.contactId, "contactId"),
      lead_id: required(context.leadId, "leadId"),
      interaction_type: "smoke_test",
      channel: "manual",
      responsible: "smoke",
      result: "ok",
      notes: "Smoke test automatizado",
      next_action_at: new Date(Date.now() + 86_400_000).toISOString(),
      increment_attempts: true
    }
  });

  assertStatus(response, 201);
}

async function testActionItems() {
  const response = await request("GET", "/api/action-items");
  assertStatus(response, 200);
  asArray(asRecord(response.body).data);
}

async function createSmokeMessage() {
  return request("POST", "/api/messages", {
    body: {
      conversation_id: required(context.conversationId, "conversationId"),
      provider: "manual",
      provider_message_id: required(context.providerMessageId, "providerMessageId"),
      direction: "inbound",
      message_type: "text",
      from_number: "11999990001",
      to_number: "1140000000",
      body: "Smoke test mensagem",
      timestamp: new Date().toISOString(),
      raw_payload: { source: "smoke-api" }
    }
  });
}

async function request(
  method: string,
  path: string,
  options: { body?: unknown; auth?: boolean } = {}
): Promise<HttpResult> {
  const headers: Record<string, string> = {};
  const useAuth = options.auth ?? true;

  if (options.body !== undefined) headers["content-type"] = "application/json";
  if (useAuth && apiSecret) headers["x-crm-api-key"] = apiSecret;

  const response = await fetch(`${apiBaseUrl}${path}`, {
    method,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body)
  });

  const text = await response.text();
  const body = text ? JSON.parse(text) : null;
  return { status: response.status, body };
}

function loadDotEnv() {
  const envPath = resolve(process.cwd(), ".env");
  if (!existsSync(envPath)) return;

  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    process.env[key] ??= value;
  }
}

function assertStatus(response: HttpResult, expected: number) {
  assert(response.status === expected, `Esperava HTTP ${expected}, recebeu ${response.status}`);
}

function assertOneOfStatus(response: HttpResult, expected: number[]) {
  assert(expected.includes(response.status), `Esperava HTTP ${expected.join(" ou ")}, recebeu ${response.status}`);
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function required(value: string | undefined, label: string): string {
  assert(value, `${label} nao foi definido por teste anterior`);
  return value;
}

function asRecord(value: unknown): Record<string, unknown> {
  assert(typeof value === "object" && value !== null && !Array.isArray(value), "Resposta JSON nao e objeto");
  return value as Record<string, unknown>;
}

function asArray(value: unknown): unknown[] {
  assert(Array.isArray(value), "Resposta JSON nao e lista");
  return value;
}

function asString(value: unknown, label: string): string {
  assert(typeof value === "string" && value.length > 0, `${label} nao e string valida`);
  return value;
}
