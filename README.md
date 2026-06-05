# CRM Clube04

CRM operacional do Clube04 Mogi das Cruzes.

## Visao

O objetivo do projeto e construir, de forma incremental, um centro de operacoes e controle para a unidade.

No futuro, o sistema deve apoiar a rotina operacional do Clube04: leads, atendimento, WhatsApp, agenda, clientes, pacotes, metas, equipe, producao, NPS, financeiro operacional, indicadores e automacoes.

O foco funcional atual e a Jornada do Lead. Ela e o primeiro grande modulo do produto, nao o limite final do CRM.

## Principios

- Operacao real antes de SaaS generico.
- Jornada do Lead com disciplina diaria, historico e rastreabilidade.
- Backend como dono do comportamento operacional critico.
- Frontend simples, orientado a acao e baseado na UI Foundation.
- Dados reais fora do Git.
- Mudancas pequenas, revisaveis e documentadas.
- Codigo, docs, regras e testes devem evoluir juntos.

## Stack

- Node.js
- TypeScript
- Fastify API
- PostgreSQL
- Redis
- Docker Compose
- React/Vite em `apps/web`
- n8n local para automacoes controladas

## Start rapido

1. Copiar env:

```bash
cp .env.example .env
```

2. Subir ambiente:

```bash
docker compose up -d --build
```

3. Instalar dependencias:

```bash
npm install
```

4. Validar:

```bash
npm run verify:all
```

## URLs locais

- API health: `http://localhost:3000/health`
- Dashboard: `http://localhost:3000/dashboard`
- n8n: `http://localhost:5678`

## Comandos principais

- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run smoke:api`
- `npm run verify:all`
- `npm run verify:data-cleanliness`
- `npm run n8n:list:workflows`
- `npm run dev:cleanup-test-data`
- `npm run dev:cleanup-test-data:apply`
- `npm run dev:seed-dashboard`

## Hierarquia documental

Comece por:

- `AGENTS.md`: regras gerais, hierarquia, roteamento de contexto e governanca para agentes/Codex.
- `docs/development/documentation-hierarchy.md`: mapa completo da documentacao e regra de precedencia.
- `docs/project-state.md`: estado atual commitado.
- `docs/tasks.md`: backlog e proximos passos.

## Regras operacionais da Jornada do Lead

As regras de negocio da Jornada do Lead estao documentadas em:

- `docs/product/lead-operational-contract.md`
- `docs/product/lead-import-normalization.md`
- `docs/qa/lead-business-rules-test-matrix.md`

Esses arquivos sao a fonte de verdade para comportamento do ciclo de vida do lead, normalizacao de importacao e cobertura de testes das regras de negocio.

`docs/product/lead-operational-scope.md` e documento auxiliar de escopo. Em caso de conflito, os tres documentos acima vencem.

## Fonte sincronizada para ChatGPT

A pasta Google Drive abaixo e um espelho automatico dos arquivos `.md` versionados do repo:

`https://drive.google.com/drive/folders/10sGqCPw1Sef7JM2cclREeUGLAgcaXSTs?usp=sharing`

O sync e feito por GitHub Actions + rclone apos push na `main` quando arquivos `.md`, workflow ou script de sync mudam.

O arquivo `PROJECT_CONTEXT_INDEX.md` no Drive informa commit, branch, data e lista de arquivos sincronizados.

A pasta `dados-sensiveis` dentro do mesmo Drive fica fora do sync e pode conter a planilha de leads copiada manualmente. Tratar como dado sensivel e consultar apenas quando necessario.

## Documentacao principal

- Estado atual: `docs/project-state.md`
- Backlog: `docs/tasks.md`
- Hierarquia documental: `docs/development/documentation-hierarchy.md`
- API: `docs/api/rest-api.md`
- Banco/schema: `docs/database/schema.md`
- Organizacao de codigo: `docs/architecture/code-organization.md`
- Roadmap tecnico: `docs/roadmap.md`
- Roadmap de produto: `docs/product/crm-platform-roadmap.md`
- Modulos: `docs/product/modules.md`
- Fluxos operacionais: `docs/product/operational-flows.md`
- Workflow Codex: `docs/development/codex-workflow.md`
- Instrucoes compactas Codex: `docs/development/codex-custom-instructions.md`
- Fontes ChatGPT: `docs/development/chatgpt-project-sources.md`
- Frontend design system: `docs/frontend/design-system.md`
- Catalogo de componentes: `docs/frontend/components-catalog.md`
- Adaptacao Lovable: `docs/frontend/lovable-adaptation-guide.md`
- Backend API agent: `docs/backend/api-agent.md`
- QA/validacao agent: `docs/qa/verification-agent.md`

## Regras operacionais de desenvolvimento

- Rodar validacoes proporcionais ao escopo.
- Docs-only: `git diff --check` e `npm run verify:data-cleanliness`.
- Mudancas gerais: `npm run build`, `npm run lint`, `npm run verify:all`, `npm run verify:data-cleanliness`.
- Nao executar smoke/verify em paralelo no mesmo banco local.
- Nao versionar `.env`, dados reais, exports locais ou arquivos em `.tmp/`.
- Nao usar `git add -A`.
- Nao commitar sem revisao/autorizacao.
