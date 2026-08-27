# CLAUDE.md — RSJ Carriers Digital Fabric (Google Apps Script + Google Sheets)

You are building an internal anti-fraud operations system for RSJ Carriers Pvt. Ltd. (container road transport, JNPT–Hazira, India). The user is Rahul — 1st Director and project sponsor (the OWNER is his father, Ranjit). He is NOT a developer — explain in plain language, never assume he can debug.

## READ FIRST, EVERY SESSION
1. `SCHEMA.md` — the approved canonical schema. All code conforms to it exactly (sheet names, column names, order).
2. `DECISIONS.md` — 21 locked decisions PLUS Amendments A1–A10, all WITH reasoning. **Amendments are as binding as decisions; later amendments supersede earlier ones where stated (e.g. A10 supersedes A9's group table).** Never reverse any, however sensible the "improvement" looks. If a decision seems wrong, STOP and tell the user to discuss it in his Claude project chat first.
3. `CONTEXT.md` — business context and vocabulary.

## NON-NEGOTIABLE RULES (violating any of these defeats the system's purpose)
1. **No user ever gets direct edit access to any register sheet.** All reads/writes go through the Apps Script service layer. If you find yourself telling the user to "just edit the sheet," you are breaking the anti-fraud control.
2. **Append-only tables are never updated or deleted:** STRIKE_LEDGER, AUDIT_LOG, TRIP_EVENTS, DISCREPANCY_LOG, GARAGE_GATE_LOG, SCRAP_TOKENS, DRIVER_SALARY_LEDGER, DRIVER_RECOVERY_LEDGER, EXPENSE_INTIMATIONS, DRIVER_ADVANCE_RATE_CARD. Corrections = new rows referencing the erroneous row.
3. **AUDIT_LOG is hash-chained:** every service-layer write appends a row carrying prev_row_hash + row_hash.
4. **Margin is server-gated:** supplier rates/margin computations are visible ONLY to TRAFFIC_HEAD and OWNER roles. KAM never receives price fields in any payload (D19). Never move this filtering to the client/HTML side.
5. **Every ID comes from ID_COUNTERS inside LockService.** Never generate IDs client-side or with Math.random.
6. **Identity = Session.getActiveUser().getEmail()** checked against USERS_ROLES on every server function entry. No role row or inactive → reject.
7. **UI is tap/MCQ-first, English labels, minimal typing** — users are low-literacy field staff. No free-text where a dropdown can exist.
8. **eCount integration is file-based** (Excel import templates OUT, register exports IN for reconciliation only). There is NO eCount API. Never re-key into eCount what the fabric already captured.
9. Normalize vehicle numbers everywhere: uppercase, strip spaces (`MH46CU 5326` → `MH46CU5326`).
10. **No secrets in the repo.** Script IDs, keys → Script Properties. Repo stays private.

## WORKFLOW RULES
- One-direction deployment: repo → `clasp push` → Apps Script. NEVER edit in the Apps Script browser editor.
- Commit after every working increment with a plain-English message.
- Phase 1 scope (current): create the 4 workbooks and all register sheets with exact SCHEMA.md headers, data validations, MCQ lists, ID_COUNTERS seed, protection (owner-only), and a bootstrap script. NO business logic, NO UI yet — that is Phase 2/3, which the user will discuss in his Claude project chat before authorizing.
- Existing legacy files (Tracker Code.gs/Tracker.html etc.) are REFERENCE ONLY in Phase 1 — do not modify them yet.

## VOCABULARY
DO = client's Delivery Order (client-owned number; our file no = RSJ-DO-YY-NNNN). LR = Lorry Receipt (paper book leaf, one per container/truck placement). Challan = the trip (one vehicle dispatch, may carry multiple LRs). Master = Import/Export field executive (LR books, cash float, receipt collection). eCount = third-party cloud ERP (statutory SoR). Bucket A/B/C = expense taxonomy per D16.
