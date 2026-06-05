# REST API

## Papel na hierarquia

Este documento descreve o contrato REST atualmente documentado para o CRM Clube04.

Autoridade:
- Para formato de endpoints, payloads e respostas HTTP, este documento e a referencia de consulta.
- Para comportamento operacional da Jornada do Lead, prevalecem:
  - `docs/product/lead-operational-contract.md`
  - `docs/product/lead-import-normalization.md`
  - `docs/qa/lead-business-rules-test-matrix.md`
- Para schema, enums e compatibilidade de banco, consultar tambem `docs/database/schema.md`.

Este documento nao deve criar regra operacional por inferencia. Se o endpoint expor regra de lead, a regra deve estar protegida no contrato operacional e na matriz de testes.

## Base local

```powershell
$base = "http://localhost:3000"
$apiKey = (Get-Content .env | Where-Object { $_ -match '^CRM_API_SECRET=' }) -replace '^CRM_API_SECRET=', ''
```

## Autenticacao interna

Quando `CRM_API_SECRET` estiver definido no ambiente da API, todas as rotas `/api/*` exigem:

```text
x-crm-api-key: <valor de CRM_API_SECRET>
```

`GET /health` continua publico e nao precisa de header.

Decisao relacionada:
- `docs/decisions/004-api-key-before-auth.md`

## Indice de endpoints

### Publico

- `GET /health`

### CRM base

- `POST /api/contacts`
- `GET /api/contacts`
- `GET /api/contacts/:contactId`
- `PATCH /api/contacts/:contactId`
- `POST /api/leads`
- `GET /api/leads`
- `PATCH /api/leads/:leadId`
- `GET /api/leads/search`
- `GET /api/leads/export.csv`
- `POST /api/conversations`
- `GET /api/conversations`
- `GET /api/conversations/:conversationId/messages`
- `POST /api/messages`
- `GET /api/messages`
- `POST /api/crm-interactions`
- `GET /api/crm-interactions`

### Jornada do Lead operacional

- `GET /api/leads/:leadId/operational-context`
- `POST /api/leads/:leadId/contact-outcomes`
- `POST /api/manual-leads`

### Action items e operacao diaria

- `POST /api/action-items/generate`
- `GET /api/action-items`
- `POST /api/action-items/:actionItemId/complete`
- `POST /api/action-items/:actionItemId/cancel`
- `GET /api/operational-summary`
- `GET /api/operational-worklist`

### Dashboard dev/local

- `GET /dashboard`
- `GET /dashboard/app.js`
- `GET /dashboard/styles.css`

### Webhooks

- `POST /api/webhooks/whatsapp/inbound`

## Health

```powershell
curl.exe "$base/health"
```

## Contacts

### Criar contato

```powershell
curl.exe -X POST "$base/api/contacts" -H "Content-Type: application/json" -H "x-crm-api-key: $apiKey" -d "{\"name\":\"Tutor Teste\",\"phone\":\"(11) 99999-0001\",\"source\":\"manual\",\"type\":\"lead\"}"
```

Se outro contato for criado com o mesmo telefone normalizado, a API retorna `200` com o contato existente e `created: false`.

### Listar contatos

```powershell
curl.exe "$base/api/contacts" -H "x-crm-api-key: $apiKey"
```

### Buscar por id

```powershell
curl.exe "$base/api/contacts/CONTACT_ID" -H "x-crm-api-key: $apiKey"
```

### Atualizar contato

```powershell
curl.exe -X PATCH "$base/api/contacts/CONTACT_ID" -H "Content-Type: application/json" -H "x-crm-api-key: $apiKey" -d "{\"notes\":\"Contato prefere WhatsApp.\"}"
```

## Leads

### Criar lead com contato existente

```powershell
curl.exe -X POST "$base/api/leads" -H "Content-Type: application/json" -H "x-crm-api-key: $apiKey" -d "{\"contact_id\":\"CONTACT_ID\",\"pet_name\":\"Mel\",\"service_interest\":\"banho\",\"source\":\"manual\",\"status\":\"novo_lead\"}"
```

### Criar lead junto com contato

