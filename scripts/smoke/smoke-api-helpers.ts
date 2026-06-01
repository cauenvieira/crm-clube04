import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

export type HttpResult = {
  status: number;
  body: unknown;
};

export function loadDotEnv() {
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

export async function request(
  apiBaseUrl: string,
  apiSecret: string | undefined,
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

export function assertStatus(response: HttpResult, expected: number) {
  assert(response.status === expected, `Esperava HTTP ${expected}, recebeu ${response.status}`);
}

export function assertOneOfStatus(response: HttpResult, expected: number[]) {
  assert(
    expected.includes(response.status),
    `Esperava HTTP ${expected.join(" ou ")}, recebeu ${response.status}`
  );
}

export function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

export function required(value: string | undefined, label: string): string {
  assert(value, `${label} nao foi definido por teste anterior`);
  return value;
}

export function asRecord(value: unknown): Record<string, unknown> {
  assert(
    typeof value === "object" && value !== null && !Array.isArray(value),
    "Resposta JSON nao e objeto"
  );
  return value as Record<string, unknown>;
}

export function asArray(value: unknown): unknown[] {
  assert(Array.isArray(value), "Resposta JSON nao e lista");
  return value;
}

export function asString(value: unknown, label: string): string {
  assert(typeof value === "string" && value.length > 0, `${label} nao e string valida`);
  return value;
}
