# ADR 004 - API Key Interna Antes de Autenticacao Completa

## Status

Aceita

## Contexto

O sistema ainda esta em fase inicial de integracao tecnica e nao exige fluxo completo de usuarios, login e permissoes.

## Decisao

Proteger endpoints `/api/*` com API key interna em header:

- `x-crm-api-key: <CRM_API_SECRET>`

Manter `GET /health` publico para verificacao operacional.

## Razoes

- Implementacao simples e de baixo risco para etapa MVP.
- Permite proteger rapidamente integracoes internas (n8n e automacoes).
- Evita antecipar complexidade de auth sem necessidade imediata.

## Riscos e Cuidados

- Segredo compartilhado pode vazar por configuracao inadequada.
- Nao ha rastreabilidade por usuario nesta fase.

Cuidados:

- Segredo apenas em `.env`, nunca no codigo.
- Rotacao do segredo quando necessario.
- Evoluir para autenticacao completa em fase posterior.
