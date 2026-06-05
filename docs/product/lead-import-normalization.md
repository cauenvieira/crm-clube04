# Lead Import Normalization

## 1. Purpose

This document defines how legacy lead spreadsheets are mapped into the CRM Lead Journey.

Import behavior must follow the Lead Operational Contract:

- docs/product/lead-operational-contract.md
- docs/qa/lead-business-rules-test-matrix.md

No import should create operational states that violate the lead lifecycle contract.

## 2. Import principles

- Normalize before inserting.
- Preserve source data when useful for audit.
- Reject or quarantine invalid records instead of silently corrupting the CRM.
- Avoid duplicate active leads for the same normalized phone.
- Create operational action items according to the mapped state.
- Do not import legacy ambiguity as a final status without a clear rule.

## 3. Field mapping

### IMP-001 - Phone normalization

Rules:
- remove non-numeric characters;
- if the number has 10 or 11 digits, prefix with 55;
- if the number has 12 or 13 digits and starts with 55, keep it;
- otherwise reject the record or send it to an invalid-record report.

Expected output:
- normalized_phone in E.164-like BR format without plus sign;
- invalid_phone flag or rejection report when invalid.

Related tests:
- smoke:api partial;
- future import verification.

### IMP-002 - Empty tutor name

Rules:
- if phone is valid and tutor name is empty, import tutor name as "Sem nome";
- add an observation that source name was empty;
- do not block import only because tutor name is missing.

Related rule:
- LOR-002.

### IMP-003 - Pet name

Rules:
- if pet name exists, import it;
- if empty, keep empty/null and do not invent a pet name;
- pet name absence should not block the lead if phone is valid.

### IMP-004 - Source

Rules:
- preserve raw source when possible;
- normalize common source values into controlled reporting groups.

Suggested normalization:
- facebook, facebok, faceboo, facebookk, fcebook -> facebook;
- instagram, instagram(seguidor), instagram seguidor -> instagram;
- trafego pago (facebook) -> trafego_pago_facebook;
- trafego pago (instagram) -> trafego_pago_instagram;
- indicacao -> indicacao;
- fachada -> fachada;
- unknown, vazio, nao informado -> unknown;
- others/outros/outro -> outro.

### IMP-005 - Campaign

Rules:
- preserve raw campaign string;
- empty campaign is allowed;
- campaign normalization can be added later for reporting.

### IMP-006 - Entry date

Rules:
- use the original lead entry date when available and valid;
- if invalid or empty, use import date and mark source date as missing;
- preserve raw value in audit metadata when available.

### IMP-007 - Next action date

Rules:
- if date is valid and in the operational window, create fazer_follow_up;
- if date is overdue up to 7 days, mark as atrasado category in operational reporting;
- if date is overdue by more than 7 days, mark as backlog category in operational reporting;
- if empty and the lead is active, create retomar_atendimento;
- if the lead is final or cold, do not create a daily action item.

### IMP-008 - Assigned attendant

Rules:
- import assigned attendant when available;
- if empty, leave unassigned or assign to the operational default according to future configuration;
- do not fabricate an attendant name.

## 4. Status mapping

Legacy spreadsheet values must be mapped into CRM operational states.

Suggested initial mapping:

| Legacy value | CRM status | Action item | Notes |
|---|---|---|---|
| novo | novo_lead | atender_hoje | New lead requiring first contact |
| sem retorno | aguardando_resposta | retomar_atendimento or fazer_follow_up | Depends on last attempt and date |
| retorno agendado | em_atendimento | fazer_follow_up | Uses next action date |
| em conversa | em_atendimento | fazer_follow_up | Requires next action |
| aguardando resposta | aguardando_resposta | fazer_follow_up | System-owned cadence after import |
| agendado | agendado | none or future customer journey action | Leaves daily lead handling |
| convertido | convertido | none | Final for Lead Journey |
| perdido | perdido | none | Requires reason when available |
| fora do perfil | desqualificado | none | Requires reason when available |
| frio | nutricao_campanha | none | Does not consume daily energy |
| vazio/desconhecido | em_atendimento | retomar_atendimento | Conservative recovery behavior |

## 5. Operational action generation

### IMP-020 - Active imported lead must not be actionless

If the imported lead maps to an active state and has no valid next action, the import must create retomar_atendimento.

Active states:
- novo_lead;
- em_atendimento;
- aguardando_resposta.

### IMP-021 - Final imported lead must not enter daily queue

Final/cold states should not create daily action items:
- convertido;
- perdido;
- desqualificado;
- nutricao_campanha.

### IMP-022 - Imported leadership review

If the spreadsheet clearly indicates the lead needs leadership decision, create revisar_lideranca.

If the indication is ambiguous, import as retomar_atendimento and let the team review operationally.

## 6. Deduplication

### IMP-030 - Active duplicate by phone

When importing a record whose normalized phone already has an active lead:
- do not create another active lead;
- attach audit/import information when needed;
- preserve the existing active workflow.

### IMP-031 - Historical duplicate by phone

When importing a record whose normalized phone has only final/cold leads:
- create a new lead only when the import row represents a new opportunity;
- otherwise preserve as historical/audit information.

## 7. Invalid records

Invalid records should be reported with reason codes.

Reason codes:
- invalid_phone;
- missing_phone;
- invalid_entry_date;
- invalid_next_action_date;
- duplicate_active_lead;
- unsupported_status;
- insufficient_data.

Invalid reports should be saved outside version control if they contain real customer data.

## 8. Import verification

Every future import process should produce:
- count of rows read;
- count of contacts created;
- count of leads created;
- count of duplicate active leads skipped;
- count of invalid records;
- count by mapped status;
- count by action item type;
- sample of invalid records without exposing unnecessary personal data.

## 9. Current known cleanup topics

Current source data may contain:
- inconsistent source labels;
- misspelled source values;
- empty tutor names;
- missing next action dates;
- overdue active leads;
- old active leads with long lifecycle;
- leads that should become nutricao_campanha;
- records that require leadership review.

The import should handle these explicitly instead of letting inconsistent raw values drive operational behavior.
