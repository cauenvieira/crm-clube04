# Lead Operational UI Contract

Project: CRM Clube04 Mogi das Cruzes
Area: Frontend / Product UX
Milestone: M2 - Mesa Operacional
Status: Draft for implementation guidance
Scope: Lead Operational UI, Mesa Operacional, LeadCard, LeadDrawer, New Lead, Leadership Review, Nutrition, Settings and Audit
Format: ASCII-only

---

## 1. Purpose

This document defines the visual and interaction contract for the Lead Operational module.

It complements, but does not replace:

- `docs/product/lead-operational-contract.md`
- `docs/product/lead-operational-technical-contract.md`
- `docs/product/lead-operational-system.md`
- `docs/product/lead-operational-ui-wireframes.md`
- `docs/qa/lead-business-rules-test-matrix.md`
- `docs/qa/lead-operational-cycle-test-plan.md`

The operational rules remain owned by the product/technical contracts. This document controls the visual hierarchy, layout, UI behavior and component expectations.

---

## 2. Design principles

The interface must behave like an operational desk for the Clube04 team.

Principles:

1. Daily action first.
   - The user must immediately understand what needs to be done now.
2. Low visual noise.
   - A card must expose only the highest-priority signal and up to 3 secondary tags.
3. Clear separation of concepts.
   - Status, operational queue, result, primary situation and secondary tags must not be visually merged.
4. Fast WhatsApp work.
   - Phone, WhatsApp and copy actions must be visible and quick.
5. Leadership visibility.
   - Exceptions, long follow-ups, backlog and sensitive cases must be obvious.
6. Mobile usable, not merely responsive.
   - On mobile, columns must become tabs/accordion. Horizontal Kanban is not acceptable.
7. UI Foundation first.
   - Use existing UI components from `apps/web/src/components/ui`.
   - Do not create a parallel component library.
8. Lovable is visual reference, not architecture.
   - Use the Lovable mock for UX inspiration only. Implement according to this repo architecture.

---

## 3. Visual tone

Desired perception:

- Professional
- Operational
- Clean
- Warm enough for Clube04 brand
- Not playful to the point of losing control/discipline
- Not a generic SaaS dashboard

Avoid:

- Excessive gradients
- Oversized charts
- Pet images/avatars in the first implementation
- Too many colors on the same card
- Emojis inside operational labels
- Dense spreadsheet-like rows on the main desk

---

## 4. Token policy

Use semantic tokens. Do not hardcode raw colors inside feature components.

Suggested token families:

```text
brand.primary
brand.primaryForeground

surface.page
surface.card
surface.cardElevated
surface.sidebar
surface.muted

text.primary
text.secondary
text.muted
text.inverse

border.default
border.subtle
border.focus

situation.critical
situation.criticalSoft
situation.warning
situation.warningSoft
situation.info
situation.infoSoft
situation.success
situation.successSoft
situation.muted
situation.mutedSoft
```

If the project uses CSS variables/shadcn tokens, map these names to existing variables instead of creating a second token system.

Recommended HSL base values:

```text
brand.primary: 24 95% 53%
surface.page: 30 20% 98%
text.primary: 220 18% 16%
surface.sidebar: 220 20% 14%

critical: 0 72% 51%
warning: 38 92% 50%
info: 213 84% 55%
success: 145 63% 38%
muted: 220 10% 46%
```

The exact HSL can be adjusted by the UI foundation, but the semantic mapping must remain stable.

---

## 5. Typography

Use compact, legible typography.

Recommended scale:

| Element | Size | Line height | Weight | Notes |
|---|---:|---:|---:|---|
| Page title | 24px | 32px | 650/700 | Example: Mesa Operacional |
| Page subtitle | 14px | 20px | 400 | Operational explanation |
| Section title | 18px | 28px | 600 | Column header, drawer block |
| Column title | 15px | 22px | 650 | Queue name |
| Lead tutor name | 15px | 20px | 650 | Must stand out |
| Dog/pet line | 13px | 18px | 500 | Secondary, not tiny |
| Body | 14px | 20px | 400 | Standard text |
| Metadata | 12px | 16px | 400/500 | Origin, responsible, timestamps |
| Badge/tag | 11px | 14px | 600 | Uppercase only when very short |
| Button small | 12px | 16px | 600 | WhatsApp/copy/quick actions |

Rules:

- Do not use font size below 11px.
- Do not use all-caps for long labels.
- Use tabular numbers where available for counters (`SR 3/12`, `FU 7`).
- Prefer one font family. Inter is acceptable.

---

## 6. Spacing and density

Base spacing:

```text
Page padding desktop: 24px
Page padding tablet: 20px
Page padding mobile: 16px

Major section gap: 24px
Filter row gap: 8px
Column gap desktop: 16px
Card internal padding: 12px
Card row gap: 8px
Tag gap: 6px
Drawer section gap: 20px
```

Card density:

- Cards must be compact enough for operational scanning.
- A normal LeadCard should fit between 132px and 176px height.
- A card above 200px is too tall for the Mesa unless expanded intentionally.
- Do not show full history inside the card.
- Do not show full address inside the card.

---

## 7. Page shell

Desktop layout:

```text
Sidebar fixed/collapsible
Header sticky or visually persistent
Main content scrolls
Mesa columns scroll vertically inside content area when needed
```

Header contents:

```text
[Sidebar trigger] Mesa Operacional / page title
[Visualizando como: Admin/Lider/Atendente]
[Current mock user]
```

Sidebar order:

1. Mesa Operacional
2. Novo Lead
3. Revisao da Lideranca
4. Nutricao
5. Configuracoes Operacionais
6. Usuarios e Permissoes
7. Auditoria

Do not add dashboard, finance, AI or ERP entries in this scope.

---

## 8. Mesa Operacional layout

### 8.1 Desktop

Queue columns:

1. Fazer follow-up
2. Validar agendamento
3. Revisar na lideranca
4. Nutricao

Rules:

- Nutricao must be collapsed by default on the Mesa.
- `/nutricao` is the main working view for nutrition.
- Column width: min 300px, preferred 328px, max 360px.
- Column header must show queue name and count.
- Column header may show a short helper line.
- Columns must use equal visual weight, except Nutricao collapsed.

Desktop wireframe:

```text
+--------------------------------------------------------------------------------+
| Header: Mesa Operacional                 Visualizando como: Lider              |
+--------------------------------------------------------------------------------+
| [Todos ativos] [Hoje] [Atrasados] [Backlog] [Prox. 7 dias] [Lideranca] ...     |
+--------------------------------------------------------------------------------+
|                                                                                |
| +----------------------+ +----------------------+ +----------------------+     |
| | Fazer follow-up  42  | | Validar agendamento | | Revisar lideranca  5 |     |
| | Acao ativa do dia    | | Confirmar desfecho  | | Decisao da lideranca|     |
| +----------------------+ +----------------------+ +----------------------+     |
| | LeadCard             | | LeadCard             | | LeadCard             |     |
| | LeadCard             | | LeadCard             | | LeadCard             |     |
| | LeadCard             | |                      | |                      |     |
| +----------------------+ +----------------------+ +----------------------+     |
|                                                                                |
| +----------------------+                                                         |
| | Nutricao recolhida 8 |  [Expandir]                                             |
| +----------------------+                                                         |
+--------------------------------------------------------------------------------+
```

### 8.2 Mobile

Mobile must not render four side-by-side columns.

Use one of:

- Segmented tabs by queue
- Accordion by queue
- Select "Fila operacional"

Preferred:

```text
+--------------------------------+
| Mesa Operacional               |
| Visualizando como: Atendente   |
+--------------------------------+
| [Hoje] [Atrasados] [Backlog] > |
+--------------------------------+
| Fila: [Fazer follow-up v]      |
+--------------------------------+
| LeadCard                       |
| LeadCard                       |
| LeadCard                       |
+--------------------------------+
```

---

## 9. Filters

Primary filters:

1. Todos ativos
2. Hoje
3. Atrasados
4. Backlog
5. Proximos 7 dias
6. Validar agendamento
7. Lideranca
8. Nutricao
9. Tentativa alta

Visual rules:

- Use chips/buttons, not a large form.
- Active filter must be visually clear.
- Counts may appear as small numbers.
- The primary filter row must be horizontally scrollable on mobile.
- Do not show advanced filters by default in first implementation.

Secondary filters may be added later:

- Responsavel
- Origem
- Interesse
- Alerta pet
- Ultimo resultado

Do not implement secondary filters until the primary desk is validated.

---

## 10. LeadCard contract

### 10.1 Required visible fields

Order:

1. Top row:
   - Tutor name
   - Primary situation badge
2. Dog line:
   - Doguinho names, max 2 names plus `+N`
