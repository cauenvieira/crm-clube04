# Normalizacao da Importacao de Leads

## Papel na hierarquia

Este documento e a fonte de verdade especifica para importar planilhas legadas da Jornada do Lead para o CRM.

Autoridade:

1. `docs/product/lead-operational-contract.md`
2. `docs/product/lead-import-normalization.md`
3. `docs/qa/lead-business-rules-test-matrix.md`

Nenhuma importacao deve criar status, action item, outcome, indicador ou cadencia que viole o contrato operacional.

## Objetivo

Transformar a planilha manual de leads em registros operacionais seguros, auditaveis e acionaveis no CRM Clube04.

A importacao deve:

- preservar a disciplina diaria de atendimento;
- reduzir backlog manual sem inventar regra operacional;
- proteger a base contra duplicidade ativa por telefone;
- separar dado invalido, ambiguo ou sensivel;
- manter rastreabilidade de origem, linha e decisao de normalizacao;
- gerar ou preservar proxima acao quando o lead exigir atuacao.

## Escopo

Inclui:

- leads vindos da planilha `Jornada do Lead`;
- contatos minimos a partir de telefone;
- snapshot inicial de contexto operacional;
- action items necessarios para a fila;
- relatorios de dry-run, apply e invalidos.

Nao inclui:

- importacao de clientes reais como verdade definitiva;
- criacao automatica de pets, pacotes, agenda ou servicos;
- reconstrucao completa de historico WhatsApp;
- exclusao de contatos;
- escrita fora do banco local/dev sem tarefa propria;
- versionamento de XLSX, CSV, dumps ou relatorios com dados reais.

## Principios

- Dry-run antes de apply.
- Apply somente com confirmacao explicita.
- Normalizar antes de inserir.
- Preservar dado bruto apenas em local seguro e permitido.
- Rejeitar ou quarentenar registros invalidos.
- Nao transformar ambiguidade em conclusao final.
- Lead ativo nao deve ficar sem proxima acao.
- Lead final ou frio nao deve entrar na fila diaria.
- Telefone normalizado e chave operacional inicial, nao identidade perfeita.
- Relatorios com dados reais ficam fora do Git.

## Vocabulario canonico

### Status operacionais

Usar os status do contrato operacional:

- `novo_lead`
- `em_atendimento`
- `aguardando_resposta`
- `agendado`
- `convertido`
- `perdido`
- `desqualificado`
- `nutricao_campanha`
- `revisar_lideranca`
- `arquivado_nao_contatar`

### Tipos principais de action item

- `atender_hoje`
- `fazer_follow_up`
- `retomar_atendimento`
- `validar_agendamento`
- `revisar_lideranca`
- `nutricao_campanha`

### Labels legados proibidos como destino novo

Estes nomes podem aparecer em docs antigos, relatorios ou scripts legados, mas nao devem ser usados como nova fonte de regra:

- `convertido_cliente`
- `sem_retorno`
- `revisao_lideranca`
- `revisao_manual`
- `validar_conversao`

Mapeamento conceitual:

| Label legado | Interpretacao atual |
|---|---|
| `convertido_cliente` | `convertido`, quando confirmado por regra valida |
| `sem_retorno` | `aguardando_resposta` ou `retomar_atendimento`, conforme contexto |
| `revisao_lideranca` | `revisar_lideranca` |
| `revisao_manual` | invalidos/quarentena/revisao de importacao, nao status operacional |
| `validar_conversao` | etapa tecnica de crosscheck, nao fila operacional final |
| `nao_contatar` / `bloqueado` | `arquivado_nao_contatar`, quando houver sinal seguro de opt-out |

Observacao tecnica: se o schema fisico ainda usa enums de compatibilidade, a camada de servico/adaptador deve mapear para o banco sem alterar o vocabulario operacional dos docs.

## Mapeamento de campos

