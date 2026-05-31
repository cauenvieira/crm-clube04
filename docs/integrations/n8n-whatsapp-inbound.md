# n8n WhatsApp Inbound (Local)

Este guia mostra o fluxo minimo para testar entrada de mensagem WhatsApp no CRM via n8n local, sem WAHA direto.

## Objetivo

Receber um webhook manual no n8n e encaminhar payload normalizado para:

`POST /api/webhooks/whatsapp/inbound`

## Servico n8n local

- URL do editor n8n local: `http://localhost:5678`
- Usuario e senha padrao local (se nao alterado no `.env`): `admin` / `admin_local_only`

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

## Como importar o workflow no n8n

1. Abrir `http://localhost:5678`
2. Entrar no editor do n8n
3. Clicar em `Import from File`
4. Selecionar `infra/n8n/workflows/whatsapp-inbound-test.json`
5. Salvar o workflow importado

## Como o payload e normalizado no workflow

O node `Set Normalized Payload` envia:

```json
{
  "provider": "n8n-test",
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

Opcao manual:

- Preencher o header no node com o mesmo valor de `CRM_API_SECRET` usado pela API.

Importante:

- Nao versionar segredo real no JSON do workflow.

## Teste manual rapido

No workflow importado:

1. Clique em `Execute workflow` para abrir o webhook de teste
2. Use a URL de teste no formato `http://localhost:5678/webhook-test/whatsapp-inbound-test`
3. Envie o payload abaixo

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

## Observacoes

- Nesta etapa nao ha integracao direta com WAHA.
- Nesta etapa nao ha envio de WhatsApp.
- Nesta etapa nao ha IA.
- O endpoint do CRM ja cuida de idempotencia por `provider + providerMessageId`.
