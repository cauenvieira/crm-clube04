# Visao Geral - CRM Clube04

## Objetivo

Construir, de forma incremental, um centro de operacoes e controle para o Clube04 Mogi das Cruzes.

O sistema deve apoiar a rotina real da unidade: leads, atendimento via WhatsApp, agenda, clientes, pacotes, metas, equipe, producao, NPS, financeiro operacional, indicadores e automacoes.

A Jornada do Lead e o foco funcional atual, mas nao e o limite final do produto.

## Escopo atual

Milestone funcional atual: M1 - Jornada do Lead.

Prioridade atual:

1. Base de leads confiavel.
2. Importacao e saneamento da planilha atual.
3. Regras operacionais protegidas no backend.
4. Tentativas, follow-up, atrasados e backlog.
5. Analise de lideranca e rastreabilidade.
6. Conversao e preparacao da continuidade para Jornada do Cliente.
7. Mesa Operacional e dashboard como leitura diaria.

## Fundacao tecnica ja estabelecida

- Monorepo Node/TypeScript.
- Fastify API.
- PostgreSQL.
- Redis.
- Docker Compose.
- React/Vite em `apps/web`.
- UI Foundation em `apps/web/src/components/ui`.
- n8n local com workflow versionado.
- Sync automatico de docs Markdown para Google Drive via GitHub Actions + rclone.

## Modulos futuros

A evolucao prevista inclui:

- Mesa Operacional.
- Importacao robusta e saneamento.
- Atendimento/WhatsApp.
- Jornada do Cliente.
- Operacao, metas e gestao.
- IA e automacao avancada.

Esses modulos ficam como roadmap ate que uma sprint especifica seja aprovada.

## Fora do escopo imediato

- Resposta automatica autonoma ao cliente.
- Envio automatico massivo de WhatsApp.
- Alteracao automatica no sistema oficial Clube04.
- Scraping que altere dados no sistema Clube04.
- Dashboard financeiro avancado.
- Controle complexo de permissoes antes de auth/auditoria real.
- Features futuras implementadas apenas por parecerem uteis.

## Fonte de verdade

- Repositorio Git e a fonte de verdade.
- Google Drive `repo-docs` e apenas espelho de consulta para ChatGPT.
- `AGENTS.md` e a constituicao operacional do repo.
- `docs/development/documentation-hierarchy.md` define a hierarquia documental.

Para Jornada do Lead, a fonte de verdade operacional e:

1. `docs/product/lead-operational-contract.md`
2. `docs/product/lead-import-normalization.md`
3. `docs/qa/lead-business-rules-test-matrix.md`

## Regras de evolucao

- Mudancas pequenas e incrementais.
- Nao misturar feature com refatoracao ampla.
- Backend e dono de movimentacao critica da Jornada do Lead.
- Frontend nao deve implementar regra operacional apenas visualmente.
- Toda mudanca relevante deve atualizar docs/testes/backlog no mesmo ciclo.
