# RSJ CARRIERS — MASTER SCHEMA (APPROVED)
**Status: APPROVED — Checkpoint #1 closed 2026-08-13. Phase 1 / Slice 1 build AUTHORIZED. This file is the canonical schema; all code conforms to it. Changes require a versioned amendment, never a silent edit.**
Date: 2026-08-13 · Supersedes all SCHEMA_DRAFT_v* files (delete them from the project)

**CHANGELOG FINAL → v4 (Checkpoint #2 closed 2026-08-30 — Amendments A11–A13 + Phase-1 build resolutions)**
1. **A11 — fourth expense bucket D_DIRECT_COMPANY** for costs moving through no driver (diesel/toll on own trucks). DIESEL → D, TOLL → D; OTHER's default stays blank by design (picked at entry). Extends D16 without weakening it.
2. **A12 — deductions child register:** §5.13's packed `deductions` column removed; NEW §5.14 SUPPLIER_PAYABLE_DEDUCTIONS (one row per deduction; payment advice itemizes from it). New ID: DED-YY-NNNNN.
3. **A13 — role list finalized at A9's 16 accounts.** Collection Head = Billing (Sales) head, same human, one seat. §3.1's 14-role list superseded.
4. **Phase-1 build resolutions folded in:** vernacular label columns removed from §3.2 (English-only lock) and `default_bucket` added · §4.1 `kem_owner` → `kam_owner` (A9) · §4.4 `pan/gst` → `pan_gst` · packed columns split (`ecount_push_template`+`ecount_push_batch_id`; `opened_by`/`opened_ts`/`closed_by`/`closed_ts`) · §5.5 built as two sheets (LR_BOOK_REGISTRY_BOOKS / LR_BOOK_REGISTRY_LEAVES) · §6.8 gains `driver_ack_method (THUMB/OTP)` + `driver_ack_ts` (the locked thumb/OTP acknowledgment now has columns).

**CHANGELOG v3 → FINAL (closure decisions)**
1. D19 **KAM price-entry resolved:** the deal-striker (Traffic Manager or owner) taps the AWARD into the Strike Ledger at the moment of the deal; the system auto-carries vehicle, supplier name, driver contact, and dispatch status onto the DO-LR-Challan view for KAM/client servicing — **price never shown to, or typed by, KAM**.
2. D20 **three policies locked:** (a) intimation threshold ₹500, bill-match tolerance ±10% or ₹200 whichever larger, intimation expiry 48h after trip close; (b) lot invoicing per-client — CLIENTS_MASTER gains `lot_invoicing_policy (FULL_LOT_ONLY / SPLIT_ALLOWED)`, set by asking each client; (c) supplier balance due = POD/LR-return-at-office date + N days, **company default N = 30 (locked by owner, single config cell)**, per-supplier override column honoured.
3. D21 **Workspace identity plan:** one account per human, no shared logins; Groups (do@, billing@, accounts@, garage@) for role mail — groups never log in; owner's admin account separate from daily account; 2SV enforced domain-wide day one; drivers get no accounts (~12–16 licenses).
4. **Purchase Manager role dissolved** — no 15th seat; challan entry moves into the fabric under Traffic; his A3 book is replaced by generated views; the person is redistributed deliberately, not discarded.
5. **Driver acknowledgment (thumb/OTP) on every DRIVER_RECOVERY_LEDGER entry: YES — locked.**
6. **Pilot locked:** JNPT corridor, one Master, one Traffic Manager, two weeks, baselines measured before go-live.

**CHANGELOG v2 → v3 (from walkthrough Parts 1 & 2 + salary model)**
1. D16 **three-bucket expense taxonomy** — TRIP_CASH (rate-card lump sum, driver keeps savings, no receipt audit) / CLIENT_RECOVERABLE (receipt mandatory → pouch → invoice) / EXTRAORDINARY (intimation rule). Fake-bill exposure shrinks to bucket C by design.
2. NEW §6.7 DRIVER_ADVANCE_RATE_CARD (union matrix: destination × direction × container type). NEW §6.8 DRIVER_RECOVERY_LEDGER (append-only settlement claims). NEW §6.9 SCRAP_SALES (per-category buyers).
3. D17 **ledger binds everyone including owner**; post-award quotes stored; "cost of awarding fast" HEAD report.
4. D18 **garage approval model:** Maintenance Manager records; owner approves everything via one-tap logged approval. No delegation ceiling (owner's decision; bottleneck risk noted in §10).
5. TRIP_EVENTS: dual timestamps (`event_ts` vs `entered_ts`) + `source` (LR_TRANSCRIBED / LIVE_TAP / PHONE_REPORTED) — honest rear-view vs live distinction.
6. Part-1 corrections folded in: English-only labels (vernacular columns removed) · market-driver capture on challan · partial DO cancellation · advance voucher born at handover (tap in front of driver) · intimation calls route to owner with delegation slot · DOC_POUCH direction templates (import/export auto-seed) · LR gains stuffing_date + loading_date · lot-based invoicing structure on INVOICE_TRACKER · rate-confirmation step at DO intake for uncontracted clients.
7. Part-2 corrections folded in: SUPPLIERS_MASTER gains network_owner + vendor_type (TRANSPORT/PARTS/WORKSHOP) · CHALLAN gains supplier_advance_amt (norm 80–90%) · SUPPLIER_PAYABLE gains deductions structure + auto-generated payment advice · JOB_CARDS gains workshop_type + vendor_id · component-life view (km between replacements per part per truck per driver).
8. Purchase Manager identified as 15th (undefined) role — decision pending in §10.

**CHANGELOG v1 → v2**
1. NEW register §5.12 EXPENSE_INTIMATIONS + intimation columns on TRIP_EXPENSES — the pre-intimation anti-fake-bill control (D14).
2. NEW register §5.13 SUPPLIER_PAYABLE_TRACKER — closes leak 7 (late supplier payments → inflated future quotes).
3. NEW §11 BUILD SLICES — leak-driven build order (D13).
4. Locked decisions D13–D15 added; Roles matrix and eCount appendix updated for the two new registers.
5. Verification protocol changed from single line-by-line review to plain-language walkthroughs in two parts (D15).

---

## 0. LOCKED ARCHITECTURAL DECISIONS (carried into this schema)

| # | Decision |
|---|---|
| D1 | **System-of-record boundary:** eCount = statutory (LR docs, challans-as-documents, invoices, e-way bills, GST, ledgers). Fabric = rate/strike ledger, trip supervision, job cards, unit economics, field capture, doc/cash custody. |
| D2 | **Bidirectional flow:** fabric captures once → generates eCount import templates (push). eCount registers pulled only for reconciliation (pull). Manual entry = flagged exception path. |
| D3 | **One LR number** — born on the paper LR book, registered in the fabric, supplied externally to eCount. No dual numbering. |
| D4 | **Challan = the trip** (internal audit spine). **LR = transactional micro-event**, replaceable (accident / reroute / transshipment). |
| D5 | **LR carries two FKs (DO + Challan). Challan is NOT nested under DO** — mixed-DO dispatches are rare but real. |
| D6 | **Challan mint = fabric**, continuing the existing plain numeric series (43486…). No prefix change. |
| D7 | **RSJ-DO = our internal order file number** (fabric-minted). The client's DO number is an attribute, unique per (client, client_do_no). Written into eCount's custom alphanumeric field. |
| D8 | **TripSheet = generated view + completeness checklist**, not a supervisor-typed form. Supervisor verifies and chases; departments enter their own data once. |
| D9 | **On-book policy:** every rupee recorded. Sensitive categories (border/facilitation) are access-gated, never omitted. |
| D10 | **Auth:** Google Workspace (@rsjcarriers.com) OAuth in production. Staging rows flagged `PRE_AUTH_ERA`. |
| D11 | **Trip expense → child of Challan/LR. Maintenance → child of VEHICLE** (optional LR ref if en-route). Unit economics = trip revenue − trip expense − maintenance − amortized fixed. |
| D12 | eCount role permissions restrict registers per role; FTL Register (contains margins) restricted to Traffic Head and above. Supervisors and below see fabric views only. |
| D13 | **Leak-driven build order in 4 slices** (§11): 1 spent-not-recovered money → 2 supplier overpayment → 3 fleet leaks → 4 computed views (unit economics, time-death). All 21+2 registers get built; none get built simultaneously. |
| D14 | **Pre-intimation rule:** no en-route expense is reimbursable unless intimated at/before time of spend (above a threshold — Rahul to set, see §10). Bills must match an open intimation or auto-flag for Cashier review. |
| D15 | **Rolling verification:** Rahul does not read schema line-by-line; each register is verified via plain-language operational walkthrough, delivered in two parts (Part 1: Governance+Masters+Spine+Slice 1; Part 2: Slices 2–3), before its slice is built. |
| D16 | **Three-bucket expense taxonomy.** A) TRIP_CASH: fixed lump sum from DRIVER_ADVANCE_RATE_CARD, driver keeps the savings — his real income; never audited line-by-line, no receipts demanded. B) CLIENT_RECOVERABLE (parking plaza, empty-yard unloading, weighment): receipt mandatory because money returns via invoice. C) EXTRAORDINARY (en-route repairs etc.): outside the rate card, D14 pre-intimation mandatory. Fake-bill controls concentrate on C; A is immune by design. |
| D17 | **The strike ledger binds everyone, including the owner — but never slows anyone.** Instant awards permitted; QUOTE events arriving after AWARD are stored; monthly HEAD report computes the spread between awarded rate and best post-award quote ("cost of awarding fast"). |
| D18 | **Garage approvals:** Maintenance Manager records and manages; owner approves every job/spend via one-tap logged approval (mobile). No delegation ceiling for now — owner's explicit call. Every verbal "haan, kar do" becomes a timestamped APPROVE row. |

