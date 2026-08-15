/* =========================================================
   English Quest — motore dell'applicazione
   ========================================================= */
(function(){
'use strict';

/* ---------- utilità ---------- */
function $(s, r){ return (r || document).querySelector(s); }
function el(tag, cls, txt){
  var n = document.createElement(tag);
  if(cls) n.className = cls;
  if(txt != null) n.textContent = txt;
  return n;
}
function shuffle(a){
  a = a.slice();
  for(var i = a.length - 1; i > 0; i--){
    var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}
function sample(a, n){ return shuffle(a).slice(0, n); }
function today(){
  var d = new Date();
  return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
}
function daysBetween(a, b){
  return Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / 86400000);
}
var DAY = 86400000;

/* ---------- memoria dei progressi ---------- */
var KEY = 'english-quest-v1';
var Store = {
  ok: true,
  read: function(){
    var raw = null;
    try{ raw = localStorage.getItem(KEY); }catch(e){ this.ok = false; }
    if(!raw){
      try{ if(window.name && window.name.indexOf('EQ|') === 0) raw = window.name.slice(3); }catch(e){}
    }
    if(!raw) return null;
    try{ return JSON.parse(raw); }catch(e){ return null; }
  },
  write: function(obj){
    var s = JSON.stringify(obj);
    try{ localStorage.setItem(KEY, s); }catch(e){ this.ok = false; }
    try{ window.name = 'EQ|' + s; }catch(e){}
  }
};
(function(){
  try{ localStorage.setItem(KEY + '_t', '1'); localStorage.removeItem(KEY + '_t'); }
  catch(e){ Store.ok = false; }
})();

var DEFAULTS = {
  v: 1, xp: 0, streak: 0, best: 0, lastDay: '',
  levels: {}, srs: {},
  totals: { answers: 0, correct: 0 },
  settings: { theme:'cream', font:'dys', fs:17, ls:2, lh:17, rate:85, voice:'', auto:true, hint:false, anim:'on' }
};
var state = (function(){
  var s = Store.read() || {};
  var out = JSON.parse(JSON.stringify(DEFAULTS));
  for(var k in s){ if(k !== 'settings' && k !== 'totals') out[k] = s[k]; }
  if(s.settings) for(var a in s.settings) out.settings[a] = s.settings[a];
  // al primo avvio segue il tema del dispositivo
  if(!(s.settings && s.settings.theme) && window.matchMedia &&
     window.matchMedia('(prefers-color-scheme: dark)').matches) out.settings.theme = 'night';
  if(s.totals) for(var b in s.totals) out.totals[b] = s.totals[b];
  return out;
})();
function save(){ Store.write(state); }

/* ---------- ripetizione spaziata (Leitner) ---------- */
var BOX_DAYS = [0, 1, 2, 4, 8, 16, 32];
function srsOf(id){
  return state.srs[id] || (state.srs[id] = { box:0, due:0, seen:0, wrong:0, right:0 });
}
function srsUpdate(id, correct){
  var s = srsOf(id);
  s.seen++;
  if(correct){ s.right++; s.box = Math.min(s.box + 1, BOX_DAYS.length - 1); }
  else { s.wrong++; s.box = Math.max(0, s.box - 2); }
  s.due = Date.now() + BOX_DAYS[s.box] * DAY;
}
function dueItems(){
  var now = Date.now(), out = [];
  for(var id in state.srs){
    if(ITEMS[id] && state.srs[id].seen > 0 && state.srs[id].due <= now) out.push(id);
  }
  return out.sort(function(a, b){
    return (state.srs[b].wrong - state.srs[b].right) - (state.srs[a].wrong - state.srs[a].right);
  });
}

/* ---------- sintesi vocale ---------- */
var Speech = {
  supported: 'speechSynthesis' in window,
  voices: [], en: [], picked: null, unlocked: false, current: null,
  load: function(){
    if(!this.supported) return;
    this.voices = window.speechSynthesis.getVoices() || [];
    this.en = this.voices.filter(function(v){ return /^en(-|_|$)/i.test(v.lang); });
    this.pick(state.settings.voice);
    if(typeof UI !== 'undefined' && UI && UI.fillVoices) UI.fillVoices();
  },
  pick: function(uri){
    var list = this.en;
    if(!list.length){ this.picked = null; return; }
    var found = uri && list.filter(function(v){ return v.voiceURI === uri || v.name === uri; })[0];
    if(!found) found = list.filter(function(v){ return /en-GB/i.test(v.lang); })[0];
    if(!found) found = list.filter(function(v){ return /en-US/i.test(v.lang); })[0];
    this.picked = found || list[0];
  },
  unlock: function(){
    if(!this.supported || this.unlocked) return;
    this.unlocked = true;
    try{
      var u = new SpeechSynthesisUtterance(' ');
      u.volume = 0; u.lang = 'en-GB';
      window.speechSynthesis.speak(u);
    }catch(e){}
  },
  say: function(text, opts){
    opts = opts || {};
    if(!this.supported || !text) return;
    try{
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(String(text));
      if(opts.lang === 'it'){
        u.lang = 'it-IT';
        var itv = this.voices.filter(function(v){ return /^it/i.test(v.lang); })[0];
        if(itv) u.voice = itv;
        u.rate = Math.max(.6, state.settings.rate / 100);
      } else {
        u.lang = (this.picked && this.picked.lang) || 'en-GB';
        if(this.picked) u.voice = this.picked;
        u.rate = Math.max(.5, state.settings.rate / 100) * (opts.slow ? .75 : 1);
      }
      u.pitch = 1;
      var btn = opts.btn;
      if(btn){
        btn.classList.add('on');
        u.onend = u.onerror = function(){ btn.classList.remove('on'); };
      }
      window.speechSynthesis.speak(u);
    }catch(e){}
  },
  stop: function(){ try{ window.speechSynthesis.cancel(); }catch(e){} }
};
if(Speech.supported){
  Speech.load();
  window.speechSynthesis.onvoiceschanged = function(){ Speech.load(); };
  setTimeout(function(){ if(!Speech.en.length) Speech.load(); }, 900);
}

/* bottone altoparlante riutilizzabile */
function speakBtn(text, opts){
  opts = opts || {};
  var b = el('button', 'speak' + (opts.small ? ' sm' : ''), '🔊');
  b.type = 'button';
  b.setAttribute('aria-label', 'Ascolta: ' + text);
  b.addEventListener('click', function(ev){
    ev.stopPropagation();
    Speech.say(text, { lang: opts.lang, btn: b, slow: ev.altKey || ev.shiftKey });
  });
  var press = null;
  b.addEventListener('pointerdown', function(){
    press = setTimeout(function(){ Speech.say(text, { lang: opts.lang, btn: b, slow: true }); press = 'done'; }, 550);
  });
  b.addEventListener('pointerup', function(){ if(press && press !== 'done') clearTimeout(press); press = null; });
  b.addEventListener('pointercancel', function(){ if(press && press !== 'done') clearTimeout(press); press = null; });
  return b;
}
function autoSay(text){ if(state.settings.auto) setTimeout(function(){ Speech.say(text); }, 220); }

/* ---------- coriandoli ---------- */
var Confetti = (function(){
  var cv = $('#confetti'), ctx = cv.getContext('2d'), parts = [], raf = null, dpr = 1;
  function resize(){
    // niente misure basate su innerWidth: includerebbe la barra di scorrimento
    // e il canvas finirebbe fuori pagina (scroll orizzontale su Mac)
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    var r = cv.getBoundingClientRect();
    cv.width = Math.max(1, Math.round(r.width * dpr));
    cv.height = Math.max(1, Math.round(r.height * dpr));
  }
  window.addEventListener('resize', resize); resize();
  function tick(){
    ctx.clearRect(0, 0, cv.width, cv.height);
    var alive = 0;
    for(var i = 0; i < parts.length; i++){
      var p = parts[i];
      if(p.life <= 0) continue;
      alive++;
      p.vy += .35; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.life--;
      ctx.save();
      ctx.translate(p.x * dpr, p.y * dpr);
      ctx.rotate(p.r);
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life / 26));
      ctx.fillStyle = p.c;
      ctx.fillRect(-4 * dpr, -6 * dpr, 8 * dpr, 12 * dpr);
      ctx.restore();
    }
    if(alive){ raf = requestAnimationFrame(tick); }
    else { ctx.clearRect(0, 0, cv.width, cv.height); raf = null; }
  }
  return function fire(n, originY){
    if(state.settings.anim === 'off') return;
    if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if(!ctx) return;
    var colors = ['#2f6fd0', '#7b4fe0', '#1c8f52', '#e0a12b', '#c8384f'];
    n = n || 90;
    for(var i = 0; i < n; i++){
      parts.push({
        x: window.innerWidth / 2 + (Math.random() - .5) * 220,
        y: (originY || window.innerHeight * .35) + (Math.random() - .5) * 40,
        vx: (Math.random() - .5) * 11, vy: -Math.random() * 13 - 4,
        r: Math.random() * 6, vr: (Math.random() - .5) * .35,
        life: 60 + Math.random() * 40, c: colors[i % colors.length]
      });
    }
    if(parts.length > 400) parts = parts.slice(-400);
    if(!raf) raf = requestAnimationFrame(tick);
  };
})();

