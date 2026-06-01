const STORAGE_KEY = "crm_api_key";
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;
const TIME_ZONE = "America/Sao_Paulo";

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  timeZone: TIME_ZONE,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit"
});

const ui = {
  apiKey: document.getElementById("api-key"),
  limit: document.getElementById("limit"),
  update: document.getElementById("btn-update"),
  clearKey: document.getElementById("btn-clear-key"),
  loading: document.getElementById("loading"),
  error: document.getElementById("error"),
  feedback: document.getElementById("feedback"),
  summaryCards: document.getElementById("summary-cards"),
  metaBusinessDate: document.getElementById("meta-business-date"),
  metaTimezone: document.getElementById("meta-timezone"),
  metaGeneratedAt: document.getElementById("meta-generated-at"),
  metaWindow: document.getElementById("meta-window"),
  listActionPending: document.getElementById("list-action-pending"),
  listActionOverdue: document.getElementById("list-action-overdue"),
  listRetomarAtendimento: document.getElementById("list-retomar-atendimento"),
  listFollowUpsAgendados: document.getElementById("list-follow-ups-agendados"),
  listRevisaoLideranca: document.getElementById("list-revisao-lideranca"),
  listNovosLeads: document.getElementById("list-novos-leads"),
  listMessagesInbound: document.getElementById("list-messages-inbound")
};

bootstrap();

function bootstrap() {
  const savedKey = localStorage.getItem(STORAGE_KEY) ?? "";
  ui.apiKey.value = savedKey;
  ui.limit.value = String(DEFAULT_LIMIT);

  ui.update.addEventListener("click", () => refreshDashboard({ manual: true }));
  ui.clearKey.addEventListener("click", clearApiKey);
  ui.apiKey.addEventListener("change", persistApiKey);
  ui.apiKey.addEventListener("blur", persistApiKey);

  if (savedKey) refreshDashboard({ manual: false });
  else renderWithoutApiKey();
}

function clearApiKey() {
  localStorage.removeItem(STORAGE_KEY);
  ui.apiKey.value = "";
  renderWithoutApiKey();
  showSuccess("API key removida do navegador local.");
}

function persistApiKey() {
  const apiKey = ui.apiKey.value.trim();
  if (apiKey) localStorage.setItem(STORAGE_KEY, apiKey);
  else localStorage.removeItem(STORAGE_KEY);
}

async function refreshDashboard(options) {
  const apiKey = ui.apiKey.value.trim();
  const limit = parseLimit(ui.limit.value);

  clearMessages();
  setLoading(true);

  try {
    if (!apiKey) {
      renderWithoutApiKey();
      throw new Error("Informe a API key para carregar o painel.");
    }

    localStorage.setItem(STORAGE_KEY, apiKey);
    const [summary, worklist] = await Promise.all([
      fetchJson("/api/operational-summary", apiKey),
      fetchJson(`/api/operational-worklist?limit=${limit}`, apiKey)
    ]);

    renderSummary(summary);
    renderWorklist(worklist);
    if (options.manual) showSuccess("Painel atualizado com sucesso.");
  } catch (error) {
    showError(toUserMessage(error));
  } finally {
    setLoading(false);
  }
}

function parseLimit(value) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 1) return DEFAULT_LIMIT;
  if (parsed > MAX_LIMIT) return MAX_LIMIT;
  return parsed;
}

