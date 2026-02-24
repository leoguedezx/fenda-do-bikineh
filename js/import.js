/* === IMPORT TAB & SAVE FLOW === */
/* ═══════════════════════════════════
   IMPORT
═══════════════════════════════════ */
function renderImport(s) {
  s.innerHTML = `<div style="animation:fadeUp 0.5s ease both">
    <div class="card accent">
      <div class="section-lbl">Formato de Importação</div>
      <p style="font-size:14px;color:var(--text2);margin-bottom:18px;">Cole suas questões abaixo. O parser aceita <strong style="color:var(--gold)">vários formatos</strong> — veja os exemplos:</p>
      <div class="format-box"><span class="c-gold">Questão 1)</span> Texto do enunciado aqui...
<span style="color:var(--text3);font-size:11px">   ↑ também aceita: "Questão 1", "Questão 1:", "Q1)", "Q.1", "QUESTÃO 1"</span>

<span class="c-am">A)</span> Primeira alternativa    <span style="color:var(--text3);font-size:11px">← também: "A." "A-" "A:" "(A)"</span>
<span class="c-am">B)</span> Segunda alternativa
<span class="c-am">C)</span> Terceira alternativa
<span class="c-am">D)</span> Quarta alternativa
<span class="c-am">E)</span> Quinta alternativa (opcional)

<span class="c-vi">Gabarito: B</span>    <span style="color:var(--text3);font-size:11px">← também: "Gab: B" "Resposta: B" "Correta: B"</span>
Análise geral da questão...

A alternativa A está incorreta porque...
A alternativa B está correta porque...
A alternativa C está incorreta porque...
A alternativa D está incorreta porque...</div>
      <textarea id="raw-input" placeholder="Cole aqui todas as suas questões..."></textarea>
      <div style="font-size:11px;color:var(--text3);font-family:var(--font-mono);padding:6px 2px;line-height:1.8;">
        💡 Questão <strong style="color:var(--violet)">dissertativa</strong>: use <code style="background:var(--surface3);padding:1px 5px;border-radius:4px;color:var(--violet)">[DISC]</code> antes do enunciado<br>
        📝 Gabarito dissertativo: <code style="background:var(--surface3);padding:1px 5px;border-radius:4px;color:var(--gold)">Gabarito esperado: sua resposta aqui</code>
      </div>
      <div class="btn-row">
        <button class="btn btn-secondary" onclick="clearImport()">Limpar</button>
        <button class="btn btn-secondary" onclick="openNewQuestionEditor('multiple')" style="border-color:rgba(192,132,252,.4);color:var(--violet)">✏️ Múltipla escolha</button>
        <button class="btn btn-secondary" onclick="openNewQuestionEditor('essay')" style="border-color:rgba(78,203,141,.4);color:var(--green)">📝 Dissertativa</button>
        <button class="btn btn-primary" onclick="parseAndPreview()">⬡ Analisar</button>
      </div>
    </div>
    <div id="parse-out"></div>
  </div>`;
}

