# Dashboard e Frontend Operacional

## Objetivo

Documentar o dashboard local/dev do CRM Clube04 e orientar sua evolucao para Base de Leads, Mesa Operacional e Resumo Diario.

Este documento descreve UX e comportamento esperado no frontend. Ele nao substitui:

- contrato da Jornada do Lead;
- contrato REST;
- schema do banco;
- matriz de testes.

Quando houver conflito, seguir a hierarquia documental definida em `docs/development/documentation-hierarchy.md`.

## Status atual

O frontend existe como dashboard local/dev servido em:

```text
http://localhost:3000/dashboard
```

Ele deve ser tratado como base tecnica e operacional, nao como tela final aprovada para operacao real.

A tentativa visual anterior de Base de Leads, Mesa Operacional e drawer foi rejeitada e deve ser refeita em sprints pequenas, usando UI Foundation e referencia Lovable apenas como inspiracao visual.

## Tecnologia

- React + TypeScript.
- Vite.
- Bundle gerado em `apps/web/dist`.
- API Fastify serve:
  - `/dashboard`
  - `/dashboard/app.js`
  - `/dashboard/styles.css`
- `apps/web/public` contem o scaffold HTML.
- Sem fallback silencioso para bundle ausente:
  - se `apps/web/dist` nao existir, assets devem falhar de forma explicita.

## Rotas/telas atuais

### Hoje

Objetivo:
- apresentar leitura operacional do dia.

Consome:
- `GET /api/operational-summary`
- `GET /api/operational-worklist?limit=<n>`

Secoes operacionais:
- acoes vencidas;
- acoes pendentes;
- retomar atendimento;
- follow-ups agendados;
- revisao da lideranca;
- novos leads;
- ultimas mensagens inbound.

Acoes por item:
- abrir WhatsApp;
- concluir action item;
- ignorar/cancelar action item.

Regra:
- qualquer conclusao, ignorar ou mudanca critica deve ser enviada ao backend.
- frontend nao deve simular ciclo de vida operacional sem persistencia.

### Novo Lead

Objetivo:
- cadastrar lead manual com disciplina operacional.

Consome:
- `POST /api/manual-leads`
- `GET /api/leads/search` para busca/duplicidade quando aplicavel.

Campos obrigatorios esperados:
- tutor;
- telefone;
- metodo de entrada;
- atendente;
- proxima acao;
- data da proxima acao.

Campos opcionais:
- nome do doguinho;
- raca;
- peso aproximado;
- servico de interesse;
- origem/detalhe;
- campanha;
- observacao inicial.

Resposta deve permitir ao operador entender:
- contato criado ou reaproveitado;
- lead criado ou duplicidade ativa;
- action item criado quando aplicavel.

### Configuracoes

Objetivo:
- configurar API key local para ambiente dev.

Comportamento:
- API key salva somente em `localStorage` local;
- botao limpar remove do navegador;
- nenhum segredo hardcoded no frontend.

Limitacao:
- isso nao e auth produtivo.
- auth real e auditoria ficam para milestone posterior.

## Telas a reconstruir

### Base de Leads

Status:
- proxima tela funcional prioritaria da Milestone 1.

Objetivo:
- substituir parte da planilha de Jornada do Lead por visao sistematizada;
- permitir busca, filtro, conferencia e abertura do acompanhamento;
- preservar rastreabilidade.

Requisitos de UX:
- filtros claros;
- status humanos;
- proxima acao visivel;
- alerta para atrasado/backlog;
- abertura de drawer de acompanhamento;
- sem overflow horizontal.

### Mesa Operacional

Status:
- Milestone 2, apos base inicial da Jornada do Lead.

Objetivo:
- orientar o que a equipe deve fazer hoje;
- separar filas por prioridade operacional;
- reduzir energia em leads frios/finais;
- expor revisao da lideranca quando aplicavel.

Requisitos de UX:
- worklist primeiro;
- metricas de apoio, nao de vaidade;
- acao rapida com registro estruturado;
- lideranca separada de follow-up comum.

### Drawer de acompanhamento

Status:
- parte critica da Base de Leads e Mesa Operacional.

Objetivo:
- concentrar contexto, historico, decisao e proxima acao do lead.

Requisitos de UX:
- resumo do lead no topo;
- status e proxima acao visiveis;
- historico claro;
- outcome estruturado;
- justificativa quando contrato exigir;
- movimento critico sempre via backend.

## Datas e timezone

- exibicao local em `pt-BR` para operacao humana;
- backend segue ISO UTC;
- criterio operacional: `America/Sao_Paulo`;
- nao calcular regra de negocio de prazo apenas no frontend.

## Linguagem de UI

Nao exibir termos internos diretamente:

- `action_item`
- `outcome`
- `snake_case`
- nomes crus de enum
- erros crus de banco

Mapear para termos humanos.

Exemplos:

- `novo_lead` -> `Novo lead`
- `em_atendimento` -> `Em atendimento`
- `aguardando_resposta` -> `Aguardando resposta`
- `revisar_lideranca` -> `Revisao da lideranca`
- `sem_resposta` -> `Sem resposta`
- `nutricao_campanha` -> `Nutricao/campanha`

## Limitacoes atuais

- ambiente local/dev;
- sem login de usuario;
- API key em localStorage;
- sem WAHA real;
- sem permissao por perfil;
- frontend ainda nao representa a experiencia final da operacao.

## Evidencia visual

Ao validar frontend:

1. Abrir `http://localhost:3000/dashboard`.
2. Validar estado sem chave.
3. Validar estado com chave invalida.
4. Validar estado com chave valida.
5. Validar telas Hoje, Novo Lead e Configuracoes.
6. Validar estados vazios, erro, carregamento e sucesso.
7. Validar `hasHorizontalOverflow=false` quando houver browser tooling.
8. Tentar screenshot/appshot quando possivel.

Se screenshot falhar por timeout/CDP, usar fallback estrutural:

- pagina carregou;
- estados testados;
- contagem de cards/listas;
- botoes visiveis;
- mensagens de erro/sucesso observadas;
- `hasHorizontalOverflow=false` quando testavel.

## Verificacao automatizada

Comandos principais:

```powershell
npm run verify:dashboard
npm run verify:frontend
```

`verify:dashboard` deve validar:
- rota do dashboard;
- assets principais;
- strings criticas.

`verify:frontend` deve validar, quando aplicavel:
- carrega `/dashboard`;
- detecta erros de console/page;
- detecta assets 4xx/5xx;
- salva API key e confirma persistencia;
- valida telas Hoje e Novo Lead;
- cria/busca/repete lead manual com idempotencia;
- valida ausencia de overflow horizontal.

## Regra para proximas sprints frontend

Cada sprint de frontend deve declarar:

- milestone;
- tela alvo;
- componentes `components/ui` usados;
- endpoints consumidos;
- regras de negocio consultadas;
- validacoes executadas;
- docs atualizados.

Nao misturar rebuild visual com alteracao de backend, schema ou regra operacional sem tarefa propria.
