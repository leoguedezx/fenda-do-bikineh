/* === EXPORT SYSTEM === */
const _IA_PROMPT = 'Por favor, indique o gabarito (A, B, C, D ou E) e forneça uma análise completa, sendo extremamente detalhado em cada questão sem se importar com limite de linhas, qualquer coisa mandarei o comando para continuar. Quero que tenha uma explicação da análise completa extremamente didática, ensinando tudo que foi abordado no enunciado sobre o conteúdo para aprender a fazer qualquer questão relacionado, com uma linguagem bem simples explicando em camadas e com contexto';

function _sh(s) { return (s||'').replace(/<br\s*\/?>/gi,'\n').replace(/<[^>]+>/g,'').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').trim(); }

function _copyText(txt, msg) {
  var ep = document.getElementById('export-panel'); if (ep) ep.remove();
  navigator.clipboard.writeText(txt)
    .then(function(){ showNotif('\u2713 ' + (msg || 'Copiado!')); })
    .catch(function(){
      var ta = document.createElement('textarea'); ta.value = txt;
      ta.style.cssText = 'position:fixed;opacity:0'; document.body.appendChild(ta);
      ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
      showNotif('\u2713 ' + (msg || 'Copiado!'));
    });
}

function _fmtQ(q, i) {
  return '\u2588 Questão ' + (q.num||(i+1)) + '\n' + _sh(q.text) + '\n\n' + (q.options||[]).map(function(o){ return o.letter + ') ' + _sh(o.text); }).join('\n');
}
function _fmtQIA(q, i) {
  return '\u2501'.repeat(26) + '\n\nQ' + (q.num||(i+1)) + ':\n' + _sh(q.text) + '\n\n'
    + (q.options||[]).map(function(o){ return o.letter + ') ' + _sh(o.text); }).join('\n\n')
    + '\n\n' + (q.correct ? 'Gabarito: ' + q.correct : 'Gabarito: ___');
}
function _fmtGabDet(qs) {
  var sep = '\n\n' + '\u2550'.repeat(16) + '\n\n';
  return '**Gabarito detalhado**\n\n' + qs.map(function(q, i) {
    var n = q.num||(i+1); var b = '**Questão ' + n + '**\n**Gabarito:** ' + (q.correct||'?') + '\n\n';
    if (q.explanation && q.explanation.trim()) b += '**Análise Geral:**\n' + _sh(q.explanation) + '\n\n';
    if (q.altExplanations && q.altExplanations.length) {
      b += '**Justificativa por alternativa:**\n';
      q.altExplanations.forEach(function(a){ var t=_sh(a.text||a.explanation||''); if(t) b += a.letter+') '+t+'\n\n'; });
    }
    return b.trim();
  }).join(sep);
}

/* painel 📋 no card de questão */
function toggleExportPanel(qi) {
  sndClick();
  var ex = document.getElementById('export-panel'); if (ex) { ex.remove(); return; }
  var isMobile = window.innerWidth <= 460;
  var card = document.getElementById('qcard'); if (!card && !isMobile) return;
  var p = document.createElement('div'); p.className = 'export-panel'; p.id = 'export-panel'; p.dataset.qi = qi;
  p.innerHTML =
    '<div class="export-panel-title">'
    + '<span>📋 EXPORTAR / COPIAR</span>'
    + '<button class="ep-close" style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:18px;line-height:1;padding:0">✕</button>'
    + '</div>'
    + '<div class="export-grid">'
    + '<button class="export-btn" data-act="q"><span class="export-btn-icon">📄</span><span class="export-btn-label">Esta questão</span></button>'
    + '<button class="export-btn" data-act="all"><span class="export-btn-icon">📄📄</span><span class="export-btn-label">Todas as questões</span></button>'
    + '<button class="export-btn" data-act="gab"><span class="export-btn-icon">✅</span><span class="export-btn-label">Gabarito simples</span></button>'
    + '<div class="export-section-sep"></div>'
    + '<button class="export-btn" data-act="ia"><span class="export-btn-icon">🤖</span><span class="export-btn-label">Esta p/ IA</span></button>'
    + '<button class="export-btn" data-act="ia-all"><span class="export-btn-icon">🤖📄</span><span class="export-btn-label">Todas p/ IA</span></button>'
    + '<button class="export-btn" data-act="gab-det"><span class="export-btn-icon">📝</span><span class="export-btn-label">Gabarito detalhado</span></button>'
    + '</div>';
  p.addEventListener('click', function(e) {
    e.stopPropagation();
    if (e.target.closest('.ep-close')) { p.remove(); return; }
    var btn = e.target.closest('[data-act]'); if (!btn) return;
    var qi2 = parseInt(p.dataset.qi);
    var qs = (activeSet && activeSet.questions) || [];
    var q = qs[qi2];
    switch(btn.dataset.act) {
      case 'q':       if(q) _copyText(_fmtQ(q,qi2), 'Questão copiada!'); break;
      case 'all':     if(qs.length) _copyText(qs.map(function(x,i){return _fmtQ(x,i);}).join('\n\n\u2015\n\n'), qs.length+' questões copiadas!'); break;
      case 'gab':     if(qs.length) _copyText('**Gabarito**\n\n'+qs.map(function(x,i){return 'Questão '+(x.num||i+1)+' \u2015 '+(x.correct||'?');}).join('\n'), 'Gabarito copiado!'); break;
      case 'ia':      if(q) _copyText(_IA_PROMPT+'\n\n'+_fmtQIA(q,qi2), 'Prompt copiado p/ IA!'); break;
      case 'ia-all':  if(qs.length) _copyText(_IA_PROMPT+'\n\n'+qs.map(function(x,i){return _fmtQIA(x,i);}).join('\n\n'), qs.length+' questões copiadas p/ IA!'); break;
      case 'gab-det': if(qs.length) _copyText(_fmtGabDet(qs), 'Gabarito detalhado copiado!'); break;
    }
  });
  // No mobile, append to body para funcionar com position:fixed
  if (isMobile) {
    document.body.appendChild(p);
  } else {
    card.appendChild(p);
  }
  setTimeout(function(){
    document.addEventListener('click', function _cl(e){
      var panel = document.getElementById('export-panel');
      if (!panel) return document.removeEventListener('click', _cl);
      if (!panel.contains(e.target) && !e.target.closest('.qe-export-btn')) { panel.remove(); document.removeEventListener('click', _cl); }
    });
  }, 50);
}

/* export por conjunto (aba Conjuntos) */
function _getSetQs(si) { return (library[si] && library[si].questions) || []; }
function setExportCopyAll(si) { var qs=_getSetQs(si); if(!qs.length)return; _copyText(qs.map(function(q,i){return _fmtQ(q,i);}).join('\n\n\u2015\n\n'), qs.length+' questões copiadas!'); }
function setExportCopyIA(si)  { var qs=_getSetQs(si); if(!qs.length)return; _copyText(_IA_PROMPT+'\n\n'+qs.map(function(q,i){return _fmtQIA(q,i);}).join('\n\n'), qs.length+' questões copiadas p/ IA!'); }
function setExportGabSimples(si) { var qs=_getSetQs(si); if(!qs.length)return; _copyText('**Gabarito**\n\n'+qs.map(function(q,i){return 'Questão '+(q.num||i+1)+' \u2015 '+(q.correct||'?');}).join('\n'), 'Gabarito copiado!'); }
function setExportGabDetalhado(si) { var qs=_getSetQs(si); if(!qs.length)return; _copyText(_fmtGabDet(qs), 'Gabarito detalhado copiado!'); }

/* ── v23: COPY TO AI ── */
function copyDoubtQuestion(si,qi){
  var q=library[si]&&library[si].questions[qi];if(!q)return;
  var PROMPT='Por favor, indique o gabarito (A, B, C, D ou E) e forneça uma análise completa, sendo extremamente detalhado em cada questão sem se importar com limite de linhas, qualquer coisa mandarei o comando para continuar. Quero que tenha uma explicação da análise completa extremamente didática, ensinando tudo que foi abordado no enunciado sobre o conteúdo para aprender a fazer qualquer questão relacionado, com uma linguagem bem simples explicando em camadas e com contexto';
  var num=q.num||(qi+1);
  var enun=(q.text||'').replace(/<[^>]+>/g,'').trim();
  var opts=(q.options||[]).map(function(o){return o.letter+') '+((o.text||'').replace(/<[^>]+>/g,'').trim());}).join('\n\n');
  var gab=q.correct?'Gabarito: '+q.correct:'Gabarito: ___';
  var out=PROMPT+'\n\n'+'\u2501'.repeat(26)+'\n\nQ'+num+':\n'+enun+'\n\n'+opts+'\n\n'+gab;
  navigator.clipboard.writeText(out).then(function(){showNotif('\u2713 Copiado p/ IA!');}).catch(function(){var ta=document.createElement('textarea');ta.value=out;ta.style.cssText='position:fixed;opacity:0';document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);showNotif('\u2713 Copiado!');});
}
function copyDoubtBlockToAI(si){
  var items=Object.values(_doubts||{}).filter(function(d){return String(d.setIdx)===String(si);});
  if(!items.length){showNotif('Nenhuma d\u00favida.',true);return;}
  var nome=(library[si]||{}).name||'Conjunto';
  var PROMPT='Por favor, indique o gabarito (A, B, C, D ou E) e forneça uma análise completa, sendo extremamente detalhado em cada questão sem se importar com limite de linhas, qualquer coisa mandarei o comando para continuar. Quero que tenha uma explicação da análise completa extremamente didática, ensinando tudo que foi abordado no enunciado sobre o conteúdo para aprender a fazer qualquer questão relacionado, com uma linguagem bem simples explicando em camadas e com contexto';
  var blocos=items.map(function(d){
    var q=(library[d.setIdx]||{questions:[]}).questions[d.qIdx];if(!q)return '';
    var num=q.num||(d.qIdx+1);
    var enun=(q.text||'').replace(/<[^>]+>/g,'').trim();
    var opts=(q.options||[]).map(function(o){return o.letter+') '+((o.text||'').replace(/<[^>]+>/g,'').trim());}).join('\n\n');
    var gab=q.correct?'Gabarito: '+q.correct:'Gabarito: ___';
    return 'Q'+num+':\n'+enun+'\n\n'+opts+'\n\n'+gab;
  }).filter(Boolean).join('\n\n\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015\n\n');
  var out='=== D\u00daVIDAS: '+nome+' ===\n'+PROMPT+'\n\n\n\n'+blocos;
  navigator.clipboard.writeText(out).then(function(){showNotif('\u2713 D\u00favidas copiadas p/ IA!');}).catch(function(){var ta=document.createElement('textarea');ta.value=out;ta.style.cssText='position:fixed;opacity:0';document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);showNotif('\u2713 Copiado!');});
}
function copyIncompleteBlockToAI(si){
  var set=library[si];if(!set)return;
  var incs=(set.questions||[]).filter(function(q){return !q.correct;});
  if(!incs.length){showNotif('Nenhuma questão sem gabarito.',true);return;}
  var lines=['=== SEM GABARITO: '+set.name+' ===\n'];
  incs.forEach(function(q,i){
    var opts=(q.options||[]).map(function(o){return o.letter+') '+(o.text||'').replace(/<[^>]+>/g,'');}).join('\n');
    lines.push('Q'+(q.num||i+1)+':\n'+(q.text||'').replace(/<[^>]+>/g,'')+'\n'+opts+'\n');
  });
  navigator.clipboard.writeText(lines.join('\n')).then(function(){showNotif(incs.length+' questão(ões) copiada(s)!');}).catch(function(){showNotif('Erro.',true);});
}

