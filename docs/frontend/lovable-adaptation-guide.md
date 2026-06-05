# Lovable Adaptation Guide

## Objetivo

Definir como usar o prototipo Lovable como referencia visual sem transformar o CRM Clube04 em copia de arquitetura, dependencias, mock data ou fluxos genericos.

Lovable ajuda na direcao visual. O repositorio CRM Clube04 continua sendo a fonte de verdade para arquitetura, API, regra de negocio, testes e evolucao incremental.

## Referencia

Projeto local de referencia:

```text
C:\Users\cauev\OneDrive\Documentos\clube04-dog-crm-vision
```

Preview:

```text
https://clube04-dog-crm-vision.lovable.app
```

## Papel do Lovable

Usar para:

- entender intencao visual;
- melhorar ritmo de tela;
- observar hierarquia de sidebar;
- adaptar composicao de cards;
- inspirar drawer e modal;
- melhorar clareza de status;
- melhorar spacing e densidade.

Nao usar para:

- decidir arquitetura;
- definir contratos de API;
- definir enums/status;
- substituir UI Foundation;
- copiar dados mockados;
- copiar implementacao wholesale;
- antecipar features fora do milestone atual.

## O que adaptar

### Sidebar

Adaptar:
- hierarquia;
- item ativo;
- agrupamento por rotina;
- clareza visual.

Nao adaptar:
- rotas ou estrutura tecnica se conflitar com React/Vite atual.

### Cards de metrica

Adaptar:
- legibilidade;
- hierarquia de numero e descricao;
- uso de icone quando reduzir ruido.

Nao adaptar:
- metricas sem contrato ou sem fonte real.

### Chips de status

Adaptar:
- padrao visual;
- labels humanas;
- estados de alerta.

Nao adaptar:
- nomes internos divergentes do contrato operacional.

### Drawer

Adaptar:
- resumo primeiro;
- historico limpo;
- secoes secundarias recolhiveis;
- proxima acao evidente.

Nao adaptar:
- fluxo de decisao que bypassa backend.

### Modal de novo lead

Adaptar:
- campos essenciais primeiro;
- fluxo curto;
- feedback claro.

Nao adaptar:
- cadastro sem validacao de duplicidade/telefone;
- estado local que ignore API.

## O que nao copiar

- React 19.
- TanStack Start.
- TanStack Router.
- Arquitetura de rotas.
- Store local como fonte de verdade.
- Mock data.
- `components/ui` inteiro.
- Codigo wholesale.
- Dependencias novas sem justificativa e aprovacao.
- Regras de negocio inferidas de tela.

## Regras de adaptacao

- Adaptar uma tela por sprint.
- Usar `apps/web/src/components/ui` antes de criar componente novo.
- Preservar API, auth, Docker, testes e estrutura do CRM real.
- Nao misturar limpeza de UX com mudanca de backend.
- Nao implementar features futuras so porque existem no prototipo.
- Se uma regra operacional aparecer na UI, confirmar no contrato do dominio.
- Se a tela precisa de dado que a API nao entrega, registrar lacuna em vez de mockar como definitivo.

## Ordem recomendada

1. Base de Leads.
2. Mesa Operacional.
3. Drawer de acompanhamento do lead.
4. Dashboard e Resumo Diario.
5. Fluxos secundarios.

Essa ordem respeita o foco atual: Jornada do Lead e disciplina operacional antes de modulos futuros.

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

## Checklist antes de adaptar uma tela

1. A tarefa declarou milestone?
2. A tela pertence ao foco atual?
3. O contrato de API existe?
4. A regra de negocio esta documentada?
5. Os componentes da UI Foundation foram consultados?
6. Existe risco de criar biblioteca paralela?
7. Existe risco de mock virar produto?
8. Validacao frontend foi planejada?

## Validacao esperada

Para mudanca real de frontend:

- `npm run verify:frontend`
- `npm run verify:dashboard`
- validacao visual ou fallback estrutural documentado

Para docs-only:

- `git diff --check`
- `npm run verify:data-cleanliness`
