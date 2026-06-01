# Lead Customer Crosscheck Dry-Run v1

## Objetivo

Cruzar a planilha Jornada do Lead com `Pessoa.csv` para validar conversao de lead em cliente sem gravar dados no CRM.

## Arquivos de entrada

- planilha: `02 - Controle - Jornada do Lead Whatsapp.xlsx` (aba `Jornada do Lead`);
- base cliente: `Pessoa.csv`.

`Pessoa.csv` passa a ser fonte inicial de verdade para conversao de cliente, com chave natural por telefone normalizado.

## Comando

```powershell
npm run import:lead-spreadsheet:crosscheck-dry-run -- ".tmp\imports\02 - Controle - Jornada do Lead Whatsapp.xlsx" ".tmp\imports\Pessoa.csv"
```

## Garantias de seguranca

- sem `INSERT`, `UPDATE`, `DELETE`, `TRUNCATE`;
- sem chamadas para API;
- sem exportacao de dados reais para fora de `.tmp/`;
- saida com telefone mascarado e nome parcial.

## Regras de comparacao

1. Telefone em `Pessoa.csv` e normalizado e extraido mesmo com texto livre no campo `Telefones`.
2. Telefone normalizado e chave natural de comparacao entre planilha e base cliente.
3. `contact_id` continua sendo chave tecnica no banco CRM.
4. Telefone nao deve ser unica chave primaria do banco.

## Status canonicos simplificados

- `novo_lead`
- `em_atendimento`
- `agendado`
- `convertido_cliente`
- `sem_retorno`
- `revisao_lideranca`
- `desqualificado`
- `revisao_manual`

Mapeamento base:

- `Em espera -> novo_lead`
- `Em atendimento -> em_atendimento`
- `Agendamento realizado -> agendado`
- `Pagamento realizado -> sinal de conversao (nao vira status canonico proprio)`
- `Jornada Concluida -> sinal de conversao (nao vira status canonico proprio)`
- `Sem retorno -> sem_retorno`
- `Analise Lideranca -> revisao_lideranca`
- desconhecido -> `revisao_manual`

Observacao: `Pagamento realizado` e `Jornada Concluida` nao confirmam conversao sozinhos; passam por validacao contra `Pessoa.csv`.

## Proximas acoes canonicas simplificadas

- `fazer_follow_up`
- `revisar_lideranca`
- `retomar_atendimento`
- `nenhuma`
- `revisao_manual`

Mapeamento base:

- `Continuar atendimento -> fazer_follow_up`
- `Analise Lideranca -> revisar_lideranca`
- `Jornada Concluida -> nenhuma` (quando confirmado em `Pessoa.csv`) ou `retomar_atendimento` (quando nao confirmado)
- `Sem retorno -> retomar_atendimento`
- desconhecido -> `revisao_manual`

## Regra de conversao

1. Se telefone do lead existir em `Pessoa.csv`:
   - marcar `conversao_confirmada` no dry-run;
   - quando planilha indicar conclusao/agendamento/pagamento, status final pode virar `convertido_cliente`.
2. Se planilha indicar conclusao/pagamento e telefone nao existir em `Pessoa.csv`:
   - nao manter status transitorio;
   - classificar como `retomar_atendimento` na fila operacional.
3. Se nao converteu e `Data Prox Acao` esta vencida:
   - action item `retomar_atendimento`.
4. Se caso tem criterio critico de lideranca (conflito de nomes, tentativa >= 12, observacao sensivel, classificacao insegura):
   - action item `revisar_lideranca`.
5. Se planilha indicava `Analise Lideranca` sem criterio critico:
   - reclassificar para `retomar_atendimento`.

## Fila operacional final apos remediacao

Depois da importacao, a fila principal deve usar:

- `retomar_atendimento`
- `fazer_follow_up`
- `revisar_lideranca`
- `novo_lead` (novas entradas)

`validar_conversao` nao permanece como fila principal.

## Prioridade de classificacao (v1)

1. Conversao confirmada por telefone em `Pessoa.csv` + sinal de conclusao/agendamento/pagamento:
   - `status = convertido_cliente`
   - `action = nenhuma`
2. `Jornada Concluida` ou `Pagamento realizado` sem telefone na base cliente:
   - `status = em_atendimento`
   - `action = retomar_atendimento`
3. Sinal de analise de lideranca sem criterio critico:
   - `status = em_atendimento`
   - `action = retomar_atendimento`
4. Apenas casos criticos de lideranca:
   - `status = revisao_lideranca`
   - `action = revisar_lideranca`
5. `Data Prox Acao` vencida e lead fora dos grupos acima:
   - `action = retomar_atendimento`
6. `Continuar atendimento` sem vencimento:
   - `action = fazer_follow_up`
7. Desconhecido, conflito de status/acao ou conflito de tutor no mesmo telefone:
   - `status/action = revisao_manual`

## Regra de vencimento operacional

- timezone operacional: `America/Sao_Paulo`;
- comparacao por data de negocio local (nao por UTC puro);
- no relatorio de lideranca, a classificacao e separada em:
  - `revisar_lideranca_total`
  - `revisar_lideranca_vencida`
  - `revisar_lideranca_sem_data`
  - `revisar_lideranca_futura`
  - `revisar_lideranca_com_cliente_encontrado`
  - `revisar_lideranca_sem_cliente_encontrado`

- no relatorio de retomada, a classificacao e separada em:
  - `retomar_atendimento_total`
  - `retomar_atendimento_por_status`
  - `retomar_atendimento_por_atendente`

## Tentativas e campos imutaveis

- `Tentativa numero` entra como `legacy_attempt_count` no dry-run.
- No futuro, contador operacional definitivo deve vir de `crm_interactions` e `messages`.
- Campos que devem ser tratados como imutaveis (ou mudanca auditada):
  - telefone normalizado;
  - data original de entrada;
  - origem inicial;
  - campanha/metodo de entrada inicial.

## Criterio para evoluir para apply

1. reduzir conflitos de nome/telefone;
2. validar status simplificados com operacao;
3. definir fila de revisao manual;
4. manter cruzamento com `Pessoa.csv` como gate de conversao;
5. rodar dry-run obrigatorio antes de qualquer escrita.
