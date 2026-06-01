# AGENTS.md - Clube04 CRM

## Objetivo

Construir um CRM operacional para o Clube04 Mogi, com foco em rotina de atendimento, follow-up e operacao diaria.

## Regras fixas

- Nunca salvar credenciais reais no codigo.
- Usar `.env` para segredos e manter `.env` fora do Git.
- Nunca versionar dados reais (CSV, XLSX, dumps, exports internos, tokens, credenciais).
- Nao alterar dados no sistema Clube04; scraping sempre em modo leitura.
- Manter historico de interacoes e mensagens no CRM.
- Manter o projeto executavel localmente com Docker Compose.

## Regras operacionais do Codex

- Ler os docs pedidos no prompt antes de alterar arquivos.
- Manter mudancas pequenas, incrementais e com escopo limitado.
- Nao misturar feature com refatoracao ampla na mesma tarefa.
- Nao usar `git add -A`.
- Nao commitar sem revisao final explicita no thread.
- Nao alterar API, schema ou endpoints sem autorizacao explicita.
- Nao versionar arquivos temporarios locais (`.tmp/`, relatorios locais, screenshots locais).

## Validacao obrigatoria

- Rodar `npm run verify:all` antes de concluir qualquer tarefa, salvo instrucao diferente.
- Executar a bateria em sequencia deterministica, nunca em paralelo.
- Para mudancas de frontend, incluir `npm run verify:frontend`.
- Se teste falhar apos execucao paralela, repetir toda a bateria em sequencia antes de diagnosticar bug.
- Testes e scripts devem usar `runId` unico e cleanup no `finally` quando aplicavel.

## Organizacao de codigo

- Evitar arquivos acima de 250-300 linhas; propor divisao antes de crescer mais.
- Evitar funcoes longas com responsabilidades misturadas.
- `routes`: validacao, chamada de service e resposta.
- `services`: regra de negocio e orquestracao.
- `repositories`: SQL e acesso ao banco.
- `validation/schemas`: validacao de payload, params e query.
- `integrations`: comunicacao com sistemas externos.
- `worker`: jobs segmentados por dominio, sem monolito.

## n8n, MCP e workflows

- Git e a fonte da verdade para workflows versionados.
- Workflows n8n ficam em `infra/n8n/workflows`.
- Workflow versionado deve manter `id` estavel para evitar duplicados no import.
- Ao alterar workflow n8n, executar `npm run n8n:import:workflows` e `npm run n8n:list:workflows`.
- MCP deve ser usado de forma controlada; nao alterar credenciais e nao executar dados reais sem aprovacao.

## Encoding e escrita tecnica

- Usar ASCII-only por padrao em codigo, docs tecnicos, comentarios e exemplos.
- Corrigir sinais de mojibake antes de concluir.
- Evitar repeticao de contexto em prompt/relatorio; foco em objetivo, escopo, validacao e risco.

## Fechamento da tarefa

Relatorio final deve ser compacto e conter:

1. O que mudou.
2. Arquivos alterados.
3. Decisoes relevantes.
4. Problemas/contornos.
5. Validacoes executadas.
6. Riscos/limitacoes.
7. Proximo passo recomendado.
