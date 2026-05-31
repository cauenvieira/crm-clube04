# Project State - Clube04 CRM

## Visao geral

O projeto CRM Clube04 esta operacional em ambiente local para fluxo inbound de WhatsApp via n8n, com persistencia no PostgreSQL e suporte a Redis.

Escopo atual:

- API CRM em Node.js + TypeScript + Fastify;
- banco PostgreSQL com schema inicial validado;
- Redis para suporte operacional;
- worker com health check e base para jobs futuros;
- n8n local com workflow versionado de teste inbound;
- protecao de `/api/*` por `x-crm-api-key`.

## Stack atual

- Node.js 20+
- TypeScript
- Fastify
- PostgreSQL
- Redis
- Docker Compose
- n8n (local)

## Servicos Docker (local)

- `crm-api`
- `crm-worker`
- `postgres`
- `redis`
- `n8n`

## URLs locais

- API health: `http://localhost:3000/health`
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
- `npm run n8n:import:workflows`
- `npm run n8n:list:workflows`

## Workflow n8n oficial

- Nome: `whatsapp-inbound-test`
- Arquivo versionado: `infra/n8n/workflows/whatsapp-inbound-test.json`
- ID oficial estavel: `52RxSSXMQ4Zaitnw`

Regra importante:

- import no n8n sobrescreve por `id`, nao por `name`.

## Status atual

- API local funcional;
- `/health` publico e OK;
- endpoints `/api/*` protegidos por API key quando `CRM_API_SECRET` esta definido;
- fluxo manual PowerShell -> n8n -> CRM API -> PostgreSQL validado;
- smoke test atual: `13/13` testes OK;
- workflow oficial com ID estavel definido e importavel.

## Proximos passos recomendados

1. manter somente workflows versionados para fluxo oficial.
2. adicionar rotina de limpeza de duplicados n8n no checklist operacional.
3. iniciar camada de testes de integracao para webhook inbound (cenario de erro e idempotencia).
4. preparar proxima etapa de integracao com WAHA real mantendo isolamento de segredos.
5. definir politica de promotion local -> VPS (backup, restore e versionamento de ambiente).

## Riscos e cuidados

- duplicidade de workflow no n8n ao trocar/remover `id` do JSON;
- uso de segredos em texto plano em workflow manual;
- reset de volume n8n sem reimport de workflows versionados;
- divergencia entre workflow editado na UI e arquivo no Git;
- execucao de testes sem `CRM_API_SECRET` alinhado entre API e n8n.
