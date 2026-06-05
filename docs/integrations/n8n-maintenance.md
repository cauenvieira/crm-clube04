# n8n Maintenance (Local)

## Objetivo

Definir manutencao local do n8n usado pelo CRM Clube04 sem transformar a interface do n8n em fonte de verdade.

Este documento e guia de integracao. Em caso de conflito:

1. `AGENTS.md`
2. `docs/development/documentation-hierarchy.md`
3. `docs/architecture/decisions.md`
4. `docs/decisions/005-versioned-n8n-workflows.md`
5. este documento

## Status atual

- Uso atual: ambiente local/dev.
- Papel: orquestrar webhook manual de WhatsApp inbound para a API CRM.
- Workflow oficial versionado: `infra/n8n/workflows/whatsapp-inbound-test.json`.
- ID oficial do workflow: `52RxSSXMQ4Zaitnw`.
- Git e a fonte de verdade dos workflows versionados.
- A UI do n8n e estado operacional local, nao fonte de verdade.

## Versao local

- Imagem: `docker.n8n.io/n8nio/n8n`.
- Variavel de versao: `N8N_VERSION`.
- Versao recomendada no projeto: `2.22.4`.
- Ambiente local libera acesso a env vars em nodes:
  - `N8N_BLOCK_ENV_ACCESS_IN_NODE=false`.

Essa liberacao e apenas para local/dev. Antes de ambiente real, revisar seguranca.

## Regras de seguranca

- Nunca versionar credenciais, tokens ou exports com segredos.
- Nunca usar reset de volume em ambiente com dados reais sem backup e aprovacao.
- Nao ativar workflow real de producao sem tarefa propria.
- Nao executar automacao com dados reais sem autorizacao explicita.
- Antes de alterar workflow versionado, revisar `docs/integrations/n8n-whatsapp-inbound.md` e ADRs.

## Atualizacao controlada do n8n

1. Ajustar `N8N_VERSION` no `.env` local.
2. Recriar ambiente local:

```powershell
cd "C:\Users\cauev\OneDrive\Documentos\CRM Clube04"

docker compose down
docker compose pull n8n
docker compose up -d --build
```

3. Confirmar versao:

```powershell
docker compose exec n8n n8n --version
```

4. Reimportar workflows versionados quando necessario:

```powershell
npm run n8n:import:workflows
npm run n8n:list:workflows
```

## Validacao minima apos manutencao

```powershell
docker compose ps
curl.exe "http://localhost:3000/health"
npm run smoke:api
npm run n8n:list:workflows
```

Resultado esperado:

- `n8n`, `crm-api`, `crm-worker`, `postgres` e `redis` em estado `Up`.
- `/health` retorna API, Postgres e Redis como `ok`.
- `smoke:api` conclui sem falhas.
- Workflow oficial aparece na listagem.

## Reset de volume local

Reset e destrutivo para o estado local do n8n. Usar apenas em ambiente de teste e quando nao houver workflow/credencial que precise ser preservado.

Antes de remover volume:

```powershell
docker volume ls
```

Reset local:

```powershell
docker compose down
docker volume rm crmclube04_n8n_data
docker compose up -d --build
npm run n8n:import:workflows
npm run n8n:list:workflows
```

O nome do volume pode variar conforme a pasta do projeto. Confirmar antes de remover.

## Regra de ID estavel

O `n8n import:workflow` sobrescreve por `id` do workflow JSON, nao por `name`.

O arquivo `infra/n8n/workflows/whatsapp-inbound-test.json` deve manter:

```text
id: 52RxSSXMQ4Zaitnw
```

Nao trocar esse ID sem plano de migracao.

Se surgirem workflows duplicados com mesmo nome:

1. remover duplicados pela UI do n8n;
2. manter apenas o workflow oficial;
3. confirmar com `npm run n8n:list:workflows`;
4. reimportar com `npm run n8n:import:workflows`.

## Fechamento de tarefa envolvendo n8n

Toda tarefa de n8n deve informar:

- workflow alterado;
- se houve mudanca no JSON versionado;
- se houve mudanca manual na UI ainda nao versionada;
- validacoes executadas;
- riscos de segredo ou dado real;
- se o Drive sera sincronizado apos push na `main`.
