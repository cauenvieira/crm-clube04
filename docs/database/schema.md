# Schema do Banco de Dados

Este documento descreve o schema inicial do PostgreSQL para o Clube04 CRM.

As migrations ficam em `infra/db/migrations`. O ambiente Docker inicializa o banco executando `infra/db/001_apply_migrations.sql`, montado na raiz de `/docker-entrypoint-initdb.d/`, que chama as migrations versionadas.

## Padroes

- Chaves primarias usam UUID com `gen_random_uuid()`.
- Tabelas operacionais usam `created_at` e `updated_at` quando ha edicao esperada.
- O campo `updated_at` e atualizado por trigger PostgreSQL.
- Dados importados do sistema oficial ficam separados dos registros preenchidos pela equipe.
- Payloads brutos ficam em `raw_imports` para auditoria.

## Tabelas

### contacts

Pessoa identificada por telefone. Pode ser lead, cliente ou ambos.

Campos principais: nome, telefone, telefone normalizado, email, origem, id externo no sistema Clube04, tipo e observacoes.

Indice importante: `contacts_normalized_phone_uidx`, unico quando `normalized_phone` existe.

### leads

Oportunidade comercial antes da conversao.

Guarda pet informado no contato inicial, interesse, campanha, responsavel, status comercial, qualificacao, tentativas e proxima acao.

Status permitidos: `novo_lead`, `em_atendimento`, `aguardando_resposta`, `em_negociacao`, `agendado`, `compareceu`, `nao_compareceu`, `perdido`, `desqualificado`, `reativar_depois`.

### conversations

Agrupa mensagens por contato e canal, como WhatsApp.

Guarda canal, provedor, id da conversa no provedor, status, inicio e ultima mensagem.

### messages

Armazena mensagens individuais de forma append-only.

Guarda conversa, contato, provedor, id da mensagem no provedor, direcao, tipo, numeros, corpo, midia, timestamp e payload bruto.

Constraint importante: mensagem unica por `provider + provider_message_id`.

### customers

Cliente/tutor importado do sistema Clube04.

Guarda dados cadastrais importados, sistema de origem, payload bruto e data de importacao.

Constraint importante: cliente unico por `source_system + external_customer_id`.

### pets

Unidade principal de recorrencia do CRM.

Guarda dados do pet, vinculo com cliente e contato, dados importados e frequencia cadastrada. A frequencia cadastrada fica nesta tabela porque o retorno previsto e calculado por pet.

Constraint importante: pet unico por `source_system + external_pet_id`.

### appointments

Agenda futura e historica quando disponivel.

Guarda horario, servico, profissional, status, payload bruto e `content_hash` para evitar atualizacoes desnecessarias.

### services

Atendimentos finalizados ou servicos realizados.

Base para calcular frequencia real, ultima visita e faixas de recorrencia.

### packages

Pacotes de banho, tosa ou outros servicos.

Guarda saldo total, usado e restante, datas de compra e uso, valores e status.

Status permitidos: `ativo`, `perto_de_acabar`, `finalizado`, `nao_renovou`, `parado`, `cancelado`, `desconhecido`.

### crm_interactions

Interacoes registradas pela equipe.

Guarda contato, lead, cliente, pet, tipo de interacao, canal, responsavel, resultado, notas e proxima acao.

### pet_crm_status

Status calculado por pet.

Guarda ultima visita, dias desde ultimo atendimento, proxima agenda, frequencia cadastrada, frequencia real media/mediana, retorno previsto, atraso, faixa de recorrencia, prioridade e acao recomendada.

Faixas permitidas: `0-30`, `31-60`, `61-90`, `+90`.

### action_items

Fila materializada da Acao do Dia.

Guarda tipo, prioridade, vinculos com contato/lead/cliente/pet/pacote, titulo, motivo, acao recomendada, vencimento, status e responsavel.

Status permitidos: `pendente`, `em_andamento`, `concluido`, `ignorado`, `reagendado`.

### sync_state

Controle de sincronizacao incremental por fonte.

Guarda fonte, ultima tentativa, ultimo sucesso, cursor, janela de datas, status e erro.

### sync_logs

Historico de execucao de jobs.

Guarda nome do job, fonte, inicio, fim, status, contadores de registros e metadados.

### raw_imports

Payload bruto de importacoes ou scraping autorizado.

Guarda fonte, tipo de entidade, id externo, hash de conteudo, payload bruto, status de processamento e erro.
