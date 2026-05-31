# Architecture Decisions (Consolidado)

## 1) CRM como camada operacional complementar

Decisao:

- o CRM Clube04 opera como camada propria para atendimento, follow-up e historico, sem alterar dados no sistema Clube04.

Razao:

- preservar isolamento de responsabilidades;
- reduzir risco operacional no sistema oficial;
- permitir evolucao incremental do CRM.

## 2) n8n como orquestrador local de automacoes

Decisao:

- usar n8n para orquestrar entrada de mensagens e fluxos de automacao.

Razao:

- baixa friccao para integrar webhooks e transformacoes;
- bom ajuste para MVP operacional antes de integrações mais complexas.

## 3) Git como fonte da verdade

Decisao:

- workflows, docs e configuracoes nao sensiveis ficam versionados no repositório.

Razao:

- rastreabilidade;
- reproducao de ambiente local;
- revisao humana e por IA com historico claro.

## 4) MCP como apoio controlado de inspeção

Decisao:

- MCP do n8n e ferramenta de apoio para inspecao/diagnostico, sem substituir o versionamento em Git.

Razao:

- acelera troubleshooting;
- mantem governanca: alteracoes oficiais continuam via arquivos versionados.

## 5) Workflows n8n versionados com ID estavel

Decisao:

- manter ID estavel no JSON de workflow oficial.

Workflow oficial:

- `whatsapp-inbound-test`
- ID: `52RxSSXMQ4Zaitnw`
- arquivo: `infra/n8n/workflows/whatsapp-inbound-test.json`

Razao:

- import do n8n sobrescreve por ID, nao por nome;
- evita criacao de duplicados com mesmo nome.

## 6) WAHA real fora do escopo atual

Decisao:

- manter WAHA real fora do escopo nesta fase.

Razao:

- foco em estabilizar camada base: API, banco, n8n local, idempotencia e processo operacional;
- reduz risco enquanto governanca de segredos e observabilidade amadurecem.
