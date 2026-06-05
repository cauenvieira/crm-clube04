# Frontend Design System

## Objetivo

Definir a base visual e os criterios de UX do CRM Clube04 para evoluir o frontend sem criar biblioteca paralela, sem copiar arquitetura de prototipos e sem desconectar a interface da rotina real da unidade.

Este documento e fonte de referencia para tarefas de frontend, mas nao altera contratos de negocio. Quando uma tela envolver Jornada do Lead, a regra operacional deve vir dos documentos de produto e QA:

- `docs/product/lead-operational-contract.md`
- `docs/product/lead-import-normalization.md`
- `docs/qa/lead-business-rules-test-matrix.md`

## Escopo atual

O frontend atual e local/dev e deve apoiar principalmente:

- visualizacao operacional do dia;
- base de leads;
- cadastro manual de lead;
- acompanhamento de lead;
- uso disciplinado de action items;
- preparacao para Mesa Operacional.

Nao considerar o frontend atual como produto final. A UI Foundation existe para reconstruir as telas em sprints pequenas, usando componentes reaproveitaveis e contratos de API estaveis.

## Stack visual atual

- React 18 + TypeScript.
- Vite.
- Tailwind CSS via `@tailwindcss/vite`.
- Radix UI essencial para primitivas acessiveis.
- `lucide-react` para icones.
- `clsx`, `tailwind-merge` e `class-variance-authority` para composicao segura de classes.
- Componentes compartilhados em `apps/web/src/components/ui`.

Nao adicionar biblioteca visual nova sem justificativa e aprovacao.

## Principios de UX operacional

1. Operacao diaria antes de estetica.
2. A atendente deve entender a proxima acao sem ler documentacao.
3. Lideranca precisa enxergar excecoes, atrasos e gargalos.
4. Estados e acoes devem usar linguagem humana, nao nomes internos.
5. Interface deve reduzir ambiguidade, nao apenas exibir dados.
6. Worklist e mais importante que grafico nesta fase.
7. Tabela/exportacao continua util para conferencia gerencial.
8. Lovable e referencia visual, nao fonte de arquitetura.

## Tokens Clube04

A UI Foundation definiu tokens em `apps/web/src/styles.css` para:

- laranja Clube04 como cor de acao e destaque;
- fundo claro para area de trabalho;
- sidebar escura;
- cards brancos com borda sutil;
- estados de sucesso, alerta e erro;
- textos neutros para interfaces densas.

Regras:

- Usar tokens existentes antes de criar cores novas.
- Nao criar paleta paralela por tela.
- Evitar cor como unico indicador de estado.
- Manter contraste legivel para operacao diaria.

## Layout

O CRM deve parecer ferramenta operacional, nao landing page.

Priorizar:

- densidade controlada;
- leitura rapida;
- agrupamento por rotina;
- acoes principais claras;
- filtros visiveis;
- estados vazios explicitos;
- ausencia de overflow horizontal;
- sidebar estavel;
- drawer/sheet para contexto lateral.

Evitar:

- hero visual;
- marketing layout;
- cards decorativos aninhados;
- fundos ornamentais;
- modais longos para fluxo operacional;
- excesso de animacao;
- esconder acao primaria em dropdown.

## Componentes obrigatorios

Antes de criar componente novo, verificar `apps/web/src/components/ui` e `docs/frontend/components-catalog.md`.

Componentes base esperados:

- `button`
- `card`
- `badge`
- `status-chip`
- `input`
- `textarea`
- `select`
- `table`
- `dialog`
- `sheet`
- `tabs`
- `empty-state`
- `metric-card`

Regras:

- Nao criar biblioteca paralela em outra pasta.
- Nao copiar componentes Lovable wholesale.
- Componentes especificos de tela devem ser pequenos e nomeados pelo dominio.
- Se um padrao aparecer em duas ou mais telas, avaliar extracao para `components/ui`.

## Linguagem de interface

A UI deve traduzir termos tecnicos para operacao real.

Nao exibir diretamente:

- `action_item`
- `outcome`
- `snake_case`
- nomes de enum sem traducao
- erros crus de SQL/API

Exemplos de traducao:

- `novo_lead` -> `Novo lead`
- `em_atendimento` -> `Em atendimento`
- `aguardando_resposta` -> `Aguardando resposta`
- `revisar_lideranca` -> `Revisao da lideranca`
- `sem_resposta` -> `Sem resposta`
- `nutricao_campanha` -> `Nutricao/campanha`

Quando houver duvida de nomenclatura operacional, consultar contrato da Jornada do Lead.

## Padroes por tela

### Base de Leads

Objetivo:

- permitir busca, filtro, leitura e conferencia de leads;
- mostrar status, responsavel, origem, proxima acao e atrasos;
- abrir acompanhamento sem perder contexto.

Padroes:

- filtros no topo;
- tabela/lista densa para conferencia;
- chips de status humanos;
- destaque para atrasado/backlog;
- acao principal: abrir acompanhamento.

### Mesa Operacional

Objetivo:

- orientar o que a equipe precisa fazer hoje;
- separar atender hoje, follow-up, atrasado, backlog e lideranca;
- reduzir energia em lead frio ou finalizado.

Padroes:

- cards/listas por fila operacional;
- prioridade visual clara;
- acao rapida de WhatsApp quando houver telefone;
- conclusao/resultado sempre registrado no backend;
- movimentacao critica nunca apenas visual.

### Drawer de acompanhamento

Objetivo:

- concentrar contexto, historico e proxima decisao do lead.

Padroes:

- resumo do lead no topo;
- proxima acao visivel;
- historico em ordem clara;
- formulario de resultado com opcoes controladas;
- justificativa obrigatoria quando o contrato exigir;
- sem fluxo longo demais dentro do drawer.

### Novo Lead

Objetivo:

- cadastrar lead manual com minimo de friccao;
- evitar duplicidade ativa por telefone;
- gerar item operacional quando aplicavel.

Padroes:

- campos essenciais primeiro;
- telefone com validacao clara;
- feedback de duplicidade;
- resultado da criacao com `contact_id`, `lead_id` e `action_item_id` quando aplicavel.

## CSS global

`apps/web/src/styles.css` deve conter apenas:

- imports globais;
- tokens;
- reset/base minimo;
- ajustes estruturais muito reutilizaveis.

Estilos especificos de tela devem ficar em componentes, usando `components/ui` e classes Tailwind.

## Acessibilidade e estabilidade

- Usar Radix para dialog, sheet, dropdown e tabs quando aplicavel.
- Inputs sempre com label.
- Placeholder nao substitui label.
- Botoes icon-only precisam de `aria-label` ou texto acessivel.
- Estados de carregamento, erro e vazio devem ser explicitos.
- Evitar overflow horizontal; `hasHorizontalOverflow=false` deve ser validado quando possivel.

## Validacao frontend

Para mudanca de frontend, validar proporcionalmente:

- `npm run verify:frontend`
- `npm run verify:dashboard`
- validacao visual/manual quando aplicavel

Para docs-only frontend:

- `git diff --check`
- `npm run verify:data-cleanliness`

## Regra de fechamento

Toda tarefa de frontend deve informar:

- telas afetadas;
- componentes `components/ui` usados;
- contratos/API consumidos;
- validacoes executadas;
- lacunas visuais ou de regra;
- se docs de frontend, API ou produto precisaram atualizar.
