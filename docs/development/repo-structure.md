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
scripts/
  smoke/                    API smoke flow scripts
  verify/                   operational verification scripts
  test-support/             shared test helpers (runId/http/cleanup/data)
  dev-data/                 local cleanup and seed scripts
  frontend-tests/           Playwright browser tests
  imports/lead-spreadsheet/ spreadsheet import and dry-run tooling
  remediation/              backlog remediation scripts
docs/        architecture, product, integrations, operations, backlog
```

Frontend UI Foundation:

```text
apps/web/src/components/ui/  shared UI primitives for dashboard work
docs/frontend/               design system, components catalog and Lovable adaptation guide
```

Specialized context docs:

```text
docs/backend/api-agent.md
docs/qa/verification-agent.md
docs/product/lead-operational-scope.md
docs/development/sprint-plan-template.md
```

## Where to add new files

- New API endpoint:
  - route: `apps/api/src/routes`
  - validation: `apps/api/src/validation`
  - service: `apps/api/src/services`
  - repository: `apps/api/src/repositories`

- New dashboard feature:
  - UI and state: `apps/web/src`
  - shared UI primitives: `apps/web/src/components/ui`
  - frontend context: `docs/frontend/design-system.md`
  - shared API client/types: `apps/web/src/*` or `packages/shared` if truly cross-app

- New frontend pattern or Lovable adaptation:
  - document design rule in `docs/frontend`
  - do not copy Lovable architecture or mock data

- New backend/API behavior:
  - consult `docs/backend/api-agent.md`
  - confirm schema compatibility before using new columns/status values

- New QA/verification rule:
  - document in `docs/qa/verification-agent.md` or `docs/development/testing-strategy.md`

- New worker job:
  - job module under `apps/worker/src/jobs/<domain>`
  - shared domain logic in API/worker service modules only when reusable

- New integration:
  - `apps/api/src/integrations` or `apps/worker/src/integrations` by runtime owner
  - keep provider-specific transport details isolated

- New validation script:
  - `scripts/verify/verify-*.ts`
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
