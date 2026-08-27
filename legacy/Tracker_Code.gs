/*******************************************************
 * RSJ CARRIERS — TRIP TRACKER (Apps Script server)
 * Second web app, SAME spreadsheet as the Strike Board.
 * Follow-up executive taps checkpoints; server stamps time.
 * Boundary: no LR creation, no expenses, no P&L — that is ERP.
 *******************************************************/

const T = {
  TRIP: 'Trip Register',
  CP: 'Checkpoint Log',
  DISC: 'Discrepancy Log',
  VEH: 'Vehicle Master',
  SET: 'Settings'
};

/* Trip Register column numbers (1-based) */
const C = {
  id: 1, lr: 2, doNo: 3, own: 4, veh: 5, driver: 6, phone: 7, broker: 8, client: 9,
  from: 10, dest: 11, size: 12, type: 13, cont: 14,
  released: 15, garageOut: 16, picked: 17, reached: 18, gateIn: 19, unloadStart: 20,
  unloadEnd: 21, gateOut: 22, emptyRet: 23, garageIn: 24,
  detHrs: 25, docLR: 26, docPOD: 27, docWt: 28, docEway: 29, docsAt: 30,
  stage: 31, exec: 32, closed: 33
};

/* Checkpoint chains */
const CHAIN_OWN = ['GARAGE OUT', 'CONTAINER PICKED', 'REACHED CLIENT', 'GATE IN',
  'UNLOAD START', 'UNLOAD END', 'GATE OUT', 'EMPTY RETURNED', 'GARAGE IN'];
const CHAIN_MARKET = ['CONTAINER PICKED', 'REACHED CLIENT', 'GATE OUT', 'EMPTY RETURNED'];

const CP_COL = {
  'GARAGE OUT': C.garageOut, 'CONTAINER PICKED': C.picked, 'REACHED CLIENT': C.reached,
  'GATE IN': C.gateIn, 'UNLOAD START': C.unloadStart, 'UNLOAD END': C.unloadEnd,
  'GATE OUT': C.gateOut, 'EMPTY RETURNED': C.emptyRet, 'GARAGE IN': C.garageIn
};

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Tracker')
    .setTitle('RSJ Trip Tracker')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function ss_() { return SpreadsheetApp.getActive(); }
function sh_(n) {
  const s = ss_().getSheetByName(n);
  if (!s) throw new Error('Tab missing: ' + n + ' — do not rename tabs.');
  return s;
}
function uid_(p) { return p + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5); }
function iso_(v) { return (v instanceof Date) ? v.toISOString() : (v || ''); }
function chain_(own) { return own === 'OWN' ? CHAIN_OWN : CHAIN_MARKET; }

function settings_() {
  const v = sh_(T.SET).getRange('B4:B5').getValues();
  return { freeDet: Number(v[0][0]) || 24, docDays: Number(v[1][0]) || 3 };
}

