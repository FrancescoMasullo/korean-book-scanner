# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Single-page application statica (HTML5, Vanilla JavaScript ES6+, CSS nativo con custom properties), Service Worker per caching offline (PWA) e Google Apps Script come backend serverless per persistenza e proxy CORS.

## Users

Operatori e volontari della Biblioteca Coreana di Torino incaricati della ricognizione e catalogazione a scaffale del patrimonio librario coreano, operanti direttamente tramite browser mobile (iOS Safari / Android Chrome) in ambiente di magazzino o sala lettura.

## Product Purpose

Automatizzare e velocizzare l'acquisizione inventariale dei volumi in lingua coreana mediante scansione continua del codice a barre ISBN-13, risoluzione automatizzata dei metadati commerciali e classificazione KDC con calcolo algoritmico della collocazione (청구기호) secondo gli standard biblioteconomici nazionali coreani. Il successo e misurato dall'assenza di attrito nel passaggio tra scansioni consecutive e dall'integrita dei dati archiviati.

## Positioning

Rispetto a software OPAC complessi o catalogatori generici occidentali (che non gestiscono l'ordinamento sillabico Hangul ne le tavole di conversione autore Lee Jae-chul), il sistema implementa la pipeline completa specifica per la biblioteconomia coreana: recupero duale Kakao / Data4Library e generazione deterministica della stringa di collocazione a 4 livelli, operando interamente da smartphone senza installazione di software proprietario.

## Operating Context

- Ambiente di lavoro: corridoi e scaffalature con connettivita di rete variabile o assente.
- Dispositivo: smartphone tenuto con una mano mentre l'altra manipola il volume fisico.
- Modalita operativa: scansione seriale continuativa (senza interruzione del sensore ottico tra un volume e il successivo).
- Flusso etichette: verifica visiva immediata della collocazione a schermo per ordinamento a scaffale e sincronizzazione dati su foglio centrale condiviso; stampa fisica demandata a fasi differite o facoltativa.

## Capabilities and Constraints

- Scansione: lettura barcode EAN-13 continuo con filtro di checksum algoritmico e debounce per prevenire duplicazioni accidentali.
- Metadati: integrazione asincrona con Kakao Daum Books (titolo Hangul, autore, editore, anno, copertina) e Data4Library (KDC class_no).
- Collocazione Lee Jae-chul (이재철): calcolo delle decine per sillaba iniziale del cognome, unita per consonante iniziale del nome e consonante del titolo.
- Resilienza dati: archiviazione atomica in localStorage con coda outbox FIFO; sincronizzazione asincrona verso Google Apps Script protetto da LockService per prevenire sovrascritture concorrenti.
- Vincoli tecnici: assenza di dipendenze runtime pesanti (zero framework SPA), compatibilita PWA standalone, supporto browser Safari iOS 16+ e Chrome Android 110+.

## Brand Commitments

- Denominazione: Korean Book Scanner - Sistema di Catalogazione e Collocazione KDC.
- Registro visivo e testuale: strettamente tecnico, documentario, neutrale, privo di elementi decorativi o figurativi.

## Evidence on Hand

- Specifiche di classificazione: Manuale di Catalogazione KDC 6. ed. della Biblioteca Coreana di Torino (tavola dei cognomi estesa, codici fonetici consonanti aspirate, struttura etichetta a 4 livelli).
- Chiave Data4Library attiva e integrata (authKey).
- REST API Key Kakao Books integrata.
- Backend Apps Script v2.2 deployato con LockService.

## Product Principles

1. Velocita di acquisizione prioritaria: il sensore ottico non deve mai bloccarsi ne richiedere conferme modali durante la scansione sequenziale.
2. Integrita biblioteconomica deterministica: il codice di collocazione deve rispettare rigorosamente la formula Lee Jae-chul senza approssimazioni non documentate.
3. Resilienza e continuita operativa: ogni operazione e persistita localmente prima di tentare la sincronizzazione remota; la caduta di connessione non interrompe il lavoro.
4. Chiarezza visiva ad alta densita: l'interfaccia deve privilegiare leggibilita tipografica, allineamento numerico tabulare e contrasto funzionale, escludendo qualsiasi orpello decorativo.

## Accessibility & Inclusion

- Rispetto delle preferenze di sistema per scala font (`rem`).
- Contrasto minimo WCAG AA (4.5:1 per testo normale, 3:1 per elementi grafici e stati interattivi).
- Feedback multimodale configurabile (segnale acustico sintetizzato e vibrazione aptica per conferma scansione).
- Contenimento dello scorrimento e focus management all'interno dei dialoghi modali.
