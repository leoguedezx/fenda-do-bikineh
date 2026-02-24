/* === QUIZ ENGINE & GEMINI EVALUATOR === */
/* ═══════════════════════════════════
   QUIZ ENGINE
═══════════════════════════════════ */
function initQuiz() {
  quizState = {
    currentQ:0, selectedAnswer:null, answered:false,
    score:0, wrong:0,
    answers:[],   // {q, selected, correctIdx}
    reviewMode:false,
    striked:{},   // "qi-optIdx" → bool
    highlights:{}, // qi → innerHTML
    optHighlights:{}, // "qi-optIdx" → innerHTML
    explHighlights:{}, // "qi-expl" and "qi-alt-X" → innerHTML
    pendingAnswer:null // idx while not yet confirmed
  };
  activeTool = null;
}

function renderQuizScreen(s) {
  if(!activeSet){s.innerHTML=`<div class="empty-state"><div class="empty-icon">▶</div><h3>Nenhum quiz ativo</h3><p>Selecione um conjunto na Biblioteca.</p></div>`;return;}
  const st=quizState,qs=activeSet.questions;
  if(st.currentQ>=qs.length&&!st.reviewMode){renderResults(s);return;}
  if(st.reviewMode){renderReview(s);return;}
  renderQuestion(s);
}

