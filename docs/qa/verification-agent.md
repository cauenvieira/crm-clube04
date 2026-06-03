# QA Verification Agent

Guia de validacao para tarefas do CRM Clube04.

## Regra principal

Validacoes que usam o banco local compartilhado devem rodar em sequencia. Nao executar smoke/verify em paralelo.

## Comandos por tipo de tarefa

### Docs-only

Quando a tarefa altera apenas docs:

```powershell
git status --short
git diff --stat
git diff -- docs AGENTS.md README.md
```

Nao rodar `verify:all` se nenhum codigo foi alterado.

### Backend/API

```powershell
npm run build
npm run lint
npm run smoke:api
npm run verify:all
```

Adicionar verify especifico quando a feature tiver fluxo operacional proprio.

### Frontend/dashboard

```powershell
npm run build
npm run lint
npm run verify:frontend
npm run verify:all
```

Tambem fazer validacao visual com browser tooling quando disponivel.

### Dados/importacao/remediacao

```powershell
npm run verify:data-cleanliness
npm run verify:all
```

Scripts que escrevem dados devem usar `runId` e cleanup.

### n8n/workflows

```powershell
npm run n8n:import:workflows
npm run n8n:list:workflows
npm run verify:all
```

So quando workflow for alterado.

## runId e cleanup

- Todo teste que cria dado deve usar `runId` unico.
- Cleanup deve rodar em `finally`.
- Cleanup deve remover contatos, leads, mensagens, conversas, action items e interacoes criadas pelo teste quando aplicavel.
- Nunca usar `TRUNCATE` em scripts de validacao.

## Falhas

Relatorio de falha deve conter:

- comando que falhou;
- trecho curto do erro;
- causa provavel;
- contorno ou proxima acao.

Nao colar logs longos quando a causa esta clara.

## Relatorio de sucesso

Para comandos OK:

- informar comando;
- informar `OK`;
- nao colar log completo.

## Antes de commit

- Rodar `npm run verify:all` em sequencia.
- Rodar `git status --short`.
- Rodar `git diff --stat`.
- Nao usar `git add -A`.
