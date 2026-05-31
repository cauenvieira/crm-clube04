# ADR 005 - Workflows n8n Versionados

## Status

Aceita

## Contexto

Workflows n8n sao parte critica da operacao de entrada de dados. Mudancas manuais sem historico dificultam auditoria e rollback.

## Decisao

Versionar workflows e convencoes de integracao no repositorio, com evolucao incremental e documentada.

Nesta fase inicial, o foco esta em documentar o fluxo minimo. Exportacao formal de workflows pode entrar como proxima tarefa quando o fluxo estabilizar.

## Razoes

- Rastreabilidade de mudancas.
- Reproducao facilitada em novos ambientes.
- Revisao tecnica mais simples antes de publicar alteracoes.

## Riscos e Cuidados

- Divergencia entre workflow ativo no n8n e versao no Git.
- Exposicao acidental de credenciais em exportacoes.

Cuidados:

- Remover segredos antes de versionar.
- Registrar versao e data de cada alteracao relevante.
- Validar com smoke tests apos mudanca de fluxo.
