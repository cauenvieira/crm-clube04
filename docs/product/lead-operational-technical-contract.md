# Lead Operational Technical Contract

Projeto: CRM Clube04 Mogi das Cruzes
Data: 2026-06-07
Status: contrato tecnico documental M1/M2
Milestone: M1 Jornada do Lead / M2 Mesa Operacional

## Papel na hierarquia

Este documento deriva o contrato tecnico alvo do Lead Operacional/Mesa Operacional a partir dos documentos de produto e QA.

Autoridade:

1. `docs/product/lead-operational-contract.md`
2. `docs/product/lead-operational-technical-contract.md`
3. `docs/product/lead-import-normalization.md`
4. `docs/qa/lead-business-rules-test-matrix.md`
5. `docs/product/lead-operational-system.md`
6. `docs/product/lead-operational-ui-wireframes.md`
7. `docs/product/lead-operational-decisions.md`
8. `docs/qa/lead-operational-cycle-test-plan.md`

Este contrato nao altera schema, migrations, endpoints ou frontend por si so. Implementacao futura deve reconciliar API, banco, validacoes e testes antes de ser considerada pronta.

## Decisoes fechadas

| Conflito | Decisao M1/M2 |
|---|---|
| Cadencia 4 vs 12 | Adotar 12 tentativas sem resposta como alvo M1/M2. |
| Validar agendamento | Criar fila/action item canonico `validar_agendamento`. |
| Follow-up como label/status | `Follow-up` e label de UI; status canonicos continuam separados. |
| Opt-out/arquivamento | Criar status terminal `arquivado_nao_contatar`. |
| Contadores separados | Separar `sem_resposta_count` e `follow_up_count`. |

## Conceitos canonicos

Status, fila/action item, resultado, situacao principal e tags sao dimensoes independentes.

| Dimensao | Finalidade | Dono no CRM real |
|---|---|---|
| Status | Fase operacional do lead. | Backend |
| Fila/action item | Trabalho atual que precisa ser executado. | Backend |
| Resultado | Resultado registrado na interacao. | Backend |
| Situacao principal | Alerta unico exibido no card. | Backend ou contrato de view da API |
| Tags secundarias | Sinais complementares limitados para UX. | Backend ou contrato de view da API |
| Permissao | Quem pode executar transicao critica. | Backend/auth |
| Auditoria | Rastro de toda decisao relevante. | Backend |

## Status operacionais

| Status | Tipo | Aparece na Mesa diaria? | Regra |
|---|---|---:|---|
| `novo_lead` | ativo | sim | Lead novo, ainda sem primeiro atendimento efetivo. |
| `em_atendimento` | ativo | sim | Lead em conversa/follow-up ativo. |
| `aguardando_resposta` | ativo | sim | Ultimo resultado foi sem resposta e ha proxima tentativa. |
| `agendado` | ativo controlado | sim, via validacao | Lead com agendamento que precisa validar desfecho. |
| `revisar_lideranca` | ativo controlado | sim, em fila de lideranca | Lead exige decisao de lideranca/admin. |
| `nutricao_campanha` | frio | nao na rotina diaria | Lead fora da rotina diaria, em visao propria. |
| `convertido` | terminal | nao | Lead virou cliente. |
| `perdido` | terminal | nao | Lead valido encerrado como perda comercial. |
| `desqualificado` | terminal | nao | Lead sem oportunidade comercial valida. |
| `arquivado_nao_contatar` | terminal | nao | Opt-out, bloqueio ou pedido para nao contatar. |

## Filas e action items

| Action item | Status compativeis | Uso |
|---|---|---|
| `atender_hoje` | `novo_lead`, `em_atendimento` | Primeiro atendimento ou retomada imediata. |
| `fazer_follow_up` | `em_atendimento`, `aguardando_resposta` | Follow-up ativo, conversa, interesse, objecao ou sem resposta. |
| `retomar_atendimento` | `em_atendimento`, `aguardando_resposta` | Lead ativo sem data segura ou importado com contexto incompleto. |
| `validar_agendamento` | `agendado` | Validar comparecimento, remarcacao, cancelamento ou erro de agenda. |
| `revisar_lideranca` | `revisar_lideranca` | Checklist, decisao e justificativa da lideranca. |
| `nutricao_campanha` | `nutricao_campanha` | Visao propria de campanha/reativacao, fora da rotina diaria. |

Invariantes:

- Lead ativo deve ter action item aberto, proxima acao e responsavel.
- Lead terminal nao deve ter action item aberto nem proxima acao operacional.
- `nutricao_campanha` pode ter data de campanha, mas nao entra na Mesa diaria.

## Resultados canonicos

Resultados de `fazer_follow_up`:

- `sem_resposta`
- `conversa_em_andamento`
- `demonstrou_interesse`
- `objecao`
- `agendamento_combinado`
- `enviar_lideranca`

Resultados de `validar_agendamento`:

- `cliente_compareceu`
- `cliente_nao_compareceu`
- `cancelou`
- `remarcou`
- `agendamento_nao_localizado`
- `erro_operacional`

Decisoes de `revisar_lideranca`:

- `retomar_atendimento`
- `finalizar_perdido`
- `finalizar_desqualificado`
- `enviar_nutricao`
- `corrigir_erro_operacional`
- `gerar_acao_secundaria`
- `arquivar_nao_contatar`

Decisoes de `nutricao_campanha`:

- `manter_nutricao`
- `reativar_atendimento`
- `arquivar_nao_contatar`

## Contadores

