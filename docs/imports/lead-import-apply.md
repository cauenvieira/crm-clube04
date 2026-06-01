# Lead Import Apply and Remediation v1

## Objetivo

Trazer backlog da planilha para o CRM e, em seguida, remediar a fila operacional para uso diario no dashboard/worklist.

Escopo de escrita mantido:

- `contacts`
- `leads`
- `crm_interactions` (snapshot inicial)
- `action_items`

Fora de escopo:

- `customers`
- `pets`
- `appointments`
- `packages`

## Comandos

Import apply (com planilha e Pessoa.csv):

```powershell
npm run import:lead-spreadsheet:apply -- ".tmp\imports\02 - Controle - Jornada do Lead Whatsapp.xlsx" ".tmp\imports\Pessoa.csv"
npm run import:lead-spreadsheet:apply -- ".tmp\imports\02 - Controle - Jornada do Lead Whatsapp.xlsx" ".tmp\imports\Pessoa.csv" -- --apply --confirm-local-dev
```

Remediacao da worklist apos import:

```powershell
npm run remediate:lead-import-worklist
npm run remediate:lead-import-worklist -- --apply --confirm-local-dev --daily-limit=30
```

Observacao:

- o comando de remediacao aceita `--daily-limit=30` e `--daily-limit 30`;
- o comando tambem aceita `--start-date=YYYY-MM-DD` e `--start-date YYYY-MM-DD`.

## Regras de seguranca

- dry-run por padrao em import e remediacao;
- apply so com `--apply --confirm-local-dev`;
- bloqueio para `NODE_ENV=production`;
- bloqueio para host/db local suspeito;
- sem `DELETE`;
- sem `TRUNCATE`;
- sem apagar dados existentes;
- transacao unica com rollback em erro;
- sem chamadas de API.

## Conversao e fila operacional final

- `Pessoa.csv` e fonte de verdade inicial para conversao por telefone.
- Se telefone existe em `Pessoa.csv`: lead tratado como convertido (`compareceu`) e sai da fila de lead.
- Se telefone nao existe em `Pessoa.csv`: permanece na Jornada do Lead.
- `validar_conversao` deixa de ser fila principal.

Fila principal apos remediacao:

- `retomar_atendimento`
- `fazer_follow_up`
- `revisar_lideranca`
- `novo_lead` (entrada nova, nao backlog historico)

## Data Prox Acao valida (janela operacional atual)

- janela fixa atual: `2026-06-01` ate `2026-06-30`;
- Data Prox Acao valida dentro da janela vira `fazer_follow_up`;
- fora da janela, vencida, vazia ou inconsistente: entra em backlog `retomar_atendimento`.

## Backlog em lotes

- limite padrao: `30` por dia (`--daily-limit`);
- `--start-date=YYYY-MM-DD` opcional;
- sem `--start-date`, usa proximo dia operacional;
- dias operacionais v1: terca a sabado.

## Revisao lideranca como excecao

`revisar_lideranca` so quando houver criterio critico:

- telefone duplicado com nomes conflitantes;
- conflito forte de nome com base cliente;
- `Tentativa numero >= 12` sem conversao;
- observacao com sinal critico;
- impossivel classificar com seguranca.

Se planilha indica Analise Lideranca sem criterio critico, o caso volta para `retomar_atendimento`.

## Estado local apos remediacao

No ambiente local atual (baseline de validacao), a distribuicao operacional ficou:

- `convertido_cliente` por Pessoa.csv: 277
- `retomar_atendimento`: 1407
- `fazer_follow_up`: 33
- `revisar_lideranca`: 32

Esses valores podem oscilar levemente com execucoes de smoke/verify, mas a regra-alvo da fila permanece a mesma.
