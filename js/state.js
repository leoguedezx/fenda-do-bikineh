/* === STATE & HELPERS === */
/* ═══════════════════════════════════
   HOVER SOUND — attach globally
═══════════════════════════════════ */
document.addEventListener('mouseover', e => {
  const el = e.target.closest('button, .tab-btn, .q-dot, .opt-btn, .lib-item, .tool-btn, .expl-head, .ptoggle, .site-title, .site-subtitle, .edit-btn, .pcard-status');
  if (el) sndHover();
}, { passive: true });

/* ═══════════════════════════════════
   STATE
═══════════════════════════════════ */
const embedded  = JSON.parse(document.getElementById('embedded-data').textContent);
let appTitle    = embedded.title    || 'Matéria';
let appSubtitle = embedded.subtitle || 'Banco de Questões';
let library     = embedded.library  || [];
let lastUsedSetIdx = 0;

let currentTab  = 'import';
let parsedQs    = [];
let activeSet   = null;
let quizState   = null;
let activeTool  = null;

/* ═══════════════════════════════════════════════════
   DÚVIDAS & INCOMPLETAS — state + helpers
═══════════════════════════════════════════════════ */

// doubts: { setId_qIdx: true }  — stored per session, persisted via saveCurrentFile
let _doubts = {}; // will be restored after embedded data loads
let _libSubTab = 'sets'; // 'sets' | 'doubt' | 'incomplete'
let _libSearch = '';        // search query for sets tab
let _libPage = {};          // { setIdx: currentPage } for expanded sets
let _libSearchPage = 0;     // current page in search results
const PAGE_SIZE = 5;        // questions per page
let _libSearchSet = 'all';  // filter by set index or 'all'
let _incSearch = '';        // search query for incomplete tab
let _incSearchSet = 'all';  // filter by set for incomplete
let activeSetIdx = -1; // which library set index is active (-1 = direct/not from library)

function getDoubtKey(setIdx, qIdx) {
  return 'set' + (library[setIdx]?.id || setIdx) + '_q' + qIdx;
}

function toggleDoubt(setIdx, qIdx) {
  const key = getDoubtKey(setIdx, qIdx);
  const q = library[setIdx] && library[setIdx].questions[qIdx];
  if (_doubts[key]) {
    delete _doubts[key];
    if (q) { q.doubt = false; delete q.doubtAt; }
    showNotif('Dúvida removida.');
  } else {
    _doubts[key] = { setIdx, qIdx, addedAt: Date.now() };
    if (q) { q.doubt = true; q.doubtAt = Date.now(); }
    showNotif('❓ Questão marcada como dúvida!');
  }
  // Re-render just the doubt button + nav dots
  const btn = document.getElementById('doubt-btn-' + qIdx);
  if (btn) btn.classList.toggle('active', !!_doubts[key]);
  // Re-render dots
  const dots = document.querySelectorAll('.q-dot');
  dots.forEach((dot, i) => {
    dot.classList.toggle('has-doubt', !!_doubts[getDoubtKey(setIdx, i)]);
  });
  sndSave();
}

function isDoubt(setIdx, qIdx) {
  return !!_doubts[getDoubtKey(setIdx, qIdx)];
}

// Get all doubt questions across all sets
function getAllDoubtQuestions() {
  const result = [];
  Object.values(_doubts).forEach(d => {
    const set = library[d.setIdx];
    if (!set) return;
    const q = set.questions[d.qIdx];
    if (!q) return;
    result.push({ set, setIdx: d.setIdx, q, qIdx: d.qIdx, addedAt: d.addedAt });
  });
  result.sort((a, b) => b.addedAt - a.addedAt);
  return result;
}

// Get all incomplete questions (no correct answer) across all sets
function getAllIncompleteQuestions() {
  const result = [];
  library.forEach((set, setIdx) => {
    set.questions.forEach((q, qIdx) => {
      if (!q.correct) {
        result.push({ set, setIdx, q, qIdx });
      }
    });
  });
  return result;
}

/* ── Sub-tab switcher in library ── */
function switchLibSubTab(tab) {
  sndClick();
  _libSubTab = tab;
  _libPage = {};
  render();
}

/* ── Copy question text for pasting into AI ── */
function copyIncompleteQuestion(setIdx, qIdx) {
  const q = library[setIdx]?.questions[qIdx];
  if (!q) return;
  const opts = q.options.map(o => o.letter + ') ' + o.text).join('\n');
  const text = (q.num ? 'Questão ' + q.num + '\n' : '') +
    q.text + '\n\n' + opts +
    '\n\nPor favor, indique o gabarito (A, B, C, D ou E) e forneça uma análise completa.';
  navigator.clipboard.writeText(text).then(() => {
    showNotif('✓ Questão copiada! Cole na IA para obter o gabarito.');
  }).catch(() => {
    showNotif('Não foi possível copiar automaticamente.', true);
  });
  sndSave();
}

