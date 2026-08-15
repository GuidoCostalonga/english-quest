/* =========================================================
   English Quest — contenuti didattici
   Ogni vocabolo: [inglese, italiano, emoji, frase EN?, frase IT?]
   ========================================================= */

var TOPICS = [
  { id:'people', name:'Famiglia e persone', icon:'👨‍👩‍👧', words:[
    ['family','famiglia','👨‍👩‍👧','My family is very big.','La mia famiglia è molto grande.'],
    ['mother','madre','👩'],
    ['father','padre','👨'],
    ['sister','sorella','👧','My sister is fourteen years old.','Mia sorella ha quattordici anni.'],
    ['brother','fratello','👦'],
    ['friend','amico','🤝','I meet my friend after school.','Incontro il mio amico dopo la scuola.'],
    ['boy','ragazzo','🧒'],
    ['girl','ragazza','👧'],
    ['child','bambino','🧸'],
    ['parents','genitori','👫'],
    ['grandmother','nonna','👵'],
    ['grandfather','nonno','👴'],
    ['cousin','cugino','🧑'],
    ['neighbour','vicino di casa','🏘️'],
    ['classmate','compagno di classe','🧑‍🎓','My classmate helps me with maths.','Il mio compagno di classe mi aiuta in matematica.']
  ]},

  { id:'school', name:'Scuola', icon:'🏫', words:[
    ['school','scuola','🏫','I go to school by bus.','Vado a scuola in autobus.'],
    ['teacher','insegnante','🧑‍🏫'],
    ['student','studente','🎓'],
    ['book','libro','📕','This book is really interesting.','Questo libro è davvero interessante.'],
    ['pen','penna','🖊️'],
    ['pencil','matita','✏️'],
    ['notebook','quaderno','📓'],
    ['desk','banco','🪑'],
    ['homework','compiti','📝','I do my homework in the afternoon.','Faccio i compiti nel pomeriggio.'],
    ['test','verifica','🧾'],
    ['lesson','lezione','📖'],
    ['break','intervallo','⏰'],
    ['maths','matematica','➗'],
    ['history','storia','🏺'],
    ['English','inglese','🇬🇧','English is my favourite subject.','L’inglese è la mia materia preferita.']
  ]},

  { id:'food', name:'Cibo e bevande', icon:'🍕', words:[
    ['bread','pane','🍞'],
    ['water','acqua','💧','Can I have some water, please?','Posso avere dell’acqua, per favore?'],
    ['milk','latte','🥛'],
    ['apple','mela','🍎','I eat an apple every morning.','Mangio una mela ogni mattina.'],
    ['cheese','formaggio','🧀'],
    ['chicken','pollo','🍗'],
    ['fish','pesce','🐟'],
    ['rice','riso','🍚'],
    ['cake','torta','🍰'],
    ['breakfast','colazione','🥐','I have breakfast at seven.','Faccio colazione alle sette.'],
    ['lunch','pranzo','🍽️'],
    ['dinner','cena','🌙'],
    ['sugar','zucchero','🍬'],
    ['vegetables','verdure','🥦'],
    ['juice','succo','🧃','This orange juice is very good.','Questo succo d’arancia è molto buono.']
  ]},

  { id:'house', name:'Casa', icon:'🏠', words:[
    ['house','casa','🏠','Our house has a small garden.','La nostra casa ha un piccolo giardino.'],
    ['room','stanza','🚪'],
    ['kitchen','cucina','🍳'],
    ['bedroom','camera da letto','🛏️','My bedroom is on the first floor.','La mia camera è al primo piano.'],
    ['bathroom','bagno','🛁'],
    ['door','porta','🚪'],
    ['window','finestra','🪟'],
    ['table','tavolo','🪑'],
    ['chair','sedia','💺'],
    ['bed','letto','🛌'],
    ['floor','pavimento','🧱'],
    ['garden','giardino','🌷'],
    ['key','chiave','🔑','I always lose my keys.','Perdo sempre le chiavi.'],
    ['wall','muro','🧱'],
    ['light','luce','💡']
  ]},

  { id:'clothes', name:'Vestiti', icon:'👕', words:[
    ['shirt','camicia','👔'],
    ['T-shirt','maglietta','👕','He wears a blue T-shirt.','Lui indossa una maglietta blu.'],
    ['trousers','pantaloni','👖'],
    ['jeans','jeans','👖'],
    ['shoes','scarpe','👟','These shoes are too small.','Queste scarpe sono troppo piccole.'],
    ['jacket','giacca','🧥'],
    ['coat','cappotto','🧥'],
    ['dress','vestito','👗'],
    ['skirt','gonna','👚'],
    ['hat','cappello','🎩'],
    ['socks','calzini','🧦'],
    ['scarf','sciarpa','🧣'],
    ['glasses','occhiali','👓'],
    ['bag','borsa','👜','Where is my school bag?','Dov’è il mio zaino di scuola?'],
    ['watch','orologio','⌚']
  ]},

  { id:'sport', name:'Sport e tempo libero', icon:'⚽', words:[
    ['football','calcio','⚽','We play football on Saturday.','Giochiamo a calcio il sabato.'],
    ['basketball','pallacanestro','🏀'],
    ['swimming','nuoto','🏊'],
    ['running','corsa','🏃'],
    ['bike','bicicletta','🚲','I go to school by bike.','Vado a scuola in bicicletta.'],
    ['game','gioco','🎮'],
    ['team','squadra','🧑‍🤝‍🧑'],
    ['match','partita','🥅'],
    ['music','musica','🎵','I listen to music every evening.','Ascolto musica ogni sera.'],
    ['guitar','chitarra','🎸'],
    ['film','film','🎬'],
    ['dance','ballo','💃'],
    ['party','festa','🎉'],
    ['holiday','vacanza','🏖️'],
    ['hobby','passatempo','🎨','My hobby is drawing.','Il mio passatempo è disegnare.']
  ]},

  { id:'feelings', name:'Sentimenti e aggettivi', icon:'😀', words:[
    ['happy','felice','😀','I am happy today.','Oggi sono felice.'],
    ['sad','triste','😢'],
    ['tired','stanco','😴','I am very tired after the match.','Sono molto stanco dopo la partita.'],
    ['angry','arrabbiato','😠'],
    ['scared','spaventato','😨'],
    ['bored','annoiato','🥱'],
    ['excited','entusiasta','🤩'],
    ['hungry','affamato','🍔'],
    ['thirsty','assetato','🥤'],
    ['big','grande','🐘'],
    ['small','piccolo','🐭'],
    ['easy','facile','👍','This exercise is easy for me.','Questo esercizio è facile per me.'],
    ['difficult','difficile','🧩'],
    ['funny','divertente','😂'],
    ['beautiful','bello','🌸','The sea is beautiful today.','Il mare è bello oggi.']
  ]},

  { id:'travel', name:'Viaggi e città', icon:'✈️', words:[
    ['city','città','🏙️','London is a very big city.','Londra è una città molto grande.'],
    ['street','strada','🛣️'],
    ['train','treno','🚆','The train leaves at six.','Il treno parte alle sei.'],
    ['bus','autobus','🚌'],
    ['plane','aereo','✈️'],
    ['car','automobile','🚗'],
    ['ticket','biglietto','🎫','I need two tickets, please.','Mi servono due biglietti, per favore.'],
    ['station','stazione','🚉'],
    ['airport','aeroporto','🛫'],
    ['hotel','albergo','🏨'],
    ['map','mappa','🗺️'],
    ['shop','negozio','🏪'],
    ['museum','museo','🏛️'],
    ['beach','spiaggia','🏖️','We go to the beach in summer.','Andiamo in spiaggia d’estate.'],
    ['bridge','ponte','🌉']
  ]},

  { id:'animals', name:'Animali e natura', icon:'🐶', words:[
    ['dog','cane','🐶','My dog sleeps on my bed.','Il mio cane dorme sul mio letto.'],
    ['cat','gatto','🐱'],
    ['horse','cavallo','🐴'],
    ['bird','uccello','🐦'],
    ['cow','mucca','🐮'],
    ['sheep','pecora','🐑'],
    ['mouse','topo','🐭'],
    ['tree','albero','🌳','There is a big tree in the garden.','C’è un grande albero in giardino.'],
    ['flower','fiore','🌼'],
    ['sea','mare','🌊'],
    ['mountain','montagna','⛰️'],
    ['river','fiume','🏞️'],
    ['rain','pioggia','🌧️','It is raining again.','Sta piovendo di nuovo.'],
    ['snow','neve','❄️'],
    ['sun','sole','☀️','The sun is very strong today.','Il sole è molto forte oggi.']
  ]},

  { id:'tech', name:'Tecnologia', icon:'💻', words:[
    ['phone','telefono','📱','My phone is always in my pocket.','Il mio telefono è sempre in tasca.'],
    ['computer','computer','💻'],
    ['screen','schermo','🖥️'],
    ['keyboard','tastiera','⌨️'],
    ['password','password','🔒'],
    ['message','messaggio','💬','I send a message to my friend.','Mando un messaggio al mio amico.'],
    ['picture','foto','📷'],
    ['video','video','📹'],
    ['game console','console','🎮'],
    ['headphones','cuffie','🎧'],
    ['charger','caricabatterie','🔌'],
    ['internet','internet','🌐','The internet is very slow today.','Internet è molto lento oggi.'],
    ['app','applicazione','📲'],
    ['file','file','📁'],
    ['battery','batteria','🔋','My battery is almost empty.','La mia batteria è quasi scarica.']
  ]}
];

