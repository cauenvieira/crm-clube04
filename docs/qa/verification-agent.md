# QA Verification Agent

Guia de validacao para agentes, Codex e humanos no CRM Clube04.

## Regra principal

Validacoes que usam o banco local compartilhado devem rodar em sequencia. Nao executar smoke/verify em paralelo.

## Roteamento por tarefa

### Docs-only

Usar quando somente arquivos `.md` mudaram.

```powershell
git status --short
git diff --stat
git diff --check
npm run verify:data-cleanliness
```

Nao rodar `verify:all` por padrao em docs-only.

### Backend/API

```powershell
npm run build
npm run lint
npm run smoke:api
npm run verify:all
```

Adicionar verify especifico quando houver dominio operacional.

Para Jornada do Lead, considerar tambem:

```powershell
npm run verify:operational-summary
npm run verify:operational-worklist
npm run verify:lead-operational-cycle
```

### Frontend/dashboard

```powershell
npm run build
npm run lint
npm run verify:dashboard
npm run verify:frontend
npm run verify:all
```

Tambem fazer validacao visual quando a mudanca for de layout ou fluxo.

### Importacao/remediacao

```powershell
npm run verify:data-cleanliness
npm run verify:all
```

Quando houver script especifico de importacao/remediacao, rodar primeiro em dry-run.

Scripts que escrevem dados devem usar `runId` e cleanup.

### n8n/workflows

Somente quando workflow versionado for alterado:

```powershell
npm run n8n:import:workflows
npm run n8n:list:workflows
npm run verify:all
```

Nao executar workflow real com dados reais sem aprovacao.

## runId e cleanup

- Todo teste que cria dado deve usar `runId` unico ou marcador deterministico.
- Cleanup deve rodar em `finally` quando possivel.
- Cleanup deve remover apenas dados criados pelo proprio teste.
- Nunca usar `TRUNCATE` em scripts de validacao.
- Dados ambiguos devem ser reportados, nao apagados automaticamente.

## Falhas

Relatorio de falha deve conter:

- comando que falhou;
- trecho curto do erro;
- causa provavel;
- proxima acao;
- se houve risco de dado residual.

Nao colar logs longos quando a causa estiver clara.

## Relatorio de sucesso

Para comandos OK:

- informar comando;
- informar `OK`;
- nao colar log completo.

## Antes de commit

- Rodar validacao proporcional.
- Rodar `git status --short`.
- Rodar `git diff --stat`.
- Rodar `git diff --check`.
- Confirmar ausencia de dados reais e segredos.
- Nao usar `git add -A`.

## Antes de push

- Revisar `git diff --cached --stat`.
- Confirmar que o commit tem escopo unico.
- Se alterou `.md`, lembrar que o sync Google Drive roda apos push na `main`.
