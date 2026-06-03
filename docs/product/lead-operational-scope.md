# Lead Operational Scope

Escopo de produto para transformar a planilha Jornada do Lead em CRM operacional.

## Objetivo

Substituir a rotina manual da Jornada do Lead por um fluxo operacional no CRM:

- cadastrar lead;
- organizar fila diaria;
- registrar resultado da interacao;
- criar proxima acao;
- acompanhar ate conversao, perda, desqualificacao ou nutricao.

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
- ERP.

## Status operacional v1

Estados de trabalho sugeridos:

- `novo_lead`: lead entrou e precisa de primeiro contato.
- `em_atendimento`: conversa ativa.
- `aguardando_resposta`: equipe aguardando retorno do tutor.
- `agendado`: lead marcou horario.
- `convertido_cliente`: conversao confirmada.
- `perdido`: lead encerrou sem interesse comercial.
- `desqualificado`: dados invalidos ou lead fora do perfil.
- `nutricao`: saiu da fila diaria e pode receber campanha futura.
- `revisao_lideranca`: precisa decisao da lideranca.

Antes de implementar, conferir compatibilidade com enums existentes no banco.

## Resultado da interacao v1

Resultados controlados para registro:

- `nao_respondeu`
- `chamar_depois`
- `continuar_atendimento`
- `agendou`
- `sem_interesse`
- `dados_invalidos`
- `escalar_lideranca`
- `virou_cliente`
- `enviar_nutricao`

## Motivos de perda

- `preco`
- `localizacao`
- `sem_taxi_dog`
- `ja_resolveu`
- `nao_tem_interesse`
- `outro`

## Motivos de desqualificacao

- `telefone_invalido`
- `fora_area`
- `servico_nao_atendido`
- `duplicado`
- `spam`
- `outro`

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
- lead importado com informacao inconsistente.

Analise da Lideranca deve ter fila propria e nao competir com follow-up comum.

## Regra para sair da fila diaria

Lead sai da fila diaria quando:

- virou cliente;
- foi perdido com motivo registrado;
- foi desqualificado com motivo registrado;
- entrou em nutricao/campanha;
- esta aguardando data futura de follow-up;
- foi escalado para analise da lideranca.

Historico nunca deve ser apagado.
