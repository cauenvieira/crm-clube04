import { assert, assertStatus } from "./smoke-api-helpers.js";

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
  assert(dashboard.body.includes('id="api-key"'), "Dashboard sem campo de API key");
  assert(dashboard.body.includes('id="btn-update"'), "Dashboard sem botao Atualizar");
  assert(dashboard.body.includes('id="limit"'), "Dashboard sem campo de limit");
  assert(dashboard.body.includes("Agora / Prioridade"), "Dashboard sem secao Agora / Prioridade");
  assert(dashboard.body.includes("Leads em risco"), "Dashboard sem secao Leads em risco");
  assert(dashboard.body.includes("Movimento recente"), "Dashboard sem secao Movimento recente");

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
    appJs.body.includes("x-crm-api-key"),
    "app.js nao contem uso de header x-crm-api-key"
  );

  console.log("OK - /dashboard responde 200 e contem Painel Operacional");
  console.log("OK - dashboard contem controles e secoes principais");
  console.log("OK - /dashboard/app.js responde 200");
  console.log("OK - /dashboard/styles.css responde 200");
  console.log("OK - Sem segredo/API key hardcoded detectado");
  console.log("OK - app.js contem chamadas de summary/worklist e header x-crm-api-key");
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
