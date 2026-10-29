# 📚 Korean Book Scanner & Catalogatore KDC

Strumento web mobile-first PWA per la catalogazione rapida e sequenziale di libri coreani tramite codice a barre ISBN, con recupero automatico dei metadati commerciali tramite **Kakao Daum Books API**, assegnazione della classificazione **KDC ufficiale** tramite **Data4Library (도서관 정보나루)**, generazione automatica del codice autore secondo la formula **Lee Jae-chul (이재철)**, anteprima e stampa di etichette da dorso e sincronizzazione in tempo reale su **Google Sheets**.

Ideale per organizzare biblioteche, centri culturali o collezioni private con più persone al lavoro contemporaneamente.

---

## 🌟 Funzionalità Principali

1. **Scansione Continua da Telefono (iOS / Android)**:
   - Fotocamera posteriore sempre attiva con autofocus continuo e tasto torcia/flash.
   - Bip audio sintetizzato (senza dipendenze esterne) e feedback aptico a ogni lettura.
   - Validazione checksum ISBN-13 per ignorare codici a barre non librari.
   - Riconoscimento immediato di codici duplicati.

2. **Catalogazione Automatica & Dual API**:
   - **Kakao Daum Books**: Titolo Hangul, autore, traduttore, editore, data, prezzo, trama e copertina HD.
   - **Data4Library (도서관 정보나루)**: Assegna il codice KDC ufficiale (es. `813.8`) dalle collezioni bibliotecarie coreane.
   - **Formula Lee Jae-chul (이재철)**: Calcolo automatico della collocazione (청구기호) e del codice autore (저자기호, es. `김18ㄱ`).
   - **Etichette da Dorso**: Anteprima visiva e stampa immediata (formato standard 3x3 cm / 3.5x4.5 cm).
   - **Bypass CORS Trasparente**: Google Apps Script esegue da proxy server-side azzerando ogni blocco di rete del browser.

3. **Database Condiviso in Tempo Reale (Google Sheets)**:
   - Ogni libro scansionato viene inviato istantaneamente al foglio Google centrale protetto da LockService.
   - Più volontari possono scansionare contemporaneamente senza sovrascritture.
   - Ogni riga include operatore, data/ora, collocazione, KDC e metadati completi.

4. **Zero Perdita Dati (PWA Offline First)**:
   - Salvataggio istantaneo nella memoria locale del dispositivo (`localStorage`).
   - Coda di sincronizzazione outbox con riprova automatica se la connessione cade.
   - Installabile a schermo intero come vera app PWA su Android e iOS.

---

## 🚀 Configurazione Chiavi API

### 1. Kakao Daum Books API (Consigliata per i Metadati)
1. Registrati gratuitamente su [Kakao Developers](https://developers.kakao.com/).
2. Crea un'applicazione e copia la **REST API Key**.
3. Incollala nelle **Impostazioni** dell'app.

### 2. Data4Library API (Per il Codice KDC Ufficiale)
1. Registrati su [Data4Library (도서관 정보나루)](https://www.data4library.kr/).
2. Richiedi la chiave API gratuita (`authKey`).
3. Incollala nelle **Impostazioni** dell'app per l'assegnazione automatica del KDC.

### 3. Google Sheets (Database Condiviso)
1. Crea un nuovo foglio su [Google Sheets](https://sheets.new).
2. Apri **Estensioni** > **Apps Script** e incolla il file [`apps-script.gs`](./apps-script.gs).
3. Imposta una password in `TOKEN`.
4. Clicca **Distribuisci** > **Nuova distribuzione** > **Applicazione web** (Accesso: *Chiunque*).
5. Copia l'URL `/exec` nelle Impostazioni dell'app.

---

## 📖 Come Scansionare

1. Vai nella scheda **Scanner** e tocca **Avvia Camera**.
2. Concedi il permesso alla fotocamera.
3. Inquadra il codice a barre sul retro del libro coreano:
   - A ogni lettura sentirai un **bip** e il telefono vibrerà.
   - In background l'app interroga Kakao e Data4Library, calcola il codice Lee Jae-chul e invia i dati a Google Sheets.
4. Per consultare tutti i libri catalogati, tocca la scheda **Catalogo**:
   - Ricerca istantanea per titolo coreano, autore, codice KDC o ISBN.
   - Esportazione in **CSV** (con UTF-8 BOM per Excel) o backup JSON.
   - Visualizzazione e stampa dell'etichetta per il dorso del libro.
