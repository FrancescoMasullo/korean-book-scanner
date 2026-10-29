/**
 * ==============================================================================
 * KOREAN BOOK SCANNER - GOOGLE APPS SCRIPT BACKEND (v2.2 - Kakao & Data4Library)
 * ==============================================================================
 * Questo script collega l'app su GitHub Pages a Google Sheets.
 * Funziona sia da database condiviso (con LockService anti-conflitti per più
 * operatori), sia da PROXY trasparente per le API di Kakao Daum Books
 * e di Data4Library (도서관 정보나루) per azzerare i blocchi CORS nel browser.
 *
 * ISTRUZIONI:
 * 1. In Google Sheets: Estensioni > Apps Script.
 * 2. Incolla questo codice sostituendo quello vecchio.
 * 3. Se avevi già un TOKEN, puoi inserirlo qui sotto.
 * 4. Clicca su Salva (icona dischetto).
 * 5. Distribuisci > Gestisci distribuzioni > Modifica (icona matita) >
 *    Nuova versione > Distribuisci.
 * ==============================================================================
 */

// IMPOSTA IL TUO TOKEN / PASSWORD CONDIVISA
const TOKEN = 'CAMBIA-QUESTO-TOKEN';

// COLONNE DEL FOGLIO CATALOGO
const COLS = [
  'isbn',
  'call_number',
  'author_code',
  'title',
  'vol',
  'series',
  'author',
  'publisher',
  'date',
  'price',
  'kdc',
  'ddc',
  'pages',
  'size',
  'subject',
  'addcode',
  'cover',
  'notes',
  'status',
  'ts',
  'who'
];

// INTESTAZIONI LEGGIBILI PER LA PRIMA RIGA
const HEADER_LABELS = [
  'ISBN',
  'Segnatura / Spina (청구기호)',
  'Codice Autore (저자기호)',
  'Titolo (서명)',
  'Volume (권)',
  'Serie (총서명)',
  'Autore (저자)',
  'Editore (출판사)',
  'Data / Anno',
  'Prezzo (가격)',
  'KDC',
  'DDC',
  'Pagine',
  'Formato/Taglia',
  'Soggetto (주제)',
  'Add Code',
  'Copertina URL',
  'Note / Scaffale',
  'Stato Metadati',
  'Timestamp',
  'Operatore'
];

/**
 * Ottiene o inizializza il foglio attivo
 */
function getCatalogSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const s = ss.getActiveSheet();

  if (s.getLastRow() === 0) {
    s.appendRow(HEADER_LABELS);
    // Stile elegante prima riga
    const hRange = s.getRange(1, 1, 1, HEADER_LABELS.length);
    hRange.setBackground('#1e293b');
    hRange.setFontColor('#f8fafc');
    hRange.setFontWeight('bold');
    hRange.setHorizontalAlignment('center');
    s.setFrozenRows(1);
  }

  // Forza colonna ISBN (A:A) come testo puro per non perdere lo zero iniziale o creare notazione esponenziale
  s.getRange('A:A').setNumberFormat('@');
  return s;
}

/**
 * Risposta JSON standard
 */
