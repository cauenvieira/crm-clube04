# Tasks Backlog

Status:

- `todo`
- `doing`
- `blocked`
- `done`

Prioridade:

- `P0` critica
- `P1` alta
- `P2` media

## Backlog atual

1. `[todo][P0]` Operacionalizar lead com registro estruturado de resultado de atendimento.
2. `[todo][P0]` Criar relatorio diario de operacao com base em summary + worklist.
3. `[todo][P0]` Definir arquitetura v1 da Jornada do Cliente (pos-conversao).
4. `[todo][P1]` Preparar trilha controlada para WAHA real (somente inbound primeiro).
5. `[todo][P1]` Iniciar sincronizacao Clube04 somente leitura por etapas.
6. `[todo][P1]` Evoluir auth e auditoria para uso operacional real.

## Divida tecnica prioritaria

1. `[done][P1]` Reorganizar scripts por dominio (`smoke`, `verify`, `dev-data`, `imports`, `remediation`).
2. `[done][P1]` Remover placeholders obsoletos de `apps/web/public` que nao sao servidos em runtime.
3. `[todo][P1]` Dividir arquivos de script acima de 300 linhas (`smoke-api`, `dev-cleanup-test-data`, `import-lead-spreadsheet-apply-support`).
4. `[todo][P1]` Revisar configuracao Playwright (chrome/channel/headed) para reduzir flakes locais.
5. `[todo][P2]` Consolidar padroes de logs estruturados por modulo.
6. `[todo][P2]` Revisar cobertura de verify para novos fluxos de importacao.

## Regras de execucao das tasks

- Toda task deve declarar escopo permitido e itens proibidos.
- Feature nova precisa atualizar testes e docs no mesmo ciclo.
- Validacao final obrigatoria em sequencia com `npm run verify:all`.
- Nao considerar falha paralela como conclusiva sem rerun sequencial.