/* ──────────────────────────────────
   RENDER SINGLE QUESTION
────────────────────────────────── */
function renderQuestion(s) {
  const st=quizState, qs=activeSet.questions, qi=st.currentQ, q=qs[qi];
  const pct=(qi/qs.length)*100;
  const cIdx=q.options.findIndex(o=>o.letter===q.correct);

  /* ── Nav dots — ALL freely clickable ── */
  const dots = qs.map((_,i) => {
    const ans = st.answers.find(a=>a.q===i);
    const isEssay = qs[i].type === 'essay';
    let cls = '';
    if (i===qi) cls='current';
    else if (ans) cls = isEssay ? 'ans-c' : (ans.selected===qs[i].options.findIndex(o=>o.letter===qs[i].correct)?'ans-c':'ans-w');
    else cls='locked';
    const hasDoubt = isDoubt(activeSetIdx, i);
    return `<div class="q-dot ${cls} ${hasDoubt?'has-doubt':''}" onclick="navTo(${i})" title="Questão ${i+1}${isEssay?' 📝 Dissertativa':''}${hasDoubt?' ❓ Dúvida':''}">${i+1}</div>`;
  }).join('');

  /* ── Toolbar ── */
  const hlTools=[
    {id:'hl-y',icon:'🟡',label:'Amarelo'},
    {id:'hl-p',icon:'🩷',label:'Rosa'},
    {id:'hl-c',icon:'🩵',label:'Ciano'},
    {id:'hl-g',icon:'🟢',label:'Verde'},
  ];
  const hlBtns=hlTools.map(t=>`<button class="tool-btn ${t.id} ${activeTool===t.id?'active':''}" onclick="setTool('${t.id}')">${t.icon}<span class="tool-tip">${t.label}</span></button>`).join('');

  const toolbar=`<div class="quiz-toolbar">
    <span class="toolbar-label">Destacar</span>
    ${hlBtns}
    <button class="tool-btn eraser ${activeTool==='eraser'?'active':''}" onclick="setTool('eraser')">🧹<span class="tool-tip">Apagar seleção</span></button>
    <div class="toolbar-sep"></div>
    <span class="toolbar-label">Alt.</span>
    <button class="tool-btn strike-t ${activeTool==='strike'?'active':''}" onclick="setTool('strike')"><span style="text-decoration:line-through;font-family:var(--font-mono);font-size:10px;">AB</span><span class="tool-tip">Riscar alternativa</span></button>
    <div class="toolbar-sep"></div>
    <button class="tool-btn" onclick="clearAllHL(${qi})" title="Limpar marcações">✕<span class="tool-tip">Limpar marcações</span></button>
  </div>`;

  /* ── Options OR Essay ── */
  let optsHtml = '';
  if (q.type === 'essay') {
    const savedAns = (quizState.answers.find(a=>a.q===qi)||{}).essayText || '';
    const isAnswered = quizState.answered;
    optsHtml = '<div class="essay-wrap" id="essay-wrap-'+qi+'">'
      + '<div class="essay-label">✏️ Sua resposta</div>'
      + '<textarea class="essay-input" id="essay-input-'+qi+'" placeholder="Escreva sua resposta aqui..."'+(isAnswered?' disabled':'')+'>'+savedAns+'</textarea>'
      + (!isAnswered
          ? '<div class="essay-actions"><button class="btn btn-primary essay-confirm-btn" onclick="confirmEssay('+qi+')">✓ Confirmar resposta</button></div>'
          : '<div class="essay-answered-badge">✓ Resposta registrada</div>')
      + '</div>';
  } else {
    const optButtons = q.options.map(function(opt,i){
      const key = qi+'-'+i;
      const striked = st.striked[key] && !st.answered;
      let cls = '';
      if(st.answered){
        if(i===cIdx) cls='show-correct';
        else if(i===st.selectedAnswer&&st.selectedAnswer!==cIdx) cls='sel-wrong';
        else cls='dimmed';
      }
      return '<button class="opt-btn '+cls+' '+(striked?'striked':'')+'" onclick="handleOptClick('+i+')" onpointerup="handleOptSelect(event,'+qi+','+i+')" '+(st.answered?'disabled':'')+'>'+
        '<span class="opt-letter">'+opt.letter+'</span><span class="opt-text">'+opt.text+'</span>'+
        (!st.answered ? '<span class="opt-strike-x" onclick="toggleStrike(event,'+qi+','+i+')">⁻</span>' : '')+
        '</button>';
    }).join('');
    optsHtml = '<div class="options-col" id="opts-col">'+optButtons+'</div>';
  }

  /* ── Feedback ── */
  let feedback='';
  if(st.answered){
    if (q.type === 'essay') {
      // Gemini result is injected separately — no default badge needed
      feedback = '';
    } else {
      const ok=st.selectedAnswer===cIdx;
      feedback=`<div class="feedback-badge ${ok?'ok':'bad'}">${ok?'✓ Resposta Correta':'✗ Resposta Incorreta — veja a análise'}</div>`;
    }
  }

  /* ── Explanation ── */
  let expl='';
  if(st.answered&&(q.explanation||q.altExplanations.some(a=>a.text)||(q.type==='essay'&&q.explanation))){
    const rawExpl = q.explanation || '';
    const isHtml = /<[a-z][\s\S]*>/i.test(rawExpl);
    const explContent = (!isHtml && isMarkdownText(rawExpl))
      ? (renderMarkdown(rawExpl) || rawExpl)
      : rawExpl;
    const rows = q.type === 'essay' ? '' : q.altExplanations.map(a=>{
      if(!a.text) return '';
      return `<div class="alt-row ${a.correct?'is-c':'is-w'}"><div class="alt-lbl ${a.correct?'c':'w'}">Alternativa ${a.letter} <span class="alt-tag">${a.correct?'CORRETA':'INCORRETA'}</span></div><div class="alt-expl-text qe-field" id="expl-alt-${qi}-${a.letter}" onpointerup="handleExplSelect(event,${qi},'alt-${a.letter}')">${a.text}</div></div>`;
    }).join('');
    if (explContent || rows) {
      const headLbl = q.type === 'essay' ? '◈ Gabarito / Resposta Esperada' : '◈ Análise Completa';
      expl=`<div class="expl-panel" id="expl-panel-${qi}">
        <div class="expl-head" onclick="sndClick();toggleExpl(this)">
          <span class="expl-head-lbl">${headLbl}</span>
          <button class="expl-edit-btn" id="expl-edit-btn-${qi}" onclick="event.stopPropagation();toggleEditMode(${qi})" title="Editar análise">✎</button>
          <span class="expl-ch">▾</span>
        </div>
        <div class="expl-body"><div class="expl-body-inner" id="expl-body-inner-${qi}">${explContent?`<div class="expl-intro-wrap" id="expl-intro-wrap-${qi}"><div class="expl-intro qe-field" id="expl-intro-${qi}" onpointerup="handleExplSelect(event,${qi},'intro')">${explContent}</div></div>`:''}<div id="expl-alt-rows-${qi}">${rows}</div></div></div>
      </div>`;
    }
  }

  const isLast=qi===qs.length-1;

  s.innerHTML=`<div style="animation:slideQ 0.38s cubic-bezier(0.22,1,0.36,1) both">
    <div class="progress-section">
      <div class="progress-meta"><span>QUESTÃO ${qi+1} / ${qs.length}</span><span>${Math.round(pct)}%</span></div>
      <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
    </div>
    <div class="score-row">
      <div class="score-chip">Total: ${qi}</div>
      <div class="score-chip c">✓ ${st.score}</div>
      <div class="score-chip w">✗ ${st.wrong}</div>
    </div>
    <div class="q-nav-wrap">
      <span class="q-nav-label">Navegar</span>
      <div class="q-nav-dots">${dots}</div>
    </div>
    ${toolbar}
    <div class="q-card" id="qcard" style="position:relative">
      <button class="q-edit-toggle" id="qe-toggle" onclick="toggleEditMode(${qi})" title="Editar questão">✎</button>
      <button class="qe-export-btn" id="export-btn-${qi}" onclick="toggleExportPanel(${qi})" title="Exportar / Copiar">📋</button>
      <button class="doubt-btn ${isDoubt(activeSetIdx,qi)?'active ':''}tool-tip-parent" id="doubt-btn-${qi}" onclick="toggleDoubt(activeSetIdx,${qi})" title="Marcar dúvida" style="right:52px">❓<span class="tool-tip">Dúvida</span></button>
      <div class="q-num">Questão ${q.num||qi+1}</div>
      <span class="qe-section-label">Enunciado</span>
      <div class="q-text qe-field" id="qtxt-${qi}" onpointerup="handleSelect(${qi})">${q.text}</div>
      <span class="qe-section-label">${q.type==='essay'?'Questão Dissertativa':'Alternativas'}</span>
      ${optsHtml}
      ${feedback}
    </div>
    ${expl}
    <div class="nav-row">
      <button class="btn btn-secondary" onclick="switchTab('library')">← Biblioteca</button>
      <div class="nav-row-right">
        ${qi>0?`<button class="btn btn-secondary" onclick="navTo(${qi-1})">← Anterior</button>`:''}
        ${st.answered?`<button class="btn btn-primary" onclick="nextQuestion()">${isLast?'Ver Resultado →':'Próxima →'}</button>`:''}
      </div>
    </div>
  </div>`;

  applyHL(qi);
  // Re-inject Gemini result if already evaluated
  if (q.type === 'essay' && st.answered) {
    const ans = st.answers.find(a => a.q === qi);
    if (ans?.geminiResult) {
      setTimeout(() => _renderGeminiResult(qi), 50);
    }
  }
  // Check if any expl-intro overflows after render (e.g. re-opened panels)
  setTimeout(() => {
    document.querySelectorAll('.expl-intro').forEach(el => {
      const wrap = el.closest('.expl-intro-wrap');
      if (wrap) checkExplOverflow(el, wrap);
    });
  }, 100);
}

