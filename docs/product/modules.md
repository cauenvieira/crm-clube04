# Product Modules

## Objetivo

Definir os modulos de produto do CRM Clube04, suas responsabilidades, dependencias e relacao com as milestones.

Este documento organiza fronteiras de produto. Ele nao define sozinho regras operacionais detalhadas, payloads, schema ou testes.

## Fonte de autoridade

- Roadmap amplo: `docs/product/crm-platform-roadmap.md`.
- Hierarquia documental: `docs/development/documentation-hierarchy.md`.
- Estado atual: `docs/project-state.md`.
- Backlog: `docs/tasks.md`.
- Jornada do Lead: contrato operacional, normalizacao e matriz de testes.

## Principios de modularidade

- Cada modulo deve ter responsabilidade clara.
- Modulos futuros nao devem ser implementados antes da milestone correspondente.
- Frontend nao deve criar comportamento critico sem backend dono da regra.
- Integracoes devem entrar por adaptadores.
- Dados comuns devem ser preservados desde cedo para evitar retrabalho.

## Mapa de modulos

### 1. Cadastros Centrais

Milestones:
- M0/M1 base tecnica e suporte para Jornada do Lead.
- M5/M6 expansao para Jornada do Cliente e gestao.

Objetivo:
- manter base unica de tutor, pet, cliente e identificadores de relacionamento.

Usuarios principais:
- atendimento;
- lideranca;
- operacao.

Funcionalidades esperadas:
- cadastro;
- validacao de telefone;
- merge futuro;
- historico de alteracao;
- tags e segmentacao basica.

Dados principais:
- contact;
- customer;
- pet;
- tag;
- segment.

Dependencias:
- regra de duplicidade;
- auditoria;
- conversao consistente de lead para cliente.

Riscos:
- sem base central confiavel, os demais modulos acumulam retrabalho.

### 2. Jornada do Lead

Milestone:
- M1 foco atual.

Objetivo:
- substituir a planilha manual e operar funil com disciplina diaria.

Usuarios principais:
- atendentes;
- lideranca comercial.

Funcionalidades esperadas:
- cadastro/importacao de lead;
- status operacional;
- tentativas;
- resultado de contato;
- proxima acao;
- atrasado e backlog;
- revisao de lideranca;
- conversao, perda, desqualificacao e nutricao;
- historico e auditoria.

Dados principais:
- lead;
- interaction;
- action_item;
- source_attribution.

Dependencias:
- cadastro central;
- worklist;
- normalizacao de telefone;
- regras de importacao;
- canais de entrada.

Autoridade:
- `docs/product/lead-operational-contract.md`;
- `docs/product/lead-import-normalization.md`;
- `docs/qa/lead-business-rules-test-matrix.md`.

Riscos:
- sem rastreio de tentativas e SLA, a conversao cai e a lideranca perde visibilidade.

### 3. Mesa Operacional

Milestone:
- M2.

Objetivo:
- transformar dados de lead e action items em rotina diaria acionavel.

Usuarios principais:
- atendimento;
- lideranca;
- operacao.

Funcionalidades esperadas:
- atender hoje;
- atrasados;
- backlog;
- analise de lideranca;
- filtros;
- prioridades;
- indicadores simples;
- conclusao e movimentacao de tarefas.

Dados principais:
- action_item;
- lead;
- interaction;
- operational_summary.

Dependencias:
- M1 consistente;
- endpoints operacionais;
- regras de worklist.

Riscos:
- sem taxonomia clara, a mesa vira apenas lista visual e nao melhora disciplina de atendimento.

### 4. Omnichannel / Conversas

Milestone:
- M4, com preparacao transversal desde M1.

Objetivo:
- unificar historico de conversa em diferentes canais.

Usuarios principais:
- atendimento;
- lideranca.

Funcionalidades esperadas:
- inbox por conversa;
- contexto unificado;
- idempotencia;
- normalizacao de payloads;
- transferencia para humano;
- modo escuta antes de automacao ativa.

Dados principais:
- conversation;
- message;
- source_attribution;
- channel_event.

Dependencias:
- adaptadores de canal;
- politicas de idempotencia;
- observabilidade.

Riscos:
- acoplar canal diretamente no dominio aumenta custo de manutencao e risco operacional.

### 5. Jornada do Cliente

Milestone:
- M5.

Objetivo:
- continuar relacionamento apos conversao do lead.

Usuarios principais:
- atendimento;
- retencao;
- lideranca.

Funcionalidades esperadas:
- onboarding;
- rotina de acompanhamento;
- reativacao;
- renovacao;
- NPS futuro;
- aniversario;
- ClubeBox.

