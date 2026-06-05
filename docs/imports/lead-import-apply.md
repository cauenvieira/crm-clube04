# Lead Import Apply and Remediation v1

## Papel na hierarquia

Documento de execucao do apply local/dev e da remediacao da fila apos importacao da Jornada do Lead.

Fontes superiores:

- `docs/product/lead-operational-contract.md`
- `docs/product/lead-import-normalization.md`
- `docs/qa/lead-business-rules-test-matrix.md`

## Objetivo

Aplicar a importacao da planilha no CRM local/dev, com seguranca, idempotencia e remediacao da fila operacional.

## Escopo de escrita

Permitido:

- `contacts`
- `leads`
- `crm_interactions`
- `action_items`
- tabelas tecnicas de auditoria/importacao, quando ja existirem e estiverem documentadas.

Fora de escopo:

- `customers`
- `pets`
- `appointments`
- `packages`
- exclusao de dados
- operacao em producao
- escrita no sistema oficial Clube04

## Comandos

Import apply com planilha e base de clientes:

```powershell
npm run import:lead-spreadsheet:apply -- ".tmp\imports\02 - Controle - Jornada do Lead Whatsapp.xlsx" ".tmp\imports\Pessoa.csv"
npm run import:lead-spreadsheet:apply -- ".tmp\imports\02 - Controle - Jornada do Lead Whatsapp.xlsx" ".tmp\imports\Pessoa.csv" -- --apply --confirm-local-dev
```

Remediacao da worklist apos import:

```powershell
npm run remediate:lead-import-worklist
npm run remediate:lead-import-worklist -- --apply --confirm-local-dev --daily-limit=30
```

Parametros aceitos pela remediacao:

```powershell
--daily-limit=30
--daily-limit 30
--start-date=YYYY-MM-DD
--start-date YYYY-MM-DD
```

## Regras de seguranca

- dry-run por padrao;
- apply apenas com `--apply --confirm-local-dev`;
- bloquear `NODE_ENV=production`;
- bloquear host/db nao local quando houver regra de protecao;
- sem `DELETE`;
- sem `TRUNCATE`;
- sem apagar dados existentes;
- transacao unica quando possivel;
- rollback em erro;
- sem chamadas de API;
- sem arquivo real versionado.

## Diagnostico/reset local de importacoes antigas

Quando o banco local acumular importacoes antigas com labels divergentes, usar os scripts de dev-data:

```powershell
npm run dev:diagnose-imported-leads
npm run dev:reset-imported-leads
```

O diagnostico e somente leitura. O reset e dry-run por padrao e so aplica com:

```powershell
npm run dev:reset-imported-leads:apply
```

Esse reset nao faz parte do fluxo normal de importacao. Ele existe para higiene do banco local/dev antes de testes operacionais. Ele nao usa `TRUNCATE`, nao apaga registros ambiguos e nao deve ser executado em ambiente real.

## Conversao

- `Pessoa.csv` e apoio inicial de crosscheck por telefone.
- Conversao segura vira status operacional `convertido`.
- Telefone encontrado sozinho nao basta se houver conflito critico.
- Planilha com conclusao/pagamento sem confirmacao segura nao deve encerrar lead automaticamente.
- `convertido_cliente` e label legado; nao usar como novo status documental.

## Fila operacional final

Apos remediacao, fila principal deve conter:

- `atender_hoje`;
- `fazer_follow_up`;
- `retomar_atendimento`;
- `revisar_lideranca`.

Itens ruidosos ou legados devem ser encerrados, ignorados ou migrados conforme regra documentada:

- `lead_sem_interacao`;
- `follow_up_agendado`;
- `follow_up_lead`;
- `validar_conversao`;
- outros labels que nao pertencam ao contrato.

## Backlog em lotes

Regra padrao:

- limite padrao: `30` leads por dia;
- parametro: `--daily-limit`;
- `--start-date` opcional;
- sem start date, usar proximo dia operacional;
- dias operacionais v1: terca a sabado.

Essa regra e operacional e deve ser atualizada no contrato/matriz se virar comportamento definitivo do produto.

## Revisao de lideranca

Criar `revisar_lideranca` apenas com criterio critico:

- telefone duplicado com nomes conflitantes;
- conflito forte de nome com base cliente;
- tentativa alta sem conversao;
- observacao sensivel;
- impossibilidade de classificar com seguranca.

Se planilha indica lideranca sem criterio critico, classificar como `retomar_atendimento` ou quarentena, conforme seguranca.

## Resultado esperado do apply

Relatorio local deve mostrar:

- contatos criados;
- contatos vinculados;
- leads criados;
- leads preservados;
- action items criados;
- action items ignorados/fechados;
- conversoes confirmadas;
- invalidos/quarentena;
- duplicados ativos;
- erros por motivo.

Nao incluir dados pessoais completos em logs compartilhados.

## Validacao

Depois de apply/remediacao:

```powershell
npm run verify:data-cleanliness
```

Quando houver alteracao de codigo:

```powershell
npm run verify:all
```

ou verificacoes especificas de importacao, quando existirem.

## Estado local e numeros historicos

Qualquer numero de uma execucao especifica deve ser tratado como snapshot local, nao como regra.

Se for necessario registrar numeros, indicar:

- data;
- commit;
- script;
- flags;
- ambiente;
- se os dados eram reais/sensiveis.

Nao versionar relatorio real.
