# Backend API Agent

Guia para tarefas de API/backend no CRM Clube04.

## Camadas

### Routes

- Registram endpoints Fastify.
- Validam `params`, `query` e `body`.
- Chamam services.
- Definem status HTTP e formato de resposta.
- Nao contem SQL.
- Nao contem regra de negocio complexa.

### Services

- Concentraram regra de negocio.
- Orquestram repositories e outros services.
- Controlam transacoes quando uma operacao altera varias entidades.
- Implementam idempotencia, normalizacao e efeitos colaterais internos.
- Nao montam SQL.

### Repositories

- Concentraram SQL e acesso ao PostgreSQL.
- Nao chamam services.
- Nao tomam decisoes complexas de negocio.
- Devem receber filtros claros e retornar rows tipadas.

### Validation

- Usa Zod.
- Define payloads, params, query e enums aceitos.
- Deve falhar cedo com mensagem controlada.

### Utils

- Normalizacoes pequenas e reutilizaveis.
- Exemplos: telefone, erro de API, SQL helpers.
- Evitar `utils.ts` generico sem dono claro.

## Contratos

Qualquer mudanca de contrato API exige:

- schema/validator atualizado;
- service/repository ajustado;
- docs em `docs/api/rest-api.md`;
- smoke ou verify cobrindo fluxo feliz;
- teste de erro, idempotencia ou validacao quando relevante.

## Schema

- Nao alterar schema em tarefa comum.
- Antes de usar coluna, enum ou status novo, conferir `infra/db/migrations/001_initial_crm_schema.sql` e `docs/database/schema.md`.
- Se migration for necessaria, parar e pedir tarefa propria.

## Transacoes

Use transacao quando a operacao:

- cria interacao e atualiza lead;
- fecha action item e cria proxima acao;
- altera contato e lead juntos;
- precisa manter historico consistente.

## Erros

- Usar erros controlados.
- 400 para payload invalido ou regra de negocio rejeitada.
- 404 para entidade inexistente.
- Nao vazar segredos ou dados sensiveis.

## Validacao minima antes de concluir

- `npm run build`
- `npm run lint`
- `npm run smoke:api`
- verify especifico da feature, quando existir
- `npm run verify:all` antes de commit, salvo tarefa de docs-only
