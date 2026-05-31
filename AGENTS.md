# AGENTS.md - Clube04 CRM

## Objetivo

Criar um CRM operacional para o Clube04 Mogi das Cruzes.

O sistema deve:

- receber leads e mensagens do WhatsApp via n8n/WAHA;
- salvar conversas em banco de dados;
- sincronizar dados do sistema Clube04 por scraping autorizado;
- calcular frequencia cadastrada, frequencia real, retorno previsto e atraso;
- controlar clientes por faixa: 0-30, 31-60, 61-90 e +90;
- controlar pacotes ativos, pacotes perto de acabar e pacotes nao renovados;
- gerar uma tela de Acao do Dia para a equipe;
- gerar dashboard operacional e comercial.

## Regras obrigatorias

- Nunca salvar credenciais reais no codigo.
- Usar `.env` para segredos.
- Manter `.env` fora do Git.
- Nao alterar dados no sistema Clube04.
- O scraping deve ser somente leitura.
- Nao cadastrar, cancelar, remarcar ou excluir dados no sistema Clube04.
- Priorizar acesso HTTP direto sem interface grafica.
- Usar Playwright headless apenas quando necessario para login, descoberta ou fallback.
- Priorizar ferramentas open-source.
- Usar Docker Compose para ambiente local.
- Separar dados importados do sistema oficial dos dados preenchidos pela equipe.
- Preservar historico de interacoes, mensagens e alteracoes.

## Regra de encoding

- Usar ASCII-only por padrao em codigo, docs tecnicos, comentarios, mensagens internas, exemplos e fixtures.
- Evitar acentos em strings internas, nomes de arquivos, comentarios e Markdown tecnico.
- Excecao: textos finais destinados a clientes/tutores podem usar portugues com acentos, mas devem ser salvos e revisados como UTF-8.
- Se encontrar texto quebrado com sinais de mojibake (ex.: `\u00C3`, `\uFFFD` ou `\u00C2`), corrigir antes de concluir.

## Stack preferida

- Node.js
- TypeScript, se viavel
- PostgreSQL
- Redis
- Docker Compose
- Express ou Fastify
- Playwright para scraping quando necessario
- n8n para automacoes
- WAHA para WhatsApp
- Interface web simples para MVP

## Modulos do sistema

1. CRM API
2. CRM Web
3. CRM Worker
4. Banco PostgreSQL
5. Redis
6. Integracao n8n
7. Integracao WAHA
8. Scraper Clube04
9. Motor de classificacao CRM
10. Dashboard

## Conceitos principais

### Lead

Pessoa que entrou pelo WhatsApp, Meta, Instagram, indicacao ou outro canal, mas ainda nao virou cliente confirmado.

### Cliente

Tutor ja identificado ou atendido.

### Pet

Unidade principal de recorrencia. A frequencia deve ser calculada por pet, nao apenas por tutor.

### Frequencia cadastrada

Frequencia ideal definida manualmente pela equipe ou inferida pelo pacote.

### Frequencia real

Frequencia media calculada a partir dos atendimentos finalizados importados do sistema Clube04.

### Retorno previsto

Ultima visita + frequencia cadastrada. Se nao houver frequencia cadastrada, usar frequencia real. Se nao houver historico suficiente, usar padrao de 30 dias.

### Pacotes

Controlar pacotes ativos, saldo restante, pacote parado, pacote perto de acabar e pacote finalizado sem renovacao.

## Tela principal

A tela mais importante e "Acao do Dia".

Ela deve mostrar:

- leads novos;
- leads com proxima acao vencida;
- clientes com retorno vencido;
- clientes sem proximo agendamento;
- clientes com pacote ativo sem agenda;
- clientes com pacote perto de acabar;
- clientes com pacote finalizado sem renovacao;
- clientes 61-90 dias;
- clientes +90 dias.

## Estrategia de sincronizacao

- Fazer carga historica inicial uma unica vez.
- Depois usar sincronizacao incremental.
- Usar janelas moveis:
  - agenda: hoje ate D+30;
  - atendimentos: D-7 ate hoje;
  - pacotes: ativos, usados recentemente e perto de acabar;
  - mensagens WhatsApp: eventos em tempo real via webhook.
- Usar upsert.
- Usar hash de conteudo para evitar atualizacao desnecessaria.
- Usar tabela sync_state para controlar ultima execucao.
- Nao reprocessar tudo diariamente.

## Desenvolvimento

