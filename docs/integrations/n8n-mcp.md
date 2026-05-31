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

## Modo local (UI manual)

No ambiente local/dev, o projeto usa configuracao manual pela UI do n8n para MCP:

- `N8N_MCP_MANAGED_BY_ENV=false`
- `N8N_MCP_ACCESS_ENABLED=false`

Com isso, a tela `Settings > Instance-level MCP` fica editavel e permite abrir `Connection details` para gerar token.

## Validacao rapida

```bash
docker compose exec n8n printenv N8N_MCP_MANAGED_BY_ENV
docker compose exec n8n printenv N8N_MCP_ACCESS_ENABLED
```

Resultado esperado:

- `false`
- `false`

## Fluxo recomendado para habilitar MCP na UI local

1. Abrir `http://localhost:5678`
2. Ir em `Settings > Instance-level MCP`
3. Ativar `Enable MCP access`
4. Abrir `Connection details`
5. Copiar token e detalhes de conexao para uso local no cliente MCP

Importante:

- Nao commitar token no repositorio.
- Configuracao do cliente MCP deve ficar no arquivo local do usuario (exemplo: `config.toml`), nao no Git.
