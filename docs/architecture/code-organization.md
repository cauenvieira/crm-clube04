# Organizacao de Codigo

## Papel na hierarquia

Este documento define o padrao estrutural permanente do CRM Clube04.

Autoridade:
- Define organizacao por camadas, limites de arquivo e responsabilidades.
- Complementa `AGENTS.md` e `docs/development/documentation-hierarchy.md`.
- Nao substitui contratos especificos de API, schema, produto ou testes.
- Resultados de auditoria pontual devem ficar no relatorio da tarefa, nao aqui.

## Principios

- Fazer mudancas pequenas, incrementais e com escopo limitado.
- Manter responsabilidades separadas por camada.
- Preferir nomes explicitos a arquivos genericos.
- Evitar refatoracoes grandes junto com funcionalidades.
- Quando uma mudanca exigir reestruturacao ampla, documentar a proposta e pedir aprovacao antes de implementar.
- Nao criar arquitetura paralela para resolver caso local.
- Lovable e referencia visual, nao fonte de arquitetura.
- O projeto deve continuar facil de revisar por humanos, ChatGPT, Codex e outros agentes.

## Limites recomendados

- Evitar arquivos de codigo acima de 250 a 300 linhas.
- Se um arquivo passar desse limite, propor divisao antes de continuar.
- Evitar funcoes longas; quando uma funcao acumular muitos passos, extrair partes com nomes claros.
- Evitar arquivos chamados apenas `utils.ts`; utilitarios devem ter proposito claro, como `phone.ts`, `sql.ts` ou `api-error.ts`.
- Migrations SQL podem passar desse limite quando representam DDL versionado, mas devem continuar focadas em uma etapa de schema.
- Documentos Markdown podem ser maiores quando forem contratos ou guias de referencia, mas devem ter indice e secoes claras.

## API

### Routes

Responsabilidade:
- registrar endpoints Fastify;
- validar `body`, `params` e `query`;
- chamar services;
- definir status HTTP e formato simples da resposta.

Regras:
- nao colocar SQL direto em routes;
- nao colocar regra de negocio complexa em routes;
- nao acessar variaveis de ambiente diretamente em routes;
- nao conversar com sistemas externos diretamente em routes;
- nao implementar regra critica de lead apenas na rota.

### Services

Responsabilidade:
- concentrar regra de negocio;
- orquestrar chamadas entre repositories;
- aplicar decisoes de fluxo, como idempotencia, normalizacao e atualizacao de entidades relacionadas;
- controlar transacoes quando necessario;
- lancar erros controlados.

Regras:
- services podem chamar repositories e outros services quando houver orquestracao de dominio;
- services nao devem montar SQL manualmente;
- services devem manter funcoes curtas e nomeadas pelo caso de uso;
- regra de ciclo de vida de lead deve permanecer no backend/service, nao apenas na UI.

### Repositories

Responsabilidade:
- concentrar acesso ao PostgreSQL;
- conter SQL, queries, inserts, updates e detalhes de persistencia;
- traduzir filtros simples para queries;
- retornar rows tipadas.

Regras:
- SQL da aplicacao deve ficar em repositories;
- excecao permitida: health check tecnico em `db/postgres.ts`;
- repositories nao devem conter regra de negocio complexa;
- repositories nao devem chamar services.

### Schemas e validators

Responsabilidade:
- validar payloads de entrada, params e query string;
- definir enums aceitos pela API;
- converter tipos simples quando necessario, como paginacao numerica.

Regras:
- usar Zod ou biblioteca equivalente;
- nao duplicar validacao manual em routes quando um schema ja existe;
- mensagens de erro devem ser explicitas o suficiente para troubleshooting;
- enum aceito deve estar alinhado com `docs/api/rest-api.md` e, quando envolver lead, com o contrato operacional.

### Types

Responsabilidade:
- definir tipos compartilhados quando o mesmo conceito for usado em mais de uma camada ou app.

