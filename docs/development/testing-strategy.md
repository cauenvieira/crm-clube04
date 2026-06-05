# Testing Strategy

## Objetivo

Manter validacoes locais deterministicas, proporcionais ao risco e alinhadas com a operacao real do Clube04.

Build/lint nao bastam para considerar feature pronta quando ha regra operacional, API, importacao, integracao ou frontend com interacao.

## Principios

- Rodar smoke/verify em sequencia no banco local compartilhado.
- Nao rodar baterias em paralelo no mesmo banco.
- Todo script que escreve dados de teste deve usar `runId` ou marcador seguro.
- Cleanup deve rodar em `finally` quando possivel.
- Cleanup nunca deve usar `TRUNCATE` ou delecao ampla.
- Falhas devem gerar diagnostico curto e acionavel.

## Camadas de validacao

### 1. Build e lint

Objetivo: garantir compilacao e padrao minimo.

```powershell
npm run build
npm run lint
```

### 2. Smoke API

Objetivo: validar fluxo rapido da API e contratos basicos.

```powershell
npm run smoke:api
```

Usar quando alterar backend/API, schema, payload, services, repositories ou contratos REST.

### 3. Verifies operacionais

Objetivo: validar regras de dominio e leituras operacionais.

Exemplos:

```powershell
npm run verify:operational-summary
npm run verify:operational-worklist
npm run verify:lead-operational-cycle
```

Usar quando alterar Jornada do Lead, action items, summary, worklist ou regras de operacao.

### 4. Frontend

Objetivo: validar dashboard no navegador real.

```powershell
npm run verify:dashboard
npm run verify:frontend
```

Obrigatorio quando mudar `apps/web`, layout, interacoes, API key local, telas ou fluxo visual.

### 5. Data cleanliness

Objetivo: garantir que testes e scripts nao deixam residuos indevidos.

```powershell
npm run verify:data-cleanliness
```

Obrigatorio em docs-only dentro deste fluxo de governanca e em qualquer mudanca que escreva dados artificiais.

### 6. Verify all

Bateria completa sequencial para fechamento de mudancas com codigo.

```powershell
npm run verify:all
```

Nao usar como substituto para entender o risco da tarefa; usar como consolidacao final.

## Quando adicionar ou atualizar teste

Adicionar/atualizar teste quando a tarefa mudar:

- contrato de API;
- payload, status code, filtros ou idempotencia;
- status/action/outcome da Jornada do Lead;
- contadores operacionais;
- worklist/summary/dashboard;
- importacao ou remediacao;
- integracao n8n/webhook/worker;
- fluxo visual com impacto operacional.

## Validacao docs-only

Para tarefa exclusivamente documental:

```powershell
git diff --check
npm run verify:data-cleanliness
```

Nao rodar `verify:all` por padrao em docs-only, salvo se a documentacao revelar suspeita de regressao tecnica.

## Relatorio de falha

Informar:

- comando que falhou;
- trecho curto do erro;
- causa provavel;
- arquivo/regiao suspeita;
- proxima acao.

Nao colar logs longos quando a causa estiver clara.

## Relatorio de sucesso

Informar comandos e status OK. Nao colar log completo.

## Definicao de pronto

Uma tarefa tecnica so esta pronta quando:

- comportamento implementado;
- validacao proporcional executada;
- docs atualizados quando necessario;
- data-cleanliness preservado;
- git diff revisado;
- sem dados reais/segredos no Git.