/* ── v23: EDIT ANALYSIS ── */
function toggleEditAnalysis(cardId,si,qi){
  var p=document.getElementById('sqc-edit-'+cardId);
  if(!p)return;
  p.classList.toggle('open');
}
function saveEditAnalysis(cardId,si,qi){
  var p=document.getElementById('sqc-edit-'+cardId);if(!p)return;
  var q=library[si]&&library[si].questions[qi];if(!q)return;
  if(!q.altExplanations)q.altExplanations=[];
  p.querySelectorAll('.alt-expl-textarea').forEach(function(ta){
    var letter=ta.dataset.letter;
    var ae=q.altExplanations.find(function(a){return a.letter===letter;});
    if(ae){ae.explanation=ta.value.trim();}
    else{q.altExplanations.push({letter:letter,explanation:ta.value.trim(),correct:letter===q.correct});}
  });
  var gen=p.querySelector('.answer-expl-input');
  if(gen)q.explanation=gen.value.trim();
  sndSave();
  p.classList.remove('open');
  // Re-render the status badge
  var badge=document.querySelector('#sqcard-'+cardId+' .sqc-analysis-badge');
  if(badge){
    var st=_analysisStatus(q);
    badge.className='sqc-analysis-badge '+(st==='complete'?'complete':st==='partial'?'partial':'none');
    badge.textContent=st==='complete'?'\u2713 análise completa':st==='partial'?'\u270f parcial':'\u26a0 sem análise';
  }
  showNotif('\u2713 Análise salva!');
}

