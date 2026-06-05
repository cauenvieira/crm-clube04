# Checklist - API Feature

Use este checklist para qualquer mudanca de backend/API no CRM Clube04.

## Antes de alterar

- [ ] Milestone classificada.
- [ ] Escopo confirmado: endpoint, contrato, regra e dados afetados.
- [ ] `AGENTS.md` e `docs/development/documentation-hierarchy.md` consultados.
- [ ] `docs/backend/api-agent.md` consultado.
- [ ] `docs/api/rest-api.md` consultado.
- [ ] `docs/database/schema.md` consultado quando houver coluna, enum ou relacao.
- [ ] Se envolver Jornada do Lead, consultar obrigatoriamente:
  - `docs/product/lead-operational-contract.md`
  - `docs/product/lead-import-normalization.md`
  - `docs/qa/lead-business-rules-test-matrix.md`

## Durante a implementacao

- [ ] Route fina: sem SQL e sem regra de negocio complexa.
- [ ] Validation schema criado/atualizado.
- [ ] Service concentra a regra de negocio e orquestracao.
- [ ] Repository concentra SQL e persistencia.
- [ ] Erros controlados com status HTTP coerente.
- [ ] Idempotencia/duplicidade validada quando aplicavel.
- [ ] Transacao usada quando a operacao alterar multiplas entidades dependentes.
- [ ] Nenhum comportamento operacional foi inferido apenas pelo codigo.

## Documentacao obrigatoria

- [ ] `docs/api/rest-api.md` atualizado com exemplos copiaveis.
- [ ] `docs/database/schema.md` atualizado se schema/enums mudaram.
- [ ] `docs/product/lead-operational-contract.md` atualizado se regra de lead mudou.
- [ ] Matriz/teste atualizado se regra operacional mudou.
- [ ] `docs/project-state.md` ou `docs/tasks.md` atualizados quando estado/backlog mudou.

## Validacao

Escolher o menor conjunto suficiente, mas nao pular validacao de risco.

- [ ] `npm run build`
- [ ] `npm run lint`
- [ ] `npm run smoke:api`
- [ ] verify especifico do dominio, quando existir.
- [ ] `npm run verify:all` antes de commit quando houver codigo.
- [ ] `npm run verify:data-cleanliness` quando scripts criarem dados de teste.

## Git

- [ ] `git status --short` revisado.
- [ ] `git diff --stat` revisado.
- [ ] `git diff --check` sem saida.
- [ ] `git add` com caminhos especificos.
- [ ] Nao usar `git add -A`.