/* ═══════════════════════════════════
   FREE NAVIGATION — no restrictions
═══════════════════════════════════ */
function navTo(idx) {
  if(idx===quizState.currentQ) return;
  sndNav();
  _editMode = false;
  // Always remove editing toolbar when navigating
  const _fb = document.getElementById('qe-fmt-bar');
  if (_fb) _fb.remove();
  quizState.currentQ=idx;
  const ans=quizState.answers.find(a=>a.q===idx);
  if(ans){
    quizState.selectedAnswer=ans.selected;
    quizState.answered=true;
  } else {
    quizState.selectedAnswer=null;
    quizState.answered=false;
  }
  activeTool=null;
  quizState.pendingAnswer=null;
  renderQuizScreen(document.getElementById('screen'));
  window.scrollTo({top:0,behavior:'smooth'});
}

function nextQuestion() {
  sndNav();
  _editMode = false;
  quizState.currentQ++;
  quizState.selectedAnswer=null;
  quizState.answered=false;
  quizState.pendingAnswer=null;
  activeTool=null;
  renderQuizScreen(document.getElementById('screen'));
  window.scrollTo({top:0,behavior:'smooth'});
}

/* ═══════════════════════════════════
   TOOLBAR
═══════════════════════════════════ */
function setTool(t) {
  sndClick();
  activeTool=activeTool===t?null:t;
  document.querySelectorAll('.tool-btn').forEach(b=>{
    const id=b.className.match(/\b(hl-y|hl-p|hl-c|hl-g|eraser|strike-t)\b/)?.[1];
    if(!id) return;
    const match=(id==='strike-t'&&activeTool==='strike')||(id===activeTool);
    b.classList.toggle('active',match);
  });
  const qi=quizState.currentQ;
  const el=document.getElementById(`qtxt-${qi}`);
  const cur=(activeTool&&activeTool!=='strike')?(activeTool==='eraser'?'crosshair':'text'):'';
  if(el) el.style.cursor=cur;
  document.querySelectorAll('.opt-text').forEach(t=>t.style.cursor=cur);
  document.querySelectorAll('.alt-expl-text, .expl-intro').forEach(t=>t.style.cursor=cur);
}

function handleSelect(qi) {
  if(!activeTool||activeTool==='strike') return;
  const sel=window.getSelection();
  if(!sel||sel.isCollapsed) return;
  const el=document.getElementById(`qtxt-${qi}`);
  const range=sel.getRangeAt(0);
  if(!el||!el.contains(range.commonAncestorContainer)){sel.removeAllRanges();return;}

  if(activeTool==='eraser') {
    el.querySelectorAll('.hl-y,.hl-p,.hl-c,.hl-g').forEach(span=>{
      if(sel.containsNode(span,true)){
        const p=span.parentNode;
        while(span.firstChild) p.insertBefore(span.firstChild,span);
        p.removeChild(span);
      }
    });
    el.normalize();
    quizState.highlights[qi]=el.innerHTML;
    sel.removeAllRanges();
    return;
  }

  try {
    const span=document.createElement('span');
    span.className=`hl-${activeTool.replace('hl-','')}`;
    attachHLClick(span,qi,el);
    range.surroundContents(span);
    quizState.highlights[qi]=el.innerHTML;
  } catch(e){}
  sel.removeAllRanges();
}

function attachHLClick(span, key, container, type=false) {
  span.addEventListener('click', function(e){
    if(activeTool!=='eraser') return;
    e.stopPropagation();
    const p=this.parentNode;
    while(this.firstChild) p.insertBefore(this.firstChild,this);
    p.removeChild(this); p.normalize();
    if(type==='expl') quizState.explHighlights[key]=container.innerHTML;
    else if(type===true) quizState.optHighlights[key]=container.innerHTML;
    else quizState.highlights[key]=container.innerHTML;
  });
}

function applyHL(qi) {
  if(quizState.highlights?.[qi]) {
    const el=document.getElementById(`qtxt-${qi}`);
    if(el){ el.innerHTML=quizState.highlights[qi]; el.querySelectorAll('.hl-y,.hl-p,.hl-c,.hl-g').forEach(span=>attachHLClick(span,qi,el)); }
  }
  // Restore option highlights
  const q=activeSet.questions[qi];
  if(!q) return;
  q.options.forEach((_,i)=>{
    const key=`${qi}-${i}`;
    if(quizState.optHighlights?.[key]){
      const btn=document.querySelector(`#opts-col .opt-btn:nth-child(${i+1}) .opt-text`);
      if(btn){ btn.innerHTML=quizState.optHighlights[key]; btn.querySelectorAll('.hl-y,.hl-p,.hl-c,.hl-g').forEach(span=>attachHLClick(span,key,btn,true)); }
    }
  });
  // Restore explanation highlights
  if(quizState.explHighlights) {
    Object.entries(quizState.explHighlights).forEach(([key, html]) => {
      if(!key.startsWith(`${qi}-`)) return;
      const section=key.slice((`${qi}-`).length);
      const elId = section==='intro' ? `expl-intro-${qi}` : `expl-alt-${qi}-${section.replace('alt-','')}`;
      const el=document.getElementById(elId);
      if(el){ el.innerHTML=html; el.querySelectorAll('.hl-y,.hl-p,.hl-c,.hl-g').forEach(span=>attachHLClick(span,key,el,'expl')); }
    });
  }
}