---

## 1. PHYSICAL LAYOUT — WORKBOOKS

Google Sheets, one **spreadsheet file per division** plus one governance file. All writes go through the Apps Script service layer (Deliverable 2); **no user has direct edit access to any register sheet** — that is what makes "append-only" real.

| Workbook | Contents | Primary users (via app, not direct) |
|---|---|---|
| **WB-GOV** Governance | USERS_ROLES, EXPENSE_CATEGORIES, AUDIT_LOG, SYNC_LEDGER, ID_COUNTERS | Admin, Directors |
| **WB-MASTERS** Registries | CLIENTS, VEHICLES, DRIVERS, SUPPLIERS, CONTRACT_RATES | Back office; CONTRACT_RATES head-gated |
| **WB-OPS** Division 1+2 (DO/LR/Challan + Ops/Tracking/Invoicing/Collection) | DO_REGISTER, STRIKE_LEDGER, CHALLAN_REGISTER, LR_REGISTER, LR_BOOK_REGISTRY, TRIP_EVENTS, TRIP_EXPENSES, CASH_FLOAT, DOC_POUCH, DISCREPANCY_LOG, INVOICE_TRACKER | KAM, Traffic, Masters, Supervisor, Billing, Receivables |
| **WB-FLEET** Division 3 (Maintenance) | GARAGE_GATE_LOG, JOB_CARDS, PARTS_ISSUE, SCRAP_TOKENS, VEHICLE_DOCS, DRIVER_SALARY_LEDGER | Maintenance Manager, Cashier |

