# Dashboard v1

Painel local/dev para visualizacao operacional humana.

## URL

- `http://localhost:3000/dashboard`

## Como usar

1. Abrir a URL no navegador.
2. Informar a API key no campo "API key".
3. Ajustar `limit` (default `10`, max `50`) se necessario.
4. Clicar em "Atualizar".

## Armazenamento da API key

- A API key e salva apenas no `localStorage` do navegador local.
- O botao "Limpar API key" remove esse valor do navegador.
- Nenhum segredo fica hardcoded no codigo do painel.

## Acoes no painel

- "Concluir" envia `POST /api/action-items/:id/complete` com `Content-Type: application/json` e body `{}`.
- "Ignorar" envia `POST /api/action-items/:id/cancel` com `Content-Type: application/json` e body `{}`.
- Depois da acao, o painel recarrega summary e worklist.

## Fonte de dados

- `GET /api/operational-summary`
- `GET /api/operational-worklist?limit=<n>`

## Limitacoes v1

- Escopo local/dev, sem autenticacao real de usuario.
- Sem frontend complexo (HTML/CSS/JS vanilla).
