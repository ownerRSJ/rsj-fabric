/**
 * bootstrap.gs — creates the four workbooks and every register sheet.
 *
 * RUN THIS ONCE, from the Apps Script editor, as the account that should own
 * the files (rahul@rsjcarriers.com or owner@rsjcarriers.com - NOT admin@,
 * which is a TOOL account per Amendment A8).
 *
 * It is safe to run again. It never deletes a sheet, never rewrites a header
 * row that already has content, and never overwrites a counter that already
 * holds a value. Re-running fills in whatever is missing and reports the rest.
 *
 * Phase 1 scope only: structure, dropdowns, seeds, protection. No business
 * logic and no screens - those are Phase 2 and Phase 3, and each needs its
 * gate conversation first.
 */

function bootstrap() {
  var report = [];
  var props = PropertiesService.getScriptProperties();

  // NOTE: the challan seed is deliberately NOT required here. Building the
  // filing cabinet and knowing that morning's next challan number are two
  // different days' work (ROADMAP.md). The counter is seeded only if the owner
  // has supplied the number; if he has not, seeding reports it loudly and
  // verify() FAILS until it is set. Nothing invents a starting number.

  workbookKeys_().forEach(function (wbKey) {
    var ss = getOrCreateWorkbook_(wbKey, props, report);

    buildListsSheet_(ss, wbKey, report);

    FABRIC_SCHEMA[wbKey].forEach(function (table) {
      buildRegisterSheet_(ss, wbKey, table, report);
    });

    buildReadmeSheet_(ss, wbKey, report);
    removeDefaultSheet_(ss, report);
    orderSheets_(ss, wbKey);
  });

  // Seeds live in WB-GOV.
  var ssGov = SpreadsheetApp.openById(props.getProperty(CONFIG.WORKBOOKS.WB_GOV.propertyKey));
  seedGovernanceTables_(ssGov, report);

  logReport_('BOOTSTRAP', report);
  return renderReport_('BOOTSTRAP', report);
}


/* ========================================================================
 * Workbooks
 * ====================================================================== */

function getOrCreateWorkbook_(wbKey, props, report) {
  var spec = CONFIG.WORKBOOKS[wbKey];
  var id = props.getProperty(spec.propertyKey);

  if (id) {
    try {
      var existing = SpreadsheetApp.openById(id);
      report.push(['WORKBOOK', wbKey, 'REUSE', existing.getName() + ' (' + id + ')']);
      return existing;
    } catch (e) {
      throw new Error(
        'Script property ' + spec.propertyKey + ' points at spreadsheet id "' + id +
        '" which cannot be opened (' + e.message + ').\n\n' +
        'This is deliberately fatal. Creating a second copy of a register ' +
        'workbook would split the audit trail across two files. Either restore ' +
        'access to that file, or clear the property on purpose and re-run.'
      );
    }
  }

  var ss = SpreadsheetApp.create(spec.title);
  ss.setSpreadsheetTimeZone(CONFIG.TIMEZONE);
  props.setProperty(spec.propertyKey, ss.getId());
  report.push(['WORKBOOK', wbKey, 'CREATED', spec.title + ' (' + ss.getId() + ')']);
  return ss;
}

/** Google always creates a spreadsheet with a default sheet; drop it once ours exist. */
function removeDefaultSheet_(ss, report) {
  var s = ss.getSheetByName('Sheet1') || ss.getSheetByName('Sheet 1');
  if (s && ss.getSheets().length > 1) {
    ss.deleteSheet(s);
    report.push(['CLEANUP', ss.getName(), 'PASS', 'default Sheet1 removed']);
  }
}

/** README first, registers in schema order, _LISTS last. */
function orderSheets_(ss, wbKey) {
  var order = [CONFIG.README_SHEET_NAME]
    .concat(FABRIC_SCHEMA[wbKey].map(function (t) { return t.name; }))
    .concat([CONFIG.LISTS_SHEET_NAME]);

  order.forEach(function (name, i) {
    var sheet = ss.getSheetByName(name);
    if (sheet) {
      ss.setActiveSheet(sheet);
      ss.moveActiveSheet(i + 1);
    }
  });
}


/* ========================================================================
 * The hidden per-workbook list sheet that feeds every dropdown
 * ====================================================================== */

