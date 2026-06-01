import { loadDotEnv } from "../smoke-api-helpers.js";

export type TestRunContext = {
  apiBaseUrl: string;
  apiSecret: string;
  runId: string;
  sourceMarker: string;
  namePrefix: string;
  attendantMarker: string;
  noteMarker: string;
};

export function createTestRunContext(testName: string, options?: { requireApiSecret?: boolean }): TestRunContext {
  loadDotEnv();

  const apiBaseUrl = (process.env.API_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const apiSecret = (process.env.CRM_API_SECRET ?? "").trim();
  if ((options?.requireApiSecret ?? true) && !apiSecret) {
    throw new Error(`${testName}: CRM_API_SECRET nao definido no ambiente/.env`);
  }

  const runId = buildRunId();
  return {
    apiBaseUrl,
    apiSecret,
    runId,
    sourceMarker: `test_run:${runId}`,
    namePrefix: `TESTE_CRM_${runId}`,
    attendantMarker: `TESTE_AUTOMACAO_${runId}`,
    noteMarker: `TEST_RUN_ID=${runId}`
  };
}

export function createTestPhone(runId: string, index: number): string {
  const digits = `${Date.now()}${runId}${index}`.replace(/\D/g, "");
  const suffix = digits.slice(-7).padStart(7, "0");
  return `1199${suffix}`;
}

function buildRunId() {
  const rand = Math.random().toString(36).slice(2, 8);
  return `crm_test_${Date.now()}_${rand}`;
}