/* Verbi irregolari: [base, past simple, past participle, italiano, frase EN?, frase IT?] */
var VERBS = [
  ['be','was / were','been','essere','I was at home yesterday.','Ieri ero a casa.'],
  ['go','went','gone','andare','We went to the cinema.','Siamo andati al cinema.'],
  ['have','had','had','avere','She had a good idea.','Lei ha avuto una buona idea.'],
  ['do','did','done','fare','I did my homework.','Ho fatto i compiti.'],
  ['say','said','said','dire'],
  ['get','got','got','ottenere / prendere'],
  ['make','made','made','fare / creare','He made a cake.','Ha fatto una torta.'],
  ['know','knew','known','sapere / conoscere'],
  ['think','thought','thought','pensare'],
  ['take','took','taken','prendere'],
  ['see','saw','seen','vedere','I saw a great film.','Ho visto un bel film.'],
  ['come','came','come','venire'],
  ['want','wanted','wanted','volere'],
  ['give','gave','given','dare'],
  ['find','found','found','trovare','She found her keys.','Ha trovato le sue chiavi.'],
  ['tell','told','told','raccontare'],
  ['become','became','become','diventare'],
  ['leave','left','left','partire / lasciare'],
  ['feel','felt','felt','sentire / provare'],
  ['put','put','put','mettere'],
  ['bring','brought','brought','portare'],
  ['begin','began','begun','cominciare'],
  ['keep','kept','kept','tenere'],
  ['write','wrote','written','scrivere','I wrote a message.','Ho scritto un messaggio.'],
  ['read','read','read','leggere'],
  ['run','ran','run','correre'],
  ['eat','ate','eaten','mangiare','We ate pizza last night.','Ieri sera abbiamo mangiato la pizza.'],
  ['drink','drank','drunk','bere'],
  ['sleep','slept','slept','dormire'],
  ['speak','spoke','spoken','parlare'],
  ['buy','bought','bought','comprare','I bought new shoes.','Ho comprato scarpe nuove.'],
  ['sell','sold','sold','vendere'],
  ['send','sent','sent','mandare'],
  ['meet','met','met','incontrare'],
  ['pay','paid','paid','pagare'],
  ['sit','sat','sat','sedersi'],
  ['stand','stood','stood','stare in piedi'],
  ['lose','lost','lost','perdere','He lost his phone.','Ha perso il telefono.'],
  ['win','won','won','vincere'],
  ['teach','taught','taught','insegnare'],
  ['catch','caught','caught','prendere / afferrare'],
  ['swim','swam','swum','nuotare'],
  ['fly','flew','flown','volare'],
  ['drive','drove','driven','guidare'],
  ['wear','wore','worn','indossare']
];

