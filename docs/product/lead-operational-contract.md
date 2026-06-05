# Contrato Operacional da Jornada do Lead

## 1. Objetivo

Este documento e a fonte de verdade para o comportamento operacional da Jornada do Lead no CRM Clube04.

Ele define como um lead entra, evolui, fica pendente, vai para analise de lideranca, e encerrado, entra em nutricao/campanha ou vira cliente.

Nenhuma implementacao deve alterar comportamento operacional sem atualizar este documento e a matriz de testes relacionada.

## 2. Principios

- O CRM existe para aumentar conversao e disciplina operacional.
- A atendente deve saber claramente o que precisa fazer hoje.
- O sistema deve criar proxima acao automaticamente sempre que possivel.
- A lideranca deve receber apenas leads ja trabalhados corretamente.
- Lead frio nao deve consumir a mesma energia diaria de lead ativo.
- A interface deve ser simples; as regras por tras devem ser consistentes.
- Toda movimentacao critica deve gerar historico/auditoria.
- Lead ativo nao deve ficar sem proxima acao.
- Mudanca de regra exige atualizacao de teste ou lacuna explicita na matriz.

## 3. Entidades principais

### Lead

Representa uma oportunidade comercial antes de virar cliente.

Campos operacionais relevantes:
- tutor;
- telefone normalizado;
- pet;
- origem;
- detalhe da origem;
- campanha;
- responsavel;
- status;
- data de entrada;
- primeira mensagem;
- ultima interacao;
- proxima acao;
- quantidade de tentativas;
- motivo de perda;
- motivo de desqualificacao;
- status de analise da lideranca.

### Item de acao

Representa uma tarefa operacional vinculada ao lead.

Tipos principais:
- atender_hoje;
- fazer_follow_up;
- retomar_atendimento;
- revisar_lideranca;
- nutricao_campanha.

### Interacao

Registro de historico/auditoria de contato, decisao, movimentacao ou anotacao operacional.

Toda decisao operacional relevante deve gerar interacao.

## 4. Status operacionais

### novo_lead

Lead novo, ainda nao trabalhado.

Regras:
- todo novo lead entra automaticamente na fila operacional do dia;
- deve aparecer na Mesa Operacional;
- deve gerar ou expor a primeira acao de atendimento.

### em_atendimento

Lead em atendimento comercial ativo.

Regras:
- consome energia diaria da equipe;
- deve ter proxima acao;
- se nao tiver proxima acao, deve aparecer em alerta.

### aguardando_resposta

Lead ja contatado e aguardando retorno.

Regras:
- tentativa deve ser registrada;
- proximo contato deve ser calculado automaticamente;
- nao pode ficar aberto sem proxima acao.

### agendado

Lead com agendamento realizado.

Regras:
- sai da fila comum de atendimento comercial;
- permanece rastreavel para conversao;
- entra na analise de conversao.

### convertido

Lead virou cliente.

Regras:
- sai da Jornada do Lead;
- entra na Jornada do Cliente;
- conta positivamente na conversao;
- itens diarios abertos devem ser fechados ou neutralizados.

### perdido

Lead encerrado como perda comercial.

Regras:
- exige motivo;
- gera historico;
- nao permanece na fila diaria.

### desqualificado

Lead sem oportunidade comercial valida.

Regras:
- exige motivo;
- nao deve ser tratado como perda comercial simples;
- gera historico;
- nao permanece na fila diaria.

### nutricao_campanha

Lead frio, sem prioridade operacional diaria.

Regras:
- sai da fila diaria;
- pode receber campanhas futuras;
- nao deve ficar em atender_hoje, fazer_follow_up ou retomar_atendimento.

### revisar_lideranca

Lead enviado para analise da lideranca.

Regras:
- exige autoanalise da atendente;
- lideranca decide o proximo destino;
- decisao exige justificativa e auditoria.

## 5. Regras de entrada

### LOR-001 - Novo lead entra em fila operacional

Quando um lead e criado manualmente, importado ou recebido por webhook, o sistema deve criar ou expor uma proxima acao operacional.

Resultado esperado:
- lead criado com status valido;
- item de acao aberto quando exigir atuacao;
- lead visivel na Mesa Operacional;
- criacao auditavel.

Testes esperados:
- smoke:api;
- verify:lead-operational-cycle.

### LOR-002 - Lead pode existir sem nome se telefone for valido

Telefone normalizado e o identificador minimo do lead.

Resultado esperado:
- se tutor estiver vazio, usar "Sem nome";
- telefone normalizado deve ser armazenado;
- telefone invalido deve ser rejeitado ou ir para relatorio de invalidos.

Testes esperados:
- smoke:api;
- verificacao futura de lead manual/importacao.

### LOR-003 - Criacao manual nao deve duplicar lead ativo

Se ja existir lead ativo para o telefone, o sistema nao deve criar outro lead ativo duplicado.

Resultado esperado:
- retornar lead existente ou sinalizar duplicidade;
- preservar auditoria;
- evitar multiplas filas para o mesmo contato.

Testes esperados:
- smoke:api.

## 6. Regras de tentativa e sem resposta

### LOR-010 - Sem resposta cria proxima tentativa automaticamente

Ao registrar sem_resposta, o backend deve calcular a proxima tentativa sem exigir data manual.

Resultado esperado:
- attempts_count incrementado;
- ultima interacao atualizada;
- nova proxima acao criada/atualizada;
- historico registrado.

