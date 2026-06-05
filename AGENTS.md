# AGENTS.md - CRM Clube04

## Objetivo permanente

Construir, de forma incremental, um centro de operacoes e controle para o Clube04 Mogi das Cruzes.

O sistema deve apoiar a rotina operacional real da unidade: leads, atendimento, WhatsApp, agenda, clientes, pacotes, metas, equipe, producao, NPS, financeiro operacional, indicadores e automacoes.

O foco funcional atual e a Jornada do Lead, mas ela e apenas o primeiro grande modulo do produto.

Nao trate o projeto como SaaS generico. As decisoes devem respeitar a operacao real do Clube04: atendimento via WhatsApp, leads de trafego pago, conversao em agendamento, recorrencia, pacotes, recuperacao, analise de lideranca e acompanhamento operacional diario.

## Regras inegociaveis

- Nunca salvar credenciais reais no codigo.
- Usar `.env` para segredos e manter `.env` fora do Git.
- Nunca versionar dados reais: CSV, XLSX, dumps, exports internos, prints, logs, tokens, credenciais ou backups locais.
- Nunca versionar `.tmp/`, `.chatgpt-sources/`, `node_modules/`, `dist/` ou artefatos locais.
- Nao alterar dados no sistema Clube04; scraping deve ser somente leitura.
- Manter mudancas pequenas, incrementais e com escopo limitado.
- Nao misturar feature com refatoracao ampla na mesma tarefa.
- Nao alterar API, schema, endpoints, n8n, Docker ou workflow sensivel sem autorizacao explicita.
- Nao usar `git add -A`.
- Nao usar `git add .` sem revisao explicita.
- Nao commitar ou fazer push sem autorizacao explicita.
- Nao reescrever historico ja enviado sem pedido explicito.
- Nao orientar `reset --hard`, `clean`, `stash pop` ou `stash drop` sem avaliar risco.
- Se houver risco de perda de trabalho, pedir `git status --short`, `git diff` e `git stash list`.

## Fonte sincronizada para ChatGPT

A pasta Google Drive abaixo e um espelho automatico dos arquivos Markdown versionados do repo:

`https://drive.google.com/drive/folders/10sGqCPw1Sef7JM2cclREeUGLAgcaXSTs?usp=sharing`

- O sync e feito por GitHub Actions + rclone apos push na `main` quando arquivos `.md`, workflow ou script de sync mudam.
- Consultar `PROJECT_CONTEXT_INDEX.md` no Drive para ver commit, branch, data e lista de arquivos sincronizados.
- O repositorio Git continua sendo a fonte de verdade.
- O Drive e apenas fonte de consulta para chats.
- A pasta `dados-sensiveis` no Drive fica fora do sync e pode conter a planilha de leads copiada manualmente. Tratar como dado sensivel e consultar apenas quando necessario.

## Hierarquia documental

Leia `docs/development/documentation-hierarchy.md` para a regra completa.

Resumo de autoridade:

1. `AGENTS.md`: regras gerais, seguranca, Git, hierarquia e roteamento de contexto.
2. `README.md`: entrada humana do projeto e comandos principais.
3. `docs/project-state.md`: estado atual commitado do projeto.
4. `docs/tasks.md`: backlog, prioridades e proximos passos.
5. Contratos especificos de produto/API/schema/teste: vencem sobre docs auxiliares.
6. ADRs/decisoes: justificam decisoes tecnicas ja aceitas.
7. Docs auxiliares, historicos e escopos antigos: nao vencem contratos atuais.
8. Memoria de chat: nunca vence documento versionado atual.

Em caso de conflito:
- contrato especifico vence;
- depois matriz de testes/API/schema;
- depois decisao tecnica registrada;
- depois `project-state`;
- depois `tasks`;
- depois docs auxiliares;
- por ultimo memoria do chat.

## Roteamento por tipo de tarefa

Antes de editar, classifique a milestone e leia os documentos do tipo de tarefa.

### Tarefa geral / planejamento

Leia:
- `AGENTS.md`
- `README.md`
- `docs/project-state.md`
- `docs/tasks.md`
- `docs/development/documentation-hierarchy.md`

### Produto, roadmap ou escopo

Leia:
- `docs/product/crm-platform-roadmap.md`
- `docs/product/modules.md`
- `docs/product/operational-flows.md`
- `docs/roadmap.md`
- `docs/tasks.md`

### Jornada do Lead

Leia obrigatoriamente:
- `docs/product/lead-operational-contract.md`
- `docs/product/lead-import-normalization.md`
- `docs/qa/lead-business-rules-test-matrix.md`

`docs/product/lead-operational-scope.md` e auxiliar. Se houver conflito, o contrato operacional vence.

### Backend/API

Leia:
- `docs/backend/api-agent.md`
- `docs/api/rest-api.md`
- `docs/database/schema.md`
- `docs/architecture/code-organization.md`

Se envolver lead, leia tambem os tres documentos obrigatorios da Jornada do Lead.

### Frontend

