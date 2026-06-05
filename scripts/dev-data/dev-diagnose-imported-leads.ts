import {
  assertLocalSafeEnvironment,
  closeDbContext,
  createDbContext
} from "./dev-data-helpers.js";
import {
  collectImportedLeadsDiagnostics,
  printImportedLeadsDiagnostics
} from "./imported-leads-reset-lib.js";

async function main() {
  const ctx = createDbContext();
  try {
    await assertLocalSafeEnvironment(ctx);
    const client = await ctx.pool.connect();
    try {
      const report = await collectImportedLeadsDiagnostics(client);
      console.log("Imported lead local diagnostic");
      console.log("Mode: READ-ONLY");
      printImportedLeadsDiagnostics(report);
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
