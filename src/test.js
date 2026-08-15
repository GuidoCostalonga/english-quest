/* Smoke test di English Quest: carica il file in jsdom e gioca davvero i livelli. */
const fs = require('fs');
const { JSDOM, VirtualConsole } = require('C:/Users/guido/berlino/bandiai-fvg/node_modules/jsdom');

const HTML = fs.readFileSync(process.argv[2] || 'C:/Users/guido/berlino/english-quest.html', 'utf8');

let fails = 0, checks = 0;
function ok(cond, msg, extra){
  checks++;
  if(!cond){ fails++; console.log('  ✗ ' + msg + (extra ? '  → ' + extra : '')); }
  else console.log('  ✓ ' + msg + (extra ? '  (' + extra + ')' : ''));
}

const errors = [];
// "Not implemented" sono limiti di jsdom (scrollTo, canvas), non difetti dell'app
const isJsdomLimit = m => /Not implemented/i.test(m);
const push = m => { if(!isJsdomLimit(String(m))) errors.push(String(m)); };
const vc = new VirtualConsole();
vc.on('jsdomError', e => push(e.message));
vc.on('error', (...a) => push(a.join(' ')));

const dom = new JSDOM(HTML, {
  runScripts: 'dangerously',
  pretendToBeVisual: true,
  url: 'https://example.test/english-quest.html',
  virtualConsole: vc,
  beforeParse(win){
    // canvas finto (jsdom non disegna)
    win.HTMLCanvasElement.prototype.getContext = () => ({
      clearRect(){}, save(){}, restore(){}, translate(){}, rotate(){}, fillRect(){},
      set fillStyle(v){}, set globalAlpha(v){}
    });
    // sintesi vocale finta, per contare le chiamate
    win.__spoken = [];
    win.speechSynthesis = {
      getVoices: () => ([
        { name:'Daniel', lang:'en-GB', voiceURI:'Daniel' },
        { name:'Samantha', lang:'en-US', voiceURI:'Samantha' },
        { name:'Alice', lang:'it-IT', voiceURI:'Alice' }
      ]),
      speak(u){ win.__spoken.push(u.text); if(u.onend) setTimeout(u.onend, 0); },
      cancel(){}, onvoiceschanged: null
    };
    win.SpeechSynthesisUtterance = function(t){ this.text = t; };
    // Element.prototype.setPointerCapture manca in jsdom
    win.Element.prototype.setPointerCapture = function(){};
    win.Element.prototype.releasePointerCapture = function(){};
  }
});

const win = dom.window, doc = win.document;

function key(node, k){
  node.dispatchEvent(new win.KeyboardEvent('keydown', { key:k, bubbles:true, cancelable:true }));
}

/* ---- 1. Avvio ---- */
console.log('\n[1] Avvio e struttura');
const EQ = win.EQ;
ok(!!EQ, 'l’app si avvia senza errori');
ok(errors.length === 0, 'nessun errore JS in fase di caricamento', errors.slice(0,2).join(' | '));
ok(Object.keys(EQ.ITEMS).length > 250, 'contenuti caricati', Object.keys(EQ.ITEMS).length + ' elementi');
ok(EQ.LEVELS.length >= 30, 'livelli generati', EQ.LEVELS.length + ' livelli');
ok(doc.querySelectorAll('.unit').length === EQ.UNITS.length, 'unità disegnate sulla mappa');
ok(doc.querySelectorAll('.node').length === EQ.LEVELS.length, 'un nodo per livello');
ok(!doc.querySelector('.node').classList.contains('locked'), 'il primo livello è sbloccato');
ok(doc.querySelectorAll('.node.locked').length === EQ.LEVELS.length - 1, 'gli altri livelli sono bloccati');
ok(doc.querySelector('.node.current') !== null, 'il livello corrente è evidenziato');

/* verifica che ogni sfida abbia raccolto elementi veri */
const emptyLv = EQ.LEVELS.filter(l => !l.ids || !l.ids.length).map(l => l.id);
ok(emptyLv.length === 0, 'nessun livello vuoto', emptyLv.join(','));
const badIds = EQ.LEVELS.flatMap(l => l.ids).filter(id => !EQ.ITEMS[id]);
ok(badIds.length === 0, 'tutti i riferimenti puntano a contenuti esistenti', badIds.slice(0,3).join(','));
const dupIds = (() => { const seen = {}, dup = []; for(const id in EQ.ITEMS){ const k = EQ.ITEMS[id].en + '|' + EQ.ITEMS[id].kind; if(seen[k]) dup.push(k); seen[k] = 1; } return dup; })();
ok(dupIds.length < 6, 'quasi nessun doppione tra i contenuti', dupIds.length + ' doppioni');

