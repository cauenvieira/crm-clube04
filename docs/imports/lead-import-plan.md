# Lead Import Plan v1 - Jornada do Lead

## 1) Objetivo da importacao futura

- substituir a planilha manual como fonte operacional primaria;
- preservar historico minimo necessario para contexto do time;
- criar base inicial confiavel para o modulo Jornada do Lead;
- permitir evolucao para funil, worklist, automacoes e relatorios.

## 2) Escopo da importacao v1

- importar apenas a aba `Jornada do Lead` (primeira aba operacional);
- ignorar todas as outras abas nesta v1;
- importar snapshot operacional atual (estado atual do lead), nao historico completo de eventos;
- nao reconstruir conversas antigas de WhatsApp;
- nao criar `customer` automaticamente sem criterio claro de conversao.

## 3) Mapeamento proposto (conceitual)

| Coluna planilha | Destino CRM proposto | Observacao |
| --- | --- | --- |
| Tutor | `contacts.name` | nome principal do tutor no contato |
| Telefone | `contacts.normalized_phone` | chave operacional inicial de deduplicacao |
| Metodo entrada | `leads.source` e `leads.campaign` (quando aplicavel) | manter valor original em metadata para auditoria |
| Entrada lead | metadata (`raw_imports`/payload importado) e gap para `original_entry_at` | ver gaps de modelo abaixo |
| Atendente | `leads.assigned_to` (texto inicial) | sem tabela de usuarios nesta v1 |
| Status Atendimento | `leads.status` canonico | via tabela de canonizacao |
| Data atendimento | `leads.last_interaction_at` | usar data valida mais recente por lead consolidado |
| Tentativa numero | `leads.attempt_count` | parse inteiro, fallback seguro |
| Proxima acao | `action_items.type` (ou metadata de lead) | regra por tabela de acao canonica |
| Data Prox Acao | `leads.next_action_at` e `action_items.due_at` | so quando data valida |
| Observacao | `crm_interactions.notes` (registro de importacao) ou metadata | evitar perder contexto textual |
| Analise de lideranca | metadata de revisao (futura entidade de review) | nao vira regra automatica nesta v1 |
| Analise franqueados | metadata/raw somente | sem uso operacional automatico na v1 |

## 4) Status canonicos propostos

| Valor original provavel | Status canonico sugerido | Observacao |
| --- | --- | --- |
| Em espera | `novo_lead` (ou `aguardando_atendimento`) | decidir com operacao qual e o default oficial |
| Em atendimento | `em_atendimento` | status ativo |
| Agendamento realizado | `agendado` (ou `agendamento_realizado`) | alinhar ao enum atual do banco/API |
| Pagamento realizado | `em_negociacao` ou `pagamento_realizado` | depende de status suportado no schema atual |
| Jornada Concluida | `convertido_cliente` (ou `jornada_concluida`) | pode exigir campo complementar de conversao |
| Sem retorno | `aguardando_resposta` ou `sem_retorno` | manter rastreio para follow-up |
| Outros/desconhecidos | `revisao_manual` | nao forcar inferencia automatica |

## 5) Proximas acoes canonicas propostas

| Valor original provavel | Acao canonica sugerida | Gera action_item? | Observacao |
| --- | --- | --- | --- |
| Continuar atendimento | `follow_up_lead` | sim | prioridade por regra de prazo/status |
| Analise Lideranca | `revisao_lideranca` | sim | fila separada de revisao |
| Jornada Concluida | `nenhuma` (ou `converter_cliente`) | nao (em geral) | evitar criar pendencia indevida |
| Sem retorno | `follow_up_ou_revisao` | sim | com limite de tentativas |
| Desconhecido | `revisao_manual` | opcional | exige triagem humana |

## 6) Regras de deduplicacao

1. Chave operacional inicial: `normalized_phone`.
2. Mesmo telefone em varias linhas: tratar como mesmo contato potencial.
3. Nao sobrescrever dado fixo de cadastro sem criterio (nome, origem base) quando ja houver valor melhor no CRM.
4. Para estado atual do lead, escolher linha mais recente por prioridade de data:
   1. `Data atendimento`
   2. `Data Prox Acao`
   3. `Entrada lead`
5. Preservar no relatorio final:
   - total de duplicidades por telefone;
   - quais linhas foram consolidadas;
   - quais foram descartadas/ignoradas.
6. Mesmo telefone com nomes distintos: encaminhar para `revisao_manual`.

## 7) Regras de qualidade

1. Sem telefone:
   - nao importar como `contact`/`lead` ativo;
   - enviar para rejeitados com motivo.
2. Sem tutor:
   - se telefone valido, importar em `revisao_manual` com nome placeholder controlado;
   - alternativa: rejeitar por politica de operacao (decidir com time).
3. Data invalida:
   - nao bloquear toda linha;
   - importar sem aquele campo de data e reportar no log de rejeicoes parciais.
4. Metodo de entrada ausente:
   - usar `source = unknown` ou `manual_import`;
   - manter flag para limpeza posterior.
5. Status ausente:
   - enviar para `revisao_manual`.
6. Proxima acao ausente:
   - nao gerar `action_item` automatico.

## 8) Estrategia de importacao segura futura

O importador real deve:

1. rodar em `dry-run` por padrao;
2. exigir `--apply --confirm-local-dev` para escrita;
3. gerar relatorio com `created`, `updated`, `ignored`, `rejected`;
4. nunca apagar dados existentes;
5. nao sobrescrever dados mais recentes do CRM sem regra explicita de precedencia;
6. marcar origem em metadata como `spreadsheet_import`;
7. preservar linha bruta (ou referencia) para auditoria em `raw_imports`;
8. ser idempotente (reexecucao nao duplica registros).

## 9) Impactos no modelo atual (gaps documentados)

Schema atual e suficiente para um v1 basico de consolidacao de contatos/leads/action_items, mas ha lacunas provaveis:

- `original_entry_at` dedicado no lead (hoje tende a ir para metadata);
- `assigned_to` estruturado (atualmente texto, sem entidade de usuario);
- campos de revisao de lideranca mais formais (entidade/tabela propria futura);
- tags e taxonomia de classificacao operacional;
- source attribution mais completo (alem de `source/campaign` simples);
- trilha de auditoria orientada a importacao (alem de `raw_imports`);
- `audit_log` para rastreabilidade completa de alteracoes.

Nao criar migration agora. Gaps ficam registrados para etapa de implementacao do importador real.

## 10) Proximas etapas recomendadas

1. Validar status canonicos com operacao/lideranca.
2. Validar regras de duplicidade e criterios de consolidacao por telefone.
3. Implementar importador `dry-run` com relatorio detalhado.
4. Implementar modo `apply` somente apos validacao operacional do dry-run.
5. Criar fila/tela de revisao manual para casos ambiguos/rejeitados.
6. Depois estabilizar Jornada do Cliente como continuidade da Jornada do Lead.

## Riscos e pontos para validacao humana

- conflito entre status canonico proposto e enum real suportado no schema atual;
- consolidacao indevida de pessoas diferentes no mesmo telefone compartilhado;
- perda de contexto textual se observacoes nao forem armazenadas com cuidado;
- alta variacao textual de origem/status/acao pode inflar revisao manual;
- datas invalidas/incompletas podem distorcer prioridade operacional inicial.
