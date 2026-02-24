/* === TYPOGRAPHY PANEL & CHRONOMETER === */
/* ═══════════════════════════════════
   TYPOGRAPHY PANEL ENGINE
═══════════════════════════════════ */
const FONTS = [
  { key: 'libre',   label: 'Baskerville', css: "'Libre Baskerville', serif" },
  { key: 'lora',    label: 'Lora',        css: "'Lora', serif" },
  { key: 'merri',   label: 'Merriweather',css: "'Merriweather', serif" },
  { key: 'source',  label: 'Source Serif',css: "'Source Serif 4', serif" },
  { key: 'nunito',  label: 'Nunito',      css: "'Nunito', sans-serif" },
  { key: 'raleway', label: 'Raleway',     css: "'Raleway', sans-serif" },
  { key: 'ibm',     label: 'IBM Plex',    css: "'IBM Plex Sans', sans-serif" },
];

const typoState = {
  q:    { font: FONTS[0].css, size: 15.5 },
  opt:  { font: FONTS[4].css, size: 14.5 },
  expl: { font: FONTS[0].css, size: 14.5 },
};

const TYPO_DEFAULTS = {
  q:    { font: FONTS[0].css, size: 15.5 },
  opt:  { font: FONTS[4].css, size: 14.5 },
  expl: { font: FONTS[0].css, size: 14.5 },
};

function typoInit() {
  ['q', 'opt', 'expl'].forEach(zone => {
    const grid = document.getElementById(`typo-${zone}-fonts`);
    if (!grid) return;
    grid.innerHTML = FONTS.map((f, i) => {
      const active = typoState[zone].font === f.css ? 'active' : '';
      return `<span class="typo-font-pill ${active}" style="font-family:${f.css}"
        onclick="typoSetFont('${zone}',${i},this)">${f.label}</span>`;
    }).join('');
  });
  typoApplyAll();
  // sync sliders
  ['q','opt','expl'].forEach(zone => {
    const sl = document.getElementById(`typo-${zone}-slider`);
    if (sl) sl.value = typoState[zone].size;
    const val = document.getElementById(`typo-${zone}-val`);
    if (val) val.textContent = typoState[zone].size + 'px';
  });
}

function typoToggle() {
  sndClick();
  const panel = document.getElementById('typo-panel');
  panel.classList.toggle('open');
}

function typoSetFont(zone, idx, el) {
  sndClick();
  typoState[zone].font = FONTS[idx].css;
  // update pills
  el.closest('.typo-font-grid').querySelectorAll('.typo-font-pill').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  typoApply(zone);
  typoUpdatePreview(zone);
}

function typoSlider(zone, val) {
  typoState[zone].size = parseFloat(val);
  const valEl = document.getElementById(`typo-${zone}-val`);
  if (valEl) valEl.textContent = parseFloat(val).toFixed(1) + 'px';
  typoApply(zone);
  typoUpdatePreview(zone);
}

function typoChange(zone, prop, delta) {
  sndClick();
  const cur = typoState[zone].size;
  const next = Math.min(Math.max(cur + delta, 11), 24);
  typoState[zone].size = next;
  const sl = document.getElementById(`typo-${zone}-slider`);
  if (sl) sl.value = next;
  const valEl = document.getElementById(`typo-${zone}-val`);
  if (valEl) valEl.textContent = next.toFixed(1) + 'px';
  typoApply(zone);
  typoUpdatePreview(zone);
}

function typoApply(zone) {
  const root = document.documentElement;
  if (zone === 'q') {
    root.style.setProperty('--typo-q-font', typoState.q.font);
    root.style.setProperty('--typo-q-size', typoState.q.size + 'px');
  } else if (zone === 'opt') {
    root.style.setProperty('--typo-opt-font', typoState.opt.font);
    root.style.setProperty('--typo-opt-size', typoState.opt.size + 'px');
  } else if (zone === 'expl') {
    root.style.setProperty('--typo-expl-font', typoState.expl.font);
    root.style.setProperty('--typo-expl-size', typoState.expl.size + 'px');
    root.style.setProperty('--typo-alt-size', (typoState.expl.size - 1) + 'px');
  }
}

function typoApplyAll() {
  ['q','opt','expl'].forEach(z => typoApply(z));
}

