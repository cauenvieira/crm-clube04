# Operational Flows

## Objetivo

Descrever os fluxos operacionais do CRM Clube04 em nivel de produto, indicando o que e atual, o que e alvo de curto prazo e o que e futuro.

Este documento nao substitui contratos especificos. Para Jornada do Lead, a fonte de verdade e o contrato operacional, a normalizacao de importacao e a matriz de testes.

## Classificacao de maturidade

- Atual: ja existe base tecnica ou comportamento implementado/documentado.
- Alvo atual: deve guiar M1/M2 antes de novas frentes.
- Futuro: roadmap, nao implementar sem nova decisao.

## Fluxos M1 - Jornada do Lead

### 1. Lead novo ate primeira resposta

Maturidade:
- Alvo atual.

Fluxo:
1. Lead entra por cadastro manual, importacao ou webhook.
2. Sistema normaliza contato e valida duplicidade conforme regra vigente.
3. Lead e criado ou atualizado com status operacional valido.
4. Sistema cria ou expoe action item de primeira resposta quando necessario.
5. Atendimento realiza contato e registra interaction.
6. Sistema define proxima acao ou novo estado conforme resultado.

Autoridade:
- `docs/product/lead-operational-contract.md`.
- `docs/product/lead-import-normalization.md`.
- `docs/qa/lead-business-rules-test-matrix.md`.

### 2. Lead em atendimento ate agendamento

Maturidade:
- Alvo atual.

Fluxo:
1. Lead recebe responsavel quando aplicavel.
2. Atendente registra tentativa, observacao e resultado.
3. Sistema calcula ou exige proxima acao.
4. Lead segue em atendimento, aguardando resposta, follow-up ou escalonamento.
5. Quando ha retorno positivo, registrar agendamento.
6. Action item pendente e concluido, neutralizado ou substituido conforme regra.

Cuidado:
- lead ativo nao deve ficar sem proxima acao.
- movimentacao critica deve gerar historico.

### 3. Lead sem resposta ate analise da lideranca

Maturidade:
- Alvo atual.

Fluxo:
1. Atendente registra tentativas sem resposta.
2. Sistema aplica cadencia e limite de tentativas.
3. Ao atingir criterio de excecao, lead vai para analise de lideranca.
4. Atendente deve preencher autoanalise quando exigido.
5. Lideranca decide destino: insistir, pausar/nutricao, perder, desqualificar ou reativar depois.
6. Decisao gera historico e atualiza action items.

Cuidado:
- analise de lideranca nao deve competir com follow-up comum.
- decisao exige justificativa/auditoria.

### 4. Lead agendado ate conversao

Maturidade:
- Alvo atual.

Fluxo:
1. Lead recebe registro de agendamento.
2. Sai da fila comum de atendimento comercial.
3. Permanece rastreavel para conversao.
4. Quando o atendimento/venda for confirmado, lead vira cliente.
5. Itens diarios abertos sao fechados ou neutralizados.
6. Origem/campanha sao preservadas para analise futura.

Cuidado:
- conversao nao deve apagar historico da Jornada do Lead.

### 5. Lead perdido, desqualificado ou nutricao

Maturidade:
- Alvo atual.

Fluxo:
1. Sistema exige motivo quando status final ou desqualificacao exigir.
2. Historico registra decisao.
3. Lead sai da fila diaria.
4. Lead desqualificado nao deve ser tratado como perda comercial simples.
5. Lead em nutricao/campanha nao deve consumir energia diaria da equipe.

Cuidado:
- nutricao nesta etapa nao significa automacao real de campanha.

## Fluxos M2 - Mesa Operacional

### 6. Rotina diaria da atendente

Maturidade:
- Alvo seguinte.

Fluxo:
1. Atendente abre Mesa Operacional.
2. Sistema mostra atender hoje, atrasados, backlog e prioridades.
3. Atendente executa contato a partir da worklist.
4. Resultado gera historico e proxima acao.
5. Itens concluidos saem da fila ativa.
6. Lideranca acompanha desvios e casos escalados.

Cuidado:
- Kanban pode ajudar leitura de funil, mas worklist e mais critica para rotina diaria.

