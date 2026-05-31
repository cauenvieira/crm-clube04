# REST API

Base local:

```powershell
$base = "http://localhost:3000"
$apiKey = "troque_por_um_valor_local_forte"
```

## Autenticacao Interna

Quando `CRM_API_SECRET` estiver definido no ambiente da API, todas as rotas `/api/*` exigem:

```text
x-crm-api-key: <valor de CRM_API_SECRET>
```

`GET /health` continua publico e nao precisa de header.

## Health

```powershell
curl.exe "$base/health"
```

## Contacts

Criar contato:

```powershell
curl.exe -X POST "$base/api/contacts" -H "Content-Type: application/json" -d "{\"name\":\"Tutor Teste\",\"phone\":\"(11) 99999-0001\",\"source\":\"manual\",\"type\":\"lead\"}"
```

Com API key:

```powershell
curl.exe -X POST "$base/api/contacts" -H "Content-Type: application/json" -H "x-crm-api-key: $apiKey" -d "{\"name\":\"Tutor Teste\",\"phone\":\"(11) 99999-0001\",\"source\":\"manual\",\"type\":\"lead\"}"
```

Se outro contato for criado com o mesmo telefone normalizado, a API retorna `200` com o contato existente e `created: false`.

Listar contatos:

```powershell
curl.exe "$base/api/contacts" -H "x-crm-api-key: $apiKey"
```

Buscar por id:

```powershell
curl.exe "$base/api/contacts/CONTACT_ID" -H "x-crm-api-key: $apiKey"
```

Atualizar:

```powershell
curl.exe -X PATCH "$base/api/contacts/CONTACT_ID" -H "Content-Type: application/json" -H "x-crm-api-key: $apiKey" -d "{\"notes\":\"Contato prefere WhatsApp.\"}"
```

## Leads

Criar lead com contato existente:

```powershell
curl.exe -X POST "$base/api/leads" -H "Content-Type: application/json" -H "x-crm-api-key: $apiKey" -d "{\"contact_id\":\"CONTACT_ID\",\"pet_name\":\"Mel\",\"service_interest\":\"banho\",\"source\":\"manual\",\"status\":\"novo_lead\"}"
```

Criar lead junto com contato:

```powershell
curl.exe -X POST "$base/api/leads" -H "Content-Type: application/json" -H "x-crm-api-key: $apiKey" -d "{\"contact\":{\"name\":\"Lead Integrado\",\"phone\":\"11999990002\",\"source\":\"manual\"},\"pet_name\":\"Thor\",\"service_interest\":\"tosa\",\"source\":\"manual\",\"status\":\"novo_lead\"}"
```

Listar com filtros:

```powershell
curl.exe "$base/api/leads?status=novo_lead" -H "x-crm-api-key: $apiKey"
curl.exe "$base/api/leads?assigned_to=atendente1&source=manual" -H "x-crm-api-key: $apiKey"
```

Atualizar:

```powershell
curl.exe -X PATCH "$base/api/leads/LEAD_ID" -H "Content-Type: application/json" -H "x-crm-api-key: $apiKey" -d "{\"status\":\"em_atendimento\",\"next_action_at\":\"2026-06-01T12:00:00.000Z\"}"
```

## Conversations

Criar conversa:

```powershell
curl.exe -X POST "$base/api/conversations" -H "Content-Type: application/json" -H "x-crm-api-key: $apiKey" -d "{\"contact_id\":\"CONTACT_ID\",\"channel\":\"whatsapp\",\"provider\":\"manual\",\"provider_conversation_id\":\"conv-teste-001\"}"
```

Listar:

```powershell
curl.exe "$base/api/conversations" -H "x-crm-api-key: $apiKey"
```

Buscar mensagens da conversa:

```powershell
curl.exe "$base/api/conversations/CONVERSATION_ID/messages" -H "x-crm-api-key: $apiKey"
```

## Messages

Criar mensagem:

```powershell
curl.exe -X POST "$base/api/messages" -H "Content-Type: application/json" -H "x-crm-api-key: $apiKey" -d "{\"conversation_id\":\"CONVERSATION_ID\",\"provider\":\"manual\",\"provider_message_id\":\"msg-teste-001\",\"direction\":\"inbound\",\"message_type\":\"text\",\"from_number\":\"11999990001\",\"to_number\":\"1140000000\",\"body\":\"Ola, quero banho para meu pet\",\"timestamp\":\"2026-05-31T12:00:00.000Z\",\"raw_payload\":{\"source\":\"manual-test\"}}"
```

Idempotencia: reenviar o mesmo `provider + provider_message_id` retorna `200` com a mensagem existente e `created: false`.

Listar mensagens:

```powershell
curl.exe "$base/api/messages" -H "x-crm-api-key: $apiKey"
```

## CRM Interactions

Registrar interacao:

```powershell
curl.exe -X POST "$base/api/crm-interactions" -H "Content-Type: application/json" -H "x-crm-api-key: $apiKey" -d "{\"contact_id\":\"CONTACT_ID\",\"lead_id\":\"LEAD_ID\",\"interaction_type\":\"whatsapp\",\"channel\":\"manual\",\"responsible\":\"equipe\",\"result\":\"respondeu\",\"notes\":\"Cliente pediu valores.\",\"next_action_at\":\"2026-06-01T13:00:00.000Z\",\"increment_attempts\":true}"
```

