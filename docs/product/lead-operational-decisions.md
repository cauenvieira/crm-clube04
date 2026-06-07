# Lead Operational Decisions

Projeto: CRM Clube04 Mogi das Cruzes
Data: 2026-06-07
Status: decisoes e pendencias controladas

## Papel na hierarquia

Este documento registra decisoes de produto/UX e lacunas para M1/M2. Ele nao substitui:

- `docs/product/lead-operational-contract.md`
- `docs/product/lead-operational-technical-contract.md`
- `docs/product/lead-import-normalization.md`
- `docs/qa/lead-business-rules-test-matrix.md`

Decisao que muda regra operacional deve ser promovida para contrato, matriz e testes.

## Decisoes alinhadas ao contrato atual

| Tema | Decisao |
|---|---|
| Mesa Operacional | Organizar por fila/action item e prioridade operacional, nao por status puro. |
| Conceitos | Status, fila, resultado, situacao principal e tags sao separados. |
| Lead ativo | Deve ter fila/action item, proxima acao e responsavel. |
| Lead terminal | Nao aparece na Mesa diaria. |
| Sem resposta | E resultado de interacao, nao status/fila. |
| Objecao | Deve ser tratada no follow-up e nao vai automaticamente para lideranca. |
| Perdido/desqualificado | Apenas lideranca/admin finaliza. |
| Lideranca | Decide perdido, desqualificado, nutricao, reabertura e excecoes. |
| Nutricao | E visao/fila propria e nao deve poluir a rotina diaria. |
| Follow-up longo | Exige motivo e gera alerta de lideranca. |
| Mock/frontend | Pode simular engine para validacao, mas CRM real depende do backend como dono do ciclo de vida. |

## Pendencias resolvidas no contrato tecnico

| Tema | Decisao M1/M2 |
|---|---|
| Cadencia de 12 tentativas sem resposta | Adotar como alvo M1/M2. |
| Fila `Validar agendamento` | Criar action item canonico `validar_agendamento`. |
| Status `Follow-up` | Manter como label de UX, nao status canonico. |
| Status `Arquivado / Nao contatar` | Criar status terminal `arquivado_nao_contatar`. |
| Contadores separados `sem_resposta` e `follow_up` | Adotar contrato documental com `sem_resposta_count` e `follow_up_count`. |

## Pendencias tecnicas ainda abertas

| Pendencia | Motivo |
|---|---|
| Configuracoes operacionais editaveis | Exigem auth, permissoes, auditoria, schema/API e testes. |
| Ranking persistido de situacao/tags | Exige contrato de API ou configuracao backend. |
| Payload/API final | Ainda exige reconciliacao em `docs/api/rest-api.md`. |
| Persistencia fisica | Ainda exige decisao de schema/migration. |

## Riscos controlados

| Risco | Controle documental |
|---|---|
| Mock inventar status | Usar vocabulario canonico e mapear labels de tela. |
| Front decidir regra critica sozinho | Registrar que backend e dono do ciclo de vida real. |
| Misturar status com resultado | Manter tabela de conceitos separados. |
| Nutricao poluir rotina diaria | Exigir visao/filtro separado. |
| Follow-up longo esconder lead ativo | Exigir motivo e alerta. |
| Atendente finalizar perdido/desqualificado | Bloquear por permissao e validar no backend futuramente. |

## Proxima decisao recomendada

Antes de implementar backend/frontend M1/M2, decidir explicitamente:

1. nomes finais de payload/API;
2. persistencia fisica de status, action items, contadores, tags e situacao principal;
3. onde situacao principal e tags serao calculadas;
4. estrategia de auth/permissao real;
5. se configuracoes serao hardcoded inicialmente ou administraveis.

Sem essas decisoes tecnicas, o mock pode evoluir, mas o CRM real nao deve alterar schema/API.