/* ═══════════════════════════════════════════
   EDITOR VISUAL DE QUESTÃO
═══════════════════════════════════════════ */
function openNewQuestionEditor(defaultType) {
  sndClick();
  // Reset state
  _nqeType = defaultType || 'multiple';
  _nqeCorrect = null;

  const existing = document.getElementById('nqe-overlay');
  if (existing) { existing.remove(); return; }

  const isEssay = _nqeType === 'essay';
  const altsDisplay = isEssay ? 'none' : 'block';
  const explLabelText = isEssay
    ? 'Gabarito esperado <span style="color:var(--green);font-size:10px;font-weight:600">← IA usa isso para corrigir</span>'
    : 'Análise geral <span style="color:var(--text4);font-weight:400">(opcional)</span>';
  const explPlaceholder = isEssay
    ? 'Descreva a resposta esperada (a IA vai comparar com a sua resposta)...'
    : 'Análise, justificativa...';

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'nqe-overlay';

  const altsHTML = ['A','B','C','D','E'].map(function(l) {
    return '<div class="nqe-alt-row" id="nqe-alt-row-'+l+'">'
      + '<button class="nqe-correct-dot" id="nqe-dot-'+l+'" onclick="nqeSetCorrect(&quot;'+l+'&quot;)" title="Marcar como correta">'+l+'</button>'
      + '<input class="nqe-alt-input" id="nqe-alt-'+l+'" placeholder="Alternativa '+l+'..." />'
      + '</div>';
  }).join('');

  overlay.innerHTML = '<div class="modal-box nqe-box" onclick="event.stopPropagation()">'
    + '<div class="modal-title">✏️ Criar Questão</div>'
    + '<div class="nqe-field-label">Tipo</div>'
    + '<div class="nqe-type-row" id="nqe-type-row">'
    + '<button class="nqe-type-btn'+(isEssay?'':' active')+'" data-type="multiple" onclick="nqeSetType(&quot;multiple&quot;,this)">📋 Múltipla escolha</button>'
    + '<button class="nqe-type-btn'+(isEssay?' active':'')+ '" data-type="essay" onclick="nqeSetType(&quot;essay&quot;,this)">✏️ Dissertativa</button>'
    + '</div>'
    + '<div class="nqe-field-label">Enunciado <span class="nqe-required">*</span></div>'
    + '<textarea class="nqe-textarea" id="nqe-text" placeholder="Digite o enunciado da questão..." rows="4"></textarea>'
    + '<div id="nqe-alts-section" style="display:'+altsDisplay+'">'
    + '<div class="nqe-field-label" style="margin-top:14px;">Alternativas <span class="nqe-required">*</span></div>'
    + altsHTML
    + '<div class="nqe-field-label" style="margin-top:14px;">Gabarito</div>'
    + '<div class="nqe-correct-display" id="nqe-correct-display">Clique numa letra para marcar o gabarito</div>'
    + '</div>'
    + '<div class="nqe-field-label" style="margin-top:14px;" id="nqe-expl-label">'+explLabelText+'</div>'
    + '<textarea class="nqe-textarea" id="nqe-expl" placeholder="'+explPlaceholder+'" rows="3"></textarea>'
    + '<div class="modal-actions" style="margin-top:18px;">'
    + '<button class="btn btn-secondary" onclick="document.getElementById(&quot;nqe-overlay&quot;).remove()">Cancelar</button>'
    + '<button class="btn btn-primary" onclick="nqeConfirm()">➕ Adicionar ao texto</button>'
    + '</div>'
    + '</div>';

  overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
  document.body.appendChild(overlay);
  setTimeout(function(){ var t=document.getElementById('nqe-text'); if(t) t.focus(); }, 50);
}

let _nqeType = 'multiple';
let _nqeCorrect = null;

function nqeSetType(type, btn) {
  sndClick();
  _nqeType = type;
  _nqeCorrect = null;
  document.querySelectorAll('.nqe-type-btn').forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');
  var alts = document.getElementById('nqe-alts-section');
  var explLabel = document.getElementById('nqe-expl-label');
  var explTA = document.getElementById('nqe-expl');
  if (type === 'essay') {
    if (alts) alts.style.display = 'none';
    if (explLabel) explLabel.innerHTML = 'Gabarito esperado <span style="color:var(--green);font-size:10px;font-weight:600">← IA usa isso para corrigir</span>';
    if (explTA) explTA.placeholder = 'Descreva a resposta esperada (a IA vai comparar com a sua resposta)...';
  } else {
    if (alts) alts.style.display = '';
    if (explLabel) explLabel.innerHTML = 'Análise geral <span style="color:var(--text4);font-weight:400">(opcional)</span>';
    if (explTA) explTA.placeholder = 'Análise, justificativa...';
  }
}

