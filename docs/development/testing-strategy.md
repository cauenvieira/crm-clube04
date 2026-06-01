# Testing Strategy

## Goal

Keep local validation deterministic, fast to run, and aligned with operational risk.

## Test layers

1. `smoke:api`
- Quick API flow validation.
- Covers core endpoints and idempotency basics.
- Use on local iteration and in pre-commit battery.

2. `verify:*` scripts
- Operational validations by domain.
- Examples: action items lifecycle, operational summary, worklist, dashboard, data cleanliness.
- Must validate happy path plus at least one idempotency or validation/error path where relevant.

3. `verify:frontend`
- Real browser validation (Playwright) for dashboard UX and interaction flow.
- Required when frontend behavior changes.

4. Data cleanliness checks
- Ensure test artifacts are removed or tagged safely.
- Use `verify:data-cleanliness` plus cleanup/seed scripts for local reset.

## Mandatory execution order

- Always run tests sequentially on shared local DB.
- Recommended final command:

```bash
npm run verify:all
```

- Do not run smoke/verify in parallel jobs or terminals.

## runId and cleanup rules

- Any script that writes test data must generate a unique `runId`.
- Persist marker fields so written data can be found and removed safely.
- Cleanup must run in `finally`, including failure paths.
- Cleanup must be scoped; never use destructive broad deletion or truncate.

## When to add new tests

Add or update tests whenever a task changes:

- API contract (payload, status code, filtering, idempotency).
- Operational counters or summaries.
- Dashboard behavior or UX interactions.
- Data import/remediation logic.
- Integration boundaries (n8n/webhooks/worker flows).

## Definition of done for validation

- Feature is not done with build/lint only.
- Required validations must be updated and executed.
- Docs examples must be copyable and runnable without hidden steps.
- Final report must include executed commands and concise pass/fail result.
