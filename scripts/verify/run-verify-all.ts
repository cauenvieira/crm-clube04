import { spawn } from "node:child_process";

type Stage = {
  name: string;
  command: string;
  args: string[];
};

const noCleanup = process.argv.includes("--no-cleanup");

const stages: Stage[] = [
  { name: "build", command: "npm", args: ["run", "build"] },
  { name: "lint", command: "npm", args: ["run", "lint"] },
  { name: "smoke:api", command: "npm", args: ["run", "smoke:api"] },
  { name: "verify:action-items", command: "npm", args: ["run", "verify:action-items"] },
  { name: "verify:operational-summary", command: "npm", args: ["run", "verify:operational-summary"] },
  { name: "verify:operational-worklist", command: "npm", args: ["run", "verify:operational-worklist"] },
  { name: "verify:lead-operational-cycle", command: "npm", args: ["run", "verify:lead-operational-cycle"] },
  { name: "verify:lead-operational-scenarios", command: "npm", args: ["run", "verify:lead-operational-scenarios"] },
  { name: "verify:dashboard", command: "npm", args: ["run", "verify:dashboard"] },
  { name: "verify:frontend", command: "npm", args: ["run", "verify:frontend"] },
  { name: "n8n:list:workflows", command: "npm", args: ["run", "n8n:list:workflows"] }
];

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});

async function main() {
  let failedStage: string | null = null;

  for (const stage of stages) {
    const code = await runStage(stage);
    if (code !== 0) {
      failedStage = stage.name;
      break;
    }
  }

  if (!noCleanup) {
    const cleanupCode = await runStage({
      name: "dev:cleanup-test-data:apply",
      command: "npm",
      args: ["run", "dev:cleanup-test-data:apply"]
    });

    if (cleanupCode !== 0 && !failedStage) {
      failedStage = "dev:cleanup-test-data:apply";
    }
  }

  if (!noCleanup) {
    const cleanlinessCode = await runStage({
      name: "verify:data-cleanliness",
      command: "npm",
      args: ["run", "verify:data-cleanliness"]
    });

    if (cleanlinessCode !== 0 && !failedStage) {
      failedStage = "verify:data-cleanliness";
    }
  }

  if (failedStage) {
    console.error(`verify:all falhou na etapa: ${failedStage}`);
    process.exitCode = 1;
    return;
  }

  console.log("verify:all concluido com sucesso.");
}

async function runStage(stage: Stage): Promise<number> {
  console.log("");
  console.log(`==> Running ${stage.name}`);

  const code = await runCommand(stage.command, stage.args);
  if (code !== 0) {
    console.error(`==> ${stage.name} falhou com codigo ${code}`);
  } else {
    console.log(`==> ${stage.name} OK`);
  }

  return code;
}

async function runCommand(command: string, args: string[]): Promise<number> {
  const child = spawn([command, ...args].join(" "), [], {
    cwd: process.cwd(),
    stdio: "inherit",
    shell: true
  });

  return await new Promise((resolve) => {
    child.on("error", () => resolve(1));
    child.on("close", (code) => resolve(code ?? 1));
  });
}