- Trabalhar em etapas pequenas.
- Nao implementar tudo de uma vez.
- Criar testes ou dados mockados antes de depender do sistema real.
- Sempre explicar alteracoes relevantes.
- Sempre manter o projeto executavel com Docker Compose.

## Organizacao de codigo

- Manter mudancas pequenas, incrementais e com escopo limitado.
- Evitar arquivos de codigo acima de 250 a 300 linhas; se passar disso, propor divisao antes de continuar.
- Evitar funcoes longas ou com responsabilidades misturadas.
- Evitar arquivos genericos como `utils.ts`; preferir utilitarios com proposito claro, como `phone.ts`, `sql.ts` ou `api-error.ts`.
- `routes` devem conter apenas validacao de entrada, chamada de servico e formatacao simples de resposta.
- `routes` nao devem conter SQL direto.
- `routes` nao devem conter regra de negocio complexa.
- `services` concentram regra de negocio, orquestracao entre repositorios e decisoes de fluxo.
- `repositories` concentram acesso ao banco, SQL, queries e detalhes de persistencia.
- `validation` ou `schemas` concentram validacao de payload, params e query string.
- `config` concentra leitura e normalizacao de variaveis de ambiente.
- `plugins` ou middlewares concentram hooks de Fastify, seguranca interna e comportamento transversal.
- `integrations` concentram comunicacao com sistemas externos como Clube04, n8n e WAHA.
- `worker` deve rodar jobs segmentados por dominio e nao virar monolito.
- `packages/shared` deve conter apenas tipos e utilitarios realmente compartilhados entre apps.
- Logs e erros devem ser claros, controlados e faceis de rastrear por modulo.

## Regras operacionais para Codex

- Git e a fonte da verdade para codigo, docs e workflows versionados.
- Nunca commitar segredos, tokens, dumps, exports internos ou dados sensiveis.
- Nunca commitar `.env`, `.tmp`, arquivos temporarios locais ou credenciais.
- Nao alterar API, schema ou endpoints sem autorizacao explicita do usuario.
- Workflows n8n versionados devem ficar em `infra/n8n/workflows`.
- Workflow n8n versionado deve manter `id` estavel para evitar duplicidade no import.
- Ao alterar workflow n8n, executar `npm run n8n:import:workflows` e `npm run n8n:list:workflows`.
- Antes de concluir qualquer alteracao, executar `npm run build`, `npm run lint` e `npm run smoke:api`.
- Manter mudancas pequenas e modulares; evitar arquivos grandes e responsabilidades misturadas.

## Definition of Done para API

- Para mudancas de API, nao basta build/lint/smoke generico: deve existir teste operacional ou smoke cobrindo fluxo feliz, idempotencia e erro/validacao relevante.
- Exemplos de documentacao devem ser copiaveis/executaveis sem depender de placeholder sem instrucao de obtencao.
- O Codex deve executar os testes previstos antes de declarar conclusao.
- Quando houver script `verify:*` para o fluxo alterado, ele deve ser executado junto das validacoes obrigatorias.

## Regra de validacao sequencial

- Nunca executar `smoke:api` e `verify:*` em paralelo quando usam o banco local compartilhado.
- Nao usar jobs em background, terminais paralelos, concorrencia, `npm-run-all` paralelo, `concurrently`, PowerShell jobs ou chamadas simultaneas para esses scripts.
- A bateria final deve rodar em sequencia deterministica.
- Se algum teste falhar apos execucao paralela, a falha nao e conclusiva; repetir toda a bateria em sequencia antes de diagnosticar bug real.
- O relatorio final deve informar explicitamente que a bateria foi executada em sequencia.
- Scripts de teste devem usar dados unicos por execucao sempre que possivel.

## Template obrigatorio de relatorio final

Todo relatorio final do Codex deve incluir, nesta ordem:

1. Resumo objetivo da mudanca.
2. Arquivos alterados por categoria (codigo, scripts, documentacao, config).
3. Regras de negocio implementadas/alteradas.
4. Decisoes tecnicas tomadas.
5. Problemas encontrados e contornos aplicados.
6. Limitacoes ou assumptions conhecidas.
7. Migrations/schema: sim ou nao, com justificativa curta.
8. Impacto em API, n8n, docker e MCP.
9. Testes automatizados executados com resultado.
10. Testes manuais recomendados com comandos copiaveis.
11. Como visualizar o resultado operacionalmente.
12. Riscos antes do commit.
13. Proximo passo recomendado.
