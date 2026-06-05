# Lead Operational Contract

## 1. Purpose

This document is the source of truth for the operational behavior of the Clube04 CRM Lead Journey.

It defines how a lead moves through the system, which actions are automatic, which actions require a user decision, and which rules must be preserved by backend, frontend, tests, imports, automations, and future AI-assisted workflows.

No implementation should change lead lifecycle behavior without updating this document and the related test matrix.

## 2. Principles

- The CRM exists to increase lead conversion and operational discipline.
- The attendant should always know what to do today.
- The system should create the next action automatically whenever possible.
- The leadership queue should receive only leads that were already worked with minimum operational quality.
- Cold leads should not consume the same daily energy as active leads.
- The interface should be simple, but the business rules behind it must be consistent.
- Every critical movement must create history/audit.
- A lead should not stay in an active operational state without a next action.
- Business rule changes require matching tests or an explicit test gap in the matrix.

## 3. Core entities

### 3.1 Lead

A lead is a commercial opportunity before becoming a customer.

Operational fields:
- tutor name;
- normalized phone;
- pet name;
- source;
- source detail;
- campaign;
- assigned attendant;
- status;
- entry date;
- first message date;
- last interaction;
- next action;
- attempts count;
- loss reason;
- disqualification reason;
- leadership review status.

### 3.2 Action item

An action item is an operational task linked to a lead.

Main types:
- atender_hoje;
- fazer_follow_up;
- retomar_atendimento;
- revisar_lideranca;
- nutricao_campanha.

### 3.3 Interaction

An interaction is an audit/history record for a contact, decision, movement, or operational note.

Every relevant operational decision must generate an interaction.

## 4. Lead statuses

### 4.1 novo_lead

A newly created lead that has not been worked yet.

Rules:
- every new lead must enter an operational queue;
- the lead should appear on the operational desk;
- the system should create or expose the first required action.

### 4.2 em_atendimento

A lead under active commercial handling.

Rules:
- the lead consumes daily team energy;
- it must have a next action;
- if it has no next action, it must appear in an operational alert.

### 4.3 aguardando_resposta

A lead already contacted and waiting for a response.

Rules:
- the attempt must be registered;
- the next contact must be calculated automatically when the user chooses no response;
- the lead must not remain open without a planned next action.

### 4.4 agendado

A lead that has an appointment scheduled.

Rules:
- it leaves the ordinary active commercial handling queue;
- it remains traceable for conversion;
- it still counts in conversion analysis.

### 4.5 convertido

A lead that became a customer.

Rules:
- it leaves the Lead Journey;
- it enters the Customer Journey;
- it counts positively in conversion metrics;
- open daily action items must be closed or neutralized.

### 4.6 perdido

A lead closed as a commercial loss.

Rules:
- a loss reason is required;
- history must be registered;
- it must not remain in the daily action queue.

### 4.7 desqualificado

A lead that is not a valid commercial opportunity.

Rules:
- a disqualification reason is required;
- it should not be treated as a simple commercial loss;
- history must be registered;
- it must not remain in the daily action queue.

### 4.8 nutricao_campanha

A cold lead that should not consume daily attendant energy.

Rules:
- it leaves the daily operational queue;
- it may be used for future recovery campaigns;
- it must not remain pending in atender_hoje, fazer_follow_up, or retomar_atendimento.

### 4.9 revisar_lideranca

A lead sent to leadership review.

Rules:
- it requires attendant self-review;
- leadership decides the next destination;
- the decision must be justified and audited.

## 5. Entry rules

### LOR-001 - New lead enters an operational queue

When a lead is created manually, imported, or received through a webhook, the system must create or expose a next operational action.

Expected result:
- lead is created with a valid operational status;
- an open action item exists when the lead requires team action;
- the lead appears in the operational desk when applicable;
- creation is auditable.

Expected tests:
- smoke:api;
- verify:lead-operational-cycle;
- future manual lead specific verification.

### LOR-002 - A lead may exist without a tutor name if the phone is valid

The normalized phone is the minimum identity field for a lead.

Expected result:
- if tutor name is empty but phone is valid, use "Sem nome";
- normalized phone must be stored;
- lead without a valid phone must be rejected or sent to an invalid import report.

Expected tests:
- smoke:api;
- future manual lead verification.

### LOR-003 - Manual lead creation should not duplicate active leads

When a manual lead is created with a phone that already has an active lead, the system must not create a duplicate active lead.

Expected result:
- return the existing active lead or a duplicate signal;
- preserve auditability;
- avoid multiple active queues for the same contact.

Expected tests:
- smoke:api.

## 6. Attempt and no-response rules

### LOR-010 - No response creates the next attempt automatically

When the attendant records sem_resposta, the backend must calculate the next contact date without requiring a manual date.

Expected result:
- attempts count is incremented;
- last interaction is updated;
- a new next action is created or updated;
- history is registered.

Expected tests:
- verify:lead-operational-cycle.

### LOR-011 - Attempt cadence

Initial suggested cadence:
- attempt 1: next contact in 1 business day;
- attempt 2: next contact in 2 business days;
- attempt 3: next contact in 3 business days;
- attempt 4: send to leadership review.

This cadence can be adjusted, but not only in code. Any change must update this contract and the test matrix.

