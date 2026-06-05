# Codex Workflow

Guia para abrir tarefas no Codex com escopo claro, menos ruido e validacao consistente.

## Principio

Economizar tokens significa reduzir repeticao, nao omitir decisao tecnica importante.

Nunca omitir:

- objetivo;
- escopo permitido;
- itens proibidos;
- docs obrigatorios;
- validacao;
- riscos;
- mudancas de regra, API, schema, auth, Docker, n8n, dados ou integracoes.

## 1. Antes de abrir tarefa

Verificar:

1. Qual milestone a tarefa pertence.
2. Quais docs da hierarquia devem ser lidos.
3. Qual escopo de arquivos e permitido.
4. O que esta proibido alterar.
5. Quais validacoes sao proporcionais.
6. Se a tarefa pode alterar regra de negocio ou contrato.
7. Se docs/backlog/matriz podem precisar de atualizacao.

Docs base:

- `AGENTS.md`
- `README.md`
- `docs/project-state.md`
- `docs/tasks.md`
- `docs/development/documentation-hierarchy.md`

## 2. Prompt curto para tarefa nova

Use este formato:

```text
Leia AGENTS.md e siga docs/development/documentation-hierarchy.md.

Milestone:
[M0/M1/etc.]

Objetivo:
[1 frase]

Docs obrigatorios:
- [lista curta]

Escopo permitido:
- [arquivos/pastas]

Nao alterar:
- [arquivos/pastas/comportamentos proibidos]

Regras:
- [regras especificas]

Validacao:
- [comandos]

Saida esperada:
- arquivos alterados
- decisoes
- validacoes
- riscos
- git diff --stat
- git status --short

Nao commitar.
```

## 3. Como escolher docs obrigatorios

### Geral

- `AGENTS.md`
- `docs/development/documentation-hierarchy.md`
- `docs/project-state.md`
- `docs/tasks.md`

### Jornada do Lead

- `docs/product/lead-operational-contract.md`
- `docs/product/lead-import-normalization.md`
- `docs/qa/lead-business-rules-test-matrix.md`

### Backend/API

- `docs/backend/api-agent.md`
- `docs/api/rest-api.md`
- `docs/database/schema.md`
- `docs/architecture/code-organization.md`

### Frontend

- `docs/frontend/design-system.md`
- `docs/frontend/components-catalog.md`
- `docs/frontend/lovable-adaptation-guide.md`

### Importacao

- `docs/product/lead-import-normalization.md`
- `docs/imports/*`
- `docs/qa/lead-business-rules-test-matrix.md`

### Integracoes

- `docs/integrations/*`
- `docs/development/checklists/integration.md`

## 4. Como reportar sucesso

- Mostrar comando + status resumido.
- Exemplo:
  - `npm run verify:data-cleanliness`: OK
  - `git diff --check`: OK
  - `git status --short`: 4 arquivos alterados
- Nao colar log completo quando tudo passou.
- Informar decisoes, riscos e pendencias quando existirem.

## 5. Como reportar falha

- Mostrar comando que falhou.
- Colar apenas o trecho exato do erro.
- Explicar causa provavel.
- Explicar contorno aplicado ou proximo passo.
- Nao mascarar falha como sucesso.

## 6. Git diff, stat e ZIP

- Padrao: `git diff --stat` + lista de arquivos.
- `git diff` detalhado: apenas quando pedido ou em bug complexo.
- ZIP/revisao completa: somente quando solicitado ou quando a tarefa envolver muitos docs/arquivos.
- Nao usar `git add -A`.
- Nao commitar sem revisao final.

## 7. Validacao visual

Para dashboard/frontend:

- tentar validar com navegador quando possivel;
- testar sem chave, chave invalida e chave valida;
- validar estados de listas/cards;
- validar acoes e feedback;
- verificar overflow horizontal;
- nao versionar screenshots.

Se screenshot falhar, reportar fallback estrutural:

- pagina carregou;
- estados testados;
- contagens principais;
- botoes visiveis;
- `hasHorizontalOverflow=false`;
- mensagens de erro/sucesso observadas.

## 8. Sequencia obrigatoria antes de entrega

1. Rodar validacoes proporcionais.
2. Rodar `git diff --check`.
3. Rodar `git diff --stat`.
4. Rodar `git status --short`.
5. Avaliar retroalimentacao documental.
6. Reportar pendencias.

## 9. Retroalimentacao documental

Antes de concluir, verificar se a mudanca altera:

- estado atual;
- regra de negocio;
- API, payload, schema ou validacao;
- frontend, fluxo de tela ou padrao visual;
- importacao ou normalizacao;
- testes, smoke, verify ou data-cleanliness;
- decisao tecnica;
- prioridade, milestone ou backlog.

Se sim, atualizar ou sugerir atualizacao nos docs adequados.

## 10. Feature nova

Sempre que uma feature for criada ou alterada:

1. identificar fluxos afetados;
2. atualizar/criar smoke, verify e, quando frontend, teste real de navegador;
3. usar `runId` unico;
4. garantir cleanup automatico em `finally`;
5. atualizar docs e backlog;
6. reportar lacunas restantes.

Nao considerar feature de frontend pronta sem `verify:frontend` ou validacao visual equivalente documentada.

## 11. Checklists

Antes de fechar tarefa, usar checklist por tipo:

- `docs/development/checklists/api-feature.md`
- `docs/development/checklists/frontend-feature.md`
- `docs/development/checklists/data-import.md`
- `docs/development/checklists/integration.md`
- `docs/development/checklists/pre-commit.md`
