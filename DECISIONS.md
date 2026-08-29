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
