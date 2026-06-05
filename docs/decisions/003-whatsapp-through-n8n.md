# ADR 003 - Entrada WhatsApp via n8n

## Status

Aceita.

## Contexto

A origem de mensagens WhatsApp pode variar e o payload bruto costuma mudar por provedor. A operacao do Clube04 recebe leads e atendimentos principalmente via WhatsApp, mas o CRM nao deve ficar acoplado a um provider especifico nesta fase.

## Decisao

Padronizar entrada de mensagens WhatsApp no CRM via n8n.

Fluxo atual desejado:

1. Provider/canal envia evento inbound.
2. n8n normaliza o payload.
3. n8n chama `POST /api/webhooks/whatsapp/inbound`.
4. API aplica idempotencia e atualiza contato, conversa, mensagem e lead quando aplicavel.

A API nao conversa diretamente com WAHA nesta etapa.

## Razoes

- Reduz acoplamento da API com provedor externo.
- Permite iterar transformacoes no n8n sem redeploy da API.
- Facilita testes manuais de webhook no ambiente local.
- Mantem a API com contrato normalizado.
- Preserva caminho para trocar WAHA/BSP/Z-API futuramente.

## Consequencias

- Contrato de payload normalizado deve estar em `docs/api/rest-api.md` e docs de integracao.
- n8n deve ser tratado como orquestrador/adaptador, nao como fonte de regra de negocio.
- Regras de lead continuam no backend.
- Workflows oficiais devem ser versionados.

## Riscos e cuidados

Riscos:
- mapeamentos incorretos no n8n causarem inconsistencias;
- retries sem idempotencia duplicarem dados;
- segredo/API key exposto em workflow;
- automacao real responder cliente sem governanca.

Cuidados:
- idempotencia por `provider + providerMessageId`;
- uso da API key interna para proteger `/api/*`;
- nao versionar credenciais;
- iniciar WhatsApp real em modo escuta/controlado;
- validar com smoke/verify antes de evoluir automacoes.

## Docs relacionados

- `docs/api/rest-api.md`
- `docs/integrations/n8n-whatsapp-inbound.md`
- `docs/integrations/n8n-maintenance.md`
- `docs/development/checklists/integration.md`
