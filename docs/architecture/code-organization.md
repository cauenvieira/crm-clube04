# Organizacao de Codigo

Este documento define o padrao de organizacao do Clube04 CRM para manter o projeto facil de revisar, debugar e evoluir por humanos e por LLM/IA.

## Principios

- Fazer mudancas pequenas, incrementais e com escopo limitado.
- Manter responsabilidades separadas por camada.
- Preferir nomes explicitos a arquivos genericos.
- Evitar refatoracoes grandes junto com funcionalidades.
- Quando uma mudanca exigir reestruturacao ampla, documentar a proposta e pedir aprovacao antes de implementar.

## Limites Recomendados

- Evitar arquivos de codigo acima de 250 a 300 linhas.
- Se um arquivo passar desse limite, propor divisao antes de continuar.
- Evitar funcoes longas; quando uma funcao acumular muitos passos, extrair partes com nomes claros.
- Evitar arquivos chamados apenas `utils.ts`; utilitarios devem ter proposito claro, como `phone.ts`, `sql.ts` ou `api-error.ts`.
- Migrations SQL podem passar desse limite quando representam DDL versionado, mas devem continuar focadas em uma etapa de schema.

## API

### Routes

Responsabilidade:

- Registrar endpoints Fastify.
- Validar `body`, `params` e `query`.
- Chamar services.
- Definir status HTTP e formato simples da resposta.

Regras:

- Nao colocar SQL direto em routes.
- Nao colocar regra de negocio complexa em routes.
- Nao acessar variaveis de ambiente diretamente em routes.
- Nao conversar com sistemas externos diretamente em routes.

### Services

Responsabilidade:

- Concentrar regra de negocio.
- Orquestrar chamadas entre repositories.
- Aplicar decisoes de fluxo, como idempotencia, normalizacao e atualizacao de entidades relacionadas.
- Lancar erros controlados quando necessario.

Regras:

- Services podem chamar repositories e outros services quando houver orquestracao de dominio.
- Services nao devem montar SQL manualmente.
- Services devem manter funcoes curtas e nomeadas pelo caso de uso.

### Repositories

Responsabilidade:

- Concentrar acesso ao PostgreSQL.
- Conter SQL, queries, inserts, updates e detalhes de persistencia.
- Traduzir filtros simples para queries.

Regras:

- SQL da aplicacao deve ficar em repositories.
- Excecao permitida: health check tecnico em `db/postgres.ts`.
- Repositories nao devem conter regra de negocio complexa.
- Repositories nao devem chamar services.

### Schemas e Validators

Responsabilidade:

- Validar payloads de entrada, params e query string.
- Definir enums aceitos pela API.
- Converter tipos simples quando necessario, como paginacao numerica.

Regras:

- Usar Zod ou biblioteca equivalente.
- Nao duplicar validacao manual em routes quando um schema ja existe.
- Mensagens de erro devem ser explicitas o suficiente para troubleshooting.

### Types

Responsabilidade:

- Definir tipos compartilhados quando o mesmo conceito for usado em mais de uma camada ou app.

Regras:

- Tipos locais podem ficar junto da camada que os usa.
- Tipos compartilhados entre apps devem ir para `packages/shared`.
- Evitar criar um arquivo global de tipos antes de existir necessidade real.

### Config

Responsabilidade:

- Ler variaveis de ambiente.
- Aplicar defaults seguros para desenvolvimento local.
- Normalizar valores de configuracao.

Regras:

- Segredos reais nunca devem ser salvos no codigo.
- `.env` fica fora do Git.
- `.env.example` deve conter apenas placeholders ou valores locais nao sensiveis.

### Plugins e Middlewares

Responsabilidade:

- Concentrar comportamento transversal do Fastify.
- Exemplos: API key interna, CORS futuro, logging estruturado futuro.

Regras:

- Plugins nao devem conter regra de negocio de dominio.
- Plugins devem ser registrados antes das rotas quando afetarem seguranca ou parsing.

## Worker

Responsabilidade:

- Rodar jobs assincronos e rotinas agendadas.
- Separar jobs por dominio: scraping, classificacao CRM, Acao do Dia e sincronizacao.

Regras:

- O worker nao deve virar um arquivo unico com todos os jobs.
- Jobs devem chamar services ou modulos de dominio.
- Jobs de scraping devem respeitar leitura somente leitura do sistema Clube04.

## Integrations

Responsabilidade:

- Concentrar comunicacao com sistemas externos.
- Exemplos futuros: Clube04, n8n, WAHA.

Regras:

- Integrations devem isolar detalhes de HTTP, payload externo, autenticacao externa e parsing.
- Integrations nao devem alterar dados no sistema Clube04.
- Scraping Clube04 deve ser somente leitura.

## Packages Shared

Responsabilidade:

- Tipos e utilitarios realmente compartilhados entre apps.

Regras:

- Nao mover codigo para `packages/shared` apenas por organizacao estetica.
- Shared deve permanecer pequeno e estavel.

## Troubleshooting

- Logs devem indicar modulo ou contexto operacional sempre que possivel.
- Erros esperados devem ser controlados e retornar JSON claro.
- Validacoes devem falhar cedo e com mensagens explicitas.
- Ao investigar bugs, verificar primeiro rota, schema, service, repository e banco nessa ordem.
- Evitar mensagens genericas quando houver informacao segura e util para o operador.

## Auditoria Atual

Estado observado nesta etapa:

- `routes`, `services`, `repositories`, `validation`, `config` e `plugins` estao separados adequadamente.
- SQL da API esta concentrado em repositories, com excecao do health check tecnico em `db/postgres.ts`.
- Routes estao finas e nao possuem regra de negocio complexa.
- Nao ha arquivos TypeScript acima de 250 linhas.
- A migration inicial tem mais de 300 linhas por ser DDL versionado; isso e aceitavel para a etapa de schema, desde que migrations futuras continuem pequenas e focadas.
