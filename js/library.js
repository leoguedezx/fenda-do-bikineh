/* === LIBRARY TAB === */
/* ═══════════════════════════════════
   LIBRARY
═══════════════════════════════════ */
function renderLibrary(s) {
  const doubts = getAllDoubtQuestions();
  const incompletes = getAllIncompleteQuestions();
  const completeSets = library.length;
  const subTabs = '<div class="lib-sub-tabs">'
    + '<button class="lib-sub-tab ' + (_libSubTab==='sets'?'active':'') + '" onclick="switchLibSubTab(\'sets\')">'
    + '📚 Conjuntos <span class="lib-sub-badge">' + completeSets + '</span></button>'
    + '<button class="lib-sub-tab doubt-tab ' + (_libSubTab==='doubt'?'active':'') + '" onclick="switchLibSubTab(\'doubt\')">'
    + '❓ Dúvidas <span class="lib-sub-badge">' + doubts.length + '</span></button>'
    + '<button class="lib-sub-tab incomplete-tab ' + (_libSubTab==='incomplete'?'active':'') + '" onclick="switchLibSubTab(\'incomplete\')">'
    + '◌ Incompletas <span class="lib-sub-badge">' + incompletes.length + '</span></button>'
    + '</div>';
  if (_libSubTab === 'doubt') { s.innerHTML = renderDoubtPanel(subTabs, doubts); return; }
  if (_libSubTab === 'incomplete') { s.innerHTML = renderIncompletePanel(subTabs, incompletes); return; }
  if(!library.length){
    s.innerHTML='<div style="animation:fadeUp 0.5s ease both"><div class="card accent">'
      + subTabs
      +'<div style="display:flex;flex-direction:column;align-items:center;gap:20px;padding:32px 20px;text-align:center">'
      +'<div class="empty-icon" style="opacity:.18;font-size:36px">&#9672;</div>'
      +'<div><h3 style="font-family:var(--font-display);font-size:1.15rem;color:var(--text3);margin-bottom:6px">Biblioteca vazia</h3>'
      +'<p style="font-size:13px;color:var(--text4)">Importe e salve conjuntos de questões.</p></div>'
      +'<div style="display:flex;flex-direction:column;gap:10px;width:100%;max-width:300px">'
      +'<button class="btn btn-primary" style="justify-content:center" onclick="switchTab(\'import\')">&#65291; Importar Texto</button>'
      +'<button class="btn btn-secondary" style="justify-content:center" onclick="importSetFromFile()"><svg width="14" height="14" viewBox="0 0 16 16" fill="none" style="margin-right:6px;flex-shrink:0"><path d="M1.5 3.5C1.5 2.67 2.17 2 3 2h3.38l1.5 1.5H13c.83 0 1.5.67 1.5 1.5V5H1.5V3.5z" fill="currentColor" opacity=".4"/><rect x="1.5" y="5" width="13" height="9" rx="1.5" fill="currentColor"/></svg>Importar Conjunto</button>'
      +'<button class="btn btn-secondary" style="justify-content:center;border-color:rgba(240,184,74,0.38);color:var(--gold)" onclick="importSetFromFile()"><svg width="14" height="14" viewBox="0 0 16 16" fill="none" style="margin-right:6px;flex-shrink:0"><path d="M1.5 3.5C1.5 2.67 2.17 2 3 2h3.38l1.5 1.5H13c.83 0 1.5.67 1.5 1.5V5H1.5V3.5z" fill="currentColor" opacity=".4"/><rect x="1.5" y="5" width="13" height="9" rx="1.5" fill="currentColor"/></svg>Importar Biblioteca</button>'
      +'</div></div></div></div>';
    return;
  }

  // ── Build search/filter bar ──
  const setFilterOptions = '<option value="all"' + (_libSearchSet==='all'?' selected':'') + '>Todos os conjuntos</option>'
    + library.map(function(set,i){ return '<option value="'+i+'"'+(String(i)===String(_libSearchSet)?' selected':'')+'>'+set.name+'</option>'; }).join('');

  const searchBar = '<div class="lib-search-bar">'
    + '<div class="lib-search-row">'
    + '<input id="lib-search-input" class="lib-search-input" '
    + 'placeholder="🔍 Buscar por enunciado ou alternativa..." value="' + (_libSearch||'').replace(/"/g,'&quot;') + '" '
    + 'oninput="_libSearch=this.value;renderLibraryResults()" />'
    + '<select id="lib-set-filter" class="lib-set-filter" '
    + 'onchange="_libSearchSet=this.value;renderLibraryResults()">' + setFilterOptions + '</select>'
    + '</div>'
    + '<button class="lib-clear-btn" '
    + 'onclick="_libSearch=\'\';_libSearchSet=\'all\';document.getElementById(\'lib-search-input\').value=\'\';document.getElementById(\'lib-set-filter\').value=\'all\';renderLibraryResults()">✕ Limpar</button>'
    + '</div>'
    + '<div id="lib-results-area"></div>';

  s.innerHTML='<div style="animation:fadeUp 0.5s ease both">'
    +'<div class="card accent">'
    + subTabs
    +'<div class="section-lbl">Conjuntos Salvos</div>'
    + searchBar
    +'<div id="lib-sets-area"></div>'
    +'<div class="btn-row" style="margin-top:20px;border-top:1px solid var(--border);padding-top:20px;flex-wrap:wrap;gap:8px">'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;width:100%;margin-bottom:8px">'
    +'<button class="btn btn-secondary" style="justify-content:center" onclick="switchTab(\'import\')">&#65291; Importar Texto</button>'
    +'<button class="btn btn-secondary" style="justify-content:center" onclick="importSetFromFile()"><svg width="14" height="14" viewBox="0 0 16 16" fill="none" style="margin-right:6px;flex-shrink:0"><path d="M1.5 3.5C1.5 2.67 2.17 2 3 2h3.38l1.5 1.5H13c.83 0 1.5.67 1.5 1.5V5H1.5V3.5z" fill="currentColor" opacity=".4"/><rect x="1.5" y="5" width="13" height="9" rx="1.5" fill="currentColor"/></svg>Importar Conjunto</button>'
    +'<button class="btn btn-secondary" style="justify-content:center;border-color:rgba(240,184,74,0.38);color:var(--gold)" onclick="importSetFromFile()"><svg width="14" height="14" viewBox="0 0 16 16" fill="none" style="margin-right:6px;flex-shrink:0"><path d="M1.5 3.5C1.5 2.67 2.17 2 3 2h3.38l1.5 1.5H13c.83 0 1.5.67 1.5 1.5V5H1.5V3.5z" fill="currentColor" opacity=".4"/><rect x="1.5" y="5" width="13" height="9" rx="1.5" fill="currentColor"/></svg>Importar Biblioteca</button>'
    +'<button class="btn btn-secondary" style="justify-content:center;border-color:rgba(240,184,74,0.38);color:var(--gold)" onclick="exportLibrary()"><svg width="14" height="14" viewBox="0 0 16 16" fill="none" style="margin-right:6px;flex-shrink:0"><path d="M1.5 3.5C1.5 2.67 2.17 2 3 2h3.38l1.5 1.5H13c.83 0 1.5.67 1.5 1.5V5H1.5V3.5z" fill="currentColor" opacity=".5"/><rect x="1.5" y="5" width="13" height="9" rx="1.5" fill="currentColor"/><path d="M8 12.5V8M5.5 10.5L8 8l2.5 2.5" stroke="#050507" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>Exportar Biblioteca</button>'
    +'</div>'
    +'<button class="btn btn-primary" style="width:100%;justify-content:center" onclick="sndClick();saveCurrentFile()">&#11015; Salvar HTML</button>'
    +'</div></div></div>';

  renderLibraryResults();
}

function _analysisStatus(quest){
  if(!quest.correct)return 'none';
  var opts=quest.options||[],filled=0;
  opts.forEach(function(o,oi){var ae=quest.altExplanations&&quest.altExplanations[oi];if(ae&&ae.explanation&&ae.explanation.trim())filled++;});
  var hasG=!!(quest.explanation&&quest.explanation.trim());
  if(filled===opts.length&&hasG)return 'complete';
  if(filled>0||hasG)return 'partial';
  return 'none';
}
function buildEditAnalysisPanel(cardId,si,qi,quest){
  var altRows=(quest.options||[]).map(function(o,oi){
    var isC=quest.correct===o.letter?'is-correct':'';
    var ae=(quest.altExplanations&&quest.altExplanations[oi])||{};
    var saved=(ae.explanation||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/'/g,'&#39;').replace(/"/g,'&quot;');
    var optTxt=(o.text||'').replace(/<[^>]+>/g,'').slice(0,50);
    return '<div class="alt-expl-row"><div class="alt-expl-row-header"><span class="alt-expl-badge '+isC+'">'+o.letter+'</span><span class="alt-expl-opt-text">'+optTxt+'</span></div><textarea class="alt-expl-textarea '+isC+'" data-letter="'+o.letter+'" placeholder="Justificativa '+o.letter+')...">'+saved+'</textarea></div>';
  }).join('');
  var savedG=(quest.explanation||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/'/g,'&#39;').replace(/"/g,'&quot;');
  return '<div class="sqc-edit-panel" id="sqc-edit-'+cardId+'" onclick="event.stopPropagation()">'
    +'<div class="sqc-edit-panel-label">Editar an\u00e1lise</div>'
    +'<div class="alt-expl-section">'+altRows+'</div>'
    +'<div class="alt-expl-general-label" style="margin-top:8px">An\u00e1lise geral</div>'
    +'<textarea class="answer-expl-input" placeholder="An\u00e1lise geral..." style="margin-top:4px;min-height:160px;box-sizing:border-box">'+savedG+'</textarea>'
    +'<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:6px;">'
    +'<button class="btn btn-secondary" style="font-size:11px;padding:6px 14px" onclick="toggleEditAnalysis(\''+cardId+'\','+si+','+qi+')">Cancelar</button>'
    +'<button class="btn btn-primary" style="font-size:11px;padding:6px 14px" onclick="saveEditAnalysis(\''+cardId+'\','+si+','+qi+')">\u2713 Salvar</button>'
    +'</div></div>';
}
function buildSetQuestionCard(quest,qi,si){
  const raw=(quest.text||'').replace(/<[^>]+>/g,'');
  const cardId='sqc-'+si+'-'+qi;
  const alts=quest.options.map(function(o){
    const isCo=o.letter===quest.correct;
    return '<div style="font-size:12px;padding:3px 0;display:flex;align-items:flex-start;gap:6px;">'
      +'<span style="font-family:var(--font-mono);font-size:11px;min-width:20px;flex-shrink:0;color:var(--text3);">'+o.letter+')</span>'
      +'<span class="alt-text-'+cardId+'" data-correct="'+isCo+'" style="color:var(--text2);line-height:1.5;">'+o.text+'</span></div>';
  }).join('');
  const status=_analysisStatus(quest);
  const statusBadge=quest.correct?(
    status==='complete'?'<span class="sqc-analysis-badge complete">\u2713 an\u00e1lise completa</span>'
    :status==='partial'?'<span class="sqc-analysis-badge partial">\u270f parcial</span>'
    :'<span class="sqc-analysis-badge none">\u26a0 sem an\u00e1lise</span>'
  ):'';
  const editBtn=quest.correct?'<button class="sqc-edit-btn" onclick="event.stopPropagation();toggleEditAnalysis(\''+cardId+'\','+si+','+qi+')">&#9998; Editar an\u00e1lise</button>':'';
  const gabBtn=quest.correct
    ?'<button id="gab-btn-'+cardId+'" onclick="event.stopPropagation();toggleGabarito(\''+cardId+'\',\''+quest.correct+'\')" style="font-size:10px;font-family:var(--font-mono);padding:3px 10px;border-radius:5px;border:1px solid var(--border2);background:transparent;color:var(--text3);cursor:pointer;transition:all 0.15s;" data-open="false" onmouseover="if(this.dataset.open!==\'true\'){this.style.borderColor=\'var(--green)\';this.style.color=\'var(--green)\'}" onmouseout="if(this.dataset.open!==\'true\'){this.style.borderColor=\'var(--border2)\';this.style.color=\'var(--text3)\'}">&#128065; Ver gabarito</button>'
    :'<span style="font-size:10px;font-family:var(--font-mono);color:var(--violet);opacity:0.7;">sem gabarito</span>';
  const editPanel=quest.correct?buildEditAnalysisPanel(cardId,si,qi,quest):'';
  return '<div id="sqcard-'+cardId+'" style="border:1px solid var(--border2);border-radius:6px;padding:10px 12px;margin-bottom:8px;transition:border-color 0.15s;" onmouseover="this.style.borderColor=\'var(--gold-d)\'" onmouseout="this.style.borderColor=\'var(--border2)\'">'
    +'<div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;flex-wrap:wrap;">'
    +'<span style="font-family:var(--font-mono);font-size:10px;color:var(--gold);background:var(--gold-bg);border:1px solid rgba(232,184,75,0.2);border-radius:4px;padding:1px 7px;cursor:pointer;" onclick="startDoubtSingle('+si+','+qi+')">Q'+(quest.num||qi+1)+'</span>'
    +statusBadge+'</div>'
    +'<div style="font-size:13px;color:var(--text);line-height:1.6;margin-bottom:10px;cursor:pointer;" onclick="startDoubtSingle('+si+','+qi+')">'+raw+'</div>'
    +'<div style="display:flex;flex-direction:column;gap:1px;border-top:1px solid var(--border);padding-top:8px;">'+alts+'</div>'
    +'<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:8px;">'+gabBtn+editBtn+'</div>'
    +editPanel+'</div>';
}
function toggleGabarito(cardId, correct) {
  const btn = document.getElementById('gab-btn-' + cardId);
  if (!btn) return;
  const isOpen = btn.dataset.open === 'true';
  if (isOpen) {
    document.querySelectorAll('.alt-text-' + cardId).forEach(function(el) {
      el.style.color = 'var(--text2)'; el.style.fontWeight = '';
    });
    btn.textContent = '👁 Ver gabarito';
    btn.style.borderColor = 'var(--border2)'; btn.style.color = 'var(--text3)';
    btn.dataset.open = 'false';
  } else {
    document.querySelectorAll('.alt-text-' + cardId).forEach(function(el) {
      if (el.dataset.correct === 'true') { el.style.color = 'var(--green)'; el.style.fontWeight = '600'; }
      else { el.style.color = 'var(--text3)'; el.style.fontWeight = ''; }
    });
    btn.textContent = '🙈 Ocultar gabarito';
    btn.style.borderColor = 'var(--green)'; btn.style.color = 'var(--green)';
    btn.dataset.open = 'true';
  }
}

function buildPaginator(total, page, fnName, fnArg) {
  // fnName: function to call, fnArg: first arg (set index), page is second arg
  // generates onclick="fnName(fnArg, p)" — if fnArg is '', generates onclick="fnName(p)"
  if (total <= PAGE_SIZE) return '';
  const totalPages = Math.ceil(total / PAGE_SIZE);
  function makeCall(p) {
    return fnArg !== '' ? fnName + '(' + fnArg + ',' + p + ')' : fnName + '(' + p + ')';
  }
  const btnStyle = 'padding:5px 12px;border-radius:5px;cursor:pointer;font-size:12px;font-family:var(--font-mono);transition:all 0.12s;';
  const prev = page > 0
    ? '<button onclick="' + makeCall(page-1) + '" style="' + btnStyle + 'border:1px solid var(--border2);background:transparent;color:var(--text2);">‹ Ant.</button>'
    : '<button disabled style="' + btnStyle + 'border:1px solid var(--border);background:transparent;color:var(--text4);cursor:default;">‹ Ant.</button>';
  const next = page < totalPages-1
    ? '<button onclick="' + makeCall(page+1) + '" style="' + btnStyle + 'border:1px solid var(--border2);background:transparent;color:var(--text2);">Próx. ›</button>'
    : '<button disabled style="' + btnStyle + 'border:1px solid var(--border);background:transparent;color:var(--text4);cursor:default;">Próx. ›</button>';
  const pills = [];
  for (var p = 0; p < totalPages; p++) {
    const isActive = p === page;
    const s = p * PAGE_SIZE + 1;
    const e = Math.min((p+1) * PAGE_SIZE, total);
    pills.push('<button onclick="' + makeCall(p) + '" style="' + btnStyle
      + 'border:1px solid ' + (isActive ? 'var(--gold-d)' : 'var(--border2)') + ';'
      + 'background:' + (isActive ? 'var(--gold-bg)' : 'transparent') + ';'
      + 'color:' + (isActive ? 'var(--gold)' : 'var(--text3)') + ';">'
      + s + '–' + e + '</button>');
  }
  return '<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin:12px 0 4px;border-top:1px solid var(--border);padding-top:10px;">'
    + prev + pills.join('') + next
    + '<span style="font-size:10px;color:var(--text4);font-family:var(--font-mono);margin-left:6px;">' + total + ' questões · pág. ' + (page+1) + '/' + totalPages + '</span>'
    + '</div>';
}

function setExpandPage(si, page) {
  if (!_libPage) _libPage = {};
  _libPage[si] = page;
  const body = document.getElementById('set-expand-body-' + si);
  if (!body) return;
  const set = library[si];
  if (!set) return;
  const total = set.questions.length;
  const start = page * PAGE_SIZE;
  const pageQs = set.questions.slice(start, start + PAGE_SIZE);
  const qCards = pageQs.map(function(quest, j){ return buildSetQuestionCard(quest, start+j, si); }).join('');
  body.querySelector('.set-q-cards').innerHTML = qCards;
  body.querySelector('.set-q-pager').innerHTML = buildPaginator(total, page, 'setExpandPage', si);
  // Scroll to the set item header (chev button's parent), not the body
  const chev = document.getElementById('set-expand-chev-' + si);
  const anchor = chev ? chev.closest('.lib-item') : body;
  if (anchor) {
    const top = anchor.getBoundingClientRect().top + window.scrollY - 72;
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  }
}

function toggleSetExpand(i) {
  const body = document.getElementById('set-expand-body-' + i);
  const chev = document.getElementById('set-expand-chev-' + i);
  if (!body) return;
  const isOpen = body.style.display !== 'none';
  body.style.display = isOpen ? 'none' : '';
  if (chev) chev.style.transform = isOpen ? 'rotate(-90deg)' : 'rotate(0deg)';
}


function renderLibraryResults() {
  const q = (_libSearch || '').trim().toLowerCase();
  const filterSet = _libSearchSet;
  const setsArea = document.getElementById('lib-sets-area');
  const resultsArea = document.getElementById('lib-results-area');
  if (!setsArea) return;

  if (!q && filterSet === 'all') {
    if (resultsArea) resultsArea.innerHTML = '';
    var items = library.map(function(set,i){
      const total = set.questions.length;
      const complete = set.questions.filter(function(qx){return qx.correct;}).length;
      const setDoubts = set.questions.filter(function(qx,qi){return isDoubt(i,qi);}).length;
      const incTag = complete < total
        ? ' <span style="font-family:var(--font-mono);font-size:9px;color:var(--violet);background:rgba(192,132,252,0.10);padding:1px 6px;border-radius:8px;border:1px solid rgba(192,132,252,0.25)">'+(total-complete)+' incompleta'+(total-complete>1?'s':'')+'</span>'
        : '';
      const dbtTag = setDoubts > 0
        ? ' <span style="font-family:var(--font-mono);font-size:9px;color:var(--amber);background:rgba(251,146,60,0.10);padding:1px 6px;border-radius:8px;border:1px solid rgba(251,146,60,0.25)">❓ '+setDoubts+' dúvida'+(setDoubts>1?'s':'')+'</span>'
        : '';

      // Build first page of questions
      const page = (_libPage && _libPage[i]) || 0;
      const start = page * PAGE_SIZE;
      const pageQs = set.questions.slice(start, start + PAGE_SIZE);
      const qCards = pageQs.map(function(quest,j){ return buildSetQuestionCard(quest, start+j, i); }).join('');
      const pagerHtml = buildPaginator(total, page, 'setExpandPage', i);

      const filterHtml='<div class="set-analysis-filter">'
        +'<span class="set-analysis-filter-label">Filtrar:</span>'
        +'<button class="set-filter-btn active" onclick="setAnalysisFilter('+i+',\'all\',this)">Todas</button>'
        +'<button class="set-filter-btn" onclick="setAnalysisFilter('+i+',\'none\',this)">Sem an\u00e1lise</button>'
        +'<button class="set-filter-btn" onclick="setAnalysisFilter('+i+',\'partial\',this)">Parcial</button>'
        +'<button class="set-filter-btn" onclick="setAnalysisFilter('+i+',\'complete\',this)">Completa</button>'
        +'</div>';
      const expandBody = '<div id="set-expand-body-'+i+'" style="display:none;border-top:1px solid var(--border);margin-top:12px;padding-top:12px;">'
        + '<div class="set-export-bar">'
        + '<button class="set-export-btn" onclick="setExportCopyAll('+i+')">📄 Copiar questões</button>'
        + '<button class="set-export-btn" onclick="setExportCopyIA('+i+')">🤖 Copiar p/ IA</button>'
        + '<button class="set-export-btn" onclick="setExportGabSimples('+i+')">✅ Gabarito simples</button>'
        + '<button class="set-export-btn" onclick="setExportGabDetalhado('+i+')">📝 Gabarito detalhado</button>'
        + '</div>'
        + '<div style="font-size:10px;font-family:var(--font-mono);color:var(--text3);letter-spacing:0.07em;text-transform:uppercase;margin-bottom:10px;">'
        + total + ' quest\u00e3o' + (total!==1?'es':'') + ' \u00b7 clique para iniciar'
        + '</div>'
        + filterHtml
        + '<div class="set-q-cards" id="set-q-cards-'+i+'">' + qCards + '</div>'
        + '<div class="set-q-pager">' + pagerHtml + '</div>'
        + '</div>';

      return '<div class="lib-item-set">'
        + '<div class="lib-item-top">'
        + '<button id="set-expand-chev-'+i+'" class="lib-chev-btn" onclick="sndClick();toggleSetExpand('+i+')">▼</button>'
        + '<div class="lib-info">'
        + '<div class="lib-name">'+set.name+'</div>'
        + '<div class="lib-meta">'+total+' questões · '+set.date+incTag+dbtTag+'</div>'
        + '</div>'
        + '<div class="lib-item-right">'
        + '<div class="lib-icon-row">'
        + '<button class="lib-icon-btn" title="Renomear" onclick="sndClick();renameSet('+i+')">&#9998;</button>'
        + '<button class="lib-icon-btn lib-export-btn" title="Exportar .qbset" onclick="exportSet('+i+')">&#128228;</button>'
        + '<button class="lib-icon-btn lib-save-btn" title="Salvar HTML" onclick="sndClick();saveFileWithSet('+i+')">&#11015;</button>'
        + '<button class="lib-icon-btn lib-del-btn" title="Excluir" onclick="sndClick();confirmDelete('+i+')">&#10005;</button>'
        + '</div>'
        + '<button class="btn btn-primary lib-start-btn" onclick="startSetQuiz('+i+')">&#9654; INICIAR</button>'
        + '</div>'
        + '</div>'
        + expandBody
        + '</div>';
    }).join('');
    setsArea.innerHTML = '<div class="lib-list">' + items + '</div>';
    return;
  }

  // ── Search / filter mode ──────────────────────────────────────────────
  setsArea.innerHTML = '';
  var matches = [];
  library.forEach(function(set, si) {
    if (filterSet !== 'all' && String(si) !== String(filterSet)) return;
    set.questions.forEach(function(quest, qi) {
      if (!q) { matches.push({set,si,quest,qi}); return; }
      const haystack = ((quest.text||'') + ' ' + quest.options.map(function(o){return o.text;}).join(' ')).replace(/<[^>]+>/g,'').toLowerCase();
      if (haystack.includes(q)) matches.push({set,si,quest,qi});
    });
  });

  if (!matches.length) {
    if (resultsArea) resultsArea.innerHTML = '<div style="padding:24px;text-align:center;color:var(--text3);font-size:13px;">Nenhuma questão encontrada.</div>';
    return;
  }

  // Group by set
  const setOrderR = [];
  const bySetR = {};
  matches.forEach(function(m) {
    if (!bySetR[m.si]) { bySetR[m.si] = {name:m.set.name, si:m.si, items:[]}; setOrderR.push(m.si); }
    bySetR[m.si].items.push(m);
  });

  const page = _libSearchPage || 0;
  const totalFound = matches.length;

  // Build per-set grouped results with pagination per set
  var html = '<div style="font-size:11px;color:var(--text3);font-family:var(--font-mono);margin-bottom:14px;letter-spacing:0.05em;">'
    + totalFound + ' questão' + (totalFound!==1?'es':'') + ' encontrada' + (totalFound!==1?'s':'') + ' em ' + setOrderR.length + ' conjunto' + (setOrderR.length!==1?'s':'')
    + '</div>';

  html += setOrderR.map(function(si) {
    const g = bySetR[si];
    const gPage = (_libPage && _libPage['s'+si]) || 0;
    const gStart = gPage * PAGE_SIZE;
    const gPageItems = g.items.slice(gStart, gStart + PAGE_SIZE);
    const pager = buildPaginator(g.items.length, gPage, 'setSearchPage', si);

    const cards = gPageItems.map(function(m) {
      const previewRaw = (m.quest.text||'').replace(/<[^>]+>/g,'');
      const preview = q ? previewRaw.replace(new RegExp('('+q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','gi'), '<mark style="background:rgba(232,184,75,0.3);color:var(--gold2);border-radius:2px;padding:0 1px;">$1</mark>') : previewRaw;
      const srCardId = 'src-' + m.si + '-' + m.qi;
      const alts = m.quest.options.map(function(o){
        const altText = q ? o.text.replace(new RegExp('('+q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','gi'), '<mark style="background:rgba(232,184,75,0.3);color:var(--gold2);border-radius:2px;padding:0 1px;">$1</mark>') : o.text;
        const isCorrect = o.letter === m.quest.correct;
        return '<div id="alt-' + srCardId + '-' + o.letter + '" style="font-size:12px;padding:3px 0;display:flex;align-items:flex-start;gap:6px;">'
          + '<span style="font-family:var(--font-mono);font-size:11px;min-width:20px;flex-shrink:0;color:var(--text3);">' + o.letter + ')</span>'
          + '<span class="alt-text-' + srCardId + '" data-correct="' + isCorrect + '" style="color:var(--text2);line-height:1.5;">' + altText + '</span>'
          + '</div>';
      }).join('');
      const srGabBtn = m.quest.correct
        ? '<button id="gab-btn-' + srCardId + '" onclick="event.stopPropagation();toggleGabarito(\'' + srCardId + '\',\'' + m.quest.correct + '\')" '
          + 'style="font-size:10px;font-family:var(--font-mono);padding:3px 10px;border-radius:5px;border:1px solid var(--border2);background:transparent;color:var(--text3);cursor:pointer;transition:all 0.15s;margin-top:8px;" '
          + 'onmouseover="this.style.borderColor=\'var(--green)\';this.style.color=\'var(--green)\'" '
          + 'onmouseout="if(!this.dataset.open){this.style.borderColor=\'var(--border2)\';this.style.color=\'var(--text3)\'}" '
          + 'data-open="false">👁 Ver gabarito</button>'
        : '<span style="font-size:10px;font-family:var(--font-mono);color:var(--violet);opacity:0.7;margin-top:6px;display:inline-block;">sem gabarito</span>';
      return '<div style="border:1px solid var(--border2);border-radius:6px;padding:10px 12px;margin-bottom:8px;cursor:pointer;transition:border-color 0.15s;" '
        + 'onmouseover="this.style.borderColor=\'var(--gold-d)\'" onmouseout="this.style.borderColor=\'var(--border2)\'" '
        + 'onclick="if(event.target.closest(\'button\'))return;startDoubtSingle('+m.si+','+m.qi+')">'
        + '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">'
        + '<span style="font-family:var(--font-mono);font-size:10px;color:var(--gold);background:var(--gold-bg);border:1px solid rgba(232,184,75,0.2);border-radius:4px;padding:1px 7px;">Q'+(m.quest.num||m.qi+1)+'</span>'
        + (!m.quest.correct ? '<span style="font-family:var(--font-mono);font-size:9px;color:var(--violet);background:rgba(192,132,252,0.1);border:1px solid rgba(192,132,252,0.25);border-radius:4px;padding:1px 6px;">sem gabarito</span>' : '')
        + '</div>'
        + '<div style="font-size:13px;color:var(--text);line-height:1.6;margin-bottom:10px;white-space:pre-wrap;">'+preview+'</div>'
        + '<div style="display:flex;flex-direction:column;gap:1px;border-top:1px solid var(--border);padding-top:8px;">' + alts + '</div>'
        + srGabBtn
        + '</div>';
    }).join('');
    return '<div id="sr-group-'+si+'" style="margin-bottom:18px;">'
      + '<div style="font-size:10px;font-family:var(--font-mono);color:var(--gold);letter-spacing:0.09em;text-transform:uppercase;margin-bottom:8px;padding-bottom:5px;border-bottom:1px solid rgba(232,184,75,0.15);display:flex;justify-content:space-between;">'
      + '<span>' + g.name + '</span><span style="opacity:0.5;">' + g.items.length + ' resultado' + (g.items.length!==1?'s':'') + '</span>'
      + '</div>'
      + '<div class="sr-cards-'+si+'">' + cards + '</div>'
      + '<div class="sr-pager-'+si+'">' + pager + '</div>'
      + '</div>';
  }).join('');

  if (resultsArea) resultsArea.innerHTML = html;
}

function setSearchPage(si, page) {
  if (!_libPage) _libPage = {};
  _libPage['s'+si] = page;
  renderLibraryResults();
  setTimeout(function(){
    const el = document.getElementById('sr-group-'+si);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    }
  }, 50);
}


function renameSet(idx) {
  showModal({
    title:'Renomear conjunto', sub:`Nome atual: "${library[idx].name}"`,
    input:true, inputPlaceholder:'Novo nome…', inputValue:library[idx].name,
    confirmLabel:'Renomear',
    onConfirm:name=>{
      if(!name?.trim()){showNotif('Digite um nome.',true);return;}
      library[idx].name=name.trim();
      sndSave(); showNotif(`✓ Renomeado para "${name.trim()}".`);
      render();
    }
  });
}

function renderDoubtPanel(subTabs, doubts) {
  if (!doubts.length) {
    return '<div style="animation:fadeUp 0.5s ease both"><div class="card accent">'
      + subTabs
      + '<div class="doubt-empty"><div class="doubt-empty-icon">❓</div>'
      + '<div class="doubt-empty-title">Nenhuma dúvida marcada</div>'
      + '<div class="doubt-empty-sub">Durante o quiz, clique em <strong style="color:var(--amber)">❓</strong> em qualquer questão para marcá-la aqui.</div>'
      + '</div></div></div>';
  }
  const numSets = new Set(doubts.map(function(d){return d.setIdx;})).size;
  const stats = '<div class="feature-stats-row">'
    + '<div class="feature-stat doubt-stat"><div class="feature-stat-num">' + doubts.length + '</div><div class="feature-stat-lbl">Dúvidas</div></div>'
    + '<div class="feature-stat"><div class="feature-stat-num" style="color:var(--text2)">' + numSets + '</div><div class="feature-stat-lbl">Conjuntos</div></div>'
    + '</div>';

  // Group by setIdx, sort alphabetically
  const setOrder = [];
  const bySet = {};
  doubts.forEach(function(d) {
    if (!bySet[d.setIdx]) { bySet[d.setIdx] = { name: d.set.name, setIdx: d.setIdx, items: [] }; setOrder.push(d.setIdx); }
    bySet[d.setIdx].items.push(d);
  });
  setOrder.sort(function(a,b){ return bySet[a].name.localeCompare(bySet[b].name); });

  const PALETTE = [
    { border:'rgba(240,184,74,0.30)', headerBg:'rgba(240,184,74,0.07)', headerHover:'rgba(240,184,74,0.14)', nameColor:'#f0b84a', bodyBorder:'rgba(240,184,74,0.18)', countBg:'rgba(240,184,74,0.14)', countBorder:'rgba(240,184,74,0.35)', countColor:'#f0b84a', reviewColor:'#f0b84a' },
    { border:'rgba(232,120,88,0.30)', headerBg:'rgba(232,120,88,0.07)', headerHover:'rgba(232,120,88,0.14)', nameColor:'#e87858', bodyBorder:'rgba(232,120,88,0.18)', countBg:'rgba(232,120,88,0.12)', countBorder:'rgba(232,120,88,0.32)', countColor:'#e87858', reviewColor:'#e87858' },
    { border:'rgba(192,168,216,0.30)', headerBg:'rgba(192,168,216,0.06)', headerHover:'rgba(192,168,216,0.13)', nameColor:'#c0a8d8', bodyBorder:'rgba(192,168,216,0.16)', countBg:'rgba(192,168,216,0.10)', countBorder:'rgba(192,168,216,0.28)', countColor:'#c0a8d8', reviewColor:'#c0a8d8' }
  ];

  const accordionStyle = '';

  const searchBar = '<div style="margin-bottom:14px;">'
    + '<input class="doubt-search-input" id="doubt-search-input" placeholder="🔍  Buscar questão..." oninput="filterDoubtSearch(this.value)" />'
    + '</div>';

  const groups = setOrder.map(function(si, idx) {
    const g = bySet[si];
    const P = PALETTE[idx % 2];
    const isOpen = false;
    const cards = g.items.map(function(d) {
      const preview = (d.q.text || '').replace(/<[^>]+>/g,'').substring(0,130) + ((d.q.text||'').length > 130 ? '…' : '');
      const dOpts=(d.q.options||[]).map(function(o){return '<div class="doubt-q-opt"><span class="ltr">'+o.letter+')</span>'+o.text+'</div>';}).join('');
    var _cardId = 'dqc-'+d.setIdx+'-'+d.qIdx;
    return '<div class="doubt-q-card doubt-search-card" id="'+_cardId+'" data-si="'+d.setIdx+'" data-qi="'+d.qIdx+'" data-text="' + (d.q.text||'').replace(/<[^>]+>/g,'').toLowerCase().replace(/"/g,'&quot;') + '">'
        + '<div class="doubt-q-card-header" style="display:flex;align-items:center;justify-content:space-between;gap:8px">'
        + '<span class="doubt-q-num" onclick="event.stopPropagation();startDoubtSingle(' + d.setIdx + ',' + d.qIdx + ')" style="cursor:pointer;flex-shrink:0;font-family:var(--font-mono);font-size:11px;font-weight:700;color:var(--gold)">&#10067; Q' + (d.q.num || (d.qIdx+1)) + '</span>'
        + '<div style="display:flex;gap:5px;align-items:center;flex-shrink:0">'
        + '<button class="doubt-copy-btn" onclick="event.stopPropagation();copyDoubtQuestion('+d.setIdx+','+d.qIdx+')">&#129302; Copiar p/ IA</button>'
        + '<button class="doubt-remove-btn" style="position:static;width:22px;height:22px" onclick="event.stopPropagation();removeDoubt(' + d.setIdx + ',' + d.qIdx + ')" title="Remover">&#10005;</button>'
        + '</div></div>'
        + '<div class="doubt-q-text" style="margin-top:10px;font-size:13px;color:var(--text1);line-height:1.65;word-break:break-word">' + (d.q.text||'').replace(/<[^>]+>/g,'') + '</div>'
        + (dOpts ? '<div class="doubt-q-opts" style="margin-top:10px;padding-top:10px;border-top:1px solid var(--border);display:flex;flex-direction:column;gap:4px">' + dOpts + '</div>' : '')
        + '<div class="dq-footer" style="margin-top:10px;padding-top:10px;border-top:1px solid var(--border);display:flex;gap:8px;flex-wrap:wrap">'
          + (d.q.correct ? '<button class="dq-btn dq-gab-btn" id="gabBtn-'+_cardId+'" onclick="event.stopPropagation();dqToggleGab(\''+_cardId+'\')">&#9989; Ver gabarito</button>' : '')
          + ((d.q.explanation || (d.q.altExplanations && d.q.altExplanations.some(function(a){return (a.explanation||a.text||'').trim();}))) ? '<button class="dq-btn dq-anal-btn" id="analBtn-'+_cardId+'" onclick="event.stopPropagation();dqToggleAnal(\''+_cardId+'\')">&#128214; Ver análise</button>' : '')
        + '</div>'
        + '<div class="dq-reveal" id="rev-'+_cardId+'"></div>'
        + '</div>';
    }).join('');
    return '<div class="doubt-accordion" id="doubt-acc-' + si + '" style="border:1px solid '+P.border+'">'
      + '<div class="doubt-accordion-header" style="background:'+P.headerBg+'" '
      + 'onmouseover="this.style.background=\''+P.headerHover+'\'" onmouseout="this.style.background=\''+P.headerBg+'\'" '
      + 'onclick="toggleDoubtAccordion(' + si + ')">'
      + '<div class="doubt-accordion-left">'
      + '<svg width="17" height="17" viewBox="0 0 16 16" fill="none" style="flex-shrink:0"><path d="M1.5 3.5C1.5 2.67 2.17 2 3 2h3.38l1.5 1.5H13c.83 0 1.5.67 1.5 1.5V5H1.5V3.5z" fill="' + P.nameColor + '" opacity=".5"/><rect x="1.5" y="5" width="13" height="9" rx="1.5" fill="' + P.nameColor + '"/></svg>'
      + '<span class="doubt-accordion-name" style="color:'+P.nameColor+'">' + g.name + '</span>'
      + '<span class="doubt-accordion-chevron' + (isOpen?' open':'') + '" id="doubt-chev-' + si + '" style="color:'+P.nameColor+'">▼</span>'
      + '</div>'
      + '<div class="doubt-accordion-right">'
      + '<span class="doubt-accordion-count" style="background:'+P.countBg+';color:'+P.countColor+';border:1px solid '+P.countBorder+'">' + g.items.length + ' dúvida' + (g.items.length > 1 ? 's' : '') + '</span>'
      + '<button class="doubt-set-menu-btn" onclick="event.stopPropagation();toggleDoubtSetMenu('+si+',this)">&#8943;</button>'
      + '<button class="doubt-accordion-review" style="color:'+P.reviewColor+';border-color:'+P.countBorder+'" onclick="event.stopPropagation();startDoubtSetQuiz(' + si + ')">&#9654; Revisar</button>'
      + '</div>'
      + '</div>'
      + '<div class="doubt-accordion-body' + (isOpen?' open':'') + '" id="doubt-body-' + si + '" style="border-top:1px solid '+P.bodyBorder+'">'
      + cards
      + '</div>'
      + '</div>';
  }).join('');

  return '<div style="animation:fadeUp 0.5s ease both"><div class="card accent">'
    + accordionStyle
    + subTabs + '<div class="section-lbl">Questões com Dúvida</div>'
    + stats
    + searchBar
    + '<div id="doubt-groups-container">' + groups + '</div>'
    + '<div class="btn-row" style="margin-top:16px;border-top:1px solid var(--border);padding-top:16px">'
    + '<button class="btn btn-secondary" onclick="clearAllDoubts()">✕ Limpar todas</button>'
    + '<button class="btn btn-primary" onclick="startDoubtQuiz()">❓ Revisar todas</button>'
    + '</div></div></div>';
}

function toggleDoubtAccordion(si) {
  const body = document.getElementById('doubt-body-' + si);
  const chev = document.getElementById('doubt-chev-' + si);
  if (!body) return;
  const isOpen = body.classList.contains('open');
  body.classList.toggle('open', !isOpen);
  if (chev) chev.style.transform = isOpen ? 'rotate(-90deg)' : 'rotate(0deg)';
}

function toggleIncAccordion(si) {
  const body = document.getElementById('inc-body-' + si);
  const chev = document.getElementById('inc-chev-' + si);
  if (!body) return;
  const isOpen = body.style.display !== 'none';
  body.style.display = isOpen ? 'none' : '';
  if (chev) chev.style.transform = isOpen ? 'rotate(-90deg)' : 'rotate(0deg)';
}

function filterDoubtSearch(val) {
  _doubtSearchVal = val || '';
  const q = val.trim().toLowerCase();
  const container = document.getElementById('doubt-groups-container');
  if (!container) return;
  if (!q) {
    container.querySelectorAll('.doubt-search-card').forEach(function(c){ c.style.display=''; });
    container.querySelectorAll('.doubt-accordion').forEach(function(a){ a.style.display=''; });
    return;
  }
  container.querySelectorAll('.doubt-accordion').forEach(function(acc) {
    let anyVisible = false;
    acc.querySelectorAll('.doubt-search-card').forEach(function(card) {
      const match = card.dataset.text && card.dataset.text.includes(q);
      card.style.display = match ? '' : 'none';
      if (match) anyVisible = true;
    });
    acc.style.display = anyVisible ? '' : 'none';
    if (anyVisible) {
      const body = acc.querySelector('.doubt-accordion-body');
      const chev = acc.querySelector('.doubt-accordion-chevron');
      if (body) body.classList.add('open');
      if (chev) chev.style.transform = 'rotate(0deg)';
    }
  });
}

function filterIncompleteSearch() {
  const q = (_incSearch || '').trim().toLowerCase();
  const filterSet = _incSearchSet;
  const container = document.getElementById('inc-groups-container');
  if (!container) return;
  container.querySelectorAll('.inc-accordion').forEach(function(acc) {
    const accId = acc.id.replace('inc-acc-','');
    const setMatch = (filterSet === 'all' || String(accId) === String(filterSet));
    if (!setMatch) { acc.style.display = 'none'; return; }
    if (!q) { acc.style.display = ''; acc.querySelectorAll('.inc-search-card').forEach(function(c){ c.style.display=''; }); return; }
    let anyVisible = false;
    acc.querySelectorAll('.inc-search-card').forEach(function(card) {
      const match = card.dataset.text && card.dataset.text.includes(q);
      card.style.display = match ? '' : 'none';
      if (match) anyVisible = true;
    });
    acc.style.display = anyVisible ? '' : 'none';
    if (anyVisible) {
      const body = document.getElementById('inc-body-' + accId);
      const chev = document.getElementById('inc-chev-' + accId);
      if (body) body.style.display = '';
      if (chev) chev.style.transform = 'rotate(0deg)';
    }
  });
}

function startDoubtSetQuiz(setIdx) {
  sndClick();
  const setDoubts = getAllDoubtQuestions().filter(function(d){ return d.setIdx === setIdx; });
  if (!setDoubts.length) { showNotif('Nenhuma dúvida neste conjunto.', true); return; }
  const qs = setDoubts.map(function(d){ return d.q; });
  activeSetIdx = setIdx;
  activeSet = { name: library[setIdx].name + ' · Revisão de Dúvidas (' + qs.length + ')', questions: qs };
  initQuiz();
  document.getElementById('quiz-tab-btn').style.display = '';
  switchTab('quiz');
}


function renderIncompletePanel(subTabs, incompletes) {
  if (!incompletes.length) {
    return '<div style="animation:fadeUp 0.5s ease both"><div class="card accent">'
      + subTabs
      + '<div class="doubt-empty"><div class="doubt-empty-icon">✓</div>'
      + '<div class="doubt-empty-title">Nenhuma questão incompleta</div>'
      + '<div class="doubt-empty-sub">Todas as questões já possuem gabarito definido.</div>'
      + '</div></div></div>';
  }
  const totalComplete = library.reduce(function(acc,s){return acc+s.questions.filter(function(q){return q.correct;}).length;},0);
  const numSetsInc = new Set(incompletes.map(function(d){return d.setIdx;})).size;
  const stats = '<div class="feature-stats-row">'
    + '<div class="feature-stat incomplete-stat"><div class="feature-stat-num">' + incompletes.length + '</div><div class="feature-stat-lbl">Incompletas</div></div>'
    + '<div class="feature-stat"><div class="feature-stat-num" style="color:var(--text2)">' + numSetsInc + '</div><div class="feature-stat-lbl">Conjuntos</div></div>'
    + '<div class="feature-stat complete-stat"><div class="feature-stat-num">' + totalComplete + '</div><div class="feature-stat-lbl">Completas</div></div>'
    + '</div>';

  const INC_PALETTE = [
    { border:'rgba(192,168,216,0.30)', headerBg:'rgba(192,168,216,0.07)', headerHover:'rgba(192,168,216,0.14)', nameColor:'#c0a8d8', bodyBorder:'rgba(192,168,216,0.18)', countBg:'rgba(192,168,216,0.12)', countBorder:'rgba(192,168,216,0.30)', countColor:'#c0a8d8', icon:'◌' },
    { border:'rgba(232,120,88,0.28)', headerBg:'rgba(232,120,88,0.06)', headerHover:'rgba(232,120,88,0.13)', nameColor:'#e87858', bodyBorder:'rgba(232,120,88,0.16)', countBg:'rgba(232,120,88,0.10)', countBorder:'rgba(232,120,88,0.28)', countColor:'#e87858', icon:'◌' },
    { border:'rgba(232,224,200,0.25)', headerBg:'rgba(232,224,200,0.05)', headerHover:'rgba(232,224,200,0.10)', nameColor:'#e8e0c8', bodyBorder:'rgba(232,224,200,0.14)', countBg:'rgba(232,224,200,0.08)', countBorder:'rgba(232,224,200,0.22)', countColor:'#e8e0c8', icon:'◌' }
  ];

  // Group by setIdx
  const setOrderInc = [];
  const bySetInc = {};
  incompletes.forEach(function(d) {
    if (!bySetInc[d.setIdx]) { bySetInc[d.setIdx] = { name: d.set.name, setIdx: d.setIdx, items: [] }; setOrderInc.push(d.setIdx); }
    bySetInc[d.setIdx].items.push(d);
  });
  setOrderInc.sort(function(a,b){ return bySetInc[a].name.localeCompare(bySetInc[b].name); });

  function buildIncCard(d) {
    const preview = (d.q.text || '').replace(/<[^>]+>/g,'').substring(0,100) + ((d.q.text||'').length > 100 ? '…' : '');
    const opts = d.q.options.map(function(o){
      return '<button class="answer-opt-btn" data-letter="' + o.letter + '" onclick="selectAnswerLetter(' + d.setIdx + ',' + d.qIdx + ',\'' + o.letter + '\')">' + o.letter + '</button>';
    }).join('');
    const iOpts=(d.q.options||[]).map(function(o){return '<div class="doubt-q-opt"><span class="ltr">'+o.letter+')</span>'+o.text+'</div>';}).join('');
    return '<div class="incomplete-q-card inc-search-card" id="incomplete-card-' + d.setIdx + '-' + d.qIdx + '" data-text="' + (d.q.text||'').replace(/<[^>]+>/g,'').toLowerCase().replace(/"/g,'&quot;') + '">'
      + '<div class="incomplete-q-header">'
      + '<span class="incomplete-q-num">&#9898; Q' + (d.q.num || (d.qIdx+1)) + '</span>'
      + '<span class="incomplete-missing">sem gabarito</span>'
      + '</div>'
      + '<div class="incomplete-q-text">' + (d.q.text||'') + '</div>'
      + (iOpts ? '<div class="doubt-q-opts">' + iOpts + '</div>' : '')
      + '<div class="incomplete-q-actions" style="margin-top:14px;padding-top:12px;border-top:1px solid var(--border);">'
      + '<button class="incomplete-copy-btn" onclick="copyIncompleteQuestion(' + d.setIdx + ',' + d.qIdx + ')">📋 Copiar para IA</button>'
      + '<button class="incomplete-add-answer-btn" onclick="toggleAddAnswer(' + d.setIdx + ',' + d.qIdx + ')">+ Adicionar gabarito</button>'
      + '<button class="incomplete-del-btn" onclick="sndClick();confirmDeleteQuestion(' + d.setIdx + ',' + d.qIdx + ')">✕</button>'
      + '</div>'
      + (function(){var altRows=(d.q.options||[]).map(function(o,oi){var isCorr=(d.q.correct&&d.q.correct===o.letter)?'is-correct':'';var ae=(d.q.altExplanations&&d.q.altExplanations[oi])||{};var savedExpl=(ae.explanation||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/'/g,'&#39;').replace(/"/g,'&quot;');var optTxt=(o.text||'').replace(/<[^>]+>/g,'').slice(0,50);return '<div class="alt-expl-row">'+'<div class="alt-expl-row-header">'+'<span class="alt-expl-badge '+isCorr+'">'+o.letter+'</span>'+'<span class="alt-expl-opt-text">'+optTxt+'</span>'+'</div>'+'<textarea class="alt-expl-textarea '+isCorr+'" data-letter="'+o.letter+'" placeholder="Justificativa da alt. '+o.letter+')...">'+savedExpl+'</textarea>'+'</div>';}).join('');var savedGeneral=(d.q.explanation||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/'/g,'&#39;').replace(/"/g,'&quot;');return '<div class="add-answer-row" id="add-answer-row-' + d.setIdx + '-' + d.qIdx + '">'+'<div class="add-answer-label">Selecione o gabarito</div>'+'<div class="add-answer-options">' + opts + '</div>'+'<div class="alt-expl-section" style="margin-top:14px">'+'<div class="alt-expl-section-label">Justificativa por alternativa</div>'+altRows+'</div>'+'<div class="alt-expl-general-label" style="margin-top:8px">An\u00e1lise geral (opcional)</div>'+'<textarea class="answer-expl-input" placeholder="An\u00e1lise geral..." style="margin-top:4px">'+savedGeneral+'</textarea>'+'<div class="answer-confirm-row">'+'<button class="btn btn-secondary" onclick="toggleAddAnswer(' + d.setIdx + ',' + d.qIdx + ')" style="font-size:11px;padding:8px 14px">Cancelar</button>'+'<button class="btn btn-primary" onclick="confirmAddAnswer(' + d.setIdx + ',' + d.qIdx + ')" style="font-size:11px;padding:8px 16px">\u2713 Salvar gabarito</button>'+'</div></div></div>';})()
  }

  // Build set filter options
  const incSetFilterOpts = '<option value="all"' + (_incSearchSet==='all'?' selected':'') + '>Todos os conjuntos</option>'
    + setOrderInc.map(function(si){ return '<option value="'+si+'"'+(String(si)===String(_incSearchSet)?' selected':'')+'>'+bySetInc[si].name+'</option>'; }).join('');

  const incToolbar = '<div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap;">'
    + '<input id="inc-search-input" style="flex:1;min-width:140px;padding:7px 12px;border-radius:6px;border:1px solid var(--border2);background:var(--surface3);color:var(--text);font-size:12px;font-family:var(--font-body);outline:none;" '
    + 'placeholder="🔍 Buscar questão incompleta..." value="' + (_incSearch||'').replace(/"/g,'&quot;') + '" '
    + 'oninput="_incSearch=this.value;filterIncompleteSearch()" />'
    + '<select id="inc-set-filter" style="padding:7px 10px;border-radius:6px;border:1px solid var(--border2);background:var(--surface3);color:var(--text);font-size:12px;outline:none;cursor:pointer;" '
    + 'onchange="_incSearchSet=this.value;filterIncompleteSearch()">' + incSetFilterOpts + '</select>'
    + '<button style="padding:7px 12px;border-radius:6px;border:1px solid var(--border2);background:transparent;color:var(--text3);font-size:11px;cursor:pointer;" '
    + 'onclick="_incSearch=\'\';_incSearchSet=\'all\';document.getElementById(\'inc-search-input\').value=\'\';document.getElementById(\'inc-set-filter\').value=\'all\';filterIncompleteSearch()">✕ Limpar</button>'
    + '</div>';

  const accordions = setOrderInc.map(function(si, idx) {
    const g = bySetInc[si];
    const P = INC_PALETTE[idx % 2];
    const isOpen = false;
    return '<div class="inc-accordion" id="inc-acc-' + si + '" style="border:1px solid '+P.border+';border-radius:8px;margin-bottom:10px;overflow:hidden;">'
      + '<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;cursor:pointer;background:'+P.headerBg+';transition:background 0.15s;user-select:none;" '
      + 'onmouseover="this.style.background=\''+P.headerHover+'\'" onmouseout="this.style.background=\''+P.headerBg+'\'" '
      + 'onclick="toggleIncAccordion('+si+')">'
      + '<div style="display:flex;align-items:center;gap:8px;flex:1;min-width:0;">'
      + '<svg width="17" height="17" viewBox="0 0 16 16" fill="none" style="flex-shrink:0"><path d="M1.5 3.5C1.5 2.67 2.17 2 3 2h3.38l1.5 1.5H13c.83 0 1.5.67 1.5 1.5V5H1.5V3.5z" fill="' + P.nameColor + '" opacity=".5"/><rect x="1.5" y="5" width="13" height="9" rx="1.5" fill="' + P.nameColor + '"/></svg>'
      + '<span style="font-family:var(--font-body);font-size:13.5px;font-weight:600;color:'+P.nameColor+';overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+g.name+'</span>'
      + '<span id="inc-chev-'+si+'" style="font-size:10px;color:'+P.nameColor+';opacity:0.4;transition:transform 0.22s;flex-shrink:0;'+(isOpen?'':'transform:rotate(-90deg)')+'">▼</span>'
      + '</div>'
      + '<span style="font-size:10px;font-family:var(--font-mono);background:'+P.countBg+';color:'+P.countColor+';border:1px solid '+P.countBorder+';border-radius:10px;padding:1px 8px;white-space:nowrap;flex-shrink:0;">'+g.items.length+' incompleta'+(g.items.length>1?'s':'')+'</span>'
      + '<button class="doubt-copy-all-btn" onclick="event.stopPropagation();copyIncompleteBlockToAI(\'' + si + '\')">Copiar p/ IA</button>'
      + '</div>'
      + '<div id="inc-body-'+si+'" style="'+(isOpen?'':'display:none;')+'padding:8px 10px 10px;border-top:1px solid '+P.bodyBorder+'">'
      + g.items.map(buildIncCard).join('')
      + '</div>'
      + '</div>';
  }).join('');

  return '<div style="animation:fadeUp 0.5s ease both"><div class="card accent">'
    + subTabs + '<div class="section-lbl">Questões Incompletas</div>'
    + stats
    + incToolbar
    + '<div id="inc-groups-container">' + accordions + '</div>'
    + '</div></div>';
}

function clearAllDoubts() {
  showModal({ title: 'Limpar dúvidas', bodyText: 'Remover todas as ' + Object.keys(_doubts).length + ' dúvidas marcadas?',
    confirmLabel: 'Limpar tudo', danger: true,
    onConfirm: function() { _doubts = {}; showNotif('Dúvidas removidas.'); render(); }
  });
}

function confirmDeleteQuestion(setIdx, qIdx) {
  showModal({ title: 'Excluir questão', bodyText: 'Excluir esta questão do conjunto "' + library[setIdx].name + '"?',
    confirmLabel: 'Excluir', danger: true,
    onConfirm: function() {
      library[setIdx].questions.splice(qIdx, 1);
      delete _doubts[getDoubtKey(setIdx, qIdx)];
      showNotif('Questão excluída.');
      render();
    }
  });
}

function startDoubtSingle(setIdx, qIdx) {
  sndClick();
  const q = library[setIdx]?.questions[qIdx];
  if (!q) return;
  activeSetIdx = setIdx;
  activeSet = { name: library[setIdx].name + ' · Q' + (q.num || qIdx+1), questions: [q] };
  initQuiz();
  document.getElementById('quiz-tab-btn').style.display = '';
  switchTab('quiz');
}


function appendToSet(idx) {
  const qs=parsedQs ? parsedQs.filter(q=>q.text) : [];
  if(!qs.length){
    showNotif('Nenhuma questão importada no momento. Importe questões primeiro.',true);
    return;
  }
  const set=library[idx];
  showModal({
    title:'Adicionar questões',
    bodyText:`Adicionar ${qs.length} questão(ões) importada(s) ao conjunto "${set.name}"? (Total ficará ${set.questions.length+qs.length})`,
    confirmLabel:'Adicionar',
    onConfirm:()=>{
      library[idx].questions=[...library[idx].questions,...qs];
      library[idx].date=new Date().toLocaleDateString('pt-BR');
      sndSave(); showNotif(`✓ ${qs.length} questão(ões) adicionada(s) a "${set.name}".`);
      render();
    }
  });
}

function confirmDelete(idx) {
  showModal({title:'Excluir conjunto',bodyText:`Excluir "${library[idx].name}"?`,confirmLabel:'Excluir',danger:true,
    onConfirm:()=>{library.splice(idx,1);showNotif('Excluído.');render();}
  });
}

function startSetQuiz(idx) {
  sndClick();
  activeSetIdx = idx;
  activeSet=library[idx]; initQuiz();
  document.getElementById('quiz-tab-btn').style.display='';
  switchTab('quiz');
}
