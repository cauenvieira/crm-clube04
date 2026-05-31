export function buildHealthPayload() {
  return {
    worker: "ok",
    jobs: {
      scraping: "not_configured",
      crmClassification: "not_configured",
      actionDayGeneration: "not_configured"
    },
    checkedAt: new Date().toISOString()
  };
}
