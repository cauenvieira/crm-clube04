# Operational Flows

## 1) Lead novo ate primeira resposta

1. Entrada por webhook/API/manual.
2. Normalizacao de contato e deduplicacao.
3. Criacao/atualizacao de lead com status inicial.
4. Geracao de action_item de resposta inicial.
5. Atendimento executa e registra interaction.

## 2) Lead em atendimento ate agendamento

1. Lead recebe dono (`assigned_to`) e status operacional.
2. Tentativas e observacoes sao registradas.
3. Proxima acao e prazo sao definidos.
4. Quando ha retorno positivo, registrar agendamento.
5. Action_item pendente e concluido/atualizado.

## 3) Lead convertido em cliente

1. Confirmacao de conversao comercial.
2. Vinculo com customer e pet (quando disponivel).
3. Fechamento de tarefas de funil de lead.
4. Entrada imediata na Jornada do Cliente.
5. Preservacao de origem/campanha para ROI.

## 4) Lead sem retorno ate revisao de lideranca

1. Regras detectam prazo vencido ou baixa interacao.
2. Lead entra em lista de risco na worklist.
3. Equipe registra novas tentativas.
4. Casos fora de script sobem para lideranca.
5. Lideranca decide: insistir, pausar, desqualificar ou reativar depois.

## 5) Cliente ativo ate recorrencia

1. Cliente convertido entra em rotina de acompanhamento.
2. Monitorar servicos, agenda e pacote.
3. Detectar risco: sem agenda, sem retorno, pacote perto de acabar.
4. Gerar action_items de retencao.
5. Registrar resultado e atualizar status.

## 6) Cliente inativo ate reativacao

1. Regras identificam inatividade por janela de dias.
2. Segmentar clientes por risco e potencial.
3. Criar tarefas de reativacao com prioridade.
4. Executar contato e registrar interaction.
5. Se reativado, retornar ao fluxo de cliente ativo.

## 7) Metas mensais ate metas diarias

1. Definir meta mensal por loja e colaborador.
2. Distribuir meta diaria e semanal.
3. Consolidar realizado do periodo.
4. Calcular desvio e tendencia.
5. Acionar alertas e ajustes de execucao.

## 8) Relatorio diario operacional

1. Coletar metricas de summary/worklist.
2. Gerar leitura por prioridade e bloqueios.
3. Enviar para canal interno (chat/email no futuro).
4. Lideranca revisa desvios e define foco do dia.
5. Guardar historico de relatorio para comparacao.

## 9) WhatsApp modo escuta

1. Canal recebe eventos inbound.
2. n8n normaliza payload e envia para CRM.
3. CRM aplica idempotencia e atualiza contexto.
4. Se necessario, gera lead/action_item automaticamente.
5. Atendimento assume fluxo humano de resposta.

## 10) Futuro funil omnichannel

1. Adaptadores de canal enviam payloads normalizados.
2. CRM unifica eventos por contato e jornada.
3. Atribuicao de origem preservada entre canais.
4. Worklist prioriza por SLA e valor potencial.
5. Relatorios comparam performance por canal e campanha.

## Decisoes operacionais transversais

- Kanban e util para leitura de funil, mas worklist e mais critica para rotina diaria.
- Tabela/exportacao continua obrigatoria para conferencia e gestao.
- Integracoes entram por adaptadores com contratos estaveis.