```powershell
curl.exe -X POST "$base/api/leads" -H "Content-Type: application/json" -H "x-crm-api-key: $apiKey" -d "{\"contact\":{\"name\":\"Lead Integrado\",\"phone\":\"11999990002\",\"source\":\"manual\"},\"pet_name\":\"Thor\",\"service_interest\":\"tosa\",\"source\":\"manual\",\"status\":\"novo_lead\"}"
```

### Listar leads com filtros

```powershell
curl.exe "$base/api/leads?status=novo_lead" -H "x-crm-api-key: $apiKey"
curl.exe "$base/api/leads?assigned_to=atendente1&source=manual" -H "x-crm-api-key: $apiKey"
```

### Atualizar lead

```powershell
curl.exe -X PATCH "$base/api/leads/LEAD_ID" -H "Content-Type: application/json" -H "x-crm-api-key: $apiKey" -d "{\"status\":\"em_atendimento\",\"next_action_at\":\"2026-06-01T12:00:00.000Z\"}"
```

## Busca operacional e exportacao de leads

### Busca operacional

Busca por telefone, tutor, doguinho, status e origem:

```powershell
curl.exe "$base/api/leads/search?phone=5511999999999&limit=10" -H "x-crm-api-key: $apiKey"
curl.exe "$base/api/leads/search?q=Maria&limit=10" -H "x-crm-api-key: $apiKey"
curl.exe "$base/api/leads/search?status=em_atendimento&source=manual_entry&limit=50" -H "x-crm-api-key: $apiKey"
```

Retorno minimo:

- `contact`
- `active_lead`, quando existir
- `latest_lead`, incluindo leads encerrados para busca/auditoria
- `open_action_items`, quando existir

### Exportacao CSV

```powershell
curl.exe "$base/api/leads/export.csv?status=em_atendimento&limit=1000" -H "x-crm-api-key: $apiKey" -o leads.csv
```

Regras documentadas:

- retorna `text/csv; charset=utf-8` com BOM UTF-8;
- usa `;` como separador;
- nome sugerido de arquivo: `leads-clube04-YYYY-MM-DD.csv`;
- campos: nome do tutor, telefone, telefone normalizado, origem, status, proxima acao, data proxima acao, data entrada, ultimo resultado, ultima observacao, tentativas, criado em, atualizado em.

A exportacao pode ser usada para conferencia operacional, mas arquivos CSV reais nao devem ser versionados.

## Lead Operational Cycle

### Contexto operacional do lead

```powershell
$leadId = "COLE_O_LEAD_ID"

Invoke-RestMethod `
  -Uri "$base/api/leads/$leadId/operational-context" `
  -Method Get `
  -Headers @{ "x-crm-api-key" = $apiKey }
```

Objetivo:
- retornar contexto suficiente para atendimento e acompanhamento;
- evitar que frontend reconstrua regra operacional por conta propria;
- apoiar drawer/tela de acompanhamento do lead.

### Registrar resultado de atendimento

```text
POST /api/leads/:leadId/contact-outcomes
```

Outcomes suportados:

- `continuar_atendimento`
- `agendamento_realizado`
- `sem_resposta`
- `cliente_convertido`
- `enviar_analise_lideranca`
- `perdido`
- `desqualificado`
- `nutricao_campanha`

Aliases legados aceitos por compatibilidade:

- `nao_respondeu` -> `sem_resposta`
- `chamar_depois` -> `continuar_atendimento`
- `agendou` -> `agendamento_realizado`
- `sem_interesse` -> `perdido`
- `dados_invalidos` -> `desqualificado`
- `escalar_lideranca` -> `enviar_analise_lideranca`
- `virou_cliente` -> `cliente_convertido`

### Exemplo `continuar_atendimento`

```powershell
$leadId = "COLE_O_LEAD_ID"
$actionItemId = "COLE_O_ACTION_ITEM_ID"

$body = @{
  actionItemId = $actionItemId
  outcome = "continuar_atendimento"
  channel = "whatsapp"
  nextActionAt = "2026-06-02"
  summary = "Retorno combinado para amanha"
  messageTemplateId = "follow_up"
  renderedMessage = "Oi, Tutor! Retomando nosso contato conforme combinado."
} | ConvertTo-Json

