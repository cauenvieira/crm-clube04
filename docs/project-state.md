# Project State

Snapshot do estado tecnico commitado do CRM Clube04.

## Estado atual

- Branch principal: `main`.
- Fonte de verdade: repositorio Git `cauenvieira/crm-clube04`.
- Fonte sincronizada para ChatGPT: Google Drive `Contextos CHATGPT/CRM Clube04/Fontes ChatGPT/repo-docs`.
- Sync de fontes ChatGPT configurado em `c59ca15 chore: sync chatgpt markdown sources to drive`.
- O status efetivo do espelho deve ser conferido em `PROJECT_CONTEXT_INDEX.md` no Drive depois de cada push na `main`.
- O espelho do Drive inclui apenas arquivos `.md` versionados e `PROJECT_CONTEXT_INDEX.md`.
- A pasta `dados-sensiveis` no Drive fica fora do sync e pode conter a planilha de leads copiada manualmente. Dados reais continuam proibidos no Git.

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

### Documentacao especializada e governanca documental

- Docs especializados commitados em `5a4b5b4 docs: add specialized project context guides`.
- Sync automatico de fontes ChatGPT criado em `c59ca15 chore: sync chatgpt markdown sources to drive`.
- Hierarquia documental consolidada em fases docs-only, cobrindo:
  - `AGENTS.md`;
  - `README.md`;
  - `docs/development/documentation-hierarchy.md`;
  - docs de produto amplo e roadmap;
  - contratos tecnicos de API, backend, banco e arquitetura;
  - docs de frontend, UI Foundation e dashboard;
  - docs de importacao e normalizacao da Jornada do Lead;
  - docs de integracoes, n8n, WAHA e readmes locais;
  - docs de QA, desenvolvimento, checklists, dev-data, estrutura e modelo conceitual.
- Regra de autoridade vigente:
  - contratos especificos vencem docs auxiliares;
  - para Jornada do Lead, a fonte de verdade e `lead-operational-contract`, `lead-import-normalization` e matriz de testes;
  - memoria de chat nunca vence doc versionado atual.

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

## Rejeitado ou refazer

- Redesenho pendente da Mesa Operacional.
- Drawer pendente de acompanhamento do lead.
- Base de Leads visual pendente.
- Kanban/lista pendentes.
- Atalhos de UX pendentes, como `Sem resposta` rapido.
- Catalogo de mensagens/midias exposto na UI.

Esses itens devem ser refeitos usando UI Foundation e referencia Lovable, uma tela por sprint. Frontend antigo/rejeitado nao deve ser reaproveitado automaticamente.

## Lacunas conhecidas

- Lacunas de teste ainda existem para checklist de lideranca, decisao da lideranca, alertas de atrasado, backlog e ciclo longo.
- Importacao robusta da planilha ainda precisa de verificacoes automatizadas especificas.
- Base de Leads visual ainda nao foi refeita com UI Foundation.
- Mesa Operacional ainda nao foi refeita com UI Foundation.
- Auth de usuario, permissoes e auditoria seguem pendentes antes de uso operacional real.
- WAHA real e sincronizacao Clube04 somente leitura continuam fora do escopo imediato.

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

1. Fechar lacunas de testes de regras operacionais da Jornada do Lead:
   - checklist de analise da lideranca;
   - decisao da lideranca;
   - alertas de atrasado, backlog e ciclo longo.
2. Iniciar Sprint 1A: Base de Leads sistematizada usando UI Foundation.
3. Depois seguir para Mesa Operacional e Dashboard/Resumo Diario.
4. Manter API, schema, importacao, frontend e docs sincronizados a cada tarefa.

## Regra de atualizacao

Sempre que codigo, regra, API, teste, frontend, importacao, roadmap ou backlog mudar, atualizar este arquivo quando o estado atual do projeto for afetado.