/* ── v23: FILTER ANALYSIS ── */
function setAnalysisFilter(si,mode,btn){
  var container=document.getElementById('set-q-cards-'+si);if(!container)return;
  if(btn){
    var fr=btn.closest('.set-analysis-filter');
    if(fr)fr.querySelectorAll('.set-filter-btn').forEach(function(b){b.classList.remove('active');});
    btn.classList.add('active');
  }
  container.querySelectorAll('[id^="sqcard-"]').forEach(function(card){
    if(mode==='all'){card.style.display='';return;}
    var hasC=card.querySelector('.sqc-analysis-badge.complete');
    var hasP=card.querySelector('.sqc-analysis-badge.partial');
    var hasN=card.querySelector('.sqc-analysis-badge.none');
    if(mode==='complete')card.style.display=hasC?'':'none';
    else if(mode==='partial')card.style.display=hasP?'':'none';
    else if(mode==='none')card.style.display=hasN?'':'none';
  });
}

/* ── v23: EXPORT / IMPORT LIBRARY ── */
function exportLibrary(){
  var data=JSON.stringify({version:1,library:library,doubts:_doubts,exportedAt:new Date().toISOString()},null,2);
  var blob=new Blob([data],{type:'application/json'});
  var url=URL.createObjectURL(blob);
  var a=document.createElement('a');a.href=url;
  a.download='biblioteca-'+new Date().toISOString().slice(0,10)+'.qblib';
  document.body.appendChild(a);a.click();document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showNotif('\u2713 Biblioteca exportada!');
}
function importLibraryFromFile(){
  var inp=document.createElement('input');
  inp.type='file';inp.accept='.qblib,.json,.html';inp.style.cssText='position:fixed;top:-9999px;left:-9999px;opacity:0;width:1px;height:1px';
  inp.onchange=function(){
    var file=inp.files[0];
    try{if(inp.parentNode)inp.parentNode.removeChild(inp);}catch(e){}
    if(!file)return;
    var reader=new FileReader();
    reader.onload=function(ev){
      try{
        var raw=ev.target.result||'';
        if(raw.charCodeAt(0)===0xFEFF)raw=raw.slice(1);
        var t=raw.replace(/^[\t\n\r ]+/,'');
        if(t.charAt(0)==='<'){
          var m=raw.match(/<script[^>]+id=.embedded-data.[^>]*>([\s\S]*?)<\/script>/i);
          if(!m)throw new Error('HTML sem dados.');
          raw=m[1].trim();
        }
        var data=JSON.parse(raw);
        if(!Array.isArray(data.library))throw new Error('Arquivo não contém library[]');
        var added=0;
        data.library.forEach(function(set){
          if(!set.name||!Array.isArray(set.questions))return;
          if(!library.some(function(s){return s.name===set.name;})){library.push(set);added++;}
        });
        if(data.doubts)Object.assign(_doubts,data.doubts);
        sndSave();render();
        showNotif('\u2713 '+added+' conjunto(s) importado(s)!');
      }catch(err){
        console.error('importLibraryFromFile:',err);
        showNotif('Arquivo inválido — '+err.message,true);
      }
    };
    reader.readAsText(file,'utf-8');
  };
  document.body.appendChild(inp);
  inp.click();
}


