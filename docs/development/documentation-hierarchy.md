# Documentation Hierarchy

## Objetivo

Definir a hierarquia dos documentos Markdown do CRM Clube04 para manter ChatGPT, Codex, agentes e humanos alinhados.

Este documento reduz ambiguidade entre docs de estado, docs de regra, docs historicos e docs auxiliares.

## Principios

- O repositorio Git e a fonte de verdade.
- A pasta Google Drive `repo-docs` e apenas espelho de consulta para ChatGPT.
- `AGENTS.md` e a constituicao operacional do repo.
- Nenhum doc auxiliar deve vencer contrato especifico.
- Estado atual e backlog devem ser atualizados quando o projeto evolui.
- Se codigo, regra, teste e documentacao divergem, a tarefa nao esta concluida.

## Niveis de autoridade

### Nivel 0 - Instrucoes externas

- ChatGPT Project Instructions.
- Codex custom instructions configuradas no ambiente.

Funcao:
- Orientar a ferramenta.
- Nao substituir docs versionados do repo.

### Nivel 1 - Constituicao do repo

- `AGENTS.md`

Funcao:
- Regras gerais.
- Hierarquia documental.
- Roteamento de contexto.
- Seguranca.
- Git.
- Validacao.
- Fechamento de tarefa.

Deve ser pouco mutavel.

### Nivel 2 - Entrada e estado

- `README.md`
- `docs/project-state.md`
- `docs/tasks.md`
- `PROJECT_CONTEXT_INDEX.md` no Google Drive

Funcao:
- `README.md`: entrada humana, visao e comandos.
- `project-state`: estado atual commitado.
- `tasks`: backlog e prioridades.
- `PROJECT_CONTEXT_INDEX`: commit e arquivos sincronizados no Drive.

### Nivel 3 - Produto e regras de negocio

- `docs/product/crm-platform-roadmap.md`
- `docs/product/modules.md`
- `docs/product/operational-flows.md`
- `docs/product/lead-operational-contract.md`
- `docs/product/lead-import-normalization.md`
- `docs/product/lead-operational-system.md`
- `docs/product/lead-operational-decisions.md`
- `docs/qa/lead-business-rules-test-matrix.md`
- `docs/qa/lead-operational-cycle-test-plan.md`

Funcao:
- Roadmap e modulos definem direcao.
- Contratos de lead e matriz de testes definem comportamento operacional protegido.

Para Jornada do Lead, a fonte de verdade e:
1. `docs/product/lead-operational-contract.md`
2. `docs/product/lead-import-normalization.md`
3. `docs/qa/lead-business-rules-test-matrix.md`

Documentos complementares de especificacao M1/M2:
- `docs/product/lead-operational-system.md`: visao funcional alvo e conceitos separados.
- `docs/product/lead-operational-decisions.md`: decisoes e pendencias controladas.
- `docs/product/lead-operational-ui-wireframes.md`: orientacao de UX/wireframes, sem alterar regra.
- `docs/qa/lead-operational-cycle-test-plan.md`: plano manual/funcional para mock e futura implementacao.

Esses documentos complementares nao vencem contrato, normalizacao ou matriz. Se trouxerem proposta de novo status, action item, cadencia ou permissao, a mudanca deve ser promovida para contrato e matriz antes de implementacao.

### Nivel 4 - Contratos tecnicos

- `docs/api/rest-api.md`
- `docs/database/schema.md`
- `docs/architecture/code-organization.md`
- `docs/architecture/decisions.md`
- `docs/decisions/*.md`
- `docs/backend/api-agent.md`
- `docs/frontend/*.md`
- `docs/qa/verification-agent.md`

Funcao:
- Definir contratos de API, banco, arquitetura, frontend e validacao.

### Nivel 5 - Execucao, checklists e operacao tecnica

- `docs/development/*`
- `docs/development/checklists/*`
- `docs/imports/*`
- `docs/integrations/*`

