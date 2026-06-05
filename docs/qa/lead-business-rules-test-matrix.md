# Lead Business Rules Test Matrix

## 1. Purpose

This matrix connects the Lead Operational Contract and Lead Import Normalization rules to automated tests.

A business rule is considered protected only when it has:
- a rule ID;
- an expected behavior;
- an automated test or an explicit pending test gap.

Source documents:
- docs/product/lead-operational-contract.md
- docs/product/lead-import-normalization.md

## 2. Current test commands

Primary commands:
- npm run smoke:api
- npm run verify:operational-summary
- npm run verify:operational-worklist
- npm run verify:lead-operational-cycle
- npm run verify:all
- npm run verify:data-cleanliness

Frontend commands when UI behavior is affected:
- npm run verify:dashboard
- npm run verify:frontend

## 3. Rule coverage matrix

| Rule | Description | Current test | Coverage |
|---|---|---|---|
| LOR-001 | New lead enters operational queue | smoke:api | partial |
| LOR-002 | Lead may exist without tutor name if phone is valid | smoke:api | partial |
| LOR-003 | Manual lead creation should not duplicate active leads | smoke:api | covered |
| LOR-010 | No response creates next attempt automatically | verify:lead-operational-cycle | covered |
| LOR-011 | Attempt cadence | verify:lead-operational-cycle | partial |
| LOR-012 | Attempt limit sends lead to leadership review | verify:lead-operational-cycle | covered |
| LOR-020 | Leadership review requires attendant self-review | pending | not covered |
| LOR-021 | Leadership decides next destination | pending | not covered |
| LOR-030 | Leadership evaluates process quality | pending | not covered |
| LOR-031 | Poor-fit lead generates marketing feedback | pending | not covered |
| LOR-032 | Poor process generates operational feedback | pending | not covered |
| LOR-040 | Attend today | verify:operational-worklist | partial |
| LOR-041 | Delayed up to 7 days | pending | not covered |
| LOR-042 | Backlog above 7 days | pending | not covered |
| LOR-043 | Active lead older than 60 days | pending | not covered |
| LOR-044 | Active lead without next action alert | verify:operational-summary | partial |
| LOR-050 | Conversion rate | pending | not covered |
| IMP-001 | Phone normalization | smoke:api | partial |
| IMP-002 | Empty tutor name | smoke:api | partial |
| IMP-003 | Pet name import | pending | not covered |
| IMP-004 | Source normalization | pending | not covered |
| IMP-005 | Campaign preservation | pending | not covered |
| IMP-006 | Entry date normalization | pending | not covered |
| IMP-007 | Next action date mapping | pending | not covered |
| IMP-008 | Assigned attendant import | pending | not covered |
| IMP-020 | Active imported lead must not be actionless | pending | not covered |
| IMP-021 | Final imported lead must not enter daily queue | pending | not covered |
| IMP-022 | Imported leadership review | pending | not covered |
| IMP-030 | Active duplicate by phone | pending | not covered |
| IMP-031 | Historical duplicate by phone | pending | not covered |

## 4. Rules that must be protected next

Priority 1:
- LOR-020: leadership review self-checklist;
- LOR-021: leadership decision outcome;
- LOR-041: delayed up to 7 days;
- LOR-042: backlog above 7 days;
- LOR-043: active lead older than 60 days.

Priority 2:
- IMP-001: stricter phone normalization test;
- IMP-004: source normalization;
- IMP-007: next action date mapping;
- IMP-020: imported active lead must not be actionless;
- IMP-021: imported final/cold lead must not enter daily queue.

Priority 3:
- LOR-050: conversion rate;
- marketing feedback flow;
- operational feedback flow.

## 5. Test design rules

- Business tests should use generated test data with a unique runId.
- Tests must clean up after themselves.
- Tests must not delete real imported data.
- Tests must not depend on spreadsheet production data.
- Tests should verify both database-side behavior and API response behavior when relevant.
- If a rule cannot be tested yet, mark it as pending and explain why.

## 6. Change control

When a developer changes lifecycle behavior, they must update:
- docs/product/lead-operational-contract.md;
- docs/qa/lead-business-rules-test-matrix.md;
- test implementation when coverage exists or is required.

When a developer changes import behavior, they must update:
- docs/product/lead-import-normalization.md;
- docs/qa/lead-business-rules-test-matrix.md;
- import verification when available.

A change that alters behavior but does not update these documents should be treated as incomplete.
