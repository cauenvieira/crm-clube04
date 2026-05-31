# Product Modules

## 1) Cadastros Centrais

- Objetivo: manter base unica de tutor, pet, cliente e identificadores de relacionamento.
- Usuarios principais: atendimento, lideranca, operacao.
- Funcionalidades esperadas: cadastro, merge, historico de alteracao, tags e segmentacao basica.
- Dados principais: contact, customer, pet, tag, segment.
- Dependencias: validacao de telefone, regras de duplicidade, auditoria.
- Fase sugerida: 1-2.
- Riscos/observacoes: sem base central confiavel, os demais modulos acumulam retrabalho.

## 2) Jornada do Lead

- Objetivo: substituir planilha manual e operar funil com disciplina diaria.
- Usuarios principais: atendentes, lideranca comercial.
- Funcionalidades esperadas: tentativa, status, proxima acao, dono do caso, revisao de excecao.
- Dados principais: lead, interaction, action_item, source_attribution.
- Dependencias: cadastro central, worklist, canais de entrada.
- Fase sugerida: 2.
- Riscos/observacoes: sem rastreio de tentativas e SLA, a conversao cai e a governanca fica fraca.

## 3) Omnichannel / Conversas

- Objetivo: unificar historico de conversa em diferentes canais.
- Usuarios principais: atendimento e lideranca.
- Funcionalidades esperadas: inbox por conversa, contexto unificado, idempotencia, normalizacao.
- Dados principais: conversation, message, source_attribution.
- Dependencias: adaptadores de canal, politicas de idempotencia, observabilidade.
- Fase sugerida: 2-5.
- Riscos/observacoes: nao acoplar canal diretamente no dominio; usar adaptadores.

## 4) Jornada do Cliente

- Objetivo: continuar relacionamento apos conversao do lead.
- Usuarios principais: atendimento, retencao, lideranca.
- Funcionalidades esperadas: onboarding, rotina de acompanhamento, NPS futuro, reativacao.
- Dados principais: customer, pet, interaction, action_item, segment.
- Dependencias: conversao de lead consistente e dados de atendimento.
- Fase sugerida: 3.
- Riscos/observacoes: sem esse modulo, o CRM vira apenas funil de entrada e perde recorrencia.

## 5) Agenda / Servicos / Producao

- Objetivo: ligar operacao comercial com execucao de atendimento.
- Usuarios principais: recepcao, operacao de loja, lideranca.
- Funcionalidades esperadas: agenda, servicos prestados, capacidade e gargalos.
- Dados principais: appointment, service, package, sale.
- Dependencias: integracao com sistema Clube04 (scraping/API), modelo de pet.
- Fase sugerida: 3-4.
- Riscos/observacoes: dados incompletos geram falsas decisoes de capacidade e retorno previsto.

## 6) Metas e Performance

- Objetivo: substituir planilhas de metas por modulo confiavel e auditavel.
- Usuarios principais: lideranca, franqueados, operacao comercial.
- Funcionalidades esperadas: meta mensal/diaria, realizado, desvio, visao por loja e colaborador.
- Dados principais: goal, metric, report.
- Dependencias: fatos de vendas/atendimentos confiaveis e dimensoes padronizadas.
- Fase sugerida: 4.
- Riscos/observacoes: separar claramente configuracao, realizado, calculo e visualizacao.

## 7) Relatorios e Alertas

- Objetivo: entregar leitura diaria acionavel para a equipe.
- Usuarios principais: atendimento, lideranca e operacao.
- Funcionalidades esperadas: resumo diario, alertas de SLA, exportacao, trilha de acompanhamento.
- Dados principais: report, metric, action_item.
- Dependencias: summary/worklist maduros, rotina de envio e templates.
- Fase sugerida: 4-6.
- Riscos/observacoes: sem taxonomia de status e prioridade, alertas viram ruido.

## 8) Marketing e ROI

- Objetivo: conectar investimento de origem com resultado operacional e comercial.
- Usuarios principais: marketing, lideranca comercial, franqueados.
- Funcionalidades esperadas: atribuicao por canal/campanha, CAC, conversao por origem.
- Dados principais: source_attribution, lead, sale, metric.
- Dependencias: integracoes Ads e padrao de campanha.
- Fase sugerida: 5.
- Riscos/observacoes: sem preservacao de origem desde cedo, ROI fica parcial e contestavel.

## 9) Integracoes

- Objetivo: integrar canais e sistemas externos com baixa friccao.
- Usuarios principais: engenharia e operacao.
- Funcionalidades esperadas: conectores/adaptadores, retries, idempotencia e monitoramento.
- Dados principais: mensagens, eventos, logs de sync, estado de cursor.
- Dependencias: contratos de dominio estaveis, observabilidade e politicas de erro.
- Fase sugerida: transversal (1-6).
- Riscos/observacoes: integracao sem adaptador aumenta custo de manutencao e risco de quebra.

## 10) Administracao, Seguranca e Auditoria

- Objetivo: permitir operacao real com controle de acesso e rastreabilidade.
- Usuarios principais: administracao, lideranca e compliance.
- Funcionalidades esperadas: auth real, roles, permissao por modulo, audit trail, mascaramento.
- Dados principais: usuario, perfil, permissoes, audit_log.
- Dependencias: identidade, session management, governanca de dados.
- Fase sugerida: 6 (antes de rollout amplo real).
- Riscos/observacoes: API key/localStorage serve para dev; nao e suficiente para operacao real.
