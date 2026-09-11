# PHASE2_GATES.md — the Phase 2 definition of done

**Status: the single gate contract for Phase 2, 2026-09-12. Supersedes ORG_STRUCTURE.md §6 (which now points here) and the 31 plain-language sentences of 2026-09-10 (mapped in the annex — they are the reading of this contract, not a second one).**

Phase 2 is finished when `gateTests()` prints **G1–G45 PASS** in the Apps Script execution log, in front of Rahul, and the log is reviewed in the project chat. Anything built in Phase 2 that is not needed to pass a listed gate is scope creep and is refused.

Every server function begins with `Session.getActiveUser().getEmail()` → USERS_ROLES lookup. "REJECT" always means: the write does not happen AND an AUDIT_LOG row records the attempt with the caller's email.

**Precondition (not a test):** USERS_ROLES must be seeded with the 16 A9 rows before the gates are switched on. Until then everyone is refused, including owner@ — the roster is the door, not the code (annex #2).

---

## A. Identity — who gets in (D10, A8)

| # | Test | Expect |
|---|---|---|
| G1 | Write from any email with no ACTIVE row in USERS_ROLES (including an empty roster) | REJECT; refusal logged with that email |
| G2 | Write from an email whose only row has `active=false` or `role_to` filled — the very next call, no grace period | REJECT |
| G3 | Write from admin@ (`account_type=TOOL`), superadmin notwithstanding | REJECT; logged |
| G4 | Write from `Master.JNPT@` or any case/spelling drift | REJECT — exact string match |
| G29 | Google returns a blank identity to the server (trigger contexts) | REJECT — never guess a caller, never fall back to a default user |
| G30 | Any attempt to edit or delete an existing USERS_ROLES row; handover must arrive as closing row + new row with `assigned_by` | REJECT — USERS_ROLES is append-only (A8). *CLAUDE.md rule 2 must add USERS_ROLES to its list (A21).* |

## B. Price and margin (D19, D12, A8)

| # | Test | Expect |
|---|---|---|
| G5 | kam.import@ / kam.export@ request the DO-LR-Challan view | server payload has vehicle, supplier name, driver phone, status — **zero** rate/price keys, checked on the server response |
| G6 | supervisor@, tracker@, master.*@, receivables@, maintenance@, kam.*@ request the margin view | REJECT |
| G7 | billing.sales@ reads CONTRACT_RATES → ALLOW; same login reads STRIKE_LEDGER or any supplier rate by any function | REJECT |
| G8 | billing.purchase@ reads the awarded rate for the bill it verifies → ALLOW; same login reads CONTRACT_RATES or client freight by any function | REJECT |
| G9 | owner@, rahul@, rohit@, traffichead@ request the margin view | ALLOW — exactly four |
| G31 | Write to STRIKE_LEDGER from any login other than traffichead@ or owner@; or a TM-sourced row with `sourced_by_tm` blank | REJECT |

## C. Append-only and the chain (CLAUDE.md rules 2–3, D17)

| # | Test | Expect |
|---|---|---|
| G10 | Any update/delete on the eleven append-only registers (rule 2 list + USERS_ROLES) | REJECT — no such function exists; corrections are new rows referencing the erroneous row |
| G11 | Two sequential writes; then tamper one middle AUDIT_LOG cell by hand | second row's `prev_row_hash` = first's `row_hash`; `verify` reports the chain broken from the tampered row forward |
| G12 | owner@ writes an AWARD | accepted and logged identically to a traffichead@ award — no owner exemption |
| G32 | Rows written before OAuth identity is fully live | carry `PRE_AUTH_ERA`; excluded from every anti-fraud report |
| G38 | Hand-edit one cell of STRIKE_LEDGER (or any append-only register) directly in the sheet as owner@ | the nightly re-hash reports `REGISTER_TAMPER` naming sheet and row; the snapshot hash lives in AUDIT_LOG, so hiding the edit means breaking the chain (A21, ruling A) |
| G37 | `verify` inspects share settings of all four workbooks every run | no editor on any register sheet except the file owner; any extra editor → FAIL |

## D. Owner-dictated awards — the second hand (A19)

| # | Test | Expect |
|---|---|---|
| G40 | traffichead@ writes AWARD with `sourced_by_tm = OWNER` | ALLOW; row born `UNCONFIRMED`; dispatch may proceed |
| G41 | owner@ appends `OWNER_CONFIRM` referencing that award → ALLOW; any other login appends it | REJECT |
| G42 | billing.purchase@ verifies a supplier bill against an owner-sourced award with no `OWNER_CONFIRM` row | REJECT — payment waits for the owner's tap |

## E. Scoped writes and approvals

| # | Test | Expect |
|---|---|---|
| G13 | tracker@ writes TRIP_EVENTS with `source=LR_TRANSCRIBED`, or writes any expense, rate or invoice row | REJECT — PHONE_REPORTED rows only |
| G17 | cashier@ approves a bucket-C expense > ₹500 with `intimation_check=POST_FACTO_FLAGGED` and no reason → REJECT; with reason | ALLOW, logged |
| G18 | maintenance@ sets JOB_CARDS to CLOSED with an unreturned scrap token | REJECT |
| G19 | maintenance@ sets `owner_approval=APPROVED` | REJECT — owner@ only |
| G20 | supervisor@ writes anything other than VERIFY / CHASE / remark | REJECT; VERIFY and CHASE are logged under his identity |
| G43 | Any of owner@, rahul@, rohit@, traffichead@, master.jnpt@, master.hazira@, tracker@, maintenance@ writes EXPENSE_INTIMATIONS → ALLOW; kam.*@, billing.*@, receivables@, supervisor@, cashier@ | REJECT (A20 — whoever picks up the phone, from the named eight) |

## F. Challan birth — per series (A14, A18)

| # | Test | Expect |
|---|---|---|
| G15 | traffichead@ requests the next JNPT challan leaf | next BLANK leaf of the single ACTIVE book, no typed field; same leaf offered twice → second USE rejected. master.jnpt@ makes the same request → REJECT. No "mint a JNPT challan" function exists at all |
| G16 | traffichead@ requests a Hazira challan; two simultaneous calls at every counter | `H<counter>` under LockService; sequential, never duplicate. master.hazira@ → REJECT |
| G33 | Cancel a challan leaf without a reason → REJECT; a CANCELLED leaf | never becomes a CHALLAN_REGISTER row (42938/42939 = two cancelled leaves, not two trips) |
| G34 | Register a second ACTIVE JNPT book while one is ACTIVE | REJECT |
| G35 | Any path creating a bare-numeric Hazira challan, an H-prefixed JNPT number, or a typed `challan_series` / `challan_seq` | REJECT — series and seq are server-computed from the number |
| G28 | master.*@ marks any challan leaf USED or CANCELLED | REJECT — Masters read the challan registry, never write it |

## G. LR registry (D3, §5.5, A6, A18)

| # | Test | Expect |
|---|---|---|
| G14 | master.hazira@ taps a leaf from the JNPT LR book | REJECT — own book only |
| G36 | An LR leaf goes BLANK→USED; a second USE of the same leaf | REJECT — structurally, not by warning |
| G27 | master.jnpt@ creates an LR row whose `challan_no` was typed, is not RELEASED, or whose `rsj_do_id` does not exist | REJECT — the LR screen offers only RELEASED challans lacking their LR set; orphan LRs are impossible |
| G22 | traffichead@ taps the next BLANK JNPT **LR** leaf and writes the LR row with master.jnpt@ absent | ALLOW — cover under own login (§8 of ORG_STRUCTURE.md) |

## H. Cover and custody (A16)

| # | Test | Expect |
|---|---|---|
| G23 | kam.export@ writes a DO with `direction=IMPORT` | ALLOW — direction is a column, never a permission scope |
| G24 | rahul@ holds cashier@ via a custody row while his own row is inactive | writes as cashier@ ALLOW; writes as rahul@ REJECT (G2) |

## I. Cash handover — record before money (A17)

| # | Test | Expect |
|---|---|---|
| G25 | CASH_FLOAT row whose `handover_ts` precedes its `issue_ts`, either mode | REJECT |
| G26 | `reconcile_status=BALANCED` with `driver_ack_method=NONE`, or before the slip is recorded at the office | REJECT |

## J. The transcription door (A15, A21)

| # | Test | Expect |
|---|---|---|
| G21 | Backfilled JNPT number outside a registered book's printed range or on a USED leaf → REJECT; Hazira number not H-format or ≥ counter seed → REJECT; any transcribed row lacking `BACKFILL_ERA` | REJECT |
| G39 | Transcribe a trip dated more than 14 days before `GO_LIVE_DATE` | REJECT — window enforced in code (A21, ruling 2). `GO_LIVE_DATE` is set on go-live morning as part of the ritual |

**Deferred to Phase 4, not a Phase 2 gate:** no eCount push file may contain a `BACKFILL_ERA` row (annex #29) — push files do not exist until Phase 4.

## K. Invoice write-off — the second hand on collection (A22)

| # | Test | Expect |
|---|---|---|
| G44 | billing.sales@ sets `collection_status = WRITTEN_OFF`, or reduces `invoice_amount` after `submitted_ts`, with no `writeoff_approved_by` row from rahul@ or rohit@ | REJECT. Approval from owner@, or from billing.sales@ itself, is not a director row |
| G45 | billing.sales@ sets `collection_status = DISPUTED`, or records PART_PAID, with no approval | ALLOW — the negative control that proves the gate does not block honest same-day recording |

---

## Annex — the 31 plain-language sentences (2026-09-10) mapped to this contract

| # | Sentence (short) | Maps to | Note |
|---|---|---|---|
| 1 | Stranger's write refused and logged | G1 | logging of the refusal added to G1 |
| 2 | Empty roster refuses everyone incl. owner@ | G1 + precondition | seeding is a hard precondition |
| 3 | admin@ refused despite superadmin | G3 | |
| 4 | Closed custody row → next call refused | G2 | |
| 5 | Blank identity → refused | **G29** | orphan → new gate |
| 6 | USERS_ROLES append-only via service | **G30** | orphan; CLAUDE.md rule 2 defect |
| 7 | KAM view has no rate keys, server-checked | G5 | |
| 8 | billing.sales vs billing.purchase mirror | G7, G8 | |
| 9 | Margin reaches four inboxes only | G6, G9 | |
| 10 | tracker@ PHONE_REPORTED only; no expense/rate/invoice | G13 | extended |
| 11 | supervisor@ VERIFY/CHASE logged; no underlying edits | G20 | |
| 12 | STRIKE_LEDGER writers = two; sourced_by_tm mandatory | **G31** | orphan; now shaped by fact 1 → see G40–G42 |
| 13 | No update/delete function exists for append-only | G10 | |
| 14 | Hash chain breaks visibly on tamper | G11 | |
| 15 | PRE_AUTH_ERA rows excluded | **G32** | orphan |
| 16 | Simultaneous mints → sequential | G16 | extended to every counter |
| 17 | No JNPT counter exists | G15 | folded as a note |
| 18 | JNPT dispatch offers next BLANK only, no typing | G15 | |
| 19 | USED leaf never reused | G15 | |
| 20 | Cancel needs reason; cancelled never a trip | **G33** | orphan |
| 21 | Second ACTIVE JNPT book refused | **G34** | orphan |
| 22 | H-format enforced per series | **G35** | orphan |
| 23 | series/seq server-computed | G35 | folded |
| 24 | Own LR book only | G14 | |
| 25 | LR leaf BLANK→USED once | **G36** | orphan |
| 26 | LR needs both parents | G27 | extended with `rsj_do_id` |
| 27 | JNPT backfill inside range, unused | G21 | |
| 28 | Hazira backfill format, below seed | G21 | folded |
| 29 | BACKFILL_ERA stamped; no eCount push | G21 + Phase 4 | push half deferred |
| 30 | Hand access revoked; verify checks shares | **G37** | orphan |
| 31 | owner@ cannot be locked out — detection only | **G38** | resolved by ruling A |

Eleven orphans became gates. None was scope creep. The two lists disagreed on nothing — they were simply written a day apart, and the second day changed who taps the challan.
