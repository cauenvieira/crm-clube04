# CRM Platform Roadmap

## Visao do produto

O CRM Clube04 deve evoluir de um conjunto de telas e endpoints para uma plataforma operacional comercial completa.
O foco e conectar jornada de lead, atendimento, conversao, recorrencia e performance em um fluxo unico.

## Principios de produto

1. Operacao diaria primeiro: worklist e acao objetiva antes de relatorios sofisticados.
2. Lead ao cliente: a jornada nao termina na conversao.
3. Dados rastreaveis: origem, atribuicao e historico preservados desde o inicio.
4. Crescimento modular: cada modulo com fronteira clara e contratos simples.
5. Integracao por adaptadores: evitar acoplamento direto com canais e sistemas externos.
6. Automacao com controle: IA e automacoes iniciam em modo sugestao e apoio.
7. Seguranca evolutiva: API key local em dev; auth, permissoes e auditoria antes de uso real.

## Estado atual (ja existe)

- API CRM com contatos, leads, conversas, mensagens e interactions.
- Action items com geracao e ciclo de vida.
- Webhook inbound WhatsApp de teste.
- n8n local com fluxo versionado.
- Operational summary e worklist.
- Dashboard local/dev.
- Higiene de dados dev e `verify:all` sequencial.

## Fases recomendadas

### Fase 1 - Base operacional (concluida/parcial)

- Cadastros basicos, funil inicial de lead e rotinas diarias.
- Painel operacional com visao de prioridade.
- Base de automacao por regra com action_items.

### Fase 2 - Jornada do Lead robusta

- Espelhar e substituir a planilha "Jornada do Lead".
- Controle de tentativas, proxima acao, SLA e revisao de lideranca.
- Tabela/exportacao para conferencia diaria.

### Fase 3 - Jornada do Cliente e recorrencia

- Continuidade apos conversao: cliente, pet, atendimento e pacotes.
- Riscos de inatividade, reativacao e follow-up de recorrencia.
- Integracao com agenda/servicos/producao.

### Fase 4 - Metas e performance

- Separar configuracao de metas, realizado, calculo e visualizacao.
- Metas mensal/diaria por loja e colaborador.
- Alertas de desvio e comparacao com historico.

### Fase 5 - Omnichannel e marketing/ROI

- Expandir para Instagram/Facebook e futuras entradas.
- Atribuicao de origem e campanha ponta a ponta.
- Integracoes com Meta Ads/Google Ads (quando pronto).

### Fase 6 - Relatorios, automacao avancada e governanca

- Relatorio diario em canais internos (chat/email/etc.).
- IA em modo sugestao para priorizacao e proxima melhor acao.
- Auth real, permissoes por perfil e auditoria completa.

## Prioridades de curto prazo

1. Formalizar modulos e contratos de dados.
2. Consolidar Jornada do Lead para operar sem planilha paralela.
3. Expandir worklist e filtros de operacao.
4. Preparar modulo de Metas com base historica consistente.

## O que vem depois

- Omnichannel completo.
- Integracoes de marketing e ROI.
- Relatorios executivos e benchmarking por unidade/franqueado.
- Automacoes de maior impacto com gates de seguranca.

## O que nao fazer agora

- Automatizar resposta autonoma ao cliente sem supervisao.
- Acoplar API a um canal especifico sem camada adaptadora.
- Misturar roadmap de dashboard com regras de negocio no backend.
- Criar modulo de metas sem separar dados de configuracao e realizado.

## Riscos de construir modulos soltos sem arquitetura

- Duplicacao de regra e divergencia entre telas e relatorios.
- Perda de contexto da jornada lead -> cliente.
- Integracoes caras de manter por acoplamento pontual.
- Dados sem confiabilidade para metas e decisao de lideranca.
- Crescimento de custo operacional por retrabalho manual.
