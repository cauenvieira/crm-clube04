# Schema do Banco de Dados

## Papel na hierarquia

Este documento descreve o schema PostgreSQL documentado para o CRM Clube04.

Autoridade:
- Para nomes de tabelas, colunas, enums fisicos e compatibilidade de banco, este documento e a referencia documental.
- A fonte tecnica final continua sendo a migration versionada em `infra/db/migrations`.
- Para comportamento operacional da Jornada do Lead, prevalecem os contratos de produto e a matriz de testes.
- Se houver conflito entre este documento e migration vigente, atualizar este documento ou abrir tarefa de migration.

## Arquivos de schema

Migrations versionadas:
- `infra/db/migrations/001_initial_crm_schema.sql`

Bootstrap local:
- `infra/db/001_apply_migrations.sql`

O ambiente Docker inicializa o banco executando o bootstrap montado em `/docker-entrypoint-initdb.d/`, que chama as migrations versionadas.

## Padroes

- Chaves primarias usam UUID com `gen_random_uuid()`.
- Tabelas operacionais usam `created_at` e `updated_at` quando ha edicao esperada.
- `updated_at` e atualizado por trigger PostgreSQL.
- Dados importados do sistema oficial ficam separados dos registros preenchidos pela equipe.
- Payloads brutos ficam em `raw_imports` para auditoria.
- Campos externos devem preservar `source_system`, ids externos e/ou hash quando aplicavel.
- Dados reais nao devem ser versionados.

## Compatibilidade entre linguagem operacional e enum fisico

Alguns enums fisicos do banco ainda usam nomes de fase anterior. O backend pode expor linguagem operacional mais clara enquanto preserva compatibilidade fisica.

Exemplos documentados:
- outcome operacional `cliente_convertido` pode persistir lead como `compareceu`;
- outcome operacional `nutricao_campanha` pode persistir lead como `reativar_depois`.

Regra:
- nao criar novo status fisico sem migration propria;
- nao alterar regra operacional apenas para se adaptar a nome legado;
- se a compatibilidade ficar confusa, criar tarefa de migration/normalizacao;
- manter `docs/api/rest-api.md`, contrato operacional e matriz de testes alinhados.

## Tabelas

### contacts

Pessoa identificada por telefone. Pode ser lead, cliente ou ambos.

Campos principais:
- nome;
- telefone bruto;
- telefone normalizado;
- email;
- origem;
- id externo no sistema Clube04;
- tipo;
- observacoes.

Indice importante:
- `contacts_normalized_phone_uidx`, unico quando `normalized_phone` existe.

Regras:
- telefone normalizado e chave operacional importante;
- duplicidade ativa por telefone deve ser tratada com cuidado;
- contato nao deve ser confundido com cliente recorrente sem evidencia/importacao.

### leads

Oportunidade comercial antes da conversao.

Guarda:
- pet informado no contato inicial;
- interesse;
- campanha;
- responsavel;
- status comercial;
- qualificacao;
- tentativas;
- proxima acao;
- datas operacionais.

Status fisicos permitidos:
- `novo_lead`
- `em_atendimento`
- `aguardando_resposta`
- `em_negociacao`
- `agendado`
- `compareceu`
- `nao_compareceu`
- `perdido`
- `desqualificado`
- `reativar_depois`

Observacoes:
- `compareceu` e usado atualmente como compatibilidade para conversao/cliente convertido.
- `reativar_depois` e usado atualmente como compatibilidade para nutricao/campanha.
- O contrato operacional da Jornada do Lead define a linguagem de negocio e vence sobre nomenclatura historica.

### conversations

Agrupa mensagens por contato e canal, como WhatsApp.

Guarda:
- canal;
- provedor;
- id da conversa no provedor;
- status;
- inicio;
- ultima mensagem.

### messages

Armazena mensagens individuais de forma append-only.

