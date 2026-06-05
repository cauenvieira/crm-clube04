# Checklist - Pre Commit

Checklist rapido antes de qualquer commit no CRM Clube04.

## Escopo

- [ ] A tarefa tem milestone definida.
- [ ] A mudanca corresponde ao escopo aprovado.
- [ ] Nao houve refatoracao ampla junto com feature.
- [ ] Nao houve alteracao fora dos arquivos esperados.
- [ ] Se a tarefa misturou milestones, a divisao foi registrada ou aprovada.

## Seguranca de dados

- [ ] Nenhum `.env` foi stageado.
- [ ] Nenhum CSV/XLSX real foi stageado.
- [ ] Nenhum dump, zip, screenshot, log, token, credencial ou backup foi stageado.
- [ ] Nenhum dado real de cliente foi versionado.
- [ ] `.tmp/` e `.chatgpt-sources/` continuam fora do Git.

## Documentacao

- [ ] `docs/project-state.md` atualizado se o estado atual mudou.
- [ ] `docs/tasks.md` atualizado se backlog/prioridade mudou.
- [ ] Contratos de API/schema/frontend/importacao atualizados se comportamento mudou.
- [ ] Contrato operacional e matriz/testes atualizados se regra de lead mudou.
- [ ] Exemplos de comando usam PowerShell quando orientam o usuario local.

## Validacao proporcional

Docs-only:
- [ ] `git diff --check`
- [ ] `npm run verify:data-cleanliness`

Codigo geral:
- [ ] `npm run build`
- [ ] `npm run lint`
- [ ] `npm run verify:all` em sequencia.

Backend/API:
- [ ] `npm run smoke:api`
- [ ] verify especifico do dominio quando existir.

Frontend:
- [ ] `npm run verify:dashboard`
- [ ] `npm run verify:frontend`

## Git

- [ ] `git status --short` revisado.
- [ ] `git diff --stat` revisado.
- [ ] `git diff --cached --stat` revisado antes do commit.
- [ ] `git diff --check` sem saida.
- [ ] `git add` feito com caminhos especificos.
- [ ] Nao foi usado `git add -A`.
- [ ] Nao foi usado `git add .` sem revisao explicita.
- [ ] Mensagem de commit descreve o escopo real.

## Depois do push

- [ ] Se alterou `.md`, sync Google Drive roda automaticamente via GitHub Actions.
- [ ] Conferir `Actions > Sync ChatGPT sources to Google Drive` quando a tarefa for de contexto/docs.