function nqeSetCorrect(letter) {
  sndClick();
  _nqeCorrect = letter;
  ['A','B','C','D','E'].forEach(l => {
    const dot = document.getElementById('nqe-dot-'+l);
    if (dot) dot.classList.toggle('selected', l === letter);
  });
  const disp = document.getElementById('nqe-correct-display');
  if (disp) disp.innerHTML = `✓ Gabarito: <strong style="color:var(--gold)">${letter}</strong>`;
}

function nqeConfirm() {
  sndClick();
  const text = (document.getElementById('nqe-text')?.value || '').trim();
  if (!text) { showNotif('Digite o enunciado!', true); return; }

  let questionText = '';

  if (_nqeType === 'essay') {
    questionText = '[DISC]\n' + text;
    const expl = (document.getElementById('nqe-expl')?.value || '').trim();
    if (expl) questionText += '\nGabarito esperado: ' + expl;
  } else {
    const alts = ['A','B','C','D','E']
      .map(l => ({ l, v: (document.getElementById('nqe-alt-'+l)?.value || '').trim() }))
      .filter(a => a.v);
    if (alts.length < 2) { showNotif('Adicione pelo menos 2 alternativas!', true); return; }
    questionText = text + '\n\n' + alts.map(a => a.l + ') ' + a.v).join('\n');
    if (_nqeCorrect) questionText += '\n\nGabarito: ' + _nqeCorrect;
    const expl = (document.getElementById('nqe-expl')?.value || '').trim();
    if (expl) questionText += '\n\n' + expl;
  }

  // Append to raw-input textarea
  const ta = document.getElementById('raw-input');
  if (ta) {
    const cur = ta.value.trim();
    // Auto-number: count existing "Questão N" or [DISC] blocks
    const existingCount = (cur.match(/(?:^\s*Quest[aã]o\s*\d+|^\s*\[DISC\])/gim) || []).length;
    const nextNum = existingCount + 1;
    const numbered = 'Questão ' + nextNum + '\n' + questionText;
    ta.value = cur ? cur + '\n\n' + numbered : numbered;
    ta.scrollTop = ta.scrollHeight;
  }

  document.getElementById('nqe-overlay')?.remove();
  _nqeType = 'multiple';
  _nqeCorrect = null;
  showNotif('✓ Questão adicionada ao texto — clique em Analisar para importar!');
}

function clearImport() {
  sndClick();
  const el = document.getElementById('raw-input');
  if (el) el.value = '';
  document.getElementById('parse-out').innerHTML = '';
  parsedQs = [];
}

