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
 * Buckets: D16's three driver buckets plus D_DIRECT_COMPANY (Amendment A11,
 * ruled at Checkpoint #2) for costs that move through no driver - diesel and
 * toll on own trucks. OTHER keeps a blank default ON PURPOSE: it has no honest
 * default, so the bucket is picked at entry time.
 */
var EXPENSE_CATEGORIES_SEED = [
  // cat_code,             label_en,                     visibility_tier, receipt_required, ecount_template, default_bucket
  ['DIESEL',               'Diesel',                     'ALL',           true,             'DIESEL_ENTRY',  'D_DIRECT_COMPANY'],
  ['TOLL',                 'Toll',                       'ALL',           true,             'TOLL_TAX',      'D_DIRECT_COMPANY'],
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
    ['intimation_no_' + yy,    0],   // INT-YY-NNNNN
    ['deduction_no_' + yy,     0]    // DED-YY-NNNNN (Amendment A12)
  ];
}

/**
 * Reads the owner-supplied challan seed. Refuses to guess.
 *
 * Returns null when the owner has not supplied it yet - that is a normal state
 * on the day the skeleton is built, not an error. It becomes an error at
 * verify() time, which FAILS until the counter holds a real number.
 */
function readChallanSeed_() {
  var raw = PropertiesService.getScriptProperties()
    .getProperty(CONFIG.CHALLAN_SEED_PROPERTY_KEY);

  if (raw === null || String(raw).trim() === '') return null;

  var n = Number(String(raw).trim());
  if (!isFinite(n) || n <= 0 || Math.floor(n) !== n) {
    throw new Error(
      'CHALLAN_SEED must be a whole positive number. Found: "' + raw + '".\n\n' +
      'It is the NEXT challan number in the series already in live use (D6) - ' +
      'e.g. 43486. It does not start at 1.'
    );
  }
  return n;
}

/** The instruction the owner needs when the seed is still missing. */
function challanSeedInstruction_() {
  return 'challan_no NOT seeded - the series continues the live numbering (D6), ' +
         'so only the owner has this number. Apps Script editor -> Project Settings ' +
         '-> Script Properties -> add CHALLAN_SEED = that morning\'s next challan ' +
         'number (e.g. 43486), then run bootstrap() again.';
}

/**
 * Fills a BLANK default_bucket from the seed table - and only a blank one.
 * A bucket someone deliberately set later is never overwritten. This is how
 * Amendment A11's ruling (DIESEL/TOLL -> D_DIRECT_COMPANY) reaches a sheet
 * that was seeded before the ruling existed.
 */
function fillBlankBuckets_(cats, catsLast, report) {
  if (catsLast < 2) return;

  var seedBuckets = {};
  EXPENSE_CATEGORIES_SEED.forEach(function (r) { seedBuckets[r[0]] = r[5]; });

  var rows = cats.getRange(2, 1, catsLast - 1, 6).getValues();
  var filled = [];

  rows.forEach(function (r, i) {
    var code = String(r[0]).trim();
    var current = String(r[5]).trim();
    var wanted = seedBuckets[code];
    if (code && current === '' && wanted) {
      cats.getRange(i + 2, 6).setValue(wanted);
      filled.push(code + ' -> ' + wanted);
    }
  });

  if (filled.length) {
    report.push(['SEED', 'EXPENSE_CATEGORIES.default_bucket', 'PASS',
      'filled per A11: ' + filled.join(', ')]);
  }
}

/**
 * Writes both seeds. Safe to re-run: it will not overwrite a counter that
 * already holds a value, because that value may have advanced in real use.
 */
/**
 * The last row holding a real value in `col` - ignoring blank rows that merely
 * carry formatting or a stray checkbox. Returns 1 (header only) when empty.
 *
 * getLastRow() counts anything, including the FALSE that insertCheckboxes()
 * used to scatter down the sheet. Trusting it is what made the seeder skip
 * EXPENSE_CATEGORIES and report 999 phantom categories.
 */
function lastDataRow_(sheet, col) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return 1;

  var values = sheet.getRange(2, col, lastRow - 1, 1).getValues();
  for (var i = values.length - 1; i >= 0; i--) {
    if (String(values[i][0]).trim() !== '') return i + 2;
  }
  return 1;
}

function seedGovernanceTables_(ssGov, report) {
  // ---- EXPENSE_CATEGORIES ------------------------------------------------
  var cats = ssGov.getSheetByName('EXPENSE_CATEGORIES');
  var catsLast = lastDataRow_(cats, 1);

  if (catsLast < 2) {
    cats.getRange(2, 1, EXPENSE_CATEGORIES_SEED.length, EXPENSE_CATEGORIES_SEED[0].length)
        .setValues(EXPENSE_CATEGORIES_SEED);
    report.push(['SEED', 'EXPENSE_CATEGORIES', 'PASS',
      EXPENSE_CATEGORIES_SEED.length + ' categories written']);
  } else {
    report.push(['SEED', 'EXPENSE_CATEGORIES', 'SKIP',
      'already has ' + (catsLast - 1) + ' categories - left untouched']);
    fillBlankBuckets_(cats, catsLast, report);
  }

  // ---- ID_COUNTERS -------------------------------------------------------
  var counters = ssGov.getSheetByName('ID_COUNTERS');
  var countersLast = lastDataRow_(counters, 1);
  var existing = {};
  if (countersLast > 1) {
    counters.getRange(2, 1, countersLast - 1, 1).getValues()
      .forEach(function (r) { existing[String(r[0]).trim()] = true; });
  }

  var rows = idCounterSeeds_();

  var challanSeed = readChallanSeed_();
  if (challanSeed !== null) {
    rows.unshift(['challan_no', challanSeed]);
  } else if (!existing['challan_no']) {
    report.push(['SEED', 'ID_COUNTERS.challan_no', 'WARN', challanSeedInstruction_()]);
  }

  var toWrite = rows
    .filter(function (r) { return !existing[r[0]]; })
    .map(function (r) { return [r[0], r[1], new Date()]; });

  if (toWrite.length) {
    counters.getRange(countersLast + 1, 1, toWrite.length, 3).setValues(toWrite);
    report.push(['SEED', 'ID_COUNTERS', 'PASS', toWrite.length + ' counters written']);
  } else {
    report.push(['SEED', 'ID_COUNTERS', 'SKIP', 'all counters already present']);
  }
}
