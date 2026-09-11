# RSJ DIGITAL FABRIC — LOCKED DECISIONS (D1–D21)
**Read this WITH SCHEMA.md. Each decision carries its reasoning. A future session that knows the decision but not the reason will "helpfully" undo it. Do not undo any of these without a written amendment approved by the owner.**

| # | Decision | Reasoning (why it must not be reversed) |
|---|---|---|
| D1 | eCount ERP = system of record for statutory docs (LR-as-document, challan-as-document, invoices, e-way bills, GST, accounting ledgers). Fabric = SoR for rate/strike ledger, trip supervision, job cards, doc/cash custody, unit economics. | Two masters = reconciliation hell. eCount already does statutory correctly; competing with it recreates re-keying. |
| D2 | Bidirectional flow: fabric captures once → generates eCount Excel import templates (PUSH). eCount register exports pulled ONLY for reconciliation (PULL). Manual entry = flagged exception. | eCount's "Advanced Import V1" ingests Excel (LrEntry, FullLoad, Diesel, Toll, Cash/Bank Payment, JV). Capture-once kills re-typing; pull-for-checking keeps books honest. |
| D3 | One LR number, born on the physical paper LR book, registered in fabric, supplied externally to eCount. | eCount confirmed it accepts external LR numbers and never mints its own. Dual numbering would be a worse fraud vector than re-typing. |
| D4 | Challan = the trip (internal audit spine). LR = replaceable transactional micro-event (accident/reroute/transship → status ACTIVE/CANCELLED/REPLACED + replaces_lr_no). | Owner's own definition of RSJ practice. |
| D5 | LR carries TWO foreign keys (DO + Challan). Challan is NOT nested under DO. | Mixed-DO dispatches are rare but real (loose import cargo in empty export containers). Nesting would break on the edge case. |
| D6 | Fabric mints challan numbers, continuing the existing plain numeric series (43486…). No prefix. | Staff and eCount already use the series; anti-fraud value is in WHO mints and WHEN it's logged, not string cosmetics. |
| D7 | RSJ-DO-YY-NNNN = internal order FILE number, fabric-minted. The client's DO number is an attribute; UNIQUE(client_id, client_do_no). | DO numbers belong to CLIENTS: not unique across clients, formats vary, clients revise. Client DO can never be a primary key. |
| D8 | TripSheet = GENERATED view + completeness checklist (FILLED/MISSING/OVERDUE + owing role). Supervisor verifies and chases; never re-types departments' data. | Supervisor hand-filling 16 sections = re-keying disease reborn at supervisory level. |
| D9 | On-book policy: every rupee recorded. Sensitive categories (BORDER_FACILITATION) access-gated to Cashier+Directors, never omitted. | Omitted money is how the last fraud was paid. Owner chose transparency for future listing standards. |
| D10 | Google Workspace OAuth in production; Session.getActiveUser() is the identity spine; staging rows flagged PRE_AUTH_ERA. | Personal/shared Gmail = zero forensic auditability; getActiveUser is only reliable intra-domain. |
| D11 | Trip expense → child of Challan/LR. Maintenance → child of VEHICLE (optional LR ref for en-route breakdowns). | Tyres amortize across 60,000 km, not one trip's P&L. Trip-scoping maintenance destroys unit economics. |
| D12 | eCount role permissions restrict registers per role; FTL Register (contains Party Rate/Trans Rate/Net Difference = MARGIN) restricted to Traffic Head+. Everyone below sees fabric views only. | The FTL export leaks margin to any login that can run it — the fabric's role gates are pointless without this. |
| D13 | Build in 4 leak-driven slices: (1) money-spent-not-recovered → (2) supplier overpayment → (3) fleet leaks → (4) computed views. All registers get built; none simultaneously. | "Everything at once" = six months of nothing working at 60%. |
| D14 | Pre-intimation rule: bucket-C expenses above threshold are reimbursable only if intimated at/before spend. Late bills auto-flag; Cashier override requires logged reason. | Fake bills beat after-the-fact inspection. Pre-intimation converts casual fraud into premeditated conspiracy with timestamped evidence. |
| D15 | Rolling verification: plain-language operational walkthroughs per slice, not line-by-line schema reading by the owner. | Owner is not a developer; his job is truth about operations, not column names. Both walkthrough parts are COMPLETE. |
| D16 | Three-bucket expense taxonomy: A) TRIP_CASH — rate-card lump sum, driver keeps savings, NEVER itemized/audited; B) CLIENT_RECOVERABLE — receipt mandatory (money returns via invoice); C) EXTRAORDINARY — intimation mandatory. | Driver keeps bucket-A savings as income → no reimbursement → fake bills structurally impossible there. Control effort concentrates on C. Do NOT add receipt checking to bucket A. |
| D17 | Strike Ledger binds EVERYONE including the owner, but never slows anyone: instant awards allowed, post-award quotes stored, monthly HEAD report computes "cost of awarding fast." | An anti-fraud ledger with an owner exemption is worthless as evidence and precedent. |
| D18 | Garage approvals: Maintenance Manager records; OWNER one-tap-approves every job/spend (logged). No delegation ceiling. | Owner's explicit insistence (he sits in the garage). Bottleneck risk accepted and documented; revisit at >120 trucks or when approval latency parks trucks. |
| D19 | The deal-striker (Traffic Manager or owner) taps AWARD into the Strike Ledger at deal moment. System auto-carries vehicle/supplier/driver-contact/status to KAM's DO-LR-Challan view — PRICE NEVER SHOWN TO OR TYPED BY KAM. | KAM sees client freight (needs it for servicing). Giving KAM the supplier price = margin visibility in the client-facing department = collusion surface + third-person re-keying. |
| D20 | Policies: (a) intimation threshold ₹500, tolerance ±10% or ₹200 (larger), expiry trip-close+48h; (b) lot invoicing per-client: CLIENTS_MASTER.lot_invoicing_policy FULL_LOT_ONLY/SPLIT_ALLOWED; (c) supplier balance due = POD-at-office + N days, default N=30 (one config cell), per-supplier override. | Owner accepted all three recommendations 2026-08-13. N=30 locked per Amendment A4. |
| D21 | Workspace: one account per human, no shared logins; Groups (do@, billing@, accounts@, garage@) receive mail but never log in; owner's admin account separate from daily account; 2SV day one; drivers get NO accounts (~12–16 licenses). | The audit trail IS getActiveUser(); shared logins nullify every ledger row. |

