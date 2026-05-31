# Automation Strategy

## Objetivo

Evoluir automacoes de forma segura, auditavel e incremental, sem pular para respostas autonomas ao cliente cedo demais.

## 1) Automacoes simples por regra (fase inicial)

- Gatilhos por status de lead.
- Gatilhos por prazo vencido (`next_action_at`, `last_interaction_at`).
- Gatilhos por evento inbound de mensagem.
- Gatilhos por pacote perto de acabar e cliente sem agenda (fase futura).

## 2) Action items como motor inicial

- `action_items` e o mecanismo base de execucao diaria.
- Regras criam tarefas com tipo, prioridade e prazo.
- Equipe conclui/ignora/reagenda com historico.
- Worklist e summary leem o mesmo estado para evitar divergencia.

## 3) Tags automaticas

- Aplicar tags por comportamento observado:
  - sem resposta
  - alto interesse
  - risco de inatividade
  - precisa revisao lideranca
- Tags devem ser revisaveis e removiveis pela equipe.

## 4) Alertas de SLA

- Alertar atrasos de primeira resposta.
- Alertar follow-up vencido.
- Alertar fila critica acima de limiar.
- Alertar queda de conversao por canal (fase posterior).

## 5) Relatorio diario automatizado

- Consolidar prioridade do dia por worklist.
- Incluir blocos: pendencias, vencidos, risco de perda, movimento inbound.
- Envio em canal interno no horario definido.
- Historico de envios para auditoria.

## 6) IA em modo sugestao (futuro)

- Sugerir proxima melhor acao.
- Sugerir prioridade e resumo de contexto.
- Sugerir classificacao de motivo/perda.
- Nunca executar acao sensivel sem confirmacao humana nas fases iniciais.

## 7) Limites de seguranca

1. Nao automatizar resposta ao cliente de forma autonoma no inicio.
2. Nao remover decisao humana em casos sensiveis.
3. Toda automacao deve deixar trilha de auditoria.
4. Regras devem ser reversiveis e com rollout gradual.
5. Monitorar falso positivo/falso negativo de automacao.

## 8) Governanca tecnica

- Integracoes por adaptadores, sem acoplamento direto ao dominio.
- Idempotencia obrigatoria em eventos externos.
- Retentativa com backoff e log de erro.
- Ambientes de teste com dados artificiais para validar regras antes de uso real.

## 9) Decisoes registradas

- Worklist e prioridade diaria prevalecem sobre Kanban para operacao.
- Lead convertido continua no CRM como cliente, nao encerra a jornada.
- API key/localStorage e apenas para dev local.
- Antes de uso real: autenticacao, permissoes e auditoria sao mandatarios.
- IA entra como copiloto de atendimento, nao como atendimento autonomo.
