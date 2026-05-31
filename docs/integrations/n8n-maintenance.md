# n8n Maintenance (Local)

## Versao atual adotada no projeto

- Imagem: `docker.n8n.io/n8nio/n8n`
- Variavel de versao: `N8N_VERSION`
- Valor atual recomendado no projeto: `2.22.4`
- Ambiente local libera acesso a env vars em nodes: `N8N_BLOCK_ENV_ACCESS_IN_NODE=false`

## Como atualizar o n8n de forma controlada

1. Ajustar `N8N_VERSION` no `.env` local.
2. Recriar o ambiente do n8n:

```bash
docker compose down
docker compose pull n8n
docker compose up -d --build
```

3. Confirmar versao em execucao:

```bash
docker compose exec n8n n8n --version
```

## Validacao minima apos update

Executar:

```bash
docker compose ps
curl.exe http://localhost:3000/health
npm run smoke:api
```

Resultado esperado:

- `n8n`, `crm-api`, `crm-worker`, `postgres` e `redis` em estado `Up`.
- `/health` retornando `api`, `postgres` e `redis` como `ok`.
- `smoke:api` concluindo sem falhas.

## Reset de volume local do n8n (somente ambiente de teste)

Use reset apenas quando nao houver dados que precisem ser preservados.

```bash
docker compose down
docker volume rm crmclube04_n8n_data
docker compose up -d --build
```

Observacao:

- O nome real do volume pode variar conforme a pasta/projeto Docker Compose.
- Confirme com `docker volume ls` antes de remover.

## Reimportar workflows apos reset do volume

Depois de resetar o volume do n8n, reimporte os workflows versionados:

```bash
docker compose up -d --build
npm run n8n:import:workflows
npm run n8n:list:workflows
```

O import usa os arquivos em `infra/n8n/workflows` montados no container em `/workflows`.

## Cuidado para futuro com dados reais

- Nao usar reset de volume em ambiente com workflows/credenciais reais sem backup.
- Antes de upgrades maiores, exportar workflows e planejar janela de manutencao.
- Nunca versionar credenciais reais no repositorio.
- Cuidado com workflows criados manualmente e nao versionados: eles podem ser perdidos em reset de volume.
- Antes de reimportar, revisar se ha mudancas locais na interface que ainda nao foram versionadas.
- A liberacao de env vars em nodes e apenas para local/dev. Em ambientes reais, revisar politica de seguranca antes de manter essa opcao.