function parseAndPreview() {
  sndClick();
  const raw=(document.getElementById('raw-input')||{}).value||'';
  if(!raw.trim()){showNotif('Cole algum texto primeiro!',true);return;}
  parsedQs=parseQuestions(raw.trim());
  const out=document.getElementById('parse-out');
  if(!parsedQs.length){out.innerHTML=`<div class="card"><p style="color:var(--coral);font-family:var(--font-mono);font-size:13px;">Nenhuma questão detectada.</p></div>`;return;}
  const ok=parsedQs.filter(q=>!q.errors.length && q.type!=='essay' && !q.warnings.some(w=>w.includes('Gabarito'))).length;
  const incomplete=parsedQs.filter(q=>!q.errors.length && q.type!=='essay' && q.warnings.some(w=>w.includes('Gabarito'))).length;
  const essay=parsedQs.filter(q=>!q.errors.length && q.type==='essay').length;
  const warn=parsedQs.filter(q=>q.warnings.length&&!q.errors.length&&q.type!=='essay'&&!q.warnings.some(w=>w.includes('Gabarito'))).length;
  const err=parsedQs.filter(q=>q.errors.length).length;
  const cards=parsedQs.map((q,i)=>{
    const isEssay = q.type === 'essay';
    const isInc = !isEssay && q.warnings.some(w=>w.includes('Gabarito'));
    const st=q.errors.length?'err':(isInc?'warn':(q.warnings.length?'warn':'ok'));
    const stl=q.errors.length?'✗ Inválida':(isEssay?'✏️ Dissertativa':(isInc?'◌ Sem gabarito':(q.warnings.length?'◌ Atenção':'✓ OK')));
    const alts=isEssay?'<em style="color:var(--text3);font-size:12px">Questão de resposta escrita</em>':q.options.map(o=>`<div class="palt ${o.letter===q.correct?'correct':''}">${o.letter}) ${o.text}</div>`).join('');
    const errs=[...q.errors,...q.warnings].map(e=>`<div class="err-msg">↳ ${e}</div>`).join('');
    const metaHtml = isEssay
      ? '<div class="pcard-meta"><span>Tipo: <b>Dissertativa</b></span><span>Gabarito: <b style="color:'+(q.explanation?'var(--green)':'var(--coral)')+'">'+( q.explanation ? '✓ Cadastrado' : '✗ Ausente')+'</b></span></div>'
      : '<div class="pcard-meta"><span>Gabarito: <b>'+(q.correct||'?')+'</b></span><span>Análise: <b>'+(q.explanation?'✓':'✗')+'</b></span></div>';
    return `<div class="pcard ${q.errors.length?'has-err':q.warnings.length?'has-warn':''}">
      <div class="pcard-head"><span class="pcard-num">Questão ${q.num||i+1}${isEssay?' <span class="essay-type-badge">DISC</span>':''}</span><span class="pcard-status ${st}">${stl}</span></div>
      <div class="ptoggle" onclick="sndClick();togglePBody(this)"><span class="ch">▾</span> Ver detalhes</div>
      <div class="pbody"><div class="pcard-text">${q.text||'—'}</div><div class="pcard-alts">${alts}</div>${metaHtml}${errs}</div>
    </div>`;
  }).join('');
  out.innerHTML=`<div class="card" style="animation:fadeUp 0.4s ease both">
    <div class="section-lbl">Resultado</div>
    <div class="result-pills">
      <div class="rpill">${parsedQs.length} questões</div>
      ${ok?`<div class="rpill ok">✓ ${ok} completas</div>`:''}
      ${essay?`<div class="rpill" style="border-color:rgba(192,132,252,.3);color:var(--violet)">✏️ ${essay} dissertativa${essay>1?'s':''}</div>`:''}
      ${incomplete?`<div class="rpill warn">◌ ${incomplete} sem gabarito</div>`:''}
      ${warn?`<div class="rpill warn">◌ ${warn} aviso</div>`:''}
      ${err?`<div class="rpill err">✗ ${err} erro</div>`:''}
    </div>
    <div class="preview-list">${cards}</div>
    ${ok+warn+incomplete+essay>0?`<div class="btn-row" style="margin-top:24px;">
      <button class="btn btn-secondary" onclick="openSaveModal()">⬇ Salvar na Biblioteca</button>
      ${ok+warn+essay>0?`<button class="btn btn-primary" onclick="startQuizDirect()">▶ Iniciar Quiz</button>`:''}
    </div>`:''}
  </div>`;
}

function togglePBody(el) {
  el.nextElementSibling.classList.toggle('open');
  el.querySelector('.ch').classList.toggle('open');
}

function openSaveModal() {
  sndClick();
  // If there are existing sets, offer to append or create new
  if(library.length){
    showSaveOrAppendModal();
    return;
  }
  showNewSetModal();
}

function showNewSetModal() {
  showModal({
    title:'Salvar na Biblioteca', sub:'Nome para este conjunto.',
    input:true, inputPlaceholder:'Ex: Parasitologia \u2014 Tricur\u00edase',
    confirmLabel:'Salvar',
    onConfirm:function(name){
      if(!name||!name.trim()){showNotif('Digite um nome.',true);return;}
      var qs=parsedQs.filter(function(q){return q.text && !q.errors.length;});
      var incompleteCount=qs.filter(function(q){return !q.correct;}).length;
      library.push({id:Date.now(),name:name.trim(),questions:qs,date:new Date().toLocaleDateString('pt-BR')});
      lastUsedSetIdx=library.length-1;
      sndSave();
      var notifMsg=incompleteCount>0
        ? '\u2713 "'+name.trim()+'" salvo — '+qs.length+' questões ('+incompleteCount+' sem gabarito → Incompletas)!'
        : '\u2713 "'+name.trim()+'" salvo com '+qs.length+' quest\u00f5es!';
      showNotif(notifMsg);
      switchTab('library');
    }
  });
}