Testes esperados:
- verify:lead-operational-cycle.

### LOR-011 - Cadencia de tentativas

Cadencia inicial:
- tentativa 1: proximo contato em 1 dia util;
- tentativa 2: proximo contato em 2 dias uteis;
- tentativa 3: proximo contato em 3 dias uteis;
- tentativa 4: enviar para revisar_lideranca.

Qualquer mudanca nesta cadencia deve atualizar este documento e a matriz de testes.

### LOR-012 - Limite de tentativas envia para lideranca

Ao atingir o limite de tentativas sem resposta, o lead deve sair da fila comum e entrar em revisar_lideranca.

Resultado esperado:
- item revisar_lideranca criado;
- itens antigos abertos fechados/cancelados/deduplicados;
- historico registrado.

Testes esperados:
- verify:lead-operational-cycle.

## 7. Envio para lideranca

### LOR-020 - Envio para lideranca exige autoanalise

Antes de enviar um lead para lideranca, o sistema deve exigir checklist de autoanalise.

Checklist minimo:
- fiz o primeiro contato dentro do prazo esperado;
- fui claro, simpatico e respeitoso;
- expliquei como funciona o Clube04;
- apresentei beneficios reais, nao apenas preco;
- fiz perguntas para entender a necessidade;
- tentei tratar objecoes;
- ofereci pacote ou recorrencia quando cabivel;
- registrei resumo claro do atendimento;
- o motivo do envio para lideranca esta claro.

Resultado esperado:
- sem checklist, nao permite envio;
- checklist fica registrado;
- lideranca visualiza antes de decidir.

Testes esperados:
- pendente.

### LOR-021 - Lideranca decide o destino

Conclusoes permitidas:
- voltar_para_atendimento;
- perdido;
- desqualificado;
- nutricao_campanha;
- feedback_marketing;
- feedback_atendimento.

Cada conclusao exige justificativa.

Testes esperados:
- pendente.

## 8. Analise da lideranca

### LOR-030 - Lideranca avalia qualidade do processo

Pontos avaliados:
- tempo ate primeiro contato;
- quantidade de tentativas;
- qualidade da abordagem;
- tratamento de objecoes;
- clareza das anotacoes;
- aderencia ao perfil Clube04;
- qualidade da origem/campanha.

### LOR-031 - Lead fora do perfil gera feedback para marketing

Exemplos:
- localizacao incompatível;
- servico nao oferecido;
- expectativa de preco fora do perfil;
- contato invalido ou sem pet;
- campanha trouxe publico errado.

### LOR-032 - Processo ruim gera feedback operacional

Exemplos:
- demora no primeiro contato;
- resposta fria ou incompleta;
- diferenciais nao explicados;
- objecoes nao tratadas;
- pacote/recorrencia nao oferecidos;
- registro incompleto.

## 9. Alertas operacionais

### LOR-040 - Atender hoje

Todo lead com acao vencendo hoje ou sem primeiro atendimento deve aparecer em atender_hoje.

### LOR-041 - Atrasado ate 7 dias

Lead com proxima acao vencida ha ate 7 dias deve aparecer como atrasado.

### LOR-042 - Backlog acima de 7 dias

Lead com proxima acao vencida ha mais de 7 dias deve aparecer como backlog.

### LOR-043 - Lead ativo com mais de 60 dias

Lead em atendimento ativo por mais de 60 dias sem conversao deve gerar alerta de ciclo longo.

Resultado esperado:
- indicador visivel;
- filtro disponivel;
- lideranca consegue revisar.

### LOR-044 - Lead ativo sem proxima acao

Lead ativo sem proxima acao deve gerar alerta operacional.

Status dispensados:
- convertido;
- perdido;
- desqualificado;
- nutricao_campanha.

## 10. Indicadores da Mesa Operacional

Indicadores principais:
- atender hoje;
- atrasados;
- backlog;
- em analise de lideranca;
- concluidos hoje;
- convertidos hoje;
- leads ativos com mais de 60 dias;
- leads sem proxima acao;
- taxa de conversao acumulada;
- taxa por origem/campanha;
- tempo medio ate primeiro contato;
- tempo medio ate conversao.

Indicadores devem ser clicaveis quando possivel.

## 11. Movimentacao do lead

Acoes permitidas:
- registrar_contato;
- sem_resposta;
- continuar_atendimento;
- agendamento_realizado;
- cliente_convertido;
- enviar_analise_lideranca;
- perdido;
- desqualificado;
- nutricao_campanha;
- voltar_para_atendimento.

Regras:
- toda acao gera historico;
- toda acao fecha, atualiza ou cria proxima acao;
- lead nao fica sem proxima acao, exceto em status final/frio;
- movimentacao critica nao pode ser apenas visual no frontend;
- backend e dono do ciclo de vida.

## 12. Conversao

### LOR-050 - Taxa de conversao

Regra inicial:
- convertido conta como conversao;
- perdido conta contra conversao;
- desqualificado pode ser excluido quando for falta de perfil;
- nutricao_campanha deve ser reportado separadamente.

## 13. Protocolo de mudanca

Mudancas nos itens abaixo exigem atualizacao deste contrato e da matriz de testes:
- status do lead;
- tipos de item de acao;
- outcomes;
- regras de lideranca;
- cadencia de tentativas;
- normalizacao de importacao;
- regras de conversao/perda/desqualificacao;
- alertas operacionais;
- indicadores do dashboard.