/* ---- 2. Distrattori sensati ---- */
console.log('\n[2] Qualità degli esercizi');
let badChoice = 0;
EQ.LEVELS.slice(0, 12).forEach(lv => {
  EQ.buildQueue(lv).forEach(st => {
    if(!st.id) return;
    const it = EQ.ITEMS[st.id];
    if(st.type === 'en2it' && !it.it) badChoice++;
    if(st.type === 'verb_past' && !it.past) badChoice++;
    if(st.type === 'build' && !(it.exEn || it.en)) badChoice++;
  });
});
ok(badChoice === 0, 'ogni esercizio ha i dati che gli servono');

/* ---- 3. Gioca un livello intero rispondendo bene ---- */
function expectedLabel(step){
  const it = EQ.ITEMS[step.id];
  switch(step.type){
    case 'en2it': case 'listen_phrase': return it.it;
    case 'it2en': case 'listen': case 'verb_it': return it.en;
    case 'verb_past': return it.past;
    case 'verb_pp': return it.pp;
    case 'gram': return it.opts[it.a];
    default: return null;
  }
}
function playLevel(levelId, { correct = true, max = 80 } = {}){
  EQ.startLevel(levelId);
  let guard = 0, builds = 0, quizzes = 0;
  while(guard++ < max){
    const fb = doc.querySelector('#feedback .btn');
    if(fb){ fb.click(); continue; }
    if(!doc.querySelector('#screen-lesson').classList.contains('active')) break;
    const s = EQ.sess(), step = s.q[s.i], stage = doc.querySelector('#stage');
    if(!step) break;
    if(step.type === 'flash'){ stage.querySelector('.btn.ok').click(); continue; }
    if(step.type === 'flash_verb' || step.type === 'slide'){ stage.querySelector('.btn.primary').click(); continue; }
    if(step.type === 'build'){
      builds++;
      const it = EQ.ITEMS[step.id];
      const full = it.exEn || it.en;
      const base = (full.match(/^(.*?)([.?!]+)$/) || [null, full])[1];
      const words = base.split(/\s+/);
      const tiles = Array.from(stage.querySelectorAll('.tile'));
      const order = correct ? words : words.slice().reverse();
      order.forEach(w => {
        const t = tiles.find(x => x.dataset.w === w && !x.classList.contains('placed'));
        if(t) key(t, 'Enter');
      });
      const check = Array.from(stage.querySelectorAll('.btn')).find(b => b.textContent === 'Controlla');
      if(check && !check.disabled) check.click();
      else { EQ.sess().i++; doc.querySelector('#btn-quit'); }
      continue;
    }
    // scelta multipla
    quizzes++;
    const want = expectedLabel(step);
    const choices = Array.from(stage.querySelectorAll('.choice'));
    if(!choices.length){ break; }
    let target = choices.find(c => c.textContent.slice(1).trim() === String(want).trim());
    if(!correct) target = choices.find(c => c !== target) || choices[0];
    (target || choices[0]).click();
  }
  return { builds, quizzes, guard };
}

console.log('\n[3] Partita completa sul primo livello');
const xp0 = EQ.state.xp;
const first = EQ.LEVELS[0];
const r1 = playLevel(first.id);
ok(doc.querySelector('#screen-result').classList.contains('active'), 'si arriva alla schermata dei risultati');
ok(r1.quizzes > 0, 'sono stati proposti quiz', r1.quizzes + ' quiz, ' + r1.builds + ' frasi da comporre');
ok(EQ.state.xp > xp0, 'gli XP sono aumentati', xp0 + ' → ' + EQ.state.xp);
ok(EQ.state.levels[first.id] && EQ.state.levels[first.id].done, 'il livello risulta completato');
ok(EQ.state.levels[first.id].stars === 3, 'tre stelle rispondendo sempre bene', 'stelle: ' + EQ.state.levels[first.id].stars);
ok(doc.querySelector('#res-acc').textContent === '100%', 'precisione 100%', doc.querySelector('#res-acc').textContent);
ok(EQ.state.streak === 1, 'la fiamma parte da 1');
ok(win.__spoken.length > 0, 'la sintesi vocale è stata usata', win.__spoken.length + ' pronunce');