function showSaveOrAppendModal() {
  document.getElementById('app-modal') && document.getElementById('app-modal').remove();
  var overlay=document.createElement('div');
  overlay.className='modal-overlay'; overlay.id='app-modal';
  var qs=parsedQs.filter(function(q){return q.text && !q.errors.length;});
  var incCountModal=qs.filter(function(q){return !q.correct;}).length;
  if(lastUsedSetIdx >= library.length) lastUsedSetIdx = library.length - 1;
  var setOptions=library.map(function(s,i){
    return '<option value="'+i+'"'+(i===lastUsedSetIdx?' selected':'')+'>'+s.name+' ('+s.questions.length+' quest\u00f5es)</option>';
  }).join('');
  overlay.innerHTML='<div class="modal-box">'
    +'<div class="modal-title">Salvar na Biblioteca</div>'
    +'<div class="modal-sub">'+qs.length+' questão(ões) importada(s)'+(incCountModal>0?' · <span style="color:var(--violet)">'+incCountModal+' sem gabarito</span>':'')+' </div>'
    +'<div style="display:flex;flex-direction:column;gap:12px;margin:16px 0;">'
    +'<button class="btn btn-primary" onclick="closeModal();showNewSetModal()" style="justify-content:center;">+ Criar novo conjunto</button>'
    +'<div style="border-top:1px solid var(--border);padding-top:12px;">'
    +'<div style="font-size:11px;color:var(--text3);margin-bottom:8px;letter-spacing:0.08em;text-transform:uppercase;">Adicionar a conjunto existente:</div>'
    +'<select id="append-select" style="width:100%;padding:8px 12px;border-radius:6px;border:1px solid var(--border2);background:var(--surface3);color:var(--text);font-size:13px;margin-bottom:8px;">'+setOptions+'</select>'
    +'<button class="btn btn-secondary" onclick="doAppendFromImport()" style="width:100%;justify-content:center;">\uff0b Adicionar a este conjunto</button>'
    +'</div></div>'
    +'<div class="modal-actions"><button class="btn btn-secondary" onclick="closeModal()">Cancelar</button></div>'
    +'</div>';
  document.body.appendChild(overlay);
  overlay.addEventListener('click',function(e){if(e.target===overlay)closeModal();});
}

function doAppendFromImport() {
  var sel=document.getElementById('append-select');
  if(!sel) return;
  var idx=parseInt(sel.value);
  var qs=parsedQs.filter(function(q){return q.text && !q.errors.length;});
  var incompleteAppend=qs.filter(function(q){return !q.correct;}).length;
  library[idx].questions=library[idx].questions.concat(qs);
  library[idx].date=new Date().toLocaleDateString('pt-BR');
  lastUsedSetIdx=idx;
  closeModal();
  sndSave();
  var notifAppend=incompleteAppend>0 ? '\u2713 '+qs.length+' questão(ões) adicionada(s) a "'+library[idx].name+'" ('+incompleteAppend+' sem gabarito).' : '\u2713 '+qs.length+' quest\u00e3o(\u00f5es) adicionada(s) a "'+library[idx].name+'".';
  showNotif(notifAppend);
  switchTab('library');
}

function startQuizDirect() {
  sndClick();
  activeSetIdx = -1;
  const qs=parsedQs.filter(q=>q.text);
  activeSet={name:'Quiz atual',questions:qs};
  initQuiz();
  document.getElementById('quiz-tab-btn').style.display='';
  switchTab('quiz');
}