Guarda:
- conversa;
- contato;
- provedor;
- id da mensagem no provedor;
- direcao;
- tipo;
- numeros;
- corpo;
- midia;
- timestamp;
- payload bruto.

Constraint importante:
- mensagem unica por `provider + provider_message_id`.

### customers

Cliente/tutor importado do sistema Clube04.

Guarda:
- dados cadastrais importados;
- sistema de origem;
- payload bruto;
- data de importacao.

Constraint importante:
- cliente unico por `source_system + external_customer_id`.

### pets

Unidade principal de recorrencia do CRM.

Guarda:
- dados do pet;
- vinculo com cliente e contato;
- dados importados;
- frequencia cadastrada.

Observacao:
- frequencia cadastrada fica nesta tabela porque retorno previsto e calculado por pet.

Constraint importante:
- pet unico por `source_system + external_pet_id`.

### appointments

Agenda futura e historica quando disponivel.

Guarda:
- horario;
- servico;
- profissional;
- status;
- payload bruto;
- `content_hash` para evitar atualizacoes desnecessarias.

### services

Atendimentos finalizados ou servicos realizados.

Uso:
- calcular frequencia real;
- identificar ultima visita;
- alimentar faixas de recorrencia e analises futuras.

### packages

Pacotes de banho, tosa ou outros servicos.

Guarda:
- saldo total;
- usado;
- restante;
- datas de compra e uso;
- valores;
- status.

Status permitidos:
- `ativo`
- `perto_de_acabar`
- `finalizado`
- `nao_renovou`
- `parado`
- `cancelado`
- `desconhecido`

### crm_interactions

Interacoes registradas pela equipe ou pelo sistema.

Guarda:
- contato;
- lead;
- cliente;
- pet;
- tipo de interacao;
- canal;
- responsavel;
- resultado;
- notas;
- proxima acao.

Regra:
- decisoes operacionais relevantes devem gerar historico/auditoria.

### pet_crm_status

Status calculado por pet.

Guarda:
- ultima visita;
- dias desde ultimo atendimento;
- proxima agenda;
- frequencia cadastrada;
- frequencia real media/mediana;
- retorno previsto;
- atraso;
- faixa de recorrencia;
- prioridade;
- acao recomendada.

Faixas permitidas:
- `0-30`
- `31-60`
- `61-90`
- `+90`

### action_items

Fila materializada da Acao do Dia.

Guarda:
- tipo;
- prioridade;
- vinculos com contato/lead/cliente/pet/pacote;
- titulo;
- motivo;
- acao recomendada;
- vencimento;
- status;
- responsavel.

Status permitidos:
- `pendente`
- `em_andamento`
- `concluido`
- `ignorado`
- `reagendado`

Regra:
- action items sao materializacao operacional; nao devem substituir o historico (`crm_interactions`);
- lead ativo nao deve ficar sem proxima acao quando a regra exigir.

### sync_state

Controle de sincronizacao incremental por fonte.

Guarda:
- fonte;
- ultima tentativa;
- ultimo sucesso;
- cursor;
- janela de datas;
- status;
- erro.

### sync_logs

Historico de execucao de jobs.

Guarda:
- nome do job;
- fonte;
- inicio;
- fim;
- status;
- contadores de registros;
- metadados.

### raw_imports

Payload bruto de importacoes ou scraping autorizado.

Guarda:
- fonte;
- tipo de entidade;
- id externo;
- hash de conteudo;
- payload bruto;
- status de processamento;
- erro.

## Politica de mudanca

Criar tarefa propria quando houver:

- nova tabela;
- nova coluna;
- novo enum fisico;
- mudanca de constraint;
- migration de dados;
- alteracao em compatibilidade de status de lead;
- alteracao em deduplicacao por telefone;
- alteracao em idempotencia.

Toda mudanca de schema deve atualizar:
- migration;
- `docs/database/schema.md`;
- `docs/api/rest-api.md`, se afetar payload;
- testes/verify relevantes;
- contrato operacional, quando afetar regra de negocio.