> Split rationale: blast-radius containment (a corrupted file loses one division, not the company), Sheets row-limit headroom for a decade, and per-file share control as a second fence behind role gates.

---

## 2. ID FORMATS

| Entity | Format | Mint | Example |
|---|---|---|---|
| Internal order file (DO) | `RSJ-DO-YY-NNNN` | Fabric counter | RSJ-DO-26-0001 |
| Challan | plain numeric, continuing series | Fabric counter | 43486 |
| LR | numeric from paper book | Paper book → registry | 50925 |
| Strike/ledger entry | `STK-YYYYMMDD-NNN` | Fabric | STK-20260812-004 |
| Job card | `JC-YY-NNNN` | Fabric | JC-26-0031 |
| Trip expense | `EXP-YY-NNNNN` | Fabric | EXP-26-00412 |
| Scrap token | `SCR-YY-NNNN` | Fabric | SCR-26-0007 |
| Doc pouch item | `DOC-<challan>-NN` | Fabric | DOC-43486-03 |
| Supplier deduction | `DED-YY-NNNNN` | Fabric | DED-26-00012 |

All counters live in `ID_COUNTERS` and are incremented inside a script lock (race-safe — replaces the old "LR Lock Service" idea, which now applies to *counters*, not LR numbers).

---

## 3. GOVERNANCE TABLES (WB-GOV)

### 3.1 USERS_ROLES *(append-only custody log — A8)*
| Column | Type | Notes |
|---|---|---|
| user_email | text | @rsjcarriers.com — ROLE-NAMED accounts (A8); exactly one ACTIVE row per email at a time |
| holder_name | text | **the human currently holding this account** — resolves any ledger row to a person (A8) |
| role_from / role_to | date | role_to blank = current holder. Handover APPENDS a closing row + a new row; never edit (A8) |
| assigned_by | email | who performed the handover; mandatory password reset at every handover |
| account_type | enum | HUMAN / TOOL — **service layer REJECTS writes from TOOL accounts**; admin@ = TOOL (A8) |
| full_name | text | legacy label |
| role | enum | mirrors the 14 eCount roles: OWNER, SUPERVISOR, CASHIER, VIEW_ONLY, KAM_IMPORT, KAM_EXPORT, COLLECTION_HEAD, TRAFFIC_HEAD, TRAFFIC_MANAGER, IMPORT_MASTER, EXPORT_MASTER, MAINTENANCE_MANAGER, BILLING, RECEIVABLE_EXE |
| division | enum | GOV / OPS / FLEET |
| active | bool | deactivate, never delete |
| created_ts, created_by | | |

### 3.2 EXPENSE_CATEGORIES
| Column | Notes |
|---|---|
| cat_code (PK) | e.g. DIESEL, TOLL, PARKING_PLAZA, EMPTY_YARD_UNLOAD, ENROUTE_REPAIR, HAMALI, DETENTION_PAID, BORDER_FACILITATION, DRIVER_ADVANCE, OTHER |
| label_en | English label only (vernacular columns removed — English-only lock, v4) |
| visibility_tier | ALL / HEAD_PLUS / DIRECTOR_ONLY (BORDER_FACILITATION = DIRECTOR_ONLY per D9) |
| receipt_required | bool |
| ecount_template | which import template it flows to: DIESEL_ENTRY / TOLL_TAX / CASH_PAYMENT / JV |
| default_bucket | A_TRIP_CASH / B_CLIENT_RECOVERABLE / C_EXTRAORDINARY / D_DIRECT_COMPANY (D16 + A11); blank for OTHER — picked at entry |

### 3.3 AUDIT_LOG *(append-only)*
`log_id · ts · user_email · action · target_table · target_id · payload_summary · prev_row_hash · row_hash`
> Hash-chained: each row stores the previous row's hash. Any retro-edit breaks the chain visibly. This is the "bank ledger" mechanic, applied globally.

### 3.4 SYNC_LEDGER
`batch_id · direction (PUSH/PULL) · ecount_template · file_ref · row_count · status (GENERATED/UPLOADED/CONFIRMED/FAILED) · checksum · ts · user`

### 3.5 ID_COUNTERS
`counter_name · current_value · updated_ts` (script-lock protected)

---

## 4. MASTER REGISTRIES (WB-MASTERS)

### 4.1 CLIENTS_MASTER
`client_id (PK) · legal_name · gst_no · client_type (IMPORTER/EXPORTER/CHA/FORWARDER) · kam_owner (email) · billing_address · contact · payment_terms_days · lot_invoicing_policy (FULL_LOT_ONLY / SPLIT_ALLOWED — D20b) · status`

### 4.2 VEHICLES_MASTER
`veh_no (PK, normalized: uppercase, no spaces) · ownership (OWN/MARKET) · supplier_id (if market) · truck_type · capacity_ft (20/40/ISO/OT/HC/REEFER) · purchase_date · purchase_value · amort_monthly · assigned_driver · status (ACTIVE/GARAGE/SOLD)`
> Normalization rule at entry AND at eCount-pull parse: `MH46CU 5326` → `MH46CU5326`.

### 4.3 DRIVERS_MASTER
`driver_id (PK) · name · phone · licence_no · licence_expiry · assigned_veh · base_salary · status`

