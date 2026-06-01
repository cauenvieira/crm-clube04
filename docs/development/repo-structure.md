# Repo Structure

## Current layout

```text
apps/
  api/       Fastify API (routes, services, repositories, validation)
  web/       React + Vite dashboard
  worker/    background jobs and worker entrypoints
packages/
  shared/    shared types and utilities
infra/
  db/        db bootstrap and versioned SQL migrations
  n8n/       n8n versioned workflows and integration assets
scripts/     smoke/verify/import/remediation/dev-data scripts
docs/        architecture, product, integrations, operations, backlog
```

## Where to add new files

- New API endpoint:
  - route: `apps/api/src/routes`
  - validation: `apps/api/src/validation`
  - service: `apps/api/src/services`
  - repository: `apps/api/src/repositories`

- New dashboard feature:
  - UI and state: `apps/web/src`
  - shared API client/types: `apps/web/src/*` or `packages/shared` if truly cross-app

- New worker job:
  - job module under `apps/worker/src/jobs/<domain>`
  - shared domain logic in API/worker service modules only when reusable

- New integration:
  - `apps/api/src/integrations` or `apps/worker/src/integrations` by runtime owner
  - keep provider-specific transport details isolated

- New validation script:
  - `scripts/verify-*.ts`
  - include runId, deterministic output, and cleanup

- n8n workflows:
  - `infra/n8n/workflows`
  - keep stable workflow `id` in versioned JSON

## File size and split policy

- Target: keep source files below 250-300 lines.
- If file exceeds that range:
  - split by responsibility, not by arbitrary chunk;
  - preserve clear naming;
  - avoid generic catch-all files.

## Change scope policy

- Prefer small incremental changes.
- Do not combine broad refactor with feature delivery.
- If structural refactor is needed, document proposal first and apply separately.