/* ---------- READ ---------- */
function apiGetTrips() {
  const rows = sh_(T.TRIP).getDataRange().getValues().slice(1);
  const trips = rows.filter(r => r[0] && r[C.closed - 1] !== 'YES').map(r => {
    const own = r[C.own - 1];
    const ch = chain_(own);
    const stamps = {};
    ch.forEach(cp => { stamps[cp] = iso_(r[CP_COL[cp] - 1]); });
    let next = null;
    for (let i = 0; i < ch.length; i++) { if (!stamps[ch[i]]) { next = ch[i]; break; } }
    return {
      id: r[C.id - 1], lr: r[C.lr - 1], doNo: r[C.doNo - 1], own: own, veh: r[C.veh - 1],
      driver: r[C.driver - 1], phone: r[C.phone - 1], broker: r[C.broker - 1], client: r[C.client - 1],
      from: r[C.from - 1], dest: r[C.dest - 1], size: r[C.size - 1], type: r[C.type - 1],
      cont: r[C.cont - 1], released: iso_(r[C.released - 1]),
      stamps: stamps, chain: ch, next: next,
      detHrs: Number(r[C.detHrs - 1]) || 0,
      docs: {
        lr: r[C.docLR - 1] === true || r[C.docLR - 1] === 'YES',
        pod: r[C.docPOD - 1] === true || r[C.docPOD - 1] === 'YES',
        wt: r[C.docWt - 1] === true || r[C.docWt - 1] === 'YES',
        eway: r[C.docEway - 1] === true || r[C.docEway - 1] === 'YES'
      },
      stage: r[C.stage - 1] || '', exec: r[C.exec - 1] || ''
    };
  });

  const disc = sh_(T.DISC).getDataRange().getValues().slice(1)
    .filter(r => r[0] && !r[11]).map(r => ({ id: r[0], tripId: r[1], type: r[6], details: r[7], at: iso_(r[5]) }));
  trips.forEach(t => { t.openDisc = disc.filter(d => d.tripId === t.id); });

  const veh = sh_(T.VEH).getDataRange().getValues().slice(1)
    .filter(r => r[0] && r[4] === 'IN GARAGE')
    .map(r => ({ veh: r[0], model: r[1], sizeCap: r[2], typeCap: r[3], since: iso_(r[5]) }))
    .sort((a, b) => new Date(a.since) - new Date(b.since));

  return JSON.stringify({ trips: trips, queue: veh, set: settings_() });
}

/* ---------- WRITE: release a truck (trip starts) ---------- */
function apiReleaseTrip(o) {
  o = JSON.parse(o);
  if (!o.lr || !o.veh || !o.own) throw new Error('LR No, Vehicle No and Own/Market are required.');
  const s = sh_(T.TRIP);
  const existing = s.getRange(2, C.lr, Math.max(s.getLastRow() - 1, 1), 1).getValues().flat();
  if (existing.indexOf(o.lr) > -1) throw new Error('LR ' + o.lr + ' is already on the board.');
  const id = uid_('T');
  const row = new Array(33).fill('');
  row[C.id - 1] = id; row[C.lr - 1] = o.lr; row[C.doNo - 1] = o.doNo || '';
  row[C.own - 1] = o.own; row[C.veh - 1] = o.veh; row[C.driver - 1] = o.driver || '';
  row[C.phone - 1] = o.phone || ''; row[C.broker - 1] = o.broker || ''; row[C.client - 1] = o.client || '';
  row[C.from - 1] = o.from || ''; row[C.dest - 1] = o.dest || ''; row[C.size - 1] = o.size || '';
  row[C.type - 1] = o.type || ''; row[C.cont - 1] = o.cont || '';
  row[C.released - 1] = new Date();
  row[C.detHrs - 1] = 0; row[C.stage - 1] = 'RELEASED';
  row[C.exec - 1] = o.exec || ''; row[C.closed - 1] = 'NO';
  s.appendRow(row);
  if (o.own === 'OWN') setVehicleStatus_(o.veh, 'ON TRIP', '');
  return apiGetTrips();
}

/* ---------- WRITE: tap a checkpoint ---------- */
function apiCheckpoint(o) {
  o = JSON.parse(o);
  const s = sh_(T.TRIP);
  const vals = s.getDataRange().getValues();
  let idx = -1;
  for (let i = 1; i < vals.length; i++) if (vals[i][C.id - 1] === o.tripId) { idx = i; break; }
  if (idx < 0) throw new Error('Trip not found.');
  const row = idx + 1;
  const own = vals[idx][C.own - 1];
  const ch = chain_(own);
  const cp = o.cp;
  if (ch.indexOf(cp) < 0) throw new Error('Checkpoint not valid for this truck type.');
  if (vals[idx][CP_COL[cp] - 1]) throw new Error(cp + ' is already stamped.');

  const now = new Date();
  s.getRange(row, CP_COL[cp]).setValue(now);
  s.getRange(row, C.stage).setValue(cp);
  sh_(T.CP).appendRow([uid_('L'), o.tripId, vals[idx][C.lr - 1], vals[idx][C.veh - 1], cp, now, o.exec || '', o.note || '']);

  // detention: gate-in to gate-out
  if (cp === 'GATE OUT') {
    const gi = vals[idx][C.gateIn - 1];
    if (gi instanceof Date) {
      const hrs = (now - gi) / 36e5;
      s.getRange(row, C.detHrs).setValue(Math.round(hrs * 10) / 10);
    }
  }
  // garage in => back in queue
  if (cp === 'GARAGE IN') {
    setVehicleStatus_(vals[idx][C.veh - 1], 'IN GARAGE', now);
  }
  return apiGetTrips();
}

