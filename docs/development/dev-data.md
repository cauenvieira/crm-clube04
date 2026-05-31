# Dev Data Hygiene v1

## Objetivo

Manter o banco local limpo para avaliacao visual e testes, sem risco de apagar dados reais por acidente.

## Scripts

- `npm run dev:cleanup-test-data`
- `npm run dev:cleanup-test-data:apply`
- `npm run dev:seed-dashboard`

## Como funciona o cleanup

Script: `scripts/dev-cleanup-test-data.ts`

Regras de seguranca:

- `dry-run` por padrao (nao apaga nada).
- So aplica delecao com `--apply --confirm-local-dev`.
- Aborta se `NODE_ENV=production`.
- Aborta se `POSTGRES_HOST` nao parecer local (`localhost`, `127.0.0.1`, `::1`, `postgres`, `host.docker.internal`).
- Aborta se o nome do banco nao parecer local/dev.
- Nao usa `TRUNCATE`.
- Nao apaga dados ambiguos.
- Reporta contagens de dados ambiguos para revisao manual.

Marcadores explicitos de limpeza:

- `source`/`campaign` de smoke/verify/dev-seed
- nomes com prefixos de teste (`Smoke`, `Verify`, `Dev Seed`, `Tutor Teste API`)
- `provider_message_id` e `provider_conversation_id` com prefixos de teste conhecidos

## Como funciona o seed

Script: `scripts/dev-seed-dashboard.ts`

Comportamento:

- cria massa pequena para visualizacao do dashboard;
- usa marcador unico `dev_seed_dashboard`;
- cria poucos registros em `contacts`, `leads`, `conversations`, `messages`, `action_items`;
- remove e recria somente os dados do proprio seed (idempotente para dev).

## Quando usar

Use cleanup quando:

- dashboard ficou poluido por dados de smoke/verify;
- voce precisa resetar dados artificiais para revisar UX.

Use seed quando:

- precisa validar cards/listas do dashboard rapidamente;
- quer uma base local pequena e previsivel para demos internas.

## Exemplos PowerShell

Dry-run de limpeza:

```powershell
npm run dev:cleanup-test-data
```

Aplicar limpeza:

```powershell
npm run dev:cleanup-test-data:apply
```

Aplicar seed do dashboard:

```powershell
npm run dev:seed-dashboard
```

Executar bateria completa antes de commit:

```powershell
npm run verify:all
```

Preparar dashboard limpo para avaliacao visual (apos validate):

```powershell
npm run dev:cleanup-test-data:apply
npm run dev:seed-dashboard
```

Observacao:

- `smoke:api` e scripts `verify:*` criam dados artificiais novamente no banco local.
- Por isso, depois de `npm run verify:all`, rode cleanup apply + seed para voltar ao estado limpo de demonstracao.

## Alerta

Nunca rode esses scripts em ambiente de producao.
