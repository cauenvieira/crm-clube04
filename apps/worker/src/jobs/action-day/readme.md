# Jobs de Acao do Dia

## Objetivo

Reservar jobs relacionados a filas operacionais do dia.

Este readme e contexto local. A regra operacional da Jornada do Lead continua protegida por:

- `docs/product/lead-operational-contract.md`
- `docs/product/lead-import-normalization.md`
- `docs/qa/lead-business-rules-test-matrix.md`

## Status atual

- A fila operacional ja existe via `action_items` e endpoints da API.
- Jobs futuros podem materializar ou recalcular tarefas, mas nao devem inventar regra nova.
- O backend continua dono do ciclo de vida critico do lead.

## Regras para jobs futuros

- Job pode gerar, recalcular ou agendar tarefas.
- Job nao deve mover lead para status final sem service de dominio e auditoria.
- Job nao deve apagar historico.
- Job deve ser idempotente.
- Job deve registrar contadores de execucao.
- Job nao deve usar dados reais em fixtures versionadas.

## Exemplos de responsabilidades futuras

- gerar fila de atender hoje;
- reprogramar backlog em lotes;
- criar alertas de atrasado;
- consolidar itens vencidos;
- preparar resumo diario.

## Validacao esperada

- `npm run build`
- `npm run lint`
- verify especifico do job, quando existir
- `npm run verify:lead-operational-cycle`, se envolver ciclo do lead
- `npm run verify:data-cleanliness`
