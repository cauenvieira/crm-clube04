# Lead Operational System

Projeto: CRM Clube04 Mogi das Cruzes
Data: 2026-06-07
Status: especificacao complementar M1/M2
Milestone: M1 Jornada do Lead / M2 Mesa Operacional

## Papel na hierarquia

Este documento descreve a visao funcional alvo do Lead Operacional e da Mesa Operacional.

Autoridade:

1. `docs/product/lead-operational-contract.md`
2. `docs/product/lead-operational-technical-contract.md`
3. `docs/product/lead-import-normalization.md`
4. `docs/qa/lead-business-rules-test-matrix.md`
5. `docs/product/lead-operational-system.md`
6. `docs/product/lead-operational-ui-wireframes.md`
7. `docs/product/lead-operational-decisions.md`
8. `docs/qa/lead-operational-cycle-test-plan.md`

Se este documento divergir do contrato operacional, o contrato vence. Divergencias devem virar ajuste explicito de contrato, matriz e testes antes de implementacao.

## Objetivo

Estruturar a rotina real de atendimento de leads do Clube04 Mogi, principalmente leads de WhatsApp e trafego pago, para que a equipe saiba:

- qual lead precisa de acao;
- qual fila operacional deve ser trabalhada;
- qual foi o ultimo resultado;
- qual e a proxima acao;
- quem e o responsavel;
- quais casos exigem lideranca;
- quais leads devem sair da rotina diaria e ir para nutricao;
- quais eventos precisam de auditoria.

## Conceitos separados

Status, fila operacional, resultado, situacao principal e tags sao conceitos diferentes.

| Conceito | Pergunta que responde | Fonte atual |
|---|---|---|
| Status do lead | Em que fase operacional o lead esta? | `lead-operational-contract.md` |
| Fila operacional/action item | O que precisa ser feito agora? | `lead-operational-contract.md` |
| Proxima acao | Quando alguem deve agir? | contrato + backend |
| Resultado da interacao | O que aconteceu no atendimento? | contrato + matriz |
| Situacao principal | Qual alerta mais importante do card? | proposta UX M2 |
| Tags secundarias | Quais sinais complementares aparecem? | proposta UX M2 |

## Vocabulario canonico atual

Usar o vocabulario do contrato ate que uma mudanca seja aprovada.

Status operacionais canonicos:

- `novo_lead`
- `em_atendimento`
- `aguardando_resposta`
- `agendado`
- `convertido`
- `perdido`
- `desqualificado`
- `nutricao_campanha`
- `revisar_lideranca`
- `arquivado_nao_contatar`

Action items canonicos:

- `atender_hoje`
- `fazer_follow_up`
- `retomar_atendimento`
- `validar_agendamento`
- `revisar_lideranca`
- `nutricao_campanha`

Termos de tela podem ser mais amigaveis, mas nao devem inventar comportamento:

| Termo de tela proposto | Mapeamento conceitual atual | Observacao |
|---|---|---|
| Novo | `novo_lead` | Status inicial, nao fila. |
| Fazer follow-up | `fazer_follow_up` ou `atender_hoje` | Fila/action item de rotina. |
| Validar agendamento | `validar_agendamento` | Fila/action item canonico M1/M2. |
| Revisar na lideranca | `revisar_lideranca` | Status/action item de analise. |
| Nutricao | `nutricao_campanha` | Fila/visao separada da rotina diaria. |
| Arquivado / Nao contatar | `arquivado_nao_contatar` | Status terminal para opt-out/bloqueio. |

## Regras criticas

- Lead ativo sempre deve ter fila operacional/action item, proxima acao e responsavel.
- Lead terminal nao aparece na Mesa Operacional diaria.
- Lead terminal nao deve manter fila diaria comum nem proxima acao comum.
- `Sem resposta` e resultado de interacao, nao status e nao fila.
- Atendente nao finaliza lead como `perdido` ou `desqualificado`.
- Lideranca/admin decidem `perdido`, `desqualificado`, `nutricao_campanha` e reabertura.
- Resultado `sem_resposta` incrementa contador de sem resposta e contador de follow-up.
- Conversa, interesse e objecao incrementam apenas o contador de follow-up.
- Objecao deve ser trabalhada no follow-up e nao envia automaticamente para lideranca.
- Follow-up longo exige motivo e deve gerar alerta para lideranca.
- Nutricao e fila/visao propria e nao deve poluir a rotina diaria.
- No mock, a engine pode ser simulada no frontend. No CRM real, o backend deve ser dono do ciclo de vida.

## Decisoes tecnicas resolvidas

Estas propostas foram promovidas para contrato tecnico documental em `docs/product/lead-operational-technical-contract.md`.

| Proposta | Decisao |
|---|---|---|
| Cadencia de 12 tentativas sem resposta | Adotar como alvo M1/M2. |
| Fila `Validar agendamento` | Criar action item canonico `validar_agendamento`. |
| Status `Follow-up` | Manter como label de UI, nao status canonico. |
| Status `Arquivado / Nao contatar` | Criar status terminal `arquivado_nao_contatar`. |
| Nutricao com proxima data de campanha | Permitida em visao propria, fora da rotina diaria. |

## Fluxo alvo da Mesa

```text
fila operacional/action item
-> atendente registra resultado
-> backend aplica regras
-> backend cria historico/auditoria
-> backend atualiza status, action item, proxima acao e responsavel
-> frontend exibe situacao principal e tags calculadas/recebidas
```

## Fora do escopo desta formalizacao

- Alterar schema.
- Alterar API.
- Implementar frontend.
- Implementar scripts ou testes automatizados.
- Alterar cadencia vigente sem contrato atualizado.
- Executar WhatsApp real, WAHA, n8n ou integracoes externas.
