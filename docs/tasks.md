# Tasks Backlog

## Legenda

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

Milestones:
- `M0` Fundacao tecnica e governanca
- `M1` Jornada do Lead
- `M2` Mesa Operacional
- `M3` Importacao robusta e saneamento
- `M4` Atendimento e WhatsApp
- `M5` Jornada do Cliente
- `M6` Operacao, metas e gestao
- `M7` IA e automacao avancada

## Backlog atual

1. `[done][P1][M0]` Criar fundacao visual com Tailwind, Radix essencial, lucide e `components/ui`.
2. `[done][P0][M0]` Criar documentacao de contexto especializada para Codex.
3. `[done][P0][M1]` Fazer recovery do backend operacional de lead em commit proprio.
4. `[done][P0][M1]` Operacionalizar lead com registro estruturado de resultado de atendimento no backend.
5. `[done][P1][M0]` Criar sync automatico de fontes ChatGPT via GitHub Actions + rclone.
6. `[done][P0][M0]` Alinhar hierarquia documental para ChatGPT/Codex e corrigir docs de estado.
7. `[done][P0][M0]` Reconciliar `docs/api/rest-api.md` apos backend operacional.
8. `[done][P0][M0]` Reconciliar `docs/web/dashboard.md` antes de rebuild visual.
9. `[done][P0][M1/M2]` Formalizar especificacao complementar do Lead Operacional e Mesa Operacional.
10. `[todo][P0][M1/M2]` Decidir pendencias do pacote Lead Operacional antes da implementacao real.
11. `[todo][P0][M1]` Adicionar cobertura automatizada para checklist de analise da lideranca.
12. `[todo][P0][M1]` Adicionar cobertura automatizada para decisao da lideranca.
13. `[done][P0][M1]` Adicionar cobertura automatizada para cenarios operacionais simulados da Jornada do Lead.
14. `[todo][P0][M1]` Adicionar cobertura automatizada para backlog e ciclo longo quando houver bucket/endpoint dedicado.
15. `[todo][P0][M3]` Adicionar verificacao de importacao para regras de de-para da planilha.
16. `[todo][P0][M1]` Sprint 1A: Base de Leads sistematizada usando `components/ui`.
17. `[todo][P0][M2]` Sprint 2A: Mesa Operacional usando `components/ui`.
18. `[todo][P1][M1]` Sprint 3: Dashboard de Leads e Resumo Diario.
19. `[todo][P0][M1]` Criar relatorio diario de operacao com base em summary + worklist.
20. `[todo][P1][M5]` Definir arquitetura v1 da Jornada do Cliente pos-conversao.
21. `[todo][P1][M1]` Padronizar metricas de desempenho por resultado de interacao.
22. `[todo][P1][M4]` Preparar trilha controlada para WAHA real, somente inbound primeiro.
23. `[todo][P1][M4]` Iniciar sincronizacao Clube04 somente leitura por etapas.
24. `[todo][P1][M6]` Evoluir auth e auditoria para uso operacional real.
25. `[todo][P1][M4]` Reavaliar mensagens recomendadas, templates e midias em fluxo menos intrusivo.
26. `[todo][P2][M1]` Evoluir Base de Leads com configuracao de colunas e ordenacao.
27. `[todo][P2][M6]` Avaliar exportacao XLSX para uso gerencial.
28. `[todo][P2][M1]` Definir estrategia de merge real de contatos/telefones duplicados.

## Divida tecnica prioritaria

1. `[done][P1][M0]` Reorganizar scripts por dominio (`smoke`, `verify`, `dev-data`, `imports`, `remediation`).
2. `[done][P1][M0]` Remover placeholders obsoletos de `apps/web/public` que nao sao servidos em runtime.
3. `[done][P0][M0]` Consolidar hierarquia dos documentos Markdown.
4. `[done][P0][M0]` Reconciliar `docs/api/rest-api.md` com o backend operacional atual.
5. `[done][P0][M0]` Reescrever/reconciliar `docs/web/dashboard.md` antes do rebuild da Base de Leads e Mesa Operacional.
6. `[todo][P1][M0]` Dividir arquivos de script acima de 300 linhas.
7. `[todo][P1][M0]` Revisar configuracao Playwright para reduzir flakes locais.
8. `[todo][P2][M0]` Consolidar padroes de logs estruturados por modulo.
9. `[todo][P2][M3]` Revisar cobertura de verify para fluxos de importacao.

## Backlog de regras operacionais

- `[done][P0][M1]` Criar contrato operacional das regras da Jornada do Lead.
- `[done][P0][M3]` Criar regras de normalizacao da importacao de leads.
- `[done][P0][M1]` Criar matriz de testes das regras da Jornada do Lead.
- `[done][P0][M1/M2]` Formalizar especificacao complementar do Lead Operacional e Mesa Operacional.
- `[todo][P0][M1/M2]` Decidir cadencia de sem resposta, validacao de agendamento, label/status Follow-up, opt-out e contadores separados antes de alterar contrato/API.
- `[todo][P0][M1]` Adicionar cobertura automatizada para checklist de analise da lideranca.
- `[todo][P0][M1]` Adicionar cobertura automatizada para decisao da lideranca.
- `[done][P0][M1]` Adicionar cobertura automatizada para cenarios operacionais simulados da Jornada do Lead.
- `[todo][P0][M1]` Adicionar cobertura automatizada para backlog e ciclo longo quando houver bucket/endpoint dedicado.
- `[todo][P0][M3]` Adicionar verificacao de importacao para regras de de-para da planilha.
- `[todo][P1][M3]` Criar relatorio de invalidos/quarentena para importacao da planilha.
- `[todo][P1][M3]` Consolidar deduplicacao ativa por telefone na importacao.

## Regras de execucao das tasks

- Toda task deve declarar milestone, objetivo, escopo permitido e itens proibidos.
- Feature nova precisa atualizar testes e docs no mesmo ciclo.
- Validacao final obrigatoria e proporcional ao escopo.
- Docs-only: `git diff --check` e `npm run verify:data-cleanliness`.
- Mudancas gerais: preferir `npm run verify:all` em sequencia.
- Nao considerar falha paralela como conclusiva sem rerun sequencial.
- Se a worktree estiver suja, confirmar se `project-state` e `tasks` representam apenas estado commitado ou tambem pendencias.
- Nao usar `git add -A`.
- Nao commitar sem revisao/autorizacao.

## Proxima decisao

Com a governanca documental concluida, priorizar:

1. Decidir as pendencias M1/M2 do pacote Lead Operacional antes de implementar backend/frontend.
2. Fechar lacunas de testes de regras operacionais prioritarias da Jornada do Lead.
3. Iniciar Sprint 1A: Base de Leads visual usando UI Foundation.
4. Planejar Sprint 2A: Mesa Operacional.
5. Manter WAHA real, sync Clube04, Jornada do Cliente e IA como backlog controlado ate estabilizar M1/M2.
