# ADR 003 - Entrada WhatsApp via n8n

## Status

Aceita

## Contexto

A origem de mensagens WhatsApp pode variar e o payload bruto costuma mudar por provedor. Precisamos isolar essa variabilidade da API principal.

## Decisao

Padronizar entrada de mensagens WhatsApp no CRM via n8n, que envia payload normalizado para:

- `POST /api/webhooks/whatsapp/inbound`

A API nao conversa diretamente com WAHA nesta etapa.

## Razoes

- Reduz acoplamento da API com provedor externo.
- Permite iterar transformacoes no n8n sem redeploy da API.
- Facilita testes manuais de webhook no ambiente local.

## Riscos e Cuidados

- Mapeamentos incorretos no n8n causarem inconsistencias.
- Retries sem idempotencia duplicarem dados.

Cuidados:

- Contrato de payload documentado.
- Idempotencia por `provider + providerMessageId`.
- Uso da API key interna para proteger `/api/*`.
