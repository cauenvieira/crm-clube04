# Lead Operational Cycle Test Plan

Projeto: CRM Clube04 Mogi das Cruzes
Data: 2026-06-07
Status: plano manual/funcional para mock e futura implementacao
Milestone: M1 Jornada do Lead / M2 Mesa Operacional

## Papel na hierarquia

Este plano complementa `docs/qa/lead-business-rules-test-matrix.md`.

- A matriz registra regras protegidas e lacunas automatizadas.
- Este plano orienta validacao manual/funcional de mock, prototipo frontend e futura implementacao.
- Nenhum teste automatizado e criado nesta tarefa.

## Objetivo

Validar se a Mesa Operacional e o ciclo do lead respeitam as regras documentadas:

- status, fila, resultado, situacao principal e tags separados;
- lead ativo com fila/action item, proxima acao e responsavel;
- lead terminal fora da Mesa diaria;
- atendente sem permissao para finalizar perdido/desqualificado;
- lideranca/admin decidindo finalizacao, nutricao e reabertura;
- `sem_resposta` incrementando sem resposta e follow-up;
- conversa/interesse/objecao incrementando apenas follow-up;
- follow-up longo exigindo motivo e alerta;
- nutricao separada da rotina diaria;
- backend como dono do ciclo de vida no CRM real.

## Perfis de validacao

| Perfil | Uso |
|---|---|
| Admin | Validar permissoes, detalhes tecnicos, configuracoes e reabertura. |
| Lider | Validar decisoes de lideranca, perdido, desqualificado e nutricao. |
| Atendente | Validar rotina operacional sem privilegios criticos. |

## Massa minima de mock

| Cenario | Quantidade minima |
|---|---:|
| Lead novo para hoje | 3 |
| Follow-up normal | 5 |
| Sem resposta baixa | 3 |
| Sem resposta alta | 3 |
| Aguardando decisao da lideranca | 3 |
| Nutricao | 3 |
| Follow-up longo | 2 |
| Cadastro incompleto/agendamento pendente | 2 |
| Backlog | 3 |
| Caso sensivel | 1 |
| Terminal convertido/perdido/desqualificado | 3 fora da Mesa |

## Casos de teste manuais

### CT-001 - Criar lead minimo

Resultado esperado:

```text
status canonico valido
fila/action item aberto
proxima_acao = hoje/agora ou regra vigente
responsavel definido
lead aparece na Mesa
```

### CT-002 - Telefone duplicado

Resultado esperado:

- sistema alerta duplicidade ativa;
- nao cria lead ativo duplicado sem acao explicita;
- oferece abrir ou preservar lead existente.

### CT-010 - Filtros da Mesa

Validar:

- todos ativos;
- hoje;
- atrasados;
- backlog;
- proximos 7 dias;
- lideranca;
- nutricao;
- tentativa alta, se existir no mock.

Resultado esperado:

- filtros retornam leads coerentes;
- terminais nao aparecem;
- nutricao fica separada da rotina diaria.

### CT-011 - Colunas/filas

A Mesa nao deve criar coluna para `Sem resposta`, `Aguardando resposta` ou `Retomar atendimento` como se fossem filas novas.

### CT-020 - Card com situacao principal unica

Resultado esperado:

- card mostra uma situacao principal;
- tags secundarias limitadas a 3;
- ultimo resultado nao substitui fila operacional.

### CT-030 - Sem resposta comum

Resultado esperado:

```text
contador_sem_resposta +1
contador_follow_up +1
proxima_acao calculada pela cadencia vigente
historico/auditoria registrado
```

### CT-031 - Limite de sem resposta

Resultado esperado:

- ao atingir limite vigente, lead vai para lideranca;
- action items antigos sao fechados, cancelados ou deduplicados;
- historico/auditoria registra a movimentacao.

### CT-040 - Conversa/interesse/objecao

Resultado esperado:

- incrementa follow-up;
- nao incrementa sem resposta;
- exige proxima data quando aplicavel;
- objecao permanece em follow-up, salvo excecao explicita.

### CT-041 - Follow-up longo

Resultado esperado:

- acima do limite normal exige motivo;
- gera alerta para lideranca;
- prazo muito longo por atendente deve bloquear ou orientar lideranca/nutricao conforme regra aprovada.

### CT-050 - Agendamento

Resultado esperado:

- agendamento segue status/action item aprovado em contrato/API;
- cadastro incompleto gera alerta, sem bloquear no mock;
- conversao remove lead da Mesa diaria.

### CT-060 - Lideranca

Resultado esperado:

- envio exige checklist e motivo;
- atendente nao finaliza perdido/desqualificado;
- lideranca/admin finalizam com motivo e auditoria;
- lideranca/admin podem enviar para nutricao;
- reabertura exige motivo e permissao.

### CT-070 - Nutricao

Resultado esperado:

- nutricao fica em visao separada;
- reativacao volta para rotina ativa com responsavel e proxima acao;
- opt-out ou nao contatar nao volta para rotina diaria.

### CT-080 - Auditoria

Eventos minimos esperados no mock/prototipo:

- lead criado;
- resultado registrado;
- fila/action item alterado;
- status alterado;
- proxima acao alterada;
- envio lideranca;
- decisao lideranca;
- lead finalizado;
- lead reaberto.

## Criterio de aceite manual

A validacao do mock/prototipo e satisfatoria se:

1. A Mesa organiza por fila/action item.
2. Nenhum lead ativo fica sem proxima acao e responsavel.
3. Leads terminais saem da Mesa diaria.
4. `sem_resposta` incrementa os contadores corretos.
5. Conversa, interesse e objecao nao incrementam sem resposta.
6. Follow-up longo exige motivo e gera alerta.
7. Perdido/desqualificado sao restritos a lideranca/admin.
8. Nutricao tem visao propria.
9. Cards mostram uma situacao principal e ate 3 tags.
10. O fluxo deixa claro que o backend sera dono do ciclo de vida no CRM real.
