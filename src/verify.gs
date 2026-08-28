/**
 * verify.gs — reads the four workbooks back and prints a PASS/FAIL table.
 *
 * PHASE1_BRIEF item 8 and the Phase 1 definition of done. This is the check
 * that the thing on Google's servers actually matches SCHEMA.md - not what
 * bootstrap() intended to build, but what is really there.
 *
 * Run verify() any time. It writes nothing.
 */

function verify() {
  var report = [];
  var props = PropertiesService.getScriptProperties();

  workbookKeys_().forEach(function (wbKey) {
    var spec = CONFIG.WORKBOOKS[wbKey];
    var id = props.getProperty(spec.propertyKey);

    if (!id) {
      report.push(['WORKBOOK', wbKey, 'FAIL', 'script property ' + spec.propertyKey + ' not set']);
      return;
    }

    var ss;
    try {
      ss = SpreadsheetApp.openById(id);
    } catch (e) {
      report.push(['WORKBOOK', wbKey, 'FAIL', 'cannot open id ' + id + ': ' + e.message]);
      return;
    }

    report.push(['WORKBOOK', wbKey, 'PASS', ss.getName()]);

    verifyListsSheet_(ss, wbKey, report);

    FABRIC_SCHEMA[wbKey].forEach(function (table) {
      verifyRegisterSheet_(ss, wbKey, table, report);
    });
  });

  verifySeeds_(props, report);

  logReport_('VERIFY', report);
  return renderReport_('VERIFY', report);
}


function verifyRegisterSheet_(ss, wbKey, table, report) {
  var where = wbKey + '.' + table.name;
  var sheet = ss.getSheetByName(table.name);

  if (!sheet) {
    report.push(['SHEET', where, 'FAIL', 'sheet missing']);
    return;
  }

  var expected = headersOf_(table);
  var actual = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), expected.length))
                    .getValues()[0]
                    .map(function (v) { return String(v).trim(); });

  // Trim the trailing blanks that getLastColumn padding can introduce.
  while (actual.length && actual[actual.length - 1] === '') actual.pop();

  if (actual.length !== expected.length) {
    report.push(['HEADERS', where, 'FAIL',
      'expected ' + expected.length + ' columns, found ' + actual.length]);
    return;
  }

  var mismatch = null;
  for (var i = 0; i < expected.length; i++) {
    if (actual[i] !== expected[i]) {
      mismatch = 'column ' + (i + 1) + ': expected "' + expected[i] + '", found "' + actual[i] + '"';
      break;
    }
  }

  if (mismatch) {
    report.push(['HEADERS', where, 'FAIL', mismatch]);
  } else {
    report.push(['HEADERS', where, 'PASS', expected.length + ' columns match SCHEMA.md exactly']);
  }

  // Frozen header row - the service layer reads row 1 as headers.
  report.push(['FROZEN', where, sheet.getFrozenRows() === 1 ? 'PASS' : 'FAIL',
    'frozen rows = ' + sheet.getFrozenRows()]);

  // Protection is the control, not a nicety (SCHEMA.md §1).
  var protections = sheet.getProtections(SpreadsheetApp.ProtectionType.SHEET);
  if (!protections.length) {
    report.push(['PROTECT', where, 'FAIL', 'sheet is NOT protected - anyone with access can type here']);
  } else {
    var p = protections[0];
    report.push(['PROTECT', where, p.canDomainEdit() ? 'FAIL' : 'PASS',
      p.canDomainEdit() ? 'domain edit still allowed' : 'owner-only, ' + p.getEditors().length + ' editor(s)']);
  }

  verifyValidations_(sheet, table, where, report);
}


function verifyValidations_(sheet, table, where, report) {
  var enumCols = table.columns.filter(function (c) {
    return c.t && c.t.indexOf('LIST:') === 0;
  });
  if (!enumCols.length) return;

  var missing = [];
  var skipped = [];

  enumCols.forEach(function (col) {
    var idx = table.columns.indexOf(col) + 1;
    var rule = sheet.getRange(2, idx).getDataValidation();
    var listKey = col.t.substring(5);

    if (rule) return;

    // A list that is empty on purpose (CONFIG.TRAFFIC_MANAGERS) is a warning,
    // not a failure - it means a real-world fact is still outstanding.
    var wbKey = null;
    workbookKeys_().forEach(function (k) {
      if (FABRIC_SCHEMA[k].indexOf(table) !== -1) wbKey = k;
    });
    var values = wbKey ? (LISTS[wbKey] || {})[listKey] : null;

    if (!values || !values.length) skipped.push(col.h + ' (' + listKey + ' empty)');
    else missing.push(col.h);
  });

  if (missing.length) {
    report.push(['DROPDOWNS', where, 'FAIL', 'no validation on: ' + missing.join(', ')]);
  } else {
    report.push(['DROPDOWNS', where, 'PASS',
      (enumCols.length - skipped.length) + ' of ' + enumCols.length + ' enum columns have dropdowns']);
  }

  if (skipped.length) {
    report.push(['DROPDOWNS', where, 'WARN', 'awaiting real-world data: ' + skipped.join(', ')]);
  }
}


