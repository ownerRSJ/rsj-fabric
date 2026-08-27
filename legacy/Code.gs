/*******************************************************
 * RSJ CARRIERS — DO STRIKE BOARD (Apps Script server)
 * Bound to the "RSJ StrikeBoard Database" Google Sheet.
 * Every write lands instantly in the Sheet = auto-save.
 *******************************************************/

const SH = {
  DO: 'DO Register',
  STRIKE: 'Strike Register',
  AWARD: 'Award Register',
  BROKER: 'Broker Master',
  EXEC: 'Executive Master'
};

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('RSJ DO Strike Board')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function ss_() { return SpreadsheetApp.getActive(); }
function sh_(name) {
  const s = ss_().getSheetByName(name);
  if (!s) throw new Error('Tab missing: ' + name + ' — do not rename tabs.');
  return s;
}
function uid_(p) { return p + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5); }
function iso_(v) { return (v instanceof Date) ? v.toISOString() : (v || ''); }

/* ---------- READ: whole board in one call ---------- */
function apiGetBoard() {
  const doRows = sh_(SH.DO).getDataRange().getValues().slice(1);
  const skRows = sh_(SH.STRIKE).getDataRange().getValues().slice(1);
  const awRows = sh_(SH.AWARD).getDataRange().getValues().slice(1);

  const awardsByStrike = {};
  const awards = awRows.filter(r => r[0]).map(r => ({
    id: r[0], strikeId: r[1], doNo: r[2], at: iso_(r[3]), broker: r[4], exec: r[5],
    qty: Number(r[6]) || 0, landed: Number(r[7]) || 0, doAvg: Number(r[8]) || 0,
    beat: r[9] === true || r[9] === 'TRUE', reason: r[10] || ''
  }));
  awards.forEach(a => { (awardsByStrike[a.strikeId] = awardsByStrike[a.strikeId] || []).push(a); });

  const strikesByDo = {};
  skRows.filter(r => r[0]).forEach(r => {
    const s = {
      id: r[0], doNo: r[1], at: iso_(r[2]), exec: r[3], broker: r[4], contact: r[5],
      qty: Number(r[6]) || 1, quoted: Number(r[7]) || 0, negot: Number(r[8]) || 0,
      fees: Number(r[9]) || 0, landed: Number(r[10]) || 0, terms: r[11],
      report: iso_(r[12]), valid: iso_(r[13]), circ: r[14] || '',
      awards: awardsByStrike[r[0]] || []
    };
    (strikesByDo[s.doNo] = strikesByDo[s.doNo] || []).push(s);
  });

  const dos = doRows.filter(r => r[0] && r[13] !== 'CANCELLED').map(r => ({
    doNo: r[0], openedAt: iso_(r[1]), client: r[2], from: r[3], dest: r[4],
    size: r[5], type: r[6], qty: Number(r[7]) || 1, weight: r[8],
    emptyDate: iso_(r[9]), needBy: iso_(r[10]), freight: r[11] === '' ? null : Number(r[11]),
    note: r[12] || '', status: r[13] || 'OPEN', closedAt: iso_(r[14]),
    strikes: strikesByDo[r[0]] || []
  }));
  return JSON.stringify(dos);
}

/* ---------- WRITE: new DO ---------- */
function apiAddDO(o) {
  o = JSON.parse(o);
  if (!o.doNo || !o.dest || !o.needBy) throw new Error('DO No, Destination and Needed-By are required.');
  const s = sh_(SH.DO);
  const existing = s.getRange(2, 1, Math.max(s.getLastRow() - 1, 1), 1).getValues().flat();
  if (existing.indexOf(o.doNo) > -1) throw new Error('DO ' + o.doNo + ' already exists on the board.');
  s.appendRow([o.doNo, new Date(), o.client || '', o.from || '', o.dest, o.size || '', o.type || '',
    Number(o.qty) || 1, o.weight || '', o.emptyDate ? new Date(o.emptyDate) : '', new Date(o.needBy),
    o.freight === '' || o.freight == null ? '' : Number(o.freight), o.note || '', 'OPEN', '']);
  return apiGetBoard();
}

/* ---------- WRITE: new strike (timestamp = server now) ---------- */
function apiAddStrike(o) {
  o = JSON.parse(o);
  if (!o.doNo || !o.exec || !o.broker || !o.quoted) throw new Error('Executive, Broker and Quoted Rate are required.');
  const negot = Number(o.negot) || Number(o.quoted);
  const fees = Number(o.fees) || 0;
  sh_(SH.STRIKE).appendRow([uid_('S'), o.doNo, new Date(), o.exec, o.broker, o.contact || '',
    Number(o.qty) || 1, Number(o.quoted), negot, fees, negot + fees, o.terms || '',
    o.report ? new Date(o.report) : '', o.valid ? new Date(o.valid) : '', o.circ || '']);
  autoAddBroker_(o.broker, o.contact);
  autoAddExec_(o.exec);
  return apiGetBoard();
}

