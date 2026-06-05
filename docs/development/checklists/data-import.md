# Checklist - Data Import

Use este checklist em qualquer tarefa de importacao, normalizacao ou remediacao de dados.

## Antes de alterar codigo ou rodar apply

- [ ] Milestone declarada.
- [ ] Escopo permitido definido.
- [ ] Arquivos reais mantidos fora do Git.
- [ ] Caminhos sensiveis usam `.tmp/`.
- [ ] Fonte da regra consultada:
  - [ ] `docs/product/lead-operational-contract.md`
  - [ ] `docs/product/lead-import-normalization.md`
  - [ ] `docs/qa/lead-business-rules-test-matrix.md`
- [ ] Abas/arquivos permitidos definidos.
- [ ] Mapeamento de colunas documentado.
- [ ] De-para de status e action items documentado.
- [ ] Criterios de invalidos/quarentena documentados.
- [ ] Regra de deduplicacao definida.
- [ ] Criterio de conversao definido.
- [ ] Critério de revisao de lideranca definido.
- [ ] Dry-run obrigatorio antes do apply.

## Durante o desenvolvimento

- [ ] Dry-run e default.
- [ ] Apply exige `--apply --confirm-local-dev`.
- [ ] `NODE_ENV=production` bloqueado.
- [ ] Banco/host suspeito bloqueado quando aplicavel.
- [ ] Sem `DELETE` ou `TRUNCATE`.
- [ ] Sem chamada para sistema externo real sem autorizacao.
- [ ] Logs nao exibem dados pessoais completos.
- [ ] Relatorios com dados reais ficam em `.tmp/`.
- [ ] Operacao e idempotente ou possui protecao clara contra duplicidade.
- [ ] Erros geram motivo classificado.

## Antes de concluir

- [ ] `git diff --check` executado.
- [ ] `npm run verify:data-cleanliness` executado.
- [ ] Verificacao especifica de importacao executada, quando existir.
- [ ] `npm run verify:all` avaliado quando houver codigo.
- [ ] Docs atualizados se regra mudou.
- [ ] Matriz de testes atualizada se regra testavel mudou.
- [ ] `docs/tasks.md` atualizado se backlog/prioridade mudou.
- [ ] Nenhum XLSX/CSV real foi versionado.
- [ ] Nenhum log, dump ou relatorio sensivel foi versionado.

## Saida final esperada

Relatorio da tarefa deve informar:

- arquivos alterados;
- comandos executados;
- se houve dry-run/apply;
- ambiente usado;
- validacoes executadas;
- dados sensiveis preservados fora do Git;
- pendencias e riscos restantes.