var toastT = null;
function toast(msg){
  var t = $('#toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastT);
  toastT = setTimeout(function(){ t.classList.remove('show'); }, 2200);
}

/* ---------- interfaccia generale ---------- */
var UI = {
  screen: 'home',
  show: function(name, push){
    var prev = $('#screen-' + this.screen);
    if(prev) prev.classList.remove('active');
    this.screen = name;
    var next = $('#screen-' + name);
    if(next){ next.classList.add('active'); }
    $('#btn-back').hidden = (name === 'home' || name === 'lesson');
    window.scrollTo(0, 0);
    if(push !== false){
      try{ history.pushState({ s: name }, ''); }catch(e){}
    }
  },
  header: function(){
    var xp = $('#chip-xp').querySelector('b');
    if(xp.textContent !== String(state.xp)){
      xp.textContent = state.xp;
      xp.parentNode.classList.remove('xp-pop');
      void xp.parentNode.offsetWidth;
      xp.parentNode.classList.add('xp-pop');
    }
    $('#chip-streak').querySelector('b').textContent = state.streak;
  },
  fillVoices: function(){
    var sel = $('#sel-voice');
    if(!sel) return;
    var cur = state.settings.voice;
    sel.innerHTML = '';
    var o0 = el('option', null, Speech.en.length ? 'Automatica' : 'Nessuna voce inglese trovata');
    o0.value = ''; sel.appendChild(o0);
    Speech.en.forEach(function(v){
      var o = el('option', null, v.name + ' (' + v.lang + ')');
      o.value = v.voiceURI || v.name;
      sel.appendChild(o);
    });
    sel.value = cur || '';
  }
};

/* ---------- impostazioni ---------- */
function applySettings(){
  var s = state.settings, b = document.body;
  b.setAttribute('data-theme', s.theme);
  b.setAttribute('data-font', s.font);
  b.setAttribute('data-anim', s.anim);
  b.style.setProperty('--fs', s.fs + 'px');
  b.style.setProperty('--ls', (s.ls / 100) + 'em');
  b.style.setProperty('--lh', (s.lh / 10));
  var meta = document.querySelector('meta[name="theme-color"]');
  if(meta) meta.setAttribute('content', s.theme === 'night' ? '#191b21' : s.theme === 'contrast' ? '#000000' : '#f3ead8');
  $('#btn-audio').textContent = s.auto ? '🔊' : '🔇';
  $('#btn-audio').setAttribute('aria-pressed', s.auto ? 'true' : 'false');
  $('#rng-fs').value = s.fs; $('#rng-ls').value = s.ls;
  $('#rng-lh').value = s.lh; $('#rng-rate').value = s.rate;
  ['font', 'theme', 'anim'].forEach(function(k){
    Array.prototype.forEach.call(document.querySelectorAll('[data-' + k + ']'), function(btn){
      if(btn.tagName === 'BUTTON') btn.setAttribute('aria-pressed', btn.getAttribute('data-' + k) === String(s[k]) ? 'true' : 'false');
    });
  });
  Array.prototype.forEach.call(document.querySelectorAll('[data-auto]'), function(btn){
    btn.setAttribute('aria-pressed', (btn.getAttribute('data-auto') === '1') === !!s.auto ? 'true' : 'false');
  });
  Array.prototype.forEach.call(document.querySelectorAll('[data-hint]'), function(btn){
    btn.setAttribute('aria-pressed', (btn.getAttribute('data-hint') === '1') === !!s.hint ? 'true' : 'false');
  });
}

function openSheet(open){
  var sh = $('#sheet'), bk = $('#sheet-back');
  if(open){
    sh.hidden = false;
    requestAnimationFrame(function(){ sh.classList.add('open'); bk.classList.add('open'); });
  } else {
    sh.classList.remove('open'); bk.classList.remove('open');
    setTimeout(function(){ sh.hidden = true; }, 320);
  }
}

/* ---------- mappa dei livelli ---------- */
function levelUnlocked(lv){
  if(lv.index === 0) return true;
  var prev = LEVELS[lv.index - 1];
  return !!(state.levels[prev.id] && state.levels[prev.id].done);
}
function nextLevel(){
  for(var i = 0; i < LEVELS.length; i++){
    if(!(state.levels[LEVELS[i].id] && state.levels[LEVELS[i].id].done)) return LEVELS[i];
  }
  return null;
}
function renderMap(){
  var wrap = $('#map');
  wrap.innerHTML = '';
  var next = nextLevel();
  UNITS.forEach(function(u){
    var box = el('section', 'unit');
    var head = el('div', 'unit-head');
    var done = u.levels.filter(function(l){ return state.levels[l.id] && state.levels[l.id].done; }).length;
    head.innerHTML = '<span style="font-size:1.6em">' + u.levels[0].icon + '</span>';
    var htxt = el('div');
    htxt.appendChild(el('h2', null, u.name));
    htxt.appendChild(el('small', null, u.sub + ' · ' + done + '/' + u.levels.length + ' completati'));
    head.appendChild(htxt);
    box.appendChild(head);

    var path = el('div', 'path');
    u.levels.forEach(function(lv, i){
      var row = el('div', 'node-row p' + (i % 4));
      var n = el('button', 'node');
      n.type = 'button';
      var st = state.levels[lv.id];
      var unlocked = levelUnlocked(lv);
      if(!unlocked) n.classList.add('locked');
      if(st && st.done) n.classList.add('done');
      if(next && next.id === lv.id) n.classList.add('current');
      n.style.animationDelay = (i * 45) + 'ms';
      n.appendChild(el('span', 'ico', unlocked ? lv.icon : '🔒'));
      n.appendChild(el('span', 'nm', lv.name));
      n.appendChild(el('span', 'stars', st && st.stars ? '★'.repeat(st.stars) : ''));
      if(next && next.id === lv.id && unlocked) n.appendChild(el('span', 'badge', st && st.done ? 'ripeti' : 'inizia'));
      n.setAttribute('aria-label', lv.name + (unlocked ? '' : ' — bloccato'));
      n.addEventListener('click', function(){
        Speech.unlock();
        if(!unlocked){ toast('Completa prima il livello precedente 🙂'); return; }
        startLevel(lv.id);
      });
      row.appendChild(n);
      path.appendChild(row);
    });
    box.appendChild(path);
    wrap.appendChild(box);
  });

  var due = dueItems();
  $('#review-card').hidden = due.length < 4;
  $('#review-count').textContent = due.length;

  var nx = nextLevel();
  $('#hero-sub').textContent = nx
    ? 'Prossima tappa: ' + nx.name + '. Tocca il livello che brilla.'
    : 'Hai finito tutto il percorso. Ripassa quando vuoi!';

  var bn = $('#home-banner');
  bn.innerHTML = '';
  if(!Store.ok){
    var b = el('div', 'banner');
    b.innerHTML = '<span>⚠️</span><div><b>I progressi non si salvano</b><br>Il browser blocca il salvataggio quando il file è aperto direttamente dal disco. Restano validi finché non chiudi questa scheda: per conservarli usa <b>Salva progressi</b> nelle impostazioni.</div>';
    bn.appendChild(b);
  }
}

/* ---------- costruzione della sessione ---------- */
function distractors(item, field, n){
  var pool = POOLS[item.pool] || [];
  var out = [], seen = {};
  seen[item[field]] = 1;
  shuffle(pool).forEach(function(id){
    if(out.length >= n) return;
    var o = ITEMS[id];
    if(!o || o.id === item.id || !o[field] || seen[o[field]]) return;
    seen[o[field]] = 1; out.push(o);
  });
  if(out.length < n){
    var all = Object.keys(ITEMS);
    shuffle(all).forEach(function(id){
      if(out.length >= n) return;
      var o = ITEMS[id];
      if(!o || o.id === item.id || o.kind !== item.kind || !o[field] || seen[o[field]]) return;
      seen[o[field]] = 1; out.push(o);
    });
  }
  return out;
}

function stepsForWord(id, variants){
  var it = ITEMS[id], out = [];
  variants.forEach(function(v){
    if(v === 'build' && !it.exEn) return;
    out.push({ type: v, id: id });
  });
  return out;
}

function buildQueue(lv){
  var q = [], i;
  if(lv.type === 'vocab' || lv.type === 'phrase'){
    var fresh = lv.ids.filter(function(id){ return !state.srs[id] || !state.srs[id].seen; });
    fresh.forEach(function(id){ q.push({ type:'flash', id:id }); });
    var practice = shuffle(lv.ids);
    practice.forEach(function(id, k){
      var kinds = lv.type === 'phrase'
        ? [['listen_phrase', 'en2it'][k % 2]]
        : [['en2it', 'it2en', 'listen'][k % 3]];
      q = q.concat(stepsForWord(id, kinds));
    });
    var withEx = lv.ids.filter(function(id){ return ITEMS[id].exEn; });
    sample(withEx, lv.type === 'phrase' ? 3 : 2).forEach(function(id){ q.push({ type:'build', id:id }); });
  }
  else if(lv.type === 'verb'){
    var freshV = lv.ids.filter(function(id){ return !state.srs[id] || !state.srs[id].seen; });
    freshV.forEach(function(id){ q.push({ type:'flash_verb', id:id }); });
    shuffle(lv.ids).forEach(function(id, k){
      q.push({ type: (k % 3 === 0 ? 'verb_it' : k % 3 === 1 ? 'verb_past' : 'verb_pp'), id:id });
    });
    var vex = lv.ids.filter(function(id){ return ITEMS[id].exEn; });
    sample(vex, 2).forEach(function(id){ q.push({ type:'build', id:id }); });
  }
  else if(lv.type === 'grammar'){
    var g = GRAMMAR.filter(function(x){ return x.id === lv.gram; })[0];
    g.slides.forEach(function(sl, k){ q.push({ type:'slide', gram:g.id, k:k }); });
    shuffle(g.quizIds).forEach(function(id){ q.push({ type:'gram', id:id }); });
    shuffle(g.buildIds).forEach(function(id){ q.push({ type:'build', id:id }); });
  }
  else if(lv.type === 'challenge' || lv.type === 'review'){
    var pool = lv.ids.slice();
    // prima gli elementi che meritano ripasso
    pool.sort(function(a, b){
      var sa = state.srs[a], sb = state.srs[b];
      var wa = sa ? (sa.wrong * 2 - sa.right) : 0, wb = sb ? (sb.wrong * 2 - sb.right) : 0;
      return wb - wa;
    });
    var chosen = pool.slice(0, 6).concat(sample(pool.slice(6), 8));
    shuffle(chosen).forEach(function(id, k){
      var it = ITEMS[id];
      if(!it) return;
      if(it.kind === 'verb') q.push({ type:['verb_past', 'verb_pp', 'verb_it'][k % 3], id:id });
      else if(it.kind === 'gram') q.push({ type:'gram', id:id });
      else if(it.kind === 'gsent') q.push({ type:'build', id:id });
      else if(it.kind === 'phrase') q.push({ type: k % 2 ? 'listen_phrase' : 'en2it', id:id });
      else q.push({ type:['en2it', 'it2en', 'listen'][k % 3], id:id });
    });
  }
  // limite di lunghezza: sessioni brevi si finiscono volentieri.
  // Le frasi da comporre restano sempre in coda: sono l'esercizio più formativo.
  var MAXQ = 18;
  if(q.length > MAXQ){
    var head = [], builds = [], rest = [];
    q.forEach(function(s){
      if(s.type === 'flash' || s.type === 'flash_verb' || s.type === 'slide') head.push(s);
      else if(s.type === 'build') builds.push(s);
      else rest.push(s);
    });
    builds = builds.slice(0, 3);
    var room = Math.max(6, MAXQ - head.length - builds.length);
    q = head.concat(rest.slice(0, room), builds);
  }
  return q;
}

/* ---------- sessione ---------- */
var S = null;

function startLevel(levelId, opts){
  opts = opts || {};
  var lv = LEVEL_BY_ID[levelId];
  if(!lv) return;
  var queue = buildQueue(lv);
  if(!queue.length){ toast('Nessun esercizio disponibile'); return; }
  S = { lv:lv, q:queue, i:0, correct:0, answered:0, fresh:0, wrong:[], t0:Date.now(), review:!!opts.review };
  S.fresh = lv.ids ? lv.ids.filter(function(id){ return !state.srs[id] || !state.srs[id].seen; }).length : 0;
  UI.show('lesson');
  $('#lesson-score').querySelector('b').textContent = '0';
  renderStep();
}

function startReview(){
  var due = dueItems().slice(0, 14);
  if(due.length < 1){ toast('Non c’è nulla da ripassare, per ora 👍'); return; }
  var lv = { id:'l_review', name:'Ripasso', icon:'🔁', type:'review', ids:due, index:-1 };
  LEVEL_BY_ID['l_review'] = lv;
  startLevel('l_review', { review:true });
}

function progress(){
  var pc = Math.round((S.i / S.q.length) * 100);
  var bar = $('#lesson-bar');
  bar.querySelector('i').style.width = pc + '%';
  bar.setAttribute('aria-valuenow', pc);
}

function renderStep(){
  Speech.stop();
  $('#feedback').innerHTML = '';
  $('#screen-lesson').style.paddingBottom = '';
  progress();
  var stage = $('#stage');
  stage.innerHTML = '';
  stage._keys = null;
  if(S.i >= S.q.length){ finishLevel(); return; }
  var step = S.q[S.i];
  var fn = RENDER[step.type];
  if(!fn){ S.i++; renderStep(); return; }
  fn(stage, step);
}

function nextStep(){ S.i++; renderStep(); }

/* riscontro in fondo allo schermo */
function feedback(ok, opts){
  opts = opts || {};
  var box = el('div', 'feedback ' + (ok ? 'good' : 'bad'));
  var ico = el('span', null, ok ? '✅' : '💡');
  ico.style.fontSize = '1.8em';
  box.appendChild(ico);
  var txt = el('div', 'txt', ok ? (opts.title || 'Esatto!') : (opts.title || 'La risposta giusta era:'));
  if(opts.answer){
    var a = el('small', null, opts.answer);
    a.style.fontSize = '1.05em'; a.style.color = 'var(--ink)';
    txt.appendChild(a);
  }
  if(opts.why) txt.appendChild(el('small', null, opts.why));
  box.appendChild(txt);
  if(opts.speak) box.appendChild(speakBtn(opts.speak));
  var go = el('button', 'btn ' + (ok ? 'ok' : 'primary'), 'Avanti →');
  go.type = 'button';
  go.addEventListener('click', nextStep);
  box.appendChild(go);
  $('#feedback').appendChild(box);
  // libera sotto ai contenuti esattamente lo spazio occupato dalla barra
  $('#screen-lesson').style.paddingBottom = (box.offsetHeight + 24) + 'px';
  setTimeout(function(){ go.focus(); }, 60);
  if(ok && !opts.silent) Confetti(26, window.innerHeight * .55);
}

function record(id, ok){
  S.answered++;
  state.totals.answers++;
  if(ok){ S.correct++; state.totals.correct++; state.xp += 10; }
  else if(id && ITEMS[id]) S.wrong.push(id);
  if(id) srsUpdate(id, ok);
  $('#lesson-score').querySelector('b').textContent = S.correct;
  UI.header();
  save();
}

/* ---------- esercizi ---------- */
var RENDER = {};

/* prompt riutilizzabile */
function promptBlock(opts){
  var p = el('div', 'prompt');
  if(opts.lab) p.appendChild(el('div', 'lab', opts.lab));
  if(opts.emoji) p.appendChild(el('span', 'emoji', opts.emoji));
  var row = el('div', 'with-audio');
  var big = el('div', 'big', opts.text);
  row.appendChild(big);
  if(opts.speak) row.appendChild(speakBtn(opts.speak));
  p.appendChild(row);
  if(opts.sub){
    var s = el('div', null, opts.sub);
    s.style.color = 'var(--ink-soft)'; s.style.fontSize = '.9em';
    p.appendChild(s);
  }
  return p;
}

/* scelta multipla generica */
function multipleChoice(stage, cfg){
  stage.appendChild(cfg.prompt);
  var wrap = el('div', 'choices' + (cfg.two ? ' two' : ''));
  var opts = cfg.options, done = false;
  opts.forEach(function(o, i){
    var b = el('button', 'choice');
    b.type = 'button';
    b.style.animationDelay = (i * 55) + 'ms';
    var k = el('span', 'key', String(i + 1));
    b.appendChild(k);
    b.appendChild(el('span', null, o.label));
    b.addEventListener('click', function(){
      if(done) return;
      done = true;
      var ok = !!o.correct;
      Array.prototype.forEach.call(wrap.children, function(c, j){
        if(opts[j].correct) c.classList.add('correct');
        else if(j === i) c.classList.add('wrong');
        else c.classList.add('dim');
      });
      var mascotOk = ok;
      var m = $('#mascot');
      if(m){ m.classList.remove('happy', 'sad'); void m.offsetWidth; m.classList.add(mascotOk ? 'happy' : 'sad'); }
      record(cfg.id, ok);
      if(cfg.speakAfter) Speech.say(cfg.speakAfter);
      feedback(ok, {
        answer: ok ? null : cfg.answerText,
        why: cfg.why,
        speak: cfg.speakAnswer,
        title: ok ? pickPraise() : 'La risposta giusta era:'
      });
    });
    wrap.appendChild(b);
  });
  stage.appendChild(wrap);
  // tastiera: 1..4
  wrap.dataset.keys = '1';
  stage._keys = function(e){
    var n = parseInt(e.key, 10);
    if(n >= 1 && n <= opts.length && wrap.children[n - 1]) wrap.children[n - 1].click();
  };
}
var PRAISE = ['Esatto!', 'Perfetto!', 'Bravissimo!', 'Proprio così!', 'Ottimo lavoro!', 'Grande!'];
function pickPraise(){ return PRAISE[Math.floor(Math.random() * PRAISE.length)]; }

/* flashcard */
RENDER.flash = function(stage, step){
  var it = ITEMS[step.id];
  var wrap = el('div', 'flip-wrap');
  var card = el('div', 'flip');
  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', '0');
  card.setAttribute('aria-label', 'Carta: tocca per girarla');

  var front = el('div', 'face');
  front.appendChild(el('div', null, it.emoji)).style.fontSize = '3em';
  front.appendChild(el('div', 'word', it.en));
  front.appendChild(speakBtn(it.en));
  front.appendChild(el('div', 'hint', '👆 tocca per la traduzione'));

  var back = el('div', 'face back');
  back.appendChild(el('div', 'word', it.it));
  if(it.exEn){
    var ex = el('div', 'sub', '“' + it.exEn + '”');
    back.appendChild(ex);
    back.appendChild(el('div', 'sub', it.exIt));
    back.appendChild(speakBtn(it.exEn, { small:true }));
  }
  back.appendChild(el('div', 'hint', '👆 tocca per tornare'));

  card.appendChild(front); card.appendChild(back);
  wrap.appendChild(card);
  stage.appendChild(el('div', 'prompt')).appendChild(el('div', 'lab', 'Parola nuova'));
  stage.appendChild(wrap);

  function flip(){
    card.classList.toggle('flipped');
    if(card.classList.contains('flipped')) Speech.say(it.it, { lang:'it' });
    else Speech.say(it.en);
  }
  card.addEventListener('click', flip);
  card.addEventListener('keydown', function(e){ if(e.key === ' ' || e.key === 'Enter'){ e.preventDefault(); flip(); } });

  var row = el('div');
  row.style.cssText = 'display:flex;gap:10px;margin-top:6px';
  var known = el('button', 'btn ok', '👍 La so');
  known.type = 'button'; known.style.flex = '1';
  known.addEventListener('click', function(){
    srsOf(it.id); srsUpdate(it.id, true);
    state.xp += 5; UI.header(); save(); nextStep();
  });
  var later = el('button', 'btn', '🔁 Da ripassare');
  later.type = 'button'; later.style.flex = '1';
  later.addEventListener('click', function(){
    var s = srsOf(it.id); s.seen++; s.box = 0; s.due = Date.now();
    save(); nextStep();
  });
  row.appendChild(known); row.appendChild(later);
  stage.appendChild(row);
  autoSay(it.en);
};

RENDER.flash_verb = function(stage, step){
  var it = ITEMS[step.id];
  var wrap = el('div', 'flip-wrap');
  var card = el('div', 'flip');
  card.setAttribute('role', 'button'); card.setAttribute('tabindex', '0');

  var front = el('div', 'face');
  front.appendChild(el('div', 'word', it.en));
  var forms = el('div', 'sub', it.past + ' · ' + it.pp);
  forms.style.fontSize = '1.15em'; forms.style.fontWeight = '800'; forms.style.color = 'var(--brand)';
  front.appendChild(forms);
  front.appendChild(speakBtn(it.en + ', ' + it.past.replace('/', 'or') + ', ' + it.pp));
  front.appendChild(el('div', 'hint', '👆 tocca per la traduzione'));

  var back = el('div', 'face back');
  back.appendChild(el('div', 'word', it.it));
  back.appendChild(el('div', 'sub', 'base · past simple · past participle'));
  back.appendChild(el('div', 'sub', it.en + ' · ' + it.past + ' · ' + it.pp));
  if(it.exEn){
    back.appendChild(el('div', 'sub', '“' + it.exEn + '” — ' + it.exIt));
    back.appendChild(speakBtn(it.exEn, { small:true }));
  }
  card.appendChild(front); card.appendChild(back);
  wrap.appendChild(card);
  stage.appendChild(el('div', 'prompt')).appendChild(el('div', 'lab', 'Verbo irregolare'));
  stage.appendChild(wrap);
  card.addEventListener('click', function(){ card.classList.toggle('flipped'); });
  card.addEventListener('keydown', function(e){ if(e.key === ' ' || e.key === 'Enter'){ e.preventDefault(); card.classList.toggle('flipped'); } });

  var go = el('button', 'btn primary wide', 'Ho capito →');
  go.type = 'button';
  go.style.marginTop = '10px';
  go.addEventListener('click', function(){
    srsOf(it.id); state.xp += 5; UI.header(); save(); nextStep();
  });
  stage.appendChild(go);
  autoSay(it.en + ', ' + it.past.replace('/', 'or') + ', ' + it.pp);
};

/* inglese → italiano */
RENDER.en2it = function(stage, step){
  var it = ITEMS[step.id];
  var wrong = distractors(it, 'it', 3);
  var options = shuffle([{ label:it.it, correct:true }].concat(wrong.map(function(o){ return { label:o.it }; })));
  multipleChoice(stage, {
    id: it.id,
    prompt: promptBlock({ lab:'Che cosa vuol dire?', emoji: it.kind === 'word' ? it.emoji : null, text: it.en, speak: it.en }),
    options: options,
    two: it.kind === 'word',
    answerText: it.it,
    speakAnswer: it.en
  });
  autoSay(it.en);
};

/* italiano → inglese */
RENDER.it2en = function(stage, step){
  var it = ITEMS[step.id];
  var wrong = distractors(it, 'en', 3);
  var options = shuffle([{ label:it.en, correct:true }].concat(wrong.map(function(o){ return { label:o.en }; })));
  multipleChoice(stage, {
    id: it.id,
    prompt: promptBlock({ lab:'Come si dice in inglese?', emoji:it.emoji, text:it.it }),
    options: options, two:true,
    answerText: it.en,
    speakAfter: it.en,
    speakAnswer: it.en
  });
};

/* ascolto: senti la parola e scegli */
RENDER.listen = function(stage, step){
  var it = ITEMS[step.id];
  var wrong = distractors(it, 'en', 3);
  var options = shuffle([{ label:it.en, correct:true }].concat(wrong.map(function(o){ return { label:o.en }; })));
  var p = el('div', 'prompt');
  p.appendChild(el('div', 'lab', 'Ascolta e scegli'));
  var big = el('button', 'speak', '🔊');
  big.type = 'button';
  big.style.cssText = 'width:88px;height:88px;font-size:2.2em;margin:10px auto;display:flex';
  big.setAttribute('aria-label', 'Ascolta di nuovo');
  big.addEventListener('click', function(){ Speech.say(it.en, { btn:big }); });
  p.appendChild(big);
  var slow = el('button', 'btn small ghost', '🐢 più lento');
  slow.type = 'button';
  slow.addEventListener('click', function(){ Speech.say(it.en, { slow:true, btn:big }); });
  p.appendChild(slow);
  if(!Speech.supported || !Speech.en.length){
    var w = el('div', null, '⚠️ Audio non disponibile su questo dispositivo: la parola è ' + it.en);
    w.style.cssText = 'margin-top:8px;font-size:.85em;color:var(--ink-soft)';
    p.appendChild(w);
  }
  multipleChoice(stage, {
    id: it.id, prompt: p, options: options, two: true,
    answerText: it.en + ' = ' + it.it, speakAnswer: it.en
  });
  setTimeout(function(){ Speech.say(it.en, { btn:big }); }, 300);
};

/* ascolto di una frase → scegli il significato */
RENDER.listen_phrase = function(stage, step){
  var it = ITEMS[step.id];
  var wrong = distractors(it, 'it', 2);
  var options = shuffle([{ label:it.it, correct:true }].concat(wrong.map(function(o){ return { label:o.it }; })));
  var p = el('div', 'prompt');
  p.appendChild(el('div', 'lab', 'Ascolta la frase'));
  var big = el('button', 'speak', '🔊');
  big.type = 'button';
  big.style.cssText = 'width:88px;height:88px;font-size:2.2em;margin:10px auto;display:flex';
  big.setAttribute('aria-label', 'Ascolta di nuovo');
  big.addEventListener('click', function(){ Speech.say(it.en, { btn:big }); });
  p.appendChild(big);
  var show = el('button', 'btn small ghost', '👁️ mostra il testo');
  show.type = 'button';
  var txt = el('div', 'big', '· · ·');
  show.addEventListener('click', function(){ txt.textContent = it.en; show.remove(); });
  p.appendChild(show);
  p.appendChild(txt);
  if(state.settings.hint) show.click();
  multipleChoice(stage, {
    id: it.id, prompt: p, options: options,
    answerText: it.en + ' → ' + it.it, speakAnswer: it.en
  });
  setTimeout(function(){ Speech.say(it.en, { btn:big }); }, 300);
};

/* verbi irregolari */
RENDER.verb_past = function(stage, step){
  var it = ITEMS[step.id];
  var wrong = distractors(it, 'past', 3);
  var options = shuffle([{ label:it.past, correct:true }].concat(wrong.map(function(o){ return { label:o.past }; })));
  multipleChoice(stage, {
    id: it.id,
    prompt: promptBlock({ lab:'Past simple di…', text:it.en, speak:it.en, sub:'(' + it.it + ')' }),
    options: options, two:true,
    answerText: it.en + ' → ' + it.past + ' → ' + it.pp,
    speakAfter: it.past.replace('/', 'or'),
    speakAnswer: it.en + ', ' + it.past.replace('/', 'or') + ', ' + it.pp
  });
};
RENDER.verb_pp = function(stage, step){
  var it = ITEMS[step.id];
  var wrong = distractors(it, 'pp', 3);
  var options = shuffle([{ label:it.pp, correct:true }].concat(wrong.map(function(o){ return { label:o.pp }; })));
  multipleChoice(stage, {
    id: it.id,
    prompt: promptBlock({ lab:'Past participle di…', text:it.en, speak:it.en, sub:'(' + it.it + ')' }),
    options: options, two:true,
    answerText: it.en + ' → ' + it.past + ' → ' + it.pp,
    speakAfter: it.pp,
    speakAnswer: it.en + ', ' + it.past.replace('/', 'or') + ', ' + it.pp
  });
};
RENDER.verb_it = function(stage, step){
  var it = ITEMS[step.id];
  var wrong = distractors(it, 'en', 3);
  var options = shuffle([{ label:it.en, correct:true }].concat(wrong.map(function(o){ return { label:o.en }; })));
  multipleChoice(stage, {
    id: it.id,
    prompt: promptBlock({ lab:'Quale verbo significa…', text:it.it }),
    options: options, two:true,
    answerText: it.en + ' (' + it.past + ' · ' + it.pp + ')',
    speakAfter: it.en, speakAnswer: it.en
  });
};

/* grammatica: quiz */
RENDER.gram = function(stage, step){
  var it = ITEMS[step.id];
  var options = it.opts.map(function(o, i){ return { label:o, correct: i === it.a }; });
  var full = it.q.replace('___', it.opts[it.a]);
  multipleChoice(stage, {
    id: it.id,
    prompt: promptBlock({ lab:'Completa la frase', text:it.q }),
    options: options, two:true,
    answerText: full, why: it.why, speakAnswer: full, speakAfter: full
  });
};

/* grammatica: spiegazione */
RENDER.slide = function(stage, step){
  var g = GRAMMAR.filter(function(x){ return x.id === step.gram; })[0];
  var sl = g.slides[step.k];
  var box = el('div', 'card gram');
  var head = el('div');
  head.style.cssText = 'display:flex;align-items:center;gap:10px';
  head.appendChild(el('span', null, g.icon)).style.fontSize = '2em';
  var ht = el('div');
  ht.appendChild(el('h3', null, g.title));
  ht.appendChild(el('small', null, g.sub)).style.color = 'var(--ink-soft)';
  head.appendChild(ht);
  box.appendChild(head);

  var rule = el('div', 'rule');
  if(sl.tag) rule.appendChild(el('span', 'tag', sl.tag));
  rule.appendChild(el('h3', null, sl.h));
  rule.appendChild(el('p', null, sl.p)).style.margin = '.2em 0 0';
  box.appendChild(rule);

  sl.ex.forEach(function(e, i){
    var row = el('div', 'ex');
    row.style.animation = 'slide-up .35s cubic-bezier(.22,1,.36,1) both';
    row.style.animationDelay = (120 + i * 120) + 'ms';
    var b = el('b', null, e[0]);
    row.appendChild(b);
    row.appendChild(speakBtn(e[0], { small:true }));
    row.appendChild(el('span', 'it', e[1]));
    box.appendChild(row);
  });
  stage.appendChild(box);

  var go = el('button', 'btn primary wide', step.k < g.slides.length - 1 ? 'Avanti →' : 'Proviamo! →');
  go.type = 'button'; go.style.marginTop = '14px';
  go.addEventListener('click', nextStep);
  stage.appendChild(go);
  if(state.settings.auto && sl.ex[0]) setTimeout(function(){ Speech.say(sl.ex[0][0]); }, 400);
};

/* ---------- costruttore di frasi ---------- */
RENDER.build = function(stage, step){
  var it = ITEMS[step.id];
  var full = it.exEn || it.en;
  var m = full.match(/^(.*?)([.?!]+)$/);
  var base = m ? m[1] : full;
  var punct = m ? m[2] : '';
  var words = base.split(/\s+/).filter(Boolean);

  stage.appendChild(promptBlock({ lab:'Metti in ordine le parole', text:it.exIt || it.it }));

  var slots = el('div', 'build-slots');
  slots.setAttribute('aria-label', 'La tua frase');
  var bank = el('div', 'build-bank');
  bank.setAttribute('aria-label', 'Parole disponibili');
  stage.appendChild(slots);
  var tail = el('div');
  tail.style.cssText = 'text-align:right;font-weight:800;font-size:1.2em;color:var(--ink-soft);margin-top:4px';
  tail.textContent = punct ? '… ' + punct : '';
  stage.appendChild(tail);
  stage.appendChild(bank);

  var placed = [];
  var tiles = shuffle(words).map(function(w, i){
    var t = el('button', 'tile', w);
    t.type = 'button';
    t.style.animationDelay = (i * 40) + 'ms';
    t.dataset.w = w;
    bank.appendChild(t);
    attach(t);
    return t;
  });

  function place(t, index){
    if(placed.indexOf(t) >= 0) return;
    t.classList.add('placed');
    if(index == null || index >= placed.length){ slots.appendChild(t); placed.push(t); }
    else { slots.insertBefore(t, placed[index]); placed.splice(index, 0, t); }
    update();
  }
  function unplace(t){
    var k = placed.indexOf(t);
    if(k < 0) return;
    placed.splice(k, 1);
    t.classList.remove('placed');
    bank.appendChild(t);
    update();
  }
  function update(){
    check.disabled = placed.length !== words.length;
    slots.setAttribute('aria-label', 'La tua frase: ' + placed.map(function(t){ return t.dataset.w; }).join(' '));
  }
  function insertIndexAt(x, y){
    for(var i = 0; i < placed.length; i++){
      var r = placed[i].getBoundingClientRect();
      if(y < r.bottom && x < r.left + r.width / 2) return i;
    }
    return placed.length;
  }

  /* tocco + trascinamento con Pointer Events (iPhone e Mac) */
  function attach(t){
    var start = null, ghost = null, moved = false;
    t.addEventListener('keydown', function(e){
      if(e.key === 'Enter' || e.key === ' '){
        e.preventDefault();
        if(placed.indexOf(t) >= 0) unplace(t); else place(t);
      }
    });
    if(!window.PointerEvent){   // iPhone con iOS 12 o precedenti: solo tocco
      t.addEventListener('click', function(){
        if(placed.indexOf(t) >= 0) unplace(t); else place(t);
        Speech.say(t.dataset.w);
      });
      return;
    }
    t.addEventListener('pointerdown', function(e){
      if(e.button != null && e.button !== 0) return;
      start = { x:e.clientX, y:e.clientY };
      moved = false;
      try{ t.setPointerCapture(e.pointerId); }catch(err){}
    });
    t.addEventListener('pointermove', function(e){
      if(!start) return;
      var dx = e.clientX - start.x, dy = e.clientY - start.y;
      if(!moved && Math.abs(dx) + Math.abs(dy) < 8) return;
      if(!moved){
        moved = true;
        var r = t.getBoundingClientRect();
        ghost = { ox: e.clientX - r.left, oy: e.clientY - r.top, w: r.width, h: r.height };
        t.classList.add('dragging');
        t.style.width = r.width + 'px';
        t.style.left = r.left + 'px';
        t.style.top = r.top + 'px';
      }
      t.style.left = (e.clientX - ghost.ox) + 'px';
      t.style.top = (e.clientY - ghost.oy) + 'px';
      var overSlots = hitTest(slots, e.clientX, e.clientY);
      slots.classList.toggle('over', overSlots);
    });
    function end(e){
      if(!start) return;
      var wasMoved = moved;
      start = null; moved = false;
      slots.classList.remove('over');
      if(wasMoved){
        var x = e.clientX, y = e.clientY;
        t.classList.remove('dragging');
        t.style.width = t.style.left = t.style.top = '';
        if(hitTest(slots, x, y)){
          if(placed.indexOf(t) >= 0){
            var cur = placed.indexOf(t);
            placed.splice(cur, 1); t.remove();
            var idx = insertIndexAt(x, y);
            placed.splice(idx, 0, t);
            slots.insertBefore(t, placed[idx + 1] || null);
            update();
          } else place(t, insertIndexAt(x, y));
        } else {
          if(placed.indexOf(t) >= 0) unplace(t);
        }
      } else {
        if(placed.indexOf(t) >= 0) unplace(t); else place(t);
        Speech.say(t.dataset.w);
      }
    }
    t.addEventListener('pointerup', end);
    t.addEventListener('pointercancel', function(){
      start = null;
      if(moved){ moved = false; t.classList.remove('dragging'); t.style.width = t.style.left = t.style.top = ''; }
      slots.classList.remove('over');
    });
  }
  function hitTest(node, x, y){
    var r = node.getBoundingClientRect();
    return x >= r.left - 12 && x <= r.right + 12 && y >= r.top - 12 && y <= r.bottom + 12;
  }

  var row = el('div');
  row.style.cssText = 'display:flex;gap:10px;margin-top:16px;flex-wrap:wrap';
  var hint = el('button', 'btn', '💡 Aiuto');
  hint.type = 'button';
  var helped = false;
  hint.addEventListener('click', function(){
    var i = 0;
    while(i < placed.length && placed[i].dataset.w === words[i]) i++;
    while(placed.length > i) unplace(placed[i]);
    var need = words[i];
    if(need == null) return;
    var cand = tiles.filter(function(t){ return placed.indexOf(t) < 0 && t.dataset.w === need; })[0];
    if(cand){ helped = true; place(cand); Speech.say(need); }
  });
  var check = el('button', 'btn primary', 'Controlla');
  check.type = 'button'; check.style.flex = '1'; check.disabled = true;
  check.addEventListener('click', function(){
    var got = placed.map(function(t){ return t.dataset.w; }).join(' ');
    var ok = got === base;
    placed.forEach(function(t, i){ t.classList.add(t.dataset.w === words[i] ? 'ok' : 'no'); });
    check.disabled = true; hint.disabled = true;
    record(it.id, ok && !helped);
    var m2 = $('#mascot');
    if(m2){ m2.classList.remove('happy', 'sad'); void m2.offsetWidth; m2.classList.add(ok ? 'happy' : 'sad'); }
    Speech.say(full);
    feedback(ok, {
      title: ok ? (helped ? 'Giusto, con un aiutino 💡' : pickPraise()) : 'La frase giusta è:',
      answer: full + (ok ? '' : ' — ' + (it.exIt || it.it)),
      speak: full
    });
  });
  row.appendChild(hint); row.appendChild(check);
  stage.appendChild(row);
};

/* ---------- fine livello ---------- */
function finishLevel(){
  var acc = S.answered ? S.correct / S.answered : 1;
  var stars = acc >= .9 ? 3 : acc >= .7 ? 2 : 1;
  var bonus = 20 + (stars - 1) * 10;
  state.xp += bonus;

  var prev = state.levels[S.lv.id];
  if(!S.review && S.lv.id !== 'l_review'){
    state.levels[S.lv.id] = {
      done: true,
      stars: Math.max(stars, (prev && prev.stars) || 0),
      best: Math.max(Math.round(acc * 100), (prev && prev.best) || 0)
    };
  }

  var t = today();
  if(state.lastDay !== t){
    var gap = state.lastDay ? daysBetween(state.lastDay, t) : 99;
    state.streak = gap === 1 ? state.streak + 1 : 1;
    state.lastDay = t;
    state.best = Math.max(state.best, state.streak);
    state.xp += 15;
  }
  save();
  UI.header();

  $('#result-ico').textContent = stars === 3 ? '🏆' : stars === 2 ? '🎉' : '💪';
  $('#result-title').textContent = S.review ? 'Ripasso finito!' : (stars === 3 ? 'Perfetto!' : 'Livello completato!');
  $('#result-sub').textContent = S.lv.name;
  $('#result-stars').textContent = '★'.repeat(stars) + '☆'.repeat(3 - stars);
  $('#res-xp').textContent = '+' + (S.correct * 10 + bonus);
  $('#res-acc').textContent = Math.round(acc * 100) + '%';
  $('#res-new').textContent = S.fresh;

  var rev = $('#result-review');
  rev.innerHTML = '';
  var uniq = [];
  S.wrong.forEach(function(id){ if(uniq.indexOf(id) < 0) uniq.push(id); });
  if(uniq.length){
    rev.hidden = false;
    rev.appendChild(el('b', null, '🔁 Da rivedere'));
    uniq.slice(0, 8).forEach(function(id){
      var it = ITEMS[id];
      var r = el('div');
      r.style.cssText = 'display:flex;align-items:center;gap:10px;padding:8px 0;border-top:2px solid var(--line)';
      var tx = el('div');
      tx.style.flex = '1';
      tx.appendChild(el('b', null, it.kind === 'verb' ? it.en + ' · ' + it.past + ' · ' + it.pp : it.en));
      tx.appendChild(el('div', null, it.it)).style.cssText = 'font-size:.86em;color:var(--ink-soft)';
      r.appendChild(el('span', null, it.emoji));
      r.appendChild(tx);
      r.appendChild(speakBtn(it.en, { small:true }));
      rev.appendChild(r);
    });
  } else rev.hidden = true;

  $('#btn-again').textContent = S.review ? 'Ripassa ancora' : 'Rifai il livello';
  UI.show('result');
  Confetti(stars === 3 ? 160 : 100, window.innerHeight * .3);
  var m = $('#mascot');
  if(m){ m.classList.remove('sad'); m.classList.add('happy'); }
  renderMap();
}

/* ---------- progressi ---------- */
function renderStats(){
  var seen = 0, mastered = 0;
  for(var id in state.srs){
    if(!ITEMS[id]) continue;
    if(state.srs[id].seen > 0) seen++;
    if(state.srs[id].box >= 4) mastered++;
  }
  $('#st-xp').textContent = state.xp;
  $('#st-streak').textContent = state.streak;
  $('#st-words').textContent = seen;
  $('#st-mastered').textContent = mastered;
  $('#st-acc').textContent = state.totals.answers
    ? Math.round(state.totals.correct / state.totals.answers * 100) + '%' : '—';
  $('#st-levels').textContent = Object.keys(state.levels).length;

  function rowFor(id){
    var it = ITEMS[id], s = state.srs[id];
    var r = el('div');
    r.style.cssText = 'display:flex;align-items:center;gap:10px;padding:8px 0;border-top:2px solid var(--line)';
    r.appendChild(el('span', null, it.emoji));
    var tx = el('div'); tx.style.flex = '1';
    tx.appendChild(el('b', null, it.kind === 'verb' ? it.en + ' · ' + it.past + ' · ' + it.pp : it.en));
    tx.appendChild(el('div', null, it.it + ' · ' + it.topicName)).style.cssText = 'font-size:.82em;color:var(--ink-soft)';
    r.appendChild(tx);
    r.appendChild(el('span', null, '●'.repeat(Math.max(1, s.box)) )).style.cssText = 'color:var(--ok);font-size:.7em;letter-spacing:1px';
    r.appendChild(speakBtn(it.en, { small:true }));
    return r;
  }

  var weak = $('#weak-list');
  weak.innerHTML = '';
  var hard = Object.keys(state.srs).filter(function(id){ return ITEMS[id] && state.srs[id].wrong > 0; })
    .sort(function(a, b){ return state.srs[b].wrong - state.srs[a].wrong; }).slice(0, 12);
  if(!hard.length) weak.appendChild(el('p', null, 'Ancora nessun errore da rivedere. Ottimo inizio! 🎯'));
  else hard.forEach(function(id){ weak.appendChild(rowFor(id)); });

  var dict = $('#dict-list');
  dict.innerHTML = '';
  var known = Object.keys(state.srs).filter(function(id){ return ITEMS[id] && state.srs[id].seen > 0; })
    .sort(function(a, b){ return ITEMS[a].en.localeCompare(ITEMS[b].en); });
  if(!known.length) dict.appendChild(el('p', null, 'Il dizionario si riempirà mano a mano che giochi.'));
  else known.forEach(function(id){ dict.appendChild(rowFor(id)); });
}

/* ---------- aiuto ---------- */
function showHelp(){
  alertBox([
    ['🚀', 'Segui il percorso', 'I livelli si sbloccano uno dopo l’altro. Quello che pulsa è il tuo prossimo passo.'],
    ['🔊', 'Ascolta tutto', 'Ogni parola e ogni frase ha il bottone dell’altoparlante. Tienilo premuto per sentirlo più lento.'],
    ['🔁', 'Ripasso intelligente', 'Le parole che sbagli tornano più spesso, quelle che sai tornano dopo giorni.'],
    ['⚙️', 'Cambia come vedi', 'Carattere, colori, dimensione del testo e spaziatura si regolano nelle impostazioni.'],
    ['⭐', 'XP e giorni di fila', 'Ogni risposta giusta vale 10 XP. Allenati un po’ ogni giorno per far crescere la fiamma 🔥.']
  ]);
}
function alertBox(rows){
  var back = $('#sheet-back'), sh = $('#sheet');
  var old = $('#help-panel');
  if(old) old.remove();
  var panel = el('section', 'sheet');
  panel.id = 'help-panel';
  var h = el('div');
  h.style.cssText = 'display:flex;align-items:center;gap:10px';
  h.appendChild(el('h2', null, '❓ Come funziona')).style.flex = '1';
  var x = el('button', 'btn icon', '✕');
  x.type = 'button';
  x.addEventListener('click', close);
  h.appendChild(x);
  panel.appendChild(h);
  rows.forEach(function(r){
    var d = el('div');
    d.style.cssText = 'display:flex;gap:12px;padding:12px 0;border-bottom:2px solid var(--line)';
    d.appendChild(el('span', null, r[0])).style.fontSize = '1.6em';
    var t = el('div');
    t.appendChild(el('b', null, r[1]));
    t.appendChild(el('div', null, r[2])).style.cssText = 'font-size:.9em;color:var(--ink-soft)';
    d.appendChild(t);
    panel.appendChild(d);
  });
  document.body.appendChild(panel);
  back.classList.add('open');
  requestAnimationFrame(function(){ panel.classList.add('open'); });
  function close(){
    panel.classList.remove('open'); back.classList.remove('open');
    setTimeout(function(){ panel.remove(); }, 320);
  }
  back.addEventListener('click', close, { once:true });
}

/* ---------- esporta / importa ---------- */
function saveViaLink(json, name){
  var url = URL.createObjectURL(new Blob([json], { type:'application/json' }));
  var a = el('a');
  a.href = url; a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(function(){ URL.revokeObjectURL(url); a.remove(); }, 1500);
  toast('Progressi salvati nel file 📁');
}
function exportData(){
  var json = JSON.stringify(state, null, 2);
  var name = 'english-quest-progressi-' + today() + '.json';
  // pubblicata come pagina web il salvataggio passa dal visualizzatore,
  // che chiede conferma; da file su disco basta il link normale
  if(typeof claude !== 'undefined' && claude && typeof claude.use === 'function'){
    claude.use('downloads').then(function(d){
      if(!d){ saveViaLink(json, name); return; }
      return d.save({ filename:name, data:json }).then(
        function(){ toast('Progressi salvati 📁'); },
        function(err){
          toast(err && err.code === 'declined' ? 'Salvataggio annullato' : 'Non riesco a salvare il file ⚠️');
        }
      );
    }, function(){ saveViaLink(json, name); });
    return;
  }
  saveViaLink(json, name);
}
function importData(file){
  var fr = new FileReader();
  fr.onload = function(){
    try{
      var o = JSON.parse(fr.result);
      if(!o || typeof o !== 'object') throw 0;
      ['xp', 'streak', 'best', 'lastDay', 'levels', 'srs', 'totals', 'settings'].forEach(function(k){
        if(o[k] != null) state[k] = o[k];
      });
      save(); applySettings(); UI.header(); renderMap();
      toast('Progressi caricati ✅');
    }catch(e){ toast('File non valido ⚠️'); }
  };
  fr.readAsText(file);
}

/* ---------- eventi ---------- */
function bind(){
  $('#btn-settings').addEventListener('click', function(){ Speech.unlock(); openSheet(true); });
  $('#sheet-close').addEventListener('click', function(){ openSheet(false); });
  $('#sheet-back').addEventListener('click', function(){ openSheet(false); });

  $('#btn-audio').addEventListener('click', function(){
    Speech.unlock();
    state.settings.auto = !state.settings.auto;
    save(); applySettings();
    toast(state.settings.auto ? 'Lettura automatica attiva 🔊' : 'Lettura automatica spenta 🔇');
  });

  $('#btn-back').addEventListener('click', function(){ UI.show('home'); renderMap(); });
  $('#btn-quit').addEventListener('click', function(){
    Speech.stop();
    UI.show('home'); renderMap();
  });
  $('#btn-review').addEventListener('click', function(){ Speech.unlock(); startReview(); });
  $('#btn-stats').addEventListener('click', function(){ renderStats(); UI.show('stats'); });
  $('#btn-help').addEventListener('click', showHelp);
  $('#btn-continue').addEventListener('click', function(){ UI.show('home'); renderMap(); });
  $('#btn-again').addEventListener('click', function(){
    if(S && S.review) startReview(); else if(S) startLevel(S.lv.id);
  });

  Array.prototype.forEach.call(document.querySelectorAll('#sheet [data-font]'), function(b){
    b.addEventListener('click', function(){ state.settings.font = b.getAttribute('data-font'); save(); applySettings(); });
  });
  Array.prototype.forEach.call(document.querySelectorAll('#sheet [data-theme]'), function(b){
    b.addEventListener('click', function(){ state.settings.theme = b.getAttribute('data-theme'); save(); applySettings(); });
  });
  Array.prototype.forEach.call(document.querySelectorAll('#sheet [data-anim]'), function(b){
    b.addEventListener('click', function(){ state.settings.anim = b.getAttribute('data-anim'); save(); applySettings(); });
  });
  Array.prototype.forEach.call(document.querySelectorAll('#sheet [data-auto]'), function(b){
    b.addEventListener('click', function(){ state.settings.auto = b.getAttribute('data-auto') === '1'; save(); applySettings(); });
  });
  Array.prototype.forEach.call(document.querySelectorAll('#sheet [data-hint]'), function(b){
    b.addEventListener('click', function(){ state.settings.hint = b.getAttribute('data-hint') === '1'; save(); applySettings(); });
  });

  $('#rng-fs').addEventListener('input', function(){ state.settings.fs = +this.value; applySettings(); });
  $('#rng-ls').addEventListener('input', function(){ state.settings.ls = +this.value; applySettings(); });
  $('#rng-lh').addEventListener('input', function(){ state.settings.lh = +this.value; applySettings(); });
  $('#rng-rate').addEventListener('input', function(){ state.settings.rate = +this.value; });
  ['#rng-fs', '#rng-ls', '#rng-lh', '#rng-rate'].forEach(function(s){
    $(s).addEventListener('change', save);
  });
  $('#sel-voice').addEventListener('change', function(){
    state.settings.voice = this.value;
    Speech.pick(this.value); save();
    Speech.say('Hello! This is your English voice.');
  });
  $('#btn-try-voice').addEventListener('click', function(){
    Speech.unlock();
    Speech.say('Hello! Let us learn English together.');
  });

  $('#btn-export').addEventListener('click', exportData);
  $('#btn-import').addEventListener('click', function(){ $('#file-import').click(); });
  $('#file-import').addEventListener('change', function(){ if(this.files[0]) importData(this.files[0]); this.value = ''; });
  $('#btn-reset').addEventListener('click', function(){
    if(!confirm('Vuoi davvero cancellare tutti i progressi e ricominciare da zero?')) return;
    var keep = state.settings;
    state = JSON.parse(JSON.stringify(DEFAULTS));
    state.settings = keep;
    save(); applySettings(); UI.header(); renderMap(); openSheet(false);
    toast('Si riparte da capo 🌱');
  });

  document.addEventListener('keydown', function(e){
    if(e.target && /INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return;
    if(UI.screen === 'lesson'){
      var st = $('#stage');
      var go = $('#feedback .btn');
      if((e.key === 'Enter' || e.key === ' ') && go){ e.preventDefault(); go.click(); return; }
      if(st && st._keys && !go) st._keys(e);
    }
    if(e.key === 'Escape'){
      if(!$('#sheet').hidden) openSheet(false);
      else if(UI.screen !== 'home'){ UI.show('home'); renderMap(); }
    }
  });

  window.addEventListener('popstate', function(){
    if(UI.screen !== 'home'){ Speech.stop(); UI.show('home', false); renderMap(); }
  });

  // iOS sblocca la voce solo dentro un vero gesto dell'utente:
  // ci si aggancia a tutti gli eventi possibili, non solo a pointerdown
  function unlockOnce(){
    Speech.unlock();
    document.removeEventListener('pointerdown', unlockOnce);
    document.removeEventListener('touchend', unlockOnce);
    document.removeEventListener('click', unlockOnce);
  }
  document.addEventListener('pointerdown', unlockOnce);
  document.addEventListener('touchend', unlockOnce);
  document.addEventListener('click', unlockOnce);
  document.addEventListener('visibilitychange', function(){ if(document.hidden) Speech.stop(); });
}

/* ---------- avvio ---------- */
function init(){
  applySettings();
  UI.header();
  bind();
  Speech.load();   // riempie il menu delle voci ora che l'interfaccia esiste
  renderMap();
  // la fiamma si spegne se salti più di un giorno
  if(state.lastDay && daysBetween(state.lastDay, today()) > 1){ state.streak = 0; save(); UI.header(); }
  try{ history.replaceState({ s:'home' }, ''); }catch(e){}
}
init();

/* utile per i test automatici */
window.EQ = {
  state: state, ITEMS: ITEMS, LEVELS: LEVELS, UNITS: UNITS, TOPICS: TOPICS,
  startLevel: startLevel, buildQueue: buildQueue, dueItems: dueItems, save: save,
  sess: function(){ return S; }
};
})();