Invoke-RestMethod `
  -Uri "$base/api/leads/$leadId/contact-outcomes" `
  -Method Post `
  -Headers @{ "x-crm-api-key" = $apiKey } `
  -ContentType "application/json" `
  -Body $body
```

### Exemplo `perdido`

```powershell
$leadId = "COLE_O_LEAD_ID"
$actionItemId = "COLE_O_ACTION_ITEM_ID"

$body = @{
  actionItemId = $actionItemId
  outcome = "perdido"
  channel = "whatsapp"
  reason = "preco"
  summary = "Lead optou por nao seguir"
} | ConvertTo-Json

Invoke-RestMethod `
  -Uri "$base/api/leads/$leadId/contact-outcomes" `
  -Method Post `
  -Headers @{ "x-crm-api-key" = $apiKey } `
  -ContentType "application/json" `
  -Body $body
```

### Regras operacionais do endpoint

- `actionItemId`, quando enviado, deve pertencer ao mesmo `leadId`;
- cria `crm_interactions` com historico de outcome;
- conclui item atual e gera proxima `action_item` quando aplicavel;
- nao duplica `action_item` aberta para mesmo `lead + type + due_at`;
- outcomes de encerramento fecham fila aberta sem apagar historico;
- `sem_resposta` usa cadencia automatica de tentativa em timezone operacional `America/Sao_Paulo`;
- `cliente_convertido` usa status `compareceu`, por compatibilidade com o enum atual do banco;
- `nutricao_campanha` usa status `reativar_depois`, por compatibilidade com o enum atual do banco.

Observacao:
- As diferencas entre linguagem operacional e enum fisico do banco estao descritas em `docs/database/schema.md`.
- Mudanca nessa compatibilidade exige tarefa especifica de schema/API/regra.

## Manual Leads

Endpoint transacional para cadastro manual operacional:

```text
POST /api/manual-leads
```

Payload:

```json
{
  "tutorName": "Maria Manual",
  "phone": "11999990000",
  "entryMethod": "whatsapp",
  "attendant": "equipe",
  "entryDate": "2026-06-01",
  "nextAction": "fazer_follow_up",
  "nextActionAt": "2026-06-02",
  "petName": "Mel",
  "sourceDetail": "anuncio stories",
  "campaign": "meta_junho",
  "additionalNote": "Lead pediu retorno apos 18h",
  "initialNote": "Primeiro contato manual"
}
```

Exemplo PowerShell:

```powershell
$body = @{
  tutorName = "Maria Manual"
  phone = "11999990000"
  entryMethod = "whatsapp"
  attendant = "equipe"
  entryDate = "2026-06-01"
  nextAction = "fazer_follow_up"
  nextActionAt = "2026-06-02"
  petName = "Mel"
  sourceDetail = "anuncio stories"
  campaign = "meta_junho"
  additionalNote = "Lead pediu retorno apos 18h"
  initialNote = "Primeiro contato manual"
} | ConvertTo-Json

Invoke-RestMethod `
  -Uri "$base/api/manual-leads" `
  -Method Post `
  -Headers @{ "x-crm-api-key" = $apiKey } `
  -ContentType "application/json" `
  -Body $body
```

Resposta operacional:

- `contact_id`
- `lead_id`
- `action_item_id`
- `created` flags
- `linked` flags
- `duplicate.active_lead`
- `message`

Regras:

- normaliza telefone para formato Brasil (`55 + DDD + numero`);
- usa `entryDate` para preencher `leads.first_message_at` quando enviado;
- cria/vincula `contact` por `normalized_phone`;
- nao duplica lead ativo para o mesmo contato;
- registra `crm_interaction` inicial;
- cria `action_item` inicial sem duplicar aberto para `lead_id + type + due_at`.

## Conversations

### Criar conversa

```powershell
curl.exe -X POST "$base/api/conversations" -H "Content-Type: application/json" -H "x-crm-api-key: $apiKey" -d "{\"contact_id\":\"CONTACT_ID\",\"channel\":\"whatsapp\",\"provider\":\"manual\",\"provider_conversation_id\":\"conv-teste-001\"}"
```

