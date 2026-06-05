# ChatGPT Project Sources

## Objetivo

Manter uma pasta no Google Drive com um espelho automatico dos arquivos Markdown versionados do projeto CRM Clube04.

O repositorio Git continua sendo a fonte de verdade.

## Estrutura no Google Drive

Contextos CHATGPT/CRM Clube04/Fontes ChatGPT/
- repo-docs/
- dados-sensiveis/

## Pasta sincronizada automaticamente

Contextos CHATGPT/CRM Clube04/Fontes ChatGPT/repo-docs

Esta pasta e atualizada pelo GitHub Actions usando rclone.

Ela deve conter apenas o espelho dos arquivos `.md` versionados do repositorio e o arquivo `PROJECT_CONTEXT_INDEX.md` gerado automaticamente.

Nao colocar arquivos manuais nessa pasta, porque o sync pode remove-los.

## Pasta manual para dados sensiveis

Contextos CHATGPT/CRM Clube04/Fontes ChatGPT/dados-sensiveis

Esta pasta fica fora do sync automatico.

A planilha de leads pode ser copiada manualmente para esta pasta quando for necessario consultar no ChatGPT.

## Fluxo

1. Push na branch `main`.
2. GitHub Actions monta `.chatgpt-sources`.
3. O script inclui somente arquivos `*.md` rastreados pelo Git.
4. A estrutura de pastas do repositorio e preservada.
5. `PROJECT_CONTEXT_INDEX.md` e gerado automaticamente.
6. rclone sincroniza `.chatgpt-sources` com `repo-docs`.

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

Contextos CHATGPT/CRM Clube04/Fontes ChatGPT/repo-docs

A pasta `dados-sensiveis` deve ser usada apenas quando a planilha de leads for necessaria.
