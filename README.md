# Clube04 CRM

CRM operacional do Clube04 Mogi das Cruzes.

## Objetivo

Substituir controles manuais de leads, recorrencia, pacotes e follow-up por um sistema proprio integrado com n8n, WAHA e sincronizacao somente leitura do sistema Clube04.

## Estrutura

```text
apps/
  api/      API HTTP do CRM
  web/      interface web futura
  worker/   jobs de sincronizacao, classificacao e Acao do Dia
packages/
  shared/   utilitarios e tipos compartilhados
infra/
  db/init/  scripts iniciais do PostgreSQL
```

## Ambiente local

Requisitos:

- Docker Desktop
- Git
- Node.js LTS 20+

## Configuracao

Copie o arquivo de exemplo e ajuste apenas valores locais:

```bash
cp .env.example .env
```

Nao coloque credenciais reais no codigo. O arquivo `.env` deve ficar fora do Git.

## Rodando dependencias locais

Suba PostgreSQL e Redis:

```bash
docker compose up -d postgres redis
```

Para subir tambem os containers da API e worker:

```bash
docker compose up -d
```

## Rodando em desenvolvimento

Instale as dependencias:

```bash
npm install
```

Inicie a API local:

```bash
npm run dev
```

Verifique a saude da API:

```bash
curl http://localhost:3000/health
```

Resposta esperada:

```json
{
  "api": "ok",
  "postgres": "ok",
  "redis": "ok",
  "checkedAt": "2026-05-30T00:00:00.000Z"
}
```

Rode o health check do worker:

```bash
npm run worker
```

## Scripts

- `npm run dev`: inicia a API em modo desenvolvimento.
- `npm run build`: compila os workspaces TypeScript.
- `npm run start`: inicia a API compilada.
- `npm run worker`: executa o health check basico do worker.
- `npm run lint`: executa checagem TypeScript nos workspaces configurados.

## Escopo desta etapa

Implementado:

- monorepo simples com `apps/api`, `apps/web`, `apps/worker` e `packages/shared`;
- Docker Compose com PostgreSQL, Redis, API e worker;
- rota `GET /health` com verificacao real de PostgreSQL e Redis;
- worker com comando basico de health check;
- estrutura inicial para banco, rotas, servicos, jobs e integracoes futuras.

Ainda nao implementado:

- scraping Clube04;
- integracao WAHA;
- integracao n8n;
- dashboard.