function handleOptSelect(e, qi, optIdx) {
  if (_editMode) return;
  // Legacy: kept for tablet fallback, logic now also handled by global listener
  _applyOptHL(qi, optIdx);
}

function _applyOptHL(qi, optIdx) {
  if(!activeTool || activeTool==='strike' || activeTool==='eraser') return;
  const sel=window.getSelection();
  if(!sel||sel.isCollapsed) return;
  const col=document.getElementById('opts-col');
  if(!col) return;
  const btns=col.querySelectorAll('.opt-btn');
  const btn=btns[optIdx];
  if(!btn) return;
  const textSpan=btn.querySelector('.opt-text');
  if(!textSpan) return;
  const range=sel.getRangeAt(0);
  if(!textSpan.contains(range.commonAncestorContainer)) return;
  try {
    const span=document.createElement('span');
    span.className=`hl-${activeTool.replace('hl-','')}`;
    const key=`${qi}-${optIdx}`;
    attachHLClick(span,key,textSpan,true);
    range.surroundContents(span);
    quizState.optHighlights[key]=textSpan.innerHTML;
  } catch(e){}
  sel.removeAllRanges();
}

// Global listener: catches opt highlights on PC (mouseup fires after button clears selection)
document.addEventListener('pointerup', function(e) {
  if(_editMode) return; // Don't interfere with edit mode
  if(!activeTool || activeTool==='strike' || !quizState) return;
  // Small delay so browser finishes any internal selection clearing on buttons
  setTimeout(()=>{
    const sel=window.getSelection();
    if(!sel||sel.isCollapsed) return;
    const range=sel.getRangeAt(0);
    const col=document.getElementById('opts-col');
    if(!col) return;
    const qi=quizState.currentQ;
    col.querySelectorAll('.opt-btn').forEach((btn,i)=>{
      const textSpan=btn.querySelector('.opt-text');
      if(!textSpan) return;
      if(!textSpan.contains(range.commonAncestorContainer)) return;
      if(activeTool==='eraser'){
        textSpan.querySelectorAll('.hl-y,.hl-p,.hl-c,.hl-g').forEach(span=>{
          if(sel.containsNode(span,true)){
            const p=span.parentNode;
            while(span.firstChild) p.insertBefore(span.firstChild,span);
            p.removeChild(span);
          }
        });
        textSpan.normalize();
        const key=`${qi}-${i}`;
        quizState.optHighlights[key]=textSpan.innerHTML;
        sel.removeAllRanges();
        return;
      }
      try {
        const span=document.createElement('span');
        span.className=`hl-${activeTool.replace('hl-','')}`;
        const key=`${qi}-${i}`;
        attachHLClick(span,key,textSpan,true);
        range.surroundContents(span);
        quizState.optHighlights[key]=textSpan.innerHTML;
      } catch(err){}
      sel.removeAllRanges();
    });
  }, 10);
});

function handleExplSelect(e, qi, section) {
  if(!activeTool || activeTool==='strike') return;
  const sel=window.getSelection();
  if(!sel||sel.isCollapsed) return;
  const elId = section==='intro' ? `expl-intro-${qi}` : `expl-alt-${qi}-${section.replace('alt-','')}`;
  const el=document.getElementById(elId);
  if(!el) return;
  const range=sel.getRangeAt(0);
  if(!el.contains(range.commonAncestorContainer)){sel.removeAllRanges();return;}
  const key=`${qi}-${section}`;

  if(activeTool==='eraser') {
    el.querySelectorAll('.hl-y,.hl-p,.hl-c,.hl-g').forEach(span=>{
      if(sel.containsNode(span,true)){
        const p=span.parentNode;
        while(span.firstChild) p.insertBefore(span.firstChild,span);
        p.removeChild(span);
      }
    });
    el.normalize();
    quizState.explHighlights[key]=el.innerHTML;
    sel.removeAllRanges();
    return;
  }

  try {
    const span=document.createElement('span');
    span.className=`hl-${activeTool.replace('hl-','')}`;
    attachHLClick(span,key,el,'expl');
    range.surroundContents(span);
    quizState.explHighlights[key]=el.innerHTML;
  } catch(e){}
  sel.removeAllRanges();
}

function clearAllHL(qi) {
  sndClick();
  delete quizState.highlights[qi];
  const el=document.getElementById(`qtxt-${qi}`);
  if(el){
    el.querySelectorAll('.hl-y,.hl-p,.hl-c,.hl-g').forEach(span=>span.replaceWith(document.createTextNode(span.textContent)));
    el.normalize();
  }
  // Clear option highlights
  const q=activeSet.questions[qi];
  if(q) q.options.forEach((_,i)=>{
    const key=`${qi}-${i}`;
    delete quizState.optHighlights[key];
    const btn=document.querySelectorAll('#opts-col .opt-btn')[i];
    if(btn){ const ts=btn.querySelector('.opt-text'); if(ts){ ts.querySelectorAll('.hl-y,.hl-p,.hl-c,.hl-g').forEach(s=>s.replaceWith(document.createTextNode(s.textContent))); ts.normalize(); } }
  });
  // Clear explanation highlights
  if(quizState.explHighlights) {
    Object.keys(quizState.explHighlights).forEach(key=>{
      if(!key.startsWith(`${qi}-`)) return;
      delete quizState.explHighlights[key];
      const section=key.slice((`${qi}-`).length);
      const elId = section==='intro' ? `expl-intro-${qi}` : `expl-alt-${qi}-${section.replace('alt-','')}`;
      const elEx=document.getElementById(elId);
      if(elEx){ elEx.querySelectorAll('.hl-y,.hl-p,.hl-c,.hl-g').forEach(s=>s.replaceWith(document.createTextNode(s.textContent))); elEx.normalize(); }
    });
  }
}

