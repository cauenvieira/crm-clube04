import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import type { FastifyInstance } from "fastify";

const assetsRootCandidates = [
  resolve(process.cwd(), "apps/web/public"),
  resolve("/app/apps/web/public")
];

export async function registerDashboardRoutes(app: FastifyInstance): Promise<void> {
  app.get("/dashboard", async (_request, reply) => {
    const html = await readDashboardAsset("dashboard.html");
    return reply.type("text/html; charset=utf-8").send(html);
  });

  app.get("/dashboard/app.js", async (_request, reply) => {
    const js = await readDashboardAsset("app.js");
    return reply.type("application/javascript; charset=utf-8").send(js);
  });

  app.get("/dashboard/styles.css", async (_request, reply) => {
    const css = await readDashboardAsset("styles.css");
    return reply.type("text/css; charset=utf-8").send(css);
  });
}

async function readDashboardAsset(fileName: "dashboard.html" | "app.js" | "styles.css") {
  const errors: unknown[] = [];

  for (const root of assetsRootCandidates) {
    try {
      return await readFile(resolve(root, fileName), "utf8");
    } catch (error) {
      errors.push(error);
    }
  }

  throw new Error(`Dashboard asset nao encontrado: ${fileName} (${errors.length} tentativas)`);
}
