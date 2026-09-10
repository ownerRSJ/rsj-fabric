/**
 * config.gs — the single place where company-wide policy numbers live.
 *
 * PHASE1_BRIEF item 6. If a policy number ever changes, it changes HERE and
 * nowhere else. Every constant below cites the decision that locked it, so a
 * future session cannot "helpfully" tune a number that was negotiated.
 */

var CONFIG = {

  /* ---- Environment ------------------------------------------------------ */

  TIMEZONE: 'Asia/Kolkata',

  /* ---- The four workbooks (SCHEMA.md §1) -------------------------------- */

  WORKBOOKS: {
    WB_GOV:     { title: 'RSJ FABRIC - WB-GOV (Governance)',  propertyKey: 'WB_GOV_ID' },
    WB_MASTERS: { title: 'RSJ FABRIC - WB-MASTERS (Registries)', propertyKey: 'WB_MASTERS_ID' },
    WB_OPS:     { title: 'RSJ FABRIC - WB-OPS (Operations)',  propertyKey: 'WB_OPS_ID' },
    WB_FLEET:   { title: 'RSJ FABRIC - WB-FLEET (Maintenance)', propertyKey: 'WB_FLEET_ID' }
  },

  /* ---- Supplier payment terms (D20c, locked by Amendment A4) ------------ */

  // Supplier balance falls due N days after the POD / LR return reaches office.
  // Company default N = 30. SUPPLIERS_MASTER.payment_terms_days overrides
  // per supplier where a different term was actually agreed.
  SUPPLIER_TERMS_DEFAULT_DAYS: 30,

  /* ---- Pre-intimation anti-fake-bill thresholds (D14 / D20a) ------------ */

  // A bucket-C (EXTRAORDINARY) expense above this rupee amount is reimbursable
  // only if it was intimated at or before the moment of spend.
  INTIMATION_THRESHOLD_INR: 500,

  // A later bill matches an open intimation if it is within EITHER 10% of the
  // intimated estimate OR Rs 200 of it - whichever of the two is the LARGER
  // allowance. Below that it auto-flags as POST_FACTO_FLAGGED.
  INTIMATION_TOLERANCE_PCT: 10,
  INTIMATION_TOLERANCE_MIN_INR: 200,

  // An open intimation expires this many hours after the trip closes.
  INTIMATION_EXPIRY_HOURS: 48,

  /* ---- Traffic Manager roster (Amendment A2) ---------------------------- */

  // Traffic Managers hold NO logins. Their sourcing attribution survives via
  // STRIKE_LEDGER.sourced_by_tm, which is an MCQ fed from this static list.
  // OWNER MUST SUPPLY THESE NAMES before the Strike Ledger is used in anger.
  // Left empty deliberately: bootstrap will not invent people's names.
  TRAFFIC_MANAGERS: [],

  /* ---- Challan seeding, per series (A14 / A15) -------------------------- */

  // A14 retired the single CHALLAN_SEED. Challan numbers are born per series:
  //
  //   JNPT   - the printed paper book mints them. NO counter exists; the
  //            fabric indexes the book in CHALLAN_BOOK_REGISTRY instead.
  //   HAZIRA - no paper book, so the fabric genuinely mints: H<number>,
  //            continuing the existing series (currently in the 9000s).
  //
  // A15: both are set on GO-LIVE MORNING, never earlier - at ~100 challans
  // consumed every 2-3 days, a number captured last week is wrong by lunch.
  // Read from Script Properties so it is never committed to the repo.
  HAZIRA_CHALLAN_SEED_PROPERTY_KEY: 'HAZIRA_CHALLAN_SEED',

  // The prefix that keeps series from colliding. Rule (A14): no prefix = JNPT
  // legacy series; a letter prefix = that location's own series.
  CHALLAN_SERIES_PREFIX: { JNPT: '', HAZIRA: 'H' },

  /* ---- Cosmetic --------------------------------------------------------- */

  HEADER_BACKGROUND: '#274156',
  HEADER_FONT_COLOR: '#ffffff',
  APPEND_ONLY_TAB_COLOR: '#b02a2a',
  REGISTER_TAB_COLOR: '#274156',
  LISTS_SHEET_NAME: '_LISTS',
  README_SHEET_NAME: '_README',

  /* ---- The warning that sits on every register -------------------------- */

  HANDS_OFF_NOTE: [
    'DO NOT TYPE IN THIS SHEET.',
    '',
    'Every row here is written by the RSJ Fabric app, which records who wrote it',
    'and when, and chains it into the audit log. A row typed by hand has no author',
    'and no hash - it is the exact thing this system exists to make impossible.',
    '',
    'If something here is wrong, it is corrected by adding a new row through the',
    'app that points at the wrong one. Nothing is ever edited or deleted.'
  ].join('\n')
};

/**
 * Convenience: the current two-digit year used by YY-scoped ID counters.
 */
function currentYY_() {
  return Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'yy');
}
