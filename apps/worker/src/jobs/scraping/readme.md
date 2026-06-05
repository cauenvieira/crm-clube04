# Jobs de scraping

## Objetivo

Reservar jobs de sincronizacao autorizada e somente leitura do sistema Clube04.

## Status atual

- Nao ha scraping implementado.
- Nao ha automacao real contra o sistema oficial Clube04.
- Este modulo nao deve ser usado sem tarefa propria e aprovacao explicita.

## Regras inegociaveis

- Somente leitura ate decisao explicita em contrario.
- Nao alterar dados no sistema Clube04.
- Nao versionar credenciais, cookies, prints, logs ou exports reais.
- Nao burlar controles de acesso.
- Nao rodar coleta ampla sem limite e plano de rollback.
- Nao commitar dados reais derivados.

## Escopo futuro possivel

- leitura de clientes;
- leitura de pets;
- leitura de agenda;
- leitura de servicos realizados;
- leitura de pacotes;
- leitura de vendas ou producao, se autorizado;
- carga incremental com `sync_state` e `sync_logs`.

## Padrao esperado

Jobs futuros devem ter:

- dry-run ou modo somente leitura verificavel;
- janela de datas ou cursor;
- limite de registros;
- logs sem dados sensiveis;
- retries controlados;
- persistencia auditavel;
- documentacao de comando;
- validacao proporcional.

## Docs relacionados

- `docs/database/schema.md`
- `docs/product/data-model-overview.md`
- `apps/api/src/integrations/clube04/readme.md`
- `docs/tasks.md`

## Validacao esperada

- `npm run build`
- `npm run lint`
- verify especifico do job, quando existir
- `npm run verify:data-cleanliness`

Qualquer uso real deve ser revisado antes da execucao.
