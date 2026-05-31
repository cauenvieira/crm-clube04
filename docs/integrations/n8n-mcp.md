# n8n MCP (Local)

## Objetivo

Habilitar MCP instance-level do n8n local para inspecao e apoio tecnico no ajuste de workflows, reduzindo configuracao manual campo por campo.

## Diretriz principal

- Git continua sendo a fonte da verdade para workflows versionados.
- Workflows devem continuar em `infra/n8n/workflows`.

## Regras de uso no projeto

- Nao commitar tokens, segredos ou credenciais reais.
- Configuracao real do Codex deve ficar no `config.toml` do usuario, nunca no repositorio.
- Comecar uso de MCP apenas para listar e inspecionar workflows.
- Nao ativar workflow de producao sem aprovacao.
- Nao alterar credenciais via MCP.
- Nao executar fluxo com dados reais sem aprovacao.

## Variaveis de ambiente locais no n8n

No ambiente local via Docker Compose:

- `N8N_MCP_MANAGED_BY_ENV=true`
- `N8N_MCP_ACCESS_ENABLED=true`

Essas variaveis habilitam o acesso MCP na instancia local para desenvolvimento controlado.

## Validacao rapida

```bash
docker compose exec n8n printenv N8N_MCP_MANAGED_BY_ENV
docker compose exec n8n printenv N8N_MCP_ACCESS_ENABLED
```

Resultado esperado:

- `true`
- `true`
