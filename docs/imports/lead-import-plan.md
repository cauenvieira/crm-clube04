# Lead Import Plan v1 - Jornada do Lead

## Papel na hierarquia

Plano de execucao da importacao historica da Jornada do Lead.

Este plano nao vence o contrato operacional nem o documento de normalizacao:

- `docs/product/lead-operational-contract.md`
- `docs/product/lead-import-normalization.md`
- `docs/qa/lead-business-rules-test-matrix.md`

## Objetivo

Substituir progressivamente a planilha manual como fonte operacional primaria da Jornada do Lead, criando uma base inicial confiavel no CRM para:

- atendimento diario;
- follow-up;
- backlog;
- revisao de lideranca;
- rastreabilidade de conversao;
- relatorios operacionais;
- futura Mesa Operacional.

## Escopo v1

Inclui:

- aba `Jornada do Lead`;
- contatos minimos por telefone;
- leads ativos, finais e frios conforme regra;
- snapshot inicial em `crm_interactions`;
- action items para fila operacional;
- relatorio de invalidos/quarentena;
- crosscheck com `Pessoa.csv` como apoio de conversao.

Nao inclui:

- importar todas as abas da planilha;
- reconstruir WhatsApp historico;
- criar `customer`, `pet`, `appointment`, `package` automaticamente;
- apagar contato por coluna `Excluir contato`;
- executar em producao;
- versionar planilha ou CSV real.

## Arquivos sensiveis

Exemplos de caminhos locais:

```powershell
.tmp\imports\02 - Controle - Jornada do Lead Whatsapp.xlsx
.tmp\imports\Pessoa.csv
```

Regras:

- nunca versionar esses arquivos;
- nunca salvar relatorio com dados reais fora de `.tmp/`;
- saida compartilhavel deve mascarar dados pessoais.

## Sequencia segura

1. Diagnostico da planilha.
2. Dry-run de importacao.
3. Crosscheck com base de clientes.
4. Revisao de amostra com operacao/lideranca.
5. Apply local/dev com confirmacao explicita.
6. Remediacao da worklist.
7. Verify/smoke proporcional.
8. Atualizacao de docs/matriz se regra mudar.

## Mapeamento conceitual

| Coluna planilha | Destino CRM | Observacao |
|---|---|---|
| Tutor | `contacts.name` | Nome do contato/tutor. |
| Telefone | `contacts.normalized_phone` | Chave operacional inicial. |
| Metodo entrada | `leads.source` / origem bruta | Preservar bruto quando permitido. |
| Entrada lead | data de entrada / metadata | Validar antes de usar. |
| Atendente | `leads.assigned_to` | Texto inicial, sem entidade usuario. |
| Status Atendimento | `leads.status` | De-para canonico. |
| Data atendimento | interacao inicial / ultima interacao | Nao inventar data. |
| Tentativa numero | contador legado | Nao substituir contador definitivo de interacoes. |
| Proxima acao | `action_items.type` | De-para canonico. |
| Data Prox Acao | `action_items.due_at` / `leads.next_action_at` | Data operacional local. |
| Observacao | `crm_interactions.notes` / metadata | Preservar contexto. |
| Analise Lideranca | criterio auxiliar | Nao basta sozinha. |
| Excluir contato | invalidos/quarentena | Nao apaga nada. |

## Status e action items

Usar somente vocabulario canonico documentado em `lead-import-normalization.md`.

Fila final permitida apos importacao/remediacao:

- `atender_hoje`;
- `fazer_follow_up`;
- `retomar_atendimento`;
- `revisar_lideranca`.

Nao manter como fila principal:

- `validar_conversao`;
- `lead_sem_interacao`;
- `follow_up_agendado`;
- `follow_up_lead`;
- labels legados como `revisao_manual`.

## Gaps conhecidos

O modelo atual pode exigir evolucao futura para:

- auditoria detalhada por linha importada;
- entidade de revisao de lideranca;
- tabela de usuarios/atendentes;
- source attribution dedicada;
- fila de invalidos/quarentena com UI;
- audit log completo.

Nao criar migration dentro desta fase documental. Registrar gap e abrir tarefa propria quando necessario.

## Criterio para apply

Antes do apply:

- dry-run passou;
- crosscheck rodou quando aplicavel;
- volume de invalidos e ambiguos foi aceito;
- amostra foi revisada;
- comandos de apply exigem flags de confirmacao;
- banco alvo e local/dev;
- nao ha dado real versionado.

## Riscos

- consolidar pessoas diferentes pelo mesmo telefone;
- converter lead sem evidencia suficiente;
- transformar status legado em estado operacional errado;
- inflar fila diaria com leads frios;
- esconder casos de lideranca em backlog comum;
- versionar acidentalmente planilha ou relatorio real.

## Proximas etapas

1. Manter diagnostico e dry-run como gates obrigatorios.
2. Criar/verificar relatorio de invalidos.
3. Cobrir de-para principal com verify.
4. Consolidar deduplicacao por telefone.
5. Evoluir interface de revisao apenas depois da fila operacional estabilizar.
