import { closeDbContext, createDbContext } from "./dev-data-helpers.js";

type ResidueRow = {
  type: string;
  status: string;
  lead_source: string;
  lead_campaign: string;
  reason: string;
  total: string | number;
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});

async function main() {
  const db = createDbContext();
  try {
    const summary = await db.pool.query<ResidueRow>(
      `
        select
          ai.type,
          ai.status,
          coalesce(l.source, 'sem_lead') as lead_source,
          coalesce(l.campaign, 'sem_campaign') as lead_campaign,
          coalesce(ai.reason, '') as reason,
          count(*) as total
        from action_items ai
        left join leads l on l.id = ai.lead_id
        where ai.status in ('pendente', 'em_andamento')
        group by ai.type, ai.status, coalesce(l.source, 'sem_lead'), coalesce(l.campaign, 'sem_campaign'), coalesce(ai.reason, '')
        order by count(*) desc
      `
    );

    console.log("Resumo de fila aberta (pendente/em_andamento):");
    for (const row of summary.rows) {
      console.log(
        `${row.type} | ${row.status} | ${row.lead_source} | ${row.lead_campaign} | ${row.reason || "-"} | ${row.total}`
      );
    }

    const residues = summary.rows.filter((row) => isTestResidue(row));

    if (residues.length > 0) {
      console.error("");
      console.error("Residuos de teste detectados:");
      for (const row of residues) {
        console.error(
          `${row.type} | ${row.status} | ${row.lead_source} | ${row.lead_campaign} | ${row.reason || "-"} | ${row.total}`
        );
      }
      process.exitCode = 1;
      return;
    }

    console.log("");
    console.log("OK - Nenhum residuo aberto de smoke/verify/test foi encontrado.");
  } finally {
    await closeDbContext(db);
  }
}

function isTestResidue(row: ResidueRow) {
  const leadSource = (row.lead_source ?? "").toLowerCase();
  const leadCampaign = (row.lead_campaign ?? "").toLowerCase();
  const reason = (row.reason ?? "").toLowerCase();

  const blockedValues = [
    "smoke-test",
    "smoke_webhook",
    "verify-action-items",
    "verify-operational-summary",
    "verify-operational-worklist",
    "dev_seed_dashboard"
  ];

  if (blockedValues.includes(leadSource)) return true;
  if (blockedValues.includes(leadCampaign)) return true;
  if (leadSource.startsWith("test_run:")) return true;
  if (leadCampaign.startsWith("test_run:")) return true;
  if (reason.includes("test_run:")) return true;
  if (reason.includes("test_run_id=")) return true;

  if (
    leadSource === "manual_entry" &&
    (leadCampaign.startsWith("test_run:") || reason.includes("test_run:") || reason.includes("test_run_id="))
  ) {
    return true;
  }

  return false;
}
