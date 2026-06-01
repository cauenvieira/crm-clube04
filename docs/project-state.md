# Project State

Snapshot do estado tecnico local do CRM Clube04.

## Implementado

- Monorepo Node.js/TypeScript com:
  - `apps/api`
  - `apps/web`
  - `apps/worker`
  - `packages/shared`
- Docker local com `crm-api`, `crm-worker`, `postgres`, `redis`, `n8n`.
- API Fastify com `GET /health`.
- API key interna para `/api/*` via `x-crm-api-key`.
- Endpoints REST de contatos, leads, conversas, mensagens, interacoes CRM e action items.
- Webhook inbound WhatsApp normalizado (`POST /api/webhooks/whatsapp/inbound`).
- Dashboard React/Vite servido em `/dashboard`.
- Smoke e verifies operacionais com bateria sequencial (`npm run verify:all`).
- Workflow n8n versionado e importavel via CLI.
- Scripts de higiene de dados dev (cleanup/seed) para ambiente local.

## Parcialmente implementado

- Acao do Dia com geracao e ciclo de vida base; ainda sem camada completa de relatorio diario por canal.
- Fluxo operacional de leads importados com remediacao aplicada; padroes de importacao continuam em evolucao.
- Estrategia de integracoes externas definida; operacao real em producao ainda pendente.

## Nao implementado

- Integracao WAHA real em modo escuta/controlado.
- Sincronizacao Clube04 somente leitura em ciclo completo.
- Arquitetura completa da Jornada do Cliente (pos-conversao).
- Auth de usuario e trilha de auditoria de acesso para ambiente produtivo.
- Observabilidade completa (alertas, SLO, monitoramento de integracoes).

## Servicos e URLs locais

- API health: `http://localhost:3000/health`
- Dashboard: `http://localhost:3000/dashboard`
- n8n editor: `http://localhost:5678`

## Comandos base

- `npm run build`
- `npm run lint`
- `npm run verify:all`
- `npm run n8n:list:workflows`

## Proximo passo recomendado

Operacionalizar a trilha do lead ponta a ponta: registro de resultado de contato, fila diaria acionavel e consolidacao de relatorio diario para equipe.
