# Repo Structure

## Objetivo

Documentar onde cada tipo de arquivo deve morar no CRM Clube04, mantendo o repositorio legivel para humanos, Codex e ChatGPT.

Este documento complementa `docs/architecture/code-organization.md` e deve seguir a hierarquia definida em `docs/development/documentation-hierarchy.md`.

## Layout principal

```text
apps/
  api/       Fastify API: routes, services, repositories, validation, integrations
  web/       React + Vite dashboard
  worker/    jobs, classificacoes e rotinas assincronas
packages/
  shared/    tipos e utilitarios realmente compartilhados
infra/
  db/        bootstrap e migrations SQL versionadas
  n8n/       workflows versionados e ativos de integracao
scripts/
  smoke/                    smoke tests da API
  verify/                   verificacoes operacionais
  test-support/             helpers de teste, runId, HTTP e cleanup
  dev-data/                 cleanup e seed local
  frontend-tests/           Playwright e validacoes de browser
  imports/lead-spreadsheet/ importacao e dry-run da Jornada do Lead
  remediation/              remediacao de backlog/worklist
docs/        produto, arquitetura, API, QA, desenvolvimento, integracoes e backlog
```

## Docs por autoridade

- `AGENTS.md`: regras gerais e roteamento.
- `README.md`: entrada humana e comandos principais.
- `docs/project-state.md`: estado atual commitado.
- `docs/tasks.md`: backlog e prioridade.
- `docs/product/*`: produto e contratos operacionais.
- `docs/api/*`, `docs/database/*`, `docs/backend/*`: contratos tecnicos.
- `docs/frontend/*` e `docs/web/*`: UX, componentes e dashboard.
- `docs/imports/*`: execucao e historico controlado de importacao.
- `docs/integrations/*`: integracoes externas e n8n.
- `docs/qa/*`: validacao e matriz de testes.
- `docs/development/*`: fluxo de trabalho, checklists e suporte tecnico.

## Onde adicionar novos arquivos

### Novo endpoint API

- route: `apps/api/src/routes`
- validation: `apps/api/src/validation`
- service: `apps/api/src/services`
- repository: `apps/api/src/repositories`
- docs: `docs/api/rest-api.md`

### Nova regra operacional de lead

- contrato: `docs/product/lead-operational-contract.md`
- normalizacao/importacao: `docs/product/lead-import-normalization.md`
- matriz: `docs/qa/lead-business-rules-test-matrix.md`
- implementacao: backend/service primeiro, nao frontend-only.

### Nova feature frontend

- tela/componente: `apps/web/src`
- primitivas: `apps/web/src/components/ui`
- docs: `docs/frontend/*` e `docs/web/dashboard.md`

Nao criar biblioteca paralela de componentes.

### Nova importacao

- scripts: `scripts/imports/<dominio>`
- docs: `docs/imports/*`
- contrato de regra: `docs/product/*` quando afetar comportamento.
- dados reais: apenas `.tmp/` ou Drive `dados-sensiveis`, nunca Git.

### Nova integracao

- API runtime: `apps/api/src/integrations/<provider>`
- worker runtime: `apps/worker/src/...`
- docs: `docs/integrations/*`
- ADR: `docs/decisions/*` se for decisao relevante.

### Novo worker job

- modulo: `apps/worker/src/jobs/<domain>`
- readme local se o dominio precisar de contexto.
- regra de negocio deve vir de contrato/documento superior, nao do readme local.

### Nova verificacao

- script: `scripts/verify/verify-*.ts`
- helper compartilhado: `scripts/test-support/*`
- docs: `docs/qa/verification-agent.md` ou `docs/development/testing-strategy.md`

## Politica de tamanho e divisao

- Alvo: manter arquivos de codigo abaixo de 250-300 linhas.
- Se passar disso, propor divisao por responsabilidade.
- Evitar arquivos genericos como `utils.ts` sem dominio claro.
- Migrations SQL podem ser maiores quando representam DDL versionado.

## Politica de escopo

- Mudancas pequenas e incrementais.
- Nao misturar feature com refatoracao ampla.
- Nao alterar schema/API/frontend/integracao sensivel sem escopo explicito.
- Se uma mudanca estrutural for necessaria, documentar proposta antes.