async function fetchJson(path, apiKey) {
  const response = await fetch(path, { headers: { "x-crm-api-key": apiKey } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(body?.message ? String(body.message) : `Falha HTTP ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return body;
}

function renderWithoutApiKey() {
  ui.metaBusinessDate.textContent = "-";
  ui.metaTimezone.textContent = TIME_ZONE;
  ui.metaGeneratedAt.textContent = "Sem registro";
  ui.metaWindow.textContent = "Sem registro";
  renderSummary(null);
  const message = "Informe a API key para carregar dados.";
  renderList(ui.listActionPending, [], () => null, message);
  renderList(ui.listActionOverdue, [], () => null, message);
  renderList(ui.listRetomarAtendimento, [], () => null, message);
  renderList(ui.listFollowUpsAgendados, [], () => null, message);
  renderList(ui.listRevisaoLideranca, [], () => null, message);
  renderList(ui.listNovosLeads, [], () => null, message);
  renderList(ui.listMessagesInbound, [], () => null, message);
}

function renderSummary(summary) {
  const actionItems = summary?.actionItems ?? {};
  const leads = summary?.leads ?? {};
  const messages = summary?.messages ?? {};

  ui.metaBusinessDate.textContent = summary?.businessDate ?? "-";
  ui.metaTimezone.textContent = summary?.timezone ?? TIME_ZONE;
  ui.metaGeneratedAt.textContent = formatDateTime(summary?.generatedAt);
  ui.metaWindow.textContent = formatWindow(summary?.window);

  const cards = [
    ["Acoes pendentes", "Fila ativa para atendimento", actionItems.pendente, "tone-warning"],
    ["Acoes vencidas", "Prioridade imediata", actionItems.vencidos, "tone-danger"],
    ["Concluidos hoje", "Entregas no dia", actionItems.concluidoHoje, ""],
    ["Ignorados hoje", "Acoes marcadas como ignorado", actionItems.ignoradoHoje, ""],
    ["Novos leads", "Entrada recente", leads.novoLead, "tone-info"],
    ["Follow-up vencido", "Leads aguardando retorno", leads.comFollowUpVencido, "tone-warning"],
    ["Sem interacao 24h", "Leads esfriando", leads.semInteracao24h, "tone-danger"],
    ["Inbound hoje", `Ultima: ${formatDateTime(messages.ultimaInboundEm)}`, messages.inboundHoje, "tone-info"]
  ];

  ui.summaryCards.innerHTML = "";
  for (const [title, subtitle, value, tone] of cards) {
    const card = document.createElement("article");
    card.className = `summary-card ${tone}`.trim();
    card.innerHTML =
      `<p class="summary-title">${escapeHtml(title)}</p>` +
      `<p class="summary-value">${Number(value ?? 0)}</p>` +
      `<p class="summary-subtitle">${escapeHtml(subtitle)}</p>`;
    ui.summaryCards.appendChild(card);
  }
}

function renderWorklist(worklist) {
  const actionItems = worklist?.actionItems ?? {};
  renderActionItems(ui.listActionOverdue, filterPriorityItems(actionItems.vencidos ?? []), "vencido");
  renderActionItems(ui.listActionPending, filterPriorityItems(actionItems.pendentes ?? []), "pendente");
  renderActionItems(ui.listRetomarAtendimento, actionItems.retomarAtendimento ?? [], "retomar");
  renderActionItems(ui.listFollowUpsAgendados, actionItems.followUpsAgendados ?? [], "followup");
  renderActionItems(ui.listRevisaoLideranca, actionItems.revisaoLideranca ?? [], "revisao");
  renderActionItems(ui.listNovosLeads, actionItems.novosLeads ?? [], "novo");
  renderMessages(ui.listMessagesInbound, worklist?.messages?.ultimasInbound ?? []);
}

function renderActionItems(target, items, mode) {
  renderList(target, items, (item) => {
    const sourceDetail = item.leadSource === "spreadsheet_import" ? " | Origem: spreadsheet_import" : "";
    const importedStatus = item.leadStatus ? ` | Lead status: ${item.leadStatus}` : "";
    const wrapper = baseItem(
      item.title ?? "Sem titulo",
      `${item.contactName ?? "Sem contato"} | ${formatPhone(item.normalizedPhone)}`,
      `${labelForMode(mode)} ${formatDateTime(item.dueAt)}`,
      `Status: ${item.status ?? "-"} | Tipo: ${item.type ?? "-"} | Prioridade: ${Number(item.priority ?? 0)}${sourceDetail}${importedStatus}`
    );
    if (item.id) {
      const actions = document.createElement("div");
      actions.className = "item-actions";
      actions.appendChild(makeButton("Concluir", "btn-action", () => mutateActionItem(item.id, "complete")));
      actions.appendChild(makeButton("Ignorar", "btn-action btn-ignore", () => mutateActionItem(item.id, "cancel")));
      wrapper.appendChild(actions);
    }
    wrapper.appendChild(makeDebugDetails({
      id: item.id,
      leadId: item.leadId,
      contactId: item.contactId,
      leadSource: item.leadSource,
      leadStatus: item.leadStatus,
      reason: item.reason
    }));
    return wrapper;
  });
}

function renderMessages(target, items) {
  renderList(target, items, (item) => {
    const wrapper = baseItem(
      item.contactName ?? "Sem contato",
      formatPhone(item.normalizedPhone),
      `Recebida em ${formatDateTime(item.createdAt)}`,
      truncate(item.body ?? "Sem mensagem", 180),
      true
    );
    wrapper.appendChild(makeDebugDetails({
      messageId: item.id, conversationId: item.conversationId, provider: item.provider, providerMessageId: item.providerMessageId
    }));
    return wrapper;
  });
}

function baseItem(title, phone, metaLine, fourthLine, isBody = false) {
  const wrapper = document.createElement("article");
  wrapper.className = "item";
  wrapper.innerHTML =
    `<p class="item-title">${escapeHtml(title)}</p>` +
    `<p class="item-phone">${escapeHtml(phone)}</p>` +
    `<p class="item-meta">${escapeHtml(metaLine)}</p>` +
    `<p class="${isBody ? "item-body" : "item-meta"}">${escapeHtml(fourthLine)}</p>`;
  return wrapper;
}

function renderList(target, items, renderer, emptyText = "Sem itens para este bloco.") {
  target.innerHTML = "";
  if (!Array.isArray(items) || items.length === 0) {
    target.innerHTML = `<p class="empty">${escapeHtml(emptyText)}</p>`;
    return;
  }
  for (const item of items) target.appendChild(renderer(item));
}

function makeButton(label, className, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.textContent = label;
  button.addEventListener("click", onClick);
  return button;
}

function makeDebugDetails(data) {
  const details = document.createElement("details");
  details.className = "item-details";
  details.innerHTML = `<summary>Debug</summary><pre>${escapeHtml(JSON.stringify(data, null, 2))}</pre>`;
  return details;
}

async function mutateActionItem(actionItemId, action) {
  const apiKey = ui.apiKey.value.trim();
  if (!apiKey) return showError("Informe a API key para atualizar itens.");
  if (action === "cancel" && !window.confirm("Confirmar ignorar este action item?")) return;

  clearMessages();
  setLoading(true);
  try {
    await fetchJsonWithBody(`/api/action-items/${actionItemId}/${action === "complete" ? "complete" : "cancel"}`, apiKey, {});
    await refreshDashboard({ manual: false });
    showSuccess(action === "complete" ? "Action item concluido." : "Action item ignorado.");
  } catch (error) {
    showError(toUserMessage(error));
  } finally {
    setLoading(false);
  }
}

async function fetchJsonWithBody(path, apiKey, body) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "content-type": "application/json", "x-crm-api-key": apiKey },
    body: JSON.stringify(body)
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload?.message ? String(payload.message) : `Falha HTTP ${response.status}`);
    error.status = response.status;
    throw error;
  }
}

function setLoading(isLoading) {
  ui.loading.classList.toggle("hidden", !isLoading);
}

function toUserMessage(error) {
  if (error && typeof error === "object" && error.status === 401) return "API key invalida ou sem permissao para acessar /api.";
  return error instanceof Error ? error.message : "Erro inesperado ao carregar dados.";
}

function showError(message) {
  ui.error.textContent = message;
  ui.error.classList.remove("hidden");
}

function showSuccess(message) {
  ui.feedback.textContent = message;
  ui.feedback.classList.remove("hidden");
}

function clearMessages() {
  ui.error.textContent = "";
  ui.error.classList.add("hidden");
  ui.feedback.textContent = "";
  ui.feedback.classList.add("hidden");
}

function formatDateTime(value) {
  if (!value) return "Sem registro";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sem registro";
  return dateTimeFormatter.format(date);
}

function formatWindow(windowRange) {
  if (!windowRange?.start || !windowRange?.end) return "Sem registro";
  return `${formatDateTime(windowRange.start)} ate ${formatDateTime(windowRange.end)}`;
}

function formatPhone(rawValue) {
  const raw = String(rawValue ?? "").trim();
  if (!raw) return "Sem registro";
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 13 && digits.startsWith("55")) return `+55 (${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9, 13)}`;
  if (digits.length === 12 && digits.startsWith("55")) return `+55 (${digits.slice(2, 4)}) ${digits.slice(4, 8)}-${digits.slice(8, 12)}`;
  if (digits.length === 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  if (digits.length === 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6, 10)}`;
  return raw;
}

function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}

function truncate(value, maxLength) {
  return value.length <= maxLength ? value : `${value.slice(0, maxLength)}...`;
}

function filterPriorityItems(items) {
  const hidden = new Set(["lead_sem_interacao", "validar_conversao"]);
  return items.filter((item) => !hidden.has(String(item.type ?? "")));
}

function labelForMode(mode) {
  if (mode === "vencido") return "Vencido em";
  if (mode === "retomar") return "Retomar ate";
  if (mode === "followup") return "Follow-up em";
  if (mode === "revisao") return "Revisar ate";
  if (mode === "novo") return "Atender ate";
  return "Prazo";
}
