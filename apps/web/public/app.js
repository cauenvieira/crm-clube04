const STORAGE_KEY = "crm_api_key";
const defaultLimit = 10;
const maxLimit = 50;

const apiKeyInput = document.getElementById("api-key");
const limitInput = document.getElementById("limit");
const updateButton = document.getElementById("btn-update");
const clearKeyButton = document.getElementById("btn-clear-key");
const loadingElement = document.getElementById("loading");
const errorElement = document.getElementById("error");

const metaBusinessDate = document.getElementById("meta-business-date");
const metaTimezone = document.getElementById("meta-timezone");
const metaGeneratedAt = document.getElementById("meta-generated-at");
const summaryCards = document.getElementById("summary-cards");

const listActionPending = document.getElementById("list-action-pending");
const listActionOverdue = document.getElementById("list-action-overdue");
const listLeadsOverdue = document.getElementById("list-leads-overdue");
const listLeadsNoInteraction = document.getElementById("list-leads-no-interaction");
const listMessagesInbound = document.getElementById("list-messages-inbound");

bootstrap();

function bootstrap() {
  const savedKey = localStorage.getItem(STORAGE_KEY) ?? "";
  apiKeyInput.value = savedKey;
  limitInput.value = String(defaultLimit);

  updateButton.addEventListener("click", () => refreshDashboard());
  clearKeyButton.addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEY);
    apiKeyInput.value = "";
    showError("API key removida do navegador local.");
  });

  apiKeyInput.addEventListener("change", () => {
    const key = apiKeyInput.value.trim();
    if (key) localStorage.setItem(STORAGE_KEY, key);
  });

  refreshDashboard();
}

async function refreshDashboard() {
  const apiKey = apiKeyInput.value.trim();
  const limit = parseLimit(limitInput.value);

  clearError();
  setLoading(true);

  try {
    if (!apiKey) {
      throw new Error("Informe a API key para carregar o painel.");
    }

    localStorage.setItem(STORAGE_KEY, apiKey);

    const [summary, worklist] = await Promise.all([
      fetchJson("/api/operational-summary", apiKey),
      fetchJson(`/api/operational-worklist?limit=${limit}`, apiKey)
    ]);

    renderSummary(summary);
    renderWorklist(worklist);
  } catch (error) {
    showError(error instanceof Error ? error.message : "Erro ao carregar dados.");
  } finally {
    setLoading(false);
  }
}

function parseLimit(value) {
  const numeric = Number.parseInt(value, 10);
  if (Number.isNaN(numeric) || numeric < 1) return defaultLimit;
  if (numeric > maxLimit) return maxLimit;
  return numeric;
}

