# ADR 002 - Arquitetura Modular por Camadas

## Status

Aceita

## Contexto

A API e o worker vao crescer em dominio e integracoes. Sem separacao clara, o projeto tende a perder previsibilidade.

## Decisao

Adotar separacao modular com responsabilidades:

- `routes`: HTTP e resposta
- `validation/schemas`: validacao de entrada
- `services`: regra de negocio
- `repositories`: SQL e persistencia
- `plugins/middlewares`: comportamento transversal
- `integrations`: comunicacao externa
- `jobs`: rotinas assicronas no worker

## Razoes

- Facilita manutencao e revisao humana.
- Reduz risco de regressao em mudancas pequenas.
- Melhora depuracao por contexto de modulo.
- Mantem o projeto amigavel para colaboracao com IA/LLM.

## Riscos e Cuidados

- Abstracao excessiva para problemas simples.
- Arquivos utilitarios genericos sem dono claro.

Cuidados:

- Manter escopo pequeno por arquivo.
- Evitar arquivos acima de 250-300 linhas.
- Refatorar incrementalmente, sem reescritas amplas.
