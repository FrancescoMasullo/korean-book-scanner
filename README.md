# 📚 Korean Book Scanner & Catalogatore NLK

Strumento web mobile-first per la catalogazione rapida e sequenziale di libri coreani tramite codice a barre ISBN, con recupero automatico dei metadati dalla **National Library of Korea (국립중앙도서관 - 서지정보 Open API)** e sincronizzazione su **Google Sheets**.

Ideale per organizzare biblioteche, centri culturali o collezioni private con più persone al lavoro contemporaneamente.

---

## 🌟 Funzionalità Principali

1. **Scansione Continua da Telefono (iOS / Android)**:
   - La fotocamera posteriore resta sempre aperta senza dover cliccare per ogni libro.
   - Bip audio sintetizzato (senza bisogno di file esterni) e vibrazione a ogni scansione riuscita.
   - Controllo checksum ISBN-13 (ignora codici prezzo ausiliari o barcode non librari).
   - Riconoscimento istantaneo di codici duplicati.
   - Supporto torcia/flash (sui dispositivi supportati).

2. **Catalogazione Automatica NLK (National Library of Korea)**:
   - Recupera: **Titolo (서명)**, **Autore (저자)**, **Editore (출판사)**, **Anno/Data**, **KDC (Korean Decimal Classification)**, **DDC (Dewey)**, **Pagine**, **Soggetto** e **Copertina**.
   - **Bypass CORS automatico**: Google Apps Script esegue da proxy trasparente lato server eliminando ogni blocco di rete del browser.

3. **Database Condiviso in Tempo Reale (Google Sheets)**:
   - Ogni libro scansionato viene inviato istantaneamente a un Google Sheet centrale.
   - Più volontari o operatori possono scansionare in contemporanea da telefoni diversi.
   - Ogni riga include il nome dell'operatore, data e ora, ed evita i duplicati.

4. **Zero Perdita Dati (Funziona anche Offline)**:
   - Tutto viene salvato istantaneamente nella memoria locale del dispositivo (`localStorage`).
   - Se la connessione cade, le scansioni vengono messe "in sospeso" e sincronizzate in blocco con un clic appena torna il segnale.

5. **Privacy & Gestione Accessi**:
   - Accessibile via GitHub Pages.
   - Nessun dato o password è scritto nel codice: l'accesso al Google Sheet è protetto da un **Secret Token** configurabile solo nei telefoni abilitati.

---

## 🚀 Guida all'Attivazione Rapida (Step by Step)

### 1. Inizializzare Git e Pubblicare su GitHub Pages

Sul tuo computer (nella cartella del progetto):

```bash
# 1. Inizializza il repository locale
git init

# 2. Aggiungi i file ed effettua il primo commit
git add .
git commit -m "Initial commit: Korean book scanner webapp"

# 3. Rinomina il branch in main
git branch -M main
```

Ora crea un nuovo repository su [GitHub](https://github.com/new):
- Nome consigliato: `korean-book-scanner`
- Visibilità: **Public** (necessario per GitHub Pages con account gratuito) oppure **Private** (se hai GitHub Pro).
- Non aggiungere README né licenza (li stiamo già inviando da qui).

Collega il repo remoto e fai il push:
```bash
git remote add origin https://github.com/TUO-USERNAME/korean-book-scanner.git
git push -u origin main
```

**Attiva GitHub Pages**:
1. Nel tuo repository su GitHub, vai su **Settings** > **Pages** (nel menu a sinistra).
2. Sotto *Build and deployment* > *Source*, seleziona **Deploy from a branch**.
3. Seleziona il branch **main** e cartella **/(root)**, poi clicca **Save**.
4. Dopo 1-2 minuti, la tua app sarà attiva all'indirizzo:
   `https://TUO-USERNAME.github.io/korean-book-scanner/`

---

### 2. Configurare lo Spazio Condiviso (Google Sheets)

1. Vai su [Google Sheets](https://sheets.new) e crea un nuovo foglio vuoto (es. *"Catalogo Biblioteca Coreana"*).
2. Nel menu in alto, clicca su **Estensioni** > **Apps Script**.
3. Cancella tutto il testo nell'editor e incolla l'intero contenuto del file [`apps-script.gs`](./apps-script.gs).
4. Nella riga 24 di `apps-script.gs`, scegli una password/token sicuro:
   ```javascript
   const SECRET_TOKEN = "la-tua-password-segreta-2026";
   ```
5. Clicca sull'icona **Salva** (dischetto).
6. Clicca su **Distribuisci** (in alto a destra) > **Nuova distribuzione**.
   - Clicca sull'icona a forma di ingranaggio a sinistra e scegli **Applicazione web**.
   - *Descrizione*: `v1 Biblioteca`
   - *Esegui come*: **Utente corrente** (il tuo indirizzo Gmail)
   - *Chi ha accesso*: **Chiunque** (*Anyone*)
7. Clicca su **Distribuisci**. Google ti chiederà di autorizzare l'accesso (clicca su *Avanzate* > *Apri il progetto...* > *Consenti*).
8. Copia l'**URL dell'applicazione web** generato (termina con `/exec`).

---

### 3. Richiedere la Chiave API della National Library of Korea (NLK)

1. Registrati o accedi al portale [nl.go.kr - 서지정보유통지원시스템](https://www.nl.go.kr/seoji/).
2. Vai nella sezione **Open API** / **서지정보 Open API 신청**.
3. Richiedi la chiave gratuita per l'ISBN (*ISBN/서지정보 Open API*).
4. Ti verrà rilasciata una chiave chiamata `cert_key`.

---

### 4. Configurazione e Uso dal Telefono

1. Apri dal browser del telefono (Safari su iPhone, Chrome su Android) il link di GitHub Pages:
   `https://TUO-USERNAME.github.io/korean-book-scanner/`
2. **Installa l'app a schermo intero**:
   - **iPhone (Safari)**: tocca il tasto *Condividi* (quadrato con freccia in su) e seleziona **Aggiungi alla schermata Home**.
   - **Android (Chrome)**: tocca i 3 puntini in alto a destra e seleziona **Installa app** o **Aggiungi a schermata Home**.
3. Tocca la scheda **Opzioni** (⚙️ in basso a destra) e compila:
   - **Chiave API NLK**: incolla la tua `cert_key`.
   - **URL Web App**: incolla l'URL di Apps Script (`https://script.google.com/macros/s/.../exec`).
   - **Token di Sicurezza**: la password che hai scelto in `apps-script.gs`.
   - **Nome Operatore**: il tuo nome o identificativo (es. *Francesco*).
4. Clicca su **Verifica Connessione Foglio** per confermare che sia tutto ok.

---

## 📖 Come Scansionare

1. Vai nella scheda **Scanner** e tocca **Avvia Camera**.
2. Concedi il permesso alla fotocamera.
3. Inquadra il codice a barre sul retro del libro coreano:
   - A ogni lettura sentirai un **bip** e il telefono vibrerà.
   - La camera rimane sempre aperta: passa subito al libro successivo!
   - In background l'app interroga la National Library of Korea e spedisce i dati a Google Sheets.
4. Per consultare tutti i libri catalogati, tocca la scheda **Catalogo**:
   - Puoi cercare per titolo coreano, autore, codice KDC/DDC o ISBN.
   - Puoi esportare in **CSV** (con codifica corretta per Excel e Hangul) o fare backup **JSON**.
   - Puoi scaricare sul telefono i libri scansionati dagli altri colleghi toccando **⬇️ Scarica dal foglio**.