async function fetchJson(path, apiKey) {
  const response = await fetch(path, {
    headers: {
      "x-crm-api-key": apiKey
    }
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = body?.message ? String(body.message) : `Falha HTTP ${response.status}`;
    throw new Error(message);
  }
  return body;
}

function renderSummary(summary) {
  metaBusinessDate.textContent = summary.businessDate ?? "-";
  metaTimezone.textContent = summary.timezone ?? "-";
  metaGeneratedAt.textContent = summary.generatedAt ?? "-";

  const metrics = [
    ["Action items pendentes", summary?.actionItems?.pendente],
    ["Action items vencidos", summary?.actionItems?.vencidos],
    ["Concluidos hoje", summary?.actionItems?.concluidoHoje],
    ["Ignorados hoje", summary?.actionItems?.ignoradoHoje],
    ["Novos leads", summary?.leads?.novoLead],
    ["Follow-up vencido", summary?.leads?.comFollowUpVencido],
    ["Sem interacao 24h", summary?.leads?.semInteracao24h],
    ["Mensagens inbound hoje", summary?.messages?.inboundHoje]
  ];

  summaryCards.innerHTML = "";
  for (const [label, value] of metrics) {
    const card = document.createElement("div");
    card.className = "summary-card";
    card.innerHTML = `<h3>${escapeHtml(label)}</h3><p>${Number(value ?? 0)}</p>`;
    summaryCards.appendChild(card);
  }
}

function renderWorklist(worklist) {
  renderActionItems(listActionPending, worklist?.actionItems?.pendentes ?? []);
  renderActionItems(listActionOverdue, worklist?.actionItems?.vencidos ?? []);
  renderLeads(listLeadsOverdue, worklist?.leads?.followUpVencido ?? []);
  renderLeads(listLeadsNoInteraction, worklist?.leads?.semInteracao24h ?? []);
  renderMessages(listMessagesInbound, worklist?.messages?.ultimasInbound ?? []);
}

function renderActionItems(target, items) {
  renderList(target, items, (item) => {
    const status = item.status ?? "-";
    const type = item.type ?? "-";
    const title = item.title ?? "Sem titulo";
    const contact = item.contactName ?? "Sem contato";
    const phone = item.normalizedPhone ?? "-";
    const dueAt = item.dueAt ?? "-";
    const createdAt = item.createdAt ?? "-";

    const wrapper = document.createElement("div");
    wrapper.className = "item";
    wrapper.innerHTML = `
      <div class="item-title">${escapeHtml(title)}</div>
      <div class="item-meta">
        <div><strong>Contato:</strong> ${escapeHtml(contact)} (${escapeHtml(phone)})</div>
        <div><strong>Type:</strong> ${escapeHtml(type)} | <strong>Status:</strong> ${escapeHtml(status)} | <strong>Priority:</strong> ${Number(item.priority ?? 0)}</div>
        <div><strong>dueAt:</strong> ${escapeHtml(dueAt)} | <strong>createdAt:</strong> ${escapeHtml(createdAt)}</div>
        <div><strong>id:</strong> ${escapeHtml(item.id ?? "-")} | <strong>leadId:</strong> ${escapeHtml(item.leadId ?? "-")}</div>
      </div>
    `;

    if (item.id) {
      const actions = document.createElement("div");
      actions.className = "item-actions";

      const completeButton = document.createElement("button");
      completeButton.type = "button";
      completeButton.textContent = "Concluir";
      completeButton.addEventListener("click", () => mutateActionItem(item.id, "complete"));

      const cancelButton = document.createElement("button");
      cancelButton.type = "button";
      cancelButton.textContent = "Ignorar";
      cancelButton.addEventListener("click", () => mutateActionItem(item.id, "cancel"));

      actions.appendChild(completeButton);
      actions.appendChild(cancelButton);
      wrapper.appendChild(actions);
    }

    return wrapper;
  });
}

function renderLeads(target, items) {
  renderList(target, items, (item) => {
    const wrapper = document.createElement("div");
    wrapper.className = "item";
    wrapper.innerHTML = `
      <div class="item-title">${escapeHtml(item.contactName ?? "Sem contato")}</div>
      <div class="item-meta">
        <div><strong>Telefone:</strong> ${escapeHtml(item.normalizedPhone ?? "-")}</div>
        <div><strong>Status:</strong> ${escapeHtml(item.status ?? "-")} | <strong>Source:</strong> ${escapeHtml(item.source ?? "-")}</div>
        <div><strong>nextActionAt:</strong> ${escapeHtml(item.nextActionAt ?? "-")}</div>
        <div><strong>lastInteractionAt:</strong> ${escapeHtml(item.lastInteractionAt ?? "-")}</div>
        <div><strong>leadId:</strong> ${escapeHtml(item.id ?? "-")} | <strong>contactId:</strong> ${escapeHtml(item.contactId ?? "-")}</div>
      </div>
    `;
    return wrapper;
  });
}

function renderMessages(target, items) {
  renderList(target, items, (item) => {
    const wrapper = document.createElement("div");
    wrapper.className = "item";
    wrapper.innerHTML = `
      <div class="item-title">${escapeHtml(item.contactName ?? "Sem contato")}</div>
      <div class="item-meta">
        <div><strong>Telefone:</strong> ${escapeHtml(item.normalizedPhone ?? "-")}</div>
        <div><strong>Mensagem:</strong> ${escapeHtml(truncate(item.body ?? "", 160))}</div>
        <div><strong>provider:</strong> ${escapeHtml(item.provider ?? "-")} | <strong>providerMessageId:</strong> ${escapeHtml(item.providerMessageId ?? "-")}</div>
        <div><strong>createdAt:</strong> ${escapeHtml(item.createdAt ?? "-")}</div>
        <div><strong>id:</strong> ${escapeHtml(item.id ?? "-")} | <strong>conversationId:</strong> ${escapeHtml(item.conversationId ?? "-")}</div>
      </div>
    `;
    return wrapper;
  });
}

function renderList(target, items, renderItem) {
  target.innerHTML = "";
  if (!Array.isArray(items) || items.length === 0) {
    target.innerHTML = '<p class="empty">Sem itens.</p>';
    return;
  }

  for (const item of items) {
    target.appendChild(renderItem(item));
  }
}

async function mutateActionItem(actionItemId, action) {
  const apiKey = apiKeyInput.value.trim();
  if (!apiKey) {
    showError("Informe a API key para atualizar itens.");
    return;
  }

  const endpoint = action === "complete" ? "complete" : "cancel";
  try {
    setLoading(true);
    clearError();

    await fetchJsonWithBody(`/api/action-items/${actionItemId}/${endpoint}`, apiKey, {});
    await refreshDashboard();
  } catch (error) {
    showError(error instanceof Error ? error.message : "Falha ao atualizar action item.");
  } finally {
    setLoading(false);
  }
}

async function fetchJsonWithBody(path, apiKey, body) {
  const response = await fetch(path, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-crm-api-key": apiKey
    },
    body: JSON.stringify(body)
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = payload?.message ? String(payload.message) : `Falha HTTP ${response.status}`;
    throw new Error(message);
  }
  return payload;
}

function setLoading(isLoading) {
  loadingElement.classList.toggle("hidden", !isLoading);
}

function showError(message) {
  errorElement.textContent = message;
  errorElement.classList.remove("hidden");
}

function clearError() {
  errorElement.textContent = "";
  errorElement.classList.add("hidden");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function truncate(value, maxLength) {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength)}...`;
}