Dados principais:
- customer;
- pet;
- interaction;
- action_item;
- package;
- segment.

Dependencias:
- conversao de lead consistente;
- dados de atendimento;
- agenda/servicos/producao.

Riscos:
- sem esse modulo, o CRM vira apenas funil de entrada e perde recorrencia.

### 6. Agenda / Servicos / Producao

Milestone:
- M6, com preparacao futura em M5.

Objetivo:
- ligar operacao comercial com execucao de atendimento.

Usuarios principais:
- recepcao;
- operacao de loja;
- lideranca.

Funcionalidades esperadas:
- agenda;
- servicos prestados;
- capacidade;
- gargalos;
- banho, tosa e extras;
- producao por colaborador.

Dados principais:
- appointment;
- service;
- package;
- sale;
- collaborator.

Dependencias:
- integracao somente leitura com sistema Clube04 ou exportacao confiavel;
- modelo de pet/cliente.

Riscos:
- dados incompletos geram falsas decisoes de capacidade, metas e retorno previsto.

### 7. Metas e Performance

Milestone:
- M6.

Objetivo:
- substituir planilhas de metas por modulo confiavel e auditavel.

Usuarios principais:
- lideranca;
- franqueados;
- operacao comercial.

Funcionalidades esperadas:
- meta mensal;
- meta diaria;
- realizado;
- desvio;
- tendencia;
- visao por loja e colaborador.

Dados principais:
- goal;
- metric;
- report;
- sale;
- production_fact.

Dependencias:
- fatos de vendas/atendimentos confiaveis;
- dimensoes padronizadas.

Riscos:
- metas sem separacao entre configuracao, realizado e calculo geram indicadores contestaveis.

### 8. Relatorios e Alertas

Milestones:
- M2/M6.

Objetivo:
- entregar leitura diaria acionavel para equipe e lideranca.

Usuarios principais:
- atendimento;
- lideranca;
- operacao.

Funcionalidades esperadas:
- resumo diario;
- alertas de SLA;
- exportacao;
- historico de acompanhamento;
- desvio de meta;
- prioridade operacional.

Dados principais:
- report;
- metric;
- action_item;
- operational_summary.

Dependencias:
- summary/worklist maduros;
- taxonomia de status;
- rotina de envio.

Riscos:
- alertas sem prioridade viram ruido.

### 9. Marketing e ROI

Milestone:
- M4/M6 futuro.

Objetivo:
- conectar investimento de origem com resultado operacional e comercial.

Usuarios principais:
- marketing;
- lideranca comercial;
- franqueados.

Funcionalidades esperadas:
- atribuicao por canal/campanha;
- CAC;
- conversao por origem;
- ROI por campanha.

Dados principais:
- source_attribution;
- lead;
- sale;
- metric.

Dependencias:
- preservacao de origem desde M1;
- padrao de campanha;
- integracoes Ads futuras.

Riscos:
- sem origem preservada desde cedo, ROI fica parcial e contestavel.

### 10. Integracoes

Milestone:
- transversal, principalmente M4/M6.

Objetivo:
- integrar canais e sistemas externos com baixa friccao e baixo acoplamento.

Usuarios principais:
- engenharia;
- operacao.

Funcionalidades esperadas:
- conectores/adaptadores;
- retries;
- idempotencia;
- monitoramento;
- controle de cursor/estado.

Dados principais:
- channel_event;
- sync_log;
- message;
- external_reference.

Dependencias:
- contratos de dominio estaveis;
- observabilidade;
- politicas de erro.

Riscos:
- integracao sem adaptador aumenta custo de manutencao e risco de quebra.

### 11. Administracao, Seguranca e Auditoria

Milestone:
- M6 antes de uso operacional amplo.

Objetivo:
- permitir operacao real com controle de acesso e rastreabilidade.

Usuarios principais:
- administracao;
- lideranca;
- compliance operacional.

Funcionalidades esperadas:
- auth real;
- roles;
- permissao por modulo;
- audit trail;
- mascaramento de dados sensiveis;
- trilha de decisao operacional.

Dados principais:
- user;
- role;
- permission;
- audit_log.

Dependencias:
- identidade;
- session management;
- governanca de dados.

Riscos:
- API key/localStorage serve para dev, mas nao e suficiente para operacao real.

## Modulos fora de foco imediato

Nao implementar agora sem nova decisao:

- Jornada do Cliente completa;
- Metas e Performance;
- ROI de marketing;
- IA autonoma;
- WhatsApp real com resposta automatica;
- auth completo para operacao real.

Esses modulos devem permanecer como roadmap ate que M1/M2 estejam operacionalmente consistentes.