Funcao:
- Guiar execucao de tarefas.
- Documentar processos de importacao, integracao, validacao e desenvolvimento.

### Nivel 6 - Readmes locais de modulo

- `apps/**/readme.md`

Funcao:
- Contexto local de modulo.
- Nao vence docs de produto, contrato, API ou arquitetura.

## Regra de precedencia em conflito

Em caso de conflito, priorizar nesta ordem:

1. Contrato especifico de regra/API/schema/teste.
2. Matriz de testes ou verificacao automatizada.
3. Decisao tecnica registrada em ADR.
4. `docs/project-state.md` para estado atual.
5. `docs/tasks.md` para prioridade.
6. Docs auxiliares/historicos.
7. Memoria de chat.

Exemplo:
- Se `lead-operational-scope.md` usar status divergente do contrato operacional, o contrato operacional vence.
- Se `project-state.md` disser que algo esta pendente, mas commit e docs atualizados mostram que foi concluido, atualizar `project-state.md`.
- Se uma feature muda payload/API, atualizar `docs/api/rest-api.md`.

## Roteamento por tarefa

### Planejamento e governanca

Ler:
- `AGENTS.md`
- `README.md`
- `docs/project-state.md`
- `docs/tasks.md`
- `docs/development/documentation-hierarchy.md`

### Produto amplo

Ler:
- `docs/product/crm-platform-roadmap.md`
- `docs/product/modules.md`
- `docs/product/operational-flows.md`
- `docs/roadmap.md`

### Jornada do Lead

Ler obrigatoriamente:
- `docs/product/lead-operational-contract.md`
- `docs/product/lead-import-normalization.md`
- `docs/qa/lead-business-rules-test-matrix.md`

Para trabalho de Lead Operacional/Mesa Operacional M1/M2, ler tambem:
- `docs/product/lead-operational-system.md`
- `docs/product/lead-operational-decisions.md`
- `docs/product/lead-operational-ui-wireframes.md`
- `docs/qa/lead-operational-cycle-test-plan.md`

### Backend/API

Ler:
- `docs/backend/api-agent.md`
- `docs/api/rest-api.md`
- `docs/database/schema.md`
- `docs/architecture/code-organization.md`

Se envolver lead, ler tambem os documentos obrigatorios da Jornada do Lead.

### Frontend

Ler:
- `docs/frontend/design-system.md`
- `docs/frontend/components-catalog.md`
- `docs/frontend/lovable-adaptation-guide.md`
- docs de produto/regra relacionados ao fluxo.

### Importacao

Ler:
- `docs/product/lead-import-normalization.md`
- `docs/imports/*`
- `docs/qa/lead-business-rules-test-matrix.md`

### Integracoes

Ler:
- `docs/integrations/*`
- `docs/development/checklists/integration.md`
- readmes locais em `apps/api/src/integrations/*`.

### QA

Ler:
- `docs/qa/verification-agent.md`
- `docs/development/testing-strategy.md`
- `docs/development/checklists/pre-commit.md`
- matriz de testes especifica do dominio.

## Politica de atualizacao documental

Toda tarefa deve avaliar se altera:

- estado atual;
- backlog;
- regra de negocio;
- contrato de API;
- schema;
- validacao;
- frontend/UX;
- importacao;
- teste/verify/smoke;
- decisao tecnica;
- milestone.

Se sim, atualizar docs no mesmo ciclo ou registrar explicitamente a pendencia.

## Politica de remocao de docs

Nao excluir documentos em auditoria ampla sem uma decisao explicita.

Antes de excluir, classificar:

- fonte de verdade;
- documento auxiliar;
- historico ainda util;
- duplicado consolidavel;
- obsoleto sem referencia.

Se for obsoleto, preferir primeiro:
1. marcar como historico/auxiliar;
2. apontar para o doc atual;
3. excluir apenas em commit separado quando nao houver referencia util.
