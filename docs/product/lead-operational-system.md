# Lead Operational System

Projeto: CRM Clube04 Mogi das Cruzes
Data: 2026-06-07
Status: especificacao complementar M1/M2
Milestone: M1 Jornada do Lead / M2 Mesa Operacional

## Papel na hierarquia

Este documento descreve a visao funcional alvo do Lead Operacional e da Mesa Operacional.

Autoridade:

1. `docs/product/lead-operational-contract.md`
2. `docs/product/lead-import-normalization.md`
3. `docs/qa/lead-business-rules-test-matrix.md`
4. `docs/product/lead-operational-system.md`
5. `docs/product/lead-operational-ui-wireframes.md`
6. `docs/product/lead-operational-decisions.md`
7. `docs/qa/lead-operational-cycle-test-plan.md`

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

Action items canonicos:

- `atender_hoje`
- `fazer_follow_up`
- `retomar_atendimento`
- `revisar_lideranca`
- `nutricao_campanha`

Termos de tela podem ser mais amigaveis, mas nao devem inventar comportamento:

| Termo de tela proposto | Mapeamento conceitual atual | Observacao |
|---|---|---|
| Novo | `novo_lead` | Status inicial, nao fila. |
| Fazer follow-up | `fazer_follow_up` ou `atender_hoje` | Fila/action item de rotina. |
| Validar agendamento | lacuna/proposta M2 | Nao existe como action item canonico no contrato atual. |
| Revisar na lideranca | `revisar_lideranca` | Status/action item de analise. |
| Nutricao | `nutricao_campanha` | Fila/visao separada da rotina diaria. |
| Arquivado / Nao contatar | lacuna/proposta | Nao existe como status canonico atual. |

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

## Propostas que ainda exigem reconciliacao

Estas propostas aparecem nos novos documentos de UX/teste, mas ainda nao devem ser tratadas como regra vigente sem atualizar contrato e matriz:

| Proposta | Conflito/lacuna atual | Tratamento |
|---|---|---|
| Cadencia de 12 tentativas sem resposta | Contrato atual usa 4 tentativas iniciais, com 4a enviando para lideranca. | Pendente de decisao e atualizacao de contrato/testes. |
| Fila `Validar agendamento` | Contrato atual diz que `agendado` sai da fila comum e entra em analise de conversao, sem action item dedicado. | Pendente de modelagem M2/backend. |
| Status `Follow-up` | Contrato atual usa `em_atendimento` e `aguardando_resposta`. | Usar apenas como label de tela ate decisao. |
| Status `Arquivado / Nao contatar` | Nao existe no contrato atual. | Tratar como proposta futura para opt-out. |
| Nutricao com proxima data de campanha | Contrato atual define `nutricao_campanha` como frio/fora da fila diaria. | Permitido como visao separada, mas sem rotina diaria comum. |

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