| Campo da planilha | Destino conceitual | Regra |
|---|---|---|
| Tutor | `contacts.name` | Se vazio e telefone valido, usar `Sem nome` e registrar incompleto. |
| Telefone | `contacts.normalized_phone` | Campo minimo para importacao. |
| Metodo entrada | `leads.source` / `sourceDetail` | Preservar valor bruto e normalizar para relatorio. |
| Entrada lead | data de entrada / metadata | Usar se valida; se invalida, registrar motivo. |
| Atendente | `assigned_to` | Importar texto quando existir; nao inventar responsavel. |
| Status Atendimento | status operacional | Aplicar de-para canonico. |
| Data atendimento | ultima interacao importada | Usar apenas se valida. |
| Tentativa numero | contador legado | Preservar como dado legado; contador definitivo vem de interacoes. |
| Proxima acao | action item | Aplicar de-para canonico. |
| Data Prox Acao | `next_action_at` / `due_at` | Validar por data operacional local. |
| Observacao | interaction/metadata | Preservar contexto sem expor dado real em Git. |
| Analise de lideranca | regra auxiliar | Nao basta sozinha; exige criterio critico. |
| Excluir contato | alerta de importacao | Nunca apagar contato automaticamente. |

## Normalizacao

### IMP-001 - Telefone

Regras:

1. Remover caracteres nao numericos.
2. Se tiver 10 ou 11 digitos, prefixar `55`.
3. Se tiver 12 ou 13 digitos e iniciar com `55`, manter.
4. Caso contrario, rejeitar ou enviar para invalidos.
5. Telefone valido nao prova que e a mesma pessoa em telefones compartilhados.

Motivos possiveis:

- `missing_phone`
- `invalid_phone`
- `duplicate_active_lead`
- `shared_phone_conflict`

### IMP-002 - Nome do tutor

Regras:

- telefone valido com nome vazio pode importar como `Sem nome`;
- registrar observacao de dado incompleto;
- nome vazio nao deve bloquear lead com telefone valido;
- nomes conflitantes no mesmo telefone podem ir para revisao de importacao.

### IMP-003 - Pet

Regras:

- importar quando existir;
- manter vazio/null quando ausente;
- falta de pet nao bloqueia lead com telefone valido;
- pet nao deve ser usado como chave primaria de deduplicacao.

### IMP-004 - Origem

Normalizacao sugerida:

| Valor bruto | Valor normalizado |
|---|---|
| facebook, facebok, faceboo, facebookk, fcebook | `facebook` |
| instagram, instagram(seguidor), instagram seguidor | `instagram` |
| trafego pago (facebook) | `trafego_pago_facebook` |
| trafego pago (instagram) | `trafego_pago_instagram` |
| indicacao | `indicacao` |
| fachada | `fachada` |
| vazio, unknown, nao informado | `unknown` |
| outro, outros, others | `outro` |

Preservar o valor bruto em auditoria quando permitido.

### IMP-005 - Campanha

Regras:

- campanha vazia e permitida;
- preservar valor bruto;
- normalizacao de campanha pode evoluir depois, sem bloquear importacao.

### IMP-006 - Datas

Regras:

- interpretar datas pela data operacional local `America/Sao_Paulo`;
- aceitar formatos definidos no parser;
- data invalida nao deve gerar vencimento falso;
- preservar valor bruto em relatorio local;
- se data de entrada invalida, usar data da importacao apenas como fallback tecnico e registrar motivo.

Motivos possiveis:

- `invalid_entry_date`
- `invalid_next_action_date`
- `next_action_before_entry_date`

## De-para de status

| Valor legado | Status operacional | Action item inicial | Observacoes |
|---|---|---|---|
| novo / em espera | `novo_lead` | `atender_hoje` | Primeiro atendimento. |
| em atendimento / em conversa | `em_atendimento` | `fazer_follow_up` ou `retomar_atendimento` | Depende de data e contexto. |
| aguardando resposta / sem retorno | `aguardando_resposta` | `fazer_follow_up` ou `retomar_atendimento` | Cadencia controlada pelo sistema. |
| agendado / agendamento realizado | `agendado` | `validar_agendamento` | Sai da fila comum e exige validacao de desfecho. |
| convertido / pagamento confirmado / cliente confirmado | `convertido` | none | Exige confirmacao por regra valida. |
| perdido / sem interesse | `perdido` | none | Exige motivo quando disponivel. |
| fora do perfil / dados invalidos definitivos | `desqualificado` | none | Exige motivo quando disponivel. |
| frio / campanha futura | `nutricao_campanha` | none | Nao consome fila diaria. |
| analise lideranca com criterio critico | `revisar_lideranca` | `revisar_lideranca` | Exige justificativa. |
| nao contatar / bloqueou / opt-out | `arquivado_nao_contatar` | none | Exige sinal seguro e motivo. |
| vazio/desconhecido | `em_atendimento` ou invalidos | `retomar_atendimento` ou quarentena | Escolha conservadora; nao concluir automaticamente. |

