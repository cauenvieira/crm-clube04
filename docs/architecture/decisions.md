# Architecture Decisions

## Papel na hierarquia

Este documento consolida decisoes arquiteturais aceitas no CRM Clube04.

Autoridade:
- Resume decisoes para leitura rapida.
- ADRs individuais em `docs/decisions/*.md` guardam detalhes historicos.
- Em caso de conflito, ADR especifica e docs de contrato tecnico/produto devem ser revisados juntos.
- Novas decisoes relevantes devem virar ADR propria quando forem estaveis.

## ADRs atuais

- `docs/decisions/001-stack-open-source.md`
- `docs/decisions/002-modular-architecture.md`
- `docs/decisions/003-whatsapp-through-n8n.md`
- `docs/decisions/004-api-key-before-auth.md`
- `docs/decisions/005-versioned-n8n-workflows.md`

## 1. CRM como camada operacional complementar

Decisao:
- O CRM Clube04 opera como camada propria para atendimento, follow-up, historico, fila operacional e indicadores.
- O CRM nao deve alterar dados no sistema oficial Clube04.
- Integracoes com sistema oficial devem iniciar em modo leitura.

Razao:
- preservar isolamento de responsabilidades;
- reduzir risco operacional no sistema oficial;
- permitir evolucao incremental;
- manter rastreabilidade da rotina comercial/operacional.

Implicacoes:
- scraping Clube04 e somente leitura;
- dados importados devem preservar origem e payload bruto quando util;
- o CRM pode criar sua propria camada operacional sem depender de API oficial imediata.

## 2. Stack open-source e execucao local

Decisao:
- Usar Node.js, TypeScript, Fastify, PostgreSQL, Redis, Docker Compose e React/Vite.
- n8n entra como orquestrador local/controlado.
- WAHA/BSP ficam como integracoes futuras/controladas.

Razao:
- baixo custo inicial;
- autonomia tecnica;
- facilidade de reproducao local;
- boa aderencia a desenvolvimento incremental.

ADR:
- `docs/decisions/001-stack-open-source.md`

## 3. Arquitetura modular por camadas

Decisao:
- Separar responsabilidades em routes, validation/schemas, services, repositories, integrations, worker/jobs e shared quando realmente necessario.

Razao:
- facilitar revisao humana e por IA;
- reduzir regressao;
- manter arquivos pequenos e debuggaveis;
- evitar acoplamento entre API, integracoes e regra de negocio.

ADR:
- `docs/decisions/002-modular-architecture.md`

Doc estrutural:
- `docs/architecture/code-organization.md`

## 4. n8n como camada de normalizacao de entrada WhatsApp

Decisao:
- Entrada WhatsApp passa pelo n8n, que normaliza payload e envia para a API em `POST /api/webhooks/whatsapp/inbound`.
- API nao deve acoplar diretamente a WAHA nesta etapa.

Razao:
- isolar variabilidade de provider;
- permitir ajuste de payload sem redeploy da API;
- manter API com contrato normalizado.

ADR:
- `docs/decisions/003-whatsapp-through-n8n.md`

## 5. API key interna antes de autenticacao completa

Decisao:
- Proteger `/api/*` com header `x-crm-api-key`.
- Manter `GET /health` publico.
- Auth real, permissoes e auditoria entram em fase posterior.

Razao:
- protecao simples para MVP/local;
- evita antecipar complexidade de usuario/permissao;
- permite n8n e automacoes internas com controle minimo.

ADR:
- `docs/decisions/004-api-key-before-auth.md`

## 6. Workflows n8n versionados

Decisao:
- Workflows n8n oficiais devem ficar versionados no Git.
- IDs de workflow devem permanecer estaveis para evitar duplicados no import.

Razao:
- rastreabilidade;
- reproducao de ambiente;
- rollback e revisao;
- governanca sobre automacoes.

ADR:
- `docs/decisions/005-versioned-n8n-workflows.md`

## 7. Fonte sincronizada para ChatGPT

Decisao:
- Git continua sendo fonte de verdade.
- Google Drive `repo-docs` e espelho automatico de Markdown versionado para consulta no ChatGPT.
- Sync ocorre via GitHub Actions + rclone apos push na `main`.

Razao:
- manter ChatGPT/Codex alinhados com docs versionados;
- reduzir dependencia de memoria de chat;
- evitar copiar manualmente contexto do repo.

Doc relacionado:
- `docs/development/chatgpt-project-sources.md`

## 8. Backend como dono do ciclo de vida do lead

Decisao:
- Movimentacao critica da Jornada do Lead deve estar no backend.
- Frontend apenas consome, apresenta e aciona endpoints.
- Mudancas de status/outcome/action item devem respeitar contrato operacional.

Razao:
- evitar divergencia entre telas, relatorios e regras;
- garantir auditoria;
- manter disciplina operacional;
- proteger conversao e rotina de atendimento.

Docs relacionados:
- `docs/product/lead-operational-contract.md`
- `docs/product/lead-import-normalization.md`
- `docs/qa/lead-business-rules-test-matrix.md`

## 9. WAHA real fora do escopo imediato

Decisao:
- Manter WAHA real fora do escopo funcional imediato.
- Priorizar contrato, idempotencia, webhook normalizado e operacao manual/controlada.

Razao:
- reduzir risco operacional;
- evitar automacao real sem governanca;
- estabilizar base antes de operar canal em producao.

## Politica para novas ADRs

Criar ADR quando a decisao afetar:

- stack;
- arquitetura;
- schema;
- integracao externa;
- seguranca/auth;
- automacao real;
- ownership de regra de negocio;
- padrao transversal que impacta varios modulos.

Formato:
- contexto;
- decisao;
- razoes;
- riscos/cuidados;
- consequencias;
- status.
