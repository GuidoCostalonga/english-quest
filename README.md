# English Quest

Impara l'inglese giocando. Un percorso a livelli per ragazzi dai 13 ai 19 anni,
pensato fin dall'inizio per chi ha un disturbo specifico dell'apprendimento:
**tutto si può ascoltare**, il carattere ad alta leggibilità è già incluso e
i colori, la dimensione del testo e la spaziatura si regolano in due tocchi.

👉 **[Apri English Quest](https://ginopizza.github.io/english-quest/)**

Su iPhone e iPad: apri il link in Safari, poi **Condividi → Aggiungi a Home** e
resta come un'app. Funziona anche senza connessione dopo la prima apertura del file.

## Cosa contiene

- **150 vocaboli** in 10 argomenti: famiglia, scuola, cibo, casa, vestiti, sport, sentimenti, viaggi, animali, tecnologia
- **45 verbi irregolari** con le tre forme
- **50 frasi utili** per presentarsi, a scuola, al bar, per chiedere informazioni, al telefono
- **4 lezioni di grammatica**: present simple, present continuous, past simple, futuro con *will* e *going to*
- **38 livelli** in 6 unità, con una sfida alla fine di ogni unità

## Come funziona

Quattro tipi di esercizio: flashcard che si girano, quiz a scelta multipla
(inglese→italiano, italiano→inglese e di solo ascolto), frasi da ricomporre
spostando le parole, schede di grammatica con esempi da ascoltare.

Le parole sbagliate tornano subito; quelle sapute tornano dopo 1, 2, 4, 8, 16 e 32
giorni. Ogni risposta giusta vale 10 XP e allenarsi ogni giorno fa crescere la fiamma 🔥.
Nessuna vita da perdere: sbagliare non interrompe mai la lezione.

## Accessibilità

- **OpenDyslexic** incorporato (nessuna connessione necessaria), con Verdana e il carattere di sistema come alternative
- sfondo crema al posto del bianco, più i temi **Notte** e **Alto contrasto**
- cursori per dimensione del testo, spazio tra le lettere e tra le righe
- **sintesi vocale su ogni parola e frase**, con velocità regolabile e voce inglese a scelta; tenendo premuto l'altoparlante la pronuncia rallenta
- animazioni disattivabili, zoom mai bloccato, bersagli da 44 px

## Privacy

Non raccoglie niente e non chiama nessun server. I progressi restano nel browser
di chi gioca e si possono esportare o reimportare come file.

## Modificare i contenuti

Tutto sta in `index.html`, un unico file da ~420 KB. Non va modificato a mano
(contiene il font in base64 su una riga sola): si lavora sui pezzi in `src/`.

```bash
node src/build.js      # ricostruisce index.html
node src/test.js       # 60 controlli: avvio, una partita intera, ripasso, riavvio
node src/test-ios.js   # 11 controlli specifici per iPhone
node src/test-all.js   # gioca tutti i 38 livelli due volte
node src/serve.js      # prova in locale su http://localhost:8123
```

Per aggiungere vocaboli si apre `src/p3-data.js`: ogni parola è
`['inglese', 'italiano', 'emoji', 'frase EN (facoltativa)', 'frase IT (facoltativa)']`.
I livelli si generano da soli. Dettagli in [`src/LEGGIMI.md`](src/LEGGIMI.md).

## Licenza

Il codice e i contenuti didattici sono rilasciati sotto **licenza MIT**
([`LICENSE`](LICENSE)): usali, modificali e ridistribuiscili pure, anche a scuola
o in un altro progetto, tenendo la nota di copyright.

Attenzione a una cosa: `index.html` **incorpora il carattere OpenDyslexic**
di Abbie Gonzalez, che ha una licenza propria — SIL Open Font License 1.1,
testo in [`OFL-OpenDyslexic.txt`](OFL-OpenDyslexic.txt). Chi ridistribuisce
`index.html` ridistribuisce anche il carattere, quindi le due licenze viaggiano
insieme: i dettagli sono in [`NOTICE.md`](NOTICE.md).