### 7. Relatorio diario operacional

Maturidade:
- Alvo seguinte.

Fluxo:
1. Sistema coleta metricas de summary/worklist.
2. Relatorio destaca volume, pendencias, atrasos, backlog, conversao e gargalos.
3. Lideranca revisa desvios e define foco do dia.
4. Historico do relatorio permite comparacao.
5. Futuramente, relatorio pode ser enviado para canal interno.

Cuidado:
- relatorio deve gerar decisao operacional, nao apenas visualizacao.

## Fluxos M3 - Importacao robusta

### 8. Planilha legada ate base operacional

Maturidade:
- Alvo apos base M1.

Fluxo:
1. Planilha e lida em modo seguro, sem versionar dado real.
2. Sistema normaliza campos conforme contrato de importacao.
3. Registros invalidos vao para relatorio/quarentena.
4. Duplicidade ativa por telefone e tratada de forma conservadora.
5. Leads ativos importados recebem action item adequado.
6. Leads finais/frios nao entram na fila diaria.

Autoridade:
- `docs/product/lead-import-normalization.md`.

## Fluxos M4 - Atendimento e WhatsApp

### 9. WhatsApp modo escuta

Maturidade:
- Futuro controlado.

Fluxo:
1. Canal recebe evento inbound.
2. Adaptador/n8n normaliza payload.
3. CRM aplica idempotencia.
4. CRM atualiza conversa, mensagem e contexto.
5. Se necessario, gera lead/action item.
6. Atendimento humano assume resposta.

Cuidado:
- iniciar por modo escuta/inbound antes de qualquer automacao ativa.

### 10. Templates e apoio ao atendimento

Maturidade:
- Futuro controlado.

Fluxo:
1. Atendente ve contexto do lead/cliente.
2. Sistema sugere mensagem ou template.
3. Humano revisa e envia.
4. Resultado e registrado no historico.

Cuidado:
- IA nao deve enviar resposta autonoma sem supervisao e fallback.

## Fluxos M5 - Jornada do Cliente

### 11. Cliente ativo ate recorrencia

Maturidade:
- Futuro.

Fluxo:
1. Cliente convertido entra em rotina de acompanhamento.
2. Sistema monitora servicos, agenda e pacotes.
3. Regras detectam risco: sem agenda, sem retorno, pacote perto de acabar.
4. Sistema gera action items de retencao.
5. Atendimento registra resultado e atualiza status.

Cuidado:
- nao iniciar M5 antes da conversao M1 estar confiavel.

### 12. Cliente inativo ate reativacao

Maturidade:
- Futuro.

Fluxo:
1. Regras identificam inatividade por janela de dias.
2. Clientes sao segmentados por risco e potencial.
3. Sistema cria tarefas de reativacao.
4. Atendimento executa contato e registra interaction.
5. Se reativado, retorna ao fluxo de cliente ativo.

## Fluxos M6 - Operacao, metas e gestao

### 13. Metas mensais ate metas diarias

Maturidade:
- Futuro.

Fluxo:
1. Lideranca define meta mensal por loja e/ou colaborador.
2. Sistema distribui meta diaria e semanal.
3. Realizado e consolidado por periodo.
4. Sistema calcula desvio e tendencia.
5. Lideranca ajusta foco operacional.

Cuidado:
- separar configuracao, realizado, calculo e visualizacao.

### 14. Producao e capacidade

Maturidade:
- Futuro.

Fluxo:
1. Sistema coleta agenda, servicos e producao.
2. Capacidade e ocupacao sao calculadas.
3. Desvios e gargalos sao destacados.
4. Lideranca ajusta escala, foco comercial e oferta.

Cuidado:
- dados de origem incompletos podem gerar decisao incorreta.

## Decisoes operacionais transversais

- Worklist e prioridade operacional vencem dashboard cosmetico.
- Tabela/exportacao continua importante para conferencia e gestao.
- Integracoes entram por adaptadores com contratos estaveis.
- Historico nunca deve ser apagado por conveniencia visual.
- Toda movimentacao critica deve ser auditavel.
- O backend deve ser dono das regras de ciclo de vida.