/* ══ doubt card: gabarito e análise — funções globais diretas ══ */
function dqToggleGab(cardId) {
  var rev = document.getElementById('rev-' + cardId);
  var card = document.getElementById(cardId);
  var gabBtn = document.getElementById('gabBtn-' + cardId);
  var analBtn = document.getElementById('analBtn-' + cardId);
  if (!rev || !card) return;
  var si = parseInt(card.dataset.si);
  var qi = parseInt(card.dataset.qi);
  var q = library[si] && library[si].questions[qi];
  if (!q) return;

  // toggle off
  if (rev.dataset.mode === 'gab') {
    rev.innerHTML = '';
    rev.dataset.mode = '';
    if (gabBtn) gabBtn.classList.remove('active');
    card.querySelectorAll('.doubt-q-opt').forEach(function(o){
      o.style.opacity=''; o.style.color=''; o.style.fontWeight='';
      var l=o.querySelector('.ltr'); if(l) l.style.color='';
    });
    return;
  }

  // fechar análise se aberta
  if (analBtn) analBtn.classList.remove('active');
  if (rev.dataset.mode === 'anal') {
    card.querySelectorAll('.doubt-q-opt').forEach(function(o){
      o.style.opacity=''; o.style.color=''; o.style.fontWeight='';
      var l=o.querySelector('.ltr'); if(l) l.style.color='';
    });
  }

  rev.dataset.mode = 'gab';
  if (gabBtn) gabBtn.classList.add('active');

  // destacar alternativa correta
  card.querySelectorAll('.doubt-q-opt').forEach(function(opt) { opt.style.opacity = '0.4'; opt.style.color = ''; opt.style.fontWeight = ''; var l=opt.querySelector('.ltr'); if(l) l.style.color=''; });
  card.querySelectorAll('.doubt-q-opt').forEach(function(opt) {
    var ltr = opt.querySelector('.ltr');
    if (ltr && ltr.textContent.trim().replace(')','') === q.correct) {
      opt.style.opacity = '1';
      opt.style.color = 'var(--green, #4ade80)';
      opt.style.fontWeight = '600';
      ltr.style.color = 'var(--green, #4ade80)';
    }
  });

  var box = document.createElement('div');
  box.className = 'dq-gab-reveal';
  box.innerHTML =
    '<div class="dq-gab-label">Gabarito</div>'
    + '<div class="dq-gab-letter">' + (q.correct || '?') + '</div>'
    + (q.options && q.correct ? (function(){
        var o = (q.options||[]).find(function(x){return x.letter===q.correct;});
        return o ? '<div class="dq-gab-text">' + (o.text||'').replace(/<[^>]+>/g,'') + '</div>' : '';
      })() : '');
  rev.innerHTML = '';
  rev.appendChild(box);
}

