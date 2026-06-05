# Lead Backlog Rules - Jornada do Lead

## Papel na hierarquia

Documento auxiliar para distribuir backlog importado em fila operacional.

Nao e fonte superior de status ou lifecycle. Em caso de conflito, vencem:

- `docs/product/lead-operational-contract.md`
- `docs/product/lead-import-normalization.md`
- `docs/qa/lead-business-rules-test-matrix.md`

## Objetivo

Transformar backlog historico da planilha em trabalho diario controlado, sem sobrecarregar a equipe e sem esconder casos criticos.

## Fonte de apoio de conversao

`Pessoa.csv` pode ser usado como apoio inicial de conversao por telefone normalizado.

Regras:

- telefone encontrado pode indicar cliente existente;
- conversao ainda exige criterio seguro;
- telefone compartilhado ou nome conflitante deve gerar alerta;
- arquivos reais ficam fora do Git.

## Janela de follow-up

Regras gerais:

- data valida futura/atual vira `fazer_follow_up`;
- data vencida ate 7 dias aparece como atrasado;
- data vencida acima de 7 dias aparece como backlog;
- data vazia em lead ativo vira `retomar_atendimento`;
- data anterior a entrada do lead vira invalidos/quarentena ou `retomar_atendimento`, conforme regra segura.

Se houver janela fixa temporaria para remediacao, documentar como decisao temporaria, nao como regra permanente.

## Regras de backlog

Entram em `retomar_atendimento`:

- Data Prox Acao vencida;
- Data Prox Acao vazia;
- Data Prox Acao anterior a Entrada lead;
- status antigo/parado sem classificacao segura;
- conclusao/pagamento sem confirmacao de conversao;
- analise de lideranca sem criterio critico.

Nao entram na fila diaria comum:

- `convertido`;
- `perdido`;
- `desqualificado`;
- `nutricao_campanha`.

## Distribuicao operacional

Padrao inicial:

- lote de `30` leads por dia;
- parametro: `--daily-limit`;
- `--start-date=YYYY-MM-DD` opcional;
- sem start date, usar proximo dia operacional;
- dias operacionais v1: terca a sabado.

Objetivo do lote:

- evitar fila impossivel;
- preservar ritmo de recuperacao;
- permitir leitura diaria pela lideranca;
- reduzir backlog sem sacrificar leads novos.

## Revisao de lideranca

`revisar_lideranca` so entra com criterio critico:

- telefone duplicado com nomes conflitantes;
- conflito forte entre planilha e base cliente;
- tentativa muito alta sem conversao;
- observacao com sinal critico;
- impossivel classificar com seguranca;
- risco de decisao comercial errada.

Sem criterio critico, `Analise Lideranca` da planilha vira `retomar_atendimento` ou quarentena.

## Fila principal apos remediacao

Action items principais:

- `atender_hoje`;
- `retomar_atendimento`;
- `fazer_follow_up`;
- `revisar_lideranca`.

Itens legados/ruidosos devem ser neutralizados conforme regra:

- `lead_sem_interacao`;
- `follow_up_agendado`;
- `follow_up_lead`;
- `validar_conversao`.

## Limitacoes temporarias

- backlog historico nao representa demanda nova;
- clientes confirmados devem sair da Jornada do Lead e seguir para Jornada do Cliente no futuro;
- segunda-feira pode ficar fora do lote automatico enquanto a operacao adotar esse desenho;
- regras temporarias devem ser removidas ou formalizadas quando o modulo estabilizar.

## Proximos passos

1. Criar/validar verify de de-para da importacao.
2. Criar relatorio de invalidos/quarentena.
3. Consolidar deduplicacao por telefone.
4. Ligar backlog a Mesa Operacional.
5. Evoluir Jornada do Cliente para leads convertidos.
