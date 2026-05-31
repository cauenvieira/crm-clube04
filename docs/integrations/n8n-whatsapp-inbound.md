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

## Workflow minimo (manual)

1. Criar node `Webhook`
2. Criar node `Set` (ou `Edit Fields`) para normalizar payload
3. Criar node `HTTP Request` para chamar a API do CRM

### 1) Node Webhook

- Method: `POST`
- Path: `whatsapp-inbound-test`
- Response: `Last node`

### 2) Node Set/Edit Fields

Mapear para o formato esperado pelo endpoint:

```json
{
  "provider": "waha",
  "providerMessageId": "msg_123",
  "providerConversationId": "5511999999999",
  "fromNumber": "5511999999999",
  "toNumber": "5511470000000",
  "contactName": "Maria",
  "body": "Ola, gostaria de saber valores de banho",
  "messageType": "text",
  "direction": "inbound",
  "timestamp": "2026-05-31T10:00:00.000Z",
  "source": "whatsapp",
  "campaign": "meta_ads_maio",
  "rawPayload": {}
}
```

### 3) Node HTTP Request

- Method: `POST`
- URL: `http://crm-api:3000/api/webhooks/whatsapp/inbound`
- Send Body: `JSON`
- Body: usar o output do node anterior
- Headers:
  - `Content-Type: application/json`
  - `x-crm-api-key: <valor de CRM_API_SECRET>`

## Teste manual rapido

Com workflow ativo, chamar o webhook de teste do n8n (URL gerada pelo node Webhook).

Exemplo por `curl.exe` no host:

```powershell
curl.exe -X POST "http://localhost:5678/webhook-test/whatsapp-inbound-test" -H "Content-Type: application/json" -d "{\"provider\":\"waha\",\"providerMessageId\":\"msg_123\",\"providerConversationId\":\"5511999999999\",\"fromNumber\":\"5511999999999\",\"toNumber\":\"5511470000000\",\"contactName\":\"Maria\",\"body\":\"Ola, gostaria de saber valores de banho\",\"messageType\":\"text\",\"direction\":\"inbound\",\"timestamp\":\"2026-05-31T10:00:00.000Z\",\"source\":\"whatsapp\",\"campaign\":\"meta_ads_maio\",\"rawPayload\":{}}"
```

## Observacoes

- Nesta etapa nao ha integracao direta com WAHA.
- Nesta etapa nao ha envio de WhatsApp.
- Nesta etapa nao ha IA.
- O endpoint do CRM ja cuida de idempotencia por `provider + providerMessageId`.