/* ---------- WRITE: documents ---------- */
function apiSetDoc(o) {
  o = JSON.parse(o);
  const map = { lr: C.docLR, pod: C.docPOD, wt: C.docWt, eway: C.docEway };
  const col = map[o.doc];
  if (!col) throw new Error('Unknown document.');
  const s = sh_(T.TRIP);
  const vals = s.getDataRange().getValues();
  for (let i = 1; i < vals.length; i++) {
    if (vals[i][C.id - 1] === o.tripId) {
      s.getRange(i + 1, col).setValue(o.on ? 'YES' : '');
      const r = s.getRange(i + 1, C.docLR, 1, 4).getValues()[0];
      const all = r.every(x => x === 'YES');
      s.getRange(i + 1, C.docsAt).setValue(all ? new Date() : '');
      return apiGetTrips();
    }
  }
  throw new Error('Trip not found.');
}

/* ---------- WRITE: discrepancy ---------- */
function apiRaiseDisc(o) {
  o = JSON.parse(o);
  if (!o.type) throw new Error('Choose a discrepancy type.');
  const s = sh_(T.TRIP);
  const vals = s.getDataRange().getValues();
  let lr = '', veh = '';
  for (let i = 1; i < vals.length; i++) if (vals[i][C.id - 1] === o.tripId) { lr = vals[i][C.lr - 1]; veh = vals[i][C.veh - 1]; }
  sh_(T.DISC).appendRow([uid_('D'), o.tripId, lr, veh, o.at || '', new Date(), o.type, o.details || '',
    o.cost === '' || o.cost == null ? '' : Number(o.cost), o.resp || '', o.billable ? 'YES' : 'NO', '', o.exec || '']);
  return apiGetTrips();
}
function apiResolveDisc(discId) {
  const s = sh_(T.DISC);
  const vals = s.getDataRange().getValues();
  for (let i = 1; i < vals.length; i++) {
    if (vals[i][0] === discId) { s.getRange(i + 1, 12).setValue(new Date()); return apiGetTrips(); }
  }
  throw new Error('Discrepancy not found.');
}

/* ---------- WRITE: close trip (docs complete) ---------- */
function apiCloseTrip(tripId) {
  const s = sh_(T.TRIP);
  const vals = s.getDataRange().getValues();
  for (let i = 1; i < vals.length; i++) {
    if (vals[i][C.id - 1] === tripId) {
      const d = s.getRange(i + 1, C.docLR, 1, 4).getValues()[0];
      if (!d.every(x => x === 'YES')) throw new Error('All four documents must be received before closing.');
      s.getRange(i + 1, C.closed).setValue('YES');
      s.getRange(i + 1, C.stage).setValue('BILLING READY');
      return apiGetTrips();
    }
  }
  throw new Error('Trip not found.');
}

/* ---------- FIFO skip logging ---------- */
function apiLogSkip(o) {
  o = JSON.parse(o);
  sh_(T.CP).appendRow([uid_('L'), '', '', o.veh, 'FIFO SKIPPED', new Date(), o.exec || '', o.reason || '']);
  return apiGetTrips();
}

function setVehicleStatus_(veh, status, since) {
  const s = sh_(T.VEH);
  const vals = s.getDataRange().getValues();
  for (let i = 1; i < vals.length; i++) {
    if (vals[i][0] === veh) {
      s.getRange(i + 1, 5).setValue(status);
      s.getRange(i + 1, 6).setValue(since || '');
      return;
    }
  }
  s.appendRow([veh, '', '', '', status, since || '', '', 'auto-added — fill model & capability']);
}
