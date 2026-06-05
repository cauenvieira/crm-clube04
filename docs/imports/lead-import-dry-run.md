# Lead Import Dry-Run v1

## Papel na hierarquia

Documento de execucao do dry-run de importacao da Jornada do Lead.

O dry-run valida plano e normalizacao sem escrever no banco.

Fontes superiores:

- `docs/product/lead-operational-contract.md`
- `docs/product/lead-import-normalization.md`
- `docs/qa/lead-business-rules-test-matrix.md`

## Objetivo

Simular a importacao da planilha de leads para prever:

- contatos que seriam criados ou vinculados;
- leads que seriam criados ou preservados;
- action items que seriam gerados;
- registros invalidos;
- duplicidades;
- casos de quarentena;
- risco de conversao insegura.

## Comando

```powershell
npm run import:lead-spreadsheet:dry-run -- ".tmp\imports\02 - Controle - Jornada do Lead Whatsapp.xlsx"
```

Se o dry-run usar tambem `Pessoa.csv`, preferir o comando documentado em `lead-customer-crosscheck.md`.

## Garantias de seguranca

- somente leitura da planilha local;
- apenas consultas ao banco quando necessario;
- sem `INSERT`;
- sem `UPDATE`;
- sem `DELETE`;
- sem `TRUNCATE`;
- sem chamada para API;
- sem arquivo derivado com dados reais fora de `.tmp/`;
- saida compartilhavel deve mascarar telefone e nome.

## Entrada

Arquivo sensivel fora do Git:

```powershell
.tmp\imports\02 - Controle - Jornada do Lead Whatsapp.xlsx
```

## Saida esperada

O relatorio deve conter:

- linhas lidas;
- linhas validas;
- linhas invalidas;
- contatos que seriam criados;
- contatos que seriam vinculados;
- leads que seriam criados;
- leads ativos preservados;
- action items planejados;
- duplicidades ativas;
- status canonico planejado;
- motivos de invalidos/quarentena;
- amostra mascarada.

## Regras de deduplicacao

1. Chave operacional inicial: `normalized_phone`.
2. Linhas do mesmo telefone sao consolidadas.
3. Linha mais recente deve ser escolhida por data confiavel.
4. Mesmo telefone com nomes conflitantes deve ir para quarentena ou lideranca conforme criterio.
5. Lead ativo existente nao deve ser duplicado.
6. Lead final so deve ser reaberto com regra explicita.

## Regras de status

Nao usar labels legados como destino novo.

Usar os status do contrato:

- `novo_lead`
- `em_atendimento`
- `aguardando_resposta`
- `agendado`
- `convertido`
- `perdido`
- `desqualificado`
- `nutricao_campanha`
- `revisar_lideranca`

Casos desconhecidos devem ir para invalidos/quarentena ou receber tratamento conservador documentado.

## Regras de action item

Action items permitidos para fila final:

- `atender_hoje`
- `fazer_follow_up`
- `retomar_atendimento`
- `revisar_lideranca`

`validar_conversao` pode aparecer somente como etapa tecnica de relatorio, nao como fila principal final.

## Criterio para prosseguir

Prosseguir para apply somente quando:

- volume de invalidos foi entendido;
- duplicidades foram revisadas;
- crosscheck de conversao foi feito quando necessario;
- status/proximas acoes nao suportados foram resolvidos ou quarentenados;
- relatorio nao contem dado real versionado;
- lideranca/operacao validou amostra critica.

## Limitacoes

- nao grava no CRM;
- nao reconstrui historico completo;
- nao cria clientes automaticamente;
- nao prova conversao sozinho;
- nao substitui validacao humana de casos ambiguos.
