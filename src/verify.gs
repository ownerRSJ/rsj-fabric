/**
 * verify.gs — reads the four workbooks back and prints a PASS/FAIL table.
 *
 * PHASE1_BRIEF item 8 and the Phase 1 definition of done. This is the check
 * that the thing on Google's servers actually matches SCHEMA.md - not what
 * bootstrap() intended to build, but what is really there.
 *
 * Run verify() any time. It writes nothing.
 */

/**
 * The one to run. Prints a short report that fits in the execution log.
 */
function verify() {
  var rows = runVerifyChecks_();
  logReport_('VERIFY', rows);
  return renderSummary_('VERIFY', rows);
}

/**
 * The complete row-by-row table, written into a _VERIFY_REPORT sheet in WB-GOV
 * because it is far too long for the execution log. Run this when you want to
 * see or send every single check.
 */
function verifyFull() {
  var rows = runVerifyChecks_();
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty(CONFIG.WORKBOOKS.WB_GOV.propertyKey);

  if (!id) {
    Logger.log('WB-GOV does not exist yet - run bootstrap() first.');
    return;
  }

  var ss = SpreadsheetApp.openById(id);
  var sheet = ss.getSheetByName('_VERIFY_REPORT');
  if (!sheet) sheet = ss.insertSheet('_VERIFY_REPORT');
  sheet.clear();

  var stamp = Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'dd-MMM-yyyy HH:mm');
  var grid = [['VERIFY REPORT - ' + stamp, '', '', ''],
              [verdictLine_(rows), '', '', ''],
              ['', '', '', ''],
              ['WHAT', 'WHERE', 'RESULT', 'DETAIL']]
              .concat(rows.map(function (r) {
                return [r[0], r[1], r[2], String(r[3] === undefined ? '' : r[3])];
              }));

  sheet.getRange(1, 1, grid.length, 4).setValues(grid);
  sheet.getRange(1, 1).setFontSize(13).setFontWeight('bold');
  sheet.getRange(2, 1).setFontWeight('bold');
  sheet.getRange(4, 1, 1, 4).setFontWeight('bold');
  sheet.setFrozenRows(4);
  sheet.autoResizeColumns(1, 3);
  sheet.setColumnWidth(4, 620);
  sheet.setTabColor('#7a7a7a');

  var url = ss.getUrl() + '#gid=' + sheet.getSheetId();
  Logger.log(verdictLine_(rows) + '\n\nFull table written to the _VERIFY_REPORT sheet:\n' + url);
  return url;
}

function runVerifyChecks_() {
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

  return report;
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

  verifyValidations_(sheet, wbKey, table, where, report);
}