/* Frasi utili: gruppi di situazioni */
var PHRASES = [
  { id:'intro', name:'Presentarsi', icon:'🙋', items:[
    ['Hello, my name is Marco.','Ciao, mi chiamo Marco.'],
    ['Nice to meet you.','Piacere di conoscerti.'],
    ['How are you today?','Come stai oggi?'],
    ['I am fine, thank you.','Sto bene, grazie.'],
    ['I am fifteen years old.','Ho quindici anni.'],
    ['I live in Italy.','Vivo in Italia.'],
    ['I have got a sister.','Ho una sorella.'],
    ['This is my friend Luca.','Questo è il mio amico Luca.'],
    ['See you tomorrow!','Ci vediamo domani!'],
    ['Have a nice day!','Buona giornata!']
  ]},
  { id:'school_ph', name:'A scuola', icon:'🏫', items:[
    ['Can you repeat, please?','Puoi ripetere, per favore?'],
    ['I do not understand.','Non capisco.'],
    ['How do you spell it?','Come si scrive?'],
    ['What does it mean?','Che cosa significa?'],
    ['Can I go to the toilet?','Posso andare in bagno?'],
    ['I forgot my notebook.','Ho dimenticato il quaderno.'],
    ['What is the homework?','Quali sono i compiti?'],
    ['Can you help me, please?','Puoi aiutarmi, per favore?'],
    ['I am ready.','Sono pronto.'],
    ['Sorry, I am late.','Scusa, sono in ritardo.']
  ]},
  { id:'cafe', name:'Al bar e al ristorante', icon:'🥤', items:[
    ['A table for two, please.','Un tavolo per due, per favore.'],
    ['Can I see the menu?','Posso vedere il menù?'],
    ['I would like a sandwich.','Vorrei un panino.'],
    ['A glass of water, please.','Un bicchiere d’acqua, per favore.'],
    ['How much is it?','Quanto costa?'],
    ['Can I pay by card?','Posso pagare con la carta?'],
    ['It is delicious!','È buonissimo!'],
    ['I am allergic to milk.','Sono allergico al latte.'],
    ['The bill, please.','Il conto, per favore.'],
    ['Thank you very much.','Grazie mille.']
  ]},
  { id:'ask', name:'Chiedere informazioni', icon:'🧭', items:[
    ['Excuse me, where is the station?','Scusi, dov’è la stazione?'],
    ['How can I get to the museum?','Come posso arrivare al museo?'],
    ['Is it far from here?','È lontano da qui?'],
    ['Turn left at the traffic lights.','Gira a sinistra al semaforo.'],
    ['Go straight on.','Vai sempre dritto.'],
    ['What time does it open?','A che ora apre?'],
    ['I am looking for this address.','Sto cercando questo indirizzo.'],
    ['Can you show me on the map?','Puoi mostrarmelo sulla mappa?'],
    ['I think I am lost.','Credo di essermi perso.'],
    ['Thanks for your help.','Grazie per l’aiuto.']
  ]},
  { id:'online', name:'Al telefono e in chat', icon:'📱', items:[
    ['Hi, how is it going?','Ciao, come va?'],
    ['Sorry, I cannot hear you.','Scusa, non ti sento.'],
    ['Can you call me later?','Puoi chiamarmi più tardi?'],
    ['I will send you a message.','Ti mando un messaggio.'],
    ['What are you doing now?','Cosa stai facendo adesso?'],
    ['I am busy at the moment.','Sono occupato in questo momento.'],
    ['Let us meet at six.','Vediamoci alle sei.'],
    ['My battery is low.','Ho la batteria scarica.'],
    ['Talk to you soon.','A presto.'],
    ['Good night!','Buonanotte!']
  ]}
];