function dqToggleAnal(cardId) {
  var rev = document.getElementById('rev-' + cardId);
  var card = document.getElementById(cardId);
  var gabBtn = document.getElementById('gabBtn-' + cardId);
  var analBtn = document.getElementById('analBtn-' + cardId);
  if (!rev || !card) return;
  var si = parseInt(card.dataset.si);
  var qi = parseInt(card.dataset.qi);
  var q = library[si] && library[si].questions[qi];
  if (!q) return;

  // toggle off
  if (rev.dataset.mode === 'anal') {
    rev.innerHTML = '';
    rev.dataset.mode = '';
    if (analBtn) analBtn.classList.remove('active');
    if (gabBtn) gabBtn.classList.remove('active');
    card.querySelectorAll('.doubt-q-opt').forEach(function(o){
      o.style.opacity=''; o.style.color=''; o.style.fontWeight='';
      var l=o.querySelector('.ltr'); if(l) l.style.color='';
    });
    return;
  }

  // fechar gabarito se aberto
  if (gabBtn) gabBtn.classList.remove('active');
  card.querySelectorAll('.doubt-q-opt').forEach(function(o){
    o.style.opacity=''; o.style.color=''; o.style.fontWeight='';
    var l=o.querySelector('.ltr'); if(l) l.style.color='';
  });

  rev.dataset.mode = 'anal';
  if (analBtn) analBtn.classList.add('active');
  if (gabBtn) gabBtn.classList.add('active');

  // destacar alternativa correta
  card.querySelectorAll('.doubt-q-opt').forEach(function(opt) { opt.style.opacity = '0.4'; });
  card.querySelectorAll('.doubt-q-opt').forEach(function(opt) {
    var ltr = opt.querySelector('.ltr');
    if (ltr && ltr.textContent.trim().replace(')','') === q.correct) {
      opt.style.opacity = '1';
      opt.style.color = 'var(--green, #4ade80)';
      opt.style.fontWeight = '600';
      ltr.style.color = 'var(--green, #4ade80)';
    }
  });

  var expl = (q.explanation||'').replace(/<br\s*\/?>/gi,'\n').replace(/<[^>]+>/g,'').trim();

  // Justificativas por alternativa
  var altRows = '';
  if (q.options && q.options.length) {
    altRows = q.options.map(function(o, oi) {
      var ae = (q.altExplanations && q.altExplanations[oi]) || (q.altExplanations && q.altExplanations.find && q.altExplanations.find(function(a){return a.letter===o.letter;})) || {};
      var justText = (ae.explanation || ae.text || '').replace(/<br\s*\/?>/gi,'\n').replace(/<[^>]+>/g,'').trim();
      var isCorrect = o.letter === q.correct;
      var letterColor = isCorrect ? 'var(--green, #4ade80)' : 'var(--text3)';
      var borderLeft = isCorrect ? '2px solid var(--green, #4ade80)' : '1px solid var(--border)';
      var bgColor = isCorrect ? 'rgba(78,203,141,0.06)' : 'transparent';
      if (!justText) return '';
      return '<div style="padding:7px 10px;border-radius:7px;border-left:' + borderLeft + ';background:' + bgColor + ';margin-bottom:5px;">'
        + '<div style="font-family:var(--font-mono);font-size:10px;font-weight:700;color:' + letterColor + ';margin-bottom:3px;letter-spacing:0.05em;">' + o.letter + (isCorrect ? ' ✓' : '') + '</div>'
        + '<div style="font-size:12px;color:var(--text2);line-height:1.6;white-space:pre-wrap;">' + justText + '</div>'
        + '</div>';
    }).filter(Boolean).join('');
  }

  var hasAltRows = altRows.length > 0;
  var hasExpl = expl.length > 0;

  var box = document.createElement('div');
  box.className = 'dq-anal-reveal';
  box.innerHTML =
    (q.correct ? '<div class="dq-gab-label">Gabarito</div><div class="dq-gab-letter" style="margin-bottom:12px">' + q.correct + '</div>' : '')
    + (hasAltRows
        ? '<div class="dq-anal-title" style="margin-bottom:8px">Justificativas</div>' + altRows
        : '')
    + (hasExpl
        ? '<div class="dq-anal-title" style="margin-top:' + (hasAltRows ? '12px' : '0') + ';margin-bottom:6px">Análise geral</div><div class="dq-anal-body">' + expl + '</div>'
        : '')
    + (!hasAltRows && !hasExpl
        ? '<div class="dq-no-data">Nenhuma análise salva para esta questão.</div>'
        : '');
  rev.innerHTML = '';
  rev.appendChild(box);
}

