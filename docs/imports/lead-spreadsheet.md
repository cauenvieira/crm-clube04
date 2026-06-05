# Lead Spreadsheet Diagnostics

## Papel na hierarquia

Documento de diagnostico da planilha manual da Jornada do Lead.

Nao e fonte de verdade de regra operacional. Em caso de conflito, vencem:

1. `docs/product/lead-operational-contract.md`
2. `docs/product/lead-import-normalization.md`
3. `docs/qa/lead-business-rules-test-matrix.md`

## Objetivo

Diagnosticar a planilha manual antes de qualquer importacao real para o CRM.

A etapa e somente leitura e serve para responder:

- quais colunas existem;
- qual aba operacional sera considerada;
- quais campos estao vazios, invalidos ou ambiguos;
- quais telefones podem ser normalizados;
- quais status e proximas acoes aparecem;
- qual e o volume de duplicidades;
- quais riscos precisam ser tratados antes do dry-run/apply.

## Entrada permitida

Arquivo local sensivel, fora do Git:

```powershell
.tmp\imports\02 - Controle - Jornada do Lead Whatsapp.xlsx
```

Aba considerada:

```text
Jornada do Lead
```

Demais abas ficam fora do diagnostico v1, salvo tarefa especifica.

## Comando esperado

```powershell
npm run import:lead-spreadsheet:diagnose -- ".tmp\imports\02 - Controle - Jornada do Lead Whatsapp.xlsx"
```

Se o nome do script mudar, atualizar este documento na mesma tarefa.

## Garantias

- nao grava no banco;
- nao chama API;
- nao cria arquivo versionavel com dados reais;
- nao remove contato;
- nao decide conversao final;
- nao gera fila operacional final.

## Colunas esperadas

Colunas operacionais conhecidas:

- Tutor
- Telefone
- Metodo entrada
- Entrada lead
- Atendente
- Status Atendimento
- Data atendimento
- Tentativa numero
- Proxima acao
- Data Prox Acao
- Observacao
- Data da Analise
- Qualificado?
- Contato Estabelecido?
- Motivo Macro
- Motivo Micro
- Obs
- Conclusao da analise
- Excluir contato
- Observacao final

A ausencia de coluna deve aparecer em relatorio, nao ser corrigida por inferencia silenciosa.

## Normalizacao de diagnostico

### Telefone

- remover caracteres nao numericos;
- testar regra de Brasil definida em `lead-import-normalization.md`;
- reportar invalidos e vazios;
- identificar possiveis telefones compartilhados;
- mascarar telefone na saida quando houver exibicao.

### Texto categorial

- aplicar `trim`;
- comparar em lowercase;
- preservar valor bruto em exemplos locais;
- consolidar frequencia por status, origem e proxima acao.

### Datas

- aceitar serial Excel e formatos textuais suportados;
- reportar datas invalidas;
- reportar `Data Prox Acao` anterior a `Entrada lead`;
- nao gerar vencimento operacional definitivo nesta etapa.

## Saida esperada

O relatorio deve mostrar:

- total de linhas;
- linhas com telefone valido;
- linhas sem telefone;
- linhas com telefone invalido;
- quantidade de telefones unicos;
- quantidade de duplicidades por telefone;
- status encontrados;
- proximas acoes encontradas;
- datas invalidas;
- principais origens/metodos de entrada;
- amostra mascarada de casos problematicos.

## Criterio para seguir para dry-run

Seguir para dry-run apenas quando:

- aba operacional esta confirmada;
- colunas essenciais foram reconhecidas;
- telefone tem regra de normalizacao aplicada;
- status/proximas acoes foram classificados ou marcados como unsupported;
- riscos de duplicidade foram conhecidos;
- nenhum dado real foi versionado.

## Proximos passos

1. Rodar diagnostico.
2. Atualizar normalizacao quando aparecer novo valor legado relevante.
3. Rodar dry-run.
4. Validar amostra com operacao/lideranca.
5. Somente depois considerar apply local/dev.
