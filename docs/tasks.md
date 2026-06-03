# Tasks Backlog

Status:

- `todo`
- `doing`
- `blocked`
- `review`
- `done`

Prioridade:

- `P0` critica
- `P1` alta
- `P2` media

## Backlog atual

1. `[done][P1]` Criar fundacao visual com Tailwind, Radix essencial, lucide e `components/ui`.
2. `[done][P0]` Criar documentacao de contexto especializada para Codex.
3. `[todo][P0]` Fazer recovery do backend operacional de lead em commit proprio.
4. `[todo][P0]` Limpar frontend/UX rejeitado da worktree sem perder helpers uteis.
5. `[review][P0]` Operacionalizar lead com registro estruturado de resultado de atendimento no backend.
6. `[blocked][P0]` Reforcar UX operacional da mesa de atendimento. Tentativa anterior rejeitada; refazer com UI Foundation.
7. `[blocked][P0]` Implementar Base de Leads visual. Tentativa anterior rejeitada; refazer com UI Foundation.
8. `[blocked][P0]` Simplificar UX da Mesa Operacional. Tentativa anterior rejeitada; refazer em sprint dedicada.
9. `[todo][P0]` Sprint 1A: Base de Leads sistematizada usando `components/ui`.
10. `[todo][P0]` Sprint 2A: Mesa Operacional usando `components/ui`.
11. `[todo][P1]` Sprint 3: Dashboard de Leads e Resumo Diario.
12. `[todo][P0]` Criar relatorio diario de operacao com base em summary + worklist.
13. `[todo][P0]` Definir arquitetura v1 da Jornada do Cliente pos-conversao.
14. `[todo][P1]` Padronizar metricas de desempenho por resultado de interacao.
15. `[todo][P1]` Preparar trilha controlada para WAHA real, somente inbound primeiro.
16. `[todo][P1]` Iniciar sincronizacao Clube04 somente leitura por etapas.
17. `[todo][P1]` Evoluir auth e auditoria para uso operacional real.
18. `[todo][P1]` Reavaliar mensagens recomendadas, templates e midias em fluxo menos intrusivo.
19. `[todo][P2]` Evoluir Base de Leads com configuracao de colunas e ordenacao.
20. `[todo][P2]` Avaliar exportacao XLSX para uso gerencial.
21. `[todo][P2]` Definir estrategia de merge real de contatos/telefones duplicados.

## Divida tecnica prioritaria

1. `[done][P1]` Reorganizar scripts por dominio (`smoke`, `verify`, `dev-data`, `imports`, `remediation`).
2. `[done][P1]` Remover placeholders obsoletos de `apps/web/public` que nao sao servidos em runtime.
3. `[todo][P0]` Reconciliar `docs/api/rest-api.md` apos recovery do backend operacional.
4. `[todo][P0]` Reescrever `docs/web/dashboard.md` apos rebuild da Base de Leads e Mesa Operacional.
5. `[todo][P1]` Dividir arquivos de script acima de 300 linhas.
6. `[todo][P1]` Revisar configuracao Playwright para reduzir flakes locais.
7. `[todo][P2]` Consolidar padroes de logs estruturados por modulo.
8. `[todo][P2]` Revisar cobertura de verify para fluxos de importacao.

## Regras de execucao das tasks

- Toda task deve declarar escopo permitido e itens proibidos.
- Feature nova precisa atualizar testes e docs no mesmo ciclo.
- Validacao final obrigatoria em sequencia com `npm run verify:all`, salvo docs-only.
- Nao considerar falha paralela como conclusiva sem rerun sequencial.
- Se a worktree estiver suja, confirmar se `project-state` e `tasks` representam apenas estado commitado ou tambem pendencias.
