# Normalizacao da Importacao de Leads

## 1. Objetivo

Este documento define como planilhas legadas da Jornada do Lead entram no modelo operacional do CRM.

A importacao deve seguir:
- docs/product/lead-operational-contract.md
- docs/qa/lead-business-rules-test-matrix.md

Nenhuma importacao deve criar estados operacionais que violem o contrato do lead.

## 2. Principios

- Normalizar antes de inserir.
- Preservar dado original quando util para auditoria.
- Rejeitar ou quarentenar registros invalidos.
- Evitar duplicidade ativa por telefone.
- Criar itens de acao conforme o estado mapeado.
- Nao transformar ambiguidade da planilha em status final sem regra clara.

## 3. Mapeamento de campos

### IMP-001 - Telefone

Regras:
- remover caracteres nao numericos;
- se tiver 10 ou 11 digitos, prefixar 55;
- se tiver 12 ou 13 digitos e iniciar com 55, manter;
- caso contrario, rejeitar ou enviar para relatorio de invalidos.

### IMP-002 - Nome do tutor vazio

Regras:
- se telefone for valido e nome vazio, importar como "Sem nome";
- registrar observacao de dado incompleto;
- nao bloquear importacao apenas por nome ausente.

### IMP-003 - Pet

Regras:
- se existir, importar;
- se estiver vazio, manter vazio/null;
- falta de pet nao bloqueia lead com telefone valido.

### IMP-004 - Origem

Regras:
- preservar origem bruta quando possivel;
- normalizar valores comuns para relatorio.

Normalizacao sugerida:
- facebook, facebok, faceboo, facebookk, fcebook -> facebook;
- instagram, instagram(seguidor), instagram seguidor -> instagram;
- trafego pago (facebook) -> trafego_pago_facebook;
- trafego pago (instagram) -> trafego_pago_instagram;
- indicacao -> indicacao;
- fachada -> fachada;
- unknown, vazio, nao informado -> unknown;
- others, outros, outro -> outro.

### IMP-005 - Campanha

Regras:
- preservar campanha bruta;
- campanha vazia e permitida;
- normalizacao pode ser adicionada depois.

### IMP-006 - Data de entrada

Regras:
- usar data original quando valida;
- se invalida/vazia, usar data da importacao e marcar origem ausente;
- preservar valor bruto em auditoria quando possivel.

### IMP-007 - Proxima acao

Regras:
- data valida futura/atual: criar fazer_follow_up;
- vencida ate 7 dias: categoria atrasado;
- vencida acima de 7 dias: categoria backlog;
- vazia com lead ativo: criar retomar_atendimento;
- status final/frio: nao criar acao diaria.

### IMP-008 - Responsavel

Regras:
- importar quando existir;
- se vazio, manter sem responsavel ou usar padrao futuro;
- nao inventar nome.

## 4. De-para de status

| Valor legado | Status CRM | Item de acao | Observacoes |
|---|---|---|---|
| novo | novo_lead | atender_hoje | Primeiro contato |
| sem retorno | aguardando_resposta | retomar_atendimento ou fazer_follow_up | Depende da ultima tentativa/data |
| retorno agendado | em_atendimento | fazer_follow_up | Usa data de proxima acao |
| em conversa | em_atendimento | fazer_follow_up | Exige proxima acao |
| aguardando resposta | aguardando_resposta | fazer_follow_up | Cadencia controlada pelo sistema |
| agendado | agendado | none | Sai da fila diaria de lead |
| convertido | convertido | none | Final da Jornada do Lead |
| perdido | perdido | none | Exige motivo quando disponivel |
| fora do perfil | desqualificado | none | Exige motivo quando disponivel |
| frio | nutricao_campanha | none | Nao consome energia diaria |
| vazio/desconhecido | em_atendimento | retomar_atendimento | Recuperacao conservadora |

## 5. Geracao de item operacional

### IMP-020 - Lead ativo importado nao pode ficar sem acao

Estados ativos sem proxima acao devem criar retomar_atendimento:
- novo_lead;
- em_atendimento;
- aguardando_resposta.

### IMP-021 - Lead final/frio nao entra na fila diaria

Estados abaixo nao criam item diario:
- convertido;
- perdido;
- desqualificado;
- nutricao_campanha.

### IMP-022 - Analise de lideranca na importacao

Se a planilha indicar claramente necessidade de lideranca, criar revisar_lideranca.

Se for ambiguo, importar como retomar_atendimento.

## 6. Deduplicacao

### IMP-030 - Duplicidade ativa por telefone

Se telefone normalizado ja possui lead ativo:
- nao criar outro lead ativo;
- anexar auditoria/importacao quando necessario;
- preservar fluxo ativo existente.

### IMP-031 - Duplicidade historica por telefone

Se telefone possui apenas leads finais/frios:
- criar novo lead apenas se a linha representar nova oportunidade;
- caso contrario, preservar como historico/auditoria.

## 7. Registros invalidos

Codigos de motivo:
- invalid_phone;
- missing_phone;
- invalid_entry_date;
- invalid_next_action_date;
- duplicate_active_lead;
- unsupported_status;
- insufficient_data.

Relatorios com dados reais devem ficar fora do Git.

## 8. Verificacao da importacao

Toda importacao deve produzir:
- linhas lidas;
- contatos criados;
- leads criados;
- duplicados ativos ignorados;
- registros invalidos;
- total por status mapeado;
- total por item de acao;
- amostra de invalidos sem dados pessoais desnecessarios.