Regras:
- tipos locais podem ficar junto da camada que os usa;
- tipos compartilhados entre apps devem ir para `packages/shared`;
- evitar criar arquivo global de tipos antes de existir necessidade real.

### Config

Responsabilidade:
- ler variaveis de ambiente;
- aplicar defaults seguros para desenvolvimento local;
- normalizar valores de configuracao.

Regras:
- segredos reais nunca devem ser salvos no codigo;
- `.env` fica fora do Git;
- `.env.example` deve conter apenas placeholders ou valores locais nao sensiveis.

### Plugins e middlewares

Responsabilidade:
- concentrar comportamento transversal do Fastify;
- exemplos: API key interna, CORS futuro, logging estruturado futuro.

Regras:
- plugins nao devem conter regra de negocio de dominio;
- plugins devem ser registrados antes das rotas quando afetarem seguranca ou parsing.

## Frontend

Responsabilidade:
- entregar interface operacional clara;
- usar API como fonte de comportamento;
- traduzir nomenclatura tecnica para linguagem de operacao.

Regras:
- usar `apps/web/src/components/ui`;
- nao criar biblioteca paralela de componentes;
- nao copiar arquitetura/mock data do Lovable;
- nao implementar movimentacao critica de lead apenas no frontend;
- se uma tela muda fluxo operacional, atualizar docs frontend e produto/testes relevantes.

## Worker

Responsabilidade:
- rodar jobs assincronos e rotinas agendadas;
- separar jobs por dominio: scraping, classificacao CRM, Acao do Dia, sincronizacao e futuras rotinas.

Regras:
- worker nao deve virar um arquivo unico com todos os jobs;
- jobs devem chamar services ou modulos de dominio;
- jobs de scraping devem respeitar leitura somente leitura do sistema Clube04;
- jobs com dados reais exigem cuidado de seguranca e autorizacao.

## Integrations

Responsabilidade:
- concentrar comunicacao com sistemas externos;
- exemplos: Clube04, n8n, WAHA, BSP futuro.

Regras:
- integrations devem isolar detalhes de HTTP, payload externo, autenticacao externa e parsing;
- integrations nao devem alterar dados no sistema Clube04;
- scraping Clube04 deve ser somente leitura;
- provider externo deve entrar por adaptador, nao por acoplamento direto no dominio.

## Packages shared

Responsabilidade:
- tipos e utilitarios realmente compartilhados entre apps.

Regras:
- nao mover codigo para `packages/shared` apenas por organizacao estetica;
- shared deve permanecer pequeno e estavel;
- shared nao deve virar deposito de regra de negocio ambigua.

## Scripts

Responsabilidade:
- automacao de smoke, verify, dev-data, importacao, remediacao e suporte local.

Regras:
- scripts devem ser segmentados por dominio;
- scripts de verify devem ser deterministicos;
- usar `runId` unico e cleanup quando criarem dados;
- scripts nao devem depender de dados reais;
- nao versionar saidas locais, CSV, XLSX, logs ou screenshots.

## Documentacao

Responsabilidade:
- preservar alinhamento entre codigo, regra, teste, roadmap e contexto dos agentes.

Regras:
- `AGENTS.md` e a constituicao operacional;
- `docs/development/documentation-hierarchy.md` define autoridade e roteamento;
- docs auxiliares nao vencem contratos especificos;
- ao concluir tarefa, avaliar retroalimentacao documental.

## Troubleshooting

- Logs devem indicar modulo ou contexto operacional sempre que possivel.
- Erros esperados devem ser controlados e retornar JSON claro.
- Validacoes devem falhar cedo e com mensagens explicitas.
- Ao investigar bugs, verificar primeiro route, schema, service, repository e banco nessa ordem.
- Evitar mensagens genericas quando houver informacao segura e util para o operador.

## Mudancas estruturais

Quando uma tarefa indicar necessidade de reestruturação:

1. registrar diagnostico;
2. propor escopo pequeno;
3. separar refactor de feature;
4. atualizar docs de arquitetura/decisao quando relevante;
5. validar de forma proporcional.
