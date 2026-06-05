import {
  assertLocalSafeEnvironment,
  closeDbContext,
  createDbContext,
  parseCliFlags,
  printMode,
  requireApplyConfirmation
} from "./dev-data-helpers.js";
import {
  applyImportedLeadsReset,
  collectImportedLeadsResetPlan,
  printImportedLeadsResetPlan
} from "./imported-leads-reset-lib.js";

async function main() {
  const flags = parseCliFlags(process.argv);
  requireApplyConfirmation(flags.apply, flags.confirmLocalDev);

  const ctx = createDbContext();
  try {
    await assertLocalSafeEnvironment(ctx);
    const client = await ctx.pool.connect();
    try {
      printMode(flags.apply);
      const plan = await collectImportedLeadsResetPlan(client);
      printImportedLeadsResetPlan(plan);

      if (!flags.apply) {
        console.log("");
        console.log("No records deleted. Re-run with --apply --confirm-local-dev to apply this plan.");
        return;
      }

      await client.query("begin");
      try {
        const deleted = await applyImportedLeadsReset(client, plan);
        await client.query("commit");
        console.log("");
        console.log("Deleted records:");
        console.log(`- messages: ${deleted.messages}`);
        console.log(`- conversations: ${deleted.conversations}`);
        console.log(`- crm_interactions: ${deleted.crmInteractions}`);
        console.log(`- action_items: ${deleted.actionItems}`);
        console.log(`- leads: ${deleted.leads}`);
        console.log(`- contacts: ${deleted.contacts}`);
      } catch (error) {
        await client.query("rollback");
        throw error;
      }
    } finally {
      client.release();
    }
  } finally {
    await closeDbContext(ctx);
  }
}

main().catch((error) => {
  console.error(formatError(error));
  process.exitCode = 1;
});

function formatError(error: unknown): string {
  if (error instanceof Error) return error.stack || error.message || "Unknown error";
  return String(error);
}
