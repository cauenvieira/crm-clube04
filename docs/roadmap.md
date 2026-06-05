# Roadmap

## Objetivo

Registrar o roadmap tecnico-operacional do CRM Clube04, alinhado aos milestones definidos em `AGENTS.md` e ao roadmap de produto em `docs/product/crm-platform-roadmap.md`.

Este documento e uma visao resumida de execucao. Para detalhes de produto, consultar os documentos em `docs/product/`.

## Estado atual resumido

Estado detalhado fica em `docs/project-state.md`.

### Concluido ou base existente

1. M0 - Fundacao tecnica local
   - Monorepo, Docker Compose, PostgreSQL, Redis, API, worker e web.

2. M0 - Governanca tecnica inicial
   - Regras Git, validacoes, higiene de dados dev, `verify:all` sequencial.

3. M0 - UI Foundation
   - Tailwind, Radix essencial, lucide, tokens Clube04 e `apps/web/src/components/ui`.

4. M0 - Fontes sincronizadas para ChatGPT
   - GitHub Actions + rclone sincronizando arquivos `.md` para Google Drive `repo-docs`.

5. M1 - Backend operacional da Jornada do Lead
   - Base de leads, action items, outcomes, worklist e summary operacional recuperados em commits proprios.

6. M1/M3 - Contratos de negocio documentados
   - Contrato operacional da Jornada do Lead.
   - Normalizacao da importacao.
   - Matriz de testes das regras de negocio.

### Em consolidacao

1. M0 - Hierarquia documental
   - Alinhar todos os Markdown para ChatGPT, Codex, agentes e humanos.

2. M0/M1 - Reconciliacao de docs tecnicos
   - `docs/api/rest-api.md` deve refletir o backend operacional atual.
   - `docs/web/dashboard.md` deve ser reconciliado antes de rebuild visual.

3. M1 - Cobertura de regras operacionais
   - Fechar lacunas prioritarias da matriz de testes.

## Ordem recomendada de proximas fases

### 1. Fechar governanca documental

Milestone:
- M0.

Objetivo:
- garantir que os docs principais estejam alinhados e sem conflito de autoridade.

Criterio de saida:
- `AGENTS.md`, `README.md`, `documentation-hierarchy`, `project-state`, `tasks`, roadmap e docs de produto amplo coerentes.

### 2. Reconciliar contratos tecnicos

Milestone:
- M0/M1.

Objetivo:
- alinhar API, schema, backend agent e dashboard docs com o estado atual do backend operacional.

Criterio de saida:
- `docs/api/rest-api.md` coerente com endpoints existentes.
- `docs/database/schema.md` coerente com migrations/tabelas atuais.
- `docs/web/dashboard.md` nao descreve frontend rejeitado como alvo atual.

### 3. Fechar lacunas de regras operacionais prioritarias

Milestone:
- M1.

Objetivo:
- aumentar protecao automatizada das regras da Jornada do Lead.

Prioridade:
- checklist antes da lideranca;
- decisao da lideranca;
- atrasados ate 7 dias;
- backlog acima de 7 dias;
- ciclo acima de 60 dias;
- lead ativo sem proxima acao.

### 4. Sprint 1A - Base de Leads visual

Milestone:
- M1.

Objetivo:
- construir Base de Leads sistematizada usando UI Foundation.

Regras:
- usar `apps/web/src/components/ui`;
- nao reaproveitar frontend rejeitado automaticamente;
- frontend nao deve criar comportamento critico sem backend.

### 5. Sprint 2A - Mesa Operacional

Milestone:
- M2.

Objetivo:
- entregar rotina diaria de atendimento com worklist acionavel.

Dependencias:
- Base de Leads e contratos de lead coerentes.

### 6. Relatorio diario operacional

Milestone:
- M1/M2.

Objetivo:
- consolidar summary + worklist em leitura diaria para lideranca.

### 7. Importacao robusta

Milestone:
- M3.

Objetivo:
- evoluir da planilha manual para importacao segura, com invalidos, deduplicacao e quarentena.

### 8. WhatsApp modo escuta

Milestone:
- M4.

Objetivo:
- capturar eventos inbound reais de forma controlada, sem resposta autonoma inicial.

### 9. Jornada do Cliente

Milestone:
- M5.

Objetivo:
- continuidade apos conversao: recorrencia, pacotes, renovacao, reativacao e NPS.

### 10. Operacao, metas e gestao

Milestone:
- M6.

Objetivo:
- metas, producao, agenda, financeiro operacional e dashboards de gestao.

### 11. IA e automacao avancada

Milestone:
- M7.

Objetivo:
- assistente, simulador, recomendacoes, classificacao, RAG e automacoes controladas.

## Riscos e cuidados

- Nao misturar feature com refatoracao ampla.
- Nao pular M1/M2 para construir modulos futuros.
- Evitar execucao paralela de smoke/verify no mesmo banco local.
- Manter dados reais fora do repositorio.
- Preservar workflows n8n versionados com ID estavel.
- Manter integracoes externas sob rollout controlado.
- Atualizar docs quando codigo, regra, API, schema, frontend, teste ou milestone mudar.