/* Grammatica: spiegazione animata + quiz + frasi da costruire */
var GRAMMAR = [
  { id:'g_present', title:'Present Simple', icon:'⏱️',
    sub:'Le cose che fai sempre, di solito, ogni giorno',
    slides:[
      { h:'Quando si usa', p:'Per le abitudini e le cose che sono sempre vere.', tag:'a cosa serve',
        ex:[['I play football every Saturday.','Gioco a calcio ogni sabato.'],['She lives in Rome.','Lei vive a Roma.']] },
      { h:'La regola d’oro', p:'Con he, she, it il verbo prende una -s finale. Con gli altri resta uguale.', tag:'regola',
        ex:[['I work → He works','Io lavoro → Lui lavora'],['We eat → She eats','Noi mangiamo → Lei mangia']] },
      { h:'Frasi negative', p:'Si usa don’t, oppure doesn’t con he, she, it. Il verbo torna alla forma base.', tag:'negativo',
        ex:[['I do not like coffee.','Non mi piace il caffè.'],['He does not play tennis.','Lui non gioca a tennis.']] },
      { h:'Domande', p:'Si comincia con Do o Does.', tag:'domanda',
        ex:[['Do you speak English?','Parli inglese?'],['Does she live here?','Lei vive qui?']] }
    ],
    quiz:[
      { q:'She ___ to school by bus.', opts:['go','goes','going'], a:1, why:'Con she il verbo prende la -s: goes.' },
      { q:'They ___ football every weekend.', opts:['plays','play','playing'], a:1, why:'Con they il verbo resta alla forma base: play.' },
      { q:'He ___ like vegetables.', opts:['don’t','doesn’t','not'], a:1, why:'Con he la negazione è doesn’t.' },
      { q:'___ you speak Italian?', opts:['Do','Does','Are'], a:0, why:'Con you la domanda comincia con Do.' },
      { q:'My father ___ in a bank.', opts:['work','works','working'], a:1, why:'My father = he, quindi works.' },
      { q:'We ___ TV in the evening.', opts:['watches','watch','watching'], a:1, why:'Con we il verbo resta base: watch.' }
    ],
    build:[
      ['She goes to school every day.','Lei va a scuola ogni giorno.'],
      ['I do not like coffee.','Non mi piace il caffè.'],
      ['Do you play the guitar?','Suoni la chitarra?']
    ] },

  { id:'g_continuous', title:'Present Continuous', icon:'🎬',
    sub:'Quello che sta succedendo proprio adesso',
    slides:[
      { h:'Quando si usa', p:'Per le azioni in corso in questo momento.', tag:'a cosa serve',
        ex:[['I am eating a pizza.','Sto mangiando una pizza.'],['They are playing outside.','Stanno giocando fuori.']] },
      { h:'Come si forma', p:'am / is / are + verbo con -ing.', tag:'regola',
        ex:[['I am reading.','Sto leggendo.'],['He is running.','Sta correndo.']] },
      { h:'Negativo e domanda', p:'La negazione va sul verbo essere. Nella domanda il verbo essere passa davanti.', tag:'regola',
        ex:[['She is not sleeping.','Lei non sta dormendo.'],['Are you listening?','Stai ascoltando?']] }
    ],
    quiz:[
      { q:'I ___ my homework right now.', opts:['do','am doing','does'], a:1, why:'Azione in corso adesso: am doing.' },
      { q:'They ___ football at the moment.', opts:['are playing','play','is playing'], a:0, why:'Con they si usa are + playing.' },
      { q:'Look! It ___.', opts:['rains','is raining','raining'], a:1, why:'Sta piovendo proprio ora: is raining.' },
      { q:'___ you listening to me?', opts:['Do','Are','Is'], a:1, why:'Con you il verbo essere è are.' },
      { q:'She ___ a blue jacket today.', opts:['is wearing','wear','wears'], a:0, why:'Adesso, in questo momento: is wearing.' },
      { q:'We ___ not watching TV.', opts:['do','are','is'], a:1, why:'Con we si usa are not.' }
    ],
    build:[
      ['I am doing my homework now.','Sto facendo i compiti adesso.'],
      ['They are playing in the garden.','Stanno giocando in giardino.'],
      ['Are you listening to me?','Mi stai ascoltando?']
    ] },

  { id:'g_past', title:'Past Simple', icon:'⏪',
    sub:'Quello che è successo e ormai è finito',
    slides:[
      { h:'Quando si usa', p:'Per fatti conclusi nel passato: ieri, la settimana scorsa, nel 2020.', tag:'a cosa serve',
        ex:[['I watched a film yesterday.','Ieri ho guardato un film.'],['We went to London last year.','L’anno scorso siamo andati a Londra.']] },
      { h:'Verbi regolari', p:'Si aggiunge -ed alla forma base. Vale per tutte le persone.', tag:'regola',
        ex:[['play → played','giocare → giocato'],['watch → watched','guardare → guardato']] },
      { h:'Verbi irregolari', p:'Hanno una forma tutta loro: bisogna impararla a memoria.', tag:'attenzione',
        ex:[['go → went','andare → andato'],['eat → ate','mangiare → mangiato']] },
      { h:'Negativo e domanda', p:'Si usa did not (didn’t) o Did, e il verbo torna alla forma base.', tag:'regola',
        ex:[['I did not go out.','Non sono uscito.'],['Did you see him?','L’hai visto?']] }
    ],
    quiz:[
      { q:'Yesterday I ___ a great film.', opts:['see','saw','seen'], a:1, why:'Past simple di see: saw.' },
      { q:'We ___ football last Sunday.', opts:['played','play','playing'], a:0, why:'Verbo regolare: play + ed.' },
      { q:'She ___ to Paris in 2023.', opts:['goes','went','going'], a:1, why:'Past simple di go: went.' },
      { q:'They ___ not come to the party.', opts:['do','did','does'], a:1, why:'Nel passato la negazione è did not.' },
      { q:'___ you eat the cake?', opts:['Did','Do','Does'], a:0, why:'Domanda al passato: Did.' },
      { q:'He ___ his phone at school.', opts:['loses','lost','losing'], a:1, why:'Past simple di lose: lost.' }
    ],
    build:[
      ['I watched a film yesterday.','Ieri ho guardato un film.'],
      ['She went to the beach.','Lei è andata in spiaggia.'],
      ['Did you see my keys?','Hai visto le mie chiavi?']
    ] },

  { id:'g_future', title:'Il futuro: will e going to', icon:'🚀',
    sub:'Quello che succederà o che hai già deciso di fare',
    slides:[
      { h:'will', p:'Per decisioni prese sul momento e previsioni. Dopo will il verbo resta base.', tag:'regola',
        ex:[['I will help you.','Ti aiuto io.'],['It will rain tomorrow.','Domani pioverà.']] },
      { h:'going to', p:'Per i piani già decisi e per quello che si vede già arrivare.', tag:'regola',
        ex:[['I am going to study tonight.','Stasera studierò.'],['They are going to move house.','Stanno per traslocare.']] },
      { h:'Come sceglierlo', p:'Se l’hai deciso prima usa going to; se decidi mentre parli usa will.', tag:'trucco',
        ex:[['The phone is ringing. I will answer.','Squilla il telefono. Rispondo io.'],['We are going to travel in July.','A luglio viaggeremo.']] }
    ],
    quiz:[
      { q:'I think it ___ rain tomorrow.', opts:['will','is going','goes'], a:0, why:'Previsione: will + verbo base.' },
      { q:'We ___ going to visit London.', opts:['am','are','is'], a:1, why:'Con we il verbo essere è are.' },
      { q:'The bag is heavy. I ___ help you.', opts:['am going to','will','would'], a:1, why:'Decisione presa adesso: will.' },
      { q:'She ___ to buy a new phone next week.', opts:['is going','will going','goes'], a:0, why:'Piano già deciso: is going to.' },
      { q:'They will ___ at the party.', opts:['to be','be','being'], a:1, why:'Dopo will il verbo resta base: be.' },
      { q:'___ you help me, please?', opts:['Will','Are','Do'], a:0, why:'Richiesta cortese con Will.' }
    ],
    build:[
      ['I will help you tomorrow.','Ti aiuterò domani.'],
      ['We are going to visit London.','Andremo a visitare Londra.'],
      ['It will rain in the evening.','Pioverà in serata.']
    ] }
];

