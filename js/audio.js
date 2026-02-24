/* === AUDIO ENGINE === */
/* ═══════════════════════════════════
   AUDIO ENGINE
═══════════════════════════════════ */
let _actx = null;
function actx() {
  if (!_actx) try { _actx = new (window.AudioContext||window.webkitAudioContext)(); } catch(e){}
  return _actx;
}
function resumeCtx() {
  const c = actx(); if (c && c.state === 'suspended') c.resume();
}

function tone(freq, type, dur, vol, delay=0) {
  const c = actx(); if (!c) return;
  setTimeout(() => {
    try {
      const o = c.createOscillator(), g = c.createGain();
      o.connect(g); g.connect(c.destination);
      o.type = type; o.frequency.setValueAtTime(freq, c.currentTime);
      g.gain.setValueAtTime(0, c.currentTime);
      g.gain.linearRampToValueAtTime(vol, c.currentTime + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
      o.start(c.currentTime); o.stop(c.currentTime + dur);
    } catch(e){}
  }, delay);
}

/* ── Hover tick — very soft, high freq click ── */
let _lastHover = 0;
function sndHover() {
  resumeCtx();
  const now = Date.now();
  if (now - _lastHover < 40) return; // debounce fast movement
  _lastHover = now;
  tone(1200, 'sine', 0.04, 0.028);
}

/* ── Menu click / tab switch ── */
function sndClick() {
  resumeCtx();
  tone(900, 'sine', 0.06, 0.04);
  tone(1100, 'sine', 0.05, 0.03, 35);
}

/* ── Dot navigation ── */
function sndNav() {
  resumeCtx();
  tone(700, 'sine', 0.07, 0.04);
  tone(880, 'sine', 0.06, 0.03, 40);
}

/* ── Correct answer ── */
function sndCorrect() {
  resumeCtx();
  tone(523, 'sine', 0.12, 0.1);
  tone(659, 'sine', 0.14, 0.09, 80);
  tone(784, 'sine', 0.22, 0.08, 160);
}

/* ── Wrong answer ── */
function sndWrong() {
  resumeCtx();
  tone(300, 'sine', 0.12, 0.1);
  tone(240, 'sine', 0.22, 0.09, 90);
}

/* ── Save ── */
function sndSave() {
  resumeCtx();
  tone(440, 'sine', 0.09, 0.07);
  tone(550, 'sine', 0.12, 0.06, 70);
}

/* ── Confetti ── */
function spawnConfetti() {
  const wrap = document.createElement('div'); wrap.className = 'confetti-wrap';
  document.body.appendChild(wrap);
  const cols = ['#e8b84b','#f5cc6a','#4ecb8d','#6eeaaa','#f06060','#c084fc','#fb923c','#fff'];
  for (let i = 0; i < 48; i++) {
    const p = document.createElement('div'); p.className = 'conf-piece';
    p.style.cssText = `left:${Math.random()*100}%;top:-20px;
      background:${cols[Math.floor(Math.random()*cols.length)]};
      width:${6+Math.random()*8}px;height:${6+Math.random()*8}px;
      border-radius:${Math.random()>0.5?'50%':'2px'};
      animation-duration:${1.3+Math.random()*1.8}s;
      animation-delay:${Math.random()*0.5}s;`;
    wrap.appendChild(p);
  }
  setTimeout(() => wrap.remove(), 3200);
}
