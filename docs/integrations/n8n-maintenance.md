# n8n Maintenance (Local)

## Versao atual adotada no projeto

- Imagem: `docker.n8n.io/n8nio/n8n`
- Variavel de versao: `N8N_VERSION`
- Valor atual recomendado no projeto: `2.22.4`

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

## Cuidado para futuro com dados reais

- Nao usar reset de volume em ambiente com workflows/credenciais reais sem backup.
- Antes de upgrades maiores, exportar workflows e planejar janela de manutencao.
- Nunca versionar credenciais reais no repositorio.
