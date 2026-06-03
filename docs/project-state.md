# Project State

Snapshot do estado tecnico local do CRM Clube04.

## Estado da worktree

- UI Foundation commitada em `676f0e3 chore: add frontend ui foundation`.
- A worktree ainda esta suja com mudancas antigas de backend, frontend, UX, scripts e docs.
- O backend/API operacional de lead parece aproveitavel, mas ainda nao foi separado em commit.
- O frontend/UX pendente foi rejeitado visualmente e deve ser descartado ou refeito em sprints pequenas.
- `docs/web/dashboard.md` e `docs/api/rest-api.md` estao em reconciliacao e nao devem ser tratados como fonte final ate a separacao da worktree.

## Implementado e commitado

- Monorepo Node.js/TypeScript com:
  - `apps/api`
  - `apps/web`
  - `apps/worker`
  - `packages/shared`
- Docker local com `crm-api`, `crm-worker`, `postgres`, `redis`, `n8n`.
- API Fastify com `GET /health`.
- API key interna para `/api/*` via `x-crm-api-key`.
- Endpoints REST base de contatos, leads, conversas, mensagens, interacoes CRM e action items.
- Webhook inbound WhatsApp normalizado (`POST /api/webhooks/whatsapp/inbound`).
- Dashboard React/Vite servido em `/dashboard`.
- UI Foundation do frontend com Tailwind CSS, Radix essencial, lucide, `components/ui` e tokens Clube04.
- Smoke e verifies operacionais com bateria sequencial (`npm run verify:all`).
- Workflow n8n versionado e importavel via CLI.
- Scripts de higiene de dados dev (cleanup/seed) para ambiente local.
- Importacao/remediacao da Jornada do Lead em ferramentas locais.

## Pendente de separacao/commit

- Ciclo operacional de lead no backend/API.
- Endpoints operacionais de contexto e registro de resultado de contato.
- Ajustes de busca/exportacao operacional de leads.
- Verify especifico de ciclo operacional do lead.

Esses itens devem passar por recovery backend antes de serem considerados implementados.

## Rejeitado ou refazer

- Redesenho pendente da Mesa Operacional.
- Drawer pendente de acompanhamento do lead.
- Base de Leads pendente.
- Kanban/lista pendentes.
- Atalhos de UX pendentes, como `Sem resposta` rapido.
- Catalogo de mensagens/midias exposto na UI.

Esses itens devem ser refeitos usando `components/ui` e referencia Lovable, uma tela por sprint.

## Nao implementado

- Integracao WAHA real em modo escuta/controlado.
- Sincronizacao Clube04 somente leitura em ciclo completo.
- Arquitetura completa da Jornada do Cliente pos-conversao.
- Auth de usuario e trilha de auditoria para ambiente produtivo.
- Observabilidade completa.
- Biblioteca editavel de templates/midias no produto.
- Merge real de contatos/telefones duplicados.
- Google Auth.
- IA real.
- Automacoes n8n reais.

## Servicos e URLs locais

- API health: `http://localhost:3000/health`
- Dashboard: `http://localhost:3000/dashboard`
- n8n editor: `http://localhost:5678`

## Comandos base

- `npm run build`
- `npm run lint`
- `npm run verify:all`
- `npm run n8n:list:workflows`

## Proximo passo recomendado

1. Concluir docs de contexto especializados.
2. Fazer recovery do backend operacional de lead em commit proprio.
3. Limpar ou descartar frontend/UX rejeitado.
4. Corrigir `docs/web/dashboard.md` e `docs/api/rest-api.md` apos a separacao.
5. Iniciar Sprint 1A: Base de Leads usando UI Foundation.
6. Depois seguir para Mesa Operacional e Dashboard/Resumo Diario.
