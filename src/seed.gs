/**
 * seed.gs — the only data Phase 1 puts into the workbooks.
 *
 * Two tables are seeded: EXPENSE_CATEGORIES (the MCQ list every expense is
 * tagged from) and ID_COUNTERS (the counters every ID is minted from).
 *
 * Nothing else is seeded. Clients, vehicles, drivers, suppliers, the union rate
 * card and the USERS_ROLES roster are real-world master data being cleaned up
 * by hand in parallel - inventing placeholder rows for them would put fiction
 * into a register whose whole purpose is being trustworthy.
 */

/**
 * EXPENSE_CATEGORIES seed — SCHEMA.md §3.2, bucket mapping per D16.
 *
 * Column order must match FABRIC_SCHEMA.WB_GOV EXPENSE_CATEGORIES exactly:
 * cat_code · label_en · visibility_tier · receipt_required · ecount_template ·
 * default_bucket
 *
 * On the blank default_bucket values: D16's three buckets classify money that
 * moves through a DRIVER - his rate-card lump sum (A), what the client pays
 * back (B), and the extraordinary spend that needs pre-intimation (C). Diesel
 * and toll on own trucks are direct company costs and fit none of the three.
 * They are left blank rather than forced into a bucket, because a wrong bucket
 * on DIESEL would silently switch on receipt-chasing that D16 explicitly says
 * bucket A must never have. FLAGGED for an owner ruling at Checkpoint #2.
 */
var EXPENSE_CATEGORIES_SEED = [
  // cat_code,             label_en,                     visibility_tier, receipt_required, ecount_template, default_bucket
  ['DIESEL',               'Diesel',                     'ALL',           true,             'DIESEL_ENTRY',  ''],
  ['TOLL',                 'Toll',                       'ALL',           true,             'TOLL_TAX',      ''],
  ['PARKING_PLAZA',        'Parking Plaza',              'ALL',           true,             'CASH_PAYMENT',  'B_CLIENT_RECOVERABLE'],
  ['EMPTY_YARD_UNLOAD',    'Empty Yard Unloading',       'ALL',           true,             'CASH_PAYMENT',  'B_CLIENT_RECOVERABLE'],
  ['ENROUTE_REPAIR',       'En-route Repair',            'ALL',           true,             'CASH_PAYMENT',  'C_EXTRAORDINARY'],
  ['HAMALI',               'Hamali (Loading Labour)',    'ALL',           true,             'CASH_PAYMENT',  'B_CLIENT_RECOVERABLE'],
  ['DETENTION_PAID',       'Detention Paid',             'ALL',           true,             'CASH_PAYMENT',  'C_EXTRAORDINARY'],
  // D9: recorded like every other rupee, but visible to Cashier and Directors only.
  ['BORDER_FACILITATION',  'Border Facilitation',        'DIRECTOR_ONLY', false,            'CASH_PAYMENT',  'C_EXTRAORDINARY'],
  // D16 bucket A: the rate-card lump sum. No receipt, never itemized, never audited.
  ['DRIVER_ADVANCE',       'Driver Advance (Trip Cash)', 'ALL',           false,            'CASH_PAYMENT',  'A_TRIP_CASH'],
  ['OTHER',                'Other',                      'ALL',           true,             'CASH_PAYMENT',  '']
];

/**
 * ID_COUNTERS seed — SCHEMA.md §2 and §3.5.
 *
 * The challan counter is NOT here: it continues the live eCount numeric series
 * (D6), so its starting value is a fact only the owner has on the morning of
 * bootstrap. It is read from the CHALLAN_SEED script property.
 *
 * Counters whose ID format embeds the year (RSJ-DO-YY, JC-YY, EXP-YY, SCR-YY,
 * INT-YY) are named with their year scope, so a new year mints a fresh counter
 * row instead of silently continuing last year's sequence.
 *
 * DOC_POUCH ids (DOC-<challan>-NN) have no global counter by design - they are
 * numbered within their own challan.
 */
function idCounterSeeds_() {
  var yy = currentYY_();
  return [
    ['rsj_do_no_' + yy,        0],   // RSJ-DO-YY-NNNN
    ['strike_no',              0],   // STK-YYYYMMDD-NNN (service layer resets per day)
    ['job_card_no_' + yy,      0],   // JC-YY-NNNN
    ['trip_expense_no_' + yy,  0],   // EXP-YY-NNNNN
    ['scrap_token_no_' + yy,   0],   // SCR-YY-NNNN
    ['intimation_no_' + yy,    0]    // INT-YY-NNNNN
  ];
}

/**
 * Reads the owner-supplied challan seed. Refuses to guess.
 */
function readChallanSeed_() {
  var raw = PropertiesService.getScriptProperties()
    .getProperty(CONFIG.CHALLAN_SEED_PROPERTY_KEY);

  if (raw === null || String(raw).trim() === '') {
    throw new Error(
      'CHALLAN_SEED is not set.\n\n' +
      'The challan series continues the live number series already in use ' +
      '(D6) - it does not start at 1. Before running bootstrap(), the owner ' +
      'must supply that morning\'s NEXT challan number, and it must be stored ' +
      'as a script property (never in the repo):\n\n' +
      '  In the Apps Script editor: Project Settings -> Script Properties ->\n' +
      '  Add script property, name CHALLAN_SEED, value e.g. 43486\n\n' +
      'Then run bootstrap() again.'
    );
  }

  var n = Number(String(raw).trim());
  if (!isFinite(n) || n <= 0 || Math.floor(n) !== n) {
    throw new Error('CHALLAN_SEED must be a whole positive number. Found: "' + raw + '"');
  }
  return n;
}

/**
 * Writes both seeds. Safe to re-run: it will not overwrite a counter that
 * already holds a value, because that value may have advanced in real use.
 */
function seedGovernanceTables_(ssGov, report) {
  // ---- EXPENSE_CATEGORIES ------------------------------------------------
  var cats = ssGov.getSheetByName('EXPENSE_CATEGORIES');
  if (cats.getLastRow() < 2) {
    cats.getRange(2, 1, EXPENSE_CATEGORIES_SEED.length, EXPENSE_CATEGORIES_SEED[0].length)
        .setValues(EXPENSE_CATEGORIES_SEED);
    report.push(['SEED', 'EXPENSE_CATEGORIES', 'PASS',
      EXPENSE_CATEGORIES_SEED.length + ' categories written']);
  } else {
    report.push(['SEED', 'EXPENSE_CATEGORIES', 'SKIP',
      'already has ' + (cats.getLastRow() - 1) + ' rows - left untouched']);
  }

  // ---- ID_COUNTERS -------------------------------------------------------
  var counters = ssGov.getSheetByName('ID_COUNTERS');
  var existing = {};
  if (counters.getLastRow() > 1) {
    counters.getRange(2, 1, counters.getLastRow() - 1, 1).getValues()
      .forEach(function (r) { existing[String(r[0]).trim()] = true; });
  }

  var rows = idCounterSeeds_();
  rows.unshift(['challan_no', readChallanSeed_()]);

  var toWrite = rows
    .filter(function (r) { return !existing[r[0]]; })
    .map(function (r) { return [r[0], r[1], new Date()]; });

  if (toWrite.length) {
    counters.getRange(counters.getLastRow() + 1, 1, toWrite.length, 3).setValues(toWrite);
    report.push(['SEED', 'ID_COUNTERS', 'PASS', toWrite.length + ' counters written']);
  } else {
    report.push(['SEED', 'ID_COUNTERS', 'SKIP', 'all counters already present']);
  }
}
