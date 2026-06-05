# Jobs de classificacao CRM

## Objetivo

Reservar jobs de classificacao operacional, recorrencia e risco.

## Status atual

- Nao ha classificador operacional completo neste modulo.
- Summary/worklist e regras de lead ja existem em backend/API.
- Classificacoes futuras devem respeitar contratos de produto e dados.

## Escopo futuro possivel

- faixas de atraso;
- risco de inatividade;
- frequencia real por pet;
- retorno previsto;
- pacote perto de acabar;
- alertas de recorrencia;
- segmentos para reativacao.

## Regras

- Nao misturar Jornada do Lead com Jornada do Cliente sem milestone clara.
- Nao alterar status de lead sem contrato operacional e teste.
- Classificacao calculada deve ser rastreavel.
- Preferir escrever resultados derivados em tabelas/projecoes claras.
- Evitar recalculo destrutivo sem backup e dry-run.

## Docs relacionados

- `docs/product/data-model-overview.md`
- `docs/product/modules.md`
- `docs/product/operational-flows.md`
- `docs/database/schema.md`
- `docs/tasks.md`

Se envolver lead:

- `docs/product/lead-operational-contract.md`
- `docs/qa/lead-business-rules-test-matrix.md`

## Validacao esperada

- `npm run build`
- `npm run lint`
- verify especifico do dominio
- `npm run verify:data-cleanliness`
