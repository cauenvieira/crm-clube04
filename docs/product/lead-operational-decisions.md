# Lead Operational Decisions

Projeto: CRM Clube04 Mogi das Cruzes
Data: 2026-06-07
Status: decisoes e pendencias controladas

## Papel na hierarquia

Este documento registra decisoes de produto/UX e lacunas para M1/M2. Ele nao substitui:

- `docs/product/lead-operational-contract.md`
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

## Pendencias que exigem mudanca formal

| Pendencia | Motivo |
|---|---|
| Cadencia de 12 tentativas sem resposta | Diverge do contrato atual, que documenta cadencia inicial de 4 tentativas. |
| Fila `Validar agendamento` | Nao existe como action item canonico atual. |
| Status `Follow-up` | Deve ser label de UX ou exigir mudanca de status canonico. |
| Status `Arquivado / Nao contatar` | Nao existe no contrato atual. |
| Contadores separados `sem_resposta` e `follow_up` | Alinhado conceitualmente, mas precisa contrato/API/teste antes de implementacao real. |
| Configuracoes operacionais editaveis | Exigem auth, permissoes, auditoria, schema/API e testes. |
| Ranking persistido de situacao/tags | Exige contrato de API ou configuracao backend. |

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

1. Manter cadencia atual de 4 tentativas ou migrar para 12.
2. Criar ou nao action item `validar_agendamento`.
3. Tratar `Follow-up` como label de UI ou novo status.
4. Criar status de opt-out/arquivamento ou mapear para desqualificacao/nutricao com motivo.
5. Definir contrato dos contadores separados.

Sem essas decisoes, o mock pode evoluir, mas o CRM real nao deve alterar comportamento operacional vigente.
