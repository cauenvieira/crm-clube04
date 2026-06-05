# Lead Customer Crosscheck Dry-Run v1

## Papel na hierarquia

Documento de dry-run para cruzar leads da planilha com a base de clientes exportada.

Este processo apoia a decisao de conversao, mas nao cria nova regra superior ao contrato operacional.

Fontes superiores:

- `docs/product/lead-operational-contract.md`
- `docs/product/lead-import-normalization.md`
- `docs/qa/lead-business-rules-test-matrix.md`

## Objetivo

Cruzar a planilha Jornada do Lead com `Pessoa.csv` para identificar sinais de conversao por telefone normalizado sem gravar dados no CRM.

## Arquivos de entrada

Arquivos locais sensiveis:

```powershell
.tmp\imports\02 - Controle - Jornada do Lead Whatsapp.xlsx
.tmp\imports\Pessoa.csv
```

Regras:

- ambos devem ficar fora do Git;
- saidas com dados reais devem ficar em `.tmp/`;
- qualquer amostra compartilhada deve mascarar telefone e nome.

## Comando

```powershell
npm run import:lead-spreadsheet:crosscheck-dry-run -- ".tmp\imports\02 - Controle - Jornada do Lead Whatsapp.xlsx" ".tmp\imports\Pessoa.csv"
```

## Garantias

- sem `INSERT`;
- sem `UPDATE`;
- sem `DELETE`;
- sem `TRUNCATE`;
- sem chamada de API;
- sem exportacao versionavel de dados reais.

## Regras de comparacao

1. Extrair telefones de `Pessoa.csv` mesmo quando o campo vier com texto livre.
2. Normalizar telefone conforme `lead-import-normalization.md`.
3. Comparar por `normalized_phone`.
4. Telefone e chave operacional de apoio, nao identidade perfeita.
5. Nome divergente ou telefone compartilhado deve virar risco/alerta.

## Regra de conversao

Conversao confirmada exige combinacao segura:

- telefone do lead encontrado em `Pessoa.csv`;
- sinal coerente na planilha ou outro criterio documentado;
- ausencia de conflito critico de identidade.

Quando confirmado:

- status operacional: `convertido`;
- action item diario: none;
- origem/campanha devem ser preservadas para ROI futuro.

Quando nao confirmado:

- nao encerrar automaticamente;
- se a planilha indicava conclusao/pagamento, enviar para `retomar_atendimento` ou quarentena conforme risco;
- nao usar `convertido_cliente` como status novo.

## Fila operacional final

Apos crosscheck e remediacao, a fila principal deve conter apenas action items operacionais validos:

- `atender_hoje`;
- `fazer_follow_up`;
- `retomar_atendimento`;
- `revisar_lideranca`.

`validar_conversao` e etapa tecnica de conferência, nao fila final.

## Prioridade de classificacao

1. Conversao segura:
   - `status = convertido`
   - `action = none`
2. Conclusao/pagamento sem confirmacao segura:
   - `status = em_atendimento` ou quarentena
   - `action = retomar_atendimento`
3. Analise de lideranca sem criterio critico:
   - `status = em_atendimento`
   - `action = retomar_atendimento`
4. Lideranca com criterio critico:
   - `status = revisar_lideranca`
   - `action = revisar_lideranca`
5. Proxima acao vencida:
   - `action = retomar_atendimento`
6. Proxima acao valida futura/hoje:
   - `action = fazer_follow_up`
7. Conflito inseguro:
   - invalidos/quarentena com motivo `manual_review_required`

## Relatorio esperado

O relatorio deve separar:

- leads com cliente encontrado;
- leads sem cliente encontrado;
- possiveis conversoes seguras;
- possiveis conversoes inseguras;
- conflito de nome/telefone;
- action item planejado;
- amostra mascarada.

## Criterio para apply

Antes de usar crosscheck em apply:

- validar regra de normalizacao de telefone;
- aceitar risco residual de telefone compartilhado;
- documentar tratamento de conflitos;
- manter dry-run obrigatorio;
- nao transformar `Pessoa.csv` em dado versionado.
