# Lead Operational Scope

## Status deste documento

Este e um documento auxiliar de escopo da Jornada do Lead.

Ele descreve a intencao de produto e os limites dos proximos sprints, mas nao e a fonte de verdade para enums, status, outcomes, cadencia, regras de lideranca, importacao ou indicadores.

Em caso de conflito, vencem:

1. `docs/product/lead-operational-contract.md`
2. `docs/product/lead-import-normalization.md`
3. `docs/qa/lead-business-rules-test-matrix.md`

## Objetivo

Substituir a rotina manual da planilha Jornada do Lead por um fluxo operacional no CRM:

- cadastrar lead;
- organizar fila diaria;
- registrar resultado da interacao;
- criar proxima acao;
- acompanhar ate conversao, perda, desqualificacao ou nutricao/campanha;
- gerar historico e rastreabilidade para lideranca.

## Incluido nos proximos sprints

- Cadastro manual de lead.
- Base de Leads sistematizada.
- Mesa Operacional.
- Analise da Lideranca.
- Dashboard de Leads.
- Resumo Diario.
- Fluxo ate:
  - convertido;
  - perdido;
  - desqualificado;
  - nutricao/campanha.

## Fora de escopo por enquanto

- Google Auth.
- WhatsApp real.
- IA real.
- Automacoes n8n reais.
- Campanhas automaticas.
- Jornada completa do Cliente pos-conversao.
- Pacotes.
- NPS.
- ERP/Clube04 em modo escrita.

## Status e resultados operacionais

Nao usar este arquivo como fonte para nomes finais de status, action items ou outcomes.

Consultar:

- `docs/product/lead-operational-contract.md`
- `docs/product/lead-import-normalization.md`
- `docs/qa/lead-business-rules-test-matrix.md`

## Nutricao e campanha

Um lead deve sair da energia diaria da equipe quando:

- nao ha acao humana imediata;
- ja passou da cadencia operacional;
- existe potencial futuro, mas nao prioridade diaria;
- precisa receber campanha futura em vez de follow-up manual.

Nutricao nao deve disparar automacao real nesta etapa.

## Analise da Lideranca

Usar quando:

- tentativas excedidas;
- caso sensivel;
- conflito de classificacao;
- potencial comercial relevante;
- duvida sobre perda/desqualificacao;
- lead importado com informacao inconsistente;
- atendimento precisa de decisao ou feedback.

Analise da Lideranca deve ter fila propria e nao competir com follow-up comum.

As regras detalhadas de envio, autoanalise, decisao e auditoria ficam no contrato operacional.

## Regra para sair da fila diaria

Lead sai da fila diaria quando o contrato operacional indicar que nao ha acao humana diaria pendente.

Exemplos esperados:

- virou cliente;
- foi perdido com motivo registrado;
- foi desqualificado com motivo registrado;
- entrou em nutricao/campanha;
- esta aguardando data futura de follow-up;
- foi escalado para analise da lideranca.

Historico nunca deve ser apagado.

## Observacao

Este arquivo deve permanecer curto. Regras detalhadas devem ser registradas no contrato operacional ou na matriz de testes, nao aqui.