window.dqToggleGab = dqToggleGab;
window.dqToggleAnal = dqToggleAnal;

/* ── menu ⋯ ── */
function toggleDoubtSetMenu(si, btn) {
  var existing = document.getElementById('dsd-popup');
  if (existing) { existing.remove(); if (existing.dataset.si === String(si)) return; }
  var dd = document.createElement('div');
  dd.className = 'doubt-set-dd'; dd.id = 'dsd-popup'; dd.dataset.si = String(si);
  function makeBtn(icon, label, fn) {
    var b = document.createElement('button');
    b.innerHTML = icon + ' ' + label;
    b.addEventListener('mousedown', function(e) { e.stopPropagation(); });
    b.addEventListener('click', function(e) { e.stopPropagation(); dd.remove(); fn(); });
    return b;
  }
  dd.appendChild(makeBtn('&#128196;', 'Copiar questões',    function(){ _dsdCopyQ(si); }));
  dd.appendChild(makeBtn('&#129302;', 'Copiar p/ IA',       function(){ copyDoubtBlockToAI(si); }));
  var hr = document.createElement('hr'); dd.appendChild(hr);
  dd.appendChild(makeBtn('&#9989;',   'Gabarito simples',   function(){ _dsdGabS(si); }));
  dd.appendChild(makeBtn('&#128221;', 'Gabarito detalhado', function(){ _dsdGabD(si); }));
  var rect = btn.getBoundingClientRect();
  dd.style.top = (rect.bottom + 6) + 'px';
  dd.style.right = (window.innerWidth - rect.right) + 'px';
  document.body.appendChild(dd);
  setTimeout(function() {
    function onOut(e) { if (!dd.contains(e.target)) { dd.remove(); document.removeEventListener('click', onOut); } }
    document.addEventListener('click', onOut);
  }, 50);
}