| Contador | Incrementa quando | Nao incrementa quando | Uso |
|---|---|---|---|
| `sem_resposta_count` | resultado `sem_resposta` | conversa, interesse, objecao, agendamento | Cadencia e envio para lideranca. |
| `follow_up_count` | qualquer resultado registrado em `fazer_follow_up` | decisao direta de lideranca/nutricao | Esforco operacional e produtividade. |

Regras:

- `sem_resposta` incrementa os dois contadores.
- conversa/interesse/objecao incrementam apenas `follow_up_count`.
- reabertura preserva historico dos contadores, salvo regra futura explicita.

## Cadencia sem resposta

Adotar 12 tentativas sem resposta como alvo M1/M2.

| Tentativa | Proxima acao |
|---:|---|
| 1 | D0 imediato |
| 2 | D0 18:00 |
| 3 | D+1 09:30 |
| 4 | D+1 12:30 |
| 5 | D+1 16:30 |
| 6 | D+3 09:30 |
| 7 | D+6 09:30 |
| 8 | D+6 12:30 |
| 9 | D+6 16:30 |
| 10 | D+7 09:30 |
| 11 | D+7 16:30 |
| 12 | enviar para `revisar_lideranca` |

## Transicoes principais

| Origem | Resultado/decisao | Destino | Action item destino | Permissao |
|---|---|---|---|---|
| `novo_lead` | primeiro atendimento | `em_atendimento` | `fazer_follow_up` | atendente+ |
| `em_atendimento` | `sem_resposta` antes do limite | `aguardando_resposta` | `fazer_follow_up` | atendente+ |
| `aguardando_resposta` | `sem_resposta` no limite | `revisar_lideranca` | `revisar_lideranca` | atendente+ |
| `em_atendimento` | conversa/interesse/objecao | `em_atendimento` | `fazer_follow_up` | atendente+ |
| `em_atendimento` | `agendamento_combinado` | `agendado` | `validar_agendamento` | atendente+ |
| `agendado` | `cliente_compareceu` | `convertido` | none | atendente+ |
| `agendado` | nao compareceu/cancelou | `em_atendimento` | `fazer_follow_up` | atendente+ |
| `agendado` | erro/agendamento nao localizado | `revisar_lideranca` | `revisar_lideranca` | atendente+ |
| `revisar_lideranca` | retomar atendimento | `em_atendimento` | `fazer_follow_up` | lideranca/admin |
| `revisar_lideranca` | finalizar perdido | `perdido` | none | lideranca/admin |
| `revisar_lideranca` | finalizar desqualificado | `desqualificado` | none | lideranca/admin |
| `revisar_lideranca` | enviar nutricao | `nutricao_campanha` | `nutricao_campanha` | lideranca/admin |
| `nutricao_campanha` | reativar atendimento | `em_atendimento` | `fazer_follow_up` | lideranca/admin |
| qualquer terminal | reabrir | `em_atendimento` | `fazer_follow_up` | lideranca/admin |
| qualquer ativo/frio | opt-out | `arquivado_nao_contatar` | none | lideranca/admin |

## Permissoes

| Acao | Atendente | Lideranca | Admin |
|---|---:|---:|---:|
| registrar follow-up | sim | sim | sim |
| registrar sem resposta | sim | sim | sim |
| registrar agendamento combinado | sim | sim | sim |
| validar agendamento | sim | sim | sim |
| enviar para lideranca | sim | sim | sim |
| retomar da lideranca | nao | sim | sim |
| finalizar perdido | nao | sim | sim |
| finalizar desqualificado | nao | sim | sim |
| enviar para nutricao | nao | sim | sim |
| reativar nutricao | nao | sim | sim |
| arquivar/nao contatar | nao | sim | sim |
| reabrir terminal | nao | sim | sim |
| override de follow-up longo | nao | sim | sim |
| alterar configuracao operacional | nao | sim | sim |
| alterar permissao | nao | nao | sim |

## Situacao principal

Ranking tecnico inicial:

1. `erro_consistencia`
2. `caso_sensivel`
3. `revisao_lideranca`
4. `backlog`
5. `atrasado`
6. `validar_agendamento_hoje`
7. `hoje`
8. `follow_up_longo`
9. `tentativa_alta`
10. `cadastro_incompleto`
11. `nutricao`
12. `futuro`

A API futura deve retornar uma unica situacao principal por lead quando a Mesa Operacional for implementada.

## Tags secundarias

Maximo de 3 tags por card.

Prioridade:

1. ultimo resultado;
2. tentativa sem resposta;
3. follow-up longo;
4. interesse comercial;
5. alerta do pet;
6. motivo de lideranca;
7. cadastro incompleto;
8. origem;
9. responsavel.

## Auditoria

Eventos minimos:

- `lead_criado`
- `resultado_registrado`
- `status_alterado`
- `action_item_alterado`
- `proxima_acao_alterada`
- `responsavel_alterado`
- `envio_lideranca`
- `decisao_lideranca`
- `lead_finalizado`
- `lead_reaberto`
- `lead_arquivado_nao_contatar`
- `configuracao_alterada`
- `permissao_alterada`

Campos minimos:

- usuario;
- data_hora;
- lead_id;
- evento;
- valor_anterior;
- valor_novo;
- motivo;
- origem.

## Pendencias ainda abertas

- Definir nomes finais de payload/API para todos os campos antes de alterar `docs/api/rest-api.md`.
- Definir persistencia fisica dos contadores e do status `arquivado_nao_contatar`.
- Definir se situacao principal/tags serao calculadas em SQL, service ou view-model da API.
- Definir como permissao real sera integrada a auth de usuario.
- Definir se configuracoes de cadencia/ranking serao hardcoded inicialmente ou administraveis.
