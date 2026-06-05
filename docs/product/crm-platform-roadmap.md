# CRM Platform Roadmap

## Objetivo

Definir a direcao de produto do CRM Clube04 como centro operacional incremental para o Clube04 Mogi das Cruzes.

Este documento orienta roadmap, prioridades e limites de escopo. Ele nao substitui contratos especificos de regra de negocio, API, schema ou testes.

## Fonte de autoridade

- Para hierarquia documental: `docs/development/documentation-hierarchy.md`.
- Para estado atual: `docs/project-state.md`.
- Para backlog: `docs/tasks.md`.
- Para Jornada do Lead: `docs/product/lead-operational-contract.md`, `docs/product/lead-import-normalization.md` e `docs/qa/lead-business-rules-test-matrix.md`.

Em caso de conflito entre este roadmap e um contrato operacional especifico, o contrato especifico vence.

## Visao do produto

O CRM Clube04 deve evoluir de um conjunto de telas e endpoints para um centro de operacoes e controle da unidade.

O sistema deve apoiar a rotina real do Clube04 Mogi:

- leads de trafego pago e WhatsApp;
- atendimento humano disciplinado;
- conversao em agendamento;
- acompanhamento de recorrencia;
- pacotes, renovacao e reativacao;
- metas, equipe, producao e indicadores;
- NPS, financeiro operacional e alertas;
- automacoes controladas e IA em modo apoio.

A Jornada do Lead e o foco funcional atual, mas nao e o limite final do produto.

## Principios de produto

1. Operacao diaria primeiro: a equipe precisa saber o que fazer hoje.
2. Worklist antes de relatorio: painel bonito sem acao operacional gera pouco valor.
3. Lead vira cliente: preservar continuidade depois da conversao.
4. Regra no backend: movimentacao critica nao deve existir apenas no frontend.
5. Dados rastreaveis: origem, campanha, tentativa, decisao e historico devem ser preservados.
6. Integracoes por adaptadores: nao acoplar dominio diretamente a WhatsApp, n8n, WAHA ou ERP.
7. Automacao com controle: IA e automacoes iniciam como sugestao, espelho, alerta ou apoio supervisionado.
8. Evolucao incremental: cada milestone deve entregar valor operacional sem criar dependencias amplas demais.
9. Documentacao viva: codigo, regra, teste e docs devem fechar juntos.

## Estado atual resumido

Estado detalhado fica em `docs/project-state.md`.

Ja existe base tecnica para evolucao incremental:

- monorepo Node/TypeScript;
- Fastify API;
- Postgres e Redis via Docker Compose;
- React/Vite em `apps/web`;
- n8n local versionado;
- contatos, leads, conversas, mensagens, interacoes e action items;
- worklist e summary operacional;
- UI Foundation em `apps/web/src/components/ui`;
- verificacoes operacionais e `verify:all` sequencial;
- contrato operacional documentado para Jornada do Lead;
- sync automatico dos Markdown para Google Drive `repo-docs`.

## Milestones do produto

### M0 - Fundacao tecnica e governanca

Objetivo:
- manter repo, Docker, banco, scripts, UI Foundation, docs, fluxo seguro e fontes sincronizadas.

Status:
- base tecnica criada;
- hierarquia documental em consolidacao;
- sync ChatGPT/Drive ativo.

Cuidado:
- nao transformar M0 em reescrita ampla.

### M1 - Jornada do Lead

Objetivo:
- substituir a planilha manual por fluxo operacional rastreavel de lead.

Inclui:
- base de leads;
- importacao;
- regras operacionais;
- tentativas;
- follow-up;
- atrasados;
- backlog;
- analise de lideranca;
- conversao;
- historico e rastreabilidade.

Status:
- foco funcional atual.

Autoridade:
- `docs/product/lead-operational-contract.md`;
- `docs/product/lead-import-normalization.md`;
- `docs/qa/lead-business-rules-test-matrix.md`.

### M2 - Mesa Operacional

Objetivo:
- dar visao diaria acionavel para atendimento e lideranca.

Inclui:
- atender hoje;
- atrasados;
- backlog;
- analise de lideranca;
- concluidos;
- filtros;
- movimentacao operacional;
- indicadores de prioridade.

Dependencia:
- M1 suficientemente consistente.

### M3 - Importacao robusta e saneamento

Objetivo:
- importar e reconciliar dados da planilha legada com seguranca.

Inclui:
- de-para da planilha;
- invalidos;
- deduplicacao;
- normalizacao;
- quarentena;
- reimportacao segura.

Autoridade:
- `docs/product/lead-import-normalization.md`.

### M4 - Atendimento e WhatsApp

Objetivo:
- unificar historico e preparar automacoes controladas de atendimento.

Inclui:
- historico;
- templates;
- automacoes;
- n8n, WAHA, Z-API ou BSP;
- transferencia para humano;
- modo escuta antes de resposta automatica.

Cuidado:
- nao automatizar resposta autonoma ao cliente sem supervisao e sem fallback humano.

### M5 - Jornada do Cliente

Objetivo:
- continuar relacionamento apos conversao.

Inclui:
- recorrencia;
- pacotes;
- renovacao;
- reativacao;
- aniversario;
- NPS;
- ClubeBox.

Dependencia:
- conversao e cadastro de cliente/pet confiaveis.

### M6 - Operacao, metas e gestao

Objetivo:
- transformar dados operacionais em gestao diaria.

Inclui:
- metas;
- producao por colaborador;
- agenda;
- banho, tosa e extras;
- alertas;
- dashboards;
- financeiro operacional.

Cuidado:
- separar configuracao de metas, realizado, calculo e visualizacao.

### M7 - IA e automacao avancada

Objetivo:
- apoiar decisao e execucao com IA controlada.

Inclui:
- assistente;
- simulador;
- recomendacoes;
- classificacao;
- RAG;
- automacoes com gates de seguranca.

Cuidado:
- IA nao deve ser dona unica de decisao operacional sensivel.

## Prioridade atual

A prioridade de curto prazo e:

1. concluir governanca documental dos Markdown;
2. reconciliar API/docs apos backend operacional;
3. reconciliar docs de dashboard antes do rebuild visual;
4. fechar lacunas prioritarias da matriz de testes da Jornada do Lead;
5. iniciar Base de Leads visual usando UI Foundation;
6. evoluir Mesa Operacional depois da Base de Leads.

## O que nao fazer agora

- Criar modulo futuro apenas porque parece util.
- Implementar automacao real de WhatsApp sem modo controlado.
- Criar metas sem separar configuracao, realizado e calculo.
- Copiar arquitetura Lovable.
- Reaproveitar frontend rejeitado sem avaliacao.
- Alterar regra da Jornada do Lead por inferencia do codigo.
- Misturar dashboard, regra de negocio e integracao externa na mesma tarefa.

## Riscos de produto

- Tratar o CRM como SaaS generico e perder aderencia a operacao real do Clube04.
- Criar telas sem disciplina operacional por tras.
- Ter regras duplicadas entre frontend, backend, docs e planilha.
- Avancar para Jornada do Cliente sem conversao de lead consistente.
- Usar dados incompletos para metas e decisao de lideranca.
- Automatizar atendimento antes de ter rastreabilidade, fallback e controle humano.
