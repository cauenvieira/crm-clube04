# Lead Operational UI Wireframes

Projeto: CRM Clube04 Mogi das Cruzes
Data: 2026-06-07
Status: especificacao UX complementar M1/M2
Milestone: M1 Jornada do Lead / M2 Mesa Operacional

## Papel na hierarquia

Este documento orienta UX e mock da Mesa Operacional. Ele nao altera regra de negocio por si so.

Fontes de regra:

- `docs/product/lead-operational-contract.md`
- `docs/product/lead-import-normalization.md`
- `docs/qa/lead-business-rules-test-matrix.md`
- `docs/product/lead-operational-system.md`

Se um wireframe sugerir status, fila ou permissao fora do contrato, tratar como proposta pendente.

## Principios de UX

- A Mesa deve mostrar a fila operacional/action item, nao apenas status.
- O card deve ser compacto e priorizar tutor, doguinho, telefone, situacao principal, tags e proxima acao.
- A lideranca deve enxergar excecoes: atrasado, backlog, follow-up longo, tentativa alta, caso sensivel e erro operacional.
- O drawer deve conduzir a acao operacional, nao apenas exibir cadastro.
- Finalizacoes criticas nao devem aparecer para atendente.
- Nutricao deve ter visao propria ou filtro separado da rotina diaria.
- Mobile deve usar lista/seletor de fila, nao colunas lado a lado.

## Navegacao alvo

```text
Operacao
- Mesa Operacional
- Novo Lead
- Base de Leads
- Analise da Lideranca

Apoio
- Modelos de Mensagem
- Motivos / Objecoes

Sistema
- Usuarios e Permissoes
- Configuracoes Operacionais
- Auditoria
```

## Mesa Operacional desktop

```text
Header: Mesa Operacional
[Buscar] [+ Novo Lead] [Filtros]

Filtros:
[Todos ativos] [Hoje] [Atrasados] [Backlog] [Proximos 7 dias]
[Lideranca] [Nutricao] [Tentativa alta]

Resumo:
Hoje | Atrasados | Backlog | Lideranca | Tentativa alta

Colunas/visoes:
- Fazer follow-up
- Validar agendamento
- Revisar lideranca
- Nutricao em visao propria ou recolhida
```

## Mesa Operacional mobile

```text
Mesa Operacional
[+ Novo Lead]
[Busca]
[Hoje] [Atrasados] [Backlog] [Lideranca] [Nutricao]
Fila: [seletor]
LeadCard
LeadCard
LeadCard
```

## LeadCard

Campos visiveis:

| Campo | Regra |
|---|---|
| Tutor | Se ausente, mostrar label operacional neutro. |
| Doguinho | Mostrar resumo curto. |
| Telefone | Expor WhatsApp e copiar telefone. |
| Situacao principal | Apenas uma, por ranking. |
| Tags secundarias | Maximo 3. |
| Ultimo resultado | Ultimo evento operacional relevante. |
| Proxima acao | Obrigatoria para lead ativo. |
| Contadores | Separar sem resposta e follow-up quando existirem. |

Acoes rapidas:

- abrir lead;
- abrir WhatsApp;
- copiar telefone;
- registrar `sem_resposta` com confirmacao quando estiver perto do envio para lideranca.

## Drawer do lead

Ordem recomendada:

1. Identificacao: tutor, doguinho, telefone.
2. Situacao operacional: fila atual, proxima acao, responsavel, contadores e tags.
3. Acao principal conforme fila/action item.
4. Campos dinamicos obrigatorios.
5. Historico/auditoria.
6. Detalhes tecnicos somente para admin.

Validacoes de UX:

- O botao de salvar fica bloqueado ate cumprir campos obrigatorios.
- Atendente nao ve acoes finais de `perdido` e `desqualificado`.
- Envio para lideranca exige checklist e motivo.
- Follow-up longo exige motivo antes de salvar.

## Formularios por fila

### Fazer follow-up

Resultados esperados:

- sem resposta;
- conversa em andamento;
- demonstrou interesse;
- objecao;
- agendamento combinado;
- enviar para lideranca.

Regras:

- `sem_resposta` agenda automaticamente pela cadencia vigente do backend.
- conversa/interesse/objecao exigem proxima data.
- objecao permanece em follow-up, salvo excecao explicita.
- agendamento combinado segue a regra vigente do contrato/API.
- enviar lideranca exige checklist e motivo.

### Revisar lideranca

Decisoes esperadas:

- retomar atendimento;
- finalizar como perdido;
- finalizar como desqualificado;
- enviar para nutricao;
- corrigir erro operacional;
- gerar acao secundaria.

Somente lideranca/admin finalizam perdido/desqualificado, enviam para nutricao ou reabrem terminal.

### Nutricao

Nutricao deve ser separada da rotina diaria. Reativacao volta para fila/action item ativo com responsavel e proxima acao.

## Situacao principal e tags

O card deve mostrar uma situacao principal e ate 3 tags.

Ranking inicial de situacao principal:

1. Erro de consistencia.
2. Caso sensivel.
3. Revisao da lideranca.
4. Backlog.
5. Atrasado.
6. Hoje.
7. Follow-up longo.
8. Tentativa alta.
9. Cadastro incompleto.
10. Nutricao.
11. Futuro.

Tags secundarias devem priorizar ultimo resultado, tentativa sem resposta, follow-up longo, interesse, alerta do doguinho, motivo de lideranca e cadastro incompleto.

## Estado dos wireframes

Este documento e suficiente para orientar mock e validacao visual. A implementacao real deve consumir regras do backend e nao codificar transicoes criticas apenas no frontend.
