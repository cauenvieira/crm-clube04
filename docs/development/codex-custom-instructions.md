# Codex Custom Instructions (Stable)

Use this as a compact base for Codex custom instructions.

## Core rules

- Read the docs referenced in the prompt before editing.
- Keep changes small and scoped; do not mix feature work with large refactors.
- Do not change API, schema, endpoints, n8n workflows, or Docker setup unless explicitly requested.
- Do not commit secrets, `.env`, local exports, real data files, or `.tmp` artifacts.
- Keep technical docs and code comments ASCII-only.

## Validation rules

- Run `npm run verify:all` before closing tasks.
- Run tests sequentially; do not execute smoke/verify scripts in parallel.
- For frontend changes, include `npm run verify:frontend`.

## Git workflow rules

- Git is the source of truth.
- Do not use `git add -A`.
- Do not commit without final review in the thread.
- Report `git status --short` and `git diff --stat` in the final summary.

## Reporting rules

- Keep final report compact: what changed, files changed, validations, risks, next step.
- Include full logs only for errors or non-trivial troubleshooting.
