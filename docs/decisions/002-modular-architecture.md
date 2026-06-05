# ADR 002 - Arquitetura Modular por Camadas

## Status

Aceita.

## Contexto

A API, o worker, o frontend e as integracoes vao crescer em dominio. Sem separacao clara, o projeto tende a perder previsibilidade, dificultar troubleshooting e gerar divergencia entre regra operacional, tela e relatorio.

O projeto tambem precisa continuar amigavel para revisao por humanos e por IA/Codex.

## Decisao

Adotar separacao modular com responsabilidades claras:

- `routes`: HTTP, validacao de entrada, chamada de service e resposta.
- `validation/schemas`: validacao de payload, params, query e enums.
- `services`: regra de negocio e orquestracao.
- `repositories`: SQL e persistencia.
- `plugins/middlewares`: comportamento transversal.
- `integrations`: comunicacao externa/adaptadores.
- `jobs`: rotinas assincronas no worker.
- `components/ui`: primitivas visuais do frontend.
- `packages/shared`: apenas tipos/utilitarios realmente compartilhados.

## Razoes

- Facilita manutencao e revisao humana.
- Reduz risco de regressao em mudancas pequenas.
- Melhora depuracao por contexto de modulo.
- Mantem o projeto amigavel para colaboracao com IA/LLM.
- Evita que regra critica fique espalhada entre frontend, scripts e backend.

## Consequencias

- Mudancas grandes devem ser quebradas por camada e milestone.
- Refatoracao ampla deve ser separada de feature.
- Backend deve ser dono de comportamento critico de ciclo de vida.
- Frontend deve usar `apps/web/src/components/ui` e nao criar biblioteca paralela.
- Integracoes devem isolar provider externo do dominio.

## Riscos e cuidados

Riscos:
- abstracao excessiva para problemas simples;
- arquivos utilitarios genericos sem dono claro;
- duplicacao de regra entre service, frontend e scripts;
- overengineering antes da operacao exigir.

Cuidados:
- manter escopo pequeno por arquivo;
- evitar arquivos acima de 250-300 linhas;
- refatorar incrementalmente;
- documentar proposta antes de reestruturacao ampla;
- consultar `docs/architecture/code-organization.md`.

## Docs relacionados

- `docs/architecture/code-organization.md`
- `docs/backend/api-agent.md`
- `docs/frontend/design-system.md`
- `docs/development/documentation-hierarchy.md`
