# Lead Backlog Rules (Jornada do Lead v1)

## Objetivo

Definir regras finais para transformar o backlog importado da planilha em fila operacional limpa para a equipe.

## Fonte de verdade de conversao

- `Pessoa.csv` e a referencia inicial de conversao por telefone.
- Telefone encontrado em `Pessoa.csv` sai da fila de lead.
- Telefone nao encontrado segue na Jornada do Lead.

## Janela valida de follow-up (fase atual)

- Data Prox Acao valida: entre `2026-06-01` e `2026-06-30`.
- Data Prox Acao nao pode ser anterior a Entrada lead.
- Caso valido vira `fazer_follow_up` com `due_at` original.

## Regras de backlog

Entram em `retomar_atendimento`:

- Data Prox Acao vencida;
- Data Prox Acao vazia;
- Data Prox Acao anterior a Entrada lead;
- Data Prox Acao depois de `2026-06-30`;
- status antigo/parado sem classificacao segura;
- casos da planilha marcados como conclusao/pagamento sem correspondencia em `Pessoa.csv`.

## Distribuicao operacional

- lote padrao de `30` leads por dia;
- parametro: `--daily-limit`;
- parametro opcional: `--start-date=YYYY-MM-DD`;
- sem start-date, usar proximo dia operacional;
- dias operacionais v1: terca a sabado.

## Revisao lideranca (excecao)

`revisar_lideranca` so entra com criterio critico:

- telefone duplicado com nomes conflitantes;
- conflito forte de nome entre planilha e base cliente;
- tentativa >= 12 sem conversao;
- observacao com sinal critico (reclamacao, problema, desqualificacao, devolucao para trafego, lead ruim);
- impossivel classificar com seguranca.

Sem criterio critico, "Analise Lideranca" da planilha e reclassificada para `retomar_atendimento`.

## Tipos de action item apos remediacao

Fila principal:

- `retomar_atendimento`
- `fazer_follow_up`
- `revisar_lideranca`
- `novo_lead` (somente novos leads daqui para frente)

Itens ruidosos da fase anterior ficam `ignorado`:

- `lead_sem_interacao`
- `follow_up_agendado`
- `follow_up_lead`
- `validar_conversao`

## Limitacoes temporarias

- regra de janela de follow-up esta fixa em junho/2026 nesta fase;
- segunda-feira nao entra como dia operacional no lote automatico v1;
- modulo Jornada do Cliente (clientes confirmados) fica para fase seguinte.

## Proximos passos

1. Entrada manual de novos leads no CRM.
2. Relatorio diario operacional da fila.
3. Evolucao de follow-up da Jornada do Cliente.
4. Integracao WAHA real em etapa dedicada.