/* =========================================================
   Costruzione dell'indice degli elementi e dei livelli
   ========================================================= */

var ITEMS = {};   // id -> oggetto normalizzato
var POOLS = {};   // pool -> array di id (per generare i distrattori)

function addItem(o){ ITEMS[o.id] = o; (POOLS[o.pool] = POOLS[o.pool] || []).push(o.id); return o.id; }
function slug(s){ return String(s).toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,''); }

TOPICS.forEach(function(t){
  t.ids = t.words.map(function(w){
    return addItem({
      id:'w_' + t.id + '_' + slug(w[0]),
      kind:'word', pool:'word',
      en:w[0], it:w[1], emoji:w[2] || '📘',
      exEn:w[3] || '', exIt:w[4] || '',
      topic:t.id, topicName:t.name
    });
  });
});

var VERB_IDS = VERBS.map(function(v){
  return addItem({
    id:'v_' + slug(v[0]),
    kind:'verb', pool:'verb',
    en:v[0], it:v[3], emoji:'🔤',
    past:v[1], pp:v[2],
    exEn:v[4] || '', exIt:v[5] || '',
    topic:'verbs', topicName:'Verbi irregolari'
  });
});

PHRASES.forEach(function(g){
  g.ids = g.items.map(function(p){
    return addItem({
      id:'p_' + g.id + '_' + slug(p[0]).slice(0,26),
      kind:'phrase', pool:'phrase_' + g.id,
      en:p[0], it:p[1], emoji:g.icon,
      exEn:p[0], exIt:p[1],
      topic:g.id, topicName:g.name
    });
  });
});

