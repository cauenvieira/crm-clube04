import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const outputDir = ".chatgpt-sources";

function run(command, args) {
  return execFileSync(command, args, { encoding: "utf8" }).trim();
}

function copyPreservingPath(relativePath) {
  const destination = join(outputDir, relativePath);
  mkdirSync(dirname(destination), { recursive: true });
  copyFileSync(relativePath, destination);
}

rmSync(outputDir, { recursive: true, force: true });
mkdirSync(outputDir, { recursive: true });

const commit = run("git", ["rev-parse", "--short", "HEAD"]);
const branch = process.env.GITHUB_REF_NAME || run("git", ["branch", "--show-current"]);
const generatedAt = new Date().toISOString();

const markdownRaw = run("git", ["ls-files", "*.md"]);
const markdownFiles = markdownRaw
  ? markdownRaw.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).sort()
  : [];

for (const file of markdownFiles) {
  copyPreservingPath(file);
}

const index = [
  "# CRM Clube04 - Fontes ChatGPT",
  "",
  `Gerado em: ${generatedAt}`,
  `Branch: ${branch}`,
  `Commit: ${commit}`,
  "",
  "O repositorio Git continua sendo a fonte de verdade.",
  "Esta pasta e um espelho automatico de arquivos Markdown versionados para consulta no ChatGPT.",
  "",
  "## Escopo",
  "",
  "- Inclui somente arquivos Markdown rastreados pelo Git.",
  "- Preserva a estrutura de pastas do repositorio.",
  "- Nao inclui planilhas, CSV, dumps, logs, zips, screenshots, .env ou dados reais.",
  "- A planilha de leads deve ficar em pasta separada do Drive: dados-sensiveis.",
  "",
  "## Arquivos sincronizados",
  "",
  ...markdownFiles.map((file) => `- ${file}`),
  "",
].join("\n");

writeFileSync(join(outputDir, "PROJECT_CONTEXT_INDEX.md"), index, "utf8");

console.log(`Generated ${outputDir}`);
console.log(`Markdown files: ${markdownFiles.length}`);
console.log(`Commit: ${commit}`);