/* ── Toggle the answer input form ── */
function toggleAddAnswer(setIdx, qIdx) {
  sndClick();
  const row = document.getElementById('add-answer-row-' + setIdx + '-' + qIdx);
  if (row) row.classList.toggle('open');
}

/* ── Select answer option letter ── */
function selectAnswerLetter(setIdx, qIdx, letter) {
  sndClick();
  const row = document.getElementById('add-answer-row-' + setIdx + '-' + qIdx);
  if (!row) return;
  row.querySelectorAll('.answer-opt-btn').forEach(b => b.classList.remove('selected'));
  const btn = row.querySelector('.answer-opt-btn[data-letter="' + letter + '"]');
  if (btn) btn.classList.add('selected');
  row.dataset.selectedLetter = letter;
  row.querySelectorAll('.alt-expl-badge').forEach(function(b){ b.classList.toggle('is-correct', b.textContent.trim()===letter); });
  row.querySelectorAll('.alt-expl-textarea').forEach(function(ta){ ta.classList.toggle('is-correct-field', ta.dataset.letter===letter); });
}

/* ── Confirm and save the answer for an incomplete question ── */
function confirmAddAnswer(setIdx, qIdx) {
  const row = document.getElementById('add-answer-row-' + setIdx + '-' + qIdx);
  if (!row) return;
  const letter = row.dataset.selectedLetter;
  if (!letter) { showNotif('Selecione uma alternativa primeiro.', true); return; }
  const expl = row.querySelector('.answer-expl-input')?.value?.trim() || '';
  const q = library[setIdx].questions[qIdx];
  q.correct = letter;
  q.explanation = expl;
  row.querySelectorAll('.alt-expl-textarea').forEach(function(ta) {
    const ae = q.altExplanations.find(function(a) { return a.letter === ta.dataset.letter; });
    if (ae) ae.explanation = ta.value.trim();
  });
  q.altExplanations.forEach(a => { a.correct = a.letter === letter; });

  sndSave();
  showNotif('✓ Gabarito "' + letter + '" salvo! Questão movida para o banco completo.');
  render();
}

/* ── Remove from doubt list (from doubt panel) ── */
function removeDoubt(setIdx, qIdx) {
  sndClick();
  const key = getDoubtKey(setIdx, qIdx);
  var _rd=_doubts[key];if(_rd&&library[_rd.setIdx]&&library[_rd.setIdx].questions[_rd.qIdx]){library[_rd.setIdx].questions[_rd.qIdx].doubt=false;delete library[_rd.setIdx].questions[_rd.qIdx].doubtAt;}
  delete _doubts[key];
  showNotif('Dúvida removida.');
  render();
}

/* ── Start quiz from doubt questions ── */
function startDoubtQuiz() {
  sndClick();
  const doubts = getAllDoubtQuestions();
  if (!doubts.length) { showNotif('Nenhuma dúvida marcada.', true); return; }
  const qs = doubts.map(d => d.q);
  activeSetIdx = -1;
  activeSet = { name: 'Revisão de Dúvidas (' + qs.length + ')', questions: qs };
  initQuiz();
  document.getElementById('quiz-tab-btn').style.display = '';
  switchTab('quiz');
}

/* ═══════════════════════════════════
   TITLE EDITING
═══════════════════════════════════ */
function editTitle() {
  sndClick();
  showModal({
    title: 'Editar Título', sub: 'Nome exibido no topo.',
    input: true, inputPlaceholder: appTitle, confirmLabel: 'Salvar',
    onConfirm: v => {
      if (!v?.trim()) return;
      appTitle = v.trim();
      document.getElementById('site-title-el').textContent = appTitle;
      document.getElementById('page-title').textContent = appTitle;
      sndSave();
    }
  });
}
function editSubtitle() {
  sndClick();
  showModal({
    title: 'Editar Subtítulo', sub: 'Texto em itálico abaixo do título.',
    input: true, inputPlaceholder: appSubtitle, confirmLabel: 'Salvar',
    onConfirm: v => {
      if (!v?.trim()) return;
      appSubtitle = v.trim();
      document.getElementById('site-subtitle-el').textContent = appSubtitle;
      sndSave();
    }
  });
}
