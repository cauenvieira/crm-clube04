# n8n WhatsApp Inbound (Local)

## Objetivo

Documentar o fluxo minimo de entrada de mensagem WhatsApp no CRM via n8n local.

Fluxo atual:

```text
Webhook n8n local -> payload normalizado -> POST /api/webhooks/whatsapp/inbound -> CRM
```

Nesta etapa nao ha WAHA real direto, envio de WhatsApp, IA autonoma ou resposta automatica para cliente.

## Autoridade documental

Este guia descreve integracao. Ele nao altera regra operacional da Jornada do Lead.

Se envolver status, outcome, fila, tentativa, conversao, perda, nutricao ou lideranca, ler obrigatoriamente:

- `docs/product/lead-operational-contract.md`
- `docs/product/lead-import-normalization.md`
- `docs/qa/lead-business-rules-test-matrix.md`

Contrato tecnico do endpoint:

- `docs/api/rest-api.md`
- `docs/decisions/003-whatsapp-through-n8n.md`
- `docs/decisions/005-versioned-n8n-workflows.md`

## Servico n8n local

- Editor local: `http://localhost:5678`
- Imagem: `docker.n8n.io/n8nio/n8n`
- Versao controlada por `N8N_VERSION` no `.env`
- Workflow oficial: `infra/n8n/workflows/whatsapp-inbound-test.json`
- ID oficial: `52RxSSXMQ4Zaitnw`

## Endpoint chamado pelo n8n

Dentro da rede Docker, usar:

```text
http://crm-api:3000/api/webhooks/whatsapp/inbound
```

Headers obrigatorios:

```text
Content-Type: application/json
x-crm-api-key: <CRM_API_SECRET>
```

Nao salvar segredo real no JSON versionado.

## Importacao do workflow versionado

```powershell
cd "C:\Users\cauev\OneDrive\Documentos\CRM Clube04"

npm run n8n:import:workflows
npm run n8n:list:workflows
```

Comando equivalente no container:

```powershell
docker compose exec -T n8n n8n import:workflow --separate --input=/workflows
```

O import sobrescreve por `id`, nao por `name`.

## Payload normalizado esperado

O workflow deve enviar para a API um JSON com estes campos minimos:

```json
{
  "provider": "waha",
  "providerMessageId": "n8n_test_001",
  "providerConversationId": "5511999999999",
  "fromNumber": "5511999999999",
  "toNumber": "5511470000000",
  "contactName": "Maria Teste n8n",
  "body": "Ola, gostaria de saber valores de banho",
  "messageType": "text",
  "direction": "inbound",
  "timestamp": "2026-06-05T12:00:00.000Z",
  "source": "whatsapp",
  "campaign": "n8n_manual_test",
  "rawPayload": {}
}
```

Regras tecnicas:

- `provider + providerMessageId` define idempotencia de mensagem.
- `fromNumber` deve ser normalizavel pelo CRM.
- `direction` nesta fase deve ser `inbound`.
- `rawPayload` preserva contexto tecnico para auditoria local.

## Configuracao segura do header

Opcao recomendada local:

1. Definir `CRM_API_SECRET` no `.env` usado pelo Docker Compose.
2. No node HTTP Request, usar expressao:

```text
{{$env.CRM_API_SECRET}}
```

Para o n8n acessar env vars em node, o compose local usa:

```text
N8N_BLOCK_ENV_ACCESS_IN_NODE=false
```

Validar no container:

```powershell
docker compose exec n8n printenv N8N_BLOCK_ENV_ACCESS_IN_NODE
```

Resultado esperado local:

```text
false
```

## Teste manual pelo n8n

1. Abrir o workflow no n8n.
2. Clicar em `Execute workflow`.
3. Chamar a URL de teste:

```text
http://localhost:5678/webhook-test/whatsapp-inbound-test
```

Exemplo:

```powershell
curl.exe -X POST "http://localhost:5678/webhook-test/whatsapp-inbound-test" -H "Content-Type: application/json" -d "{\"fromNumber\":\"5511999999999\",\"contactName\":\"Maria Teste n8n\",\"body\":\"Ola, gostaria de saber valores de banho\",\"providerMessageId\":\"n8n_test_001\"}"
```

## Verificacao no CRM

```powershell
$base = "http://localhost:3000"
$apiKey = (Get-Content .env | Where-Object { $_ -match '^CRM_API_SECRET=' }) -replace '^CRM_API_SECRET=', ''

curl.exe "$base/health"
curl.exe "$base/api/leads?source=whatsapp" -H "x-crm-api-key: $apiKey"
curl.exe "$base/api/messages" -H "x-crm-api-key: $apiKey"
```

Ao reenviar o mesmo `providerMessageId`, a API nao deve duplicar mensagem.

## Diferenca entre webhook-test e webhook

- `/webhook-test/...`: teste manual no editor, exige `Execute workflow`.
- `/webhook/...`: execucao normal com workflow ativo.

Para esta fase, preferir `/webhook-test/...`.

## Troubleshooting

### Erro de API key

Conferir:

- `CRM_API_SECRET` no `.env` da API;
- `CRM_API_SECRET` no ambiente do n8n;
- header `x-crm-api-key` no node HTTP Request.

### Env vars negadas no n8n

Conferir:

```powershell
docker compose exec n8n printenv N8N_BLOCK_ENV_ACCESS_IN_NODE
```

Valor esperado local/dev: `false`.

### Bad request no HTTP Request

Conferir se o body final inclui:

- `provider`
- `providerMessageId`
- `fromNumber`
- `body`
- `direction`
- `timestamp`

### Duplicidade no n8n

Se houver workflows duplicados com mesmo nome, manter apenas o workflow com ID oficial e reimportar.

## Fora do escopo atual

- WAHA real direto.
- Envio outbound.
- Bot automatico.
- IA respondendo cliente.
- Campanhas ativas.
- Uso com dados reais sem autorizacao.
