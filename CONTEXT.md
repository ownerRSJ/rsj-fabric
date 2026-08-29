# CONTEXT.md — RSJ Carriers Pvt. Ltd.

## The business
Road-transport contractor & fleet owner in India's EXIM container corridor. ~40 active clients, 94 own trucks, 100+ market suppliers (300+ vehicle network), 90+ drivers (₹8,000 base + union rate-card trip cash). Volume: 600–700 orders/month from JNPT (70% import / 30% export), 100–150 from Hazira. Full-truck-load sealed containers (20ft/40ft/ISO tanks); loose cargo only in the rare empty-export-container case.

## Why this system exists
1. **Anti-fraud:** a past traffic manager colluded with a supplier to inflate rates. The Strike Ledger (append-only bid/award record) is the control — and per D17 it binds the owner too.
2. **Kill re-keying:** DO/LR/truck numbers were re-typed across disconnected artifacts; one typo breaks the audit trail.
3. **Leak closure** (owner's ranked list): unbilled detention · receipts never reaching invoices · late invoicing (one missing LR blocks a whole 2–10 container lot) · no supplier-quote visibility · fake driver bills (never pre-intimated) · repeat garage expenses · RTO document lapses · driver-advance disputes · late supplier payments causing rate retaliation · idle truck time.

## Cast (final per Amendments A8/A9 — 16 accounts; Purchase Manager dissolved)
OWNER = Ranjit Jha (all discretion, sits in garage, approves every job, receives breakdown calls) · DIRECTORS = Rahul (1st — the project sponsor you are talking to) & Rohit (2nd) · admin@ = TOOL account, no daily use · TRAFFIC_HEAD (strikes all TM-sourced deals; Traffic Managers hold NO accounts, attribution via sourced_by_tm) · KAM_IMPORT / KAM_EXPORT (client servicing, DO intake — never sees supplier price, D19) · MASTER_JNPT / MASTER_HAZIRA (field custody: LR books, cash handover, receipts; their 4 bike runners are unnamed by owner veto A6) · SUPERVISOR (TripSheet completeness chasing, D8) · TRACKER (dedicated tracking desk, TRIP_EVENTS only) · CASHIER (float issue, bucket-C approvals) · BILLING_SALES (client invoices, sees client freight) / BILLING_PURCHASE (supplier bills, sees supplier cost — segregated, neither computes margin alone) · RECEIVABLE_EXE · MAINTENANCE_EXEC (types; the Maintenance Manager stays on paper; owner approves, D18). No accounts: TMs, drivers, field boys, CA, Maintenance Manager.

## Key mechanics to never forget
- Paper LR book is the LR number mint (D3). Registry tracks leaves; execs tap next leaf.
- Drivers have NO accounts; they interact via Masters and phone calls to the owner.
- Trip cash is a rate-card lump sum the driver KEEPS savings from (bucket A — never audited, D16).
- Supplier flow: fresh quote every trip (no standing rates), 80–90% advance at dispatch, balance after POD return, formal supplier bill, supplier demands payment advice showing deductions.
- eCount FTL Register export leaks margin → eCount role permissions restricted per D12.
- Timestamps are honest: most trip events are transcribed from the returned LR next day (source=LR_TRANSCRIBED); live tracking is a future telematics decision, not a form feature.

## Current phase (updated 2026-08-30)
Checkpoints #1 and #2 both CLOSED. **Phase 1 skeleton is built, deployed and verified 147/148** — the four workbooks and all registers exist on Google under `owner@rsjcarriers.com`, protected owner-only, with the challan counter still unseeded.

Checkpoint #2 produced Amendments **A11** (fourth expense bucket `D_DIRECT_COMPANY` — diesel/toll on own trucks move through no driver, so D16's three driver buckets don't fit them), **A12** (`SUPPLIER_PAYABLE_DEDUCTIONS` child register — one bill routinely carries TDS + detention chargeback + damage), **A13** (Collection Head and Billing head are the same human: one seat, one login; the role list is exactly A9's 16 accounts). SCHEMA.md is at **v4**.

**Phase 2 (service layer) is authorized**, blocked only on the challan-seeding decision: the owner wants to transcribe FY-2026-27 history in to test the system, and the counter must not be seeded historically or it will mint numbers that collide with challans already written on paper. See SCHEMA.md §10 item 18. Per-slice gates for Phase 3 still ahead.
