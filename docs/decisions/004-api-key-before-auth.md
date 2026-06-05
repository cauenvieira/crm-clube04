# ADR 004 - API Key Interna Antes de Autenticacao Completa

## Status

Aceita.

## Contexto

O sistema ainda esta em fase de desenvolvimento local, integracao tecnica e organizacao operacional. Neste momento, nao ha fluxo completo de usuarios, login, roles e permissoes.

Mesmo assim, endpoints `/api/*` nao devem ficar abertos para integracoes internas, n8n e testes.

## Decisao

Proteger endpoints `/api/*` com API key interna em header:

```text
x-crm-api-key: <CRM_API_SECRET>
```

Manter `GET /health` publico para verificacao operacional.

## Razoes

- Implementacao simples e de baixo risco para etapa MVP/local.
- Protege rapidamente integracoes internas.
- Evita antecipar complexidade de auth sem necessidade imediata.
- Mantem caminho claro para evolucao futura.

## Consequencias

- `CRM_API_SECRET` deve ficar em `.env`/secrets, nunca no codigo.
- Scripts, n8n e chamadas manuais devem enviar `x-crm-api-key`.
- Ainda nao ha rastreabilidade por usuario individual.
- Antes de uso operacional amplo, sera necessario evoluir para auth, roles e auditoria.

## Riscos e cuidados

Riscos:
- segredo compartilhado pode vazar por configuracao inadequada;
- ausencia de usuario individual limita auditoria;
- uso indevido se a API for exposta fora do ambiente controlado.

Cuidados:
- segredo apenas em `.env`, nunca no Git;
- rotacao do segredo quando necessario;
- nao logar segredo;
- nao expor API sem controle de rede;
- evoluir para autenticacao completa em fase posterior.

## Docs relacionados

- `docs/api/rest-api.md`
- `docs/product/crm-platform-roadmap.md`
- `docs/product/modules.md`
