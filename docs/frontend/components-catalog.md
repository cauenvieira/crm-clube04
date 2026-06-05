# Frontend Components Catalog

## Objetivo

Catalogar os componentes disponiveis ou esperados em `apps/web/src/components/ui` e orientar seu uso no CRM Clube04.

Este catalogo evita duplicacao, padroniza UX e protege a UI Foundation. Nao e uma lista decorativa: antes de criar componente novo, verificar este documento e a pasta `apps/web/src/components/ui`.

## Regras gerais

- Usar componentes existentes antes de criar novos.
- Manter componentes pequenos e previsiveis.
- Nao criar uma segunda biblioteca de UI.
- Nao copiar componentes Lovable wholesale.
- Props devem ser simples e orientadas a uso operacional.
- Textos visiveis devem ser humanos, sem `snake_case`.
- Componentes de dominio podem compor `components/ui`, mas nao substituir a fundacao.

## Componentes

### accordion

Finalidade:
- revelar/ocultar blocos secundarios.

Quando usar:
- detalhes tecnicos;
- opcoes avancadas;
- secoes recolhiveis no drawer.

Cuidados:
- conteudo critico nao deve depender de accordion fechado.

### badge

Finalidade:
- pequenos marcadores de categoria ou atributo.

Quando usar:
- origem;
- campanha;
- prioridade curta;
- tipo de lead;
- responsavel.

Cuidados:
- nao usar como substituto de `status-chip` quando for status operacional.

### button

Finalidade:
- acoes do usuario.

Quando usar:
- salvar;
- buscar;
- abrir WhatsApp;
- concluir;
- cancelar/ignorar;
- exportar.

Cuidados:
- uma acao primaria por area;
- acao destrutiva ou irreversivel deve exigir contexto claro;
- nao esconder acao principal em dropdown.

### card

Finalidade:
- agrupar informacao relacionada.

Quando usar:
- metricas;
- blocos de resumo;
- filas operacionais;
- secoes de formulario.

Cuidados:
- evitar cards dentro de cards;
- nao transformar cada linha operacional em card decorativo sem necessidade.

### dialog

Finalidade:
- fluxo modal central e curto.

Quando usar:
- confirmacao;
- cadastro curto;
- decisao bloqueante.

Cuidados:
- fluxo longo deve usar `sheet` ou pagina dedicada.

### dropdown-menu

Finalidade:
- acoes secundarias compactas.

Quando usar:
- exportar;
- mais opcoes;
- acoes raras.

Cuidados:
- nao esconder proxima acao operacional primaria.

### empty-state

Finalidade:
- explicar ausencia de dados.

Quando usar:
- lista vazia;
- filtro sem resultado;
- primeira execucao;
- endpoint sem itens.

Cuidados:
- sempre dizer o que aconteceu e qual proxima acao.

### input

Finalidade:
- entrada textual curta.

Quando usar:
- telefone;
- nome do tutor;
- nome do pet;
- busca;
- campanha;
- responsavel.

Cuidados:
- label obrigatorio;
- placeholder apenas como exemplo;
- erros devem ser visiveis e especificos.

### label

Finalidade:
- rotulo acessivel para campos.

Quando usar:
- formularios e controles.

Cuidados:
- nao substituir por placeholder.

### metric-card

Finalidade:
- contador operacional de destaque.

Quando usar:
- resumo diario;
- total de atrasados;
- leads novos;
- follow-ups;
- backlog;
- conversoes.

Cuidados:
- numero principal escaneavel;
- subtitulo deve explicar criterio;
- evitar metricas de vaidade sem acao associada.

### select

Finalidade:
- escolha de valor controlado.

Quando usar:
- status;
- origem;
- atendente;
- outcome;
- motivo de perda;
- motivo de desqualificacao;
- filtros.

Cuidados:
- preferir quando a lista e fechada;
- labels devem ser traduzidos para humanos;
- valores internos devem continuar consistentes com API/schema.

### separator

Finalidade:
- separar blocos relacionados.

Quando usar:
- divisao visual leve entre secoes.

Cuidados:
- nao usar como decoracao excessiva.

### sheet

Finalidade:
- painel lateral contextual.

Quando usar:
- acompanhamento de lead;
- detalhes de registro;
- edicao contextual;
- historico.

Cuidados:
- manter tela de origem visivel;
- evitar fluxo muito longo;
- proxima acao deve estar no topo ou proxima do resumo.

### status-chip

Finalidade:
- status operacional padronizado.

Quando usar:
- status de lead;
- status de action item;
- estado de API key;
- fila operacional;
- prioridade.

Cuidados:
- nao exibir `snake_case`;
- usar cores de forma consistente;
- incluir texto sempre.

### table

Finalidade:
- dados tabulares densos e comparaveis.

Quando usar:
- base de leads;
- auditoria;
- exportacao;
- listas gerenciais;
- comparacao por coluna.

Cuidados:
- evitar excesso de colunas;
- priorizar campos de acao e conferencia;
- validar overflow horizontal;
- em rotina diaria, avaliar lista/cards quando houver acao intensa por item.

### tabs

Finalidade:
- alternar visoes dentro do mesmo contexto.

Quando usar:
- Kanban/lista;
- resumo/historico;
- abertas/concluidas;
- filtros de uma mesma tela.

Cuidados:
- tabs nao devem navegar para contexto totalmente diferente.

### textarea

Finalidade:
- texto livre longo.

Quando usar:
- observacao;
- resumo;
- justificativa;
- feedback de lideranca.

Cuidados:
- texto livre deve ser secundario;
- preferir opcoes controladas quando possivel;
- quando contrato exigir justificativa, validar obrigatoriedade.

### tooltip

Finalidade:
- explicar icones ou termos curtos.

Quando usar:
- botoes icon-only;
- indicadores tecnicos;
- criterio de metrica.

Cuidados:
- nao colocar informacao essencial somente em tooltip.

## Padroes compostos recomendados

### OperationalPageHeader

Composicao esperada:
- titulo;
- descricao curta;
- acao primaria;
- filtros principais quando aplicavel.

Uso:
- Base de Leads;
- Mesa Operacional;
- Dashboard/Resumo.

### LeadStatusChip

Composicao esperada:
- `status-chip` com mapa de status operacional para label humana.

Uso:
- Base de Leads;
- Drawer;
- Worklist.

Regra:
- status e labels devem seguir contrato operacional quando envolver Jornada do Lead.

### ActionItemCard

Composicao esperada:
- `card`, `badge`, `button`, `status-chip`.

Uso:
- Mesa Operacional;
- Hoje;
- atrasados/backlog.

Regra:
- concluir/mover item deve chamar backend; movimentacao critica nao deve ser apenas visual.

### LeadDrawer

Composicao esperada:
- `sheet`, `tabs`, `textarea`, `select`, `button`, `status-chip`.

Uso:
- acompanhamento operacional do lead.

Regra:
- deve mostrar contexto antes de historico detalhado;
- deve registrar outcome estruturado no backend.

## Antes de criar componente novo

Responder:

1. Ja existe algo em `components/ui`?
2. E componente generico ou de dominio?
3. Sera usado por mais de uma tela?
4. Tem estado acessivel e erro claro?
5. Tem texto humano para operador?
6. Exige atualizacao deste catalogo?

Se a resposta 6 for sim, atualizar este documento na mesma tarefa.
