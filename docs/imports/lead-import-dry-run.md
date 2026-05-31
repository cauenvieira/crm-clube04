# Lead Import Dry-Run v1

## Objetivo

Executar uma simulacao de importacao da planilha Jornada do Lead sem gravar no banco e sem chamar a API.
O foco e mostrar o que seria criado, atualizado, rejeitado ou enviado para revisao manual.

## Comando

```powershell
npm run import:lead-spreadsheet:dry-run -- ".tmp\imports\02 - Controle - Jornada do Lead Whatsapp.xlsx"
```

## Garantias de seguranca

- somente leitura da planilha local;
- somente leitura do banco (consultas `SELECT` para detectar contatos/leads existentes);
- sem `INSERT`, `UPDATE`, `DELETE` ou `TRUNCATE`;
- sem chamadas para endpoints da API;
- sem geracao de arquivo derivado com dados reais fora de `.tmp/`.

## Regras de deduplicacao

1. Chave operacional inicial: `normalized_phone`.
2. Linhas do mesmo telefone sao consolidadas em um unico plano.
3. Estado atual consolidado e escolhido por recencia:
   1. `Data atendimento`
   2. `Data Prox Acao`
   3. `Entrada lead`
4. Mesmo telefone com nomes de tutor diferentes vai para revisao manual.

## Regras de status e proxima acao (canonicas v1)

Status:

- `Em espera -> novo_lead`
- `Em atendimento -> em_atendimento`
- `Agendamento realizado -> agendado`
- `Pagamento realizado -> validar_conversao`
- `Jornada Concluida -> validar_conversao`
- `Sem retorno -> sem_retorno`
- desconhecido -> revisao manual

Proxima acao:

- `Continuar atendimento -> follow_up_lead` (gera action item)
- `Analise Lideranca -> revisao_lideranca` (gera action item)
- `Jornada Concluida -> validar_conversao` (depende de cruzamento de cliente)
- `Sem retorno -> retomar_atendimento` (gera action item se houver vencimento)
- desconhecido -> revisao manual

Observacao:

- na estrategia v1, a confirmacao final de conversao usa crosscheck com `Pessoa.csv`;
- por isso, `Jornada Concluida` e `Pagamento realizado` nao encerram automaticamente a jornada.

## Como interpretar o relatorio

O relatorio mostra:

- volume total de linhas e classificacao (validas, rejeitadas, revisao manual);
- deduplicacao por telefone (unicos e duplicados);
- operacoes simuladas:
  - `create_contact`
  - `link_existing_contact`
  - `create_lead`
  - `update_existing_lead`
  - `create_action_item`
  - `create_interaction_snapshot`
  - `reject_row`
  - `manual_review`
- top motivos de rejeicao e revisao manual;
- amostras limitadas (max 20) com dados truncados.

## Limitacoes do dry-run

- nao executa escrita real no CRM;
- nao reconstrui historico completo de interacoes antigas;
- nao cria cliente automaticamente;
- depende de validacao humana para casos ambiguos (status/acao desconhecidos, tutor conflitante).

## Criterio para evoluir para importador apply

Antes do modo apply:

1. validar dicionario canonico com operacao;
2. validar regras de deduplicacao e conflitos de tutor;
3. aceitar volume residual de revisao manual;
4. definir trilha de auditoria (`raw_imports`/metadata) para cada linha aplicada;
5. manter `dry-run` como etapa obrigatoria antes de qualquer escrita.
