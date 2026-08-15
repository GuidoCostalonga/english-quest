# English Quest — sorgenti

Il programma è `../index.html`: un unico file autonomo (~421 KB) che funziona
senza internet, su computer e su iPhone. Questa cartella serve solo per modificarlo.
Ogni compilazione ne scrive due copie identiche: `../index.html` (quella pubblicata
su GitHub Pages) e `C:\Users\guido\berlino\english-quest.html` (quella comoda da spedire).

## Come è fatto

| file | contenuto |
|---|---|
| `p1-head.html` | intestazione, meta per iPhone, tutto il CSS (temi, componenti, animazioni) |
| `p2-body.html` | struttura delle schermate, pannello impostazioni, avviso per l'anteprima di iPhone |
| `p3-data.js` | i contenuti: 150 vocaboli, 45 verbi irregolari, 50 frasi, 4 lezioni di grammatica, unità e livelli |
| `p4-app.js` | il motore: sessioni, ripetizione spaziata, sintesi vocale, coriandoli, salvataggio |
| `font.css` | OpenDyslexic in base64 (estratto da `dsa-study-coach.html`) |

## Comandi

Serve Node (`C:\Program Files\nodejs`, non sempre nel PATH).

```bash
node src/build.js       # ricostruisce index.html + english-quest.html
node src/test.js        # 60 controlli su jsdom: avvio, mappa, una partita intera, errori, ripasso, impostazioni, riavvio
node src/test-ios.js    # 11 controlli iPhone: avviso anteprima, tocco senza Pointer Events
node src/test-all.js    # gioca tutti i 38 livelli due volte (risposte giuste e a caso)
node src/serve.js       # server locale su http://localhost:8123 (serve per provare il salvataggio dei progressi)
node src/build-artifact.js percorso.html   # variante senza <html>/<head>/<body>, per la pubblicazione su claude.ai
```

Dopo ogni modifica: ricostruire e rilanciare i tre test. Il file `index.html`
non va mai modificato a mano, contiene il font su una riga da 160 KB.

## Aggiungere contenuti

In `p3-data.js`, dentro `TOPICS`, ogni parola è
`['inglese', 'italiano', 'emoji', 'frase EN (facoltativa)', 'frase IT (facoltativa)']`.
Le parole con la frase finiscono anche negli esercizi di composizione.
I livelli si generano da soli: due per argomento.

## Note su iPhone

- Un file `.html` aperto da Mail, WhatsApp o File finisce nell'**anteprima rapida**,
  che non esegue JavaScript: l'app se ne accorge e mostra un avviso al posto della mappa.
  Su iOS non esiste modo di aprire un file locale in Safari: serve l'indirizzo web.
- Con `file://` Safari blocca `localStorage`: l'app lo rileva, avvisa e offre esporta/importa.
- Niente `color-mix` senza colore di riserva (iOS lo conosce dalla 16.2) e niente
  `var()` dentro gli attributi SVG (Safari li ignora): i colori del robot passano dal CSS.
