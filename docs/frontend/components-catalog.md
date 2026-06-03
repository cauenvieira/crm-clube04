# Frontend Components Catalog

Catalogo inicial dos componentes disponiveis em `apps/web/src/components/ui`.

## accordion

- Finalidade: revelar/ocultar blocos secundarios.
- Quando usar: detalhes tecnicos, opcoes avancadas, secoes recolhiveis.
- UX: conteudo critico nao deve depender de accordion fechado.

## badge

- Finalidade: pequenos marcadores de estado.
- Quando usar: prioridade, urgencia, status curto, categoria.
- UX: manter texto curto e contraste suficiente.

## button

- Finalidade: acoes de usuario.
- Quando usar: comandos principais, secundarios e destrutivos.
- UX: uma acao primaria por area; usar icone lucide quando reduzir ruido.

## card

- Finalidade: agrupar informacao relacionada.
- Quando usar: metricas, formularios curtos, blocos de resumo.
- UX: evitar cards dentro de cards.

## dialog

- Finalidade: fluxo modal central.
- Quando usar: confirmacoes, cadastro curto, escolhas bloqueantes.
- UX: nao usar para fluxos longos quando um `sheet` for melhor.

## dropdown-menu

- Finalidade: acoes secundarias ou menus compactos.
- Quando usar: mais opcoes, exportar, acoes raras.
- UX: nao esconder acao principal no dropdown.

## empty-state

- Finalidade: estado sem dados.
- Quando usar: listas vazias, filtros sem resultado, primeira execucao.
- UX: dizer o que aconteceu e qual proxima acao.

## input

- Finalidade: entrada textual curta.
- Quando usar: telefone, tutor, busca, campos simples.
- UX: usar label claro, placeholder apenas como exemplo.

## label

- Finalidade: rotulo acessivel para campos.
- Quando usar: formularios e controles.
- UX: label nao deve ser substituido por placeholder.

## metric-card

- Finalidade: contador operacional de destaque.
- Quando usar: resumo, SLA, fila, indicadores de dia.
- UX: numero principal deve ser escaneavel; subtitulo deve explicar o criterio.

## select

- Finalidade: escolha de valor controlado.
- Quando usar: status, origem, atendente, resultado, filtros.
- UX: preferir select quando a lista e fechada e curta.

## separator

- Finalidade: separar blocos relacionados.
- Quando usar: divisao visual leve entre secoes.
- UX: nao usar como decoracao excessiva.

## sheet

- Finalidade: painel lateral.
- Quando usar: acompanhamento de lead, detalhes de registro, edicao contextual.
- UX: manter a tela de origem visivel por contexto; evitar fluxo longo demais.

## status-chip

- Finalidade: status operacional padronizado.
- Quando usar: lead, action item, API key, filas e etapas.
- UX: texto deve ser humano; nao exibir snake_case.

## table

- Finalidade: dados tabulares densos.
- Quando usar: auditoria, exportacao, listas comparaveis.
- UX: para operacao diaria, avaliar card/lista antes de tabela larga.

## tabs

- Finalidade: alternar visoes no mesmo contexto.
- Quando usar: Kanban/lista, resumo/historico, segmentos de relatorio.
- UX: tabs nao devem navegar para contexto totalmente diferente.

## textarea

- Finalidade: texto livre longo.
- Quando usar: observacao, resumo, justificativa.
- UX: texto livre deve ser secundario; preferir opcoes controladas quando possivel.

## tooltip

- Finalidade: explicar icones ou termos curtos.
- Quando usar: botoes icon-only, indicadores tecnicos.
- UX: nao colocar informacao essencial somente em tooltip.