### Listar conversas

```powershell
curl.exe "$base/api/conversations" -H "x-crm-api-key: $apiKey"
```

### Buscar mensagens da conversa

```powershell
curl.exe "$base/api/conversations/CONVERSATION_ID/messages" -H "x-crm-api-key: $apiKey"
```

## Messages

### Criar mensagem

```powershell
curl.exe -X POST "$base/api/messages" -H "Content-Type: application/json" -H "x-crm-api-key: $apiKey" -d "{\"conversation_id\":\"CONVERSATION_ID\",\"provider\":\"manual\",\"provider_message_id\":\"msg-teste-001\",\"direction\":\"inbound\",\"message_type\":\"text\",\"from_number\":\"11999990001\",\"to_number\":\"1140000000\",\"body\":\"Ola, quero banho para meu pet\",\"timestamp\":\"2026-05-31T12:00:00.000Z\",\"raw_payload\":{\"source\":\"manual-test\"}}"
```

Idempotencia:
- reenviar o mesmo `provider + provider_message_id` retorna `200` com a mensagem existente e `created: false`.

### Listar mensagens

```powershell
curl.exe "$base/api/messages" -H "x-crm-api-key: $apiKey"
```

## CRM Interactions

### Registrar interacao

```powershell
curl.exe -X POST "$base/api/crm-interactions" -H "Content-Type: application/json" -H "x-crm-api-key: $apiKey" -d "{\"contact_id\":\"CONTACT_ID\",\"lead_id\":\"LEAD_ID\",\"interaction_type\":\"whatsapp\",\"channel\":\"manual\",\"responsible\":\"equipe\",\"result\":\"respondeu\",\"notes\":\"Cliente pediu valores.\",\"next_action_at\":\"2026-06-01T13:00:00.000Z\",\"increment_attempts\":true}"
```

Quando `lead_id` for enviado, a API conclui automaticamente action_items abertos do lead para os tipos:

- `follow_up_lead`
- `follow_up_agendado`
- `lead_sem_interacao`

### Listar interacoes

```powershell
curl.exe "$base/api/crm-interactions?lead_id=LEAD_ID" -H "x-crm-api-key: $apiKey"
```

Observacao:
- Para o ciclo operacional atual da Jornada do Lead, preferir `POST /api/leads/:leadId/contact-outcomes` quando o objetivo for registrar resultado de atendimento com efeitos de ciclo de vida.

## Action Items

### Gerar Acao do Dia a partir de leads

```powershell
Invoke-RestMethod `
  -Uri "$base/api/action-items/generate" `
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

### Listar itens da Acao do Dia

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

### Obter `action_item_id` real antes de complete/cancel

```powershell
$leadId = "COLE_O_LEAD_ID_AQUI"

$pendingItems = Invoke-RestMethod `
  -Uri "$base/api/action-items?lead_id=$leadId&status=pendente&limit=100" `
  -Method Get `
  -Headers @{ "x-crm-api-key" = $apiKey }

if (-not $pendingItems.data -or $pendingItems.data.Count -eq 0) {
  throw "Nenhum action_item pendente encontrado para esse lead_id."
}

$actionItemId = $pendingItems.data[0].id
$actionItemId
```

### Concluir action item

```powershell
Invoke-RestMethod `
  -Uri "$base/api/action-items/$actionItemId/complete" `
  -Method Post `
  -Headers @{ "x-crm-api-key" = $apiKey } `
  -ContentType "application/json" `
  -Body "{}"
```

### Cancelar action item

Compatibilidade com schema atual: `cancel` usa status `ignorado`.

```powershell
Invoke-RestMethod `
  -Uri "$base/api/action-items/$actionItemId/cancel" `
  -Method Post `
  -Headers @{ "x-crm-api-key" = $apiKey } `
  -ContentType "application/json" `
  -Body "{}"
```

## Operational Summary

Endpoint somente leitura:

```text
GET /api/operational-summary
```

Exemplo:

```powershell
Invoke-RestMethod `
  -Uri "$base/api/operational-summary" `
  -Method Get `
  -Headers @{ "x-crm-api-key" = $apiKey }
