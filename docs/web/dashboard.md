# Dashboard UX v3 (React/Vite)

Painel local/dev para operacao diaria de leads e action_items.

## URL

- `http://localhost:3000/dashboard`

## Tecnologia

- frontend em React + TypeScript;
- bundle gerado por Vite em `apps/web/dist`;
- API continua servindo:
  - `/dashboard`
  - `/dashboard/app.js`
  - `/dashboard/styles.css`
- `apps/web/public` contem apenas `dashboard.html` (scaffold);
- `app.js` e `styles.css` sao servidos somente do build em `apps/web/dist`.
- sem fallback silencioso para bundle ausente:
  - se `apps/web/dist` nao existir, `/dashboard/app.js` e `/dashboard/styles.css` retornam erro explicito.

## Navegacao

Menu lateral:

- Hoje
- Leads (placeholder local nesta etapa)
- Novo Lead
- Configuracoes

## Configuracao de API key

1. Abrir `Configuracoes`.
2. Informar o valor de `CRM_API_SECRET`.
3. Salvar.

Comportamento:

- API key salva somente no `localStorage` local;
- botao `Limpar` remove do navegador;
- nenhum segredo hardcoded no frontend.

## Tela Hoje

Usa:

- `GET /api/operational-summary`
- `GET /api/operational-worklist?limit=<n>`

Secoes operacionais:

- Acoes vencidas
- Acoes pendentes
- Retomar atendimento
- Follow-ups agendados
- Revisao lideranca
- Novos leads
- Ultimas mensagens inbound

Acoes por item:

- Abrir WhatsApp
- Concluir (`POST /api/action-items/:id/complete`)
- Ignorar (`POST /api/action-items/:id/cancel`)

## Tela Novo Lead

Form de entrada manual via `POST /api/manual-leads`.

Obrigatorios:

- Tutor
- Telefone
- Metodo de entrada
- Atendente
- Proxima acao
- Data Prox Acao

Opcionais:

- Nome do doguinho
- Raca
- Peso aproximado
- Servico de interesse
- Observacao inicial

Fluxo:

- valida campos obrigatorios no frontend;
- envia payload para API;
- mostra `contact_id`, `lead_id`, `action_item_id` e flags de `created/duplicate`;
- permite busca rapida por telefone/nome com `GET /api/leads/search`.

## Datas e timezone

- exibicao local em `pt-BR` para operacao humana;
- backend segue ISO UTC e criterio operacional `America/Sao_Paulo`.

## Limitacoes atuais

- escopo local/dev;
- sem login de usuario;
- API key em localStorage;
- sem WAHA real.

## Evidencia visual

1. Abrir `http://localhost:3000/dashboard`.
2. Validar estados: sem chave, chave invalida, chave valida.
3. Validar cards/listas, botoes de acao e limit.
4. Tentar screenshot/appshot quando tooling permitir.

Se screenshot falhar por timeout/CDP, usar fallback estrutural no relatorio:

- pagina carregou
- estados testados
- contagem de cards/listas
- botoes visiveis
- `hasHorizontalOverflow=false`
- mensagens de erro/sucesso observadas

## Verificacao automatizada

- `npm run verify:dashboard` valida rota/asset/strings criticas.
- `npm run verify:frontend` valida fluxo real no navegador:
  - carrega `/dashboard`
  - detecta erros de console/page
  - detecta assets 4xx/5xx
  - salva API key e confirma persistencia
  - valida telas Hoje e Novo Lead
  - cria/busca/repete lead manual com idempotencia
  - valida `hasHorizontalOverflow=false`