/* ═══════════════════════════════════
   STRIKETHROUGH
═══════════════════════════════════ */
function toggleStrike(e,qi,optIdx) {
  e.stopPropagation(); sndClick();
  const key=`${qi}-${optIdx}`;
  quizState.striked[key]=!quizState.striked[key];
  rebuildOpts(qi);
}

function rebuildOpts(qi) {
  const q=activeSet.questions[qi], col=document.getElementById('opts-col');
  if(!col) return;
  col.innerHTML=q.options.map((opt,i)=>{
    const k=`${qi}-${i}`, striked=quizState.striked[k];
    return `<button class="opt-btn ${striked?'striked':''}" onclick="handleOptClick(${i})">
      <span class="opt-letter">${opt.letter}</span><span class="opt-text">${opt.text}</span>
      <span class="opt-strike-x" onclick="toggleStrike(event,${qi},${i})">⁻</span>
    </button>`;
  }).join('');
}

function handleOptClick(idx) {
  if (_editMode) return; // Edit mode — ignore answer clicks
  const qi=quizState.currentQ;
  // If text was selected (user was highlighting), don't process as answer click
  const sel=window.getSelection();
  if(sel&&!sel.isCollapsed) { sel.removeAllRanges(); return; }
  if(activeTool==='strike'){
    const key=`${qi}-${idx}`;
    quizState.striked[key]=!quizState.striked[key];
    sndClick(); rebuildOpts(qi); return;
  }
  if(activeTool) return; // highlight mode — don't select answer
  if(quizState.answered) return;
  // If clicking same pending → confirm
  if(quizState.pendingAnswer===idx){ confirmAnswer(); return; }
  // Otherwise set as pending
  quizState.pendingAnswer=idx;
  sndClick();
  rebuildOptsWithPending(qi);
}

function rebuildOptsWithPending(qi) {
  const q=activeSet.questions[qi], col=document.getElementById('opts-col');
  if(!col) return;
  const pending=quizState.pendingAnswer;
  col.innerHTML=q.options.map((opt,i)=>{
    const k=`${qi}-${i}`, striked=quizState.striked[k];
    const isPending=(i===pending);
    return `<button class="opt-btn ${striked?'striked':''} ${isPending?'pending':''}" onclick="handleOptClick(${i})" onpointerup="handleOptSelect(event,${qi},${i})">
      <span class="opt-letter">${opt.letter}</span><span class="opt-text">${opt.text}</span>
      <span class="opt-strike-x" onclick="toggleStrike(event,${qi},${i})">⁻</span>
    </button>`;
  }).join('');
  // Re-apply opt highlights
  q.options.forEach((_,i)=>{
    const key=`${qi}-${i}`;
    if(quizState.optHighlights?.[key]){
      const btn=col.querySelectorAll('.opt-btn')[i];
      if(btn){ const ts=btn.querySelector('.opt-text'); if(ts){ ts.innerHTML=quizState.optHighlights[key]; ts.querySelectorAll('.hl-y,.hl-p,.hl-c,.hl-g').forEach(span=>attachHLClick(span,key,ts,true)); } }
    }
  });
  // Show confirm bar
  let bar=document.getElementById('confirm-bar');
  if(!bar){
    bar=document.createElement('div');
    bar.id='confirm-bar';
    bar.className='confirm-bar';
    col.parentNode.insertBefore(bar, col.nextSibling);
  }
  const letter=q.options[pending]?.letter||'?';
  bar.innerHTML=`<span class="confirm-bar-txt">Alternativa <strong>${letter}</strong> selecionada</span>
    <button class="confirm-bar-cancel" onclick="cancelPending()">Cancelar</button>
    <button class="confirm-bar-ok" onclick="confirmAnswer()">✓ Confirmar</button>`;
}

/* ═══════════════════════════════════════════════════
   GEMINI ESSAY EVALUATOR
═══════════════════════════════════════════════════ */
const GEMINI_API_KEY = 'AIzaSyBXWImUEo_Gbj5ouTIHyCZafOTg0ORpYM4';
const GEMINI_MODELS = [
  'gemini-1.5-flash-latest',
  'gemini-1.5-flash',
  'gemini-1.5-pro-latest',
  'gemini-pro'
];
let _geminiModelIdx = 0;

function getGeminiURL() {
  return 'https://generativelanguage.googleapis.com/v1beta/models/'
    + GEMINI_MODELS[_geminiModelIdx]
    + ':generateContent?key=' + GEMINI_API_KEY;
}