function verifyValidations_(sheet, wbKey, table, where, report) {
  var enumCols = table.columns.filter(function (c) {
    return c.t && c.t.indexOf('LIST:') === 0;
  });
  if (!enumCols.length) return;

  // One read for the whole header-adjacent row rather than one per column.
  // Reading cell by cell is what made verify() take nine minutes.
  var rules = sheet.getRange(2, 1, 1, table.columns.length).getDataValidations()[0];

  var missing = [];
  var skipped = [];

  enumCols.forEach(function (col) {
    if (rules[table.columns.indexOf(col)]) return;

    // A list that is empty on purpose (CONFIG.TRAFFIC_MANAGERS) is a warning,
    // not a failure - it means a real-world fact is still outstanding.
    var listKey = col.t.substring(5);
    var values = (LISTS[wbKey] || {})[listKey];

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
  var catsLast = cats ? lastDataRow_(cats, 1) : 1;
  if (catsLast > 1) {
    var rows = cats.getRange(2, 1, catsLast - 1, 6).getValues()
      .filter(function (r) { return String(r[0]).trim() !== ''; });
    report.push(['SEED', 'EXPENSE_CATEGORIES', 'PASS', rows.length + ' categories present']);

    var border = rows.filter(function (r) { return r[0] === 'BORDER_FACILITATION'; })[0];
    if (!border) {
      report.push(['SEED', 'EXPENSE_CATEGORIES.BORDER_FACILITATION', 'FAIL', 'category missing']);
    } else {
      report.push(['SEED', 'EXPENSE_CATEGORIES.BORDER_FACILITATION',
        border[2] === 'DIRECTOR_ONLY' ? 'PASS' : 'FAIL',
        'visibility_tier = ' + border[2] + ' (D9 requires DIRECTOR_ONLY)']);
    }

    // OTHER is exempt: it has no honest default, so its bucket is picked at
    // entry time (A11 ruling). Anything else blank is a real gap.
    var noBucket = rows.filter(function (r) {
                     return !String(r[5]).trim() && String(r[0]).trim() !== 'OTHER';
                   })
                   .map(function (r) { return r[0]; });
    if (noBucket.length) {
      report.push(['SEED', 'EXPENSE_CATEGORIES.default_bucket', 'WARN',
        'no bucket assigned to: ' + noBucket.join(', ') + ' - needs an owner ruling']);
    }
  } else {
    report.push(['SEED', 'EXPENSE_CATEGORIES', 'FAIL', 'not seeded']);
  }

  // ---- ID_COUNTERS -------------------------------------------------------
  var counters = ss.getSheetByName('ID_COUNTERS');
  var countersLast = counters ? lastDataRow_(counters, 1) : 1;
  if (countersLast > 1) {
    var cRows = counters.getRange(2, 1, countersLast - 1, 2).getValues()
      .filter(function (r) { return String(r[0]).trim() !== ''; });
    report.push(['SEED', 'ID_COUNTERS', 'PASS', cRows.length + ' counters present']);

    // A14/A15: JNPT has no counter by design, and the Hazira counter is not
    // expected until go-live morning. Neither absence is a build failure -
    // both are pre-go-live warnings.
    var hazira = cRows.filter(function (r) { return r[0] === 'hazira_challan'; })[0];
    if (!hazira) {
      report.push(['GO-LIVE', 'ID_COUNTERS.hazira_challan', 'WARN', haziraSeedInstruction_()]);
    } else {
      report.push(['GO-LIVE', 'ID_COUNTERS.hazira_challan', Number(hazira[1]) > 0 ? 'PASS' : 'WARN',
        'seeded at H' + hazira[1] + ' (continues the live Hazira series, A14)']);
    }

    if (cRows.filter(function (r) { return r[0] === 'challan_no'; }).length) {
      report.push(['SEED', 'ID_COUNTERS.challan_no', 'WARN',
        'a legacy single challan_no counter exists - A14 retired it. JNPT mints ' +
        'from the printed book, not a counter. Remove this row before go-live.']);
    }
  } else {
    report.push(['SEED', 'ID_COUNTERS', 'FAIL', 'not seeded']);
  }

  // ---- Outstanding real-world facts -------------------------------------
  var activeOrigins = activeSourcingOrigins_();
  if (!activeOrigins.length) {
    report.push(['CONFIG', 'TRAFFIC_MANAGERS', 'WARN',
      'no active sourcing origins - STRIKE_LEDGER.sourced_by_tm has nothing to offer (A2/A23)']);
  } else {
    report.push(['CONFIG', 'TRAFFIC_MANAGERS', 'PASS',
      activeOrigins.length + ' active sourcing origins (' + activeOrigins.join(', ') + ') · ' +
      (allSourcingOrigins_().length - activeOrigins.length) + ' retired but still valid on historical rows']);
  }

  // ---- JNPT challan book (A14/A15) --------------------------------------
  var opsId = props.getProperty(CONFIG.WORKBOOKS.WB_OPS.propertyKey);
  if (opsId) {
    try {
      var ssOps = SpreadsheetApp.openById(opsId);
      var books = ssOps.getSheetByName('CHALLAN_BOOK_REGISTRY_BOOKS');
      if (books) {
        var bookLast = lastDataRow_(books, 1);
        if (bookLast < 2) {
          report.push(['GO-LIVE', 'CHALLAN_BOOK_REGISTRY_BOOKS', 'WARN', jnptBookInstruction_()]);
        } else {
          var bookRows = books.getRange(2, 1, bookLast - 1, 7).getValues()
            .filter(function (r) { return String(r[0]).trim() !== ''; });
          var active = bookRows.filter(function (r) {
            return String(r[1]).trim() === 'JNPT' && String(r[6]).trim() === 'ACTIVE';
          });
          // A14 rule: exactly one ACTIVE book per series. Two would make "the
          // next blank leaf" ambiguous, which is the drift this register exists
          // to prevent.
          report.push(['GO-LIVE', 'CHALLAN_BOOK_REGISTRY_BOOKS',
            active.length === 1 ? 'PASS' : 'FAIL',
            active.length === 1
              ? 'one ACTIVE JNPT book, leaves ' + active[0][2] + '-' + active[0][3]
              : active.length + ' ACTIVE JNPT books found - A14 requires exactly one']);
        }
      }
    } catch (e) { /* WB-OPS already reported unopenable above */ }
  }

  var usersSheet = ss.getSheetByName('USERS_ROLES');
  if (usersSheet && lastDataRow_(usersSheet, 1) < 2) {
    report.push(['CONFIG', 'USERS_ROLES', 'WARN',
      'empty - the 16-account roster from Amendment A9 is loaded in Phase 2 with the auth layer']);
  }
}
