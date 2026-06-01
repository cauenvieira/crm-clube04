import { expect, test } from "@playwright/test";

import { buildRunPayloadSource, buildTestNote, buildTestPhone, buildTestTutorName } from "../test-support/test-data.js";
import { cleanupByRunId } from "../test-support/test-cleanup.js";
import { createTestRunContext } from "../test-support/test-run.js";

const run = createTestRunContext("verify:frontend");
const sourceMarker = buildRunPayloadSource(run);
const manualLeadPhone = buildTestPhone(run, 1);
const manualLeadName = buildTestTutorName(run, "FRONTEND");

test.afterAll(async () => {
  const summary = await cleanupByRunId(run.runId);
  console.log(
    `Cleanup runId ${summary.runId}: messages=${summary.messages}, interactions=${summary.interactions}, action_items=${summary.actionItems}, conversations=${summary.conversations}, leads=${summary.leads}, contacts=${summary.contacts}`
  );
});

test("dashboard react flow, manual lead create/search/idempotency", async ({ page, baseURL }) => {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  const assetErrors: string[] = [];

  const knownNoise = [
    "favicon",
    "Manifest",
    "Failed to load resource: the server responded with a status of 404 (Not Found)"
  ];

  page.on("console", (msg) => {
    if (msg.type() !== "error") return;
    const text = msg.text();
    if (knownNoise.some((noise) => text.includes(noise))) return;
    consoleErrors.push(text);
  });

  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
  });

  page.on("response", (response) => {
    const url = response.url();
    const status = response.status();
    if (url.includes("/dashboard") && status >= 400) {
      assetErrors.push(`${status} ${url}`);
    }
  });

  const response = await page.goto("/dashboard", { waitUntil: "load" });
  expect(response?.status()).toBe(200);

  await page.waitForTimeout(1500);
  const rootChildren = await page.evaluate(() => document.getElementById("root")?.childElementCount ?? 0);
  if (rootChildren === 0) {
    const htmlPreview = (await page.content()).slice(0, 800);
    throw new Error(
      `Dashboard React nao renderizou. pageErrors=${JSON.stringify(pageErrors)} consoleErrors=${JSON.stringify(consoleErrors)} assetErrors=${JSON.stringify(assetErrors)} html=${JSON.stringify(htmlPreview)}`
    );
  }

  await page.waitForFunction(
    () => document.querySelector("h1")?.textContent?.includes("Painel Operacional") ?? false,
    undefined,
    { timeout: 30_000 }
  );
  await expect(page.getByRole("heading", { name: "Painel Operacional" })).toBeVisible({ timeout: 30_000 });
  await expect(page.getByRole("button", { name: "Hoje" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Novo Lead" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Configuracoes" })).toBeVisible();

  await page.getByRole("button", { name: "Configuracoes" }).click();
  await page.locator("#settings-api-key").fill(run.apiSecret);
  await page.getByRole("button", { name: "Salvar" }).click();
  await expect(page.getByText("API key salva com sucesso.")).toBeVisible();

  await page.reload({ waitUntil: "networkidle" });
  await expect(page.getByText("API key configurada")).toBeVisible();

  const savedKey = await page.evaluate(() => window.localStorage.getItem("crm_api_key"));
  expect(savedKey).toBe(run.apiSecret);

  await page.getByRole("button", { name: "Hoje" }).click();
  await expect(page.getByRole("heading", { name: "Acoes pendentes" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Acoes vencidas" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Retomar atendimento" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Follow-ups agendados" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Revisao lideranca" })).toBeVisible();

  await page.getByRole("button", { name: "Novo Lead" }).click();
  await expect(page.getByText("Novo lead manual")).toBeVisible();

  await page.getByLabel("Tutor *").fill(manualLeadName);
  await page.getByLabel("Telefone *").fill(manualLeadPhone);
  await page.getByLabel("Metodo de entrada *").selectOption("outro");
  await page.getByLabel("Atendente *").fill(run.attendantMarker);
  await page.getByLabel("Proxima acao *").selectOption("fazer_follow_up");
  await page.getByLabel("Data Prox Acao *").fill(getTomorrowYmd());
  await page.getByLabel("Observacao inicial").fill(buildTestNote(run, "verify-frontend"));
  await page.getByRole("button", { name: "Salvar lead" }).click();

  await expect(page.getByText("Resultado do cadastro")).toBeVisible();
  await expect(page.getByText("Lead manual criado com sucesso.")).toBeVisible();

  await page.locator("#lead-search-phone").fill(manualLeadPhone);
  await page.getByRole("button", { name: "Buscar" }).click();
  await expect(page.getByText("Action items abertos:")).toBeVisible();

  await page.getByLabel("Tutor *").fill(manualLeadName);
  await page.getByLabel("Telefone *").fill(manualLeadPhone);
  await page.getByLabel("Metodo de entrada *").selectOption("outro");
  await page.getByLabel("Atendente *").fill(run.attendantMarker);
  await page.getByLabel("Proxima acao *").selectOption("fazer_follow_up");
  await page.getByLabel("Data Prox Acao *").fill(getTomorrowYmd());
  await page.getByLabel("Observacao inicial").fill(buildTestNote(run, "verify-frontend-repeat"));
  await page.getByRole("button", { name: "Salvar lead" }).click();

  await expect(page.getByText("Lead ativo ja existente. Registro vinculado sem duplicar lead.")).toBeVisible();

  const hasHorizontalOverflow = await page.evaluate(() => {
    const root = document.documentElement;
    return root.scrollWidth > root.clientWidth + 1;
  });
  expect(hasHorizontalOverflow).toBe(false);

  expect(assetErrors, `Assets com erro HTTP em ${baseURL}`).toEqual([]);
  expect(pageErrors, "Erro de runtime no frontend").toEqual([]);
  expect(consoleErrors, "Erros de console no frontend").toEqual([]);
});

function getTomorrowYmd() {
  const now = new Date();
  now.setDate(now.getDate() + 1);
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