GRAMMAR.forEach(function(g){
  g.quizIds = g.quiz.map(function(q, i){
    return addItem({
      id:g.id + '_q' + i,
      kind:'gram', pool:'gram_' + g.id,
      en:q.q.replace('___', q.opts[q.a]), it:q.why,
      emoji:g.icon, q:q.q, opts:q.opts, a:q.a, why:q.why,
      topic:g.id, topicName:g.title
    });
  });
  g.buildIds = g.build.map(function(b, i){
    return addItem({
      id:g.id + '_b' + i,
      kind:'gsent', pool:'gsent_' + g.id,
      en:b[0], it:b[1], emoji:g.icon, exEn:b[0], exIt:b[1],
      topic:g.id, topicName:g.title
    });
  });
});

/* ---- Livelli, raggruppati in unità ---- */
function topicLevels(topicId){
  var t = TOPICS.filter(function(x){ return x.id === topicId; })[0];
  var half = Math.ceil(t.ids.length / 2);
  return [
    { id:'l_' + t.id + '_1', name:t.name + ' 1', icon:t.icon, type:'vocab', ids:t.ids.slice(0, half) },
    { id:'l_' + t.id + '_2', name:t.name + ' 2', icon:t.icon, type:'vocab', ids:t.ids.slice(half) }
  ];
}
function grammarLevel(gid){
  var g = GRAMMAR.filter(function(x){ return x.id === gid; })[0];
  return { id:'l_' + gid, name:g.title, icon:g.icon, type:'grammar', gram:g.id,
           ids:g.quizIds.concat(g.buildIds) };
}
function phraseLevel(pid){
  var g = PHRASES.filter(function(x){ return x.id === pid; })[0];
  return { id:'l_' + pid, name:g.name, icon:g.icon, type:'phrase', ids:g.ids };
}
function verbLevel(n, from, to){
  return { id:'l_verbs_' + n, name:'Verbi irregolari ' + n, icon:'🔤', type:'verb',
           ids:VERB_IDS.slice(from, to) };
}
function challenge(id, name, poolLevels){
  return { id:'l_ch_' + id, name:name, icon:'🏅', type:'challenge', from:poolLevels };
}