### 4.4 SUPPLIERS_MASTER
`supplier_id (PK) · name · contact · pan_gst · vendor_type (TRANSPORT / PARTS / WORKSHOP) · network_owner (OWNER / which Traffic Manager — networks are mutually exclusive) · payment_terms_days · vehicles_typical · rating_notes · status`

### 4.5 CONTRACT_RATES *(HEAD_PLUS visibility — this is the client-freight side of margin)*
`rate_id (PK) · client_id · from_loc · to_loc · direction (IMP/EXP) · container_type · tonnage · client_freight · km · valid_from · valid_to · source_doc_ref · created_by · ts`

---

## 5. OPERATIONAL SPINE (WB-OPS)

### 5.1 DO_REGISTER — *the order file*
| Column | Notes |
|---|---|
| rsj_do_id (PK) | RSJ-DO-26-0001, fabric-minted |
| client_id (FK) | |
| client_do_no | client's own document number |
| **UNIQUE(client_id, client_do_no)** | duplicate-registration guard |
| received_via / received_ts | EMAIL/WHATSAPP/PORTAL |
| direction | IMPORT / EXPORT |
| container_type · container_qty | qty = how many boxes this DO covers |
| from_loc · to_loc | MCQ from location list |
| cargo_desc · shipping_line · vessel_cutoff | cutoff drives urgency flags |
| contract_rate_id (FK, nullable) | links client freight; head-gated |
| qty_cancelled | partial cancellation supported (v3) |
| agreed_rate / rate_source | CONTRACT / SPOT_CONFIRMED — KAM records agreed rate at intake when no formal contract exists; head-visible (v3) |
| status | OPEN / PARTIAL / FULFILLED / CANCELLED (auto from LR count vs qty − qty_cancelled) |
| created_by · created_ts | |

### 5.2 STRIKE_LEDGER — *the anti-fraud rate ledger (append-only, hash-chained)*
| Column | Notes |
|---|---|
| strike_id (PK) | |
| rsj_do_id (FK) | |
| event_type | QUOTE / REQUOTE / AWARD / CANCEL / CORRECTION |
| supplier_id (FK) | or OWN_FLEET |
| veh_no (nullable) | offered vehicle |
| quoted_rate | supplier side — visible to traffic team |
| quoted_via | CALL / WHATSAPP / IN_PERSON |
| award_reason | **mandatory free text on AWARD** |
| refers_strike_id | CORRECTION points at the erroneous row; original never edited |
| sourced_by_tm | MCQ static TM list — attribution without TM logins (Amendment A2) |
| entered_by · ts · prev_row_hash · row_hash | |
> **D17:** post-award QUOTE rows are accepted and stored; the monthly HEAD report computes awarded-vs-best-later-quote spread per order and per sourcing person (`entered_by` + SUPPLIERS_MASTER.network_owner make owner-vs-TM sourcing comparable).
> Margin (client freight − awarded rate) is **never stored here**; it is computed in a HEAD_PLUS view joining CONTRACT_RATES. Executives see quotes; only heads see spread. Mirrors the Strike Board's HEAD ONLY intent, now server-enforced.

### 5.3 CHALLAN_REGISTER — *the trip*
`challan_no (PK, numeric series) · release_ts · veh_no (FK) · driver_id (FK, own trucks) · market_driver_name · market_driver_phone (Master taps at dispatch — supplier driver capture, v3) · ownership_snapshot (OWN/MARKET) · supplier_id (nullable) · supplier_advance_amt (norm 80–90% of awarded rate) · awarded_strike_id (FK — ties trip to the winning bid: the fraud-trace join) · trip_status (RELEASED / IN_TRANSIT / AT_CLIENT / RETURNING / CLOSED / STUCK) · closed_ts · created_by`

### 5.4 LR_REGISTER
`lr_no (PK) · challan_no (FK) · rsj_do_id (FK) · container_no · consignor · consignee · from_loc · to_loc · lr_date · stuffing_date (export) · loading_date (export) · status (ACTIVE / CANCELLED / REPLACED) · replaces_lr_no (nullable) · replace_reason (ACCIDENT / REROUTE / TRANSSHIP / ERROR) · ecount_sync (PENDING / PUSHED / CONFIRMED) · created_by · ts`

### 5.5 LR_BOOK_REGISTRY
**Books:** `book_id (PK) · leaf_from · leaf_to · issued_to (Master's email) · issue_ts · status (ACTIVE/EXHAUSTED/LOST)`
**Leaves:** `lr_no (PK) · book_id (FK) · leaf_status (BLANK / USED / CANCELLED / LOST) · used_on_challan (FK) · status_ts · status_by`
> Rules: a leaf can go BLANK→USED exactly once (duplicate-use structurally rejected); CANCELLED/LOST require a reason and appear on an exceptions view; execs tap the next BLANK leaf of their own book — no typing.

