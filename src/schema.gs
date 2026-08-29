/**
 * schema.gs — THE canonical table definitions. This file IS SCHEMA.md, in code.
 *
 * Sheet names, column names and column ORDER conform to SCHEMA.md exactly.
 * Every place where SCHEMA.md's prose had to be resolved into a concrete column
 * carries a "DEVIATION:" comment naming the reason, so nothing is silent.
 *
 * Column "t" (type) drives formatting and data validation only:
 *   LIST:<key>  dropdown fed from that workbook's hidden _LISTS sheet
 *   CHECK       TRUE/FALSE checkbox
 *   DATE        date display format
 *   TS          timestamp display format
 *   MONEY       rupee display format
 *   INT         integer display format
 *   (omitted)   free text
 */

var FABRIC_SCHEMA = {

  /* ======================================================================
   * WB-GOV — Governance (SCHEMA.md §3)
   * ==================================================================== */

  WB_GOV: [

    { name: 'USERS_ROLES', ref: 'SCHEMA.md §3.1', appendOnly: true,
      note: 'Append-only custody log (Amendment A8). A handover APPENDS a closing row and a new row. Never edit, never delete - otherwise a disputed 2027 row stamped cashier@ cannot name a human.',
      columns: [
        { h: 'user_email' },
        { h: 'holder_name' },
        { h: 'role_from',   t: 'DATE' },
        { h: 'role_to',     t: 'DATE' },
        { h: 'assigned_by' },
        { h: 'account_type', t: 'LIST:ACCOUNT_TYPE' },
        { h: 'full_name' },
        { h: 'role',        t: 'LIST:ROLE' },
        { h: 'division',    t: 'LIST:DIVISION' },
        { h: 'active',      t: 'CHECK' },
        { h: 'created_ts',  t: 'TS' },
        { h: 'created_by' }
      ] },

    { name: 'EXPENSE_CATEGORIES', ref: 'SCHEMA.md §3.2', appendOnly: false,
      note: 'The MCQ list every expense is tagged from. BORDER_FACILITATION is DIRECTOR_ONLY per D9 - recorded, never omitted.',
      columns: [
        { h: 'cat_code' },
        { h: 'label_en' },
        // DEVIATION: label_hi / label_gu are NOT created. DECISIONS.md "Also
        // locked" reads "Labels: STRICTLY ENGLISH ONLY ... No Hindi/Gujarati
        // columns", and SCHEMA.md's own v3 changelog item 6 records the
        // vernacular columns as removed. The §3.2 table is stale on this point.
        { h: 'visibility_tier',  t: 'LIST:VISIBILITY_TIER' },
        { h: 'receipt_required', t: 'CHECK' },
        { h: 'ecount_template',  t: 'LIST:EXPENSE_ECOUNT_TEMPLATE' },
        // DEVIATION (additive): PHASE1_BRIEF item 5 requires "bucket mapping
        // per D16" to be pre-seeded. §3.2 lists no column to hold it, so one is
        // appended at the end rather than reordering anything.
        { h: 'default_bucket',   t: 'LIST:EXPENSE_BUCKET' }
      ] },

    { name: 'AUDIT_LOG', ref: 'SCHEMA.md §3.3', appendOnly: true,
      note: 'Hash-chained. Each row stores the previous row hash, so any retro-edit breaks the chain visibly. This is the bank-ledger mechanic applied to the whole system.',
      columns: [
        { h: 'log_id' },
        { h: 'ts', t: 'TS' },
        { h: 'user_email' },
        { h: 'action' },
        { h: 'target_table' },
        { h: 'target_id' },
        { h: 'payload_summary' },
        { h: 'prev_row_hash' },
        { h: 'row_hash' }
      ] },

    { name: 'SYNC_LEDGER', ref: 'SCHEMA.md §3.4', appendOnly: false,
      note: 'Every eCount import file pushed out and every register pulled back for reconciliation.',
      columns: [
        { h: 'batch_id' },
        { h: 'direction',       t: 'LIST:SYNC_DIRECTION' },
        { h: 'ecount_template', t: 'LIST:SYNC_ECOUNT_TEMPLATE' },
        { h: 'file_ref' },
        { h: 'row_count', t: 'INT' },
        { h: 'status',    t: 'LIST:SYNC_STATUS' },
        { h: 'checksum' },
        { h: 'ts',        t: 'TS' },
        { h: 'user' }
      ] },

    { name: 'ID_COUNTERS', ref: 'SCHEMA.md §3.5', appendOnly: false,
      note: 'Every ID in the system is minted here inside a script lock. Never generate an ID anywhere else.',
      columns: [
        { h: 'counter_name' },
        { h: 'current_value', t: 'INT' },
        { h: 'updated_ts',    t: 'TS' }
      ] }
  ],

  /* ======================================================================
   * WB-MASTERS — Registries (SCHEMA.md §4)
   * ==================================================================== */

  WB_MASTERS: [

    { name: 'CLIENTS_MASTER', ref: 'SCHEMA.md §4.1', appendOnly: false,
      columns: [
        { h: 'client_id' },
        { h: 'legal_name' },
        { h: 'gst_no' },
        { h: 'client_type', t: 'LIST:CLIENT_TYPE' },
        // DEVIATION: SCHEMA.md §4.1 says "kem_owner". Amendment A9 renames
        // KEM -> KAM "everywhere"; §4.1 was not updated. Using kam_owner.
        { h: 'kam_owner' },
        { h: 'billing_address' },
        { h: 'contact' },
        { h: 'payment_terms_days',   t: 'INT' },
        { h: 'lot_invoicing_policy', t: 'LIST:LOT_INVOICING_POLICY' },
        { h: 'status', t: 'LIST:MASTER_STATUS' }
      ] },

    { name: 'VEHICLES_MASTER', ref: 'SCHEMA.md §4.2', appendOnly: false,
      note: 'veh_no is normalized at entry AND at eCount-pull parse: uppercase, spaces stripped. MH46CU 5326 becomes MH46CU5326.',
      columns: [
        { h: 'veh_no' },
        { h: 'ownership',   t: 'LIST:OWNERSHIP' },
        { h: 'supplier_id' },
        { h: 'truck_type' },
        { h: 'capacity_ft', t: 'LIST:CAPACITY_FT' },
        { h: 'purchase_date',  t: 'DATE' },
        { h: 'purchase_value', t: 'MONEY' },
        { h: 'amort_monthly',  t: 'MONEY' },
        { h: 'assigned_driver' },
        { h: 'status', t: 'LIST:VEHICLE_STATUS' }
      ] },

    { name: 'DRIVERS_MASTER', ref: 'SCHEMA.md §4.3', appendOnly: false,
      columns: [
        { h: 'driver_id' },
        { h: 'name' },
        { h: 'phone' },
        { h: 'licence_no' },
        { h: 'licence_expiry', t: 'DATE' },
        { h: 'assigned_veh' },
        { h: 'base_salary', t: 'MONEY' },
        { h: 'status', t: 'LIST:MASTER_STATUS' }
      ] },

    { name: 'SUPPLIERS_MASTER', ref: 'SCHEMA.md §4.4', appendOnly: false,
      note: 'network_owner records whose network the supplier belongs to - networks are mutually exclusive, and this is what makes owner-vs-TM sourcing comparable in the strike reports.',
      columns: [
        { h: 'supplier_id' },
        { h: 'name' },
        { h: 'contact' },
        // DEVIATION: SCHEMA.md §4.4 writes "pan/gst"; a slash is not usable as
        // a column key. Rendered as pan_gst.
        { h: 'pan_gst' },
        { h: 'vendor_type',   t: 'LIST:VENDOR_TYPE' },
        { h: 'network_owner' },
        { h: 'payment_terms_days', t: 'INT' },
        { h: 'vehicles_typical' },
        { h: 'rating_notes' },
        { h: 'status', t: 'LIST:MASTER_STATUS' }
      ] },

    { name: 'CONTRACT_RATES', ref: 'SCHEMA.md §4.5', appendOnly: false,
      note: 'HEAD_PLUS visibility. This is the client-freight side of margin - the service layer never ships these fields to KAM payloads (D19).',
      columns: [
        { h: 'rate_id' },
        { h: 'client_id' },
        { h: 'from_loc' },
        { h: 'to_loc' },
        { h: 'direction',      t: 'LIST:DIRECTION_IE' },
        { h: 'container_type' },
        { h: 'tonnage' },
        { h: 'client_freight', t: 'MONEY' },
        { h: 'km', t: 'INT' },
        { h: 'valid_from', t: 'DATE' },
        { h: 'valid_to',   t: 'DATE' },
        { h: 'source_doc_ref' },
        { h: 'created_by' },
        { h: 'ts', t: 'TS' }
      ] }
  ],

  /* ======================================================================
   * WB-OPS — Operational spine (SCHEMA.md §5)
   * ==================================================================== */

  WB_OPS: [

    { name: 'DO_REGISTER', ref: 'SCHEMA.md §5.1', appendOnly: false,
      note: 'The order file. UNIQUE(client_id, client_do_no) is the duplicate-registration guard - enforced by the service layer in Phase 2, since Sheets cannot express a composite unique key.',
      columns: [
        { h: 'rsj_do_id' },
        { h: 'client_id' },
        { h: 'client_do_no' },
        { h: 'received_via', t: 'LIST:RECEIVED_VIA' },
        { h: 'received_ts',  t: 'TS' },
        { h: 'direction',    t: 'LIST:DIRECTION_IMPEXP' },
        { h: 'container_type' },
        { h: 'container_qty', t: 'INT' },
        { h: 'from_loc' },
        { h: 'to_loc' },
        { h: 'cargo_desc' },
        { h: 'shipping_line' },
        { h: 'vessel_cutoff', t: 'TS' },
        { h: 'contract_rate_id' },
        { h: 'qty_cancelled', t: 'INT' },
        { h: 'agreed_rate',   t: 'MONEY' },
        { h: 'rate_source',   t: 'LIST:RATE_SOURCE' },
        { h: 'status',        t: 'LIST:DO_STATUS' },
        { h: 'created_by' },
        { h: 'created_ts', t: 'TS' }
      ] },

    { name: 'STRIKE_LEDGER', ref: 'SCHEMA.md §5.2', appendOnly: true,
      note: 'The anti-fraud rate ledger. Append-only and hash-chained. Binds EVERYONE including the owner (D17). Margin is NEVER stored here - it is computed in a HEAD_PLUS view. A CORRECTION row points at the erroneous row; the original is never touched.',
      columns: [
        { h: 'strike_id' },
        { h: 'rsj_do_id' },
        { h: 'event_type',  t: 'LIST:STRIKE_EVENT_TYPE' },
        { h: 'supplier_id' },
        { h: 'veh_no' },
        { h: 'quoted_rate', t: 'MONEY' },
        { h: 'quoted_via',  t: 'LIST:QUOTED_VIA' },
        { h: 'award_reason' },
        { h: 'refers_strike_id' },
        { h: 'sourced_by_tm', t: 'LIST:SOURCED_BY_TM' },
        { h: 'entered_by' },
        { h: 'ts', t: 'TS' },
        { h: 'prev_row_hash' },
        { h: 'row_hash' }
      ] },

    { name: 'CHALLAN_REGISTER', ref: 'SCHEMA.md §5.3', appendOnly: false,
      note: 'The trip - the internal audit spine. awarded_strike_id ties the trip to the winning bid: that join is the fraud trace.',
      columns: [
        { h: 'challan_no' },
        { h: 'release_ts', t: 'TS' },
        { h: 'veh_no' },
        { h: 'driver_id' },
        { h: 'market_driver_name' },
        { h: 'market_driver_phone' },
        { h: 'ownership_snapshot', t: 'LIST:OWNERSHIP_SNAPSHOT' },
        { h: 'supplier_id' },
        { h: 'supplier_advance_amt', t: 'MONEY' },
        { h: 'awarded_strike_id' },
        { h: 'trip_status', t: 'LIST:TRIP_STATUS' },
        { h: 'closed_ts',   t: 'TS' },
        { h: 'created_by' }
      ] },

    { name: 'LR_REGISTER', ref: 'SCHEMA.md §5.4', appendOnly: false,
      note: 'One LR number, born on the paper book (D3). Two foreign keys - DO and Challan - because challan is NOT nested under DO (D5).',
      columns: [
        { h: 'lr_no' },
        { h: 'challan_no' },
        { h: 'rsj_do_id' },
        { h: 'container_no' },
        { h: 'consignor' },
        { h: 'consignee' },
        { h: 'from_loc' },
        { h: 'to_loc' },
        { h: 'lr_date',       t: 'DATE' },
        { h: 'stuffing_date', t: 'DATE' },
        { h: 'loading_date',  t: 'DATE' },
        { h: 'status',         t: 'LIST:LR_STATUS' },
        { h: 'replaces_lr_no' },
        { h: 'replace_reason', t: 'LIST:REPLACE_REASON' },
        { h: 'ecount_sync',    t: 'LIST:ECOUNT_SYNC' },
        { h: 'created_by' },
        { h: 'ts', t: 'TS' }
      ] },

    // DEVIATION: SCHEMA.md §5.5 LR_BOOK_REGISTRY describes TWO tables under one
    // heading ("Books:" and "Leaves:"). Sheets holds one table per sheet, so it
    // becomes two sheets, both keeping the register name as their prefix.
    { name: 'LR_BOOK_REGISTRY_BOOKS', ref: 'SCHEMA.md §5.5 (Books)', appendOnly: false,
      note: 'One book per Master per location. Each Master consumes only his own book leaves (Amendment A6).',
      columns: [
        { h: 'book_id' },
        { h: 'leaf_from', t: 'INT' },
        { h: 'leaf_to',   t: 'INT' },
        { h: 'issued_to' },
        { h: 'issue_ts', t: 'TS' },
        { h: 'status',   t: 'LIST:BOOK_STATUS' }
      ] },

    { name: 'LR_BOOK_REGISTRY_LEAVES', ref: 'SCHEMA.md §5.5 (Leaves)', appendOnly: false,
      note: 'A leaf goes BLANK -> USED exactly once, so duplicate use is structurally rejected. CANCELLED and LOST require a reason and surface on an exceptions view.',
      columns: [
        { h: 'lr_no' },
        { h: 'book_id' },
        { h: 'leaf_status', t: 'LIST:LEAF_STATUS' },
        { h: 'used_on_challan' },
        { h: 'status_ts', t: 'TS' },
        { h: 'status_by' }
      ] },

    { name: 'TRIP_EVENTS', ref: 'SCHEMA.md §5.6', appendOnly: true,
      note: 'Two timestamps on purpose. event_ts is when it actually happened (per the LR stamp); entered_ts is when it was typed in. source says which kind of truth this row is. No form here gives real-time truck tracking - that is telematics, a separate later decision.',
      columns: [
        { h: 'event_id' },
        { h: 'challan_no' },
        { h: 'lr_no' },
        { h: 'event_type', t: 'LIST:TRIP_EVENT_TYPE' },
        { h: 'event_ts',   t: 'TS' },
        { h: 'entered_ts', t: 'TS' },
        { h: 'source',     t: 'LIST:EVENT_SOURCE' },
        { h: 'stamped_by' },
        { h: 'geo_hint' },
        { h: 'note' }
      ] },

    { name: 'TRIP_EXPENSES', ref: 'SCHEMA.md §5.7', appendOnly: false,
      note: 'Bucket A is never itemized or audited - the driver keeps his savings, so fake bills are structurally impossible there (D16). Bucket B needs a receipt before the invoice can complete. Bucket C needs a pre-intimation (D14).',
      columns: [
        { h: 'exp_id' },
        { h: 'challan_no' },
        { h: 'lr_no' },
        { h: 'cat_code' },
        { h: 'bucket', t: 'LIST:EXPENSE_BUCKET' },
        { h: 'amount', t: 'MONEY' },
        { h: 'intimation_id' },
        { h: 'intimation_check', t: 'LIST:INTIMATION_CHECK' },
        { h: 'paid_from_float_id' },
        { h: 'receipt_status',  t: 'LIST:RECEIPT_STATUS' },
        { h: 'doc_pouch_id' },
        { h: 'approval_status', t: 'LIST:APPROVAL_STATUS' },
        { h: 'approved_by' },
        // DEVIATION: SCHEMA.md §5.7 writes "ecount_push (template + batch_id)",
        // i.e. two values in one bullet. Rendered as two columns.
        { h: 'ecount_push_template', t: 'LIST:EXPENSE_ECOUNT_TEMPLATE' },
        { h: 'ecount_push_batch_id' },
        { h: 'entered_by' },
        { h: 'ts', t: 'TS' }
      ] },

    { name: 'CASH_FLOAT_REGISTER', ref: 'SCHEMA.md §5.8', appendOnly: false,
      note: 'Voucher-at-handover rule: the advance is tapped by the Master in front of the driver at the moment of handover. The back-office evening voucher written from memory is abolished. A SHORT float is visible the day it happens.',
      columns: [
        { h: 'float_id' },
        { h: 'issued_to' },
        { h: 'challan_no' },
        { h: 'amount_issued', t: 'MONEY' },
        { h: 'issued_by' },
        { h: 'issue_ts', t: 'TS' },
        { h: 'amount_accounted', t: 'MONEY' },
        { h: 'amount_returned',  t: 'MONEY' },
        { h: 'reconcile_status', t: 'LIST:RECONCILE_STATUS' },
        { h: 'closed_ts', t: 'TS' }
      ] },

    { name: 'DOC_POUCH', ref: 'SCHEMA.md §5.9', appendOnly: false,
      note: 'The invoicing gate: an invoice cannot be marked ANNEXURE_COMPLETE while any required_for_invoice doc is not AT_OFFICE or ATTACHED. This is where "lost receipt = lost money" gets structurally fixed. Expected docs auto-seed by direction on challan creation.',
      columns: [
        { h: 'doc_id' },
        { h: 'challan_no' },
        { h: 'doc_type', t: 'LIST:DOC_TYPE' },
        { h: 'expected', t: 'CHECK' },
        { h: 'status',   t: 'LIST:DOC_STATUS' },
        { h: 'holder' },
        { h: 'status_ts', t: 'TS' },
        { h: 'required_for_invoice', t: 'CHECK' }
      ] },

    { name: 'DISCREPANCY_LOG', ref: 'SCHEMA.md §5.10', appendOnly: true,
      columns: [
        { h: 'disc_id' },
        { h: 'challan_no' },
        { h: 'lr_no' },
        { h: 'type', t: 'LIST:DISCREPANCY_TYPE' },
        { h: 'mcq_detail' },
        { h: 'note' },
        { h: 'raised_by' },
        { h: 'ts', t: 'TS' },
        { h: 'resolution_status', t: 'LIST:RESOLUTION_STATUS' },
        { h: 'resolution_note' },
        { h: 'resolved_by' },
        { h: 'resolved_ts', t: 'TS' }
      ] },

    { name: 'INVOICE_TRACKER', ref: 'SCHEMA.md §5.11', appendOnly: false,
      note: 'Ops mirror only - eCount stays the system of record for the invoice itself. per_lr_readiness is computed from DOC_POUCH and names the blocking document and its holder.',
      columns: [
        { h: 'inv_track_id' },
        { h: 'ecount_invoice_no' },
        { h: 'client_id' },
        { h: 'lot_id' },
        { h: 'lr_list' },
        { h: 'per_lr_readiness' },
        { h: 'invoice_amount', t: 'MONEY' },
        { h: 'invoice_date',   t: 'DATE' },
        { h: 'annexure_status', t: 'LIST:ANNEXURE_STATUS' },
        { h: 'submitted_ts', t: 'TS' },
        { h: 'due_date',     t: 'DATE' },
        { h: 'collection_status', t: 'LIST:COLLECTION_STATUS' },
        { h: 'last_followup_ts',  t: 'TS' },
        { h: 'followup_by' },
        { h: 'closed_ts', t: 'TS' }
      ] },

    { name: 'EXPENSE_INTIMATIONS', ref: 'SCHEMA.md §5.12', appendOnly: true,
      note: 'The anti-fake-bill control. A bill must MATCH an OPEN intimation on the same challan and category, within tolerance, or it auto-flags. A fake bill now requires a pre-logged fake intimation - casual fraud becomes premeditated conspiracy with evidence attached.',
      columns: [
        { h: 'intimation_id' },
        { h: 'challan_no' },
        { h: 'veh_no' },
        { h: 'cat_code' },
        { h: 'est_amount', t: 'MONEY' },
        { h: 'location_hint' },
        { h: 'intimated_by' },
        { h: 'ts', t: 'TS' },
        { h: 'status', t: 'LIST:INTIMATION_STATUS' },
        { h: 'matched_exp_id' },
        { h: 'expiry_ts', t: 'TS' }
      ] },

    { name: 'SUPPLIER_PAYABLE_TRACKER', ref: 'SCHEMA.md §5.13', appendOnly: false,
      note: 'Exists for the operational join eCount cannot make: per-supplier payment delay against that supplier’s subsequent quote trend in the STRIKE_LEDGER. due_date = pod_received_ts + N, company default N=30 (D20c / A4), per-supplier override honoured.',
      columns: [
        { h: 'payable_id' },
        { h: 'supplier_id' },
        { h: 'challan_no' },
        { h: 'ecount_bill_ref' },
        { h: 'bill_amount', t: 'MONEY' },
        { h: 'bill_date',   t: 'DATE' },
        { h: 'pod_received_ts', t: 'TS' },
        { h: 'due_date',   t: 'DATE' },
        { h: 'paid_date',  t: 'DATE' },
        { h: 'paid_amount', t: 'MONEY' },
        { h: 'delay_days',  t: 'INT' },
        // Deductions moved to the SUPPLIER_PAYABLE_DEDUCTIONS child register
        // per Amendment A12 (Checkpoint #2) - several per bill is normal.
        { h: 'payment_advice_ref' },
        { h: 'dispute_flag', t: 'CHECK' },
        { h: 'notes' }
      ] },

    { name: 'SUPPLIER_PAYABLE_DEDUCTIONS', ref: 'SCHEMA.md §5.14 (Amendment A12)', appendOnly: false,
      note: 'One row per deduction on a supplier bill - a single payment routinely carries TDS plus a detention chargeback plus occasionally damage. The payment advice itemizes from these rows, which is the breakup sheet suppliers demand.',
      columns: [
        { h: 'deduction_id' },
        { h: 'payable_id' },
        { h: 'deduction_type', t: 'LIST:DEDUCTION_TYPE' },
        { h: 'amount', t: 'MONEY' },
        { h: 'reason' },
        { h: 'entered_by' },
        { h: 'ts', t: 'TS' }
      ] }
  ],

  /* ======================================================================
   * WB-FLEET — Maintenance division (SCHEMA.md §6)
   * ==================================================================== */

  WB_FLEET: [

    { name: 'GARAGE_GATE_LOG', ref: 'SCHEMA.md §6.1', appendOnly: true,
      note: 'The odometer readings here feed the component-life view: km between replacements per part, per truck, per driver.',
      columns: [
        { h: 'gate_id' },
        { h: 'veh_no' },
        { h: 'direction', t: 'LIST:GATE_DIRECTION' },
        { h: 'ts', t: 'TS' },
        { h: 'odometer_km', t: 'INT' },
        { h: 'diesel_level' },
        { h: 'driver_id' },
        { h: 'recorded_by' }
      ] },

    { name: 'JOB_CARDS', ref: 'SCHEMA.md §6.2', appendOnly: false,
      note: 'D18: the Maintenance Manager records, the OWNER one-tap-approves every job and every spend, and the approval is logged. Gate-lock: status cannot reach CLOSED while any child scrap token is unreturned.',
      columns: [
        { h: 'job_id' },
        { h: 'veh_no' },
        { h: 'gate_in_id' },
        { h: 'workshop_type', t: 'LIST:WORKSHOP_TYPE' },
        { h: 'vendor_id' },
        { h: 'owner_approval', t: 'LIST:OWNER_APPROVAL' },
        { h: 'linked_challan' },
        { h: 'complaint_codes' },
        { h: 'work_done_codes' },
        { h: 'labor_cost', t: 'MONEY' },
        { h: 'parts_cost', t: 'MONEY' },
        { h: 'total_cost', t: 'MONEY' },
        { h: 'status', t: 'LIST:JOB_STATUS' },
        // DEVIATION: SCHEMA.md §6.2 writes "opened_by/ts" and "closed_by/ts";
        // rendered as four columns.
        { h: 'opened_by' },
        { h: 'opened_ts', t: 'TS' },
        { h: 'closed_by' },
        { h: 'closed_ts', t: 'TS' }
      ] },

    { name: 'PARTS_ISSUE', ref: 'SCHEMA.md §6.3', appendOnly: false,
      columns: [
        { h: 'issue_id' },
        { h: 'job_id' },
        { h: 'part_code' },
        { h: 'part_desc' },
        { h: 'qty', t: 'INT' },
        { h: 'unit_cost', t: 'MONEY' },
        { h: 'issued_by' },
        { h: 'ts', t: 'TS' },
        { h: 'scrap_expected', t: 'CHECK' },
        { h: 'scrap_token_id' }
      ] },

    { name: 'SCRAP_TOKENS', ref: 'SCHEMA.md §6.4', appendOnly: true,
      note: 'Status SOLD requires a sale_id in SCRAP_SALES. "Stolen piece by piece" ends where the token chain meets a weighbridge slip.',
      columns: [
        { h: 'scrap_token_id' },
        { h: 'issue_id' },
        { h: 'veh_no' },
        { h: 'part_desc' },
        { h: 'status', t: 'LIST:SCRAP_STATUS' },
        { h: 'status_ts', t: 'TS' },
        { h: 'status_by' },
        { h: 'sale_value', t: 'MONEY' }
      ] },

    { name: 'VEHICLE_DOCS', ref: 'SCHEMA.md §6.5', appendOnly: false,
      note: 'RTO document lapses were on the owner’s ranked leak list. alert_days_before drives the expiry warning.',
      columns: [
        { h: 'vdoc_id' },
        { h: 'veh_no' },
        { h: 'doc_type', t: 'LIST:VEHICLE_DOC_TYPE' },
        { h: 'doc_no' },
        { h: 'issue_date',  t: 'DATE' },
        { h: 'expiry_date', t: 'DATE' },
        { h: 'alert_days_before', t: 'INT' },
        { h: 'status', t: 'LIST:VEHICLE_DOC_STATUS' }
      ] },

    { name: 'DRIVER_SALARY_LEDGER', ref: 'SCHEMA.md §6.6', appendOnly: true,
      note: 'Base salary plus bucket-A trip cash per the rate card. The driver’s savings from trip cash are his income and are NEVER clawed back. No trip-balance deductions exist here; settlement claims live in DRIVER_RECOVERY_LEDGER.',
      columns: [
        { h: 'sal_id' },
        { h: 'driver_id' },
        { h: 'period' },
        { h: 'entry_type', t: 'LIST:SALARY_ENTRY_TYPE' },
        { h: 'amount', t: 'MONEY' },
        { h: 'ref' },
        { h: 'entered_by' },
        { h: 'ts', t: 'TS' },
        { h: 'ecount_push', t: 'LIST:SALARY_ECOUNT_PUSH' }
      ] },

    { name: 'DRIVER_ADVANCE_RATE_CARD', ref: 'SCHEMA.md §6.7', appendOnly: true,
      note: 'Union-negotiated. The advance auto-fills from here at dispatch, so the driver argues with a rate card, not with a Master. Re-negotiations APPEND a new version - history is preserved.',
      columns: [
        { h: 'rate_id' },
        { h: 'destination' },
        { h: 'direction',      t: 'LIST:DIRECTION_IE' },
        { h: 'container_type', t: 'LIST:RATE_CARD_CONTAINER_TYPE' },
        { h: 'trip_cash_amt',  t: 'MONEY' },
        { h: 'effective_from', t: 'DATE' },
        { h: 'superseded_by' },
        { h: 'approved_by' },
        { h: 'ts', t: 'TS' }
      ] },

    { name: 'DRIVER_RECOVERY_LEDGER', ref: 'SCHEMA.md §6.8', appendOnly: true,
      note: 'Every claim carries a reason, evidence and a timestamp - protecting the company at settlement AND the driver from arbitrary invention. Driver acknowledgment is mandatory on every row.',
      columns: [
        { h: 'rec_id' },
        { h: 'driver_id' },
        { h: 'entry_type', t: 'LIST:RECOVERY_ENTRY_TYPE' },
        { h: 'amount', t: 'MONEY' },
        { h: 'reason' },
        { h: 'evidence_ref' },
        { h: 'recorded_by' },
        { h: 'ts', t: 'TS' },
        { h: 'settlement_status', t: 'LIST:SETTLEMENT_STATUS' },
        { h: 'settled_ts', t: 'TS' },
        // DEVIATION (additive): SCHEMA.md changelog item 5 LOCKS driver
        // thumb/OTP acknowledgment on every row of this register, but §6.8
        // lists no column to hold it. Two columns appended at the end so the
        // locked decision has somewhere to live. Confirm at Checkpoint #2.
        { h: 'driver_ack_method', t: 'LIST:ACK_METHOD' },
        { h: 'driver_ack_ts', t: 'TS' }
      ] },

    { name: 'SCRAP_SALES', ref: 'SCHEMA.md §6.9', appendOnly: false,
      note: 'Per-category buyers are seeded into SUPPLIERS_MASTER as vendor_type SCRAP_BUYER.',
      columns: [
        { h: 'sale_id' },
        { h: 'category', t: 'LIST:SCRAP_CATEGORY' },
        { h: 'buyer_id' },
        { h: 'token_list' },
        { h: 'weight_or_qty' },
        { h: 'amount', t: 'MONEY' },
        { h: 'date', t: 'DATE' },
        { h: 'recorded_by' }
      ] }
  ]
};

/**
 * SCHEMA.md §6.10 UNIT_ECONOMICS is deliberately absent: it is a computed view,
 * not a table, and it is built in Phase 6 (Slice 4). Same for the TripSheet
 * (§7) and the tracking worklist (§5.6) - views over these tables, never new
 * registers.
 */

/** All workbook keys, in creation order. */
function workbookKeys_() {
  return ['WB_GOV', 'WB_MASTERS', 'WB_OPS', 'WB_FLEET'];
}

/** Header row for one table definition. */
function headersOf_(table) {
  return table.columns.map(function (c) { return c.h; });
}
