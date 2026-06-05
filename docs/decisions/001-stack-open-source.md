# ADR 001 - Stack Open-Source

## Status

Aceita.

## Contexto

O CRM Clube04 precisa de baixo custo inicial, facilidade de execucao local, autonomia tecnica e evolucao gradual.

O produto deve apoiar uma operacao real de loja: leads, atendimento, WhatsApp, agenda, clientes, pacotes, metas, equipe, producao, NPS, financeiro operacional, indicadores e automacoes. O foco atual e Jornada do Lead, mas a arquitetura precisa suportar crescimento modular.

## Decisao

Adotar stack open-source com:

- Node.js + TypeScript;
- Fastify;
- PostgreSQL;
- Redis;
- Docker Compose;
- React/Vite;
- n8n para automacao/orquestracao;
- WAHA/BSP como caminho futuro para WhatsApp, com rollout controlado.

## Razoes

- Ecossistema maduro e produtivo.
- Boa aderencia a desenvolvimento incremental.
- Execucao local viavel.
- Portabilidade para VPS/servidor futuro.
- Boa capacidade de observabilidade e depuracao.
- Baixo custo inicial para MVP operacional.

## Consequencias

- O projeto deve preservar scripts de validacao e ambiente Docker funcionando.
- Mudancas de stack devem ser raras e justificadas.
- Integracoes externas devem entrar por adaptadores para evitar acoplamento.
- Auth real e observabilidade completa ficam para fase posterior, antes de rollout operacional amplo.

## Riscos e cuidados

Riscos:
- divergencia de versoes entre ambientes;
- dependencias transitivas vulneraveis;
- complexidade operacional de multiplos servicos;
- uso de automacao antes da governanca estar madura.

Cuidados:
- fixar versoes em `package-lock.json` e imagens Docker quando aplicavel;
- rodar validacoes antes de entrega;
- atualizar com abordagem conservadora;
- nao versionar segredos, `.env`, dumps, logs ou dados reais.

## Docs relacionados

- `AGENTS.md`
- `docs/development/documentation-hierarchy.md`
- `docs/architecture/decisions.md`
- `docs/architecture/code-organization.md`