function verifyListsSheet_(ss, wbKey, report) {
  var sheet = ss.getSheetByName(CONFIG.LISTS_SHEET_NAME);
  if (!sheet) {
    report.push(['LISTS', wbKey, 'FAIL', CONFIG.LISTS_SHEET_NAME + ' sheet missing']);
    return;
  }

  var expectedKeys = Object.keys(LISTS[wbKey] || {});
  var actualKeys = expectedKeys.length
    ? sheet.getRange(1, 1, 1, expectedKeys.length).getValues()[0].map(String)
    : [];

  var same = expectedKeys.length === actualKeys.length &&
             expectedKeys.every(function (k, i) { return k === actualKeys[i]; });

  report.push(['LISTS', wbKey, same ? 'PASS' : 'FAIL',
    same ? expectedKeys.length + ' lists present' : 'list columns do not match lists.gs']);

  report.push(['LISTS', wbKey, sheet.isSheetHidden() ? 'PASS' : 'WARN',
    sheet.isSheetHidden() ? 'hidden from users' : 'sheet is visible - should be hidden']);
}


function verifySeeds_(props, report) {
  var id = props.getProperty(CONFIG.WORKBOOKS.WB_GOV.propertyKey);
  if (!id) return;

  var ss;
  try { ss = SpreadsheetApp.openById(id); } catch (e) { return; }

  // ---- EXPENSE_CATEGORIES ------------------------------------------------
  var cats = ss.getSheetByName('EXPENSE_CATEGORIES');
  if (cats && cats.getLastRow() > 1) {
    var rows = cats.getRange(2, 1, cats.getLastRow() - 1, 6).getValues();
    report.push(['SEED', 'EXPENSE_CATEGORIES', 'PASS', rows.length + ' categories present']);

    var border = rows.filter(function (r) { return r[0] === 'BORDER_FACILITATION'; })[0];
    if (!border) {
      report.push(['SEED', 'EXPENSE_CATEGORIES.BORDER_FACILITATION', 'FAIL', 'category missing']);
    } else {
      report.push(['SEED', 'EXPENSE_CATEGORIES.BORDER_FACILITATION',
        border[2] === 'DIRECTOR_ONLY' ? 'PASS' : 'FAIL',
        'visibility_tier = ' + border[2] + ' (D9 requires DIRECTOR_ONLY)']);
    }

    var noBucket = rows.filter(function (r) { return !String(r[5]).trim(); })
                       .map(function (r) { return r[0]; });
    if (noBucket.length) {
      report.push(['SEED', 'EXPENSE_CATEGORIES.default_bucket', 'WARN',
        'no D16 bucket assigned to: ' + noBucket.join(', ') + ' - needs an owner ruling']);
    }
  } else {
    report.push(['SEED', 'EXPENSE_CATEGORIES', 'FAIL', 'not seeded']);
  }

  // ---- ID_COUNTERS -------------------------------------------------------
  var counters = ss.getSheetByName('ID_COUNTERS');
  if (counters && counters.getLastRow() > 1) {
    var cRows = counters.getRange(2, 1, counters.getLastRow() - 1, 2).getValues();
    report.push(['SEED', 'ID_COUNTERS', 'PASS', cRows.length + ' counters present']);

    var challan = cRows.filter(function (r) { return r[0] === 'challan_no'; })[0];
    if (!challan) {
      report.push(['SEED', 'ID_COUNTERS.challan_no', 'FAIL', 'counter missing']);
    } else {
      report.push(['SEED', 'ID_COUNTERS.challan_no', Number(challan[1]) > 0 ? 'PASS' : 'FAIL',
        'seeded at ' + challan[1] + ' (must continue the live series, D6)']);
    }
  } else {
    report.push(['SEED', 'ID_COUNTERS', 'FAIL', 'not seeded']);
  }

  // ---- Outstanding real-world facts -------------------------------------
  if (!CONFIG.TRAFFIC_MANAGERS.length) {
    report.push(['CONFIG', 'TRAFFIC_MANAGERS', 'WARN',
      'empty - owner must supply the TM names for STRIKE_LEDGER.sourced_by_tm (A2)']);
  }

  var usersSheet = ss.getSheetByName('USERS_ROLES');
  if (usersSheet && usersSheet.getLastRow() < 2) {
    report.push(['CONFIG', 'USERS_ROLES', 'WARN',
      'empty - the 16-account roster from Amendment A9 is loaded in Phase 2 with the auth layer']);
  }
}
