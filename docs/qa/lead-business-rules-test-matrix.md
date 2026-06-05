# Matriz de Testes das Regras da Jornada do Lead

## 1. Objetivo

Esta matriz conecta as regras dos documentos operacionais aos testes automatizados.

Uma regra so e considerada protegida quando possui:
- ID;
- comportamento esperado;
- teste automatizado ou lacuna pendente explicita.

Documentos de origem:
- docs/product/lead-operational-contract.md
- docs/product/lead-import-normalization.md

## 2. Comandos atuais

Principais:
- npm run smoke:api
- npm run verify:operational-summary
- npm run verify:operational-worklist
- npm run verify:lead-operational-cycle
- npm run verify:lead-operational-scenarios
- npm run verify:all
- npm run verify:data-cleanliness

Frontend quando aplicavel:
- npm run verify:dashboard
- npm run verify:frontend

## 3. Matriz de cobertura

| Regra | Descricao | Teste atual | Cobertura |
|---|---|---|---|
| LOR-001 | Novo lead entra em fila operacional | smoke:api, verify:lead-operational-scenarios | coberto |
| LOR-002 | Lead pode existir sem nome se telefone for valido | smoke:api | parcial |
| LOR-003 | Criacao manual nao duplica lead ativo | smoke:api | coberto |
| LOR-010 | Sem resposta cria proxima tentativa | verify:lead-operational-cycle, verify:lead-operational-scenarios | coberto |
| LOR-011 | Cadencia de tentativas | verify:lead-operational-cycle, verify:lead-operational-scenarios | parcial |
| LOR-012 | Limite de tentativas envia para lideranca | verify:lead-operational-cycle, verify:lead-operational-scenarios | coberto |
| LOR-020 | Envio para lideranca exige autoanalise | verify:lead-operational-scenarios registra lacuna | nao implementado |
| LOR-021 | Lideranca decide destino | verify:lead-operational-scenarios registra lacuna | nao implementado |
| LOR-030 | Lideranca avalia processo | pendente | nao coberto |
| LOR-031 | Lead fora do perfil gera feedback marketing | pendente | nao coberto |
| LOR-032 | Processo ruim gera feedback operacional | pendente | nao coberto |
| LOR-040 | Atender hoje | verify:operational-worklist, verify:lead-operational-scenarios | parcial |
| LOR-041 | Atrasado ate 7 dias | verify:lead-operational-scenarios | coberto |
| LOR-042 | Backlog acima de 7 dias | verify:lead-operational-scenarios registra lacuna | nao implementado |
| LOR-043 | Lead ativo acima de 60 dias | verify:lead-operational-scenarios registra lacuna | nao implementado |
| LOR-044 | Lead ativo sem proxima acao | verify:operational-summary, verify:lead-operational-scenarios | coberto |
| LOR-050 | Taxa de conversao | pendente | nao coberto |
| IMP-001 | Normalizacao de telefone | smoke:api | parcial |
| IMP-002 | Nome vazio | smoke:api | parcial |
| IMP-003 | Nome do pet | pendente | nao coberto |
| IMP-004 | Origem | pendente | nao coberto |
| IMP-005 | Campanha | pendente | nao coberto |
| IMP-006 | Data de entrada | pendente | nao coberto |
| IMP-007 | Proxima acao | pendente | nao coberto |
| IMP-008 | Responsavel | pendente | nao coberto |
| IMP-020 | Lead ativo importado nao fica sem acao | pendente | nao coberto |
| IMP-021 | Lead final nao entra na fila diaria | pendente | nao coberto |
| IMP-022 | Lideranca na importacao | pendente | nao coberto |
| IMP-030 | Duplicidade ativa por telefone | pendente | nao coberto |
| IMP-031 | Duplicidade historica por telefone | pendente | nao coberto |

## 4. Proximas coberturas prioritarias

Prioridade 1:
- LOR-020 checklist antes da lideranca;
- LOR-021 decisao da lideranca;
- LOR-042 backlog acima de 7 dias;
- LOR-043 ciclo acima de 60 dias.

Prioridade 2:
- IMP-001 telefone;
- IMP-004 origem;
- IMP-007 proxima acao;
- IMP-020 lead ativo importado com acao;
- IMP-021 lead final fora da fila diaria.

## 5. Regras dos testes

- Usar dados gerados com runId unico.
- Limpar dados criados pelo teste.
- Nao apagar dados reais importados.
- Nao depender de planilha de producao.
- Verificar banco e resposta de API quando relevante.
- Se a regra nao puder ser testada, marcar pendente.

## 6. Controle de mudanca

Mudanca no ciclo de vida exige atualizar:
- docs/product/lead-operational-contract.md;
- docs/qa/lead-business-rules-test-matrix.md;
- teste correspondente quando aplicavel.

Mudanca de importacao exige atualizar:
- docs/product/lead-import-normalization.md;
- docs/qa/lead-business-rules-test-matrix.md;
- verificacao de importacao quando existir.