## Also locked (no D-number)
- Purchase Manager role DISSOLVED — no 15th role. Challan entry lives in the fabric under Traffic; his A3 Master Book is replaced by generated views; the person is redistributed deliberately.
- Driver thumb/OTP acknowledgment on every DRIVER_RECOVERY_LEDGER entry: YES.
- Pilot: JNPT corridor (85% of volume), one Master, one Traffic Manager, two weeks, paper running in parallel.
- Baselines measured BEFORE go-live: unbilled detention count last quarter · cash-to-Masters vs receipts returned · % invoices >7 days after unloading · avg supplier payment delay.
- Labels: STRICTLY ENGLISH ONLY. Low-literacy accommodation = MCQ/icon/tap design, zero typing. No Hindi/Gujarati columns.
- Do NOT migrate the old DO Strike Board HTML; do NOT redesign the TripSheet visually. Correctness > polish.


## AMENDMENT A1 (2026-08-13) — Identity roster finalized (extends D21)
- **Platform locked: Google Workspace only. Outlook/M365 migration REJECTED** — the stack is Apps Script + Sheets + Session.getActiveUser(); Microsoft accounts cannot authenticate to it. Moving email to Outlook while running on Google Sheets = paying two vendors for one identity layer.
- **Rule: one paid account per human who WRITES to any register. Zero accounts for people who only talk, or only handle paper.**
- WRITERS — 13 accounts (revised per A6): owner · rahul (director) · admin@ (Workspace admin only, one trusted device, never daily use) · traffic head · cashier · KAM-import · KAM-export · Master-JNPT · Master-HAZIRA (individual — cash custody demands per-person floats and per-location LR books) · supervisor · billing · receivable · maintenance executive.
- NO accounts: Traffic Managers (phone network only — see A2) · drivers · CA · Maintenance Manager (paper; his executive is the system arm) · Collection Head IF same human as Billing head (else +1 account).
- Groups (free; receive mail; can never log in or write a ledger row): do@ · collections@ · garage@ · accounts@.

## AMENDMENT A2 (2026-08-13) — Strike entry concentrated (modifies D17/D19 mechanics, not principle)
Traffic Managers hold no accounts. All market-side quotes/awards are entered by the **Traffic Head** (owner for his own network). STRIKE_LEDGER gains `sourced_by_tm` (MCQ: static TM name list) so sourcing attribution survives without TM logins. Trade-off documented: `entered_by` for TM-sourced rows rests on the Head; compensating control — TMs can no longer write to the ledger at all, so the original fraud vector (a TM entering inflated rates himself) is removed by removing the hand; collusion now requires the Head. Revisit if TM count or volume grows.

## AMENDMENT A3 (2026-08-13) — Supervisor identity RETAINED; owner's "manual, unshared TripSheet" proposal REJECTED
D8 stands: TripSheet is a generated view; supervisor VERIFY/CHASE actions are logged writes and need his identity. A manual unshared TripSheet resurrects re-keying and deletes the completeness-chasing control — the disease this system cures. Supervisor keeps his account.

## AMENDMENT A4 (2026-08-13) — N=30 locked for supplier payment terms (D20c).

## AMENDMENT A5 (2026-08-13) — Owner's account is MANDATORY (correcting owner's own suggestion)
The owner proposed owners need no ID. Rejected: the owner is the single heaviest writer in the system — strike awards for his own network (D17), every garage one-tap approval (D18), breakdown intimations land on his phone (D14). Without his account, none of those controls exist. Owner gets a daily account; admin@ stays separate (D21).