```

Criterio usado para "hoje":

- timezone operacional: `America/Sao_Paulo`;
- `businessDate` representa a data local em Sao Paulo;
- `window.start` e `window.end` representam a janela do dia operacional em Sao Paulo, serializada em ISO UTC;
- `actionItems.concluidoHoje`: `status=concluido` com `completed_at` na janela;
- `actionItems.ignoradoHoje`: `status=ignorado` com `coalesce(completed_at, updated_at)` na janela;
- `messages.inboundHoje`: `direction=inbound` com `created_at` na janela.

## Operational Worklist

Endpoint somente leitura:

```text
GET /api/operational-worklist
```

Query params opcionais:

- `limit` (default `10`, max `50`)

Exemplo:

```powershell
Invoke-RestMethod `
  -Uri "$base/api/operational-worklist?limit=10" `
  -Method Get `
  -Headers @{ "x-crm-api-key" = $apiKey }
```

Buckets documentados:

- `actionItems.pendentes`
- `actionItems.vencidos`
- `actionItems.concluidosHoje`
- `actionItems.retomarAtendimento`
- `actionItems.followUpsAgendados`
- `actionItems.revisaoLideranca`
- `actionItems.novosLeads`
- `leads.followUpVencido`
- `leads.semProximaAcao`
- `leads.semInteracao24h`
- `messages.ultimasInbound`

Criterios de ordenacao:

- `actionItems.pendentes`: `priority desc`, `due_at asc nulls last`, `created_at asc`
- `actionItems.vencidos`: `due_at asc`, `priority desc`, `created_at asc`
- `actionItems.retomarAtendimento`: `due_at asc`, `priority desc`, `created_at asc`
- `actionItems.followUpsAgendados`: `due_at asc`, `priority desc`, `created_at asc`
- `actionItems.revisaoLideranca`: `due_at asc`, `priority desc`, `created_at asc`
- `actionItems.novosLeads`: `due_at asc`, `priority desc`, `created_at asc`
- `leads.followUpVencido`: `next_action_at asc`, `created_at asc`
- `leads.semInteracao24h`: `last_interaction_at asc nulls first`, `created_at asc`
- `messages.ultimasInbound`: `created_at desc`

## Dashboard dev/local

Painel web local/dev servido pela API:

- `GET /dashboard`

Assets servidos pela API:

- `GET /dashboard/app.js`
- `GET /dashboard/styles.css`

Observacoes:

- `/dashboard/app.js` e `/dashboard/styles.css` servem o bundle real de `apps/web/dist`;
- se o build do frontend nao existir, a API retorna erro explicito para evitar fallback enganoso;
- guia funcional: `docs/web/dashboard.md`.

Modelo atual documentado:

- Mesa Operacional em Kanban/lista;
- clique no card/linha abre acompanhamento do lead;
- atalho WhatsApp apenas abre a conversa pelo telefone;
- mensagem recomendada, templates e midias recomendadas ficam fora da UI nesta fase.

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

Decisao relacionada:
- `docs/decisions/003-whatsapp-through-n8n.md`

## Validacao automatica

Bateria completa recomendada antes de entrega/commit de mudancas gerais:

```powershell
npm run verify:all
```

Esse comando roda em sequencia build, lint, smoke da API, verifies operacionais, verify do dashboard e listagem do workflow n8n.

Para validar apenas o fluxo basico da API local:

```powershell
npm run smoke:api
```

Variaveis usadas:

```powershell
$env:API_BASE_URL = "http://localhost:3000"
$env:CRM_API_SECRET = "troque_por_um_valor_local_forte"
```

Se `CRM_API_SECRET` tambem estiver no `.env`, o script carrega esse valor automaticamente.

## Politica de manutencao

Atualizar este documento quando houver:

- endpoint novo, removido ou alterado;
- mudanca de payload, query param, status HTTP ou erro controlado;
- mudanca em auth/API key;
- mudanca em bucket do summary/worklist;
- mudanca em comportamento de webhook;
- mudanca em compatibilidade de enum operacional com enum fisico do banco.

Mudancas de Jornada do Lead devem atualizar tambem o contrato operacional e a matriz de testes quando alterarem regra de negocio.
