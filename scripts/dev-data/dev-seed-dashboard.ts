import {
  assertLocalSafeEnvironment,
  closeDbContext,
  createDbContext,
  parseCliFlags
} from "./dev-data-helpers.js";
import { cleanupDashboardSeed, createDashboardSeed } from "./dev-seed-dashboard-lib.js";

const db = createDbContext();
const { apply, confirmLocalDev } = parseCliFlags(process.argv);

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});

async function main() {
  if (apply || confirmLocalDev) {
    console.log("Aviso: este script sempre aplica seed. Flags --apply/--confirm-local-dev sao ignoradas.");
  }

  await assertLocalSafeEnvironment(db);
  const client = await db.pool.connect();

  try {
    await client.query("begin");
    await cleanupDashboardSeed(client);
    const created = await createDashboardSeed(client);
    await client.query("commit");

    console.log("Seed dashboard aplicado.");
    console.log(`- contacts: ${created.contacts}`);
    console.log(`- leads: ${created.leads}`);
    console.log(`- conversations: ${created.conversations}`);
    console.log(`- messages: ${created.messages}`);
    console.log(`- action_items: ${created.actionItems}`);
  } catch (error) {
    await client.query("rollback").catch(() => undefined);
    throw error;
  } finally {
    client.release();
    await closeDbContext(db);
  }
}
