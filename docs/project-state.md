# Project State - Clube04 CRM

## Visao geral

O projeto CRM Clube04 esta operacional em ambiente local para a base de atendimento, follow-up e painel operacional.

O ambiente atual suporta:

- API CRM em Node.js + TypeScript + Fastify;
- PostgreSQL com schema inicial aplicado;
- Redis para suporte operacional;
- worker com health check e base para jobs futuros;
- n8n local com workflow versionado de teste inbound;
- webhook inbound normalizado para WhatsApp via n8n;
- protecao de `/api/*` por `x-crm-api-key`;
- action_items da Acao do Dia com geracao e ciclo de vida;
- resumo operacional;
- worklist operacional;
- dashboard local/dev servido pela API.

## Stack atual

- Node.js 20+
- TypeScript
- Fastify
- PostgreSQL
- Redis
- Docker Compose
- n8n local
- React + Vite + TypeScript para dashboard local/dev

## Servicos Docker locais

- `crm-api`
- `crm-worker`
- `postgres`
- `redis`
- `n8n`

## URLs locais

- API health: `http://localhost:3000/health`
- Dashboard local/dev: `http://localhost:3000/dashboard`
- n8n editor: `http://localhost:5678`
- Webhook teste n8n: `http://localhost:5678/webhook-test/whatsapp-inbound-test`
- URL interna Docker n8n -> API:
  - `http://crm-api:3000/api/webhooks/whatsapp/inbound`

## Scripts npm principais

- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run worker`
- `npm run smoke:api`
- `npm run verify:action-items`
- `npm run verify:operational-summary`
- `npm run verify:operational-worklist`
- `npm run verify:dashboard`
- `npm run verify:frontend`
- `npm run verify:data-cleanliness`
- `npm run verify:all`
- `npm run n8n:import:workflows`
- `npm run n8n:list:workflows`

Regra atual:

- `npm run verify:all` e a bateria recomendada antes de entrega/commit.
- `smoke:api` e `verify:*` devem rodar em sequencia, nunca em paralelo, porque usam o mesmo banco local.
- scripts de verify/smoke usam `runId` e cleanup automatico para reduzir residuos.

## Workflow n8n oficial

- Nome: `whatsapp-inbound-test`
- Arquivo versionado: `infra/n8n/workflows/whatsapp-inbound-test.json`
- ID oficial estavel: `52RxSSXMQ4Zaitnw`

Regra importante:

- import no n8n sobrescreve por `id`, nao por `name`.
- nao remover nem trocar o `id` do JSON versionado sem justificativa.

## Endpoints principais implementados

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
- `POST /api/manual-leads`
- `GET /api/leads/search`
- `GET /dashboard`
- `POST /api/webhooks/whatsapp/inbound`

## Status de validacao atual

Ultima bateria conhecida:

- `npm run build`: OK
- `npm run lint`: OK
- `npm run smoke:api`: `22/22` OK
- `npm run verify:action-items`: `8/8` OK
- `npm run verify:operational-summary`: `6/6` OK
- `npm run verify:operational-worklist`: `5/5` OK
- `npm run verify:dashboard`: OK
- `npm run verify:frontend`: OK
- `npm run verify:data-cleanliness`: OK
- `npm run n8n:list:workflows`: `52RxSSXMQ4Zaitnw|whatsapp-inbound-test`

## Commits recentes relevantes

- `6cfe9f2 feat: add local operations dashboard`
- `278ca59 feat: add operational worklist endpoint`
- `cbe75ef feat: add operational summary endpoint`
- `b4e5c1d feat: manage action item lifecycle`
- `7bc1466 feat: generate action items for daily CRM follow-up`

## Implementado nesta fase

- base API/banco/worker;
- n8n local com workflow inbound de teste;
- idempotencia de mensagens inbound;
- criacao de lead a partir de mensagem inbound;
- action_items da Acao do Dia;
- complete/cancel de action_items;
- fechamento automatico de follow-up por crm_interaction;
- resumo operacional com timezone `America/Sao_Paulo`;
- worklist operacional;
- dashboard local/dev em React/Vite;
- entrada manual de lead com dedupe de lead ativo;
- processo de validacao sequencial;
- validacao visual com browser tooling e fallback estrutural;
- disciplina de tokens para prompts e relatorios.
- remediacao operacional da importacao Jornada do Lead aplicada no banco local:
  - `convertido_cliente` por Pessoa.csv: 277
  - `retomar_atendimento`: 1407
  - `fazer_follow_up`: 33
  - `revisar_lideranca`: 32
  - `validar_conversao` removido da fila principal de importados (itens legados mantidos como `ignorado`)

## Ainda nao implementado

- limpeza/seed controlado de dados de desenvolvimento;
- importacao da planilha manual atual;
- WAHA real em modo escuta;
- scraping somente leitura do sistema Clube04;
- relatorio diario para Google Chat, Teams, Telegram, e-mail ou outro canal;
- autenticacao real de usuario para painel;
- integracao com API oficial futura do sistema Clube04;
- backup/restore operacional;
- observabilidade/alertas de falha em jobs e integracoes.

## Proximos passos recomendados

1. Incluir entrada manual de lead para reduzir dependencia da planilha no dia a dia.
2. Criar relatorio diario baseado em operational-summary/worklist.
3. Iniciar trilha de follow-up da Jornada do Cliente para os convertidos.
4. Testar WhatsApp em modo escuta com numero separado.
5. Mapear telas/relatorios do sistema Clube04 para scraping somente leitura.
6. Preparar adaptadores para futura API oficial do sistema Clube04.
7. Evoluir UX do dashboard com filtros operacionais e atalho de acao por bloco.

## Riscos e cuidados

- dados de teste acumulados podem poluir dashboard e metricas locais;
- scripts `smoke:api` e `verify:*` concorrentes podem gerar falso negativo;
- API key em `localStorage` e aceitavel apenas para dev local, nao para uso real pela equipe;
- dashboard ainda nao tem autenticacao real de usuario;
- WAHA real deve ser testado primeiro com numero separado para reduzir risco de bloqueio;
- scraping do sistema Clube04 deve ser somente leitura;
- workflows n8n duplicam se o `id` versionado for alterado indevidamente;
- segredos nunca devem ser commitados.
