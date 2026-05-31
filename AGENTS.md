# AGENTS.md - Clube04 CRM

## Objetivo

Criar um CRM operacional para o Clube04 Mogi das Cruzes.

O sistema deve:

- receber leads e mensagens do WhatsApp via n8n/WAHA;
- salvar conversas em banco de dados;
- sincronizar dados do sistema Clube04 por scraping autorizado;
- calcular frequencia cadastrada, frequencia real, retorno previsto e atraso;
- controlar clientes por faixa: 0-30, 31-60, 61-90 e +90;
- controlar pacotes ativos, pacotes perto de acabar e pacotes nao renovados;
- gerar uma tela de Acao do Dia para a equipe;
- gerar dashboard operacional e comercial.

## Regras obrigatorias

- Nunca salvar credenciais reais no codigo.
- Usar `.env` para segredos.
- Manter `.env` fora do Git.
- Nao alterar dados no sistema Clube04.
- O scraping deve ser somente leitura.
- Nao cadastrar, cancelar, remarcar ou excluir dados no sistema Clube04.
- Priorizar acesso HTTP direto sem interface grafica.
- Usar Playwright headless apenas quando necessario para login, descoberta ou fallback.
- Priorizar ferramentas open-source.
- Usar Docker Compose para ambiente local.
- Separar dados importados do sistema oficial dos dados preenchidos pela equipe.
- Preservar historico de interacoes, mensagens e alteracoes.

## Stack preferida

- Node.js
- TypeScript, se viavel
- PostgreSQL
- Redis
- Docker Compose
- Express ou Fastify
- Playwright para scraping quando necessario
- n8n para automacoes
- WAHA para WhatsApp
- Interface web simples para MVP

## Modulos do sistema

1. CRM API
2. CRM Web
3. CRM Worker
4. Banco PostgreSQL
5. Redis
6. Integracao n8n
7. Integracao WAHA
8. Scraper Clube04
9. Motor de classificacao CRM
10. Dashboard

## Conceitos principais

### Lead

Pessoa que entrou pelo WhatsApp, Meta, Instagram, indicacao ou outro canal, mas ainda nao virou cliente confirmado.

### Cliente

Tutor ja identificado ou atendido.

### Pet

Unidade principal de recorrencia. A frequencia deve ser calculada por pet, nao apenas por tutor.

### Frequencia cadastrada

Frequencia ideal definida manualmente pela equipe ou inferida pelo pacote.

### Frequencia real

Frequencia media calculada a partir dos atendimentos finalizados importados do sistema Clube04.

### Retorno previsto

Ultima visita + frequencia cadastrada. Se nao houver frequencia cadastrada, usar frequencia real. Se nao houver historico suficiente, usar padrao de 30 dias.

### Pacotes

Controlar pacotes ativos, saldo restante, pacote parado, pacote perto de acabar e pacote finalizado sem renovacao.

## Tela principal

A tela mais importante e "Acao do Dia".

Ela deve mostrar:

- leads novos;
- leads com proxima acao vencida;
- clientes com retorno vencido;
- clientes sem proximo agendamento;
- clientes com pacote ativo sem agenda;
- clientes com pacote perto de acabar;
- clientes com pacote finalizado sem renovacao;
- clientes 61-90 dias;
- clientes +90 dias.

## Estrategia de sincronizacao

- Fazer carga historica inicial uma unica vez.
- Depois usar sincronizacao incremental.
- Usar janelas moveis:
  - agenda: hoje ate D+30;
  - atendimentos: D-7 ate hoje;
  - pacotes: ativos, usados recentemente e perto de acabar;
  - mensagens WhatsApp: eventos em tempo real via webhook.
- Usar upsert.
- Usar hash de conteudo para evitar atualizacao desnecessaria.
- Usar tabela sync_state para controlar ultima execucao.
- Nao reprocessar tudo diariamente.

## Desenvolvimento

- Trabalhar em etapas pequenas.
- Nao implementar tudo de uma vez.
- Criar testes ou dados mockados antes de depender do sistema real.
- Sempre explicar alteracoes relevantes.
- Sempre manter o projeto executavel com Docker Compose.

## Organizacao de codigo

- Manter mudancas pequenas, incrementais e com escopo limitado.
- Evitar arquivos de codigo acima de 250 a 300 linhas; se passar disso, propor divisao antes de continuar.
- Evitar funcoes longas ou com responsabilidades misturadas.
- Evitar arquivos genericos como `utils.ts`; preferir utilitarios com proposito claro, como `phone.ts`, `sql.ts` ou `api-error.ts`.
- `routes` devem conter apenas validacao de entrada, chamada de servico e formatacao simples de resposta.
- `routes` nao devem conter SQL direto.
- `routes` nao devem conter regra de negocio complexa.
- `services` concentram regra de negocio, orquestracao entre repositorios e decisoes de fluxo.
- `repositories` concentram acesso ao banco, SQL, queries e detalhes de persistencia.
- `validation` ou `schemas` concentram validacao de payload, params e query string.
- `config` concentra leitura e normalizacao de variaveis de ambiente.
- `plugins` ou middlewares concentram hooks de Fastify, seguranca interna e comportamento transversal.
- `integrations` concentram comunicacao com sistemas externos como Clube04, n8n e WAHA.
- `worker` deve rodar jobs segmentados por dominio e nao virar monolito.
- `packages/shared` deve conter apenas tipos e utilitarios realmente compartilhados entre apps.
- Logs e erros devem ser claros, controlados e faceis de rastrear por modulo.