3. Phone/action row:
   - Compact phone
   - WhatsApp button
   - Copy button
4. Operational row:
   - Next action date/time
   - `SR X/12`
   - `FU Y`
5. Signal row:
   - Up to 3 secondary tags
6. Context row:
   - Last result
   - Short observation

Do not show:

- Full address
- Full long notes
- Complete history
- Full technical IDs
- Multiple CTAs that compete with opening the drawer

### 10.2 Card click behavior

Clickable areas:

| Area | Action |
|---|---|
| Card body | Open LeadDrawer |
| WhatsApp button | Open `wa.me` in new tab |
| Copy button | Copy phone |
| Optional quick SR button | Register Sem resposta after confirmation or inline feedback |
| Column header | No critical state change |

Buttons inside the card must stop event propagation and not open the drawer.

### 10.3 LeadCard wireframe

```text
+------------------------------------------------+
| Maria Souza                         Hoje       |
| Nina, Thor                                   |
| (11) 99999-0000      [WhatsApp] [Copiar]      |
| Prox.: hoje 16:30      SR 3/12   FU 5         |
| [Sem resposta] [Tentativa 3/12] [Banho]       |
| Ult.: Sem resposta                            |
| Obs.: pediu valores de banho e tosa           |
+------------------------------------------------+
```

### 10.4 Card height

Normal target:

```text
min height: 132px
preferred: 148px to 168px
max before feeling heavy: 184px
```

If an alert requires more detail, show an icon and short label; details go to the drawer.

---

## 11. Primary situation badge

A card must show exactly one primary situation.

Ranking and semantic color:

| Priority | Situation | Token | Icon |
|---:|---|---|---|
| 1 | Erro de consistencia | critical | AlertTriangle |
| 2 | Caso sensivel | critical | ShieldAlert |
| 3 | Revisao da lideranca | critical/warning | ShieldAlert |
| 4 | Backlog Xd | critical | AlertTriangle |
| 5 | Atrasado Xd | warning | ClockAlert |
| 6 | Validar agendamento hoje | info | CalendarCheck |
| 7 | Hoje | brand/info | Clock3 |
| 8 | Follow-up longo | warning | CalendarClock |
| 9 | Tentativa alta | warning | Repeat2 |
| 10 | Cadastro incompleto | warning | ClipboardList |
| 11 | Nutricao | muted/info | Megaphone |
| 12 | Proximos 7 dias | info | CalendarDays |
| 13 | Novo | brand/info | Sparkles |
| 14 | Futuro | muted | Clock3 |

Display rules:

- Use a compact badge in the card top-right.
- Use text short enough for card scanning.
- Examples:
  - `Hoje`
  - `Atrasado 2d`
  - `Backlog 12d`
  - `Lideranca`
  - `FU longo 10d`
  - `Cadastro incompleto`

Do not show two primary situation badges at once.

---

## 12. Secondary tags

Show max 3 tags on the LeadCard.

Ranking:

1. Last result
2. No-response attempt
3. Follow-up count or long follow-up marker
4. Commercial interest
5. Dog alert
6. Leadership reason
7. Registration state
8. Origin
9. Responsible

Color mapping:

| Tag type | Examples | Token |
|---|---|---|
| Last result positive | Demonstrou interesse, Agendou | success/info |
| Last result neutral | Conversa em andamento | info |
| Last result negative | Sem resposta, Nao compareceu | warning |
| Attempt | Tentativa 8/12, Ultima tentativa | warning |
| Commercial interest | Banho, Tosa, Pacote, Ozonio | brand/info |
| Dog alert | Reativo, Agressivo, Pele sensivel | critical/warning |
| Leadership reason | Fora da regiao, Erro operacional | critical/warning |
| Registration | Cadastro incompleto | warning |
| Origin | Meta Ads, Indicacao, Google | muted/info |
| Responsible | Etiene, Cauê, Atendente | muted |

Rules:

- Tags must be short.
- No tag should wrap to 2 lines.
- If there are more than 3 tags, show the first 3 by ranking.
- Full list appears in the drawer.

---

## 13. Icons

Use `lucide-react` or existing project icon set.

Allowed icons:

```text
MessageCircle
Phone
Copy
Clock3
CalendarClock
CalendarCheck
CalendarDays
AlertTriangle
ShieldAlert
ClipboardList
CheckCircle2
XCircle
ArchiveX
Megaphone
UserRound
PawPrint
Settings
History
LockKeyhole
Repeat2
ChevronDown
ChevronRight
GripVertical
MoreHorizontal
```

