# Codex Workflow (Compacto)

Guia rapido para abrir tarefas com menos tokens e manter validacao consistente, sem perder qualidade tecnica.


## Principio

Economizar tokens significa reduzir repeticao e ruido, nao omitir decisao tecnica importante.

Nunca resumir demais:

- decisoes tecnicas relevantes;
- riscos;
- erros encontrados;
- contornos aplicados;
- mudancas de contrato/API;
- mudancas em schema, auth, docker, n8n, scraping, dados ou integracoes.

## 1) Prompt curto para tarefa nova

Use este formato:

- Ler: lista curta de docs obrigatorios.
- Objetivo: 1 frase.
- Escopo permitido: arquivos/pastas.
- Nao alterar: itens fora de escopo.
- Validacao obrigatoria: preferir `npm run verify:all`.
- Saida esperada: formato curto de relatorio.

Exemplo:

```text
Leia AGENTS.md, README.md e docs/web/dashboard.md.
Objetivo: ajustar UX do dashboard sem mudar endpoints.
Escopo: apps/web/public/* e docs/web/dashboard.md.
Nao alterar: schema, docker-compose, n8n.
Validacao: npm run verify:all.
Relatorio: arquivos alterados + decisoes + validacoes + riscos.
```

## 2) Como reportar sucesso sem logs longos

- Mostrar comando + status resumido.
- Exemplo:
  - `npm run verify:all`: OK
  - `git status`: 3 arquivos alterados
- Nao colar log completo quando tudo passou.
- Mesmo em relatorio compacto, informar decisoes, riscos e problemas encontrados quando existirem.

## 3) Como reportar falha

- Mostrar o comando que falhou.
- Colar apenas o trecho exato do erro.
- Explicar causa provavel e contorno aplicado.

## 4) Quando usar git diff, git diff --stat ou ZIP

- Padrao: `git diff --stat` + lista de arquivos.
- `git diff` detalhado: apenas quando pedido ou bug complexo.
- ZIP/revisao completa: somente em caso sensivel (schema/auth/docker/n8n) ou quando solicitado.

## 5) Validacao visual

- Sempre tentar validar com browser tooling (Chrome/computer-use).
- Para dashboard/frontend:
  - sem chave
  - chave invalida
  - chave valida
  - estado de listas/cards
  - acoes e feedback
  - overflow horizontal

## 6) Screenshot/appshot e fallback

- Tentar screenshot/appshot quando possivel.
- Nao versionar imagens.
- Se salvar localmente, usar `.tmp/`.
- Se screenshot falhar por limite tecnico, usar fallback estrutural:
  - pagina carregou
  - estados testados
  - contagens de cards/listas
  - botoes visiveis
  - `hasHorizontalOverflow=false`
  - mensagens de erro/sucesso observadas

## 7) Sequencia obrigatoria antes de entrega

- Rodar `npm run verify:all` em sequencia (sem paralelo).
- Depois rodar `git diff` (ou `git diff --stat`) e `git status`.
