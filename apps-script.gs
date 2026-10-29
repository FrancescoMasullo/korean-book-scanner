// Incolla in Google Sheets > Estensioni > Apps Script. Cambia TOKEN con una stringa lunga e casuale.
const TOKEN = 'CAMBIA-QUESTO-TOKEN';
const COLS = ['isbn','title','vol','series','author','publisher','date','price','kdc','ddc','pages','size','subject','addcode','cover','status','ts','who'];

function sheet_() {
  const s = SpreadsheetApp.getActiveSheet();
  if (s.getLastRow() === 0) s.appendRow(COLS);
  s.getRange('A:A').setNumberFormat('@'); // ISBN come testo
  return s;
}
function out_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
function doPost(e) {
  const d = JSON.parse(e.postData.contents);
  if (d.token !== TOKEN) return out_({ error: 'token' });
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const s = sheet_(), b = d.book;
    const row = COLS.map(c => (b[c] === undefined || b[c] === null) ? '' : b[c]);
    const n = s.getLastRow();
    const ids = n > 1 ? s.getRange(2, 1, n - 1, 1).getValues().flat().map(String) : [];
    const i = ids.indexOf(String(b.isbn));
    if (i >= 0) s.getRange(i + 2, 1, 1, COLS.length).setValues([row]);
    else s.appendRow(row);
  } finally { lock.releaseLock(); }
  return out_({ ok: 1 });
}
function doGet(e) {
  if (e.parameter.token !== TOKEN) return out_({ error: 'token' });
  const v = sheet_().getDataRange().getValues();
  const h = v.shift();
  return out_({ books: v.map(r => Object.fromEntries(h.map((k, i) => [k, r[i]]))) });
}
