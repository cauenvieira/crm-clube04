\# AGENTS.md — Clube04 CRM



\## Objetivo



Criar um CRM operacional para o Clube04 Mogi das Cruzes.



O sistema deve:

\- receber leads e mensagens do WhatsApp via n8n/WAHA;

\- salvar conversas em banco de dados;

\- sincronizar dados do sistema Clube04 por scraping autorizado;

\- calcular frequência cadastrada, frequência real, retorno previsto e atraso;

\- controlar clientes por faixa: 0-30, 31-60, 61-90 e +90;

\- controlar pacotes ativos, pacotes perto de acabar e pacotes não renovados;

\- gerar uma tela de Ação do Dia para a equipe;

\- gerar dashboard operacional e comercial.



\## Regras obrigatórias



\- Nunca salvar credenciais reais no código.

\- Usar `.env` para segredos.

\- Manter `.env` fora do Git.

\- Não alterar dados no sistema Clube04.

\- O scraping deve ser somente leitura.

\- Não cadastrar, cancelar, remarcar ou excluir dados no sistema Clube04.

\- Priorizar acesso HTTP direto sem interface gráfica.

\- Usar Playwright headless apenas quando necessário para login, descoberta ou fallback.

\- Priorizar ferramentas open-source.

\- Usar Docker Compose para ambiente local.

\- Separar dados importados do sistema oficial dos dados preenchidos pela equipe.

\- Preservar histórico de interações, mensagens e alterações.



\## Stack preferida



\- Node.js

\- TypeScript, se viável

\- PostgreSQL

\- Redis

\- Docker Compose

\- Express ou Fastify

\- Playwright para scraping quando necessário

\- n8n para automações

\- WAHA para WhatsApp

\- Interface web simples para MVP



\## Módulos do sistema



1\. CRM API

2\. CRM Web

3\. CRM Worker

4\. Banco PostgreSQL

5\. Redis

6\. Integração n8n

7\. Integração WAHA

8\. Scraper Clube04

9\. Motor de classificação CRM

10\. Dashboard



\## Conceitos principais



\### Lead



Pessoa que entrou pelo WhatsApp, Meta, Instagram, indicação ou outro canal, mas ainda não virou cliente confirmado.



\### Cliente



Tutor já identificado ou atendido.



\### Pet



Unidade principal de recorrência. A frequência deve ser calculada por pet, não apenas por tutor.



\### Frequência cadastrada



Frequência ideal definida manualmente pela equipe ou inferida pelo pacote.



\### Frequência real



Frequência média calculada a partir dos atendimentos finalizados importados do sistema Clube04.



\### Retorno previsto



Última visita + frequência cadastrada. Se não houver frequência cadastrada, usar frequência real. Se não houver histórico suficiente, usar padrão de 30 dias.



\### Pacotes



Controlar pacotes ativos, saldo restante, pacote parado, pacote perto de acabar e pacote finalizado sem renovação.



\## Tela principal



A tela mais importante é "Ação do Dia".



Ela deve mostrar:

\- leads novos;

\- leads com próxima ação vencida;

\- clientes com retorno vencido;

\- clientes sem próximo agendamento;

\- clientes com pacote ativo sem agenda;

\- clientes com pacote perto de acabar;

\- clientes com pacote finalizado sem renovação;

\- clientes 61-90 dias;

\- clientes +90 dias.



\## Estratégia de sincronização



\- Fazer carga histórica inicial uma única vez.

\- Depois usar sincronização incremental.

\- Usar janelas móveis:

&#x20; - agenda: hoje até D+30;

&#x20; - atendimentos: D-7 até hoje;

&#x20; - pacotes: ativos, usados recentemente e perto de acabar;

&#x20; - mensagens WhatsApp: eventos em tempo real via webhook.

\- Usar upsert.

\- Usar hash de conteúdo para evitar atualização desnecessária.

\- Usar tabela sync\_state para controlar última execução.

\- Não reprocessar tudo diariamente.



\## Desenvolvimento



\- Trabalhar em etapas pequenas.

\- Não implementar tudo de uma vez.

\- Criar testes ou dados mockados antes de depender do sistema real.

\- Sempre explicar alterações relevantes.

\- Sempre manter o projeto executável com Docker Compose.

