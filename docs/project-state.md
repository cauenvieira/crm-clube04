# Project State

Snapshot do estado tecnico commitado do CRM Clube04.

## Estado atual

- Branch principal: `main`.
- Fonte de verdade: repositorio Git `cauenvieira/crm-clube04`.
- Fonte sincronizada para ChatGPT: Google Drive `Contextos CHATGPT/CRM Clube04/Fontes ChatGPT/repo-docs`.
- Sync de fontes ChatGPT concluido em `c59ca15 chore: sync chatgpt markdown sources to drive`.
- O espelho do Drive inclui apenas arquivos `.md` versionados e `PROJECT_CONTEXT_INDEX.md`.
- A pasta `dados-sensiveis` no Drive fica fora do sync e pode conter a planilha de leads copiada manualmente.

## Implementado e commitado

### Fundacao tecnica

- Monorepo Node.js/TypeScript com `apps/api`, `apps/web`, `apps/worker` e `packages/shared`.
- Docker local com `crm-api`, `crm-worker`, `postgres`, `redis`, `n8n`.
- API Fastify com `GET /health`.
- API key interna para `/api/*` via `x-crm-api-key`.
- Dashboard React/Vite servido em `/dashboard`.
- Smoke e verifies operacionais com bateria sequencial (`npm run verify:all`).
- Scripts de higiene de dados dev (cleanup/seed) para ambiente local.

### UI Foundation

- UI Foundation commitada em `676f0e3 chore: add frontend ui foundation`.
- Tailwind CSS, Radix essencial, lucide, `components/ui` e tokens Clube04.
- Frontend futuro deve usar `apps/web/src/components/ui`.

### Documentacao especializada

- Docs especializados commitados em `5a4b5b4 docs: add specialized project context guides`.
- Inclui orientacoes para frontend, backend, QA, Lovable, sprint e estrutura do repo.

### Backend operacional da Jornada do Lead

- Backend operacional recuperado em `6a55702 feat: recover lead operational backend cycle`.
- Worklist/resumo/manual lead complementares em `27f6d6a feat: enrich operational lead worklist backend`.
- Verifies relevantes executados na etapa:
  - `npm run smoke:api`
  - `npm run verify:operational-summary`
  - `npm run verify:operational-worklist`
  - `npm run verify:lead-operational-cycle`
  - `npm run verify:all`
  - `npm run verify:data-cleanliness`

### Contrato operacional da Jornada do Lead

- Regras de negocio documentadas em:
  - `docs/product/lead-operational-contract.md`
  - `docs/product/lead-import-normalization.md`
  - `docs/qa/lead-business-rules-test-matrix.md`
- Commits de regras operacionais:
  - `65c14a1 docs: add lead operational business rules`
  - `cfd483d docs: add lead operational business rules`

### Fontes sincronizadas para ChatGPT

- GitHub Actions + rclone sincroniza arquivos Markdown para o Google Drive.
- Commit: `c59ca15 chore: sync chatgpt markdown sources to drive`.
- Documentacao: `docs/development/chatgpt-project-sources.md`.

## Rejeitado ou refazer

- Redesenho pendente da Mesa Operacional.
- Drawer pendente de acompanhamento do lead.
- Base de Leads visual pendente.
- Kanban/lista pendentes.
- Atalhos de UX pendentes, como `Sem resposta` rapido.
- Catalogo de mensagens/midias exposto na UI.

Esses itens devem ser refeitos usando UI Foundation e referencia Lovable, uma tela por sprint. Frontend antigo/rejeitado nao deve ser reaproveitado automaticamente.

## Lacunas conhecidas

- `docs/api/rest-api.md` deve ser reconciliado apos os commits de backend operacional.
- `docs/web/dashboard.md` deve ser revisado antes de servir como fonte para nova UI.
- Lacunas de teste ainda existem para checklist de lideranca, decisao da lideranca, alertas de atrasado, backlog e ciclo longo.
- Importacao robusta da planilha ainda precisa de verificacoes automatizadas especificas.
- Base de Leads visual ainda nao foi refeita com UI Foundation.

## Nao implementado

- WhatsApp real em producao.
- WAHA real em modo escuta/controlado.
- Sincronizacao Clube04 somente leitura em ciclo completo.
- Jornada do Cliente pos-conversao completa.
- Auth de usuario e trilha de auditoria para ambiente produtivo.
- Observabilidade completa.
- Biblioteca editavel de templates/midias no produto.
- Merge real de contatos/telefones duplicados.
- Google Auth.
- IA real.
- Automacoes n8n reais para atendimento autonomo.

## Servicos e URLs locais

- API health: `http://localhost:3000/health`
- Dashboard: `http://localhost:3000/dashboard`
- n8n editor: `http://localhost:5678`

## Comandos base

- `npm run build`
- `npm run lint`
- `npm run verify:all`
- `npm run verify:data-cleanliness`
- `npm run n8n:list:workflows`

## Proximo passo recomendado

1. Concluir governanca documental e hierarquia dos arquivos Markdown.
2. Reconciliar `docs/api/rest-api.md` com o backend operacional atual.
3. Reconciliar `docs/web/dashboard.md` antes de nova UI.
4. Priorizar lacunas de teste de regras operacionais da Jornada do Lead.
5. Iniciar Sprint 1A: Base de Leads usando UI Foundation.
6. Depois seguir para Mesa Operacional e Dashboard/Resumo Diario.

## Regra de atualizacao

Sempre que codigo, regra, API, teste, frontend, importacao, roadmap ou backlog mudar, atualizar este arquivo quando o estado atual do projeto for afetado.
