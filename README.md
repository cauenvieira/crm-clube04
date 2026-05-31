# Clube04 CRM

CRM operacional do Clube04 Mogi das Cruzes.

## Objetivo

Substituir controles manuais de leads, recorrencia, pacotes e follow-up por um sistema proprio integrado com n8n, WAHA e sincronizacao somente leitura do sistema Clube04.

## Estrutura

```text
apps/
  api/      API HTTP do CRM
  web/      interface web local/dev
  worker/   jobs de sincronizacao, classificacao e Acao do Dia
packages/
  shared/   utilitarios e tipos compartilhados
infra/
  db/             scripts executados pelo Docker na criacao do banco
  db/migrations/  migrations SQL versionadas
```

## Ambiente local

Requisitos:

- Docker Desktop
- Git
- Node.js LTS 20+

## Configuracao

Copie o arquivo de exemplo e ajuste apenas valores locais:

```bash
cp .env.example .env
```

Nao coloque credenciais reais no codigo. O arquivo `.env` deve ficar fora do Git.

Para proteger os endpoints internos, defina:

```bash
CRM_API_SECRET=troque_por_um_valor_local_forte
```

Quando `CRM_API_SECRET` estiver definido, todas as rotas `/api/*` exigem o header `x-crm-api-key`. A rota `/health` continua publica.

## Rodando dependencias locais

Suba PostgreSQL e Redis:

```bash
docker compose up -d postgres redis
```

Para subir tambem os containers da API e worker:

```bash
docker compose up -d
```

Para subir tambem o n8n local:

```bash
docker compose up -d n8n
```

## Rodando em desenvolvimento

Instale as dependencias:

```bash
npm install
```

Inicie a API local:

```bash
npm run dev
```

Verifique a saude da API:

```bash
curl http://localhost:3000/health
```

Resposta esperada:

```json
{
  "api": "ok",
  "postgres": "ok",
  "redis": "ok",
  "checkedAt": "2026-05-30T00:00:00.000Z"
}
```

Rode o health check do worker:

```bash
npm run worker
```

## Scripts

- `npm run dev`: inicia a API em modo desenvolvimento.
- `npm run build`: compila os workspaces TypeScript.
- `npm run start`: inicia a API compilada.
- `npm run worker`: executa o health check basico do worker.
- `npm run lint`: executa checagem TypeScript nos workspaces configurados.
- `npm run smoke:api`: executa um smoke test HTTP contra a API local.
- `npm run verify:action-items`: valida o ciclo de vida de action_items.
- `npm run verify:operational-summary`: valida o endpoint de resumo operacional.
- `npm run verify:operational-worklist`: valida o endpoint de worklist operacional.
- `npm run verify:dashboard`: valida o painel web local.
- `npm run verify:all`: executa a bateria completa recomendada antes de commit.
- `npm run dev:cleanup-test-data`: varredura dry-run de dados artificiais de teste.
- `npm run dev:cleanup-test-data:apply`: aplica limpeza segura de dados artificiais de teste.
- `npm run dev:seed-dashboard`: cria massa minima de demonstracao para dashboard local.

Observacao importante sobre validacao:

- Os scripts `smoke:api` e `verify:*` usam o mesmo banco local e devem rodar em sequencia.
- Nao execute esses scripts em paralelo, em jobs de background ou em terminais concorrentes.

## Banco de dados

O schema inicial fica em:

- `infra/db/migrations/001_initial_crm_schema.sql`

Em um banco novo, o Docker aplica a migration automaticamente ao criar o volume do PostgreSQL.
O arquivo `infra/db/001_apply_migrations.sql` fica na raiz montada em `/docker-entrypoint-initdb.d/`, que e o local executado pelo entrypoint oficial do Postgres. Ele chama a migration versionada em `infra/db/migrations`.

Para aplicar/verificar manualmente em um banco local ja existente:

```bash
docker compose exec -T postgres psql -U clube04 -d clube04_crm -f /docker-entrypoint-initdb.d/migrations/001_initial_crm_schema.sql
docker compose exec -T postgres psql -U clube04 -d clube04_crm -c "\dt"
```

A documentacao das tabelas esta em `docs/database/schema.md`.

## n8n local

- URL local do n8n: `http://localhost:5678`
- Fluxo minimo de teste inbound WhatsApp: `docs/integrations/n8n-whatsapp-inbound.md`
- Workflow importavel versionado: `infra/n8n/workflows/whatsapp-inbound-test.json`
- Guia de manutencao e atualizacao: `docs/integrations/n8n-maintenance.md`
- Guia MCP local: `docs/integrations/n8n-mcp.md`
- URL interna (dentro do n8n em Docker) para chamar a API:
  - `http://crm-api:3000/api/webhooks/whatsapp/inbound`
- Header obrigatorio no `HTTP Request`:
  - `x-crm-api-key: <valor de CRM_API_SECRET>`

### Importacao versionada de workflows n8n

Com ambiente local ativo:

```bash
docker compose up -d --build
npm run n8n:import:workflows
```

Depois:

1. Abrir `http://localhost:5678`
2. Verificar no editor se o workflow importado aparece
3. Opcional via CLI:

