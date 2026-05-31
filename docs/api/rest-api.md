# REST API

Base local:

```powershell
$base = "http://localhost:3000"
```

## Health

```powershell
curl.exe "$base/health"
```

## Contacts

Criar contato:

```powershell
curl.exe -X POST "$base/api/contacts" -H "Content-Type: application/json" -d "{\"name\":\"Tutor Teste\",\"phone\":\"(11) 99999-0001\",\"source\":\"manual\",\"type\":\"lead\"}"
```

Se outro contato for criado com o mesmo telefone normalizado, a API retorna `200` com o contato existente e `created: false`.

Listar contatos:

```powershell
curl.exe "$base/api/contacts"
```

Buscar por id:

```powershell
curl.exe "$base/api/contacts/CONTACT_ID"
```

Atualizar:

```powershell
curl.exe -X PATCH "$base/api/contacts/CONTACT_ID" -H "Content-Type: application/json" -d "{\"notes\":\"Contato prefere WhatsApp.\"}"
```

## Leads

Criar lead com contato existente:

```powershell
curl.exe -X POST "$base/api/leads" -H "Content-Type: application/json" -d "{\"contact_id\":\"CONTACT_ID\",\"pet_name\":\"Mel\",\"service_interest\":\"banho\",\"source\":\"manual\",\"status\":\"novo_lead\"}"
```

Criar lead junto com contato:

```powershell
curl.exe -X POST "$base/api/leads" -H "Content-Type: application/json" -d "{\"contact\":{\"name\":\"Lead Integrado\",\"phone\":\"11999990002\",\"source\":\"manual\"},\"pet_name\":\"Thor\",\"service_interest\":\"tosa\",\"source\":\"manual\",\"status\":\"novo_lead\"}"
```

Listar com filtros:

```powershell
curl.exe "$base/api/leads?status=novo_lead"
curl.exe "$base/api/leads?assigned_to=atendente1&source=manual"
```

Atualizar:

```powershell
curl.exe -X PATCH "$base/api/leads/LEAD_ID" -H "Content-Type: application/json" -d "{\"status\":\"em_atendimento\",\"next_action_at\":\"2026-06-01T12:00:00.000Z\"}"
```

## Conversations

Criar conversa:

```powershell
curl.exe -X POST "$base/api/conversations" -H "Content-Type: application/json" -d "{\"contact_id\":\"CONTACT_ID\",\"channel\":\"whatsapp\",\"provider\":\"manual\",\"provider_conversation_id\":\"conv-teste-001\"}"
```

Listar:

```powershell
curl.exe "$base/api/conversations"
```

Buscar mensagens da conversa:

```powershell
curl.exe "$base/api/conversations/CONVERSATION_ID/messages"
```

## Messages

Criar mensagem:

```powershell
curl.exe -X POST "$base/api/messages" -H "Content-Type: application/json" -d "{\"conversation_id\":\"CONVERSATION_ID\",\"provider\":\"manual\",\"provider_message_id\":\"msg-teste-001\",\"direction\":\"inbound\",\"message_type\":\"text\",\"from_number\":\"11999990001\",\"to_number\":\"1140000000\",\"body\":\"Ola, quero banho para meu pet\",\"timestamp\":\"2026-05-31T12:00:00.000Z\",\"raw_payload\":{\"source\":\"manual-test\"}}"
```

Idempotencia: reenviar o mesmo `provider + provider_message_id` retorna `200` com a mensagem existente e `created: false`.

Listar mensagens:

```powershell
curl.exe "$base/api/messages"
```

## CRM Interactions

Registrar interacao:

```powershell
curl.exe -X POST "$base/api/crm-interactions" -H "Content-Type: application/json" -d "{\"contact_id\":\"CONTACT_ID\",\"lead_id\":\"LEAD_ID\",\"interaction_type\":\"whatsapp\",\"channel\":\"manual\",\"responsible\":\"equipe\",\"result\":\"respondeu\",\"notes\":\"Cliente pediu valores.\",\"next_action_at\":\"2026-06-01T13:00:00.000Z\",\"increment_attempts\":true}"
```

Listar interacoes:

```powershell
curl.exe "$base/api/crm-interactions?lead_id=LEAD_ID"
```

## Action Items

Listar itens existentes da Acao do Dia:

```powershell
curl.exe "$base/api/action-items"
```

Nesta etapa a API apenas lista `action_items`; a geracao automatica ainda nao foi implementada.
