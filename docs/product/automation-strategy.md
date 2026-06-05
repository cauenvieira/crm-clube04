# Automation Strategy

## Objetivo

Evoluir automacoes de forma segura, auditavel e incremental, sem pular para respostas autonomas ao cliente cedo demais.

Automacao no CRM Clube04 deve reduzir retrabalho e aumentar disciplina operacional, sem tirar controle humano de decisoes sensiveis.

## Principios

- Comecar por automacoes de apoio, nao atendimento autonomo.
- Toda automacao deve deixar historico/auditoria.
- Toda automacao deve ser reversivel ou neutralizavel.
- Regras sensiveis devem morar em services/backend, nao apenas no frontend ou n8n.
- Integracoes externas devem entrar por adaptadores.
- IA entra como copiloto antes de executar acao real.

## Camada 1 - Regras simples por evento

Exemplos:

- lead criado;
- mensagem inbound recebida;
- `next_action_at` vencido;
- lead ativo sem proxima acao;
- limite de tentativas atingido;
- pacote perto de acabar no futuro;
- cliente sem agenda no futuro.

Autoridade de regra:

- Jornada do Lead: contrato operacional e matriz de testes.
- Integracoes: docs de integracao e ADRs.
- Modulos futuros: roadmap/backlog ate virarem contrato.

## Camada 2 - Action items como motor inicial

`action_items` e o mecanismo base da rotina diaria.

Responsabilidades:

- materializar proximas acoes;
- dar prioridade operacional;
- permitir concluir, ignorar ou reagendar com historico;
- alimentar worklist, summary e Mesa Operacional.

A equipe opera a fila; o sistema garante que a fila seja coerente.

## Camada 3 - Alertas operacionais

Alertas iniciais:

- atender hoje;
- follow-up vencido;
- backlog acima de 7 dias;
- lead ativo sem proxima acao;
- ciclo longo;
- necessidade real de revisao de lideranca.

Alertas devem ser acionaveis. Se nao gerarem decisao ou acao, viram ruido.

## Camada 4 - Relatorio diario automatizado

Objetivo futuro:

- consolidar prioridade do dia;
- mostrar bloqueios;
- expor atrasados/backlog;
- resumir inbound/movimento;
- orientar foco de atendimento e lideranca.

Inicialmente, o relatorio deve refletir `operational-summary` e `operational-worklist`.

## Camada 5 - WhatsApp e n8n

n8n pode orquestrar entrada, normalizacao e envio para a API.

Limites:

- n8n nao deve ser fonte de verdade de regra de negocio;
- workflow versionado fica no Git;
- credenciais reais nunca entram no repo;
- WAHA real fica fora do escopo atual ate rollout controlado;
- nenhum envio ativo para cliente sem aprovacao.

## Camada 6 - IA em modo sugestao

Uso futuro:

- sugerir proxima melhor acao;
- resumir historico;
- sugerir classificacao de motivo/perda;
- sugerir prioridade;
- apoiar simulacao de atendimento.

Limites:

- IA nao deve encerrar lead sozinha;
- IA nao deve enviar mensagem real sem confirmacao humana nas fases iniciais;
- IA nao deve alterar regra operacional sem documento/teste;
- sugestao precisa ser auditavel.

## Limites de seguranca

1. Nao automatizar resposta autonoma ao cliente no inicio.
2. Nao remover decisao humana em casos sensiveis.
3. Nao executar acao externa real sem aprovacao.
4. Nao alterar sistema Clube04 oficial automaticamente.
5. Nao tratar n8n, IA ou frontend como autoridade de ciclo de vida.
6. Antes de uso real: auth, permissoes, auditoria e observabilidade sao obrigatorios.

## Decisoes atuais

- Worklist e prioridade diaria prevalecem sobre Kanban para operacao.
- Lead convertido continua no CRM como cliente, nao desaparece do relacionamento.
- API key/localStorage e apenas para dev local.
- Automacoes avancadas entram apos estabilizar M1/M2.
- IA entra como copiloto, nao como atendimento autonomo.