## Geracao de action item

### IMP-020 - Lead ativo nao pode ficar sem acao

Status ativos que exigem acao:

- `novo_lead`
- `em_atendimento`
- `aguardando_resposta`
- `agendado`
- `revisar_lideranca`

Regra:

- se ha data valida futura/hoje: criar `fazer_follow_up`;
- se data vencida ate 7 dias: classificar como atrasado;
- se data vencida acima de 7 dias: classificar como backlog;
- se nao ha data e o lead esta ativo: criar `retomar_atendimento`;
- se e lead novo: criar/expor `atender_hoje`.

### IMP-021 - Lead final ou frio nao entra na fila diaria

Status abaixo nao criam item diario comum:

- `convertido`
- `perdido`
- `desqualificado`
- `nutricao_campanha`
- `arquivado_nao_contatar`

### IMP-022 - Lideranca na importacao

`revisar_lideranca` so deve ser criado quando houver criterio critico, como:

- telefone duplicado com nomes conflitantes;
- conflito forte com base de cliente;
- tentativa muito alta sem conversao;
- observacao com sinal critico;
- impossibilidade real de classificar com seguranca.

Se a planilha indicar lideranca sem criterio critico, importar como `retomar_atendimento` ou quarentena de importacao, conforme seguranca do caso.

## Crosscheck de conversao

`Pessoa.csv` pode ser usado como fonte inicial de apoio para confirmar conversao por telefone.

Regras:

1. Telefone encontrado em `Pessoa.csv` nao prova sozinho que o lead converteu naquela jornada.
2. Conversao exige combinacao entre sinal da planilha e crosscheck valido.
3. Quando confirmado, status operacional e `convertido`.
4. Quando a planilha indica conclusao/pagamento, mas nao ha confirmacao segura, o lead nao deve ser encerrado automaticamente.
5. `validar_conversao` pode existir como etapa tecnica de dry-run, mas nao como fila operacional final.

## Deduplicacao

### IMP-030 - Duplicidade ativa por telefone

Se telefone normalizado ja possui lead ativo:

- nao criar outro lead ativo;
- anexar auditoria/importacao quando necessario;
- preservar fluxo ativo existente;
- sinalizar duplicidade no relatorio.

### IMP-031 - Duplicidade historica por telefone

Se telefone possui apenas leads finais/frios:

- criar novo lead apenas se a linha representar nova oportunidade;
- caso contrario, preservar como historico/auditoria;
- evitar reabrir lead final sem regra clara.

## Invalidos e quarentena

Motivos canonicos:

- `missing_phone`
- `invalid_phone`
- `invalid_entry_date`
- `invalid_next_action_date`
- `next_action_before_entry_date`
- `duplicate_active_lead`
- `shared_phone_conflict`
- `unsupported_status`
- `unsupported_next_action`
- `insufficient_data`
- `unsafe_conversion`
- `manual_review_required`

Relatorios com dados reais devem ficar fora do Git, preferencialmente em `.tmp/imports`.

## Verificacao obrigatoria

Toda importacao deve produzir, no minimo:

- linhas lidas;
- linhas validas;
- linhas invalidas;
- contatos criados;
- contatos vinculados;
- leads criados;
- leads preservados;
- duplicados ativos ignorados;
- total por status operacional;
- total por action item;
- amostra mascarada de invalidos;
- caminho do relatorio local, quando houver.

Validacoes proporcionais:

```powershell
npm run verify:data-cleanliness
```

Quando houver codigo de importacao:

```powershell
npm run verify:all
```

ou verifies especificos do dominio de importacao, quando existirem.

## Protocolo de mudanca

Qualquer mudanca em de-para, status, criterio de conversao, regra de lideranca, deduplicacao ou fila deve atualizar:

- este documento;
- `docs/product/lead-operational-contract.md`, se alterar comportamento operacional;
- `docs/qa/lead-business-rules-test-matrix.md`, se alterar regra testavel;
- docs em `docs/imports/*` que descrevem comandos e execucao.
