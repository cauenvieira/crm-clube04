import "dotenv/config";

import { buildHealthPayload } from "./jobs/health.js";

const command = process.argv[2] ?? "health";

if (command === "health") {
  console.log(JSON.stringify(buildHealthPayload(), null, 2));
} else if (command === "serve") {
  console.log("Clube04 CRM worker iniciado. Aguardando jobs futuros.");
  setInterval(() => {
    console.log(JSON.stringify(buildHealthPayload()));
  }, 60_000);
} else {
  console.error(`Comando desconhecido: ${command}`);
  process.exitCode = 1;
}
