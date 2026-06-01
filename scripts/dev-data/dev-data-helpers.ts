import type { PoolClient } from "pg";
import pg from "pg";

import { loadDotEnv } from "../smoke/smoke-api-helpers.js";

const { Pool } = pg;

type DbConfig = {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  nodeEnv: string;
};

export type DbContext = {
  pool: pg.Pool;
  config: DbConfig;
};

export type AmbiguousSample = {
  table: "contacts" | "leads" | "messages";
  id: string;
  name?: string | null;
  phone?: string | null;
  source?: string | null;
  campaign?: string | null;
  provider?: string | null;
  providerMessageId?: string | null;
  reason: string;
  suggestion: string;
};

export function parseCliFlags(argv: string[]) {
  const flags = new Set(argv.slice(2));
  return {
    apply: flags.has("--apply"),
    confirmLocalDev: flags.has("--confirm-local-dev")
  };
}

export function createDbContext(): DbContext {
  loadDotEnv();

  const config: DbConfig = {
    host: process.env.POSTGRES_HOST ?? "localhost",
    port: toInt(process.env.POSTGRES_PORT, 5432),
    database: process.env.POSTGRES_DB ?? "clube04_crm",
    user: process.env.POSTGRES_USER ?? "clube04",
    password: process.env.POSTGRES_PASSWORD ?? "clube04_dev_password",
    nodeEnv: process.env.NODE_ENV ?? "development"
  };

  const pool = new Pool({
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.user,
    password: config.password,
    max: 5
  });

  return { pool, config };
}

export async function assertLocalSafeEnvironment(ctx: DbContext): Promise<void> {
  const { config } = ctx;

  if (config.nodeEnv.toLowerCase() === "production") {
    throw new Error("Abortado: NODE_ENV=production nao e permitido para scripts dev-data.");
  }

  if (!isLocalHost(config.host)) {
    throw new Error(
      `Abortado: POSTGRES_HOST='${config.host}' nao parece ambiente local permitido.`
    );
  }

  if (!isLocalDatabaseName(config.database)) {
    throw new Error(
      `Abortado: POSTGRES_DB='${config.database}' nao parece banco local de desenvolvimento.`
    );
  }

  const current = await ctx.pool.query<{ current_database: string }>(
    "select current_database() as current_database"
  );
  const currentDb = current.rows[0]?.current_database ?? "";
  if (!isLocalDatabaseName(currentDb)) {
    throw new Error(
      `Abortado: banco conectado '${currentDb}' nao parece ambiente local de desenvolvimento.`
    );
  }
}

export function requireApplyConfirmation(apply: boolean, confirmLocalDev: boolean): void {
  if (apply && !confirmLocalDev) {
    throw new Error("Para apagar dados use --apply --confirm-local-dev.");
  }
}

export function printMode(apply: boolean): void {
  const mode = apply ? "APPLY" : "DRY-RUN";
  console.log(`Modo: ${mode}`);
}

export async function closeDbContext(ctx: DbContext): Promise<void> {
  await ctx.pool.end();
}

export function formatCount(label: string, value: number): string {
  return `${label}: ${value}`;
}

export function printAmbiguousSamples(
  table: "contacts" | "leads" | "messages",
  samples: AmbiguousSample[]
) {
  console.log("");
  console.log(`Amostras ambiguas (${table}) - max ${samples.length}:`);
  if (samples.length === 0) {
    console.log("- none");
    return;
  }
  for (const sample of samples) {
    console.log(`- ${JSON.stringify(sample)}`);
  }
}

export async function selectIds(
  client: PoolClient,
  queryText: string,
  params: unknown[]
): Promise<string[]> {
  const result = await client.query<{ id: string }>(queryText, params);
  return result.rows.map((row) => row.id);
}

export async function countQuery(
  client: PoolClient,
  queryText: string,
  params: unknown[]
): Promise<number> {
  const result = await client.query<{ count: number }>(queryText, params);
  return Number(result.rows[0]?.count ?? 0);
}

export function uniqueIds(values: string[]): string[] {
  return [...new Set(values.filter((value) => value))];
}

function isLocalHost(host: string): boolean {
  const normalized = host.trim().toLowerCase();
  return (
    normalized === "localhost" ||
    normalized === "127.0.0.1" ||
    normalized === "::1" ||
    normalized === "postgres" ||
    normalized === "host.docker.internal"
  );
}

function isLocalDatabaseName(database: string): boolean {
  const normalized = database.trim().toLowerCase();
  return (
    normalized === "clube04_crm" ||
    normalized === "clube04_crm_dev" ||
    normalized.endsWith("_dev") ||
    normalized.includes("local")
  );
}

function toInt(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}
