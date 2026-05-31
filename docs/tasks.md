# Tasks Tecnicas - Clube04 CRM

## Convencoes

- Status: `todo`, `doing`, `done`, `blocked`.
- Prioridade: `P0` (critica), `P1` (alta), `P2` (media).
- Sempre manter escopo pequeno por tarefa.

## Backlog Atual

1. `[done][P0]` Base monorepo, Docker e health check
2. `[done][P0]` Schema inicial e migrations versionadas
3. `[done][P0]` API REST base de CRM
4. `[done][P0]` Seguranca interna por API key em `/api/*`
5. `[done][P0]` Endpoint webhook inbound WhatsApp normalizado
6. `[done][P1]` Smoke test automatizado de fluxos principais
7. `[done][P1]` Integracao local minima com n8n no Docker

## Proximas Tasks (Curto Prazo)

1. `[todo][P0]` Definir contrato canonico de payload n8n -> CRM inbound
2. `[todo][P0]` Criar fluxo manual n8n + testes de retry/idempotencia documentados
3. `[todo][P1]` Adicionar logs estruturados por modulo na API
4. `[todo][P1]` Criar job inicial de sincronizacao incremental com `sync_state` (somente leitura)
5. `[todo][P1]` Definir regras iniciais da geracao de `action_items`
6. `[todo][P2]` Preparar base para observabilidade (latencia de rotas e erros controlados)

## Tasks Medias (Proximas Fases)

1. `[todo][P0]` Integrar eventos WAHA ao n8n (sem envio ativo nesta fase)
2. `[todo][P1]` Implementar ingestao incremental de `customers`, `pets`, `appointments`, `services`, `packages`
3. `[todo][P1]` Implementar calculos de frequencia real e retorno previsto por pet
4. `[todo][P1]` Materializar fila operacional da Acao do Dia
5. `[todo][P2]` Iniciar interface web operacional (MVP)

## Cuidados Operacionais por Task

- Nao alterar schema sem necessidade e justificativa.
- Nao misturar regra de negocio complexa em routes.
- SQL somente em repositories.
- Preservar idempotencia de mensagens e webhooks.
- Validar com `build`, `lint` e `smoke:api` a cada incremento.

## Comandos de Validacao Rapida

```bash
npm run build
npm run lint
npm run smoke:api
```
