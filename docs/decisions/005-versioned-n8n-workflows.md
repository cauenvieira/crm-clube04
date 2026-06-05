# ADR 005 - Workflows n8n Versionados

## Status

Aceita.

## Contexto

Workflows n8n fazem parte da operacao de entrada e automacao. Mudancas manuais sem historico dificultam auditoria, rollback, reproducao local e revisao.

## Decisao

Versionar workflows e convencoes de integracao no repositorio, com evolucao incremental e documentada.

Regras:
- workflows oficiais ficam em `infra/n8n/workflows`;
- workflow versionado deve manter `id` estavel para evitar duplicados no import;
- credenciais e segredos nao devem ser versionados;
- alteracoes relevantes devem atualizar docs de integracao.

Workflow oficial atual:
- `whatsapp-inbound-test`
- ID: `52RxSSXMQ4Zaitnw`
- arquivo: `infra/n8n/workflows/whatsapp-inbound-test.json`

## Razoes

- Rastreabilidade de mudancas.
- Reproducao facilitada em novos ambientes.
- Revisao tecnica mais simples antes de publicar alteracoes.
- Menor risco de duplicidade no import.
- Melhor alinhamento entre Codex, Git e ambiente local.

## Consequencias

- Mudancas manuais no n8n precisam ser exportadas/sincronizadas para Git quando virarem oficiais.
- Import deve sobrescrever workflow por ID estavel.
- Sync Git continua sendo a fonte de verdade para workflow oficial.
- MCP/n8n pode apoiar inspecao, mas nao substitui versionamento.

## Riscos e cuidados

Riscos:
- divergencia entre workflow ativo no n8n e versao no Git;
- exposicao acidental de credenciais em exportacoes;
- duplicacao de workflows por ID novo;
- automacao real acionada antes de governanca.

Cuidados:
- remover segredos antes de versionar;
- registrar versao e data de cada alteracao relevante;
- validar com smoke tests apos mudanca de fluxo;
- manter modo escuta/controlado antes de automacao real.

## Docs relacionados

- `docs/integrations/n8n-maintenance.md`
- `docs/integrations/n8n-mcp.md`
- `docs/integrations/n8n-whatsapp-inbound.md`
- `docs/development/checklists/integration.md`
