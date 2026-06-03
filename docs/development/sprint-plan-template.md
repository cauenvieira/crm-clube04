# Sprint Plan Template

Use este template para tarefas maiores, especialmente frontend, backend operacional e produto.

## Objetivo

Descrever em uma frase o resultado operacional esperado.

## Contexto

- Estado atual relevante.
- Decisoes ja tomadas.
- Dependencias conhecidas.

## Fora de escopo

- Listar explicitamente o que nao sera alterado.
- Incluir API, schema, n8n, Docker, auth, testes ou UX quando forem proibidos.

## Arquivos permitidos

```text
apps/...
docs/...
scripts/...
```

## Arquivos proibidos

```text
infra/db/...
docker-compose.yml
infra/n8n/workflows/...
package-lock.json
```

Ajustar a lista conforme a sprint.

## Criterios de aceite

- Comportamento esperado.
- Estados vazios/erro.
- Idempotencia ou validacao quando relevante.
- Sem regressao de contratos existentes.

## Testes obrigatorios

- `npm run build`
- `npm run lint`
- smoke/verify especifico
- `npm run verify:frontend` para frontend
- `npm run verify:all` antes de commit

Para docs-only, usar apenas `git diff --stat`, `git status --short` e diff dos docs.

## Relatorio final

Incluir:

- arquivos criados;
- arquivos alterados;
- decisoes tecnicas;
- problemas e contornos;
- validacoes executadas;
- riscos;
- proximo passo.

## Checklist antes de commit

- `git status --short`
- `git diff --stat`
- testes obrigatorios OK
- nenhuma credencial
- nenhum dado real
- nenhuma alteracao fora do escopo
- nao usar `git add -A`
