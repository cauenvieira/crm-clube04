# n8n MCP (Local)

## Objetivo

Definir uso controlado do MCP instance-level do n8n local para inspecao e apoio tecnico.

MCP ajuda a consultar e diagnosticar workflows, mas nao substitui Git, docs ou revisao humana.

## Hierarquia

Em caso de conflito:

1. Git e arquivos versionados vencem estado observado via MCP.
2. `infra/n8n/workflows/*` vence workflow alterado manualmente na UI.
3. `docs/decisions/005-versioned-n8n-workflows.md` vence este guia.
4. MCP e ferramenta auxiliar, nao fonte de verdade.

## Regras de uso

- Nao commitar tokens, segredos ou credenciais reais.
- Configuracao real do cliente MCP deve ficar no ambiente do usuario, nunca no repo.
- Usar MCP primeiro para listar e inspecionar.
- Nao alterar credenciais via MCP.
- Nao ativar workflow real sem aprovacao.
- Nao executar fluxo com dados reais sem aprovacao.
- Se MCP revelar divergencia entre UI e Git, registrar no fechamento da tarefa.

## Modo local atual

No ambiente local/dev, a configuracao e manual pela UI do n8n:

```text
N8N_MCP_MANAGED_BY_ENV=false
N8N_MCP_ACCESS_ENABLED=false
```

Com isso, `Settings > Instance-level MCP` fica editavel para ativacao local e copia dos detalhes de conexao.

## Validacao rapida

```powershell
cd "C:\Users\cauev\OneDrive\Documentos\CRM Clube04"

docker compose exec n8n printenv N8N_MCP_MANAGED_BY_ENV
docker compose exec n8n printenv N8N_MCP_ACCESS_ENABLED
```

Resultado esperado no modo manual/local:

```text
false
false
```

## Fluxo recomendado para habilitar localmente

1. Abrir `http://localhost:5678`.
2. Ir em `Settings > Instance-level MCP`.
3. Ativar `Enable MCP access`.
4. Abrir `Connection details`.
5. Copiar token e detalhes para o cliente MCP local.
6. Guardar configuracao fora do repo.

## Uso permitido nesta fase

Permitido:

- listar workflows;
- consultar nodes;
- comparar workflow UI versus JSON versionado;
- apoiar troubleshooting.

Nao permitido sem tarefa propria:

- criar workflow produtivo;
- alterar credenciais;
- executar fluxo com dados reais;
- substituir workflow versionado apenas pela UI;
- versionar token MCP.

## Fechamento de tarefa MCP

Informar:

- o que foi apenas inspecionado;
- se houve alteracao manual;
- se o JSON versionado precisa ser atualizado;
- se houve risco de segredo;
- proximos passos para versionamento.
