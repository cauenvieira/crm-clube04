# Dev Data Hygiene

## Objetivo

Manter o banco local util para testes e avaliacao visual, sem risco de apagar dados reais ou versionar dados sensiveis.

Este documento e operacional/tecnico. Ele nao define regra de negocio da Jornada do Lead; para regras de lead, consultar o contrato operacional e a matriz de testes.

## Scripts

- `npm run dev:cleanup-test-data`
- `npm run dev:cleanup-test-data:apply`
- `npm run dev:seed-dashboard`
- `npm run verify:data-cleanliness`

## Principios

- Dry-run por padrao.
- Apply somente com confirmacao explicita.
- Bloquear execucao em producao.
- Bloquear host/db que nao pareca local/dev.
- Nunca usar `TRUNCATE`.
- Nunca apagar dados ambiguos.
- Marcar dados artificiais com `runId` ou marcador deterministico.
- Relatar ambiguos para revisao humana.

## Cleanup de dados de teste

Script: `scripts/dev-data/dev-cleanup-test-data.ts`

Regras de seguranca:

- `dry-run` por padrao.
- Delecao apenas com `--apply --confirm-local-dev`.
- Aborta se `NODE_ENV=production`.
- Aborta se `POSTGRES_HOST` nao parecer local.
- Aborta se o nome do banco nao parecer local/dev.
- Nao remove dados sem marcador conhecido.

Marcadores aceitos:

- `source`/`campaign` de smoke, verify ou dev-seed.
- Prefixo `test_run:`.
- `contacts.name` com prefixo `TESTE_CRM_`.
- `crm_interactions.notes` com `TEST_RUN_ID=`.
- `raw_payload.testRunId`.
- Provider ids artificiais usados pelos testes locais.

## Seed do dashboard

Script: `scripts/dev-data/dev-seed-dashboard.ts`

Comportamento:

- cria massa pequena para visualizacao local;
- usa marcador proprio;
- cria apenas registros artificiais;
- remove/recria somente dados do proprio seed;
- serve para validar leitura visual, nao como fonte de regra de negocio.

## Comandos PowerShell

Dry-run de limpeza:

```powershell
npm run dev:cleanup-test-data
```

Aplicar limpeza local/dev:

```powershell
npm run dev:cleanup-test-data:apply
```

Aplicar seed do dashboard:

```powershell
npm run dev:seed-dashboard
```

Validar residuos:

```powershell
npm run verify:data-cleanliness
```

Preparar dashboard limpo para revisao visual:

```powershell
npm run dev:cleanup-test-data:apply
npm run dev:seed-dashboard
```

## Relacao com verify

`smoke:api` e `verify:*` podem criar dados artificiais no banco local.

Por isso:

1. testes devem usar `runId` unico;
2. cleanup deve rodar em `finally` quando possivel;
3. `verify:data-cleanliness` deve verificar residuos;
4. limpeza ampla continua proibida.

## Alertas

- Nunca rodar scripts de limpeza em ambiente real.
- Nunca mover relatorios com dados reais para fora de `.tmp/`.
- Nunca versionar base local, exports ou snapshots.
- Se houver duvida se um dado e artificial, nao apagar automaticamente.
