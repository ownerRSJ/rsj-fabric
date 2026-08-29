/**
 * lists.gs — every MCQ / dropdown list in the system, grouped by workbook.
 *
 * PHASE1_BRIEF item 2: "every enum column gets a dropdown fed from a hidden
 * LISTS sheet per workbook."
 *
 * Each workbook gets its own hidden _LISTS sheet, because Google Sheets data
 * validation cannot reference a range in a DIFFERENT spreadsheet file. That is
 * also why foreign keys that point across workbooks (client_id, veh_no,
 * supplier_id, driver_id, cat_code) get NO dropdown here - the Phase 2 service
 * layer validates those on write.
 *
 * Lists are English-only by locked decision (DECISIONS.md "Also locked":
 * low-literacy accommodation is tap/MCQ design, never vernacular text).
 */

var LISTS = {

  /* ===================== WB-GOV ========================================== */

  WB_GOV: {
    // USERS_ROLES.account_type - the service layer REJECTS writes from TOOL (A8)
    ACCOUNT_TYPE: ['HUMAN', 'TOOL'],

    // USERS_ROLES.role - the 16-seat roster locked by Amendment A9.
    ROLE: [
      'OWNER',
      'DIRECTOR_1',
      'DIRECTOR_2',
      'WORKSPACE_ADMIN',
      'TRAFFIC_HEAD',
      'CASHIER',
      'KAM_IMPORT',
      'KAM_EXPORT',
      'MASTER_JNPT',
      'MASTER_HAZIRA',
      'SUPERVISOR',
      'TRACKER',
      'BILLING_SALES',
      'BILLING_PURCHASE',
      'RECEIVABLE_EXE',
      'MAINTENANCE_EXEC'
    ],

    DIVISION: ['GOV', 'OPS', 'FLEET'],

    // EXPENSE_CATEGORIES.visibility_tier - BORDER_FACILITATION is DIRECTOR_ONLY (D9)
    VISIBILITY_TIER: ['ALL', 'HEAD_PLUS', 'DIRECTOR_ONLY'],

    // EXPENSE_CATEGORIES.ecount_template - which import template the money flows to
    EXPENSE_ECOUNT_TEMPLATE: ['DIESEL_ENTRY', 'TOLL_TAX', 'CASH_PAYMENT', 'JV'],

    // EXPENSE_CATEGORIES.default_bucket - the expense taxonomy: three driver
    // buckets (D16) plus bucket D for direct company costs (Amendment A11,
    // Checkpoint #2): diesel/toll on own trucks move through no driver, so
    // forcing them into A would trigger receipt-chasing D16 forbids there.
    EXPENSE_BUCKET: ['A_TRIP_CASH', 'B_CLIENT_RECOVERABLE', 'C_EXTRAORDINARY', 'D_DIRECT_COMPANY'],

    SYNC_DIRECTION: ['PUSH', 'PULL'],

    SYNC_STATUS: ['GENERATED', 'UPLOADED', 'CONFIRMED', 'FAILED'],

    // SYNC_LEDGER.ecount_template - the full template list from SCHEMA.md §9
    SYNC_ECOUNT_TEMPLATE: [
      'FULLLOAD_IMPORT',
      'LRENTRY',
      'DIESEL_ENTRY',
      'TOLL_TAX',
      'CASH_PAYMENT',
      'JOURNAL_VOUCHER',
      'FTL_REGISTER',
      'TRIP_REGISTER',
      'RECEIVABLE_BILL_BY_BILL',
      'PAYABLE_BILL_BY_BILL'
    ]
  },

  /* ===================== WB-MASTERS ===================================== */

  WB_MASTERS: {
    CLIENT_TYPE: ['IMPORTER', 'EXPORTER', 'CHA', 'FORWARDER'],

    // D20b - asked of each client during master-data cleanup
    LOT_INVOICING_POLICY: ['FULL_LOT_ONLY', 'SPLIT_ALLOWED'],

    // Masters are deactivated, never deleted
    MASTER_STATUS: ['ACTIVE', 'INACTIVE'],

    OWNERSHIP: ['OWN', 'MARKET'],

    CAPACITY_FT: ['20', '40', 'ISO', 'OT', 'HC', 'REEFER'],

    VEHICLE_STATUS: ['ACTIVE', 'GARAGE', 'SOLD'],

    // SCRAP_BUYER added per SCHEMA.md §6.9 (per-category scrap buyers seed here)
    VENDOR_TYPE: ['TRANSPORT', 'PARTS', 'WORKSHOP', 'SCRAP_BUYER'],

    DIRECTION_IE: ['IMP', 'EXP']
  },

  /* ===================== WB-OPS ========================================= */

  WB_OPS: {
    RECEIVED_VIA: ['EMAIL', 'WHATSAPP', 'PORTAL'],

    DIRECTION_IMPEXP: ['IMPORT', 'EXPORT'],

    // auto-computed from LR count vs (qty - qty_cancelled), but constrained here too
    DO_STATUS: ['OPEN', 'PARTIAL', 'FULFILLED', 'CANCELLED'],

    RATE_SOURCE: ['CONTRACT', 'SPOT_CONFIRMED'],

    // STRIKE_LEDGER.event_type - CORRECTION never edits, it points at the bad row
    STRIKE_EVENT_TYPE: ['QUOTE', 'REQUOTE', 'AWARD', 'CANCEL', 'CORRECTION'],

    QUOTED_VIA: ['CALL', 'WHATSAPP', 'IN_PERSON'],

    OWNERSHIP_SNAPSHOT: ['OWN', 'MARKET'],

    TRIP_STATUS: ['RELEASED', 'IN_TRANSIT', 'AT_CLIENT', 'RETURNING', 'CLOSED', 'STUCK'],

    LR_STATUS: ['ACTIVE', 'CANCELLED', 'REPLACED'],

    REPLACE_REASON: ['ACCIDENT', 'REROUTE', 'TRANSSHIP', 'ERROR'],

    ECOUNT_SYNC: ['PENDING', 'PUSHED', 'CONFIRMED'],

    BOOK_STATUS: ['ACTIVE', 'EXHAUSTED', 'LOST'],

    // A leaf goes BLANK -> USED exactly once; duplicate use is structurally rejected
    LEAF_STATUS: ['BLANK', 'USED', 'CANCELLED', 'LOST'],

    TRIP_EVENT_TYPE: [
      'RELEASED',
      'CONTAINER_PICKED',
      'WEIGHMENT',
      'GATE_IN',
      'LR_STAMP_ARRIVAL',
      'UNLOAD_START',
      'UNLOAD_END',
      'LR_STAMP_DEPART',
      'GATE_OUT',
      'EMPTY_RETURNED',
      'EMPTY_REFUSED',
      'DOCS_HANDED',
      'GARAGE_IN',
      'GARAGE_OUT'
    ],

    // The honesty rule (SCHEMA §5.6): transcribed rows are next-day truth,
    // only LIVE_TAP / PHONE_REPORTED rows carry live visibility.
    EVENT_SOURCE: ['LR_TRANSCRIBED', 'LIVE_TAP', 'PHONE_REPORTED'],

    EXPENSE_BUCKET: ['A_TRIP_CASH', 'B_CLIENT_RECOVERABLE', 'C_EXTRAORDINARY', 'D_DIRECT_COMPANY'],

    INTIMATION_CHECK: ['MATCHED', 'POST_FACTO_FLAGGED', 'BELOW_THRESHOLD'],

    RECEIPT_STATUS: ['HAS_RECEIPT', 'PROMISED', 'NO_RECEIPT'],

    APPROVAL_STATUS: ['SUBMITTED', 'APPROVED', 'REJECTED'],

    EXPENSE_ECOUNT_TEMPLATE: ['DIESEL_ENTRY', 'TOLL_TAX', 'CASH_PAYMENT', 'JOURNAL_VOUCHER'],

    RECONCILE_STATUS: ['OPEN', 'BALANCED', 'SHORT', 'EXCESS'],

    DOC_TYPE: [
      'LR_DUPLICATE',
      'WEIGHMENT_SLIP',
      'EIR',
      'POD',
      'PARKING_RECEIPT',
      'EMPTY_YARD_RECEIPT',
      'REPAIR_BILL',
      'OTHER'
    ],

    DOC_STATUS: [
      'PENDING',
      'WITH_DRIVER',
      'WITH_MASTER',
      'AT_OFFICE',
      'ATTACHED_TO_INVOICE',
      'LOST'
    ],

    DISCREPANCY_TYPE: [
      'DETENTION_DISPUTE',
      'DAMAGE',
      'EMPTY_REFUSED',
      'SHORTAGE',
      'ACCIDENT',
      'ROUTE_CHANGE',
      'OTHER'
    ],

    RESOLUTION_STATUS: ['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'WRITTEN_OFF'],

    ANNEXURE_STATUS: ['INCOMPLETE', 'COMPLETE'],

    COLLECTION_STATUS: ['PENDING', 'PART_PAID', 'PAID', 'OVERDUE', 'DISPUTED'],

    INTIMATION_STATUS: ['OPEN', 'MATCHED', 'EXPIRED', 'CANCELLED'],

    // SUPPLIER_PAYABLE_DEDUCTIONS.deduction_type - Amendment A12 (Checkpoint
    // #2): one bill routinely carries several deductions (TDS + detention
    // chargeback + damage), so deductions are a child register, one row each.
    DEDUCTION_TYPE: ['SHORTAGE', 'DETENTION_CHARGEBACK', 'TDS', 'DAMAGE', 'OTHER'],

    // Amendment A2 - filled from CONFIG.TRAFFIC_MANAGERS, which the owner supplies.
    // Stays empty (and the dropdown is skipped) until he does.
    SOURCED_BY_TM: CONFIG.TRAFFIC_MANAGERS
  },

  /* ===================== WB-FLEET ======================================= */

  WB_FLEET: {
    GATE_DIRECTION: ['IN', 'OUT'],

    WORKSHOP_TYPE: ['OWN', 'OUTSIDE'],

    // D18 - the owner one-taps every job. Every verbal "haan, kar do" becomes a row.
    OWNER_APPROVAL: ['PENDING', 'APPROVED', 'REJECTED'],

    // Cannot reach CLOSED while a child scrap token is unreturned (gate-lock, §6.2)
    JOB_STATUS: ['OPEN', 'AWAITING_PARTS', 'AWAITING_SCRAP_RETURN', 'CLOSED'],

    SCRAP_STATUS: ['ISSUED', 'RETURNED_TO_YARD', 'SOLD', 'WRITTEN_OFF'],

    VEHICLE_DOC_TYPE: ['PERMIT', 'ROAD_TAX', 'FITNESS', 'PUC', 'INSURANCE', 'NATIONAL_PERMIT'],

    VEHICLE_DOC_STATUS: ['VALID', 'EXPIRING', 'EXPIRED'],

    SALARY_ENTRY_TYPE: ['BASE', 'TRIP_BHATTA', 'ADVANCE_DEDUCTION', 'BONUS', 'PENALTY', 'PAYOUT'],

    RECOVERY_ENTRY_TYPE: [
      'UNAUTHORIZED_EXPENSE',
      'DAMAGE',
      'PENALTY',
      'ADVANCE_RECOVERY',
      'CREDIT_ADJUSTMENT'
    ],

    SETTLEMENT_STATUS: ['OPEN', 'SETTLED', 'WAIVED'],

    // Locked: driver acknowledgment on EVERY recovery entry (SCHEMA changelog #5)
    ACK_METHOD: ['THUMB', 'OTP'],

    SCRAP_CATEGORY: ['PARTS', 'TYRES', 'TRUCK_BODY'],

    DIRECTION_IE: ['IMP', 'EXP'],

    RATE_CARD_CONTAINER_TYPE: ['20', '40', 'ISO'],

    SALARY_ECOUNT_PUSH: ['CASH_PAYMENT', 'JOURNAL_VOUCHER']
  }
};