function outJson(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Gestione richieste GET (Proxy NLK, Ping, Download catalogo)
 */
function doGet(e) {
  try {
    const params = (e && e.parameter) ? e.parameter : {};
    const reqToken = params.token;
    const action = params.action;

    // Controllo Token di sicurezza
    if (reqToken !== TOKEN) {
      return outJson({ error: 'token_non_valido', message: 'Token errato o non fornito' });
    }

    // 1. PING: Test rapido di connessione dall'app del telefono
    if (action === 'ping') {
      return outJson({ ok: 1, success: true, message: 'Connessione stabilita con successo!' });
    }

    // 2. PROXY KAKAO DAUM BOOKS: Interroga Kakao Daum Search Books lato server (Bypass CORS)
    if (action === 'proxyKakao') {
      const kakaoKey = String(params.kakao_key || '').trim();
      const isbn = String(params.isbn || '').replace(/[-\s]/g, '');
      if (!kakaoKey || !isbn) {
        return outJson({ error: 'parametri_mancanti', message: 'kakao_key e isbn richiesti' });
      }

      try {
        let kakaoUrl = 'https://dapi.kakao.com/v3/search/book?target=isbn&size=1&query=' + encodeURIComponent(isbn);
        let response = UrlFetchApp.fetch(kakaoUrl, {
          method: 'get',
          muteHttpExceptions: true,
          headers: {
            'Authorization': 'KakaoAK ' + kakaoKey,
            'Accept': 'application/json'
          }
        });
        let code = response.getResponseCode();
        let text = response.getContentText();

        if (code !== 200) {
          return outJson({ error: 'kakao_api_error', httpCode: code, message: text });
        }

        let parsed = JSON.parse(text);
        // Fallback: se con target=isbn non trova risultati, cerca ISBN nel campo generico query
        if (!parsed.documents || parsed.documents.length === 0) {
          kakaoUrl = 'https://dapi.kakao.com/v3/search/book?size=1&query=' + encodeURIComponent(isbn);
          response = UrlFetchApp.fetch(kakaoUrl, {
            method: 'get',
            muteHttpExceptions: true,
            headers: {
              'Authorization': 'KakaoAK ' + kakaoKey,
              'Accept': 'application/json'
            }
          });
          text = response.getContentText();
        }

        return ContentService.createTextOutput(text).setMimeType(ContentService.MimeType.JSON);
      } catch (kakaoErr) {
        return outJson({ error: 'kakao_proxy_error', message: kakaoErr.toString() });
      }
    }

    // 3. PROXY DATA4LIBRARY (KDC Ufficiale Biblioteche Coreane)
    if (action === 'proxyData4Library') {
      const authKey = String(params.auth_key || '').trim();
      const isbn = String(params.isbn || '').replace(/[-\s]/g, '');
      if (!authKey || !isbn) {
        return outJson({ error: 'parametri_mancanti', message: 'auth_key e isbn richiesti' });
      }

      const d4lUrl = 'http://data4library.kr/api/srchDtlList?authKey=' +
        encodeURIComponent(authKey) +
        '&isbn13=' + encodeURIComponent(isbn) +
        '&format=json';

      try {
        const response = UrlFetchApp.fetch(d4lUrl, {
          method: 'get',
          muteHttpExceptions: true
        });
        const text = response.getContentText();
        return ContentService.createTextOutput(text).setMimeType(ContentService.MimeType.JSON);
      } catch (d4lErr) {
        return outJson({ error: 'data4library_proxy_error', message: d4lErr.toString() });
      }
    }

    // 4. LIST BOOKS: Ritorna tutti i libri salvati nel foglio
    const s = getCatalogSheet();
    const values = s.getDataRange().getValues();
    if (values.length <= 1) {
      return outJson({ ok: 1, books: [] });
    }

    // La riga 0 contiene le intestazioni
    const books = [];
    for (let r = 1; r < values.length; r++) {
      const row = values[r];
      if (!row[0]) continue; // Salta se manca l'ISBN

      const book = {};
      COLS.forEach((colKey, i) => {
        book[colKey] = row[i] !== undefined && row[i] !== null ? String(row[i]) : '';
      });
      books.push(book);
    }

    return outJson({ ok: 1, count: books.length, books: books });

  } catch (err) {
    return outJson({ error: 'server_error', message: err.toString() });
  }
}

/**
 * Gestione richieste POST (Salvataggio libri singolo o batch con LockService)
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  // Attende fino a 25 secondi per evitare conflitti tra scansioni concorrenti
  try {
    lock.waitLock(25000);
  } catch (lockErr) {
    return outJson({ error: 'concurrency_timeout', message: 'Foglio occupato, riprova tra poco' });
  }

  try {
    let payload = {};
    if (e && e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    }

    if (payload.token !== TOKEN) {
      return outJson({ error: 'token_non_valido', message: 'Token errato o non fornito' });
    }

    const s = getCatalogSheet();
    const action = payload.action;

    // 1. SALVATAGGIO DI UN SINGOLO LIBRO
    if (payload.book) {
      const b = payload.book;
      const res = writeBookRow_(s, b);
      return outJson({ ok: 1, success: true, status: res.status });
    }

    // 2. SINCRONIZZAZIONE IN BLOCCO (BATCH SYNC)
    if (action === 'batchSync' && Array.isArray(payload.books)) {
      let inserted = 0, updated = 0;
      payload.books.forEach(b => {
        if (b && b.isbn) {
          const res = writeBookRow_(s, b);
          if (res.status === 'inserted') inserted++;
          else updated++;
        }
      });
      return outJson({ ok: 1, success: true, inserted: inserted, updated: updated });
    }

    return outJson({ error: 'payload_non_valido', message: 'Nessun libro fornito nel corpo della richiesta' });

  } catch (err) {
    return outJson({ error: 'post_error', message: err.toString() });
  } finally {
    lock.releaseLock();
  }
}

/**
 * Funzione ausiliaria di scrittura/aggiornamento riga
 */
function writeBookRow_(sheet, b) {
  const cleanIsbn = String(b.isbn || '').replace(/[-\s]/g, '');
  const rowData = COLS.map(c => {
    let val = b[c];
    if (val === undefined || val === null) val = '';
    return String(val);
  });
  // Forza ISBN con apice per proteggere il testo su foglio
  rowData[0] = "'" + cleanIsbn;

  const n = sheet.getLastRow();
  const existingIsbns = n > 1
    ? sheet.getRange(2, 1, n - 1, 1).getValues().flat().map(x => String(x).replace(/['\-\s]/g, ''))
    : [];

  const foundIndex = existingIsbns.indexOf(cleanIsbn);
  if (foundIndex >= 0) {
    // Aggiorna la riga esistente (indice base 1: riga 1 header, riga 2 primo dato)
    const targetRow = foundIndex + 2;
    sheet.getRange(targetRow, 1, 1, COLS.length).setValues([rowData]);
    return { status: 'updated', row: targetRow };
  } else {
    // Inserisci nuova riga
    sheet.appendRow(rowData);
    return { status: 'inserted', row: sheet.getLastRow() };
  }
}