function _dsdCopyQ(si) {
  var items = Object.values(_doubts||{}).filter(function(d){return String(d.setIdx)===String(si);});
  if (!items.length) { showNotif('Nenhuma dúvida.', true); return; }
  var out = items.map(function(d) {
    var q = (library[d.setIdx]||{questions:[]}).questions[d.qIdx]; if (!q) return '';
    var opts = (q.options||[]).map(function(o){return o.letter+') '+((o.text||'').replace(/<[^>]+>/g,'').trim());}).join('\n');
    return '\u2588 Questão '+(q.num||d.qIdx+1)+'\n'+(q.text||'').replace(/<[^>]+>/g,'').trim()+'\n\n'+opts;
  }).filter(Boolean).join('\n\n\u2015\n\n');
  navigator.clipboard.writeText(out).then(function(){showNotif('\u2713 Copiado!');}).catch(function(){var ta=document.createElement('textarea');ta.value=out;ta.style.cssText='position:fixed;opacity:0';document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);showNotif('\u2713 Copiado!');});
}
function _dsdGabS(si) {
  var items = Object.values(_doubts||{}).filter(function(d){return String(d.setIdx)===String(si);});
  if (!items.length) { showNotif('Nenhuma dúvida.', true); return; }
  var nome = (library[si]||{}).name||'Conjunto';
  var out = '**Gabarito \u2015 '+nome+'**\n\n'+items.map(function(d){
    var q=(library[d.setIdx]||{questions:[]}).questions[d.qIdx]; if(!q)return '';
    return 'Q'+(q.num||d.qIdx+1)+' \u2015 '+(q.correct||'?');
  }).filter(Boolean).join('\n');
  navigator.clipboard.writeText(out).then(function(){showNotif('\u2713 Gabarito copiado!');}).catch(function(){var ta=document.createElement('textarea');ta.value=out;ta.style.cssText='position:fixed;opacity:0';document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);showNotif('\u2713 Copiado!');});
}
function _dsdGabD(si) {
  var items = Object.values(_doubts||{}).filter(function(d){return String(d.setIdx)===String(si);});
  if (!items.length) { showNotif('Nenhuma dúvida.', true); return; }
  var sep = '\n\n'+'\u2550'.repeat(16)+'\n\n';
  var out = '**Gabarito detalhado**\n\n'+items.map(function(d){
    var q=(library[d.setIdx]||{questions:[]}).questions[d.qIdx]; if(!q)return '';
    var n=q.num||(d.qIdx+1);
    var b='**Questão '+n+'**\n**Gabarito:** '+(q.correct||'?')+'\n\n';
    if(q.explanation&&q.explanation.trim())b+='**Análise:**\n'+(q.explanation||'').replace(/<[^>]+>/g,'').trim()+'\n\n';
    return b.trim();
  }).filter(Boolean).join(sep);
  navigator.clipboard.writeText(out).then(function(){showNotif('\u2713 Gabarito detalhado copiado!');}).catch(function(){var ta=document.createElement('textarea');ta.value=out;ta.style.cssText='position:fixed;opacity:0';document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);showNotif('\u2713 Copiado!');});
}