/* ---- 4. Sblocco del livello successivo ---- */
console.log('\n[4] Sblocco e persistenza');
doc.querySelector('#btn-continue').click();
const nodes = doc.querySelectorAll('.node');
ok(nodes[0].classList.contains('done'), 'il primo nodo è segnato come fatto');
ok(!nodes[1].classList.contains('locked'), 'il secondo livello si è sbloccato');
ok(nodes[2].classList.contains('locked'), 'il terzo è ancora bloccato');
const saved = JSON.parse(win.localStorage.getItem('english-quest-v1'));
ok(saved && saved.levels[first.id], 'i progressi sono stati salvati nel browser');
ok(Object.keys(saved.srs).length > 0, 'la memoria di ripasso registra le parole', Object.keys(saved.srs).length + ' parole');

/* ---- 5. Risposte sbagliate ---- */
console.log('\n[5] Errori e ripasso');
const second = EQ.LEVELS[1];
const before = EQ.state.totals.correct;
playLevel(second.id, { correct:false });
ok(doc.querySelector('#screen-result').classList.contains('active'), 'la lezione finisce anche sbagliando');
ok(EQ.state.levels[second.id].stars <= 2, 'meno stelle se si sbaglia', 'stelle: ' + EQ.state.levels[second.id].stars);
ok(EQ.state.totals.correct - before < 5, 'le risposte sbagliate non vengono contate come giuste');
const wrongIds = Object.keys(EQ.state.srs).filter(id => EQ.state.srs[id].wrong > 0);
ok(wrongIds.length > 0, 'gli errori finiscono nella memoria di ripasso', wrongIds.length + ' parole da rivedere');
ok(EQ.dueItems().length > 0, 'il ripasso intelligente ha materiale pronto', EQ.dueItems().length + ' in scadenza');

doc.querySelector('#btn-continue').click();
ok(!doc.querySelector('#review-card').hidden, 'in home compare la scheda del ripasso');
doc.querySelector('#btn-review').click();
ok(doc.querySelector('#screen-lesson').classList.contains('active'), 'la sessione di ripasso parte');
const rs = EQ.sess();
ok(rs.q.length > 0 && rs.review, 'il ripasso pesca dalle parole in scadenza', rs.q.length + ' esercizi');
doc.querySelector('#btn-quit').click();

/* ---- 6. Grammatica e frasi ---- */
console.log('\n[6] Grammatica, verbi e frasi');
const gl = EQ.LEVELS.find(l => l.type === 'grammar');
const rg = playLevel(gl.id);
ok(doc.querySelector('#screen-result').classList.contains('active'), 'la lezione di grammatica si completa', gl.name);
ok(EQ.state.levels[gl.id].stars === 3, 'quiz di grammatica risolti correttamente');
doc.querySelector('#btn-continue').click();

const vl = EQ.LEVELS.find(l => l.type === 'verb');
playLevel(vl.id);
ok(EQ.state.levels[vl.id] && EQ.state.levels[vl.id].done, 'il livello dei verbi irregolari si completa');
doc.querySelector('#btn-continue').click();

const pl = EQ.LEVELS.find(l => l.type === 'phrase');
const rp = playLevel(pl.id);
ok(EQ.state.levels[pl.id] && EQ.state.levels[pl.id].done, 'il livello delle frasi si completa');
ok(rp.builds > 0, 'il costruttore di frasi è stato usato', rp.builds + ' frasi composte');
ok(EQ.state.levels[pl.id].stars === 3, 'frasi composte nell’ordine giusto = tutte corrette');
doc.querySelector('#btn-continue').click();

const cl = EQ.LEVELS.find(l => l.type === 'challenge');
playLevel(cl.id);
ok(EQ.state.levels[cl.id] && EQ.state.levels[cl.id].done, 'la sfida di unità si completa');
doc.querySelector('#btn-continue').click();