/* ---------- WRITE: award trucks from a strike ---------- */
function apiAward(o) {
  o = JSON.parse(o);
  const skSheet = sh_(SH.STRIKE);
  const sk = skSheet.getDataRange().getValues().slice(1);
  const row = sk.find(r => r[0] === o.strikeId);
  if (!row) throw new Error('Strike not found.');
  const doNo = row[1], broker = row[4], exec = row[3], landed = Number(row[10]);

  // remaining trucks check
  const doSheet = sh_(SH.DO);
  const doVals = doSheet.getDataRange().getValues();
  let doRowIdx = -1;
  for (let i = 1; i < doVals.length; i++) if (doVals[i][0] === doNo) { doRowIdx = i; break; }
  if (doRowIdx < 0) throw new Error('DO not found.');
  const required = Number(doVals[doRowIdx][7]) || 1;
  const awarded = sh_(SH.AWARD).getDataRange().getValues().slice(1)
    .filter(r => r[2] === doNo).reduce((a, r) => a + (Number(r[6]) || 0), 0);
  const qty = Number(o.qty) || 0;
  if (qty < 1 || qty > required - awarded) throw new Error('Award between 1 and ' + (required - awarded) + ' trucks.');
  if (!o.reason) throw new Error('Reason for selection is required.');

  // snapshot: average landed of ALL strikes on this DO at this moment
  const doStrikes = sk.filter(r => r[1] === doNo).map(r => Number(r[10])).filter(n => n > 0);
  const avg = doStrikes.length ? doStrikes.reduce((a, b) => a + b, 0) / doStrikes.length : landed;
  const beat = landed < avg;

  sh_(SH.AWARD).appendRow([uid_('A'), o.strikeId, doNo, new Date(), broker, exec, qty,
    landed, Math.round(avg), beat, o.reason]);

  // status update
  const nowPlaced = awarded + qty;
  const status = nowPlaced >= required ? 'PLACED' : 'PARTIAL';
  doSheet.getRange(doRowIdx + 1, 14).setValue(status);
  doSheet.getRange(doRowIdx + 1, 15).setValue(nowPlaced >= required ? new Date() : '');
  return apiGetBoard();
}

/* ---------- WRITE: undo an award ---------- */
function apiUndoAward(awardId) {
  const s = sh_(SH.AWARD);
  const vals = s.getDataRange().getValues();
  for (let i = 1; i < vals.length; i++) {
    if (vals[i][0] === awardId) {
      const doNo = vals[i][2];
      s.deleteRow(i + 1);
      recomputeStatus_(doNo);
      return apiGetBoard();
    }
  }
  throw new Error('Award not found.');
}

/* ---------- WRITE: cancel a DO (never delete — registers keep history) ---------- */
function apiCancelDO(doNo) {
  const s = sh_(SH.DO);
  const vals = s.getDataRange().getValues();
  for (let i = 1; i < vals.length; i++) {
    if (vals[i][0] === doNo) { s.getRange(i + 1, 14).setValue('CANCELLED'); return apiGetBoard(); }
  }
  throw new Error('DO not found.');
}

/* ---------- helpers ---------- */
function recomputeStatus_(doNo) {
  const doSheet = sh_(SH.DO);
  const vals = doSheet.getDataRange().getValues();
  for (let i = 1; i < vals.length; i++) {
    if (vals[i][0] === doNo) {
      const required = Number(vals[i][7]) || 1;
      const awarded = sh_(SH.AWARD).getDataRange().getValues().slice(1)
        .filter(r => r[2] === doNo).reduce((a, r) => a + (Number(r[6]) || 0), 0);
      const status = awarded >= required ? 'PLACED' : awarded > 0 ? 'PARTIAL' : 'OPEN';
      doSheet.getRange(i + 1, 14).setValue(status);
      doSheet.getRange(i + 1, 15).setValue(awarded >= required ? new Date() : '');
      return;
    }
  }
}
function autoAddBroker_(name, contact) {
  if (!name) return;
  const s = sh_(SH.BROKER);
  const names = s.getRange(2, 1, Math.max(s.getLastRow() - 1, 1), 1).getValues().flat();
  if (names.indexOf(name) < 0) s.appendRow([name, contact || '', '']);
}
function autoAddExec_(name) {
  if (!name) return;
  const s = sh_(SH.EXEC);
  const names = s.getRange(2, 1, Math.max(s.getLastRow() - 1, 1), 1).getValues().flat();
  if (names.indexOf(name) < 0) s.appendRow([name, '', 'auto-added — enter salary for incentive calc']);
}