Expected tests:
- verify:lead-operational-cycle;
- future cadence-specific verification.

### LOR-012 - Attempt limit sends the lead to leadership review

When the no-response attempt limit is reached, the lead must leave the ordinary queue and enter revisar_lideranca.

Expected result:
- revisar_lideranca action item is created;
- old open action items are closed, canceled, or deduplicated according to the backend contract;
- history is registered.

Expected tests:
- verify:lead-operational-cycle.

## 7. Sending a lead to leadership review

### LOR-020 - Leadership review requires attendant self-review

Before sending a lead to leadership review, the system must require an attendant self-review checklist.

Minimum checklist:
- I made the first contact within the expected time.
- I was clear, polite, and respectful.
- I explained how Clube04 works.
- I presented real benefits, not only price.
- I asked questions to understand the need.
- I tried to handle objections.
- I offered package or recurrence alternatives when applicable.
- I registered a clear summary of the interaction.
- The reason for sending to leadership is clear.

Expected result:
- the system should not allow leadership review without the checklist;
- checklist answers must be stored in the history or review payload;
- leadership must see the checklist before deciding.

Expected tests:
- pending.

### LOR-021 - Leadership decides the next destination

After review, leadership must choose a conclusion.

Allowed conclusions:
- voltar_para_atendimento;
- perdido;
- desqualificado;
- nutricao_campanha;
- feedback_marketing;
- feedback_atendimento.

Each conclusion requires a justification.

Expected tests:
- pending.

## 8. Leadership analysis rules

### LOR-030 - Leadership evaluates process quality

Leadership must evaluate whether the process was followed correctly.

Review points:
- first contact time;
- number of attempts;
- quality of approach;
- objection handling;
- clarity of notes;
- fit with Clube04 target profile;
- source and campaign quality.

Expected tests:
- pending.

### LOR-031 - Poor-fit leads generate marketing feedback

If the attendant followed the process correctly but the lead is poor fit, leadership should classify the reason and, when relevant, produce a signal for marketing.

Examples:
- incompatible location;
- service not offered by Clube04;
- price expectations far outside target;
- invalid contact or no pet;
- campaign brought the wrong audience.

Expected tests:
- pending.

### LOR-032 - Poor process generates operational feedback

If the lead had potential but the process was weak, leadership must return the lead to atendimento or register operational feedback.

Examples:
- delayed first contact;
- cold or incomplete answer;
- Clube04 differentials were not explained;
- objections were not handled;
- package or recurrence was not offered when applicable;
- record was incomplete.

Expected tests:
- pending.

## 9. Operational alerts

### LOR-040 - Attend today

Every lead with a due action today or missing initial service must appear in atender_hoje.

Expected tests:
- verify:operational-worklist;
- future business rule verification.

### LOR-041 - Delayed up to 7 days

A lead with a next action overdue by up to 7 days must appear as atrasado.

Expected tests:
- pending.

### LOR-042 - Backlog above 7 days

A lead with a next action overdue by more than 7 days must appear as backlog.

Expected tests:
- pending.

### LOR-043 - Active lead older than 60 days

A lead that remains in active handling for more than 60 days without conversion must generate a long-cycle alert.

Expected result:
- visible indicator;
- filterable list;
- leadership can review.

Expected tests:
- pending.

### LOR-044 - Lead without next action

An active lead without a next action must generate an operational alert.

Final statuses exempt from this rule:
- convertido;
- perdido;
- desqualificado;
- nutricao_campanha.

Expected tests:
- verify:operational-summary;
- future business rule verification.

## 10. Operational desk indicators

The operational desk should prioritize action indicators, not vanity metrics.

Primary indicators:
- atender hoje;
- atrasados;
- backlog;
- em analise de lideranca;
- concluidos hoje;
- convertidos hoje;
- active leads older than 60 days;
- leads without next action;
- accumulated conversion rate;
- conversion rate by source/campaign;
- average time to first contact;
- average time to conversion.

Indicators should be clickable when possible.

## 11. Lead movement rules

Allowed operational actions:
- registrar_contato;
- sem_resposta;
- continuar_atendimento;
- agendamento_realizado;
- cliente_convertido;
- enviar_analise_lideranca;
- perdido;
- desqualificado;
- nutricao_campanha;
- voltar_para_atendimento.

Rules:
- every action must create history;
- every action must close, update, or create the next action;
- a lead cannot remain without next action except in final/cold statuses;
- critical movement cannot be frontend-only;
- backend owns lifecycle behavior.

## 12. Conversion metrics

### LOR-050 - Conversion rate

Conversion rate should measure the proportion of valid leads that became customers.

Initial rule:
- convertido counts as conversion;
- perdido counts against conversion;
- desqualificado may be excluded from commercial conversion when the reason is invalid fit;
- nutricao_campanha remains open for long-term recovery and should be reported separately.

Expected tests:
- pending.

## 13. Rule change protocol

A change to any of the following requires updating this document and the test matrix:
- lead statuses;
- action item types;
- outcome behavior;
- leadership review rules;
- attempt cadence;
- import normalization;
- conversion/loss/disqualification rules;
- operational alerts;
- dashboard indicator definitions.

If a test does not exist yet, the test matrix must explicitly mark the gap.
