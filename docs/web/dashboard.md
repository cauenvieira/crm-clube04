# Dashboard UX v2

Painel local/dev para visualizacao operacional humana, com foco de uso diario da equipe.

## URL

- `http://localhost:3000/dashboard`

## Como usar

1. Abrir a URL no navegador.
2. Informar a API key no campo "API key".
3. Ajustar `limit` (default `10`, max `50`) se necessario.
4. Clicar em "Atualizar".
5. Opcional: ajustar limite por lista (`1` a `50`).

## Armazenamento da API key

- A API key e salva apenas no `localStorage` do navegador local.
- O botao "Limpar API key" remove esse valor do navegador.
- Nenhum segredo fica hardcoded no codigo do painel.

## Acoes no painel

- "Concluir" envia `POST /api/action-items/:id/complete` com `Content-Type: application/json` e body `{}`.
- "Ignorar" envia `POST /api/action-items/:id/cancel` com `Content-Type: application/json` e body `{}`.
- "Ignorar" pede confirmacao antes de enviar.
- Depois da acao, o painel recarrega summary e worklist.
- O painel mostra feedback curto de sucesso/erro apos atualizar ou executar acao.

## Estrutura visual

- Bloco "Agora / Prioridade":
  - Acoes vencidas
  - Acoes pendentes
- Bloco "Leads em risco":
  - Follow-up vencido
  - Sem interacao 24h
- Bloco "Movimento recente":
  - Ultimas mensagens inbound

## Datas e timezone

- Datas sao exibidas em formato local `pt-BR` no timezone `America/Sao_Paulo`.
- Valores internos continuam em ISO na API.
- Campos sem valor exibem "Sem registro".

## Debug

- IDs e campos tecnicos ficam em `<details>` por item, para nao poluir a leitura principal.

## Fonte de dados

- `GET /api/operational-summary`
- `GET /api/operational-worklist?limit=<n>`

## Limitacoes atuais

- Escopo local/dev, sem autenticacao real de usuario.
- Sem frontend complexo (HTML/CSS/JS vanilla).
