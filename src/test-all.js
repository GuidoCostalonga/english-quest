/* Gioca TUTTI i livelli, due volte (rispondendo bene e rispondendo a caso). */
const fs = require('fs');
const { JSDOM, VirtualConsole } = require('C:/Users/guido/berlino/bandiai-fvg/node_modules/jsdom');
const HTML = fs.readFileSync('C:/Users/guido/berlino/english-quest.html', 'utf8');

const errors = [];
const vc = new VirtualConsole();
const push = m => { if(!/Not implemented/i.test(String(m))) errors.push(String(m)); };
vc.on('jsdomError', e => push(e.message));
vc.on('error', (...a) => push(a.join(' ')));

function boot(){
  const dom = new JSDOM(HTML, {
    runScripts:'dangerously', pretendToBeVisual:true, url:'https://example.test/e.html', virtualConsole: vc,
    beforeParse(w){
      w.HTMLCanvasElement.prototype.getContext = () => ({ clearRect(){}, save(){}, restore(){}, translate(){}, rotate(){}, fillRect(){}, set fillStyle(v){}, set globalAlpha(v){} });
      w.speechSynthesis = { getVoices:()=>[{name:'D',lang:'en-GB',voiceURI:'D'}], speak(){}, cancel(){}, onvoiceschanged:null };
      w.SpeechSynthesisUtterance = function(t){ this.text = t; };
      w.Element.prototype.setPointerCapture = function(){};
    }
  });
  return dom;
}

function run(mode){
  const dom = boot(), win = dom.window, doc = win.document, EQ = win.EQ;
  const key = (n,k)=>n.dispatchEvent(new win.KeyboardEvent('keydown',{key:k,bubbles:true,cancelable:true}));
  const expected = st => {
    const it = EQ.ITEMS[st.id];
    return { en2it:it&&it.it, listen_phrase:it&&it.it, it2en:it&&it.en, listen:it&&it.en,
             verb_it:it&&it.en, verb_past:it&&it.past, verb_pp:it&&it.pp,
             gram:it&&it.opts&&it.opts[it.a] }[st.type];
  };
  const report = [];
  EQ.LEVELS.forEach(lv => {
    // sblocca tutto per poter testare ogni livello
    EQ.LEVELS.forEach(x => { if(x.index < lv.index) EQ.state.levels[x.id] = {done:true, stars:3, best:100}; });
    EQ.startLevel(lv.id);
    const seen = {};
    let guard = 0;
    while(guard++ < 120){
      const fb = doc.querySelector('#feedback .btn');
      if(fb){ fb.click(); continue; }
      if(!doc.querySelector('#screen-lesson').classList.contains('active')) break;
      const s = EQ.sess(), st = s.q[s.i], stage = doc.querySelector('#stage');
      if(!st) break;
      seen[st.type] = (seen[st.type]||0)+1;
      if(st.type === 'flash'){ stage.querySelector('.btn.ok').click(); continue; }
      if(st.type === 'flash_verb' || st.type === 'slide'){ stage.querySelector('.btn.primary').click(); continue; }
      if(st.type === 'build'){
        const it = EQ.ITEMS[st.id], full = it.exEn || it.en;
        const base = (full.match(/^(.*?)([.?!]+)$/) || [null, full])[1];
        let words = base.split(/\s+/);
        if(mode === 'random') words = words.slice().reverse();
        const tiles = [...stage.querySelectorAll('.tile')];
        words.forEach(w => { const t = tiles.find(x => x.dataset.w===w && !x.classList.contains('placed')); if(t) key(t,'Enter'); });
        const check = [...stage.querySelectorAll('.btn')].find(b => b.textContent === 'Controlla');
        if(!check) { report.push(lv.id + ': manca il bottone Controlla'); break; }
        if(check.disabled){ report.push(lv.id + ': frase non componibile → ' + full); break; }
        check.click(); continue;
      }
      const choices = [...stage.querySelectorAll('.choice')];
      if(!choices.length){ report.push(lv.id + ': esercizio "' + st.type + '" senza risposte'); break; }
      if(choices.length < 3) report.push(lv.id + ': solo ' + choices.length + ' opzioni in ' + st.type);
      const labels = choices.map(c => c.textContent.slice(1).trim());
      if(new Set(labels).size !== labels.length) report.push(lv.id + ': opzioni doppie in ' + st.type + ' → ' + labels.join(' / '));
      const want = String(expected(st));
      let target = choices[choices.findIndex((c,i) => labels[i] === want)];
      if(!target) report.push(lv.id + ': risposta giusta assente in ' + st.type + ' (attesa "' + want + '")');
      if(mode === 'random') target = choices[Math.floor(Math.random()*choices.length)];
      (target || choices[0]).click();
    }
    if(guard >= 120) report.push(lv.id + ': la lezione non finisce (ciclo infinito?)');
    if(!doc.querySelector('#screen-result').classList.contains('active')) report.push(lv.id + ': non arriva ai risultati');
    else doc.querySelector('#btn-continue').click();
  });
  return { report, EQ, doc };
}

console.log('— modalità "risposte giuste" —');
const a = run('perfect');
console.log('— modalità "risposte a caso" —');
const b = run('random');

const problems = [...new Set([...a.report, ...b.report])];
console.log('\nLivelli giocati: ' + a.EQ.LEVELS.length + ' × 2');
console.log('XP finali (risposte giuste): ' + a.EQ.state.xp);
console.log('Livelli completati: ' + Object.keys(a.EQ.state.levels).length + '/' + a.EQ.LEVELS.length);
if(problems.length){ console.log('\n❌ Problemi:'); problems.forEach(p => console.log('  • ' + p)); }
else console.log('\n✅ Tutti i livelli si completano senza intoppi');
if(errors.length){ console.log('\n❌ Errori JS:'); [...new Set(errors)].slice(0,10).forEach(e => console.log('  • ' + e)); }
else console.log('✅ Nessun errore JavaScript');
process.exit(problems.length || errors.length ? 1 : 0);
