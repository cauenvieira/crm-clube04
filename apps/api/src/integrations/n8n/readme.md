# Integracao n8n

## Objetivo

Reservar o modulo local de integracao com n8n para contratos e clientes futuros.

Nesta etapa, a entrada n8n -> CRM ja existe como webhook HTTP na API, documentado em:

- `docs/integrations/n8n-whatsapp-inbound.md`
- `docs/api/rest-api.md`

Este diretorio nao deve virar fonte paralela de regra operacional.

## Status atual

- Nao ha client interno para chamar API do n8n.
- O workflow oficial fica em `infra/n8n/workflows/whatsapp-inbound-test.json`.
- O n8n chama a API CRM via `POST /api/webhooks/whatsapp/inbound`.
- Git continua sendo a fonte de verdade do workflow versionado.

## Regras

- Nao salvar token n8n no codigo.
- Nao versionar credenciais exportadas do n8n.
- Nao criar automacao real sem ADR/tarefa propria.
- Nao acoplar regra de lead em workflow quando deve estar no backend.
- Workflow deve normalizar payload e delegar regra operacional para a API.

## Quando criar codigo aqui

Somente quando houver necessidade clara de:

- consultar n8n pela API;
- listar workflows por codigo;
- validar estado de automacoes;
- acionar import/export controlado;
- integrar observabilidade.

Se for apenas webhook inbound, manter contrato em routes/services da API e workflow versionado em `infra/n8n/workflows`.

## Validacao esperada

- `npm run build`
- `npm run lint`
- `npm run n8n:list:workflows`, quando envolver workflow
- `npm run smoke:api`, quando envolver webhook CRM
