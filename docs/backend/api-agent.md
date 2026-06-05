# Backend API Agent

## Papel na hierarquia

Guia de execucao para tarefas de API/backend no CRM Clube04.

Autoridade:
- Define padroes de implementacao backend e checklist de entrega.
- Nao substitui `docs/api/rest-api.md` para contrato publico de endpoints.
- Nao substitui `docs/database/schema.md` para schema/enums.
- Nao substitui os contratos da Jornada do Lead quando a tarefa envolver ciclo de vida operacional.

Antes de tarefa backend, leia:
- `AGENTS.md`
- `docs/development/documentation-hierarchy.md`
- `docs/architecture/code-organization.md`
- `docs/api/rest-api.md`
- `docs/database/schema.md`

Se envolver lead, leia obrigatoriamente:
- `docs/product/lead-operational-contract.md`
- `docs/product/lead-import-normalization.md`
- `docs/qa/lead-business-rules-test-matrix.md`

## Principios

- Backend e dono do comportamento critico de ciclo de vida.
- Frontend nao deve implementar movimentacao operacional critica apenas de forma visual.
- Endpoints devem ser pequenos, previsiveis e testaveis.
- Toda decisao operacional relevante deve gerar historico/auditoria quando aplicavel.
- Mudancas de contrato exigem docs e testes no mesmo ciclo.
- Nao alterar schema em tarefa comum sem escopo explicito de migration.

## Camadas

### Routes

Responsabilidade:
- registrar endpoints Fastify;
- validar `params`, `query` e `body`;
- chamar services;
- definir status HTTP e formato de resposta;
- traduzir erros controlados para HTTP.

Nao devem:
- conter SQL;
- conter regra de negocio complexa;
- acessar variaveis de ambiente diretamente;
- conversar com sistemas externos diretamente.

### Validation / schemas

Responsabilidade:
- usar Zod ou padrao equivalente;
- definir payloads, params, query e enums aceitos;
- converter tipos simples, como paginacao;
- falhar cedo com mensagem controlada.

Regras:
- nao duplicar validacao manual em route quando schema ja existe;
- enums aceitos pela API devem estar alinhados com `docs/api/rest-api.md`;
- se o enum vier de regra operacional de lead, validar contra o contrato operacional.

### Services

Responsabilidade:
- concentrar regra de negocio;
- orquestrar repositories e outros services;
- controlar transacoes quando uma operacao alterar varias entidades;
- implementar idempotencia, normalizacao e efeitos internos;
- lancar erros controlados.

Nao devem:
- montar SQL manualmente;
- depender de detalhes de HTTP;
- misturar muitos casos de uso em uma funcao longa.

### Repositories

Responsabilidade:
- concentrar SQL e acesso ao PostgreSQL;
- traduzir filtros simples para queries;
- retornar rows tipadas;
- isolar detalhes de persistencia.

Nao devem:
- chamar services;
- tomar decisoes complexas de negocio;
- aplicar regra operacional de ciclo de vida.

### Integrations

Responsabilidade:
- isolar HTTP, payload externo, autenticacao externa e parsing;
- normalizar entrada antes de chamar dominio;
- preservar payload bruto quando util para auditoria.

Regras:
- nao alterar dados no sistema Clube04;
- scraping Clube04 deve ser somente leitura;
- WAHA/n8n/BSP devem entrar por adaptadores e contratos estaveis.

### Utils

Responsabilidade:
- normalizacoes pequenas e reutilizaveis;
- exemplos: telefone, erro de API, helpers SQL.

Regra:
- evitar `utils.ts` generico sem dono claro.

## Transacoes

Usar transacao quando a operacao:

- cria interacao e atualiza lead;
- fecha action item e cria proxima acao;
- altera contato e lead juntos;
- cria contato, lead, interaction e action item no mesmo fluxo;
- processa webhook com idempotencia e criacao de entidades relacionadas;
- precisa manter historico consistente.

## Idempotencia

Aplicar idempotencia quando houver risco de repeticao por retry, webhook ou reenvio:

- mensagens: `provider + provider_message_id`;
- conversas: `provider + provider_conversation_id`;
- contatos: telefone normalizado;
- action items: evitar duplicado aberto para `lead + type + due_at`;
- importacoes: preservar chave externa/hash quando aplicavel.

## Erros

Padrao esperado:

- `400`: payload invalido ou regra de negocio rejeitada;
- `401`/`403`: autenticacao/autorizacao quando aplicavel;
- `404`: entidade inexistente;
- `409`: conflito de estado ou duplicidade quando aplicavel;
- `500`: falha inesperada, sem vazar segredo.

Regras:
- usar erros controlados;
- nao vazar segredos, tokens, payload sensivel ou dados reais desnecessarios;
- retornar JSON claro o suficiente para troubleshooting.

## Schema

- Antes de usar coluna, enum ou status novo, conferir:
  - `infra/db/migrations/001_initial_crm_schema.sql`
  - `docs/database/schema.md`
- Se migration for necessaria, parar e propor tarefa propria.
- Nao adaptar regra de negocio apenas porque o enum fisico tem nome legado. Documentar a compatibilidade.

## Jornada do Lead

Para tarefas envolvendo lead:

- nao inferir regra pelo codigo;
- consultar contrato operacional antes de mudar status, outcome, action item, cadencia, lideranca, perda, desqualificacao, conversao ou nutricao;
- atualizar contrato e matriz se a regra mudar;
- garantir historico/auditoria;
- manter action item/proxima acao consistente para lead ativo.

## Checklist antes de concluir tarefa backend

Docs-only:
- `git diff --check`
- `npm run verify:data-cleanliness`

Backend geral:
- `npm run build`
- `npm run lint`
- `npm run smoke:api`
- verify especifico da feature, quando existir

Backend de Jornada do Lead:
- `npm run verify:lead-operational-cycle`
- `npm run verify:operational-summary`
- `npm run verify:operational-worklist`
- atualizar matriz de testes quando houver mudanca de regra ou lacuna nova

Entrega:
- reportar arquivos alterados;
- reportar validacoes;
- reportar se API/schema/docs/testes mudaram;
- reportar riscos e proximo passo.