async function callGemini(prompt) {
  const errors = [];
  for (let attempt = 0; attempt < GEMINI_MODELS.length; attempt++) {
    const model = GEMINI_MODELS[attempt];
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/'
      + model + ':generateContent?key=' + GEMINI_API_KEY;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 800 }
        })
      });
      const bodyText = await res.text();
      console.log('[Gemini] model=' + model + ' status=' + res.status + ' body=' + bodyText.slice(0, 300));
      if (!res.ok) {
        errors.push(model + ': HTTP ' + res.status + ' ' + bodyText.slice(0, 100));
        continue;
      }
      const data = JSON.parse(bodyText);
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (!text) { errors.push(model + ': resposta vazia'); continue; }
      _geminiModelIdx = attempt;
      return text;
    } catch(e) {
      const msg = e.message || String(e);
      console.log('[Gemini] model=' + model + ' EXCEPTION=' + msg);
      if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('Load failed')) {
        throw new Error('Sem conexão com a internet ou CORS bloqueado pelo browser. Tente abrir o arquivo via servidor.');
      }
      errors.push(model + ': ' + msg);
    }
  }
  throw new Error('Tentativas: ' + errors.join(' | '));
}

async function confirmEssay(qi) {
  sndClick();
  const textarea = document.getElementById('essay-input-' + qi);
  const essayText = textarea ? textarea.value.trim() : '';
  if (!essayText) { showNotif('Escreva sua resposta antes de confirmar!', true); return; }

  const q = activeSet.questions[qi];
  // Tenta todos os campos onde o gabarito pode estar
  const gabarito = (q.explanation || q.essayExpectedAnswer || q.expectedAnswer || q.gabarito || '').trim();

  console.log('[DEBUG confirmEssay] qi='+qi, 'type='+q.type, 'explanation='+JSON.stringify(q.explanation), 'gabarito='+JSON.stringify(gabarito));

  // Save answer immediately
  quizState.answered = true;
  quizState.answers.push({ q: qi, selected: null, correctIdx: null, essayText, geminiResult: null });

  // Show loading state
  renderQuizScreen(document.getElementById('screen'));

  // Inject loading indicator into essay area
  const wrap = document.getElementById('essay-wrap-' + qi);
  if (wrap) {
    wrap.insertAdjacentHTML('afterend',
      '<div id="gemini-loading-'+qi+'" class="gemini-loading">'+
      '<span class="gemini-spinner"></span> Avaliando sua resposta com IA...</div>');
  }

  if (!gabarito) {
    // No expected answer — just mark as done, show neutral
    const ans = quizState.answers.find(a => a.q === qi);
    if (ans) ans.geminiResult = { verdict: 'sem_gabarito', feedback: 'Esta questão não tem gabarito cadastrado. Sua resposta foi registrada para revisão.' };
    _renderGeminiResult(qi);
    return;
  }

  try {
    const prompt = `Você é um professor corrigindo uma questão dissertativa. Avalie a resposta do aluno com base no gabarito esperado.

ENUNCIADO DA QUESTÃO:
${q.text}

GABARITO ESPERADO (resposta modelo):
${gabarito}

RESPOSTA DO ALUNO:
${essayText}

Avalie e responda SOMENTE em JSON válido, sem markdown, sem explicações fora do JSON:
{
  "verdict": "correto" | "parcial" | "incorreto",
  "score": 0 a 100,
  "feedback": "Feedback curto e direto como professor (máx 3 frases)",
  "acertos": "O que o aluno acertou (só se parcial ou correto)",
  "divergencias": "O que divergiu ou faltou (só se parcial ou incorreto)",
  "dica": "Uma dica construtiva curta (só se incorreto ou parcial)"
}

Critérios:
- "correto": aluno demonstrou domínio do conteúdo essencial, mesmo com palavras diferentes
- "parcial": aluno acertou parte importante mas deixou a passar algo relevante
- "incorreto": aluno errou o conceito central ou respondeu algo completamente diferente
- Seja generoso com paráfrases corretas — o que importa é o conceito, não as palavras exatas`;

    const raw = await callGemini(prompt);
    const clean = raw.replace(/```json|```/g, '').trim();
    const result = JSON.parse(clean);

    const ans = quizState.answers.find(a => a.q === qi);
    if (ans) ans.geminiResult = result;

    // Update score counters
    if (result.verdict === 'correto') { quizState.score++; sndCorrect(); setTimeout(spawnConfetti, 80); }
    else if (result.verdict === 'incorreto') { quizState.wrong++; sndWrong(); }
    else { sndCorrect(); } // parcial — neutral sound

  } catch (e) {
    console.error('[Gemini error]', e);
    const ans = quizState.answers.find(a => a.q === qi);
    if (ans) ans.geminiResult = { verdict: 'erro', feedback: '⚠ Erro ao conectar com a IA: ' + e.message };
  }

  _renderGeminiResult(qi);
}