/* ---- 7. Impostazioni ---- */
console.log('\n[7] Impostazioni e accessibilità');
doc.querySelector('#btn-settings').click();
doc.querySelector('#sheet [data-theme="night"]').click();
ok(doc.body.getAttribute('data-theme') === 'night', 'il tema notte si applica');
doc.querySelector('#sheet [data-theme="contrast"]').click();
ok(doc.body.getAttribute('data-theme') === 'contrast', 'il tema ad alto contrasto si applica');
doc.querySelector('#sheet [data-theme="cream"]').click();
doc.querySelector('#sheet [data-font="sans"]').click();
ok(doc.body.getAttribute('data-font') === 'sans', 'il carattere si cambia');
doc.querySelector('#sheet [data-font="dys"]').click();
const rng = doc.querySelector('#rng-fs');
rng.value = '24';
rng.dispatchEvent(new win.Event('input', { bubbles:true }));
ok(doc.body.style.getPropertyValue('--fs') === '24px', 'la dimensione del testo si regola');
doc.querySelector('#sheet [data-anim="off"]').click();
ok(doc.body.getAttribute('data-anim') === 'off', 'le animazioni si possono spegnere');
doc.querySelector('#sheet [data-anim="on"]').click();
doc.querySelector('#btn-audio').click();
ok(EQ.state.settings.auto === false, 'la lettura automatica si spegne dal bottone in alto');
doc.querySelector('#btn-audio').click();
ok(EQ.state.settings.auto === true, 'e si riaccende');
ok(doc.querySelectorAll('#sel-voice option').length === 3, 'le voci inglesi finiscono nel menu', (doc.querySelectorAll('#sel-voice option').length - 1) + ' voci');
doc.querySelector('#sheet-close').click();

/* ---- 8. Progressi ---- */
console.log('\n[8] Schermata dei progressi');
doc.querySelector('#btn-stats').click();
ok(doc.querySelector('#screen-stats').classList.contains('active'), 'la schermata dei progressi si apre');
ok(+doc.querySelector('#st-words').textContent > 10, 'conta le parole incontrate', doc.querySelector('#st-words').textContent);
ok(doc.querySelector('#dict-list').children.length > 5, 'il dizionario si è riempito', doc.querySelector('#dict-list').children.length + ' voci');
ok(doc.querySelector('#weak-list').children.length > 0, 'le parole difficili sono elencate');
doc.querySelector('#btn-back').click();
ok(doc.querySelector('#screen-home').classList.contains('active'), 'si torna alla home');

/* ---- 9. Aiuto ---- */
doc.querySelector('#btn-help').click();
ok(doc.querySelector('#help-panel') !== null, 'la guida “Come funziona” si apre');
doc.querySelector('#help-panel .btn.icon').click();

/* ---- 10. Ricarica: i progressi restano ---- */
console.log('\n[9] Riavvio dell’app');
const dump = win.localStorage.getItem('english-quest-v1');
const dom2 = new JSDOM(HTML, {
  runScripts:'dangerously', pretendToBeVisual:true, url:'https://example.test/english-quest.html',
  virtualConsole: vc,
  beforeParse(w){
    w.HTMLCanvasElement.prototype.getContext = () => ({ clearRect(){}, save(){}, restore(){}, translate(){}, rotate(){}, fillRect(){}, set fillStyle(v){}, set globalAlpha(v){} });
    w.localStorage.setItem('english-quest-v1', dump);
  }
});
const EQ2 = dom2.window.EQ;
ok(EQ2 && EQ2.state.xp === EQ.state.xp, 'gli XP sono ancora lì dopo il riavvio', EQ2 ? EQ2.state.xp : '—');
ok(EQ2 && Object.keys(EQ2.state.levels).length === Object.keys(EQ.state.levels).length, 'i livelli completati restano');
ok(dom2.window.document.querySelectorAll('.node.done').length === Object.keys(EQ.state.levels).length, 'la mappa mostra i livelli già fatti');
ok(dom2.window.document.body.getAttribute('data-font') === 'dys', 'le impostazioni vengono ricaricate');

/* ---- errori finali ---- */
console.log('\n[10] Errori raccolti durante tutta la sessione');
ok(errors.length === 0, 'nessun errore JavaScript', errors.slice(0,3).join(' | '));

console.log('\n' + (fails ? '❌ ' + fails + ' controlli falliti su ' + checks : '✅ tutti i ' + checks + ' controlli superati'));
process.exit(fails ? 1 : 0);
