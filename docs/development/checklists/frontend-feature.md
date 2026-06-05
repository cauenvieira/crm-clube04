# Checklist - Frontend Feature

Use este checklist para mudancas em `apps/web` e no dashboard local/dev.

## Antes de alterar

- [ ] Milestone classificada.
- [ ] Tela/fluxo afetado definido.
- [ ] Dependencia de API identificada.
- [ ] `docs/frontend/design-system.md` consultado.
- [ ] `docs/frontend/components-catalog.md` consultado.
- [ ] `docs/frontend/lovable-adaptation-guide.md` consultado quando houver referencia visual.
- [ ] `docs/web/dashboard.md` consultado quando o dashboard mudar.
- [ ] Se envolver regra de lead, consultar os tres documentos obrigatorios da Jornada do Lead.

## Regras de UI

- [ ] Usar `apps/web/src/components/ui` antes de criar componente novo.
- [ ] Nao criar biblioteca paralela de componentes.
- [ ] Nao copiar arquitetura, mock data ou store do Lovable.
- [ ] Nao expor snake_case, `action_item`, `outcome` ou enums internos ao operador.
- [ ] Estados de loading, empty e erro tratados.
- [ ] Feedback claro para a acao do usuario.
- [ ] Sem overflow horizontal no baseline desktop.
- [ ] API key/localStorage preservados apenas como solucao local/dev.

## Regra operacional protegida

- [ ] Movimentacao critica de lead nao foi implementada apenas no frontend.
- [ ] Backend continua dono do ciclo de vida.
- [ ] Textos, status e labels de UI foram traduzidos para linguagem operacional.

## Documentacao

- [ ] `docs/web/dashboard.md` atualizado se comportamento/tela mudou.
- [ ] `docs/frontend/design-system.md` atualizado se novo padrao visual foi aceito.
- [ ] `docs/frontend/components-catalog.md` atualizado se componente UI novo foi criado.
- [ ] `docs/tasks.md` atualizado se backlog/prioridade mudou.

## Validacao

- [ ] `npm run build`
- [ ] `npm run lint`
- [ ] `npm run verify:dashboard`
- [ ] `npm run verify:frontend`
- [ ] `npm run verify:all` antes de commit quando houver codigo.
- [ ] Validacao visual no navegador quando a mudanca for de layout.

## Git

- [ ] `git status --short` revisado.
- [ ] `git diff --stat` revisado.
- [ ] `git diff --check` sem saida.
- [ ] `git add` com caminhos especificos.
- [ ] Nao usar `git add -A`.
