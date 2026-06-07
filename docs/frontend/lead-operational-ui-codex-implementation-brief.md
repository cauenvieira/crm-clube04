# Codex Implementation Brief - Lead Operational UI

Project: CRM Clube04 Mogi das Cruzes
Milestone: M2 - Mesa Operacional
Type: Implementation brief
Status: Draft
Format: ASCII-only

---

## Task

Implement the first real UI slice of the Lead Operational Mesa based on:

- `docs/frontend/lead-operational-ui-contract.md`
- `docs/product/lead-operational-ui-wireframes.md`
- `docs/product/lead-operational-system.md`
- `docs/product/lead-operational-technical-contract.md`

## Scope

Implement frontend UI structure only.

Do:

1. Mesa Operacional shell.
2. Primary filters.
3. Queue layout:
   - Fazer follow-up
   - Validar agendamento
   - Revisar na lideranca
   - Nutricao collapsed by default.
4. LeadCard component.
5. LeadDrawer read-only structure.
6. Responsive mobile behavior with tabs/select/accordion.
7. Use mock/dev data adapter if backend endpoints are not ready.
8. Use UI Foundation components from `apps/web/src/components/ui`.

Do not:

- Implement backend lifecycle transitions.
- Implement dashboard.
- Implement WhatsApp integration.
- Implement ERP integration.
- Add AI.
- Add finance/client journey modules.
- Create a parallel component library.
- Invent statuses or queues.
- Allow terminal transitions from UI-only logic.

## Visual priorities

- Compact cards.
- One primary situation badge.
- Max 3 secondary tags.
- WhatsApp/copy fast actions.
- Clear current queue and next action in drawer.
- Mobile usable without side-by-side columns.

## Files likely involved

Codex must inspect repo before deciding exact paths.

Likely frontend areas:

```text
apps/web/src/components/ui
apps/web/src/features
apps/web/src/pages
apps/web/src/routes
apps/web/src/lib
```

Do not assume this structure without checking.

## Acceptance checks

Manual:

1. Mesa renders.
2. Filters render and can switch visible data.
3. LeadCard opens drawer.
4. WhatsApp/copy buttons do not open drawer.
5. Drawer shows queue, next action, SR/FU, tags and history placeholder.
6. Mobile uses tabs/select/accordion, not 4 columns.
7. Nutricao is collapsed/separated from daily desk.
8. Atendente cannot see enabled terminal decision buttons if actions are included.

Automated/proportional:

```powershell
npm run build
npm run lint
npm run verify:frontend
npm run verify:data-cleanliness
```

If some script does not exist, report it and use the closest documented validation.
