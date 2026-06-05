# Checklist - Integration

Use este checklist para n8n, WAHA, webhooks, sincronizacao Clube04, MCP e adaptadores externos.

## Antes de alterar

- [ ] Milestone classificada.
- [ ] Sistema externo identificado.
- [ ] Dono do runtime definido: API, worker, n8n ou script.
- [ ] `docs/integrations/*` consultado.
- [ ] `docs/development/documentation-hierarchy.md` consultado.
- [ ] ADR relacionada consultada quando existir.
- [ ] Se impactar lead, consultar contrato operacional da Jornada do Lead.

## Contrato e isolamento

- [ ] Entrada, saida e erros do provider documentados.
- [ ] Payload externo normalizado antes de entrar no dominio.
- [ ] Idempotencia definida.
- [ ] Retry/backoff definido quando aplicavel.
- [ ] Timeout e falha com log claro.
- [ ] Segredos carregados somente por env/credencial local.
- [ ] Nenhum token, senha, cookie ou credential foi versionado.

## n8n

- [ ] Git continua sendo fonte de verdade de workflow versionado.
- [ ] Workflow JSON sem credenciais reais.
- [ ] ID estavel preservado quando workflow oficial for alterado.
- [ ] MCP usado apenas para inspecao/apoio, sem mutacao de credenciais sem aprovacao.
- [ ] Workflow real nao ativado sem autorizacao.

## Clube04 / sistema oficial

- [ ] Qualquer integracao com sistema Clube04 e somente leitura, salvo autorizacao explicita futura.
- [ ] Scraping, quando existir, nao altera agenda, cliente, pacote ou financeiro no sistema oficial.
- [ ] Dados reais exportados ficam fora do Git.

## Validacao

- [ ] `npm run build`
- [ ] `npm run lint`
- [ ] `npm run smoke:api` quando API for afetada.
- [ ] `npm run n8n:import:workflows` se workflow versionado mudou.
- [ ] `npm run n8n:list:workflows` se workflow versionado mudou.
- [ ] `npm run verify:all` antes de commit quando houver codigo/workflow.
- [ ] `npm run verify:data-cleanliness` quando scripts gerarem dados locais.

## Git

- [ ] `git status --short` revisado.
- [ ] `git diff --stat` revisado.
- [ ] `git diff --check` sem saida.
- [ ] `git add` com caminhos especificos.
- [ ] Nao usar `git add -A`.
