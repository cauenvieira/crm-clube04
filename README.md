# Clube04 CRM

CRM operacional local para atendimento, follow-up e fila de trabalho do Clube04 Mogi.

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
- `npm run n8n:list:workflows`
- `npm run dev:cleanup-test-data`
- `npm run dev:cleanup-test-data:apply`
- `npm run dev:seed-dashboard`

## Regras operacionais

- Rodar `verify:all` em sequencia antes de commit.
- Nao executar smoke/verify em paralelo no mesmo banco local.
- Nao versionar `.env`, dados reais, exports locais ou arquivos em `.tmp/`.

## Documentacao

- Estado atual: `docs/project-state.md`
- API: `docs/api/rest-api.md`
- Dashboard: `docs/web/dashboard.md`
- Arquitetura e organizacao: `docs/architecture/code-organization.md`
- Estrutura do repo: `docs/development/repo-structure.md`
- Estrategia de testes: `docs/development/testing-strategy.md`
- Workflow de trabalho no Codex: `docs/development/codex-workflow.md`
- Instrucoes curtas para Codex: `docs/development/codex-custom-instructions.md`
- Higiene de dados de dev: `docs/development/dev-data.md`
- Roadmap: `docs/roadmap.md`
- Backlog: `docs/tasks.md`
- Integracao n8n inbound: `docs/integrations/n8n-whatsapp-inbound.md`
