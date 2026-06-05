import {
  assertLocalSafeEnvironment,
  closeDbContext,
  createDbContext
} from "../dev-data/dev-data-helpers.js";

export async function clearLeadNextAction(leadId: string): Promise<void> {
  await withLocalDb(async (client) => {
    await client.query("update leads set next_action_at = null, updated_at = now() where id = $1", [leadId]);
    await client.query(
      "update action_items set status = 'ignorado', updated_at = now() where lead_id = $1 and status in ('pendente', 'em_andamento', 'reagendado')",
      [leadId]
    );
  });
}

export async function setLeadAttempts(leadId: string, attemptsCount: number): Promise<void> {
  await withLocalDb(async (client) => {
    await client.query("update leads set attempts_count = $2, updated_at = now() where id = $1", [
      leadId,
      attemptsCount
    ]);
  });
}

async function withLocalDb(handler: (client: import("pg").PoolClient) => Promise<void>): Promise<void> {
  const db = createDbContext();
  await assertLocalSafeEnvironment(db);
  const client = await db.pool.connect();
  try {
    await client.query("begin");
    await handler(client);
    await client.query("commit");
  } catch (error) {
    await client.query("rollback").catch(() => undefined);
    throw error;
  } finally {
    client.release();
    await closeDbContext(db);
  }
}