function buildListsSheet_(ss, wbKey, report) {
  var lists = LISTS[wbKey] || {};
  var keys = Object.keys(lists);

  var sheet = ss.getSheetByName(CONFIG.LISTS_SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(CONFIG.LISTS_SHEET_NAME);

  sheet.clear();

  var tallest = keys.reduce(function (m, k) { return Math.max(m, lists[k].length); }, 0);
  var grid = [];
  grid.push(keys.slice());
  for (var r = 0; r < tallest; r++) {
    grid.push(keys.map(function (k) { return lists[k][r] !== undefined ? lists[k][r] : ''; }));
  }

  if (keys.length) {
    sheet.getRange(1, 1, grid.length, keys.length).setValues(grid);
    sheet.getRange(1, 1, 1, keys.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }

  sheet.hideSheet();
  report.push(['LISTS', wbKey, 'PASS', keys.length + ' lists written to ' + CONFIG.LISTS_SHEET_NAME]);
}

/**
 * The range in _LISTS holding one named list, or null when the list is empty
 * (CONFIG.TRAFFIC_MANAGERS starts empty on purpose - bootstrap will not invent
 * people's names).
 */
function listRange_(ss, wbKey, listKey) {
  var values = (LISTS[wbKey] || {})[listKey];
  if (!values || !values.length) return null;

  var sheet = ss.getSheetByName(CONFIG.LISTS_SHEET_NAME);
  var keys = Object.keys(LISTS[wbKey]);
  var col = keys.indexOf(listKey) + 1;
  if (col < 1) return null;

  return sheet.getRange(2, col, values.length, 1);
}


/* ========================================================================
 * Register sheets
 * ====================================================================== */

function buildRegisterSheet_(ss, wbKey, table, report) {
  var sheet = ss.getSheetByName(table.name);
  var created = false;

  if (!sheet) {
    sheet = ss.insertSheet(table.name);
    created = true;
  }

  var headers = headersOf_(table);

  // Never overwrite a header row that already has content - if it is wrong,
  // verify() must say so out loud rather than bootstrap silently "fixing" it
  // and shifting real columns underneath real data.
  var firstCell = sheet.getRange(1, 1).getValue();
  if (firstCell === '' || firstCell === null) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    report.push(['SHEET', wbKey + '.' + table.name, created ? 'CREATED' : 'HEADERS',
      headers.length + ' columns']);
  } else {
    report.push(['SHEET', wbKey + '.' + table.name, 'REUSE',
      'header row already populated - left as is, see verify()']);
  }

  styleHeader_(sheet, headers.length);
  applyColumnFormats_(sheet, table);
  applyValidations_(ss, wbKey, sheet, table, report);
  applyHandsOffNote_(sheet, table);
  protectSheet_(sheet, table);
}

function styleHeader_(sheet, width) {
  var header = sheet.getRange(1, 1, 1, width);
  header.setFontWeight('bold')
        .setBackground(CONFIG.HEADER_BACKGROUND)
        .setFontColor(CONFIG.HEADER_FONT_COLOR)
        .setVerticalAlignment('middle');
  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, width);
}

function applyColumnFormats_(sheet, table) {
  var lastRow = sheet.getMaxRows();
  if (lastRow < 2) return;

  var formats = {
    DATE:  'dd-mmm-yyyy',
    TS:    'dd-mmm-yyyy hh:mm',
    MONEY: '"₹"#,##0.00',
    INT:   '0'
  };

  table.columns.forEach(function (col, i) {
    var fmt = formats[col.t];
    if (fmt) sheet.getRange(2, i + 1, lastRow - 1, 1).setNumberFormat(fmt);
  });
}

function applyValidations_(ss, wbKey, sheet, table, report) {
  var lastRow = sheet.getMaxRows();
  if (lastRow < 2) return;

  table.columns.forEach(function (col, i) {
    if (!col.t) return;
    var range = sheet.getRange(2, i + 1, lastRow - 1, 1);

    if (col.t === 'CHECK') {
      range.insertCheckboxes();
      return;
    }

    if (col.t.indexOf('LIST:') !== 0) return;

    var listKey = col.t.substring(5);
    var source = listRange_(ss, wbKey, listKey);

    if (!source) {
      report.push(['VALIDATION', wbKey + '.' + table.name + '.' + col.h, 'WARN',
        'list ' + listKey + ' is empty - dropdown skipped']);
      return;
    }

    range.setDataValidation(
      SpreadsheetApp.newDataValidation()
        .requireValueInRange(source, true)
        .setAllowInvalid(false)
        .setHelpText('Pick one of the allowed values for ' + col.h + '.')
        .build()
    );
  });
}

/**
 * PHASE1_BRIEF item 4 asks for "a note row explaining writes go through the
 * app, not by hand."
 *
 * DEVIATION: it is attached as a cell note on A1 plus the protection
 * description, and repeated in full on the visible _README sheet - NOT as an
 * extra data row. A banner row above the headers would push every register's
 * header off row 1, which the Phase 2 service layer reads. The warning is just
 * as visible and costs no structure.
 */