Guidelines:

- Icons are support, not decoration.
- Use 14px to 16px icons in cards.
- Use 18px to 20px icons in headers/actions.
- Do not use pet photos/avatars in v1.
- Do not use random image assets.

---

## 14. Drag-and-drop policy

Operational state changes must not happen by free drag.

Rules:

1. Drag within same queue:
   - Allowed only if it changes local visual order and does not alter priority calculation.
   - If ranking is automatic, disable manual reorder.
2. Drag between queues:
   - Not allowed as a silent action.
   - If implemented, dropping must open a confirmation/action modal that routes through the same transition rules as the drawer.
3. Critical transitions:
   - Lost, disqualified, nutrition, archived, converted and leadership decisions must never be caused by raw drag.
4. Backend ownership:
   - In the real CRM, drag must call backend transition endpoints. Frontend must not decide critical lifecycle changes.

Initial recommendation:

```text
Do not implement drag-and-drop in the first real UI version.
Use explicit drawer actions first.
```

The mock may show drag as visual experimentation, but production implementation must prioritize rule safety.

---

## 15. LeadDrawer contract

Desktop:

```text
width: 520px preferred
min: 480px
max: 620px
```

Mobile:

```text
full-screen sheet
header sticky
primary action visible without excessive scroll
```

Drawer structure:

1. Header:
   - Tutor
   - Doguinhos
   - Phone + WhatsApp/copy
   - Current queue
   - Next action
   - SR/FU counters
   - Primary situation
2. Main action block:
   - Changes according to queue
3. Tabs:
   - Resumo
   - Historico
   - Cadastro
4. Footer:
   - Primary button
   - Secondary button
   - Destructive action only for leader/admin and only in correct flow

Wireframe:

```text
+------------------------------------------------+
| Maria Souza                              [X]   |
| Nina, Thor                                      |
| (11) 99999-0000   [WhatsApp] [Copiar]           |
| Fila: Fazer follow-up                           |
| Prox.: Hoje 16:30   SR 3/12   FU 5              |
| [Hoje] [Sem resposta] [Tentativa 3/12]          |
+------------------------------------------------+
| Resultado do atendimento                        |
| [Select: Sem resposta / Conversa / ...]         |
|                                                |
| Campos condicionais                             |
| - Proxima data                                  |
| - Motivo follow-up longo                        |
| - Checklist lideranca                           |
+------------------------------------------------+
| [Registrar resultado] [Cancelar]                |
+------------------------------------------------+
| Tabs: Resumo | Historico | Cadastro             |
+------------------------------------------------+
```

---

## 16. Action forms by queue

### 16.1 Fazer follow-up

Results:

- Sem resposta
- Conversa em andamento
- Demonstrou interesse
- Objecao
- Agendamento combinado
- Enviar para lideranca

UI rules:

- Result select appears first.
- Conditional fields appear below the selected result.
- Submit button text must match action:
  - `Registrar sem resposta`
  - `Salvar proximo follow-up`
  - `Registrar agendamento`
  - `Enviar para lideranca`

### 16.2 Validar agendamento

Results:

- Cliente compareceu
- Cliente nao compareceu
- Cancelou
- Remarcou
- Agendamento nao localizado
- Erro operacional

UI rules:

- `Cliente compareceu` is success/primary.
- `Nao compareceu`, `Cancelou`, `Erro operacional` need note.
- `Remarcou` requires new appointment date.
- Converted lead exits Mesa after confirmation.

### 16.3 Revisar na lideranca

Decisions:

- Retomar atendimento
- Finalizar como perdido
- Finalizar como desqualificado
- Enviar para nutricao
- Corrigir erro operacional
- Gerar acao secundaria

UI rules:

- Only Lider/Admin can finalize lost/disqualified.
- Destructive buttons must be visually separated.
- Reason 3-level selector must be visible before terminal decisions.
- Atendente sees disabled actions with tooltip.

### 16.4 Nutricao

Decisions:

- Manter em nutricao
- Reativar atendimento
- Remover da nutricao
- Bloqueou / pediu para parar

UI rules:

- `Reativar atendimento` returns to Fazer follow-up.
- `Bloqueou / pediu para parar` becomes `arquivado_nao_contatar`.
- Opt-out action must show confirmation.

