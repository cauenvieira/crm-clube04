# Lead Spreadsheet Diagnostics

## Objetivo

Diagnosticar a planilha manual de Jornada do Lead antes de qualquer importacao real para o CRM.
Nesta etapa, o processo e somente leitura e gera relatorio local no terminal.

## Relacao com o modulo Jornada do Lead

- A planilha representa o fluxo operacional atual de captacao e follow-up.
- O diagnostico v1 identifica qualidade de dados, status e duplicidades.
- O resultado orienta o desenho da importacao futura do modulo Jornada do Lead.

## Aba considerada

- Apenas a primeira aba operacional: `Jornada do Lead`.
- As demais abas sao ignoradas nesta v1 de diagnostico.

## Colunas mapeadas para diagnostico

- Tutor
- Telefone
- Metodo entrada
- Entrada lead
- Atendente
- Status Atendimento
- Data atendimento
- Tentativa numero
- Proxima acao
- Data Prox Acao
- Observacao
- Data da Analise
- Qualificado?
- Contato Estabelecido?
- Motivo Macro
- Motivo Micro
- Obs
- Conclusao da analise
- Excluir contato
- Observacao final

## Campos ignorados nesta v1

- Abas nao operacionais/legadas.
- Qualquer processo de escrita em banco/API.
- Qualquer decisao automatica de conversao de status.
- Qualquer remocao de contato via regra da planilha.

## Regras de normalizacao propostas (somente diagnostico)

1. Telefone:
   - remover caracteres nao numericos;
   - se tiver 10 ou 11 digitos, prefixar `55`;
   - usar forma normalizada apenas para contagem de unicidade/duplicidade.
2. Texto categorial:
   - `trim`;
   - `lowercase`;
   - normalizacao basica para comparar categorias;
   - preservar valor original nos exemplos exibidos.
3. Datas:
   - aceitar formatos textuais e serial numerico do Excel;
   - reportar invalidas e suspeitas para limpeza posterior.

## Riscos conhecidos

- Header pode nao estar na primeira linha visual da aba.
- Colunas com nomes parecidos podem gerar ambiguidade de mapeamento.
- Datas em formatos mistos podem distorcer min/max sem saneamento.
- Telefone sem DDI/DDD consistente reduz confianca de deduplicacao.

## Decisao desta etapa

- Nao importar direto para o CRM nesta v1.
- Executar apenas diagnostico local e preparar regras de importacao controlada.

## Proximos passos para importacao real

1. Congelar dicionario de colunas e status aceitos.
2. Definir parser definitivo de data/telefone com testes.
3. Criar dry-run de importacao com preview de upsert.
4. Validar amostra com lideranca antes de primeira carga historica.
5. Implementar importador com logs, auditoria e rollback operacional.
