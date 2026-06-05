# Sprint Plan Template

Use este template para tarefas maiores de frontend, backend operacional, importacao, integracao ou produto.

## 1. Milestone

Selecionar uma:

- M0 Fundacao tecnica e governanca
- M1 Jornada do Lead
- M2 Mesa Operacional
- M3 Importacao robusta e saneamento
- M4 Atendimento e WhatsApp
- M5 Jornada do Cliente
- M6 Operacao, metas e gestao
- M7 IA e automacao avancada

Se a tarefa misturar milestones, dividir ou justificar explicitamente.

## 2. Objetivo

Descrever em uma frase o resultado operacional esperado.

Exemplo:

```text
Permitir que a equipe registre resultado de atendimento de um lead sem deixar o ciclo operacional inconsistente.
```

## 3. Contexto obrigatorio

- Estado atual relevante.
- Docs consultados.
- Decisoes ja tomadas.
- Dependencias conhecidas.
- Riscos de regra de negocio, API, schema, frontend, dados ou integracao.

## 4. Fonte de verdade

Listar docs obrigatorios para a tarefa.

Para Jornada do Lead, sempre incluir:

- `docs/product/lead-operational-contract.md`
- `docs/product/lead-import-normalization.md`
- `docs/qa/lead-business-rules-test-matrix.md`

## 5. Escopo permitido

```text
apps/...
docs/...
scripts/...
```

Ser especifico. Evitar escopo aberto.

## 6. Fora de escopo

Listar explicitamente o que nao sera alterado.

Exemplos:

- schema/migrations;
- Docker/n8n;
- frontend;
- API;
- auth;
- regra operacional;
- dados reais;
- automacao externa.

## 7. Arquivos proibidos

```text
.env
.tmp/
.chatgpt-sources/
node_modules/
dist/
*.csv
*.xlsx
*.zip
*.log
```

Adicionar outros conforme a tarefa.

## 8. Criterios de aceite

- Comportamento esperado.
- Estados vazios/erro.
- Idempotencia/duplicidade quando relevante.
- Sem regressao de contratos existentes.
- Documentacao atualizada quando aplicavel.

## 9. Validacoes obrigatorias

Docs-only:

```powershell
git diff --check
npm run verify:data-cleanliness
```

Backend/API:

```powershell
npm run build
npm run lint
npm run smoke:api
npm run verify:all
```

Frontend:

```powershell
npm run build
npm run lint
npm run verify:dashboard
npm run verify:frontend
npm run verify:all
```

Importacao:

```powershell
npm run verify:data-cleanliness
npm run verify:all
```

Ajustar conforme o risco.

## 10. Relatorio final

Incluir:

- o que mudou;
- arquivos alterados;
- validacoes executadas;
- se docs precisam atualizar;
- se milestones/backlog mudaram;
- git status esperado;
- proximo passo recomendado.

## 11. Git

- Revisar `git status --short`.
- Revisar `git diff --stat`.
- Usar `git add` com caminhos especificos.
- Nao usar `git add -A`.
- Nao commitar/push sem autorizacao.
