# ADR 001 - Stack Open-Source

## Status

Aceita

## Contexto

O projeto precisa de baixo custo inicial, facilidade de execucao local e autonomia tecnica para evolucao gradual.

## Decisao

Adotar stack open-source com:

- Node.js + TypeScript
- Fastify
- PostgreSQL
- Redis
- Docker Compose
- n8n (automacao)
- WAHA (canal WhatsApp, fase futura)

## Razoes

- Ecossistema maduro e com boa produtividade.
- Facilidade de onboarding e manutencao.
- Portabilidade entre ambiente local e VPS.
- Boa capacidade de observabilidade e depuracao.

## Riscos e Cuidados

- Divergencia de versoes entre ambientes.
- Dependencias transitivas vulneraveis.
- Complexidade operacional de multiplos servicos.

Cuidados:

- Fixar versoes em `package-lock.json` e imagens Docker.
- Rodar `npm audit` periodicamente.
- Atualizar com abordagem conservadora.