function applyHandsOffNote_(sheet, table) {
  var text = CONFIG.HANDS_OFF_NOTE +
    '\n\n' + table.name + ' - ' + table.ref +
    (table.appendOnly ? '\n\nAPPEND-ONLY: rows here are never updated or deleted.' : '') +
    (table.note ? '\n\n' + table.note : '');

  sheet.getRange(1, 1).setNote(text);
  sheet.setTabColor(table.appendOnly ? CONFIG.APPEND_ONLY_TAB_COLOR : CONFIG.REGISTER_TAB_COLOR);
}

/**
 * Owner-only protection. This is not decoration: "no user has direct edit
 * access to any register sheet" is what makes append-only real (SCHEMA.md §1).
 */
function protectSheet_(sheet, table) {
  var existing = sheet.getProtections(SpreadsheetApp.ProtectionType.SHEET);
  var protection = existing.length ? existing[0] : sheet.protect();

  protection.setDescription(
    table.name + ' - writes go through the RSJ Fabric app, never by hand.' +
    (table.appendOnly ? ' APPEND-ONLY register.' : '')
  );

  var me = Session.getEffectiveUser();
  protection.addEditor(me);

  var others = protection.getEditors().filter(function (u) {
    return u.getEmail() !== me.getEmail();
  });
  if (others.length) protection.removeEditors(others);

  if (protection.canDomainEdit()) protection.setDomainEdit(false);
}


/* ========================================================================
 * The visible warning page
 * ====================================================================== */

function buildReadmeSheet_(ss, wbKey, report) {
  var sheet = ss.getSheetByName(CONFIG.README_SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(CONFIG.README_SHEET_NAME);
  sheet.clear();

  var rows = [
    ['RSJ CARRIERS - DIGITAL FABRIC'],
    [CONFIG.WORKBOOKS[wbKey].title],
    [''],
    [CONFIG.HANDS_OFF_NOTE],
    [''],
    ['Registers in this workbook:']
  ];

  FABRIC_SCHEMA[wbKey].forEach(function (t) {
    rows.push(['   ' + t.name + '   (' + t.ref + ')' +
      (t.appendOnly ? '   [APPEND-ONLY]' : '')]);
  });

  rows.push(['']);
  rows.push(['Built by bootstrap.gs from the rsj-fabric repo. Never edit this ' +
             'file, or the Apps Script project, in the browser - changes flow ' +
             'one direction only: repo -> clasp push -> Apps Script.']);

  sheet.getRange(1, 1, rows.length, 1).setValues(rows);
  sheet.getRange(1, 1).setFontSize(14).setFontWeight('bold');
  sheet.getRange(2, 1).setFontWeight('bold');
  sheet.getRange(4, 1).setWrap(true);
  sheet.setColumnWidth(1, 760);
  sheet.setTabColor('#7a7a7a');

  report.push(['README', wbKey, 'PASS', 'warning page written']);
}


/* ========================================================================
 * Reporting
 * ====================================================================== */

function renderReport_(title, rows) {
  var widths = [0, 0, 0, 0];
  rows.forEach(function (r) {
    for (var i = 0; i < 4; i++) widths[i] = Math.max(widths[i], String(r[i] || '').length);
  });

  var line = function (r) {
    return [0, 1, 2, 3].map(function (i) {
      var v = String(r[i] === undefined ? '' : r[i]);
      return v + Array(widths[i] - v.length + 1).join(' ');
    }).join('  ');
  };

  var out = [title + ' REPORT', ''];
  out.push(line(['WHAT', 'WHERE', 'RESULT', 'DETAIL']));
  out.push(line(['----', '-----', '------', '------']));
  rows.forEach(function (r) { out.push(line(r)); });

  var fails = rows.filter(function (r) { return r[2] === 'FAIL'; }).length;
  var warns = rows.filter(function (r) { return r[2] === 'WARN'; }).length;
  out.push('');
  out.push(fails === 0
    ? 'ALL PASS - ' + rows.length + ' checks, 0 failures' + (warns ? ', ' + warns + ' warnings' : '')
    : fails + ' FAILURE(S) out of ' + rows.length + ' checks');

  return out.join('\n');
}

function logReport_(title, rows) {
  Logger.log(renderReport_(title, rows));
}

/**
 * Prints the four spreadsheet URLs so the owner can open and eyeball them.
 * Run after bootstrap().
 */
function showWorkbookLinks() {
  var props = PropertiesService.getScriptProperties();
  var out = ['RSJ FABRIC WORKBOOKS', ''];

  workbookKeys_().forEach(function (k) {
    var id = props.getProperty(CONFIG.WORKBOOKS[k].propertyKey);
    out.push(k + ':  ' + (id
      ? 'https://docs.google.com/spreadsheets/d/' + id + '/edit'
      : 'NOT CREATED YET - run bootstrap()'));
  });

  var text = out.join('\n');
  Logger.log(text);
  return text;
}
