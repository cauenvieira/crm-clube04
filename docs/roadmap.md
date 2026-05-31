# Roadmap Tecnico - Clube04 CRM

## Objetivo

Evoluir o CRM operacional do Clube04 em fases pequenas, mantendo ambiente local estavel e arquitetura modular.

## Fases

### Fase 0 - Fundacao Tecnica (Concluida)

Status: concluida

Entregas:

- Monorepo com `apps/api`, `apps/web`, `apps/worker` e `packages/shared`.
- Docker Compose com `postgres`, `redis`, `crm-api`, `crm-worker`.
- Migrations SQL versionadas com bootstrap em banco limpo.
- Endpoint `GET /health` com verificacao real de API, PostgreSQL e Redis.

### Fase 1 - API REST Base e Seguranca Interna (Concluida)

Status: concluida

Entregas:

- Endpoints REST base para `contacts`, `leads`, `conversations`, `messages`, `crm-interactions` e `action-items`.
- Idempotencia de mensagens por `provider + provider_message_id`.
- Protecao de `/api/*` por API key (`x-crm-api-key`) quando `CRM_API_SECRET` estiver definido.
- Smoke test automatizado (`npm run smoke:api`).

### Fase 2 - Entrada WhatsApp via Webhook Normalizado (Concluida)

Status: concluida

Entregas:

- Endpoint `POST /api/webhooks/whatsapp/inbound`.
- Fluxo de negocio: contato/conversa/mensagem/lead com idempotencia e atualizacoes correlatas.

### Fase 3 - Integracao n8n Local Minima (Concluida)

Status: concluida

Entregas:

- Servico `n8n` no `docker-compose.yml`.
- Documentacao de fluxo minimo de teste inbound.
- Uso de rede interna Docker para chamar a API (`http://crm-api:3000/...`).

### Fase 4 - Integracao WAHA via n8n (Proxima)

Status: planejada

Escopo:

- Receber eventos WAHA no n8n e normalizar payload para o webhook inbound do CRM.
- Tratar retry, idempotencia e observabilidade basica de fluxos.

### Fase 5 - Sincronizacao Clube04 (Leitura) (Proxima)

Status: planejada

Escopo:

- Carga inicial controlada.
- Sincronizacao incremental com `sync_state`.
- Persistencia em tabelas de importacao sem alterar sistema origem.

### Fase 6 - Motor CRM e Acao do Dia (Proxima)

Status: planejada

Escopo:

- Regras de classificacao por faixa de recorrencia e pacote.
- Geracao de `action_items` com prioridades operacionais.

### Fase 7 - Interface Web Operacional (Proxima)

Status: planejada

Escopo:

- Tela de operacao focada em Acao do Dia.
- Filtros por status, atraso, retorno previsto e risco de pacote.

## Riscos e Cuidados

- Crescimento de arquivos/servicos sem modularizacao.
- Acoplamento prematuro com sistemas externos.
- Perda de idempotencia em fluxos de mensagens.
- Falhas de configuracao de segredos entre host e Docker.
- Mudancas grandes sem validacao incremental.

## Comandos Principais de Validacao

```bash
npm run build
npm run lint
npm run smoke:api
docker compose up -d --build
curl.exe http://localhost:3000/health
```