## AMENDMENT A6 (2026-08-13) — Two Masters; field boys unnamed (OWNER VETO, recorded)
- Masters corrected to TWO humans with individual accounts: Master-JNPT and Master-HAZIRA (LR books are per-location; each Master consumes only his own book's leaves; each carries his own cash float).
- The 4 field boys (bike runners, no PC) get no accounts AND — by owner's explicit veto — no name attribution column in any register. Every entry is written by, and accountable to, the Master alone; boy-level problems are the Master's management problem, invisible to the ledger. Architect's recommendation of a `field_runner` MCQ column was REJECTED by owner. Do not add it later without a written amendment.
- Consequence accepted by owner: float shortages and lost documents resolve to the Master's identity only; the system will never narrow further.

## AMENDMENT A7 (2026-08-13) — Google Groups (free forwarding addresses, not accounts)
do@ · collections@ · garage@ · accounts@ are Google Groups: zero licenses, cannot log in, never appear in any ledger. External senders (clients/suppliers) must be allowed to post ("Anyone on the web can post" setting), else client mail bounces. Members receive each mail in their own personal inbox. Optional convenience — may be created any time, including post go-live.


## AMENDMENT A8 (2026-08-13) — FINAL ROSTER (16) + role-account ruling + two new roles
**Architect recommended named human accounts (D21); owner ruled ROLE-NAMED accounts on new information (single individual per seat, small company). Ruling ACCEPTED with one binding condition, below.**

**Binding condition:** USERS_ROLES becomes an append-only custody log (`holder_name`, `role_from`, `role_to`, `assigned_by`) + `account_type (HUMAN/TOOL)`. Handover = append a closing row and a new row + mandatory password reset; never edit or delete. Without this, a disputed 2027 row stamped `cashier@` cannot name a human. Service layer REJECTS writes from any TOOL account (admin@).

**FINAL: 16 paid accounts.**
owner@ · rahul@ · rohit@ · admin@ (TOOL) · traffichead@ · cashier@ · kam.import@ · kam.export@ · master.jnpt@ · master.hazira@ · supervisor@ · tracker@ · billing.sales@ · billing.purchase@ · receivables@ · maintenance@
- Spelling is matched character-for-character by the service layer. `master.jnpt@` / `master.hazira@` — symmetrical, not `hazira.master@`.
- **tracker@ ADDED** — owner confirmed tracking is a distinct person, not Traffic Head/Supervisor work. Every distinct human who writes needs an account.
- **billing split:** BILLING_SALES (client invoicing, sees client freight) and BILLING_PURCHASE (market-supplier bill verification, sees supplier cost). Deliberate segregation of duties; neither computes margin alone.
- owner@ retained as an operational seat distinct from the directors; shareholders are third parties with no operational involvement and no accounts. **Rule that still governs: one human = one writing account. If the same person ever holds two of these, deactivate one.**
- Groups (free, no license, cannot log in, never in USERS_ROLES): do@ · collections@ · garage@ · accounts@ — external posting must be enabled or client mail bounces (A7).

**Tracking is NOT a new register** — it is TRIP_EVENTS (§5.6) plus a worklist view. Legacy Tracker_Code.gs/Tracker.html are rewired in Deliverable 3, per CLAUDE.md.


## AMENDMENT A9 (2026-08-13) — KEM renamed KAM · USERS_ROLES seed · Groups & OU plan

**Rename:** KEM (Key Executive Member) → **KAM (Key Account Manager)** everywhere. Addresses: `kam.import@`, `kam.export@`. Service layer matches these strings exactly.

**USERS_ROLES seed data (holder as of go-live — first rows of the append-only custody log, A8):**

| Account | Holder | Role | Type |
|---|---|---|---|
| owner@ | Ranjit Jha | OWNER | HUMAN |
| rahul@ | Rahul Jha | DIRECTOR_1 | HUMAN |
| rohit@ | Rohit | DIRECTOR_2 | HUMAN |
| admin@ | — (super admin, no daily use) | WORKSPACE_ADMIN | **TOOL** |
| traffichead@ | RB Singh | TRAFFIC_HEAD | HUMAN |
| cashier@ | Vikas | CASHIER | HUMAN |
| kam.import@ | Pankaj | KAM_IMPORT | HUMAN |
| kam.export@ | Dipak | KAM_EXPORT | HUMAN |
| master.jnpt@ | Raju | MASTER_JNPT | HUMAN |
| master.hazira@ | Brijmohan | MASTER_HAZIRA | HUMAN |
| supervisor@ | Suresh | SUPERVISOR | HUMAN |
| tracker@ | Samarth | TRACKER | HUMAN |
| billing.sales@ | Sarjerao | BILLING_SALES | HUMAN |
| billing.purchase@ | Anshika | BILLING_PURCHASE | HUMAN |
| receivables@ | Rajesh | RECEIVABLE_EXE | HUMAN |
| maintenance@ | Rajnish | MAINTENANCE_EXEC | HUMAN |

**Groups — SUPERSEDED by Amendment A10. See A10 for the final group roster.**

*(historical, A9 version:)*

| Group | Type | Members |
|---|---|---|
| do@ | External (clients send DOs) — Collaborative Inbox ON | kam.import, kam.export |
| collections@ | External (client payment queries, remittance advice) | receivables, billing.sales |
| accounts@ | External (supplier/vendor bills, payment queries) | billing.purchase, cashier |
| garage@ | External (parts vendors, workshops, insurance/RTO agents) | maintenance, cashier, owner |
| escalations@ | External, optional (client escalations to directors) | rahul, rohit |
| business@ | **Internal only** — ops announcements + Drive/Calendar permissions | traffichead, kam.import, kam.export, master.jnpt, master.hazira, supervisor, tracker, owner |
| finance@ | **Internal only** — announcements + permissions | cashier, billing.sales, billing.purchase, receivables, rahul, rohit |

- External groups: "Who can post" = **Anyone on the web** (else client/supplier mail bounces). Internal groups: organization only.
- **Collections ≠ invoicing ≠ accounts.** They are deliberately three separate flows (money in / invoice creation / money out). Never merge them into one address: doing so puts client freight and supplier bills in the same inbox and hands margin to both billing seats — undoing A8's segregation.
- **finance@ and business@ are for announcements and permission-granting ONLY. Never route invoices, supplier bills, or rate documents through them.** Documents flow through the fabric, not group mail.

**Organizational Units (OUs) — verdict: not needed beyond one.**
OUs control *settings/policy* (which apps are on, 2SV, device rules); Groups control *mail routing and access*. A user sits in exactly one OU but many groups. At 16 accounts there are no real policy differences to enforce, so: keep everyone in the root OU with domain-wide 2SV, and create ONE child OU — "Tools" — containing `admin@` only, with stricter settings (security key required, no add-ons). Do NOT build a department OU tree to look tidy: moving users between OUs silently changes their settings and creates maintenance burden with zero benefit at this size.


## AMENDMENT A10 (2026-08-13) — FINAL group roster (supersedes A9's group table)

**Nine groups. All free, no licenses, cannot log in, never appear in USERS_ROLES.**

| Group | Purpose | Post setting | Members |
|---|---|---|---|
| do@ | Clients send Delivery Orders. **Collaborative Inbox ON** (assign/resolve, so both KAMs don't reply to the same mail) | Anyone on the web | Pankaj, Dipak |
| collections@ | Clients: payment advice, invoice queries | Anyone on the web | Rajesh, Sarjerao |
| accounts@ | Suppliers/vendors: bills, TDS, payment queries | Anyone on the web | Anshika, Vikas |
| garage@ | Parts vendors, workshops, insurance/RTO agents | Anyone on the web | Rajnish, Vikas, Ranjit, Rohit |
| escalations@ | Client escalations to directors. **Two members minimum — a single-member escalation channel is a single point of failure** | Anyone on the web | Rohit, Rahul |
| **business@** | **PUBLIC — the address printed on the website.** Inbound new-business enquiries only | Anyone on the web; spam moderation ON; "who can view members" = members only (anti-harvesting) | Rahul, Rohit (+ KAMs if enquiry volume grows) |
| ops@ | **Internal only** — ops announcements + Drive/Calendar permission target | Organization only | RB Singh, Pankaj, Dipak, Raju, Brijmohan, Suresh, Samarth |
| management@ | **Internal only** — announcements + permission target | Organization only | Ranjit, Rahul, Rohit |
| finance@ | **Internal only** — announcements + permission target | Organization only | Vikas, Sarjerao, Anshika, Rajesh, Rahul, Rohit |

**Binding rules:**
1. **Never use a public-facing group as a Drive/Calendar permission target.** business@ is published on the website; permission groups are ops@ / management@ / finance@ only. Mixing them means a membership misconfiguration on a public address could hand internal file access to an outsider.
2. **finance@ holds both billing seats** (Sarjerao = client freight, Anshika = supplier cost). Announcements and permissions ONLY — never route an invoice, supplier bill, or rate document through it, or both seats can compute margin (undoes A8 segregation).
3. Collections ≠ invoicing ≠ accounts — three separate flows, never merged into one address.
4. business@ may carry aliases (e.g. info@, contact@) rather than creating separate groups.
5. Every employee belongs to at least one internal group, so permission-granting is never done person-by-person.


## AMENDMENT A11 (2026-08-30) — Fourth expense bucket: D_DIRECT_COMPANY (extends D16)
Ruled by the owner at Checkpoint #2. D16's three buckets classify money that moves through a **driver**: his rate-card lump sum (A), what the client repays (B), extraordinary spend needing pre-intimation (C). Diesel and toll on own trucks move through no driver — they are direct company operating costs and fit none of the three. Forcing them into A would switch on the receipt-chasing D16 explicitly forbids there; into B would misstate recoverability. Bucket **D_DIRECT_COMPANY** added: company-paid operating costs, receipts kept as ordinary company records, no driver-audit implications. Seeded defaults: DIESEL → D, TOLL → D. **OTHER keeps a blank default deliberately** — it has no honest default, so its bucket is chosen at entry time.

## AMENDMENT A12 (2026-08-30) — Supplier deductions become a child register
Ruled by the owner at Checkpoint #2. One supplier bill routinely carries several deductions at once (TDS + negotiated detention chargeback + occasional damage), so a single `deductions` column cannot hold the truth. SCHEMA.md §5.13's packed column is replaced by register **§5.14 SUPPLIER_PAYABLE_DEDUCTIONS**: `deduction_id (DED-YY-NNNNN) · payable_id (FK) · deduction_type (SHORTAGE / DETENTION_CHARGEBACK / TDS / DAMAGE / OTHER) · amount · reason · entered_by · ts`. The auto-generated payment advice — the breakup sheet suppliers demand — itemizes from these rows.

## AMENDMENT A13 (2026-08-30) — Collection Head = Billing (Sales) head; role list finalized at A9's 16
Ruled at Checkpoint #2: the Collection Head and the Billing head are the **same human**, so per A1's own conditional ("Collection Head IF same human as Billing head — else +1 account") there is **one seat, one login**. No COLLECTION_HEAD role or account exists. The fabric's role list is exactly A9's 16 accounts; SCHEMA.md §3.1's older 14-role eCount mirror (VIEW_ONLY, COLLECTION_HEAD, TRAFFIC_MANAGER as fabric roles) is historical and superseded — TMs hold no accounts per A2, and read-only access is a Phase-2 permission concern, not a seat.

---

## AMENDMENT A14 (2026-08-30) — Challan birth is PER-SERIES; alphanumeric key (supersedes D6's single-counter model; D6's principle — WHO mints and WHEN it's logged — stands)

**New facts that forced this:** (1) The printed paper challan book CONTINUES after go-live at JNPT — the printer pre-prints strict serial numbers on the book; the fabric cannot mint what the printer already printed. (2) Hazira has NO paper book — its series has been maintained digitally since day 1, currently in the 9000s, and must carry an `H` marker. (3) The owner's April register shows leaves 42938/42939 pulled forward to record 31-March trips and struck through — proof that a free-running counter cannot represent real book behaviour; a leaf registry can. (4) eCount confirmed in writing that the trip/challan number field accepts externally supplied ALPHANUMERIC values (confirmation ref: **WhatsApp message from the eCount executive**, date: **10-09-2026** (10 September 2026) — this is load-bearing for Phase 4; preserve an export/screenshot of that message with the project records, since a chat message is easier to lose than an email thread).

**Ruling:**
- **JNPT (paper book series, bare numeric):** the printed book is the mint, exactly as the paper LR book is for LR numbers (D3 logic). The fabric runs a **CHALLAN_BOOK_REGISTRY** (books + leaves, mirroring §5.5's two-sheet structure): each book registered with its printed range; each leaf goes BLANK → USED exactly once, or BLANK → CANCELLED with a mandatory reason. The dispatch screen offers the next BLANK leaf of the active book; the exec writes that number on the paper. Fabric and book cannot drift because the fabric is the book's index.
- **JNPT keeps BARE numbers — no `J` prefix.** The paper prints bare numbers and eCount history is bare numeric; a prefix would create two names for one document — the dual-numbering disease D3 exists to kill. Rule: **no prefix = JNPT legacy series; letter prefix = that location's own series.** Collision impossible by construction.
- **Hazira (no paper book):** the fabric genuinely mints — a dedicated counter in ID_COUNTERS, continuing the existing series, format `H<number>` (e.g. H9123). This is what D6 originally imagined, now scoped to Hazira only.
- **Future bases (Baroda/Mundra/…):** each gets its own letter prefix + own fabric counter, on the Hazira pattern. No new paper books will be commissioned.
- **Key mechanics:** `challan_no` stays the PRIMARY KEY, now alphanumeric, globally unique across series. CHALLAN_REGISTER gains two derived columns: `challan_series` (JNPT / HAZIRA / …) and `challan_seq` (numeric part) — because text-sorting lies ("H9999" > "H10000" as text) and every range/ageing report needs the clean number.
- **Cancelled leaves live in the registry, not in CHALLAN_REGISTER.** A cancelled leaf never became a trip; it must not occupy a trip row. (The 42938/42939 case becomes: two leaf rows CANCELLED with reason "used out of sequence for prior-period trips", plus two USED leaves for the actual trips.)
- **`CHALLAN_SEED` (single script property) is RETIRED.** Replaced by the go-live-morning ritual in A15.

**Why it must not be reversed:** reverting to a single counter re-creates the drift between fabric and paper that the owner's own register photographs prove; reverting the bare-JNPT rule creates dual numbering; reverting the alphanumeric key strands Hazira outside the system.

---

## AMENDMENT A15 (2026-08-30) — Backfill & seeding resolved (closes SCHEMA §10 item 18); OWNER REPLACED his April-backfill wish

**Owner's ruling (signed off via Rahul, 2026-08-30):** the FY-April full-history transcription wish is WITHDRAWN. Test window is **strictly ≤ 2 weeks of history**, followed by rapid cutover to live operations once core verification passes. No multi-month parallel run.

**Ruling:**
- **Two doors, per series.** The MINTING door issues new numbers for live trips only (JNPT: next BLANK leaf from the registry; Hazira: the counter). The TRANSCRIPTION door (Phase 2 build) accepts historical trips carrying the challan numbers they already own — copied, never minted.
- **Transcription validation is per-series:** JNPT backfill numbers must fall inside a registered book's printed range and be unused; Hazira backfill numbers must be below the counter seed and match the `H` format. Duplicates rejected structurally.
- **Every backfilled row carries an era flag** (`BACKFILL_ERA`, same mechanic as D10's `PRE_AUTH_ERA`). Anti-fraud ledgers must never let a September-entered April trip masquerade as a live-supervised one. Baselines and reports count controlled data only.
- **eCount push for backfilled rows stays WITHHELD** pending the CA's ruling on entering past periods into statutory books (likely moot at a 2-week window, but the gate stays).
- **Seeding happens on GO-LIVE MORNING, not before.** At ~100 challans consumed per 2–3 days, any number captured earlier is stale by lunch. The ritual (replaces DEPLOY.md step 6): (1) register the JNPT book currently in play — its printed range and the next blank leaf as of that morning; (2) set the Hazira counter to that morning's next number. Both entered as Script Properties / registry rows by the owner-supplied values, never invented.

**Why it must not be reversed:** seeding early or seeding historically mints numbers that collide with paper already written — the duplicate error comes from inside the house.

---

## AMENDMENT A16 (2026-09-11) — Org structure ratified · seat-cover rules · standing strike-ledger report

**Signed off by Rahul, 2026-09-11.** `ORG_STRUCTURE.md` moves from PROPOSED to **APPROVED** and becomes the canonical org reference for the fabric. Its §1 rulings R1–R9 (Master split by location not direction · Tracker retained under Traffic · three money flows but two seats · Supervisor and Cashier cross-cutting · billing.purchase in the finance layer · no EWB clerk seat · Traffic Managers as boxes with no logins · drivers on a dual line · "TO-PAY" is an attribute not a role) are ratified as written. The older `rsj_pipeline_refined.png` is **retired** and must never be used as a reference again — it names seats that do not exist.

Two gaps were found by drawing the structure out, and both are closed here.

### A16.1 — Seat cover: the deputy clause

**The gap:** sixteen seats, sixteen humans, no cover, and D21 forbids shared logins. The day a Master is absent, either dispatch stops or somebody borrows a password — and a borrowed password nullifies every ledger row written that day. Nothing in the roster said which.

**Ruling — cover has three shapes, in strict preference order:**
1. **COVER UNDER OWN LOGIN (default).** A seat that already holds the permission does the work as itself. Attribution stays truthful, no seat goes dark, no password moves.
2. **CUSTODY SWAP (last resort).** A real A8 handover: closing row + new row in USERS_ROLES with `assigned_by`, the covering human's own row set inactive for the duration (one human never holds two active writing accounts), password reset on return.
3. **STOP.** The work waits, where waiting costs nothing.

Sharing a password without a custody row is never a fourth option.

| Seat | Rule | Cover |
|---|---|---|
| master.jnpt@ | Cover under own login | traffichead@ taps the challan/LR leaf; cashier@ issues the float direct to `driver_id`; receipts transcribed on return as `LR_TRANSCRIBED` |
| master.hazira@ | Cover under own login | Same — and the only way a Hazira `H<number>` gets minted that day |
| kam.import@ | Cover under own login | kam.export@ (direction is a DO column, not a permission) |
| kam.export@ | Cover under own login | kam.import@, mirrored |
| tracker@ | Stop, ceiling 2 working days | Nobody else writes `PHONE_REPORTED`; the worklist ages visibly |
| cashier@ | **Custody swap, named** | rahul@ (fallback rohit@). Float at handover cannot wait; no other seat approves bucket-C |

**Barred covers for cashier@, permanently:** traffichead@ (award + cash in one hand) and billing.purchase@ (bill verification + payment in one hand). A cover rule that re-merges two deliberately segregated seats is worse than a stopped day, because the stopped day is visible and the merge is not.

**Duration ceiling: 2 working days.** Beyond that the owner assigns a custody row to a director. Reason: the Traffic Head covering a Master concentrates award and dispatch in one hand — tolerable for a day under his own name with the strike ledger still append-only, not for a week.

**Build impact: none beyond gate tests.** Cover is a permissions fact, not a feature. Any proposal for a "delegation screen" is refused — that is a second identity system beside USERS_ROLES.

**Three gate tests added to `ORG_STRUCTURE.md` §6; Phase 2 now passes G1–G24, not G1–G21:**
- **G22** — traffichead@ taps the next BLANK JNPT challan and LR leaf and mints a Hazira challan → ALLOW. G14's "own book only" binds the two Masters to each other's books, never the Traffic Head.
- **G23** — kam.export@ writes a DO with `direction=IMPORT` → ALLOW. Scoping KAM writes by direction would make mutual cover impossible.
- **G24** — rahul@ holds cashier@ via a custody row while his own row is inactive → cashier@ writes ALLOW, rahul@ writes REJECT.

### A16.2 — The strike ledger acquires a reader

**The gap:** margin is computable by exactly four logins — owner@, rahul@, rohit@, traffichead@ — and **two of them write the awards**. The only independent readers are the two directors, and no seat had a *duty* to look. The Supervisor, the single cross-cutting verifier, is deliberately rate-blind (G6). D17's monthly "cost of awarding fast" report was a report someone had to remember to run.

**Ruling:** the monthly HEAD report becomes a **scheduled Apps Script trigger**, mailing **rahul@ and rohit@ on the 1st of every month**, unrequested. A month with nothing to report still sends the mail — an empty report proves the trigger is alive, a missing report is indistinguishable from a disabled one. It lands with **Slice 2** (it needs live STRIKE_LEDGER data); until then the duty is manual and sits with rahul@.

**Never reversible to "on request":** the person who stops triggering it would be the person the ledger exists to watch. **And the fix is never to give the Supervisor rate visibility** — that hands margin to the seat that talks to every department daily, widening the collusion surface instead of closing it.

**Why A16 must not be reversed:** without §8 the first absence produces a shared password, and a shared password retroactively voids the audit trail that every other control in this system rests on (D10, D21). Without §9 the anti-fraud ledger is written by the people it watches and read by nobody — which is an archive, not a control.

**Open item riding with A16 (owner to confirm, not blocking Phase 2):** on a cover day, can the Traffic Head physically be at the port to tap the driver's advance in front of him (§5.8's voucher-at-handover rule), or does a runner hand the cash and the tap happen later from the office? If the latter, a written one-day exception is required stating that `issue_ts` records the office tap with the handover evidenced on paper. Do not leave this to improvisation — the first improvised answer becomes permanent practice, and an evening voucher written from memory is precisely what §5.8 abolished.

---

## AMENDMENT A17 (2026-09-11) — Cash handover is digital-first: the fabric mints the number before the cash leaves (replaces §5.8's voucher-at-handover rule; closes ORG_STRUCTURE.md §7 item 5)

**New fact that forced this (owner confirmed via Rahul, 2026-09-11):** at JNPT a **bike runner already carries the driver's advance on ordinary days**. The Master does not hand it over personally. This was discovered while drafting a one-day exception for the days the Master is absent — and it means §5.8's main rule, not its exception, was the clause describing a day that does not exist. The earlier draft regulated roughly one day a month and left roughly 25 handovers a day untouched.

**What was asked for, and what was ruled instead.** The owner and Rahul agreed to "a written 1-day paper voucher exception." Two problems. First, a paper voucher can be written at any hour from memory, which is exactly the artifact the v3 rule abolished; legitimising it for one day legitimises it permanently. Second, and larger: an exception for absent days is the wrong instrument when the normal day has the same gap. **Ruling: the voucher stays digital and is minted before the cash leaves the office, every day. Paper is demoted to an acknowledgment of receipt.** The mechanics are written into SCHEMA.md §5.8 and are binding as written there.

**Why the ordering rule is the right control.** The v3 rule tried to guarantee honesty by co-locating the tap and the handover — put the Master, the driver and the phone in the same place. That works only if the Master is in that place, and at JNPT he is not. The replacement guarantees honesty by **ordering** instead of co-location: the record exists before the money moves, so the record cannot be reconstructed after the fact to match whatever was spent. A17 gives up a weaker property nobody was achieving and buys a stronger one that survives the runner, the absent Master, and the busy day.

**A6 is untouched.** Runners remain unnamed; ordinary-day shortages still resolve to the Master, because the Master is the login that minted the float row. Only cover days move custody, to cashier@, and only because there is no Master that day to carry it.

**Acknowledgment method — for anyone tempted to improve it:** true OTP to the driver's phone is **not available**. Apps Script has no SMS path (MailApp only) and drivers hold no accounts. THUMB and PHONE_CONFIRMED are the two honest options. Do not write an OTP requirement into a screen that cannot deliver one.

**Two gate tests added (Phase 2 now passes G1–G26):**
- **G25** — create a CASH_FLOAT row whose `handover_ts` is earlier than its `issue_ts` → REJECT, in both handover modes.
- **G26** — set `reconcile_status = BALANCED` on a row with `driver_ack_method = NONE`, or before the slip is recorded at the office → REJECT.

**Build impact:** SCHEMA.md → **v6**. Five columns on §5.8 (header rewrite, flagged MIGRATED), three new dropdown lists, `verify` re-run. Unlike the withdrawn draft, this is **on the main path**, so Slice 1's Master screens must carry the one-tap acknowledgment step from the start — it is not a rare-case afterthought.

**Why it must not be reversed:** the entire control is one ordering fact — the record exists before the money moves. Any reversal to "record it after, for speed on a busy day" restores the evening voucher written from memory, and does so on the busiest days, which are exactly the days worth stealing on.

**Consequential defect flagged, not yet fixed (needs its own amendment):** A16's gate test **G22** assumes the Master normally taps the JNPT challan leaf and the Traffic Head does so only as cover. SCHEMA.md §8 and CONTEXT.md both place challan entry under Traffic, while ORG_STRUCTURE.md §5 step 4 places it with the Master. The two cannot both be right and Phase 2 gates cannot be written against a contradiction. Pending ruling, blocked on one fact: **where the printed JNPT challan book physically sits — office or port.**

---

## AMENDMENT A18 (2026-09-12) — Challan is an office document, LR is a field document (resolves the §8 / ORG_STRUCTURE §5 contradiction; corrects A16's G22)

**New fact that forced this (owner confirmed via Rahul, 2026-09-12):** the printed JNPT challan book is **physically kept in the Sanpada office**, not at the port.

**The contradiction it resolves.** SCHEMA.md §8 gave CHALLAN_BOOK_REGISTRY write to the Traffic Head and read-only to the Masters, and both CONTEXT.md and the v3 changelog record that challan entry moved "under Traffic" when the Purchase Manager's seat was dissolved. ORG_STRUCTURE.md §5 step 4, as first written, had the Master tapping the challan leaf at dispatch. A16's gate test G22 was written on that second reading and treated the Traffic Head's challan tap as *cover* for an absent Master. Both readings cannot be true, and Phase 2 gates cannot be written against a contradiction.

**Ruling:**
- **The challan is an office document.** traffichead@ taps the next BLANK leaf of the ACTIVE JNPT book from the Sanpada office and writes the number on the paper challan there; for Hazira he triggers the `H<number>` counter. CHALLAN_REGISTER rows are born RELEASED under his login. Masters read CHALLAN_BOOK_REGISTRY and never write it. This is not cover; it is his ordinary job on every day.
- **The LR is a field document.** The LR book is per-location with its Master (A6, D3). master.jnpt@ / master.hazira@ tap the next BLANK leaf of their own book and write the LR row **in the same action** — one hand, one number, no relay.
- **The two documents meet by selection, never by typing.** The Master's LR screen offers only challans in status RELEASED that still lack their full LR set; he picks one. There is no free-text challan field anywhere a Master can reach. This is the same zero-re-keying principle as D7 (RSJ-DO picked from a list), applied one level down.
- **Cover (§8 of ORG_STRUCTURE.md) is therefore about the LR only.** On a Master's absent day traffichead@ taps the next BLANK LR leaf of that port's book and writes the LR row under his own login. This needs W on LR_BOOK_REGISTRY leaves and LR_REGISTER, which §8 of SCHEMA.md previously withheld from him — corrected by this amendment. Granted unconditionally, not "on cover days" — a conditional permission is a second identity system, and G14 already prevents the only real danger (a Master reaching into the other Master's book).

**Gate tests corrected and added:** G15 and G16 now name traffichead@ as the requester and add the Master's REJECT case; G22 is rewritten to the LR-only cover; **G27** (Master types or picks a non-RELEASED challan → REJECT) and **G28** (Master writes a challan leaf → REJECT) are added. Phase 2 passes **G1–G28**.

**Why it must not be reversed:** putting the challan tap at the port would require either moving the paper book to the port (two hands in one book — the drift A14 exists to prevent) or phoning the number from the office to the port to be written by hand — a relay of a minted number, which is the re-keying disease in its purest form. Keeping the tap where the book physically is costs nothing and closes both.

**Standing principle this amendment makes explicit (already true of A14, D3 and A17, now named):** *every number that appears on paper was minted or indexed in the fabric first.* Challan leaf, LR leaf, float_id. Paper carries numbers; paper never creates them. Any future document that needs a serial gets the same treatment — a leaf registry if pre-printed, a counter under LockService if not — and never a fourth paper book.

---

## AMENDMENT A19 (2026-09-12) — Owner-dictated awards get a second hand (extends D17/A2; corrects A5's premise)

**New fact (Rahul, 2026-09-12):** the owner does not tap his own network's awards. He dictates the final agreed supplier price to RB Singh, who records it — and that recorded figure is what is later used to verify the supplier's bill. A5 gave the owner an account on the premise that he is the heaviest writer of awards. In practice he writes none.

**Why this is the most serious fact found this week:** `traffichead@` therefore holds the pen on the entire strike ledger — TM-sourced deals (A2 already accepted that concentration) *and* owner-sourced deals. The original fraud this system exists to stop was a traffic person changing a number between the phone call and the register. Today the number the owner says and the number the Head writes are two different facts, and only the second is recorded. Because the recorded figure drives bill verification, an inflated transcription is paid.

**Ruling — a two-hand rule that leaves the owner's habit alone:**
- The Head enters the award as today, with `sourced_by_tm = OWNER` (the existing MCQ column gains that value; TM names remain for TM-sourced rows).
- The row is born **UNCONFIRMED**. Dispatch proceeds at once — D17's "never slows anyone" holds; the ledger records instantly.
- The owner **confirms by one tap** on his phone — the same mechanic D18 already gives him for every garage approval. The confirmation is a new STRIKE_LEDGER row, `event_type = OWNER_CONFIRM`, `refers_strike_id` → the award. Append-only is preserved; nothing is edited.
- **What the confirmation gates is payment, not dispatch:** `billing.purchase@` cannot verify a supplier bill against an owner-sourced award that has no OWNER_CONFIRM row. An inflated transcription now requires the owner to tap yes to a number he did not say.
- Owner-sourced rows are now separable in the monthly "cost of awarding fast" report (A16.2) by `sourced_by_tm = OWNER`, which the earlier practice made impossible.

**Not chosen:** requiring the owner to tap the award himself. A17 and A18 both showed that a rule describing a handover that does not happen is not a control. Confirmation fits the habit; entry does not.

**Gate tests G40–G42** (PHASE2_GATES.md §D). **Bottleneck note:** this adds to the owner's one-tap queue already accepted under D18; the same revisit trigger applies (>120 trucks, or when unconfirmed awards start delaying supplier payment beyond N=30).

**Why it must not be reversed:** removing the confirm restores a ledger written entirely by the seat the original fraud came from, with the owner's own deals inside it and no record of what he actually said.

---

## AMENDMENT A20 (2026-09-12) — The breakdown call: intimation right goes to a named set of seats (resolves §5.12's delegation slot)

**New fact (Rahul, 2026-09-12):** there is no fixed person for breakdown or accident calls. The driver calls everyone, starting with the owner, and talks to whoever picks up.

**Ruling:** the fact becomes the rule. EXPENSE_INTIMATIONS may be written by any of **eight seats** — owner@, rahul@, rohit@, traffichead@, master.jnpt@, master.hazira@, tracker@, maintenance@ — under the login that took the call. (maintenance@ added by Rahul, 2026-09-12: breakdown calls routinely reach the maintenance desk. Safe despite that seat also recording the resulting job card, because cashier@ approves the expense (G17) and owner@ approves the job card (G19) — two independent hands already sit in that path. cashier@ was considered and deliberately excluded: he approves bucket-C spend, and the approver should not also be the intimator.) §5.12's "delegation slot" is removed; there is nothing to delegate because the right is already distributed. All other seats are refused (kam.*@, billing.*@, receivables@, supervisor@, cashier@ — none of them should be taking a breakdown call, and if one does, the fabric should say so).

- The intimation screen must be on all eight phones, and it must be a 15-second entry (category, estimate, place — all MCQ). If it is slower than the phone call, it will not be used.
- The **phone rota** — who is expected to be reachable at 2 a.m. — is a paper problem for the owner, not a register. Do not build a rota into the fabric.
- D14 is unchanged: a bucket-C spend not intimated by any of the eight before the money moved is `POST_FACTO_FLAGGED` and needs Cashier override with reason. The monthly directors' report (A16.2) carries the count of POST_FACTO_FLAGGED rows; a rising count means calls are being taken by people outside the seven, or not logged.

**Gate test G43** (PHASE2_GATES.md §E).

---

## AMENDMENT A21 (2026-09-12) — Two design rulings and the reset ritual

**Ruling 1 (Rahul chose option A): the system re-hashes register contents to detect silent hand edits.** The hash chain protects AUDIT_LOG; it does not by itself see a cell changed directly in a register sheet by the file owner, whom Google will never lock out.
- A nightly time-driven trigger hashes each of the **eleven append-only registers** (CLAUDE.md rule 2's ten + USERS_ROLES, which A8 made append-only and rule 2 omitted — corrected here) and appends one `REGISTER_SNAPSHOT` row per register to AUDIT_LOG. The snapshot hash therefore sits **inside the chain**: hiding a hand edit means editing the register *and* the snapshot *and* every hash after it.
- On mismatch the next run appends `REGISTER_TAMPER` naming sheet and row, and `verify` reports it. Detection, not prevention — which is D17's spirit for the owner.
- Non-append registers (masters, DO, CHALLAN, LR, floats, pouches) get a row-count and last-modified check nightly, not a full hash — they change legitimately all day.
- Google's own revision history on each workbook is the free second witness; nobody, including the owner, can erase it. Any REGISTER_TAMPER is investigated there first.

**Ruling 2 (Rahul): the ≤ 2-week backfill window is enforced in code.** The transcription door refuses any trip dated more than 14 days before `GO_LIVE_DATE`, a script property set on go-live morning as the third item of the ritual (with the JNPT book registration and the Hazira counter). Never set early.

**Fact 3 (sixteen seats, sixteen humans):** confirmed as of 2026-09-12 with A13's merge reflected. It is a fact with a date: it is re-confirmed the morning the roster is seeded, and any merge found then deactivates one account per A8.

**Fact 4 (password resets):** Rahul performs the 16 handover resets from `admin@` on the trusted device. Each reset is recorded on the corresponding USERS_ROLES custody row as `assigned_by = rahul@` — never admin@, which cannot write. The reset precedes the row's `role_from`; an account with prior data (kam.export@ was seen with usage) must not receive a `role_from` earlier than its own reset.

**Gate tests G29, G30, G37, G38, G39** (PHASE2_GATES.md).

**Why these must not be reversed:** without ruling 1 the owner's file ownership is an unmonitored back door into every ledger; without ruling 2 the two-week window is a promise, and promises about backfill are how a September-entered April trip becomes "live-supervised" data.

---

## AMENDMENT A22 (2026-09-12) — Invoice write-off and amount reduction require a director's approval row (closes the A13 single-seat exposure)

**Ruled by Rahul, 2026-09-12.** A13 put collection and billing (sales) in one seat because they are one human. That is correct and stays. But it leaves `billing.sales@` as the only seat in the company that both raises an invoice and closes it, and the single act that seat could perform alone to lose money is quietly reducing or writing off what a client owes. Nobody downstream would see it: INVOICE_TRACKER is not append-only, and A21's nightly re-hash covers the append-only registers only.

**Ruling:**
- `collection_status = WRITTEN_OFF`, and any reduction of `invoice_amount` after `submitted_ts` is set, require an approval row from **rahul@ or rohit@**. Not owner@ — he is already the sole approver for every garage job (D18) and now every owner-sourced award (A19); receivables is the one queue he is not in, and §10 item 14 warns about that phone. Not billing.sales@ itself, obviously.
- The approval is durable in two places: three new columns on §5.11 (`writeoff_approved_by` · `writeoff_approved_ts` · `writeoff_reason`, reason mandatory) **and** an `INVOICE_WRITEOFF_APPROVE` row in the hash-chained AUDIT_LOG — because INVOICE_TRACKER itself is mutable and gets only a row-count check under A21, the chained row is the evidence that survives.

**Deliberately NOT gated: `DISPUTED`.** A dispute is a fact about the client's behaviour, not a reduction of what is owed, and it must be recordable the hour it happens or the receivables ageing lies. Requiring a director's tap to record a dispute would push disputes into somebody's memory — the disease this system exists to cure. Same principle as D17: let the event be recorded instantly, audit it afterwards. `PART_PAID` is likewise free.

**Gate tests G44 (reject) and G45 (allow).** G45 is the negative control: without it, an over-tight implementation that blocks DISPUTED would pass the suite and break collections on day one.

**Why it must not be reversed:** A13's one-seat ruling is only safe while the seat cannot move money on its own. Remove the director row and A13 becomes the single unguarded path from "client owes us" to "client doesn't", authored end to end by one login.
