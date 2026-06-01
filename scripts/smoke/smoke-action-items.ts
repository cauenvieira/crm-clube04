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

export async function assertActionItemsLifecycleStatuses(
  params: SmokeActionItemsParams & {
    completedFollowUpLeadIds: string[];
    ignoredFollowUpScheduledId: string;
  }
) {
  const response = await request(
    params.apiBaseUrl,
    params.apiSecret,
    "GET",
    `/api/action-items?type=follow_up_lead&status=concluido&lead_id=${params.leadId}&limit=100`
  );
  assertStatus(response, 200);

  const completedItems = asArray(asRecord(response.body).data);

  for (const actionItemId of params.completedFollowUpLeadIds) {
    const found = completedItems.some((item) => asRecord(item).id === actionItemId);
    assert(found, `Action item concluido esperado nao encontrado: ${actionItemId}`);
  }

  const ignoredResponse = await request(
    params.apiBaseUrl,
    params.apiSecret,
    "GET",
    `/api/action-items?type=follow_up_agendado&status=ignorado&lead_id=${params.leadId}&limit=100`
  );
  assertStatus(ignoredResponse, 200);
  const ignoredItems = asArray(asRecord(ignoredResponse.body).data);

  const ignoredFound = ignoredItems.some(
    (item) => asRecord(item).id === params.ignoredFollowUpScheduledId
  );
  assert(ignoredFound, "Action item cancelado esperado nao encontrado no filtro status=ignorado");
}

export async function completeActionItem(params: SmokeActionItemsParams & { actionItemId: string }) {
  const response = await request(
    params.apiBaseUrl,
    params.apiSecret,
    "POST",
    `/api/action-items/${params.actionItemId}/complete`,
    { body: {} }
  );
  assertStatus(response, 200);

  const item = asRecord(asRecord(response.body).data);
  assert(item.id === params.actionItemId, "Complete retornou action item diferente");
  assert(item.status === "concluido", "Complete deveria retornar status concluido");
  assert(typeof item.completed_at === "string" && item.completed_at.length > 0, "completed_at nao preenchido");
}

export async function completeActionItemIdempotency(
  params: SmokeActionItemsParams & { actionItemId: string }
) {
  const response = await request(
    params.apiBaseUrl,
    params.apiSecret,
    "POST",
    `/api/action-items/${params.actionItemId}/complete`,
    { body: {} }
  );
  assertStatus(response, 200);

  const item = asRecord(asRecord(response.body).data);
  assert(item.status === "concluido", "Complete repetido deveria manter status concluido");
}

export async function createCancelableActionItemForLead(params: SmokeActionItemsParams) {
  await patchLeadForPastNextAction(params.apiBaseUrl, params.apiSecret, params.leadId);

  const response = await request(
    params.apiBaseUrl,
    params.apiSecret,
    "POST",
    "/api/action-items/generate",
    { body: {} }
  );
  assertStatus(response, 200);

  const created = asArray(asRecord(response.body).items).filter((item) => {
    const row = asRecord(item);
    return row.lead_id === params.leadId && row.type === "follow_up_agendado";
  });

  assert(
    created.length === 1,
    `Esperava 1 action_item follow_up_agendado criado para cancelamento, encontrou ${created.length}`
  );

  return { actionItemId: asString(asRecord(created[0]).id, "action_item.id") };
}

export async function cancelActionItem(params: SmokeActionItemsParams & { actionItemId: string }) {
  const response = await request(
    params.apiBaseUrl,
    params.apiSecret,
    "POST",
    `/api/action-items/${params.actionItemId}/cancel`,
    { body: {} }
  );
  assertStatus(response, 200);

  const item = asRecord(asRecord(response.body).data);
  assert(item.id === params.actionItemId, "Cancel retornou action item diferente");
  assert(item.status === "ignorado", "Cancel deveria retornar status ignorado");
}

export async function cancelActionItemIdempotency(params: SmokeActionItemsParams & { actionItemId: string }) {
  const response = await request(
    params.apiBaseUrl,
    params.apiSecret,
    "POST",
    `/api/action-items/${params.actionItemId}/cancel`,
    { body: {} }
  );
  assertStatus(response, 200);

  const item = asRecord(asRecord(response.body).data);
  assert(item.status === "ignorado", "Cancel repetido deveria manter status ignorado");
}

export async function createOpenFollowUpLeadActionItem(params: SmokeActionItemsParams) {
  await patchLeadForAutoClose(params.apiBaseUrl, params.apiSecret, params.leadId);

  const response = await request(
    params.apiBaseUrl,
    params.apiSecret,
    "POST",
    "/api/action-items/generate",
    { body: {} }
  );
  assertStatus(response, 200);

  const created = asArray(asRecord(response.body).items).filter((item) => {
    const row = asRecord(item);
    return row.lead_id === params.leadId && row.type === "follow_up_lead";
  });

  assert(
    created.length === 1,
    `Esperava 1 action_item follow_up_lead aberto para auto fechamento, encontrou ${created.length}`
  );

  return { actionItemId: asString(asRecord(created[0]).id, "action_item.id") };
}

export async function assertActionItemStatus(
  params: SmokeActionItemsParams & { actionItemId: string; expectedStatus: string }
) {
  const response = await request(
    params.apiBaseUrl,
    params.apiSecret,
    "GET",
    `/api/action-items?lead_id=${params.leadId}&limit=100`
  );
  assertStatus(response, 200);

  const items = asArray(asRecord(response.body).data);
  const match = items.find((item) => asRecord(item).id === params.actionItemId);
  assert(match, "Action item esperado nao encontrado na listagem");

  const row = asRecord(match);
  assert(
    row.status === params.expectedStatus,
    `Esperava status ${params.expectedStatus} para action item, recebeu ${String(row.status)}`
  );
}

async function patchLeadForPastNextAction(apiBaseUrl: string, apiSecret: string | undefined, leadId: string) {
  const response = await request(apiBaseUrl, apiSecret, "PATCH", `/api/leads/${leadId}`, {
    body: {
      status: "em_atendimento",
      next_action_at: new Date(Date.now() - 10 * 60 * 1000).toISOString()
    }
  });
  assertStatus(response, 200);
}

async function patchLeadForAutoClose(apiBaseUrl: string, apiSecret: string | undefined, leadId: string) {
  const response = await request(apiBaseUrl, apiSecret, "PATCH", `/api/leads/${leadId}`, {
    body: {
      status: "novo_lead",
      next_action_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    }
  });
  assertStatus(response, 200);
}
