import { assert, assertStatus } from "../smoke/smoke-api-helpers.js";

type HttpResult = {
  status: number;
  body: string;
};

const baseUrl = "http://localhost:3000";

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});

async function main() {
  const dashboard = await getText("/dashboard");
  assertStatus(dashboard, 200);
  assert(dashboard.body.includes("Painel Operacional"), "Dashboard nao contem titulo esperado");
  assert(dashboard.body.includes('id="root"'), "Dashboard sem root React");
  assert(
    dashboard.body.includes('/dashboard/styles.css'),
    "Dashboard sem referencia a /dashboard/styles.css"
  );
  assert(
    dashboard.body.includes('/dashboard/app.js'),
    "Dashboard sem referencia a /dashboard/app.js"
  );

  const appJs = await getText("/dashboard/app.js");
  assertStatus(appJs, 200);

  const styles = await getText("/dashboard/styles.css");
  assertStatus(styles, 200);

  ensureNoHardcodedSecrets(dashboard.body, "dashboard.html");
  ensureNoHardcodedSecrets(appJs.body, "dashboard/app.js");
  ensureNoHardcodedSecrets(styles.body, "dashboard/styles.css");

  assert(
    appJs.body.includes("/api/operational-summary"),
    "app.js nao contem chamada para /api/operational-summary"
  );
  assert(
    appJs.body.includes("/api/operational-worklist"),
    "app.js nao contem chamada para /api/operational-worklist"
  );
  assert(
    appJs.body.includes("/api/manual-leads"),
    "app.js nao contem chamada para /api/manual-leads"
  );
  assert(
    appJs.body.includes("/api/leads/search"),
    "app.js nao contem chamada para /api/leads/search"
  );
  assert(
    !appJs.body.includes("Build do frontend React nao encontrado"),
    "app.js retornou fallback de erro em vez do bundle React real"
  );
  assert(
    appJs.body.includes("x-crm-api-key"),
    "app.js nao contem uso de header x-crm-api-key"
  );
  assert(
    appJs.body.includes("createRoot"),
    "app.js nao parece bundle React/Vite (createRoot ausente)"
  );
  assert(appJs.body.includes("Hoje"), "app.js nao contem menu Hoje");
  assert(appJs.body.includes("Novo Lead"), "app.js nao contem menu Novo Lead");
  assert(appJs.body.includes("Configuracoes"), "app.js nao contem menu Configuracoes");
  assert(appJs.body.includes("Retomar atendimento"), "app.js nao contem secao Retomar atendimento");
  assert(appJs.body.includes("Follow-ups agendados"), "app.js nao contem secao Follow-ups agendados");
  assert(appJs.body.includes("Revisao lideranca"), "app.js nao contem secao Revisao lideranca");
  assert(appJs.body.includes("Abrir WhatsApp"), "app.js nao contem acao Abrir WhatsApp");
  assert(appJs.body.includes("Concluir"), "app.js nao contem acao Concluir");
  assert(appJs.body.includes("Ignorar"), "app.js nao contem acao Ignorar");

  console.log("OK - /dashboard responde 200 e contem Painel Operacional");
  console.log("OK - dashboard contem root React e referencias de bundle");
  console.log("OK - /dashboard/app.js responde 200");
  console.log("OK - /dashboard/styles.css responde 200");
  console.log("OK - Sem segredo/API key hardcoded detectado");
  console.log("OK - app.js contem chamadas API, menu operacional e acoes");
  console.log("");
  console.log("Resumo verify:dashboard: 6/6 passos OK");
}

async function getText(path: string): Promise<HttpResult> {
  const response = await fetch(`${baseUrl}${path}`);
  return {
    status: response.status,
    body: await response.text()
  };
}

function ensureNoHardcodedSecrets(content: string, label: string) {
  const blockedPatterns = [
    /dev_crm_api_secret/i,
    /crm_api_secret\s*=\s*["'][^"']+/i,
    /x-crm-api-key["']?\s*:\s*["'][^"']{8,}/i,
    /bearer\s+[a-z0-9\-_]+\.[a-z0-9\-_]+\.[a-z0-9\-_]+/i
  ];

  for (const pattern of blockedPatterns) {
    assert(!pattern.test(content), `${label} parece conter segredo hardcoded`);
  }
}