### 5.6 TRIP_EVENTS — *tap-to-stamp checkpoint chain (append-only)*
`event_id · challan_no (FK) · lr_no (nullable FK) · event_type (RELEASED / CONTAINER_PICKED / WEIGHMENT / GATE_IN / LR_STAMP_ARRIVAL / UNLOAD_START / UNLOAD_END / LR_STAMP_DEPART / GATE_OUT / EMPTY_RETURNED / EMPTY_REFUSED / DOCS_HANDED / GARAGE_IN / GARAGE_OUT) · event_ts (when it happened, per LR stamp) · entered_ts (when typed in) · source (LR_TRANSCRIBED / LIVE_TAP / PHONE_REPORTED) · stamped_by · geo_hint (optional) · note`
> **TRACKING WORKLIST (view, A8):** open challans ranked by silence — last event age, next expected checkpoint, follow-up due. This is the TRACKER's daily screen; his calls write PHONE_REPORTED rows into this same table. No new register.
> Detention = computed view over GATE_IN/GATE_OUT `event_ts` deltas vs free-time. **Honesty rule (v3): transcription gives audit & billing truth next-day; live visibility exists only for LIVE_TAP/PHONE_REPORTED rows. No form gives real-time truck tracking — that is telematics, a later, separate decision.**

### 5.7 TRIP_EXPENSES
`exp_id (PK) · challan_no (FK) · lr_no (nullable) · cat_code (FK) · bucket (A_TRIP_CASH / B_CLIENT_RECOVERABLE / C_EXTRAORDINARY — D16) · amount · **intimation_id (FK → §5.12, nullable)** · **intimation_check (MATCHED / POST_FACTO_FLAGGED / BELOW_THRESHOLD)** · paid_from_float_id (FK, nullable) · receipt_status (HAS_RECEIPT / PROMISED / NO_RECEIPT) · doc_pouch_id (nullable FK) · approval_status (SUBMITTED / APPROVED / REJECTED) · approved_by · ecount_push (template + batch_id) · entered_by · ts`
> **D14 gate (bucket C only, D20a: threshold ₹500, tolerance ±10% or ₹200 whichever larger):** amount > threshold AND intimation_check = POST_FACTO_FLAGGED → cannot be APPROVED without Cashier override + mandatory reason (logged).
> **Bucket rules (D16):** A auto-fills from DRIVER_ADVANCE_RATE_CARD — one row per trip, no receipts, never itemized. B requires receipt_status = HAS_RECEIPT before the linked invoice can reach ANNEXURE_COMPLETE. C requires intimation.

### 5.8 CASH_FLOAT_REGISTER — *field cash custody (Masters & drivers)*
`float_id (PK) · issued_to (Master email / driver_id) · challan_no (nullable — trip-specific or general float) · amount_issued · issued_by (Cashier) · issue_ts · amount_accounted (Σ approved expenses against it) · amount_returned · reconcile_status (OPEN / BALANCED / SHORT / EXCESS) · closed_ts`
> Closes the loop your Masters live in: cash out → receipts back → invoice annexure. A SHORT float is visible the day it happens, not at year-end.
> **Voucher-at-handover rule (v3):** the advance entry is tapped by the Master in front of the driver at the moment of handover (`issue_ts` = the handover). Amount pre-fills from the rate card. The back-office evening voucher written from memory is abolished.

### 5.9 DOC_POUCH — *per-trip document & receipt chase*
`doc_id (PK) · challan_no (FK) · doc_type (LR_DUPLICATE / WEIGHMENT_SLIP / EIR / POD / PARKING_RECEIPT / EMPTY_YARD_RECEIPT / REPAIR_BILL / OTHER) · expected (bool) · status (PENDING / WITH_DRIVER / WITH_MASTER / AT_OFFICE / ATTACHED_TO_INVOICE / LOST) · holder · status_ts · required_for_invoice (bool)`
> Invoicing gate: an invoice cannot be marked ANNEXURE_COMPLETE while any required_for_invoice doc ≠ AT_OFFICE/ATTACHED. This is where "lost receipt = lost money" gets structurally fixed.
> **Direction templates (v3):** expected docs auto-seed on challan creation — IMPORT: LR original, weighment, empty-yard unloading receipt. EXPORT: LR original, parking plaza receipt, stuffing docs. BOTH: repair receipts if any bucket-C expense exists.

### 5.10 DISCREPANCY_LOG *(append-only)*
`disc_id · challan_no · lr_no (nullable) · type (DETENTION_DISPUTE / DAMAGE / EMPTY_REFUSED / SHORTAGE / ACCIDENT / ROUTE_CHANGE / OTHER) · mcq_detail · note · raised_by · ts · resolution_status (OPEN / UNDER_REVIEW / RESOLVED / WRITTEN_OFF) · resolution_note · resolved_by · resolved_ts`

### 5.11 INVOICE_TRACKER — *ops mirror; eCount is SoR for the invoice itself*
`inv_track_id (PK) · ecount_invoice_no · client_id · lot_id · lr_list (2–10 containers per lot) · per_lr_readiness (computed from DOC_POUCH: '9 of 10 ready — blocked by LR 50931 parking receipt, holder named') · invoice_amount · invoice_date · annexure_status (INCOMPLETE / COMPLETE) · submitted_ts · due_date · collection_status (PENDING / PART_PAID / PAID / OVERDUE / DISPUTED) · last_followup_ts · followup_by · closed_ts`

### 5.12 EXPENSE_INTIMATIONS — *the anti-fake-bill control (append-only)* [NEW in v2]
`intimation_id (PK: INT-YY-NNNNN) · challan_no (FK) · veh_no · cat_code (FK) · est_amount · location_hint (MCQ: city list + free text) · intimated_by (Master/Traffic, from driver call) · ts · status (OPEN / MATCHED / EXPIRED / CANCELLED) · matched_exp_id (nullable FK) · expiry_ts (trip close + 48h — D20a)`
> Flow (v3): breakdown calls land on the **owner** today — so owner (or delegated person; delegation slot built in) taps the 15-second intent entry ("tyre puncture, ~₹800, Vapi") → intimation is born, timestamped, under the intimator's login. The later bill must MATCH an OPEN intimation (same challan, same category, amount within tolerance) or the expense auto-flags. A fake bill now requires a pre-logged fake intimation — casual fraud becomes premeditated conspiracy with evidence attached.

