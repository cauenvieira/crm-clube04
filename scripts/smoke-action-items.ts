import { asArray, asRecord, asString, assert, assertStatus, request } from "./smoke-api-helpers.js";

type SmokeActionItemsParams = {
  apiBaseUrl: string;
  apiSecret: string | undefined;
  leadId: string;
};

export async function generateActionItemsCreate(
  params: SmokeActionItemsParams
): Promise<{ actionItemId: string }> {
  const response = await request(
    params.apiBaseUrl,
    params.apiSecret,
    "POST",
    "/api/action-items/generate",
    { body: {} }
  );

  assertStatus(response, 200);
  const body = asRecord(response.body);

  assert(typeof body.created === "number", "Resposta de generate sem campo created numerico");
  assert(typeof body.skipped === "number", "Resposta de generate sem campo skipped numerico");

  const items = asArray(body.items);
  const generatedForLead = items.filter((item) => {
    const row = asRecord(item);
    return row.lead_id === params.leadId && row.type === "follow_up_lead";
  });

  assert(
    generatedForLead.length === 1,
    `Esperava 1 action_item follow_up_lead criado para o lead novo, encontrou ${generatedForLead.length}`
  );

  const createdItem = asRecord(generatedForLead[0]);
  return { actionItemId: asString(createdItem.id, "action_item.id") };
}

export async function generateActionItemsIdempotency(params: SmokeActionItemsParams): Promise<void> {
  const response = await request(
    params.apiBaseUrl,
    params.apiSecret,
    "POST",
    "/api/action-items/generate",
    { body: {} }
  );
  assertStatus(response, 200);

  const body = asRecord(response.body);
  const items = asArray(body.items);
  const generatedForLead = items.filter((item) => {
    const row = asRecord(item);
    return row.lead_id === params.leadId && row.type === "follow_up_lead";
  });

  assert(
    generatedForLead.length === 0,
    "Chamada repetida de generate nao deveria criar novo follow_up_lead aberto para o mesmo lead"
  );
}

export async function listGeneratedActionItem(params: SmokeActionItemsParams & { actionItemId: string }) {
  const response = await request(
    params.apiBaseUrl,
    params.apiSecret,
    "GET",
    `/api/action-items?type=follow_up_lead&lead_id=${params.leadId}&limit=100`
  );
  assertStatus(response, 200);

  const items = asArray(asRecord(response.body).data);

  assert(
    items.length === 1,
    `Esperava 1 action_item follow_up_lead para o lead de smoke test, encontrou ${items.length}`
  );

  const actionItem = asRecord(items[0]);
  assert(actionItem.id === params.actionItemId, "Action item listado nao bate com o criado");
}
