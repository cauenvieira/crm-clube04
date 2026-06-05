# ChatGPT Project Sources

## Objetivo

Manter uma pasta no Google Drive com um espelho automatico dos arquivos Markdown versionados do projeto CRM Clube04.

O repositorio Git continua sendo a fonte de verdade.

## Estrutura no Google Drive

```text
Contextos CHATGPT/CRM Clube04/Fontes ChatGPT/
  repo-docs/
  dados-sensiveis/
```

Link da pasta:

```text
https://drive.google.com/drive/folders/10sGqCPw1Sef7JM2cclREeUGLAgcaXSTs?usp=sharing
```

## Pasta sincronizada automaticamente

```text
Contextos CHATGPT/CRM Clube04/Fontes ChatGPT/repo-docs
```

Esta pasta e atualizada pelo GitHub Actions usando rclone.

Ela contem apenas:

- arquivos `.md` rastreados pelo Git;
- estrutura de pastas preservada;
- `PROJECT_CONTEXT_INDEX.md` gerado automaticamente.

Nao colocar arquivos manuais nessa pasta, porque o sync pode remove-los.

## Pasta manual para dados sensiveis

```text
Contextos CHATGPT/CRM Clube04/Fontes ChatGPT/dados-sensiveis
```

Esta pasta fica fora do sync automatico.

A planilha de leads pode ser copiada manualmente para esta pasta quando for necessario consultar no ChatGPT.

Tratar todo arquivo nessa pasta como dado sensivel. Nao versionar.

## Fluxo

1. Push na branch `main`.
2. GitHub Actions monta `.chatgpt-sources`.
3. O script inclui somente arquivos `*.md` rastreados pelo Git.
4. A estrutura de pastas do repositorio e preservada.
5. `PROJECT_CONTEXT_INDEX.md` e gerado automaticamente.
6. rclone sincroniza `.chatgpt-sources` com `repo-docs`.
7. ChatGPT usa `repo-docs` como fonte de consulta do projeto.

## Arquivos do sync

- Workflow: `.github/workflows/sync-chatgpt-sources.yml`
- Script: `scripts/sync-chatgpt-sources/build-chatgpt-sources.mjs`
- Pasta temporaria local: `.chatgpt-sources/`
- Indice gerado: `PROJECT_CONTEXT_INDEX.md`

## Escopo do sync

Inclui:
- arquivos `.md` rastreados pelo Git;
- estrutura de pastas original;
- `PROJECT_CONTEXT_INDEX.md`.

Nao inclui:
- planilhas;
- CSV;
- dumps;
- zips;
- logs;
- screenshots;
- `.env`;
- `.tmp`;
- dados reais;
- arquivos nao versionados.

## Fonte no ChatGPT Project

No projeto CRM Clube04 do ChatGPT, adicionar como fonte a pasta do Google Drive:

```text
Contextos CHATGPT/CRM Clube04/Fontes ChatGPT/repo-docs
```

A pasta `dados-sensiveis` deve ser usada apenas quando a planilha de leads for necessaria.

## Verificacao

Para confirmar se o sync esta atualizado, abrir `PROJECT_CONTEXT_INDEX.md` no Drive e verificar:

- data de geracao;
- branch;
- commit;
- lista de arquivos sincronizados.

Se o commit do indice estiver atrasado, verificar GitHub Actions.
