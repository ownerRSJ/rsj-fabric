# PHASE1_BRIEF.md — first Claude Code session instructions

> **STATUS: COMPLETE (2026-08-30).** The skeleton is built, deployed and verified 147/148; the
> only outstanding item is the `CHALLAN_SEED` script property. The human work listed at the
> bottom of this file is still outstanding. Deployment steps now live in `DEPLOY.md`; current
> project state lives in `ROADMAP.md`. This file is kept as the record of what Phase 1 was
> asked to do.

## Owner's one-time setup (15–60 min, do once, in order)
1. Install Node.js LTS from nodejs.org, then in a terminal: `npm install -g @google/clasp`
2. `clasp login` — log in with your NEW @rsjcarriers.com daily account (not admin@).
3. Enable the Apps Script API: https://script.google.com/home/usersettings → turn ON.
4. Make a private GitHub repo named `rsj-fabric`. Put these files in it: SCHEMA.md, DECISIONS.md, CONTEXT.md, CLAUDE.md, PHASE1_BRIEF.md. First commit message: "blueprint approved — checkpoint 1 closed".
5. Open Claude Code in that folder and say: **"Read CLAUDE.md, SCHEMA.md, DECISIONS.md, CONTEXT.md fully, then execute PHASE1_BRIEF.md step by step. Explain each step in plain language before doing it."**

## Phase 1 scope (and nothing more)
Build the SKELETON only — no business logic, no user screens:
1. A bootstrap Apps Script (`bootstrap.gs`) that creates 4 Google Spreadsheets — WB-GOV, WB-MASTERS, WB-OPS, WB-FLEET — with every register sheet from SCHEMA.md §3–§6, exact headers in exact order, frozen header rows.
2. Data validations & MCQ dropdowns: every enum column (statuses, buckets, categories, roles, doc types) gets a dropdown fed from a hidden LISTS sheet per workbook.
3. ID_COUNTERS seeded (challan counter starts at the number the owner gives — ask him; it continues the live eCount series).
4. Protection: all register sheets protected owner-only; a note row explaining "writes go through the app, not by hand."
5. EXPENSE_CATEGORIES pre-seeded per SCHEMA.md §3.2 including BORDER_FACILITATION (DIRECTOR_ONLY) and bucket mapping per D16.
6. A `config.gs` holding the N=30 supplier-terms default and the D20a thresholds as named constants (single place to change).
7. Store the four spreadsheet IDs in Script Properties, never in code.
8. A verification function that re-reads all sheets and prints a PASS/FAIL table: every sheet present, every header matching SCHEMA.md exactly.

## Definition of done for Phase 1
- Owner opens each workbook and sees all sheets with correct headers.
- Verification function prints all-PASS.
- Repo committed and pushed; clasp push works one-direction.
- NOTHING else built. Phase 2 (service layer: auth, role gates, hash-chained audit writer, ID minting, LR Book Registry logic) begins only after the owner returns to his Claude project chat and Checkpoint #2 is discussed.

## Also during Phase 1 (human work, parallel, not code)
- Master-data cleanup: normalized lists of 94 trucks, ~40 clients (with lot_invoicing_policy asked per client), 100+ suppliers (with network_owner + vendor_type), 90+ drivers, union DRIVER_ADVANCE_RATE_CARD matrix, vehicle-documents list from the executive's existing Excel.
- Workspace configuration per D21 (accounts, groups, 2SV, admin/daily split).
- Baselines measured (DECISIONS.md bottom) — before anything goes live.