Leia:
- `docs/frontend/design-system.md`
- `docs/frontend/components-catalog.md`
- `docs/frontend/lovable-adaptation-guide.md`

Use `apps/web/src/components/ui`. Nao criar biblioteca paralela de componentes. Lovable e referencia visual, nao fonte de arquitetura.

Se envolver regra de lead, leia tambem os tres documentos obrigatorios da Jornada do Lead.

### Importacao / planilha de leads

Leia:
- `docs/product/lead-import-normalization.md`
- `docs/qa/lead-business-rules-test-matrix.md`
- `docs/imports/*`

Nunca versionar planilha real.

### Integracoes, WhatsApp, n8n, WAHA ou Clube04

Leia:
- `docs/integrations/*`
- `docs/development/checklists/integration.md`
- docs relevantes em `apps/api/src/integrations/*/readme.md`

Nao executar automacao real nem alterar sistemas externos sem autorizacao.

### QA, smoke, verify ou testes

Leia:
- `docs/qa/verification-agent.md`
- `docs/development/testing-strategy.md`
- `docs/development/checklists/pre-commit.md`
- matriz de testes de negocio quando envolver lead.

## Regra critica da Jornada do Lead

Nao alterar comportamento operacional por inferencia do codigo.

Antes de mudar status, action item, outcome, cadencia de tentativa, sem resposta, lideranca, nutricao/campanha, perda, desqualificacao, conversao, importacao, normalizacao ou indicadores, consultar:

- `docs/product/lead-operational-contract.md`
- `docs/product/lead-import-normalization.md`
- `docs/qa/lead-business-rules-test-matrix.md`

Se uma regra operacional mudar, atualizar contrato, docs e matriz/testes na mesma tarefa.

O backend e dono do comportamento de ciclo de vida. Movimentacao critica nao deve existir apenas no frontend.

## Milestones

0. Fundacao tecnica: repo, Docker, banco, scripts, UI Foundation, docs, fluxo seguro e fontes sincronizadas.
1. Jornada do Lead: base de leads, importacao, regras operacionais, tentativas, follow-up, atrasados, backlog, lideranca, conversao e rastreabilidade. Foco funcional atual.
2. Mesa Operacional: painel diario, indicadores, atender hoje, atrasados, backlog, analise de lideranca, concluidos, filtros e movimentacao.
3. Importacao robusta e saneamento: de-para da planilha, invalidos, deduplicacao, normalizacao e reimportacao segura.
4. Atendimento e WhatsApp: historico, templates, automacoes, n8n/WAHA/Z-API/BSP e transferencia para humano.
5. Jornada do Cliente: recorrencia, pacotes, renovacao, reativacao, aniversario, NPS e ClubeBox.
6. Operacao, metas e gestao: metas, producao por colaborador, agenda, banho/tosa/extras, alertas e dashboards.
7. IA e automacao avancada: assistente, simulador, recomendacoes, classificacao, RAG e automacoes controladas.

Se uma tarefa misturar milestones, propor quebra.

## Organizacao de codigo

- Evitar arquivos acima de 250-300 linhas.
- Evitar funcoes longas com responsabilidades misturadas.
- `routes`: HTTP, validacao de entrada, chamada de service e resposta.
- `services`: regra de negocio e orquestracao.
- `repositories`: SQL e acesso ao banco.
- `validation/schemas`: payload, params, query e enums.
- `integrations`: comunicacao com sistemas externos.
- `worker`: jobs segmentados por dominio.
- Preferir nomes explicitos a arquivos genericos.

## Validacao

Escolha validacoes proporcionais ao escopo.

- Geral: `npm run build`, `npm run lint`, `npm run verify:all`, `npm run verify:data-cleanliness`.
- Backend: `npm run smoke:api`, `npm run verify:operational-summary`, `npm run verify:operational-worklist`, `npm run verify:lead-operational-cycle`.
- Frontend: `npm run verify:frontend`, `npm run verify:dashboard`.
- Docs-only: `git diff --check` e `npm run verify:data-cleanliness`.

Executar smoke/verify em sequencia. Nao rodar baterias em paralelo no mesmo banco local.

## Retroalimentacao documental

Ao concluir qualquer tarefa, avaliar se a mudanca altera:

- estado atual do projeto;
- regra de negocio;
- API, payload, schema ou validacao;
- frontend, fluxo de tela ou padrao visual;
- importacao ou normalizacao;
- testes, smoke, verify ou data-cleanliness;
- decisao tecnica relevante;
- prioridade, milestone ou backlog.

Se sim, atualizar ou sugerir atualizacao nos docs correspondentes.

Nao considerar tarefa concluida se codigo, regra, teste e documentacao ficarem incoerentes.

## Fechamento de tarefa

Relatorio final deve conter:

1. O que mudou.
2. Arquivos alterados.
3. Validacoes executadas.
4. Se docs precisam atualizar.
5. Se milestones/backlog mudaram.
6. Git status esperado.
7. Proximo passo recomendado.

Mantenha o relatorio compacto. Logs completos apenas para erros ou troubleshooting.