var UNITS = [
  { name:'Si comincia', sub:'Persone, scuola e il presente', color:'brand', levels:
    [].concat(topicLevels('people'), topicLevels('school'), [grammarLevel('g_present')],
      [challenge('1','Sfida dell’unità 1', ['l_people_1','l_people_2','l_school_1','l_school_2','l_g_present'])]) },

  { name:'Vita di tutti i giorni', sub:'Cibo, casa e le azioni in corso', color:'accent', levels:
    [].concat(topicLevels('food'), topicLevels('house'), [grammarLevel('g_continuous')],
      [challenge('2','Sfida dell’unità 2', ['l_food_1','l_food_2','l_house_1','l_house_2','l_g_continuous'])]) },

  { name:'Io e gli altri', sub:'Vestiti, sport, emozioni e prime frasi', color:'ok', levels:
    [].concat(topicLevels('clothes'), topicLevels('sport'), topicLevels('feelings'),
      [phraseLevel('intro'), phraseLevel('school_ph')],
      [challenge('3','Sfida dell’unità 3', ['l_clothes_1','l_sport_1','l_feelings_1','l_intro','l_school_ph'])]) },

  { name:'Fuori casa', sub:'Viaggi, natura, tecnologia e frasi utili', color:'brand', levels:
    [].concat(topicLevels('travel'), topicLevels('animals'), topicLevels('tech'),
      [phraseLevel('cafe'), phraseLevel('ask')],
      [challenge('4','Sfida dell’unità 4', ['l_travel_1','l_animals_1','l_tech_1','l_cafe','l_ask'])]) },

  { name:'Parlare del passato', sub:'I verbi irregolari e il past simple', color:'accent', levels:
    [ verbLevel(1, 0, 15), verbLevel(2, 15, 30), verbLevel(3, 30, 45),
      grammarLevel('g_past'), phraseLevel('online'),
      challenge('5','Sfida dell’unità 5', ['l_verbs_1','l_verbs_2','l_verbs_3','l_g_past','l_online']) ] },

  { name:'Guardare avanti', sub:'Il futuro e la prova finale', color:'ok', levels:
    [ grammarLevel('g_future'),
      challenge('final','Prova finale', ['l_people_1','l_food_1','l_travel_1','l_verbs_1','l_verbs_2','l_g_past','l_g_future','l_intro','l_cafe','l_tech_2']) ] }
];

var LEVELS = [];
UNITS.forEach(function(u){ u.levels.forEach(function(l){ l.unit = u.name; LEVELS.push(l); }); });
var LEVEL_BY_ID = {};
LEVELS.forEach(function(l, i){ l.index = i; LEVEL_BY_ID[l.id] = l; });

/* le sfide raccolgono gli id dei livelli indicati */
LEVELS.forEach(function(l){
  if(l.type === 'challenge'){
    var ids = [];
    l.from.forEach(function(lid){
      var src = LEVEL_BY_ID[lid];
      if(src && src.ids) ids = ids.concat(src.ids);
    });
    l.ids = ids;
  }
});