function typoUpdatePreview(zone) {
  const el = document.getElementById(`typo-${zone}-preview`);
  if (!el) return;
  el.style.fontFamily = typoState[zone].font;
  el.style.fontSize   = typoState[zone].size + 'px';
}

function typoReset() {
  sndClick();
  ['q','opt','expl'].forEach(zone => {
    typoState[zone].font = TYPO_DEFAULTS[zone].font;
    typoState[zone].size = TYPO_DEFAULTS[zone].size;
    typoApply(zone);
    const sl = document.getElementById(`typo-${zone}-slider`);
    if (sl) sl.value = TYPO_DEFAULTS[zone].size;
    const valEl = document.getElementById(`typo-${zone}-val`);
    if (valEl) valEl.textContent = TYPO_DEFAULTS[zone].size + 'px';
  });
  // Reset pills
  typoInit();
  showNotif('Tipografia restaurada.');
}

// Init after DOM ready
document.addEventListener('DOMContentLoaded', typoInit);

/* ═══════════════════════════════════
   CHRONOMETER
═══════════════════════════════════ */
const chrono = {
  running:   false,
  elapsed:   0,       // ms accumulated
  startedAt: null,    // Date.now() when last started
  interval:  null,
  laps:      [],
  collapsed: true
};

function chronoFmt(ms) {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h,m,s].map(n => n.toString().padStart(2,'0')).join(':');
}

function chronoTick() {
  const now = Date.now();
  const total = chrono.elapsed + (now - chrono.startedAt);
  const el = document.getElementById('chrono-display');
  if (el) el.textContent = chronoFmt(total);
}

function chronoToggle() {
  sndClick();
  if (chrono.running) {
    // Pause
    chrono.elapsed += Date.now() - chrono.startedAt;
    clearInterval(chrono.interval);
    chrono.running = false;
    const el = document.getElementById('chrono-display');
    if (el) { el.classList.remove('running'); el.classList.add('paused'); }
    const btn = document.getElementById('chrono-play-btn');
    if (btn) btn.textContent = '▶ Continuar';
    btn.className = 'chrono-btn start';
  } else {
    // Start / Resume
    chrono.startedAt = Date.now();
    chrono.interval = setInterval(chronoTick, 500);
    chrono.running = true;
    const el = document.getElementById('chrono-display');
    if (el) { el.classList.add('running'); el.classList.remove('paused'); }
    const btn = document.getElementById('chrono-play-btn');
    if (btn) { btn.textContent = '⏸ Pausar'; btn.className = 'chrono-btn stop'; }
  }
}

function chronoReset() {
  sndClick();
  clearInterval(chrono.interval);
  chrono.running = false;
  chrono.elapsed = 0;
  chrono.startedAt = null;
  chrono.laps = [];
  const el = document.getElementById('chrono-display');
  if (el) { el.textContent = '00:00:00'; el.classList.remove('running'); el.classList.add('paused'); }
  const btn = document.getElementById('chrono-play-btn');
  if (btn) { btn.textContent = '▶ Iniciar'; btn.className = 'chrono-btn start'; }
  const lapsEl = document.getElementById('chrono-laps');
  if (lapsEl) lapsEl.innerHTML = '';
}

function chronoLap() {
  sndClick();
  if (!chrono.running && chrono.elapsed === 0) return;
  const total = chrono.elapsed + (chrono.running ? Date.now() - chrono.startedAt : 0);
  const n = chrono.laps.length + 1;
  chrono.laps.push(total);
  const lapsEl = document.getElementById('chrono-laps');
  if (!lapsEl) return;
  const item = document.createElement('div');
  item.className = 'chrono-lap-item';
  item.innerHTML = `<span class="lap-n">#${n}</span><span>${chronoFmt(total)}</span>`;
  lapsEl.insertBefore(item, lapsEl.firstChild);
}

function chronoToggleCollapse() {
  sndClick();
  chrono.collapsed = !chrono.collapsed;
  const w = document.getElementById('chrono-widget');
  if (w) w.classList.toggle('collapsed', chrono.collapsed);
  const btn = w?.querySelector('.chrono-collapse-btn');
  if (btn) btn.textContent = chrono.collapsed ? '+' : '—';
}