```bash
npm run n8n:list:workflows
```

### Atualizacao controlada do n8n

O projeto usa imagem oficial:

- `docker.n8n.io/n8nio/n8n`

Versao e fixada por variavel:

- `N8N_VERSION` no `.env` (com exemplo em `.env.example`)

Fluxo recomendado de update:

```bash
docker compose down
docker compose pull n8n
docker compose up -d --build
docker compose exec n8n n8n --version
```

## Organizacao de codigo

As regras de separacao entre routes, services, repositories, validation, plugins, jobs e integrations estao em `docs/architecture/code-organization.md`.
Guia de trabalho com prompts compactos no Codex: `docs/development/codex-workflow.md`.
Guia de higiene de dados locais (cleanup + seed): `docs/development/dev-data.md`.
Roadmap de produto da plataforma CRM: `docs/product/crm-platform-roadmap.md`.

## API REST

A documentacao dos endpoints esta em `docs/api/rest-api.md`.

Rotas principais desta etapa:

- `GET /health`
- `POST /api/contacts`
- `GET /api/contacts`
- `GET /api/contacts/:id`
- `PATCH /api/contacts/:id`
- `POST /api/leads`
- `GET /api/leads`
- `GET /api/leads/:id`
- `PATCH /api/leads/:id`
- `POST /api/conversations`
- `GET /api/conversations`
- `GET /api/conversations/:id`
- `POST /api/messages`
- `GET /api/messages`
- `GET /api/conversations/:id/messages`
- `POST /api/crm-interactions`
- `GET /api/crm-interactions`
- `GET /api/action-items`
- `POST /api/action-items/generate`
- `POST /api/action-items/:id/complete`
- `POST /api/action-items/:id/cancel`
- `GET /api/operational-summary`
- `GET /api/operational-worklist`
- `GET /dashboard`
- `POST /api/webhooks/whatsapp/inbound`

Painel web local:

- `http://localhost:3000/dashboard`

Exemplo rapido no PowerShell:

```powershell
$apiKey = (Get-Content .env | Where-Object { $_ -match '^CRM_API_SECRET=' }) -replace '^CRM_API_SECRET=', ''
curl.exe -H "x-crm-api-key: $apiKey" http://localhost:3000/api/leads?status=novo_lead
```

Exemplo webhook inbound no PowerShell:

```powershell
$apiKey = (Get-Content .env | Where-Object { $_ -match '^CRM_API_SECRET=' }) -replace '^CRM_API_SECRET=', ''

$payload = @{
  provider = "waha"
  providerMessageId = "msg_123"
  providerConversationId = "5511999999999"
  fromNumber = "5511999999999"
  toNumber = "5511470000000"
  contactName = "Maria"
  body = "Ola, gostaria de saber valores de banho"
  messageType = "text"
  direction = "inbound"
  timestamp = "2026-05-31T10:00:00.000Z"
  source = "whatsapp"
  campaign = "meta_ads_maio"
  rawPayload = @{}
} | ConvertTo-Json -Depth 5

Invoke-RestMethod `
  -Uri "http://localhost:3000/api/webhooks/whatsapp/inbound" `
  -Method Post `
  -Headers @{ "x-crm-api-key" = $apiKey } `
  -ContentType "application/json" `
  -Body $payload
```

## Validacao local

Com o Docker Compose rodando, a validacao recomendada antes de entrega/commit e:

```bash
npm run verify:all
```

Esse comando executa em sequencia build, lint, smoke da API, verifies operacionais, verify do dashboard e listagem do workflow n8n.

Para rodar apenas o smoke test HTTP contra a API local:

```bash
npm run smoke:api
```

Os scripts usam `API_BASE_URL` quando definido, com padrao `http://localhost:3000`. Se `CRM_API_SECRET` estiver definido no ambiente ou no `.env`, eles enviam o header `x-crm-api-key` nos endpoints `/api/*`.

## Escopo atual

Implementado:

- monorepo com `apps/api`, `apps/web`, `apps/worker` e `packages/shared`;
- Docker Compose com PostgreSQL, Redis, API, worker e n8n local;
- rota `GET /health` com verificacao real de PostgreSQL e Redis;
- endpoints base de contatos, leads, conversas, mensagens e interacoes CRM;
- webhook inbound normalizado para WhatsApp via n8n de teste;
- geracao de action_items da Acao do Dia;
- ciclo de vida de action_items: complete, cancel e fechamento automatico por crm_interaction;
- `GET /api/operational-summary`;
- `GET /api/operational-worklist`;
- painel web local/dev em `GET /dashboard`;
- verificacoes operacionais `verify:*` e bateria sequencial `verify:all`;
- workflow n8n versionado com ID estavel.

Ainda nao implementado:

- limpeza/seed controlado de dados de desenvolvimento;
- importacao da planilha manual atual;
- WAHA real em modo escuta;
- scraping somente leitura do sistema Clube04;
- relatorio diario para Google Chat, Teams, Telegram, e-mail ou outro canal;
- autenticacao real de usuario para painel;
- integracao com API oficial futura do sistema Clube04.
