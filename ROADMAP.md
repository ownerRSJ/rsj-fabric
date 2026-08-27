# ROADMAP.md — RSJ Digital Fabric: where we are, what comes next

## JOURNEY SO FAR (compressed — full reasoning lives in DECISIONS.md)
1. **Boundary settled:** eCount = statutory system of record; our fabric = rate audits, trip supervision, custody, job cards, unit economics. Flow is push-first (fabric → eCount Excel imports), pull only to reconcile (D1–D2).
2. **Spine settled:** paper LR book mints LR numbers → fabric registry → eCount. Challan = the trip, fabric-minted, continuing the live numeric series. RSJ-DO = our internal file number; the client's DO number is an attribute (D3–D7).
3. **Schema built and verified:** 24 registers across 4 workbooks, drafted v1→v3, verified through two plain-language walkthroughs (masters/spine/slice-1, then strikes/fleet/salary), finalized as SCHEMA.md. Three-bucket expense taxonomy (D16), pre-intimation anti-fake-bill rule (D14), owner-binding strike ledger (D17).
4. **Identity settled:** Google Workspace (Outlook rejected — Apps Script auth is Google-only). 16 role-named accounts with an append-only custody log (who holds each seat, from when), admin@ as a write-rejected TOOL account, 9 free Groups (4 external-facing incl. public business@, 3 internal permission groups, do@ with Collaborative Inbox, escalations@ with two directors). Amendments A1–A10.
5. **Handoff written:** SCHEMA.md · DECISIONS.md · CONTEXT.md · CLAUDE.md · PHASE1_BRIEF.md · ROADMAP.md — the six files that let any model, any session, continue without re-litigating.

## WHERE WE ARE **RIGHT NOW**
Workspace bought and configured · repo folder `rsj-fabric` on desktop · six files audited → drop them in, commit "blueprint approved — checkpoint 1 closed", push private.

## PHASES AHEAD (each gate = a conversation in the Claude project chat BEFORE the next build step)

**PHASE 1 — Skeleton (Claude Code, + human work in parallel)**
Bootstrap script creates 4 workbooks, all sheets, exact headers, dropdowns, protections, seeded counters (owner supplies that morning's next challan number), verification prints all-PASS.
Parallel human work: master-data cleanup (trucks normalized, clients with lot policy asked, suppliers with network_owner, drivers, union rate-card matrix, vehicle-docs list) · Workspace hardening (2SV, Tools OU for admin@) · baselines measured (unbilled detention last quarter, cash-out vs receipts-back, % invoices >7 days late, avg supplier payment delay).
**🛑 GATE: return to project chat → CHECKPOINT #2 (auth & service-layer walkthrough).**

**PHASE 2 — Service layer (Deliverable 2)**
Auth against USERS_ROLES · role gates on every server call · TOOL-account write rejection · hash-chained AUDIT_LOG writer · ID minting under LockService · LR Book Registry logic · direct sheet edit access revoked (the moment append-only becomes real). No visible UI.
**🛑 GATE: project chat sign-off on gate tests.**

**PHASE 3 — Screens (Deliverable 3), in slice order (D13)**
Slice 1: DO intake (KAM) · challan/LR release · Master's field screens (leaf tap, voucher-at-handover, intimations, doc pouch) · Tracker rewired · TripSheet completeness view · invoice readiness.
Slice 2: Strike Ledger screens + supplier payables & payment advice.
Slice 3: garage gate, job cards + owner one-tap approval, scrap tokens/sales, vehicle-doc alerts, salary & recovery ledgers.
Each screen tested by its real user before the next starts.
**🛑 GATE per slice: project chat review.**

**PHASE 4 — eCount bridge**
Template generators (FullLoad, LrEntry, Diesel, Toll, Cash Payment) · reconciliation parsers (FTL/Trip/Receivable/Payable registers, normalized) · run parallel with old practice until mismatches go quiet. eCount executive delivers the custom RSJ-DO field and role-restricted registers (SCHEMA.md §9 asks).

**PHASE 5 — Pilot & cutover**
Two weeks, JNPT corridor, one Master + one Traffic Manager, paper running alongside · fix what breaks · compare against baselines · then widen to Hazira and full volume.

**PHASE 6 — The views that pay (Slice 4)**
Unit economics per vehicle · component-life per truck per driver · time-death report · empty-vehicle × open-DO matcher · cost-of-awarding-fast report · payment-delay × quote-trend per supplier.

## STANDING RULES ACROSS ALL PHASES
- Nothing is built without its gate conversation. Scope creep inside a phase = refused.
- Any decision change = written amendment in DECISIONS.md, never a silent edit.
- Repo → clasp → Apps Script, one direction. Nobody edits in the browser editor.
- The owner's job is truth about operations; the code is the architect's problem.