---

## 17. Forms and validation feedback

Validation style:

- Inline message below field.
- Invalid field border uses danger token.
- Warning state uses warning token.
- Do not use toast as the only validation feedback.

Required field markers:

- Use `*` sparingly.
- Prefer clear helper text when operationally important.

Follow-up long warning:

```text
Atencao: este follow-up esta acima do prazo normal para esta etapa.
Informe o motivo. A lideranca vera este alerta.
```

Atendente >15 days block:

```text
Follow-up acima de 15 dias nao e permitido para atendente.
Envie para lideranca ou mova para Nutricao.
```

---

## 18. Buttons and hierarchy

Button hierarchy:

1. Primary: orange brand action
2. Secondary: outline/subtle
3. Warning: amber/soft, when non-terminal but attention required
4. Destructive: red, only for terminal or opt-out actions

Rules:

- One primary button per action block.
- Do not place two destructive buttons side by side without clear labels.
- Do not use icon-only buttons without tooltip/aria-label.
- WhatsApp and copy may be compact icon buttons with tooltip.

---

## 19. Empty, loading and error states

### 19.1 Empty queue

```text
Nenhum lead nesta fila.
```

Optional helper:

```text
Quando houver leads com proxima acao, eles aparecerao aqui.
```

### 19.2 Empty filters

```text
Nenhum lead encontrado para este filtro.
```

### 19.3 Loading

Use skeleton cards in the same shape as LeadCard.

### 19.4 Error

```text
Nao foi possivel carregar a Mesa Operacional.
Tente novamente ou verifique a conexao.
```

In mock/local mode, show a reset demo-data action only if appropriate.

---

## 20. Configuration UI

Settings must communicate that rules are operational parameters.

Tabs:

- Cadencia sem resposta
- Limites follow-up longo
- Horarios padrao
- Motivos 3 niveis
- Origens
- Atendentes
- Ranking situacao principal
- Ranking tags secundarias
- Backlog
- Tentativa alta
- Permissoes

Visual rules:

- Avoid giant JSON editors.
- Prefer cards/tables with inline editing.
- Show "last changed by" when possible.
- Changes generate audit event.
- Only Lider/Admin can edit operational configuration.
- Only Admin can edit permissions.

---

## 21. Audit UI

Audit table columns:

1. Date/time
2. User
3. Profile
4. Lead
5. Event type
6. Summary
7. Before/after shortcut

Do not show raw JSON by default.

Raw payload can be behind "ver detalhes tecnicos" and restricted to Admin.

---

## 22. Accessibility

Minimum expectations:

- Keyboard navigation for buttons, filters and drawer.
- Visible focus ring.
- All icon buttons have `aria-label`.
- Color is not the only signal: use text and icon.
- Badges must have readable contrast.
- Drawer close action must be keyboard accessible.
- Mobile touch targets at least 40px height.

---

## 23. Implementation guardrails

Frontend must not:

- Invent new statuses.
- Invent new queues.
- Treat result as queue.
- Finalize lost/disqualified from the attendant profile.
- Hide active lead without next action.
- Apply terminal lifecycle transitions only in UI state.
- Create a parallel UI component library.

Frontend should:

- Render from backend/domain state.
- Call transition/service APIs when available.
- Use the same labels defined in product/technical contracts.
- Keep components small and modular.
- Use UI Foundation in `apps/web/src/components/ui`.

---

## 24. First UI implementation scope

Recommended first real UI slice:

1. Mesa Operacional shell
2. Primary filters
3. Queue columns/tabs
4. LeadCard
5. LeadDrawer read-only summary
6. Mocked/static data adapter or existing dev data
7. No critical lifecycle mutation yet

Second slice:

1. Register follow-up result
2. Sem resposta
3. Follow-up long validation
4. Validate appointment
5. Leadership actions

This reduces risk and lets the user validate the visual layer before lifecycle mutation is wired.

---

## 25. Review checklist

Before accepting UI implementation, verify:

- The Mesa can be understood in 5 seconds.
- A card shows only one primary situation.
- Tags do not wrap or dominate the card.
- WhatsApp/copy are fast.
- Drawer explains current queue and next action immediately.
- Attendant cannot finalize lost/disqualified.
- Long follow-up warning is visible.
- Nutrition does not pollute the daily desk.
- Mobile is usable with one hand.
- The interface still feels like Clube04, not a generic CRM.
