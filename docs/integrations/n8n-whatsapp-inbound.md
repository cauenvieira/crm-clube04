# n8n WhatsApp Inbound (Local)

Este guia mostra o fluxo minimo para testar entrada de mensagem WhatsApp no CRM via n8n local, sem WAHA direto.

## Objetivo

Receber um webhook manual no n8n e encaminhar payload normalizado para:

`POST /api/webhooks/whatsapp/inbound`

## Servico n8n local

- URL do editor n8n local: `http://localhost:5678`
- Usuario e senha padrao local (se nao alterado no `.env`): `admin` / `admin_local_only`
- Imagem Docker oficial: `docker.n8n.io/n8nio/n8n`
- Versao local controlada por `N8N_VERSION` no `.env`

## URL da API dentro da rede Docker

No node `HTTP Request` do n8n, usar:

`http://crm-api:3000/api/webhooks/whatsapp/inbound`

Header obrigatorio:

- `x-crm-api-key: <valor de CRM_API_SECRET>`

## Workflow versionado no repositorio

Arquivo importavel:

- `infra/n8n/workflows/whatsapp-inbound-test.json`

Fluxo:

Webhook n8n -> payload normalizado -> HTTP Request CRM inbound

## Fluxo de importacao (recomendado via CLI)

Com os containers ativos:

```bash
npm run n8n:import:workflows
```

O comando usa o mount read-only da pasta versionada:

- host: `infra/n8n/workflows`
- container: `/workflows`

Comando equivalente:

```bash
docker compose exec -T n8n n8n import:workflow --separate --input=/workflows
```

Para listar workflows importados:

```bash
npm run n8n:list:workflows
```

## Como o payload e normalizado no workflow

O node `Set Normalized Payload` envia:

```json
{
  "provider": "waha",
  "providerMessageId": "{{$json.body.providerMessageId || $execution.id}}",
  "providerConversationId": "{{$json.body.fromNumber}}",
  "fromNumber": "{{$json.body.fromNumber}}",
  "toNumber": "5511470000000",
  "contactName": "{{$json.body.contactName}}",
  "body": "{{$json.body.body}}",
  "messageType": "text",
  "direction": "inbound",
  "timestamp": "{{$now.toISO()}}",
  "source": "whatsapp",
  "campaign": "n8n_manual_test",
  "rawPayload": "{{$json}}"
}
```

## Como configurar o header x-crm-api-key

No node `HTTP Request CRM Inbound`:

- URL: `http://crm-api:3000/api/webhooks/whatsapp/inbound`
- Header `Content-Type`: `application/json`
- Header `x-crm-api-key`: usar o segredo local

Opcao recomendada:

- Definir `CRM_API_SECRET` no ambiente do servico n8n e usar expressao:
  - `{{$env.CRM_API_SECRET}}`
- Em n8n `2.22.4`, para ambiente local, o compose define:
  - `N8N_BLOCK_ENV_ACCESS_IN_NODE=false`
  - Sem isso, o node pode falhar com `access to env vars denied`.

Opcao manual:

- Preencher o header no node com o mesmo valor de `CRM_API_SECRET` usado pela API.

Importante:

- Nao versionar segredo real no JSON do workflow.

## Teste manual rapido

No workflow importado:

1. Clique em `Execute workflow` para abrir o webhook de teste
2. Use a URL de teste no formato `http://localhost:5678/webhook-test/whatsapp-inbound-test`
3. Envie o payload abaixo

### Diferenca entre /webhook-test e /webhook

- `/webhook-test/...`: usado para teste manual no editor; exige clicar em `Execute workflow`.
- `/webhook/...`: usado com workflow ativo em execucao normal; nao depende do botao `Execute workflow`.

Payload de exemplo para chamar o webhook do n8n:

```json
{
  "fromNumber": "5511999999999",
  "contactName": "Maria Teste n8n",
  "body": "Ola, gostaria de saber valores de banho",
  "providerMessageId": "n8n_test_001"
}
```

Exemplo por `curl.exe` no host:

```powershell
curl.exe -X POST "http://localhost:5678/webhook-test/whatsapp-inbound-test" -H "Content-Type: application/json" -d "{\"fromNumber\":\"5511999999999\",\"contactName\":\"Maria Teste n8n\",\"body\":\"Ola, gostaria de saber valores de banho\",\"providerMessageId\":\"n8n_test_001\"}"
```

## Como verificar se o CRM recebeu lead/mensagem

1. Verificar saude da API:

```powershell
curl.exe "http://localhost:3000/health"
```

2. Listar leads:

```powershell
$apiKey = "troque_por_um_valor_local_forte"
curl.exe "http://localhost:3000/api/leads?source=whatsapp" -H "x-crm-api-key: $apiKey"
```

3. Listar mensagens:

```powershell
curl.exe "http://localhost:3000/api/messages" -H "x-crm-api-key: $apiKey"
```

4. Validar no retorno se a mensagem foi criada sem duplicacao ao reenviar mesmo `providerMessageId`.

## Uso de CRM_API_SECRET no n8n

Para nao hardcodar segredo:

- defina `CRM_API_SECRET` no `.env` usado pelo Docker Compose;
- no node HTTP Request, use `{{$env.CRM_API_SECRET}}` no header `x-crm-api-key`.

Validacao rapida do erro `access to env vars denied`:

1. Conferir no container:
   - `docker compose exec n8n printenv N8N_BLOCK_ENV_ACCESS_IN_NODE`
2. Valor esperado para local/dev:
   - `false`

Validacao rapida para `Bad request - please check your parameters` no HTTP Request:

1. Conferir no node `Set Normalized Payload` se `provider` esta como `waha`.
2. Confirmar que o body final inclui `providerMessageId`, `fromNumber`, `body`, `direction` e `timestamp`.
3. Confirmar que o HTTP Request envia `Content-Type: application/json` e body JSON (`={{ $json }}`).

## Observacoes

- Nesta etapa nao ha integracao direta com WAHA.
- Nesta etapa nao ha envio de WhatsApp.
- Nesta etapa nao ha IA.
- O endpoint do CRM ja cuida de idempotencia por `provider + providerMessageId`.
