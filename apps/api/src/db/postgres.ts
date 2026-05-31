import pg from "pg";

import { env } from "../config/env.js";

const { Pool } = pg;

export const postgresPool = new Pool({
  host: env.postgres.host,
  port: env.postgres.port,
  database: env.postgres.database,
  user: env.postgres.user,
  password: env.postgres.password,
  max: 10
});

export async function checkPostgres(): Promise<boolean> {
  const result = await postgresPool.query<{ ok: number }>("select 1 as ok");
  return result.rows[0]?.ok === 1;
}

export async function closePostgres(): Promise<void> {
  await postgresPool.end();
}