Quando `lead_id` for enviado, a API conclui automaticamente action_items abertos do lead para os tipos:

- `follow_up_lead`
- `follow_up_agendado`
- `lead_sem_interacao`

Listar interacoes:

```powershell
curl.exe "$base/api/crm-interactions?lead_id=LEAD_ID" -H "x-crm-api-key: $apiKey"
```

## Action Items

Gerar Acao do Dia a partir de leads:

```powershell
$apiKey = (Get-Content .env | Where-Object { $_ -match '^CRM_API_SECRET=' }) -replace '^CRM_API_SECRET=', ''

Invoke-RestMethod `
  -Uri "http://localhost:3000/api/action-items/generate" `
  -Method Post `
  -Headers @{ "x-crm-api-key" = $apiKey } `
  -ContentType "application/json" `
  -Body "{}"
```

Resposta:

```json
{
  "created": 1,
  "skipped": 0,
  "items": []
}
```

Listar itens da Acao do Dia:

```powershell
curl.exe "$base/api/action-items" -H "x-crm-api-key: $apiKey"
```

Status validos de `action_items`:

- `pendente`
- `em_andamento`
- `concluido`
- `ignorado`
- `reagendado`

Filtros suportados:

```powershell
curl.exe "$base/api/action-items?status=pendente&type=follow_up_lead&priority=90" -H "x-crm-api-key: $apiKey"
curl.exe "$base/api/action-items?lead_id=LEAD_ID&type=follow_up_lead" -H "x-crm-api-key: $apiKey"
```

Como obter `action_item_id` real antes de `complete/cancel`:

```powershell
$apiKey = (Get-Content .env | Where-Object { $_ -match '^CRM_API_SECRET=' }) -replace '^CRM_API_SECRET=', ''
$leadId = "COLE_O_LEAD_ID_AQUI"

$pendingItems = Invoke-RestMethod `
  -Uri "http://localhost:3000/api/action-items?lead_id=$leadId&status=pendente&limit=100" `
  -Method Get `
  -Headers @{ "x-crm-api-key" = $apiKey }

if (-not $pendingItems.data -or $pendingItems.data.Count -eq 0) {
  throw "Nenhum action_item pendente encontrado para esse lead_id."
}

$actionItemId = $pendingItems.data[0].id
$actionItemId
```

Concluir action item:

```powershell
$apiKey = (Get-Content .env | Where-Object { $_ -match '^CRM_API_SECRET=' }) -replace '^CRM_API_SECRET=', ''

Invoke-RestMethod `
  -Uri "http://localhost:3000/api/action-items/$actionItemId/complete" `
  -Method Post `
  -Headers @{ "x-crm-api-key" = $apiKey } `
  -ContentType "application/json" `
  -Body "{}"
```

Cancelar action item (compatibilidade com schema atual: `cancel` usa status `ignorado`):

```powershell
$apiKey = (Get-Content .env | Where-Object { $_ -match '^CRM_API_SECRET=' }) -replace '^CRM_API_SECRET=', ''

Invoke-RestMethod `
  -Uri "http://localhost:3000/api/action-items/$actionItemId/cancel" `
  -Method Post `
  -Headers @{ "x-crm-api-key" = $apiKey } `
  -ContentType "application/json" `
  -Body "{}"
```

## Webhook WhatsApp Inbound

Endpoint:

```text
POST /api/webhooks/whatsapp/inbound
```

Objetivo:

- receber mensagem inbound ja normalizada pelo n8n;
- encontrar ou criar contato por telefone normalizado;
- encontrar ou criar conversa por `provider + providerConversationId`;
- criar mensagem com idempotencia por `provider + providerMessageId`;
- criar lead com status `novo_lead` apenas quando nao houver lead ativo para o contato.

Exemplo:

```powershell
curl.exe -X POST "$base/api/webhooks/whatsapp/inbound" -H "Content-Type: application/json" -H "x-crm-api-key: $apiKey" -d "{\"provider\":\"waha\",\"providerMessageId\":\"msg_123\",\"providerConversationId\":\"5511999999999\",\"fromNumber\":\"5511999999999\",\"toNumber\":\"5511470000000\",\"contactName\":\"Maria\",\"body\":\"Ola, gostaria de saber valores de banho\",\"messageType\":\"text\",\"direction\":\"inbound\",\"timestamp\":\"2026-05-31T10:00:00.000Z\",\"source\":\"whatsapp\",\"campaign\":\"meta_ads_maio\",\"rawPayload\":{}}"
```

Resposta inclui:

- `contact`
- `conversation`
- `message`
- `lead`
- `created` com flags de `contact`, `conversation`, `message` e `lead`

## Smoke Test

Para validar automaticamente o fluxo basico da API local:

```powershell
npm run smoke:api
```

Variaveis usadas:

```powershell
$env:API_BASE_URL = "http://localhost:3000"
$env:CRM_API_SECRET = "troque_por_um_valor_local_forte"
```

Se `CRM_API_SECRET` tambem estiver no `.env`, o script carrega esse valor automaticamente.
