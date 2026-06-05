# Codex Custom Instructions

Use este arquivo como base compacta para instrucoes personalizadas do Codex no projeto CRM Clube04.

## Contexto

Voce esta trabalhando no CRM Clube04, um centro de operacoes e controle em evolucao para o Clube04 Mogi das Cruzes.

O foco funcional atual e a Jornada do Lead, mas o produto deve evoluir para apoiar atendimento, WhatsApp, agenda, clientes, pacotes, metas, equipe, producao, NPS, indicadores e automacoes.

Nao trate como SaaS generico. Respeite a operacao real do Clube04.

## Regras principais

- Leia `AGENTS.md` antes de editar.
- Siga a hierarquia de `docs/development/documentation-hierarchy.md`.
- Consulte os docs especificos da tarefa antes de alterar arquivos.
- Mantenha mudancas pequenas, incrementais e com escopo limitado.
- Nao misture feature com refatoracao ampla.
- Nao altere API, schema, endpoints, n8n, Docker ou integracoes sensiveis sem pedido explicito.
- Nao versionar segredos, `.env`, `.tmp`, dados reais, CSV, XLSX, dumps, logs, screenshots, zips ou backups locais.
- Use ASCII-only por padrao em docs tecnicos, codigo, comentarios e exemplos.

## Jornada do Lead

Antes de alterar comportamento operacional da Jornada do Lead, leia:

- `docs/product/lead-operational-contract.md`
- `docs/product/lead-import-normalization.md`
- `docs/qa/lead-business-rules-test-matrix.md`

Nao alterar status, action item, outcome, cadencia, lideranca, perda, desqualificacao, conversao, importacao, normalizacao ou indicadores sem atualizar docs e matriz/testes na mesma tarefa.

O backend e dono do ciclo de vida. Movimentacao critica nao deve ser apenas visual no frontend.

## Git

- Git e a fonte de verdade.
- Nao usar `git add -A`.
- Nao usar `git add .` sem revisao explicita.
- Nao commitar sem revisao final no thread.
- Reportar `git status --short` e `git diff --stat`.
- Se houver risco de perda de trabalho, pedir `git status --short`, `git diff` e `git stash list`.

## Validacao

Escolha validacoes proporcionais ao escopo.

- Docs-only: `git diff --check` e `npm run verify:data-cleanliness`.
- Backend/API: `npm run smoke:api`, verifies especificos e, quando aplicavel, `npm run verify:all`.
- Frontend: `npm run verify:frontend`, `npm run verify:dashboard` e validacao visual quando possivel.
- Mudancas gerais: `npm run build`, `npm run lint`, `npm run verify:all`, `npm run verify:data-cleanliness`.

Nao executar smoke/verify em paralelo no mesmo banco local.

## Fechamento

Relatorio final compacto:

1. O que mudou.
2. Arquivos alterados.
3. Validacoes executadas.
4. Decisoes relevantes.
5. Riscos ou pendencias.
6. Se docs/backlog/matriz foram atualizados.
7. `git status --short`.
8. Proximo passo recomendado.

Logs completos apenas para erros ou troubleshooting.
