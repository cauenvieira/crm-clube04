# Integracao Clube04

## Objetivo

Reservar o modulo de integracao com o sistema oficial Clube04 para sincronizacao futura, autorizada e somente leitura.

Este readme e contexto local do modulo. Ele nao vence:

- `AGENTS.md`
- `docs/development/documentation-hierarchy.md`
- `docs/integrations/*`
- `docs/architecture/code-organization.md`
- `docs/database/schema.md`

## Status atual

- Nao ha client ativo para sistema Clube04 neste modulo.
- Nao ha scraping implementado.
- Nao ha escrita no sistema oficial Clube04.
- O CRM opera como camada complementar, nao como substituto do sistema oficial.

## Regras inegociaveis

- Integracao Clube04 deve ser somente leitura ate decisao explicita em contrario.
- Nao alterar dados no sistema oficial Clube04.
- Nao versionar credenciais, cookies, screenshots, exports, logs ou dados reais.
- Qualquer coleta deve ter limite, observabilidade e rollback operacional.
- Dados reais derivados devem ficar fora do Git, preferencialmente em `.tmp/` ou `dados-sensiveis` no Drive.

## Escopo futuro permitido

Quando aprovado, este modulo pode conter:

- client HTTP/scraping somente leitura;
- normalizacao de payloads importados;
- controle de cursor/janela de sincronizacao;
- tratamento de erro e retry;
- logs tecnicos sem dados sensiveis;
- mapeamento para `customers`, `pets`, `appointments`, `services`, `packages`.

## Docs relacionados

Antes de implementar, ler:

- `docs/integrations/n8n-maintenance.md` quando envolver automacao;
- `docs/product/data-model-overview.md` para entidades alvo;
- `docs/database/schema.md` para tabelas fisicas;
- `docs/architecture/code-organization.md` para camadas;
- `docs/tasks.md` para prioridade e milestone.

## Validacao esperada em tarefa futura

- `npm run build`
- `npm run lint`
- verify especifico da integracao, quando existir
- `npm run verify:data-cleanliness`

Nunca usar dados reais em testes versionados.
