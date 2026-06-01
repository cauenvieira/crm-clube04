import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import type { FastifyInstance } from "fastify";

const builtAssetsRootCandidates = [
  resolve(process.cwd(), "apps/web/dist"),
  resolve("/app/apps/web/dist")
];

const publicAssetsRootCandidates = [
  resolve(process.cwd(), "apps/web/public"),
  resolve("/app/apps/web/public")
];

export async function registerDashboardRoutes(app: FastifyInstance): Promise<void> {
  app.get("/dashboard", async (_request, reply) => {
    const html = await readDashboardHtml();
    return reply.type("text/html; charset=utf-8").send(html);
  });

  app.get("/dashboard/app.js", async (_request, reply) => {
    const js = await readRequiredDashboardBundle("app.js");
    return reply.type("application/javascript; charset=utf-8").send(js);
  });

  app.get("/dashboard/styles.css", async (_request, reply) => {
    const css = await readRequiredDashboardBundle("style.css");
    return reply.type("text/css; charset=utf-8").send(css);
  });
}

async function readDashboardHtml() {
  return await readFromCandidates(publicAssetsRootCandidates, "dashboard.html");
}

async function readRequiredDashboardBundle(fileName: "app.js" | "style.css") {
  try {
    return await readFromCandidates(builtAssetsRootCandidates, fileName);
  } catch (error) {
    throw new Error(
      `Bundle do dashboard nao encontrado (${fileName}). Rode npm run build -w @clube04/web antes de abrir /dashboard. ${String(error)}`
    );
  }
}

async function readFromCandidates(
  rootCandidates: string[],
  fileName: "dashboard.html" | "app.js" | "style.css"
) {
  const errors: unknown[] = [];

  for (const root of rootCandidates) {
    try {
      return await readFile(resolve(root, fileName), "utf8");
    } catch (error) {
      errors.push(error);
    }
  }

  throw new Error(`Dashboard asset nao encontrado: ${fileName} (${errors.length} tentativas)`);
}