### 5.13 SUPPLIER_PAYABLE_TRACKER — *late-payment → rate-retaliation visibility* [NEW in v2]
`payable_id (PK) · supplier_id (FK) · challan_no (FK) · ecount_bill_ref · bill_amount · bill_date · pod_received_ts (LR-return reaches office — from DOC_POUCH) · due_date (pod_received_ts + N; company default N=30, per-supplier override — D20c) · paid_date (from eCount Payable Bill-by-Bill pull) · paid_amount · delay_days (computed) · payment_advice_ref (auto-generated per payment — the breakup sheet suppliers demand; itemizes from §5.14) · dispute_flag · notes`
> Extends to PARTS/WORKSHOP vendors (vendor_type) — the vendor-credit deadlock (unpaid fixed vendor stops supplying → forced spot-buying at worse prices) becomes a visible, dated trail. eCount remains SoR for the accounting entry; this register exists for the *operational join* eCount cannot make: per-supplier payment-delay trend × subsequent quote trend from STRIKE_LEDGER → the "we paid X 40 days late and his quotes rose 8%" report (HEAD_PLUS view). Adds `payment_terms_days` usage from SUPPLIERS_MASTER.

### 5.14 SUPPLIER_PAYABLE_DEDUCTIONS — *itemized deductions per supplier bill* [NEW v4, Amendment A12]
`deduction_id (PK: DED-YY-NNNNN) · payable_id (FK → §5.13) · deduction_type (SHORTAGE / DETENTION_CHARGEBACK / TDS / DAMAGE / OTHER) · amount · reason · entered_by · ts`
> One row per deduction. A single bill routinely carries several at once (TDS + negotiated detention chargeback + occasional damage — owner's example at Checkpoint #2), so a packed column cannot hold the truth. The auto-generated payment advice itemizes from these rows.

---

## 6. FLEET DIVISION (WB-FLEET)

### 6.1 GARAGE_GATE_LOG *(append-only)*
`gate_id · veh_no (FK) · direction (IN/OUT) · ts · odometer_km · diesel_level · driver_id · recorded_by`

### 6.2 JOB_CARDS
`job_id (PK) · veh_no (FK) · gate_in_id (FK) · workshop_type (OWN / OUTSIDE) · vendor_id (FK, if outside) · owner_approval (PENDING / APPROVED one-tap / REJECTED — D18, logged) · linked_challan (nullable — en-route breakdown case, per D11) · complaint_codes (MCQ multi) · work_done_codes (MCQ multi) · labor_cost · parts_cost (Σ PARTS_ISSUE) · total_cost · status (OPEN / AWAITING_PARTS / AWAITING_SCRAP_RETURN / CLOSED) · opened_by/ts · closed_by/ts`
> **Gate-lock preserved:** status cannot reach CLOSED while any child scrap token is unreturned.

### 6.3 PARTS_ISSUE
`issue_id · job_id (FK) · part_code · part_desc · qty · unit_cost · issued_by · ts · scrap_expected (bool) · scrap_token_id (nullable FK)`

### 6.4 SCRAP_TOKENS *(append-only)*
`scrap_token_id (PK) · issue_id (FK) · veh_no · part_desc · status (ISSUED / RETURNED_TO_YARD / SOLD / WRITTEN_OFF) · status_ts · status_by · sale_value (if sold)`

### 6.5 VEHICLE_DOCS
`vdoc_id · veh_no (FK) · doc_type (PERMIT / ROAD_TAX / FITNESS / PUC / INSURANCE / NATIONAL_PERMIT) · doc_no · issue_date · expiry_date · alert_days_before · status (VALID / EXPIRING / EXPIRED)`

### 6.6 DRIVER_SALARY_LEDGER *(append-only)*
`sal_id · driver_id (FK) · period (YYYY-MM) · entry_type (BASE / TRIP_BHATTA / ADVANCE_DEDUCTION / BONUS / PENALTY / PAYOUT) · amount · ref (challan/float id where applicable) · entered_by · ts · ecount_push (CASH_PAYMENT batch)`
> **v3 model:** ₹8,000 base + bucket-A trip cash per rate card (driver's income includes his savings from it — never clawed back). No trip-balance deductions exist. Settlement-time claims live in DRIVER_RECOVERY_LEDGER (§6.8), not here.

### 6.7 DRIVER_ADVANCE_RATE_CARD *(append-only versions — union-negotiated)* [NEW v3]
`rate_id (PK) · destination · direction (IMP/EXP) · container_type (20/40/ISO) · trip_cash_amt · effective_from · superseded_by (nullable) · approved_by (owner) · ts`
> The advance auto-fills from here at dispatch; the driver argues with a rate card, not a Master. Re-negotiations append a new version — history preserved, the "union fixed it in March" fight is over.

### 6.8 DRIVER_RECOVERY_LEDGER *(append-only)* [NEW v3]
`rec_id (PK) · driver_id (FK) · entry_type (UNAUTHORIZED_EXPENSE / DAMAGE / PENALTY / ADVANCE_RECOVERY / CREDIT_ADJUSTMENT) · amount · reason (mandatory) · evidence_ref (exp_id / job_id / doc) · recorded_by · ts · settlement_status (OPEN / SETTLED / WAIVED) · settled_ts · driver_ack_method (THUMB / OTP — locked, v4) · driver_ack_ts`
> Replaces claims parked in one executive's memory/book "to be adjusted when the driver quits." Every claim now carries a reason, evidence, and timestamp — protecting the company at settlement AND the driver from arbitrary invention. ⚠ Governance note: large undocumented settlement deductions are labour-dispute fuel; this register is the mitigation, and driver acknowledgment at entry (thumb/OTP) is recommended — owner to decide.

### 6.9 SCRAP_SALES [NEW v3]
`sale_id (PK) · category (PARTS / TYRES / TRUCK_BODY) · buyer_id (per-category buyers exist — seed into SUPPLIERS_MASTER as vendor_type SCRAP_BUYER) · token_list (FK → SCRAP_TOKENS) · weight_or_qty · amount · date · recorded_by`
> Converts scrap to cash in recorded batches; SCRAP_TOKENS status SOLD requires a sale_id. "Stolen piece by piece" ends where the token chain meets a weighbridge slip.

### 6.10 UNIT_ECONOMICS *(computed view, not a table)*
Per vehicle per period: Σ trip freight (via challans→LRs→DO rates, head-gated) − Σ TRIP_EXPENSES − Σ JOB_CARDS total − amort_monthly − salary allocation → **net per vehicle, cost/km**.
**Component-life view (v3):** km-between-replacements per part per truck per driver (garage odometer × PARTS_ISSUE × one-driver-one-truck). Flags: same component repeating under norm — driving problem or fake-repair problem, both now visible.

---

## 7. TRIPSHEET — GENERATED VIEW (per D8)
One screen per challan, assembling all 16 sections from the tables above. Each section shows **FILLED / MISSING / OVERDUE + owing role**. Supervisor actions limited to: VERIFY section, CHASE (one-tap nudge logged to AUDIT_LOG), and supervisory remarks. Printable/exportable for client sharing and audit — replaces the 9-page paper form with zero supervisor re-typing.

---

## 8. ROLES × REGISTERS MATRIX (fabric side; eCount side mirrors per D12)

R=read, W=write(append), A=approve, ✕=no access. Directors/Owner = full. VIEW_ONLY = read on non-sensitive views only.

| Register | KAM | Traffic Head | Traffic Mgr | Masters (Imp/Exp) | Supervisor | Cashier | Billing | Receivable | Maint Mgr |
|---|---|---|---|---|---|---|---|---|---|
| DO_REGISTER | W | R | R | R | R | ✕ | R | R | ✕ |
| CONTRACT_RATES | ✕ | R | ✕ | ✕ | ✕ | ✕ | R* | ✕ | ✕ |
| STRIKE_LEDGER | ✕ | W+A | W | ✕ | ✕ | ✕ | ✕ | ✕ | ✕ |
| Margin view | ✕ | R | ✕ | ✕ | ✕ | ✕ | ✕ | ✕ | ✕ |
| CHALLAN / LR | R | W | W | R | R | ✕ | R | R | ✕ |
| LR_BOOK_REGISTRY | ✕ | R | R | W | R | ✕ | ✕ | ✕ | ✕ |
| TRIP_EVENTS | R | R | W | W | R+VERIFY | ✕ | R | ✕ | ✕ |
| TRIP_EXPENSES | ✕ | R | R | W | R | A | R | ✕ | ✕ |
| CASH_FLOAT | ✕ | R | ✕ | R(own) | R | W+A | ✕ | ✕ | ✕ |
| DOC_POUCH | R | R | R | W | R+VERIFY | ✕ | R | ✕ | ✕ |
| DISCREPANCY_LOG | R | R | W | W | W | ✕ | R | R | ✕ |
| INVOICE_TRACKER | R | ✕ | ✕ | ✕ | R | ✕ | W | W | ✕ |
| EXPENSE_INTIMATIONS | ✕ | R | W | W | R | R | ✕ | ✕ | ✕ |
| SUPPLIER_PAYABLE | ✕ | R | ✕ | ✕ | ✕ | W | ✕ | ✕ | ✕ |
| Payment-delay×quote view | ✕ | R | ✕ | ✕ | ✕ | ✕ | ✕ | ✕ | ✕ |
| FLEET tables (6.1–6.6) | ✕ | ✕ | ✕ | ✕ | R | A(salary/₹) | ✕ | ✕ | W (owner approves per D18) |
| RATE_CARD / RECOVERY / SCRAP_SALES | ✕ | ✕ | ✕ | ✕ | ✕ | R | ✕ | ✕ | W (owner A) |
| AUDIT_LOG | ✕ | ✕ | ✕ | ✕ | ✕ | ✕ | ✕ | ✕ | ✕ |

*Billing reads CONTRACT_RATES only to raise invoices at contract freight — it sees client freight, never supplier cost, so it cannot compute margin. KAM sees client freight for its own clients (client servicing) but no supplier side — same one-sided principle.
BORDER_FACILITATION expense rows: visible to Cashier + Directors only, per D9.

### 8.1 Roles added in Amendment A8
- **BILLING_PURCHASE** — market-supplier bill verification. Access: SUPPLIER_PAYABLE (W), STRIKE_LEDGER awarded-rate field (R, own-verification only), CHALLAN/LR (R). **No access to CONTRACT_RATES or client freight.** Mirror-image of BILLING (renamed BILLING_SALES), which sees client freight and never supplier cost. Neither can compute margin alone; together at one desk they can — organizational awareness item, not a system flaw.
- **TRACKER** — dedicated tracking desk. Access: TRIP_EVENTS (W, PHONE_REPORTED source only), CHALLAN/LR (R), tracking worklist view (R). **No expense, no rate, no margin, no invoice access.**

---

## 9. eCOUNT TEMPLATE APPENDIX (customization brief for eCount executive)

| Template | Direction | Fed by | Key columns (fabric → eCount) |
|---|---|---|---|
| FullLoad Import | PUSH | CHALLAN + LR + DO | Challan No, Lr No, Lr Date, Truck, **RSJ-DO (new custom field)**, Container No, From/To, Consignor/Consignee, Party Rate, Transporter, TransRate, TransFreight |
| LrEntry | PUSH | LR_REGISTER | external LR no confirmed accepted |
| Diesel Entry | PUSH | TRIP_EXPENSES (DIESEL) | date, pump, veh, liters, rate, amount |
| Toll Tax Entry | PUSH | TRIP_EXPENSES (TOLL) | |
| Cash Payment | PUSH | approved TRIP_EXPENSES, salary payouts, float issues | |
| Journal Voucher | PUSH | adjustments / corrections | |
| FTL Register export | PULL (reconcile) | vs CHALLAN+LR | join on Challan+LR+RSJ-DO; normalize truck nos |
| Trip Register export | PULL (reconcile) | vs TRIP_EXPENSES + fuel | column set: ours to define — mirror 5.7 |
| Receivable (Bill-by-Bill) export | PULL | vs INVOICE_TRACKER | collection truth-check |
| **Payable (Bill-by-Bill) export** | PULL | vs SUPPLIER_PAYABLE_TRACKER | paid_date / delay_days source [NEW v2] |

**Asks for eCount executive:** (1) add RSJ-DO alphanumeric custom field on Full Load — confirmed possible; (2) rename Booking Id per Rahul; (3) restrict FTL Register & any margin-bearing report to Traffic Head+ role; (4) confirm whether Trip No accepts external supply like LR does.

---

## 10. OPEN ITEMS RIDING WITH THIS DRAFT (answer during review — none block reading it)

1. Vernacular labels: Hindi / Gujarati / both for MCQ labels? (Column slots exist either way.)
2. LR book leaf ranges: one book per Master, or per location (JNPT vs Hazira)?
3. Detention free-time: fixed per client contract (goes in CONTRACT_RATES) — confirm it's always contractual, never ad-hoc.
4. Float reconciliation cycle: per-trip, weekly, or monthly? (Register supports any; approval workflow needs one default.)
5. Driver bhatta (trip allowance): flat per trip, per km, or per route? Affects SALARY_LEDGER auto-entries.
6. ~~Intimation threshold~~ **RESOLVED (D20a).**
7. ~~Supplier payment terms~~ **RESOLVED (D20c)** — N=30 locked.
8. ~~Purchase Manager~~ **RESOLVED — role dissolved (changelog #4).**
9. ~~Lot invoicing~~ **RESOLVED (D20b)** — collect each client's choice during master-data cleanup.
10. ~~Workspace~~ **RESOLVED — live; configure per D21 during Phase 1.**
11. **Baselines (2 days manual, §11):** measure before Slice 1 goes live or success is unprovable.
12. **Pilot pick:** one corridor (JNPT suggested — 85% of volume), one Master, one Traffic Manager for first two weeks.
13. ~~Driver acknowledgment~~ **RESOLVED — YES, locked.**
14. ⚠ **Owner-bottleneck note (D18):** every garage approval routes through one phone. Accepted for now at owner's insistence; revisit at >120 trucks or when approval latency starts parking trucks.

---

## 11. BUILD SLICES (D13) — leak-driven order

| Slice | Closes leaks | Registers built | Gate to next slice |
|---|---|---|---|
| **1 — Money spent, not recovered** | detention untracked; receipts never reach invoice; late invoicing; fake transit bills | WB-GOV all · WB-MASTERS all · DO_REGISTER · CHALLAN_REGISTER · LR_REGISTER · LR_BOOK_REGISTRY · TRIP_EVENTS · TRIP_EXPENSES · EXPENSE_INTIMATIONS · CASH_FLOAT · DOC_POUCH · INVOICE_TRACKER | Part-1 walkthrough passed; pilot corridor running 2 weeks |
| **2 — Supplier overpayment** | no quote visibility; late-payment rate retaliation | STRIKE_LEDGER · SUPPLIER_PAYABLE_TRACKER · CONTRACT_RATES views | Part-2 walkthrough (ops half) passed |
| **3 — Fleet leaks** | repeat garage expenses; RTO doc lapses; driver advance leverage | GARAGE_GATE_LOG · JOB_CARDS · PARTS_ISSUE · SCRAP_TOKENS · VEHICLE_DOCS · DRIVER_SALARY_LEDGER | Part-2 walkthrough (fleet half) passed |
| **4 — Time & blindness** | unit-economics blind spot; idle/backhaul waste | none — computed views (UNIT_ECONOMICS, time-death report, empty-vehicle × open-DO match list) over slices 1–3 | Slices 1–3 producing data |

Baselines to measure BEFORE slice 1 goes live (2 days of manual work, so success is provable): unbilled detention count last quarter · cash issued to Masters vs receipts returned · % invoices raised >7 days after unloading · avg supplier payment delay.

---

**🛑 VERIFICATION PROTOCOL (D15): each register passes a plain-language operational walkthrough before its slice is built. Part 1 covers Governance, Masters, Spine, and Slice 1. Part 2 covers Slices 2–3. Corrections from walkthroughs version this file (v3 if structural). No code before Part 1 passes.**
