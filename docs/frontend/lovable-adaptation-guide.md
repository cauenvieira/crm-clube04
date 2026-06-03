# Lovable Adaptation Guide

Guia para usar o prototipo Lovable como referencia visual, mantendo o CRM real como fonte de verdade.

## Referencia

Projeto local:

```text
C:\Users\cauev\OneDrive\Documentos\clube04-dog-crm-vision
```

Preview:

```text
https://clube04-dog-crm-vision.lovable.app
```

## O que adaptar

- Sidebar: hierarquia, peso visual, item ativo e clareza de navegacao.
- Cards: metricas com melhor espacamento, hierarquia e leitura rapida.
- Chips: status visuais consistentes e compactos.
- Drawer: resumo primeiro, historico limpo, campos secundarios recolhidos.
- Modal de novo lead: fluxo curto, campos essenciais primeiro.
- Spacing: mais respiro entre secoes sem virar tela de marketing.
- Fluxo visual: operador deve entender proxima acao sem ler documentacao.

## O que nao copiar

- React 19.
- TanStack Start.
- TanStack Router.
- Arquitetura de rotas.
- Mock data.
- Store local.
- `components/ui` inteiro.
- Codigo wholesale.
- Dependencias novas sem justificativa e aprovacao.

## Regras de adaptacao

- Adaptar uma tela por sprint.
- Manter API, auth, testes, Docker e estrutura do CRM real.
- Usar `apps/web/src/components/ui` antes de criar componente novo.
- Preservar contratos existentes.
- Nao misturar limpeza de UX com mudanca de backend.
- Validar com `verify:frontend` e auditoria visual.

## Ordem recomendada

1. Base de Leads.
2. Mesa Operacional.
3. Drawer de acompanhamento.
4. Dashboard e Resumo Diario.

## Arquivos Lovable de referencia

- `src/components/layout/AppLayout.tsx`
- `src/components/layout/Sidebar.tsx`
- `src/components/KpiCard.tsx`
- `src/components/LeadCard.tsx`
- `src/components/LeadDrawer.tsx`
- `src/components/NewLeadModal.tsx`
- `src/components/StatusChip.tsx`
- `src/routes/base.tsx`
- `src/routes/dashboard.tsx`
- `src/routes/resumo.tsx`
- `src/styles.css`

Use esses arquivos para entender intencao visual, nao para copiar implementacao.
