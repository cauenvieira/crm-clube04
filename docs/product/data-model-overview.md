# Data Model Overview

## Objetivo

Descrever o modelo conceitual do CRM Clube04 em nivel de produto, sem substituir o schema fisico documentado em `docs/database/schema.md`.

Este documento ajuda a manter a evolucao orientada a jornada: lead, atendimento, conversao, cliente, recorrencia, pacotes, metas e gestao.

## Principios

- `contact` identifica a pessoa/tutor e preserva telefone normalizado.
- `lead` representa oportunidade antes da conversao.
- `customer` representa cliente apos conversao ou importacao do sistema oficial.
- `pet` e a unidade operacional de recorrencia e servico.
- `action_item` materializa o que a equipe precisa fazer.
- `crm_interactions` preserva historico/auditoria operacional.
- Origem/campanha devem ser preservadas desde o inicio para ROI futuro.

## Entidades existentes ou base

### contact

Identidade principal de pessoa/tutor.

Relacoes principais:

- lead;
- conversation;
- message;
- crm_interaction;
- action_item;
- customer.

Observacao: telefone normalizado e chave operacional critica de deduplicacao, mas nao deve virar unica base de identidade em todos os cenarios.

### lead

Oportunidade comercial antes de virar cliente.

Relacoes principais:

- contact;
- crm_interaction;
- action_item;
- origem/campanha.

Regra: comportamento operacional do lead e definido pelo contrato da Jornada do Lead.

### conversation

Agrupador de mensagens por canal/provedor.

Relacoes principais:

- contact;
- message.

Observacao: idempotencia por provider e identificadores externos.

### message

Evento de comunicacao inbound/outbound.

Observacao: deve preservar payload bruto quando seguro e util para auditoria tecnica.

### crm_interaction

Registro operacional manual ou sistemico de atendimento.

Deve registrar decisoes relevantes, resultados e historico de contato.

### action_item

Motor de tarefas operacionais.

Base para:

- atender hoje;
- follow-up;
- retomada;
- revisao de lideranca;
- alertas;
- worklist;
- summary.

### customer

Cliente/tutor apos conversao ou importacao do sistema oficial.

A conversao de lead deve preservar origem e campanha para analise futura.

### pet

Unidade operacional de recorrencia, frequencia e servico.

No futuro, deve sustentar:

- frequencia cadastrada;
- frequencia real;
- risco de inatividade;
- pacote e renovacao;
- NPS e experiencia.

### appointment

Agenda planejada ou historica quando disponivel.

Deve vir de integracao somente leitura com sistema operacional ate decisao contraria.

### service

Atendimento efetivamente realizado.

Base futura para frequencia real, recorrencia, producao e ticket.

### package

Controle de pacotes e saldo.

Importante para renovacao, risco de churn e recorrencia.

## Entidades futuras ou parciais

### source_attribution

Origem/campanha historica em nivel mais robusto.

Hoje pode estar parcial em campos como `source` e `campaign`.

### tag

Classificacao flexivel para filtros, campanhas e segmentacao.

Nao deve substituir status operacional do lead.

### segment

Agrupamento por regra de negocio para comunicacao, recuperacao e analise.

### sale

Evento comercial consolidado.

Pode nascer de servico/pacote quando o modulo financeiro operacional evoluir.

### goal

Configuracao de metas por periodo, loja e colaborador.

Deve separar meta definida, realizado e calculo.

### metric

Medida calculada para operacao e gestao.

Deve ter regra unica para evitar divergencia entre dashboard, relatorio e exportacao.

### report

Pacote de leitura diaria/semanal/mensal para decisao humana.

### automation_rule

Regra declarativa futura de automacao e alertas.

Deve ser auditavel e reversivel.

### audit_log

Trilha de alteracao para seguranca e governanca.

Obrigatorio antes de operacao real multiusuario.

## Maturidade

- Existe: entidade ja presente no schema/API atual.
- Parcial: conceito existe em campos, payloads ou services, mas ainda nao como entidade dedicada.
- Futuro: depende de sprint e contrato proprio.

## Regras de evolucao

- Nao criar entidade futura sem sprint aprovada.
- Nao alterar schema como efeito colateral de feature simples.
- Se schema mudar, atualizar `docs/database/schema.md` e API/docs/testes.
- Se a mudanca afetar lead, atualizar contrato operacional e matriz.
