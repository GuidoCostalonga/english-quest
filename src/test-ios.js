/* Controlli specifici per iPhone: avviso "anteprima" e tocco senza Pointer Events */
const fs = require('fs');
const { JSDOM, VirtualConsole } = require('C:/Users/guido/berlino/bandiai-fvg/node_modules/jsdom');
const HTML = fs.readFileSync('C:/Users/guido/berlino/english-quest.html', 'utf8');
let bad = 0;
const ok = (c, m, x) => { console.log((c?'  ✓ ':'  ✗ ') + m + (x?'  ('+x+')':'')); if(!c) bad++; };

// 1. senza JavaScript l'avviso resta visibile nel sorgente
ok(/Questa è solo un'anteprima/.test(HTML), 'il file contiene l’avviso per l’anteprima di iPhone');
ok(/<noscript>/.test(HTML), 'c’è anche il blocco <noscript>');

const vc = new VirtualConsole();
const errs = [];
vc.on('jsdomError', e => { if(!/Not implemented/.test(e.message)) errs.push(e.message); });

function boot(noPointer){
  return new JSDOM(HTML, { runScripts:'dangerously', pretendToBeVisual:true, url:'https://x.test/a.html', virtualConsole:vc,
    beforeParse(w){
      w.HTMLCanvasElement.prototype.getContext = () => ({clearRect(){},save(){},restore(){},translate(){},rotate(){},fillRect(){},set fillStyle(v){},set globalAlpha(v){}});
      w.speechSynthesis = { getVoices:()=>[{name:'D',lang:'en-GB',voiceURI:'D'}], speak(){}, cancel(){}, onvoiceschanged:null };
      w.SpeechSynthesisUtterance = function(t){ this.text=t; };
      w.Element.prototype.setPointerCapture = function(){};
      if(noPointer){ delete w.PointerEvent; Object.defineProperty(w,'PointerEvent',{value:undefined,configurable:true}); }
    }});
}

// 2. quando l'app parte, l'avviso sparisce e compare la mappa
const d1 = boot(false), doc1 = d1.window.document;
ok(!/anteprima/.test(doc1.querySelector('#map').textContent), 'appena l’app parte l’avviso viene sostituito');
ok(doc1.querySelectorAll('#map .node').length === d1.window.EQ.LEVELS.length, 'al suo posto c’è la mappa dei livelli');

// 3. iPhone vecchio senza Pointer Events: le parole si spostano a tocco
const d2 = boot(true), win = d2.window, doc = win.document, EQ = win.EQ;
ok(typeof win.PointerEvent === 'undefined', 'simulato un iPhone senza Pointer Events');
const lv = EQ.LEVELS.find(l => l.type === 'phrase');
EQ.startLevel(lv.id);
const s = EQ.sess();
while(s.i < s.q.length && s.q[s.i].type !== 'build'){
  const st = s.q[s.i], stg = doc.querySelector('#stage');
  const fb = doc.querySelector('#feedback .btn'); if(fb){ fb.click(); continue; }
  if(st.type === 'flash') stg.querySelector('.btn.ok').click();
  else if(stg.querySelector('.choice')) stg.querySelector('.choice').click();
  else s.i++;
}
const fb2 = doc.querySelector('#feedback .btn'); if(fb2) fb2.click();
const tiles = [...doc.querySelectorAll('.tile')];
ok(tiles.length > 0, 'esercizio di composizione raggiunto', tiles.length + ' parole');
tiles[0].click();
ok(tiles[0].classList.contains('placed'), 'un tocco mette la parola nella frase');
tiles[0].click();
ok(!tiles[0].classList.contains('placed'), 'un altro tocco la rimette nel banco');
const words = (EQ.ITEMS[s.q[s.i].id].exEn || '').replace(/[.?!]+$/,'').split(/\s+/);
words.forEach(w => { const t = tiles.find(x => x.dataset.w === w && !x.classList.contains('placed')); if(t) t.click(); });
const check = [...doc.querySelectorAll('#stage .btn')].find(b => b.textContent === 'Controlla');
ok(check && !check.disabled, 'con tutte le parole al posto giusto il tasto Controlla si attiva');
check.click();
ok(/Esatto|Perfetto|Bravissimo|Proprio così|Ottimo|Grande/.test(doc.querySelector('.feedback').textContent), 'la frase composta a tocco viene accettata');
ok(errs.length === 0, 'nessun errore JavaScript', errs.slice(0,2).join(' | '));
console.log(bad ? '\n❌ ' + bad + ' controlli falliti' : '\n✅ tutti i controlli iPhone superati');
process.exit(bad ? 1 : 0);
