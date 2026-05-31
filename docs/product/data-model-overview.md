# Data Model Overview

## Principio geral

Modelo orientado a jornada: entrada de lead, atendimento, conversao, recorrencia e performance.

## Entidades

### contact
- Finalidade: identidade principal de pessoa/tutor.
- Relacoes principais: lead, conversation, message, interaction, action_item, customer.
- Estado: existe.
- Observacoes: telefone normalizado e chave critica de deduplicacao.

### pet
- Finalidade: unidade operacional de recorrencia e servico.
- Relacoes principais: customer, contact, appointment, service, package, interaction.
- Estado: existe (base).
- Observacoes: deve sustentar frequencia cadastrada e frequencia real.

### lead
- Finalidade: oportunidade comercial antes da conversao.
- Relacoes principais: contact, interaction, action_item, source_attribution.
- Estado: existe.
- Observacoes: manter historico de tentativas, status e proxima acao.

### customer
- Finalidade: estado de cliente apos conversao.
- Relacoes principais: contact, pet, appointment, service, package, interaction.
- Estado: existe (base).
- Observacoes: conversao de lead deve preservar origem.

### conversation
- Finalidade: agrupador de mensagens por canal/provedor.
- Relacoes principais: contact, message.
- Estado: existe.
- Observacoes: idempotencia por provider/providerConversationId.

### message
- Finalidade: evento de comunicacao inbound/outbound.
- Relacoes principais: conversation, contact, lead (efeito indireto via servico).
- Estado: existe.
- Observacoes: idempotencia por provider/providerMessageId e preservacao de raw_payload.

### interaction
- Finalidade: registro operacional manual de atendimento.
- Relacoes principais: contact, lead, customer, pet.
- Estado: existe como `crm_interactions`.
- Observacoes: pode fechar follow-ups automaticamente.

### action_item
- Finalidade: motor de tarefas operacionais do dia.
- Relacoes principais: lead, contact, customer, pet, package.
- Estado: existe.
- Observacoes: base do worklist e gatilho de rotina comercial.

### tag
- Finalidade: classificacao flexivel de contatos/leads/clientes.
- Relacoes principais: contact, lead, customer, segment.
- Estado: futuro.
- Observacoes: usar para filtros operacionais e campanhas.

### segment
- Finalidade: agrupamento logico por regra de negocio.
- Relacoes principais: contact, lead, customer, tag, metric.
- Estado: futuro.
- Observacoes: importante para reativacao e comunicacao dirigida.

### source_attribution
- Finalidade: preservar origem e campanha em toda a jornada.
- Relacoes principais: lead, conversation, message, sale.
- Estado: parcial (campos source/campaign existem em leads e payloads).
- Observacoes: evoluir para entidade dedicada e historica.

### appointment
- Finalidade: agenda de atendimento planejado.
- Relacoes principais: customer, pet, contact, service.
- Estado: existe (base).
- Observacoes: depende de integracao estavel com sistema operacional.

### service
- Finalidade: atendimento efetivamente realizado.
- Relacoes principais: appointment, customer, pet, sale, metric.
- Estado: existe (base).
- Observacoes: dado central para frequencia real e recorrencia.

### sale
- Finalidade: evento comercial consolidado (ticket, receita, conversao).
- Relacoes principais: lead, customer, service, goal, metric, source_attribution.
- Estado: futuro.
- Observacoes: pode nascer de servico/pacote enquanto nao houver entidade dedicada.

### package
- Finalidade: controle de pacotes, saldo e renovacao.
- Relacoes principais: customer, pet, service, action_item.
- Estado: existe (base).
- Observacoes: chave para risco de churn e follow-up de renovacao.

### goal
- Finalidade: configuracao de metas por periodo, loja e colaborador.
- Relacoes principais: metric, report, sale.
- Estado: futuro.
- Observacoes: separar meta definida de meta calculada.

### metric
- Finalidade: medidas calculadas para operacao e gestao.
- Relacoes principais: goal, report, lead, sale, service.
- Estado: futuro/parcial (summary/worklist sao precursores).
- Observacoes: padrao unico de calculo evita divergencia em dashboard e exportacao.

### report
- Finalidade: pacote de informacao para leitura humana diaria/semanal/mensal.
- Relacoes principais: metric, goal, action_item.
- Estado: futuro.
- Observacoes: deve suportar entrega em chat/email e export.

### automation_rule
- Finalidade: regra declarativa de automacao e alertas.
- Relacoes principais: action_item, interaction, message, report.
- Estado: futuro.
- Observacoes: comecar por regras simples com logs e rollback facil.

### audit_log
- Finalidade: trilha de alteracao para seguranca e governanca.
- Relacoes principais: todas entidades criticas.
- Estado: futuro.
- Observacoes: requisito para operacao real com multiplos usuarios.

## Leitura de maturidade

- Existe: entidades operacionais basicas ja no schema/API atual.
- Parcial: entidade ainda implodida em campos ou logica de servico.
- Futuro: depende de novos modulos e regras de governanca.
