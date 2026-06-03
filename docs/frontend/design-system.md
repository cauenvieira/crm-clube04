# Frontend Design System

Guia de base visual para evoluir o dashboard do CRM Clube04 sem copiar arquitetura de prototipos.

## Stack visual atual

- React 18 + TypeScript.
- Vite.
- Tailwind CSS via `@tailwindcss/vite`.
- Radix UI essencial para primitivas acessiveis.
- `lucide-react` para icones.
- `clsx`, `tailwind-merge` e `class-variance-authority` para composicao segura de classes.

## Tokens Clube04

A UI Foundation definiu tokens em `apps/web/src/styles.css` para:

- laranja Clube04 como cor de acao e destaque;
- fundo claro para area de trabalho;
- sidebar escura;
- cards brancos com borda sutil;
- estados de sucesso, alerta e erro;
- textos neutros para interfaces densas.

Use esses tokens antes de criar cores novas.

## Regras de uso

- Priorizar `apps/web/src/components/ui` antes de criar componente novo.
- Usar `button`, `card`, `badge`, `status-chip`, `input`, `select`, `table`, `dialog`, `sheet` e `tabs` como base de tela.
- Evitar criar CSS global grande em `styles.css`.
- Preferir componentes pequenos por tela e por responsabilidade.
- Manter texto de UI claro, operacional e sem termos internos como `action_item`, `outcome` ou snake_case.
- Manter arquivos tecnicos em ASCII-only.

## Layout

- SaaS operacional deve ser denso, legivel e previsivel.
- Evitar hero, marketing layout, cards decorativos aninhados e fundos ornamentais.
- Priorizar:
  - leitura rapida;
  - agrupamento por rotina;
  - acoes principais claras;
  - estados vazios e erro explicitos;
  - sem overflow horizontal.

## Lovable

O Lovable e referencia visual e de UX, nao fonte de arquitetura.

Pode adaptar:

- hierarquia de sidebar;
- espacamento;
- cards de metrica;
- chips de status;
- composicao de drawer;
- ritmo visual das telas.

Nao copiar:

- React 19;
- TanStack Start;
- TanStack Router;
- store local;
- mock data;
- codigo wholesale.

## CSS global

`styles.css` deve conter apenas:

- imports globais;
- tokens;
- reset/base minimo;
- ajustes estruturais muito reutilizaveis.

Estilos especificos de tela devem ficar preferencialmente em componentes, usando `components/ui` e classes Tailwind.