function _renderGeminiResult(qi) {
  // Remove loading
  const loading = document.getElementById('gemini-loading-' + qi);
  if (loading) loading.remove();

  const ans = quizState.answers.find(a => a.q === qi);
  const result = ans?.geminiResult;
  if (!result) return;

  const q = activeSet.questions[qi];
  const v = result.verdict;

  let html = '';

  if (v === 'correto') {
    html = '<div class="gemini-result correto">'
      + '<div class="gemini-verdict-badge correto"><span class="gemini-check">✓</span> CORRETO!</div>'
      + (result.score != null ? '<div class="gemini-score">'+result.score+'<span>/100</span></div>' : '')
      + '<div class="gemini-feedback">'+escapeHtml(result.feedback)+'</div>'
      + '</div>';
  } else if (v === 'parcial') {
    html = '<div class="gemini-result parcial">'
      + '<div class="gemini-verdict-badge parcial">◑ ACERTO PARCIAL</div>'
      + (result.score != null ? '<div class="gemini-score">'+result.score+'<span>/100</span></div>' : '')
      + '<div class="gemini-feedback">'+escapeHtml(result.feedback)+'</div>'
      + (result.acertos ? '<div class="gemini-section acertos"><span class="gemini-section-lbl">✓ O que você acertou</span>'+escapeHtml(result.acertos)+'</div>' : '')
      + (result.divergencias ? '<div class="gemini-section divergencias"><span class="gemini-section-lbl">△ O que divergiu</span>'+escapeHtml(result.divergencias)+'</div>' : '')
      + (result.dica ? '<div class="gemini-section dica"><span class="gemini-section-lbl">💡 Dica</span>'+escapeHtml(result.dica)+'</div>' : '')
      + (q.explanation ? '<div class="gemini-gabarito"><span class="gemini-section-lbl">📋 Gabarito esperado</span>'+escapeHtml(q.explanation)+'</div>' : '')
      + '</div>';
  } else if (v === 'incorreto') {
    html = '<div class="gemini-result incorreto">'
      + '<div class="gemini-verdict-badge incorreto">✗ INCORRETO</div>'
      + (result.score != null ? '<div class="gemini-score">'+result.score+'<span>/100</span></div>' : '')
      + '<div class="gemini-feedback">'+escapeHtml(result.feedback)+'</div>'
      + (result.divergencias ? '<div class="gemini-section divergencias"><span class="gemini-section-lbl">✗ Por que não acertou</span>'+escapeHtml(result.divergencias)+'</div>' : '')
      + (result.dica ? '<div class="gemini-section dica"><span class="gemini-section-lbl">💡 Dica do professor</span>'+escapeHtml(result.dica)+'</div>' : '')
      + (q.explanation ? '<div class="gemini-gabarito"><span class="gemini-section-lbl">📋 Gabarito esperado</span>'+escapeHtml(q.explanation)+'</div>' : '')
      + '</div>';
  } else if (v === 'sem_gabarito') {
    html = '<div class="gemini-result sem-gabarito">'
      + '<div class="gemini-verdict-badge parcial">📝 Registrado</div>'
      + '<div class="gemini-feedback">'+escapeHtml(result.feedback)+'</div>'
      + '</div>';
  } else {
    html = '<div class="gemini-result erro">'
      + '<div class="gemini-feedback" style="color:var(--coral)">⚠ '+escapeHtml(result.feedback)+'</div>'
      + '</div>';
  }

  // Inject after essay-wrap
  const existing = document.getElementById('gemini-result-' + qi);
  if (existing) { existing.outerHTML = '<div id="gemini-result-'+qi+'">'+html+'</div>'; }
  else {
    const wrap = document.getElementById('essay-wrap-' + qi);
    if (wrap) wrap.insertAdjacentHTML('afterend', '<div id="gemini-result-'+qi+'">'+html+'</div>');
  }

  // Scroll to result
  setTimeout(() => {
    const el = document.getElementById('gemini-result-' + qi);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 200);
}

function escapeHtml(s) {
  return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>');
}

function cancelPending() {
  sndClick();
  quizState.pendingAnswer=null;
  const bar=document.getElementById('confirm-bar');
  if(bar) bar.remove();
  rebuildOpts(quizState.currentQ);
}

function confirmAnswer() {
  const idx=quizState.pendingAnswer;
  if(idx===null||idx===undefined) return;
  quizState.pendingAnswer=null;
  const bar=document.getElementById('confirm-bar');
  if(bar) bar.remove();
  selectAnswer(idx);
}

/* ═══════════════════════════════════
   SELECT ANSWER
═══════════════════════════════════ */
function selectAnswer(idx) {
  if(quizState.answered) return;
  const q=activeSet.questions[quizState.currentQ];
  const cIdx=q.options.findIndex(o=>o.letter===q.correct);
  quizState.selectedAnswer=idx;
  quizState.answered=true;
  const ok=idx===cIdx;
  if(ok){quizState.score++;sndCorrect();setTimeout(spawnConfetti,80);}
  else{quizState.wrong++;sndWrong();}
  quizState.answers.push({q:quizState.currentQ,selected:idx,correctIdx:cIdx});
  activeTool=null;

  // Flash animation on card
  setTimeout(()=>{
    const card=document.getElementById('qcard');
    if(card){
      card.classList.add(ok?'flash-ok':'flash-bad');
      setTimeout(()=>card.classList.remove('flash-ok','flash-bad'),700);
    }
  },30);

  renderQuizScreen(document.getElementById('screen'));
}

function toggleExpl(h){
  h.nextElementSibling.classList.toggle('open');
  h.querySelector('.expl-ch').classList.toggle('open');
  // Check overflow after animation
  setTimeout(() => {
    const body = h.nextElementSibling;
    body.querySelectorAll('.expl-intro').forEach(el => {
      const wrap = el.closest('.expl-intro-wrap');
      if (wrap) checkExplOverflow(el, wrap);
    });
  }, 500);
}

function checkExplOverflow(el, wrap) {
  if (!el || !wrap) return;
  wrap.classList.toggle('overflows', el.scrollHeight > el.clientHeight + 4);
  // Hide fade while scrolled to bottom
  el.addEventListener('scroll', () => {
    const atBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 8;
    wrap.classList.toggle('overflows', !atBottom);
  }, { passive: true });
}

/* ═══════════════════════════════════
   RESULTS
═══════════════════════════════════ */
function renderResults(s) {
  const st=quizState, total=activeSet.questions.length;
  const pct=Math.round((st.score/total)*100);
  const circ=2*Math.PI*68, off=circ-(pct/100)*circ;
  const msg=pct===100?'Perfeito! Domínio total.':pct>=80?'Excelente!':pct>=60?'Bom resultado!':'Continue praticando!';
  if(pct>=80){setTimeout(spawnConfetti,200);sndCorrect();}

  s.innerHTML=`<div class="results-wrap">
    <div class="ring-wrap">
      <svg width="180" height="180" viewBox="0 0 180 180">
        <defs><linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:var(--gold-d)"/>
          <stop offset="100%" style="stop-color:var(--gold2)"/>
        </linearGradient></defs>
        <circle class="ring-bg" cx="90" cy="90" r="68"/>
        <circle class="ring-fill" cx="90" cy="90" r="68" stroke-dasharray="${circ}" stroke-dashoffset="${circ}" id="rfill"/>
      </svg>
      <div class="ring-center"><span class="ring-pct">${pct}%</span><span class="ring-lbl">acerto</span></div>
    </div>
    <h2 class="res-title">${msg}</h2>
    <p class="res-sub">"${activeSet.name}" · ${total} questões concluídas.</p>
    <div class="res-grid">
      <div class="res-cell"><div class="val">${total}</div><div class="lbl">Total</div></div>
      <div class="res-cell"><div class="val">${st.score}</div><div class="lbl">Corretas</div></div>
      <div class="res-cell"><div class="val">${st.wrong}</div><div class="lbl">Incorretas</div></div>
    </div>
    <div class="res-actions">
      <button class="btn btn-secondary" onclick="sndClick();startReview()">Revisar</button>
      <button class="btn btn-secondary" onclick="switchTab('library')">← Biblioteca</button>
      <button class="btn btn-primary" onclick="sndClick();restartQuiz()">Refazer</button>
    </div>
  </div>`;
  setTimeout(()=>{const el=document.getElementById('rfill');if(el) el.style.strokeDashoffset=off;},150);
}

function startReview(){sndClick();quizState.reviewMode=true;renderQuizScreen(document.getElementById('screen'));}

function renderReview(s) {
  const qs=activeSet.questions, st=quizState;
  let html=`<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:28px;flex-wrap:wrap;gap:12px;">
    <h2 style="font-family:var(--font-display);font-size:1.5rem;font-weight:700;">Revisão do Gabarito</h2>
    <div style="display:flex;gap:8px;">
      <button class="btn btn-secondary" onclick="sndClick();restartQuiz()">Refazer</button>
      <button class="btn btn-secondary" onclick="switchTab('library')">← Biblioteca</button>
    </div>
  </div>`;
  qs.forEach((q,qi)=>{
    const ans=st.answers.find(a=>a.q===qi);
    const cIdx=q.options.findIndex(o=>o.letter===q.correct);
    const ok=ans&&ans.selected===cIdx;
    const opts=q.options.map((opt,i)=>{
      let cls='dimmed';
      if(i===cIdx) cls='show-correct';
      if(ans&&i===ans.selected&&ans.selected!==cIdx) cls='sel-wrong';
      return `<button class="opt-btn ${cls}" disabled><span class="opt-letter">${opt.letter}</span><span class="opt-text">${opt.text}</span></button>`;
    }).join('');
    const rows=q.altExplanations.map(a=>{
      if(!a.text) return '';
      return `<div class="alt-row ${a.correct?'is-c':'is-w'}"><div class="alt-lbl ${a.correct?'c':'w'}">Alternativa ${a.letter} <span class="alt-tag">${a.correct?'CORRETA':'INCORRETA'}</span></div><div>${a.text}</div></div>`;
    }).join('');
    const rawExplR = q.explanation || '';
    const isHtmlR = /<[a-z][\s\S]*>/i.test(rawExplR);
    const explContentR = (!isHtmlR && isMarkdownText(rawExplR)) ? (renderMarkdown(rawExplR) || rawExplR) : rawExplR;
    html+=`<div class="quiz-toolbar" style="margin-bottom:0;border-radius:var(--radius) var(--radius) 0 0;border-bottom:none;"></div>
    <div class="q-card" style="margin-bottom:12px;">
      <div class="q-num" style="justify-content:space-between;"><span>Questão ${q.num||qi+1}</span>
        <span style="color:${ok?'var(--green)':'var(--coral)'};font-size:10px;font-family:var(--font-mono);letter-spacing:0.12em;">${ok?'✓ CORRETA':'✗ INCORRETA'}</span>
      </div>
      <div class="q-text">${q.text}</div>
      <div class="options-col">${opts}</div>
    </div>
    <div class="expl-panel" style="margin-bottom:32px;">
      <div class="expl-head" onclick="sndClick();toggleExpl(this)"><span class="expl-head-lbl">◈ Análise Completa</span><span class="expl-ch">▾</span></div>
      <div class="expl-body"><div class="expl-body-inner">${explContentR?`<div class="expl-intro">${explContentR}</div>`:''}<div>${rows}</div></div></div>
    </div>`;
  });
  s.innerHTML=`<div style="animation:fadeUp 0.5s ease both">${html}</div>`;
  window.scrollTo(0,0);
}

function restartQuiz(){initQuiz();renderQuizScreen(document.getElementById('screen'));window.scrollTo(0,0);}
