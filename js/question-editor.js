/* === IN-PLACE QUESTION EDITOR === */
/* ═══════════════════════════════════
   IN-PLACE QUESTION EDITOR
═══════════════════════════════════ */
let _editMode = false;

function toggleEditMode(qi) {
  sndClick();
  if (_editMode) return; // Already in edit mode — use Salvar/Cancelar buttons
  _editMode = true;
  const card = document.getElementById('qcard');
  const toggle = document.getElementById('qe-toggle');
  if (!card || !toggle) return;
  card.classList.add('edit-mode');
  toggle.classList.add('active');
  toggle.title = 'Editando…';
  // Also mark expl edit button
  const explBtn = document.querySelector('.expl-edit-btn');
  if (explBtn) { explBtn.classList.add('active'); explBtn.title = 'Editando…'; }
  enableEditMode(qi, card);
}

function enableEditMode(qi, card) {
  const q = activeSet.questions[qi];

  // Cancel any pending answer selection
  quizState.pendingAnswer = null;
  const existingBar = document.getElementById('confirm-bar');
  if (existingBar) existingBar.remove();

  // Rich format toolbar (sticky, collapsible — starts minimized)
  if (!document.getElementById('qe-fmt-bar')) {
    // ── Toggle pill (always visible when in edit mode) ──
    const togglePill = document.createElement('div');
    togglePill.id = 'qe-fmt-toggle';
    togglePill.className = 'qe-fmt-toggle visible';
    togglePill.innerHTML = '<div class="qe-fmt-toggle-dot"></div><span>EDIÇÃO ✎</span><span style="opacity:0.45;font-size:9px">▲</span>';
    togglePill.title = 'Expandir barra de formatação';
    togglePill.onclick = () => qeToolbarExpand();
    document.body.appendChild(togglePill);

    // ── Toolbar (hidden until expanded) ──
    const fmtBar = document.createElement('div');
    fmtBar.id = 'qe-fmt-bar';
    fmtBar.className = 'qe-fmt-bar'; // NOT .visible — starts collapsed
    fmtBar.innerHTML =
      '<span class="qe-fmt-label">Fonte</span>'
      + '<select class="qe-fmt-select" style="width:112px" title="Família da fonte" onchange="qeFontFamily(this.value)" id="qe-font-family">'
      + '<option value="">— Família —</option>'
      + '<option value="\'Outfit\', sans-serif">Outfit</option>'
      + '<option value="\'Libre Baskerville\', serif">Baskerville</option>'
      + '<option value="\'Lora\', serif">Lora</option>'
      + '<option value="\'Merriweather\', serif">Merriweather</option>'
      + '<option value="\'Source Serif 4\', serif">Source Serif</option>'
      + '<option value="\'Raleway\', sans-serif">Raleway</option>'
      + '<option value="\'IBM Plex Sans\', sans-serif">IBM Plex</option>'
      + '<option value="\'JetBrains Mono\', monospace">Mono</option>'
      + '</select>'
      + '<select class="qe-fmt-select" style="width:58px" title="Tamanho" onchange="qeFontSize(this.value)" id="qe-font-size">'
      + '<option value="">Tam.</option>'
      + ['10','11','12','13','14','15','16','17','18','20','22','24','28','32','36'].map(s=>`<option value="${s}pt">${s}</option>`).join('')
      + '</select>'
      + '<div class="qe-fmt-sep"></div>'
      + '<span class="qe-fmt-label">Estilo</span>'
      + '<button class="qe-fmt-btn" data-cmd="bold" title="Negrito (Ctrl+B)" onmousedown="event.preventDefault()" onclick="qeFmt(\'bold\')"><b>B</b></button>'
      + '<button class="qe-fmt-btn" data-cmd="italic" title="Itálico (Ctrl+I)" onmousedown="event.preventDefault()" onclick="qeFmt(\'italic\')"><i>I</i></button>'
      + '<button class="qe-fmt-btn" data-cmd="underline" title="Sublinhado (Ctrl+U)" onmousedown="event.preventDefault()" onclick="qeFmt(\'underline\')"><u style="font-size:11px">U</u></button>'
      + '<button class="qe-fmt-btn" data-cmd="strikeThrough" title="Tachado" onmousedown="event.preventDefault()" onclick="qeFmt(\'strikeThrough\')"><s style="font-size:11px">S</s></button>'
      + '<button class="qe-fmt-btn" data-cmd="superscript" title="Sobrescrito" onmousedown="event.preventDefault()" onclick="qeFmt(\'superscript\')" style="font-size:10px">X²</button>'
      + '<button class="qe-fmt-btn" data-cmd="subscript" title="Subscrito" onmousedown="event.preventDefault()" onclick="qeFmt(\'subscript\')" style="font-size:10px">X₂</button>'
      + '<div class="qe-fmt-sep"></div>'
      + '<span class="qe-fmt-label">Cor</span>'
      + ['#f0ece4','#e8b84b','#4ecb8d','#f06060','#c084fc','#fb923c','#3cd2dc','#ffffff'].map(c=>
          `<button class="qe-fmt-btn clr-btn" title="Cor: ${c}" style="background:${c}" onmousedown="event.preventDefault()" onclick="qeForeColor('${c}')"></button>`
        ).join('')
      + '<div class="qe-fmt-sep"></div>'
      + '<span class="qe-fmt-label">Título</span>'
      + '<button class="qe-fmt-btn" title="H2" onmousedown="event.preventDefault()" onclick="qeFmtBlock(\'h2\')" style="font-size:10px;font-weight:700;width:26px">H2</button>'
      + '<button class="qe-fmt-btn" title="H3" onmousedown="event.preventDefault()" onclick="qeFmtBlock(\'h3\')" style="font-size:10px;font-weight:700;width:26px">H3</button>'
      + '<button class="qe-fmt-btn" title="H4" onmousedown="event.preventDefault()" onclick="qeFmtBlock(\'h4\')" style="font-size:10px;font-weight:700;width:26px">H4</button>'
      + '<button class="qe-fmt-btn" title="Parágrafo" onmousedown="event.preventDefault()" onclick="qeFmtBlock(\'p\')" style="font-size:11px;width:26px">¶</button>'
      + '<div class="qe-fmt-sep"></div>'
      + '<span class="qe-fmt-label">Alin.</span>'
      + '<button class="qe-fmt-btn" data-cmd="justifyLeft" title="Esquerda" onmousedown="event.preventDefault()" onclick="qeFmt(\'justifyLeft\')" style="font-size:11px">⬅</button>'
      + '<button class="qe-fmt-btn" data-cmd="justifyCenter" title="Centro" onmousedown="event.preventDefault()" onclick="qeFmt(\'justifyCenter\')" style="font-size:11px">☰</button>'
      + '<button class="qe-fmt-btn" data-cmd="justifyRight" title="Direita" onmousedown="event.preventDefault()" onclick="qeFmt(\'justifyRight\')" style="font-size:11px">➡</button>'
      + '<div class="qe-fmt-sep"></div>'
      + '<span class="qe-fmt-label">Lista</span>'
      + '<button class="qe-fmt-btn" data-cmd="insertUnorderedList" title="Lista •" onmousedown="event.preventDefault()" onclick="qeFmt(\'insertUnorderedList\')">≡•</button>'
      + '<button class="qe-fmt-btn" data-cmd="insertOrderedList" title="Lista 1." onmousedown="event.preventDefault()" onclick="qeFmt(\'insertOrderedList\')">≡1</button>'
      + '<button class="qe-fmt-btn" title="Recuar" onmousedown="event.preventDefault()" onclick="qeFmt(\'indent\')">→|</button>'
      + '<button class="qe-fmt-btn" title="Remover recuo" onmousedown="event.preventDefault()" onclick="qeFmt(\'outdent\')">|←</button>'
      + '<div class="qe-fmt-sep"></div>'
      + '<span class="qe-fmt-label">Inserir</span>'
      + '<button class="qe-fmt-btn" title="Linha horizontal" onmousedown="event.preventDefault()" onclick="qeInsertHR()" style="font-size:14px">—</button>'
      + '<button class="qe-fmt-btn img-btn" title="Inserir imagem" onmousedown="event.preventDefault()" onclick="qeInsertImagePicker()">🖼</button>'
      + '<div class="qe-fmt-sep"></div>'
      + '<button class="qe-fmt-btn" title="Limpar formatação" onmousedown="event.preventDefault()" onclick="qeClearFmt()" style="font-size:9px;color:var(--coral2);width:36px">✕fmt</button>'
      + '<button class="qe-fmt-minimize" title="Minimizar barra" onmousedown="event.preventDefault();event.stopPropagation()" onclick="event.stopPropagation();qeToolbarCollapse()">▾</button>';
    document.body.appendChild(fmtBar);
  } else {
    document.getElementById('qe-fmt-bar').classList.add('visible');
    const t = document.getElementById('qe-fmt-toggle');
    if (t) t.classList.add('visible');
  }

  // Make enunciado editable
  const qtxt = document.getElementById('qtxt-' + qi);
  if (qtxt) {
    qtxt.contentEditable = 'true';
    setupPasteAndDrop(qtxt);
    wrapImages(qtxt);
  }

  if (!document.getElementById('qe-paste-hint')) {
    const hint = document.createElement('div');
    hint.id = 'qe-paste-hint';
    hint.className = 'qe-paste-info';
    hint.textContent = '💡 Cole texto com imagens (Ctrl+V), arraste arquivos ou use 🖼 para inserir imagens';
    if (qtxt) qtxt.parentNode.insertBefore(hint, qtxt.nextSibling);
  }

  // Make option texts editable and add correct toggle
  const optBtns = document.querySelectorAll('#opts-col .opt-btn');
  optBtns.forEach((btn, oi) => {
    const optText = btn.querySelector('.opt-text');
    if (optText) {
      optText.contentEditable = 'true';
      setupPasteAndDrop(optText);
      wrapImages(optText);
    }
    // Add correct toggle if not answered
    if (!quizState.answered) {
      const isCorrect = q.options[oi]?.letter === q.correct;
      const tog = document.createElement('button');
      tog.className = 'qe-correct-toggle' + (isCorrect ? ' is-correct' : '');
      tog.textContent = isCorrect ? '✓ Correta' : '◌ Incorreta';
      tog.dataset.oi = oi;
      tog.onclick = (e) => { e.stopPropagation(); toggleCorrectInPlace(qi, oi, q.options.length); };
      btn.appendChild(tog);
    }
  });

  // Make explanation editable if exists
  const explIntro = document.getElementById(`expl-intro-${qi}`);
  if (explIntro) {
    // Remove scroll limit in edit mode so full content is visible
    explIntro.style.maxHeight = 'none';
    explIntro.style.overflow = 'visible';
    // Hide fade overlay
    const wrap = document.getElementById(`expl-intro-wrap-${qi}`);
    if (wrap) wrap.classList.remove('overflows');
    explIntro.contentEditable = 'true';
    setupPasteAndDrop(explIntro);
    wrapImages(explIntro);
  }
  q.altExplanations.forEach(a => {
    const el = document.getElementById(`expl-alt-${qi}-${a.letter}`);
    if (el) {
      el.contentEditable = 'true';
      setupPasteAndDrop(el);
      wrapImages(el);
    }
  });

  // Open expl-panel if it exists and not already open
  const explPanel = document.getElementById(`expl-panel-${qi}`);
  if (explPanel) {
    const explBody = explPanel.querySelector('.expl-body');
    const explCh = explPanel.querySelector('.expl-ch');
    if (explBody && !explBody.classList.contains('open')) {
      explBody.classList.add('open');
      if (explCh) explCh.classList.add('open');
    }
    // Mark edit button as active
    const explEditBtn = document.getElementById(`expl-edit-btn-${qi}`);
    if (explEditBtn) explEditBtn.classList.add('active');
    // Add second save bar inside expl-panel if not present
    if (!document.getElementById('qe-expl-save-bar')) {
      const explBodyInner = document.getElementById(`expl-body-inner-${qi}`);
      if (explBodyInner) {
        const bar2 = document.createElement('div');
        bar2.id = 'qe-expl-save-bar';
        bar2.className = 'qe-expl-save-bar';
        bar2.innerHTML = `<span class="qe-save-hint">✎ Editando análise</span>
          <button class="btn btn-secondary" style="padding:7px 14px;font-size:10px" onclick="cancelEditMode(${qi})">Cancelar</button>
          <button class="btn btn-green" style="padding:7px 14px;font-size:10px" onclick="commitEditMode(${qi})">✓ Salvar</button>`;
        explBodyInner.appendChild(bar2);
      }
    }
  }

  // Save bar at bottom of card
  if (!document.getElementById('qe-save-bar')) {
    const bar = document.createElement('div');
    bar.id = 'qe-save-bar';
    bar.className = 'qe-save-bar';
    bar.innerHTML = `<span class="qe-save-hint">✎ Modo edição — clique nos textos para editar</span>
      <button class="btn btn-secondary" style="padding:7px 14px;font-size:10px" onclick="cancelEditMode(${qi})">Cancelar</button>
      <button class="btn btn-green" style="padding:7px 14px;font-size:10px" onclick="commitEditMode(${qi})">✓ Salvar</button>`;
    card.appendChild(bar);
  }
}

function disableEditMode(qi, card) {
  // Remove contenteditable
  card.querySelectorAll('[contenteditable="true"]').forEach(el => {
    el.removeAttribute('contenteditable');
  });
  // Remove correct toggles
  card.querySelectorAll('.qe-correct-toggle').forEach(el => el.remove());
  // Remove save bar and toolbar
  const bar = document.getElementById('qe-save-bar');
  if (bar) bar.remove();
  const bar2 = document.getElementById('qe-expl-save-bar');
  if (bar2) bar2.remove();
  const fmtBar = document.getElementById('qe-fmt-bar');
  if (fmtBar) fmtBar.remove();
  const fmtToggle = document.getElementById('qe-fmt-toggle');
  if (fmtToggle) fmtToggle.remove();
  const hint = document.getElementById('qe-paste-hint');
  if (hint) hint.remove();
  // Restore expl-intro scroll limit
  const explIntro = card.querySelector('.expl-intro');
  if (explIntro) { explIntro.style.maxHeight = ''; explIntro.style.overflow = ''; }
  // Restore expl-intro-wrap fade
  card.querySelectorAll('.expl-intro-wrap').forEach(w => checkExplOverflow(w.querySelector('.expl-intro'), w));
  // Reset expl edit button
  card.querySelectorAll('.expl-edit-btn').forEach(b => b.classList.remove('active'));
  _editMode = false;
  // Unwrap images (leave as plain img)
  card.querySelectorAll('.qe-img-wrap').forEach(wrap => {
    const img = wrap.querySelector('img');
    if (img) wrap.parentNode.insertBefore(img, wrap);
    wrap.remove();
  });
  // Also unwrap in expl panel
  const explPanel = document.getElementById(`expl-panel-${qi}`);
  if (explPanel) {
    explPanel.querySelectorAll('[contenteditable="true"]').forEach(el => el.removeAttribute('contenteditable'));
    explPanel.querySelectorAll('.qe-img-wrap').forEach(wrap => {
      const img = wrap.querySelector('img');
      if (img) wrap.parentNode.insertBefore(img, wrap);
      wrap.remove();
    });
  }
}

function saveInPlaceEdit(qi, card) {
  const q = activeSet.questions[qi];

  // Enunciado
  const qtxt = document.getElementById(`qtxt-${qi}`);
  if (qtxt) {
    q.text = getFieldContent(qtxt);
  }

  // Options
  const optBtns = card.querySelectorAll('#opts-col .opt-btn');
  optBtns.forEach((btn, oi) => {
    const optText = btn.querySelector('.opt-text');
    if (optText && q.options[oi]) {
      q.options[oi].text = getFieldContent(optText);
    }
  });

  // Explanation
  const explIntro = document.getElementById(`expl-intro-${qi}`);
  if (explIntro) q.explanation = getFieldContent(explIntro);

  q.altExplanations.forEach(a => {
    const el = document.getElementById(`expl-alt-${qi}-${a.letter}`);
    if (el) a.text = getFieldContent(el);
  });
}

function getFieldContent(el) {
  // Clone to avoid mutating the live DOM
  const clone = el.cloneNode(true);

  // Remove editor-only UI elements from clone
  clone.querySelectorAll('.qe-img-del, .qe-img-resize, .qe-img-sizelabel, .qe-correct-toggle').forEach(n => n.remove());

  // Replace each .qe-img-wrap with a clean <img> preserving src and resized width
  clone.querySelectorAll('.qe-img-wrap').forEach(wrap => {
    const img = wrap.querySelector('img');
    if (img) {
      const cleanImg = document.createElement('img');
      cleanImg.src = img.src;
      if (img.style.width) cleanImg.style.width = img.style.width;
      cleanImg.style.maxWidth = '100%';
      cleanImg.style.borderRadius = '6px';
      cleanImg.style.margin = '6px 0';
      cleanImg.style.display = 'block';
      wrap.parentNode.insertBefore(cleanImg, wrap);
    }
    wrap.remove();
  });

  // Always return innerHTML to preserve lists, bold, headings, tables, images etc.
  const raw = clone.innerHTML.trim();
  const hasHTML = /<(ul|ol|li|b|strong|i|em|u|s|sup|sub|span|img|br|h[1-6]|blockquote|pre|code|table|hr)\b/i.test(raw);
  if (!hasHTML) return clone.innerText.trim();
  return raw
    .replace(/\s*contenteditable="[^"]*"\s*/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function cancelEditMode(qi) {
  sndClick();
  _editMode = false;
  // Always destroy the toolbar on exit
  const fmtBar = document.getElementById('qe-fmt-bar');
  if (fmtBar) fmtBar.remove();
  renderQuizScreen(document.getElementById('screen'));
}

function commitEditMode(qi) {
  sndClick();
  const card = document.getElementById('qcard');
  if (card) saveInPlaceEdit(qi, card);
  _editMode = false;
  sndSave();
  showNotif('✓ Questão atualizada!');
  // Always destroy the toolbar on exit
  const fmtBar = document.getElementById('qe-fmt-bar');
  if (fmtBar) fmtBar.remove();
  // Re-render to reflect saved content cleanly
  renderQuizScreen(document.getElementById('screen'));
}

function toggleCorrectInPlace(qi, oi, total) {
  sndClick();
  const q = activeSet.questions[qi];
  q.correct = q.options[oi].letter;
  // Update all toggle buttons visually
  for (let i=0; i<total; i++) {
    const tog = document.querySelector(`.qe-correct-toggle[data-oi="${i}"]`);
    if (!tog) continue;
    if (i===oi) {
      tog.classList.add('is-correct');
      tog.textContent = '✓ Correta';
    } else {
      tog.classList.remove('is-correct');
      tog.textContent = '◌ Incorreta';
    }
  }
}

/* ════════════════════════════════════════════
   MARKDOWN PARSER — Obsidian / GPT compatible
════════════════════════════════════════════ */
function renderMarkdown(md) {
  if (!md || typeof md !== 'string') return md;

  const hasMd = /(\*\*|__|\*|_|`|^#{1,6}\s|^[-*+]\s|^\d+\.\s|^>\s|^\||\[.+\]\(.+\))/m.test(md);
  if (!hasMd) return null;

  function escHtml(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  // ── 1. Protect fenced code blocks ──────────────────
  const codeBlocks = [];
  md = md.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
    const idx = codeBlocks.length;
    codeBlocks.push(`<pre><code class="lang-${lang||'text'}">${escHtml(code.trim())}</code></pre>`);
    return `\x00CODE${idx}\x00`;
  });

  // ── 2. Protect inline code ──────────────────────────
  const inlineCodes = [];
  md = md.replace(/`([^`\n]+)`/g, (_, code) => {
    const idx = inlineCodes.length;
    inlineCodes.push(`<code>${escHtml(code)}</code>`);
    return `\x00IC${idx}\x00`;
  });

  // ── 3. Inline formatting ────────────────────────────
  function inlineFmt(s) {
    s = s.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    s = s.replace(/___(.+?)___/g,        '<strong><em>$1</em></strong>');
    s = s.replace(/\*\*(.+?)\*\*/g,      '<strong>$1</strong>');
    s = s.replace(/__(.+?)__/g,           '<strong>$1</strong>');
    s = s.replace(/\*([^*\n]+?)\*/g,      '<em>$1</em>');
    s = s.replace(/_([^_\n]+?)_/g,        '<em>$1</em>');
    s = s.replace(/~~(.+?)~~/g,           '<s>$1</s>');
    s = s.replace(/==(.+?)==/g,           '<mark style="background:rgba(248,210,60,0.35);color:inherit;padding:0 2px;border-radius:2px">$1</mark>');
    s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:var(--gold);text-decoration:underline" target="_blank">$1</a>');
    s = s.replace(/\x00IC(\d+)\x00/g, (_, idx) => inlineCodes[+idx]);
    return s;
  }

  // ── 4. Table detection & rendering ─────────────────
  function isTableRow(line) { return /^\|.+\|/.test(line.trim()); }
  function isSepRow(line)   { return /^\|[\s\-:|]+\|/.test(line.trim()); }

  function parseTable(tableLines) {
    // Filter out separator rows
    const rows = tableLines.filter(l => !isSepRow(l));
    if (rows.length === 0) return '';
    let html = '<table>';
    rows.forEach((row, ri) => {
      const cells = row.trim().replace(/^\||\|$/g,'').split('|').map(c => c.trim());
      const tag = ri === 0 ? 'th' : 'td';
      html += '<tr>' + cells.map(c => `<${tag}>${inlineFmt(c)}</${tag}>`).join('') + '</tr>';
    });
    html += '</table>';
    return html;
  }

  // ── 5. Obsidian callout detection ──────────────────
  // Book Theme callout types → CSS class
  const calloutIcons = {
    note:'📝', note1:'📝', importante:'§', prova:'❝', imagem:'🖼',
    tip:'💡', info:'ℹ', warning:'⚠', danger:'🔥', error:'✖',
    question:'❓', quote:'❝', example:'📌', abstract:'📋',
    success:'✓', failure:'✖', bug:'🐛', todo:'☐'
  };

  function parseCallout(lines) {
    const firstLine = lines[0].replace(/^>\s*/,'').trim();
    const cMatch = firstLine.match(/^\[!(\w+)\]\s*(.*)$/i);
    if (!cMatch) {
      // Plain blockquote
      const inner = lines.map(l => l.replace(/^>\s?/,'')).join('\n');
      return `<blockquote>${renderMarkdown(inner) || escHtml(inner)}</blockquote>`;
    }
    const type = cMatch[1].toLowerCase();
    const titleText = cMatch[2].trim() || (type.charAt(0).toUpperCase() + type.slice(1));
    const icon = calloutIcons[type] || '◈';

    // Map type to CSS class
    const knownTypes = ['note1','note','importante','prova','imagem'];
    const cssClass = knownTypes.includes(type)
      ? `obs-callout-${type}`
      : 'obs-callout-generic';

    // Generic fallback color
    const genericColors = {
      tip:'#4ecb8d', info:'#3cd2dc', warning:'#fb923c', danger:'#f06060',
      error:'#f06060', question:'#e8b84b', success:'#4ecb8d'
    };
    const genericStyle = cssClass === 'obs-callout-generic'
      ? `style="border-left:4px solid ${genericColors[type]||'#c9875a'};background:${genericColors[type]||'#c9875a'}12;"`
      : '';

    const bodyLines = lines.slice(1).map(l => l.replace(/^>\s?/,''));
    const body = bodyLines.join('\n');
    const bodyHtml = renderMarkdown(body) || (body ? `<p>${escHtml(body)}</p>` : '');

    return `<div class="obs-callout ${cssClass}" ${genericStyle}>
      <div class="obs-callout-title"><span class="obs-callout-icon">${icon}</span><span>${escHtml(titleText)}</span></div>
      <div class="obs-callout-body">${bodyHtml}</div>
    </div>`;
  }

  // ── 6. Line-by-line processing ──────────────────────
  // Normalize tabs to spaces (Obsidian uses tabs for indentation)
  const lines = md.split('\n').map(l => l.replace(/\t/g, '    '));
  const out = [];
  let i = 0;

  // List stack: [{type:'ul'|'ol', indent:number}]
  let listStack = [];

  function closeListsTo(targetIndent) {
    while (listStack.length && listStack[listStack.length-1].indent > targetIndent) {
      const top = listStack.pop();
      out.push(top.type === 'ul' ? '</ul>' : '</ol>');
    }
  }
  function closeAllLists() { closeListsTo(-1); }

  let inBlockquote = false;
  const bqLines = [];

  function flushBlockquote() {
    if (!inBlockquote) return;
    inBlockquote = false;
    out.push(parseCallout(bqLines));
    bqLines.length = 0;
  }

  while (i < lines.length) {
    const raw  = lines[i];
    const line = raw.trimEnd();
    const trimmed = line.trim();

    // Code block placeholder
    if (/^\x00CODE\d+\x00$/.test(trimmed)) {
      flushBlockquote(); closeAllLists();
      out.push(trimmed.replace(/\x00CODE(\d+)\x00/, (_, idx) => codeBlocks[+idx]));
      i++; continue;
    }

    // Blockquote — collect consecutive > lines
    if (/^>/.test(line)) {
      if (!inBlockquote) { closeAllLists(); inBlockquote = true; }
      bqLines.push(line);
      i++; continue;
    } else {
      flushBlockquote();
    }

    // Table — collect consecutive | lines
    if (isTableRow(line)) {
      closeAllLists();
      const tableLines = [];
      while (i < lines.length && isTableRow(lines[i])) {
        tableLines.push(lines[i]); i++;
      }
      out.push(parseTable(tableLines));
      continue;
    }

    // Heading
    const hMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (hMatch) {
      flushBlockquote(); closeAllLists();
      const level = hMatch[1].length;
      out.push(`<h${level}>${inlineFmt(hMatch[2])}</h${level}>`);
      i++; continue;
    }

    // HR  ---  (only when not part of a table separator and not a heading underline)
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      flushBlockquote(); closeAllLists();
      out.push('<hr>');
      i++; continue;
    }

    // List item — detect indent level
    const ulMatch = line.match(/^(\s*)[-*+]\s+(.+)$/);
    const olMatch = line.match(/^(\s*)(\d+)\.\s+(.+)$/);
    if (ulMatch || olMatch) {
      flushBlockquote();
      const indent = (ulMatch || olMatch)[1].length;
      const content = ulMatch ? ulMatch[2] : olMatch[3];
      const type = ulMatch ? 'ul' : 'ol';

      // Close deeper lists
      closeListsTo(indent - 1);

      // Open new list if needed
      const top = listStack[listStack.length-1];
      if (!top || top.indent < indent || top.type !== type) {
        out.push(type === 'ul' ? '<ul>' : '<ol>');
        listStack.push({ type, indent });
      }
      out.push(`<li>${inlineFmt(content.trim())}</li>`);
      i++; continue;
    }

    // Empty line — in Obsidian, blank lines between list items are common
    // Only close lists if we see 2+ blank lines or next content is not a list
    if (trimmed === '') {
      // Look ahead to see if next non-empty line is still a list item
      let j = i + 1;
      while (j < lines.length && lines[j].trim() === '') j++;
      const nextNonEmpty = j < lines.length ? lines[j].trim() : '';
      const nextIsList = /^(\s*)[-*+]\s/.test(lines[j]||'') || /^(\s*)\d+\.\s/.test(lines[j]||'');
      const isDoubleBlank = j > i + 1; // 2+ consecutive blank lines
      if (!nextIsList || isDoubleBlank) {
        closeAllLists();
      }
      // Skip all consecutive blank lines
      while (i < lines.length && lines[i].trim() === '') i++;
      continue;
    }

    // Normal paragraph — each line becomes its own paragraph (Obsidian style)
    closeAllLists();
    out.push(`<p>${inlineFmt(trimmed)}</p>`);
    i++;
  }

  flushBlockquote();
  closeAllLists();

  return out.join('\n');
}

function isMarkdownText(text) {
  return /(\*\*|__|\*[^*]|_[^_]|^#{1,6}\s|^[-*+]\s|^\d+\.\s|^>\s|^```|^\|.+\|)/m.test(text);
}

/* ── Image paste & drop setup ── */
let _lastFocusedField = null;

function setupPasteAndDrop(el) {
  if (el._pasteSetup) return;
  el._pasteSetup = true;

  // Track focus so toolbar knows which field to target
  el.addEventListener('focus', () => { _lastFocusedField = el; });

  el.addEventListener('paste', async function(e) {
    e.preventDefault();
    const cd = e.clipboardData || e.originalEvent?.clipboardData;
    if (!cd) return;

    const imageBlobs = [];
    for (let i = 0; i < cd.items.length; i++) {
      if (cd.items[i].type.startsWith('image/')) imageBlobs.push(cd.items[i].getAsFile());
    }

    // Get HTML or plain text
    const html = cd.getData('text/html');
    const plain = cd.getData('text/plain');

    // For expl-intro: try markdown rendering on plain text first
    const isExplField = el.classList.contains('expl-intro') || el.id?.startsWith('expl-intro-');

    if (html && html.trim() && !isExplField) {
      // Non-expl fields: use HTML paste as before
      await pasteHtmlContent(el, html, imageBlobs);
    } else if (html && html.trim() && isExplField) {
      // expl-intro: prefer HTML paste but clean it up nicely
      await pasteHtmlContent(el, html, imageBlobs);
    } else if (imageBlobs.length > 0) {
      for (const blob of imageBlobs) await insertImageFromBlobAsync(el, blob);
    } else if (plain) {
      // For expl fields: always try markdown rendering first, then preserve line breaks
      if (isExplField) {
        const rendered = isMarkdownText(plain) ? renderMarkdown(plain) : null;
        if (rendered) {
          const frag = document.createRange().createContextualFragment(rendered);
          const sel = window.getSelection();
          if (sel && sel.rangeCount && el.contains(sel.anchorNode)) {
            const range = sel.getRangeAt(0);
            range.deleteContents();
            range.insertNode(frag);
            range.collapse(false);
            sel.removeAllRanges(); sel.addRange(range);
          } else {
            el.appendChild(frag);
          }
          return;
        }
        // Plain text with line breaks — convert to paragraphs
        const paras = plain.split(/\n\n+/).filter(p => p.trim());
        if (paras.length > 1) {
          const html = paras.map(p => `<p>${p.replace(/\n/g,'<br>')}</p>`).join('');
          const frag = document.createRange().createContextualFragment(html);
          const sel = window.getSelection();
          if (sel && sel.rangeCount && el.contains(sel.anchorNode)) {
            const range = sel.getRangeAt(0);
            range.deleteContents();
            range.insertNode(frag);
            range.collapse(false);
            sel.removeAllRanges(); sel.addRange(range);
          } else { el.appendChild(frag); }
          return;
        }
        // Single para with line breaks
        const withBreaks = plain.replace(/\n/g,'<br>');
        document.execCommand('insertHTML', false, withBreaks);
        return;
      }
      document.execCommand('insertText', false, plain);
    }
  });

  el.addEventListener('dragover', e => { e.preventDefault(); el.classList.add('drag-over'); });
  el.addEventListener('dragleave', () => el.classList.remove('drag-over'));
  el.addEventListener('drop', async function(e) {
    e.preventDefault(); el.classList.remove('drag-over');
    const files = e.dataTransfer?.files;
    if (!files) return;
    for (let i = 0; i < files.length; i++) {
      if (files[i].type.startsWith('image/')) {
        await insertImageFromBlobAsync(el, files[i]);
      }
    }
  });
}

async function pasteHtmlContent(container, html, imageBlobs) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  tmp.querySelectorAll('script,style,meta,link,head,title').forEach(n => n.remove());

  // Detect if we're pasting into an expl-intro (book theme) field
  const isExplIntro = container.classList.contains('expl-intro') || container.id?.startsWith('expl-intro-');

  // Convert external images to base64
  for (const img of Array.from(tmp.querySelectorAll('img'))) {
    const src = img.getAttribute('src') || '';
    if (!src || src.startsWith('data:')) continue;
    if (src.startsWith('http') || src.startsWith('//')) {
      const b64 = await fetchImageAsBase64(src).catch(() => null);
      if (b64) img.src = b64; else img.remove();
    } else { img.remove(); }
  }

  // ── Normalize Gemini/GPT structure ──
  // Keep semantic elements: h1-h6, p, ul, ol, li, blockquote, pre, code, b, strong, i, em, u, br, hr, table, tr, td, th
  const KEEP_TAGS = new Set(['H1','H2','H3','H4','H5','H6','P','UL','OL','LI',
    'BLOCKQUOTE','PRE','CODE','B','STRONG','I','EM','U','S','SUP','SUB','BR','HR',
    'TABLE','THEAD','TBODY','TR','TD','TH','SPAN','FONT','DIV','IMG','A']);

  // Unwrap non-semantic containers (div, span) while keeping their children
  // But first strip all class/id/style except on preserved elements
  tmp.querySelectorAll('*').forEach(node => {
    if (!KEEP_TAGS.has(node.tagName)) {
      // Replace node with its children
      const parent = node.parentNode;
      if (!parent) return;
      while (node.firstChild) parent.insertBefore(node.firstChild, node);
      parent.removeChild(node);
      return;
    }
    // For kept tags, strip all attributes except safe ones
    const safe = node.tagName === 'IMG' ? ['src','width','height']
               : node.tagName === 'A'   ? ['href']
               : node.tagName === 'SPAN' || node.tagName === 'FONT' ? ['style','color','face','size']
               : node.tagName === 'TD' || node.tagName === 'TH' ? ['colspan','rowspan'] : [];
    Array.from(node.attributes).forEach(a => { if (!safe.includes(a.name)) node.removeAttribute(a.name); });
  });

  if (isExplIntro) {
    // ── expl-intro (Book Theme): let CSS classes handle all heading/blockquote styling.
    // Only apply styles that CSS cannot infer (e.g. pre, code, table, hr).
    // Do NOT set inline styles on h1-h6 or blockquote — book theme CSS handles those perfectly.
    tmp.querySelectorAll('pre').forEach(pre => {
      pre.style.cssText = 'background:var(--bt-bg-alt,#201c14);border:1px solid var(--bt-border,#3d3426);border-radius:4px;padding:1rem 1.2rem;margin:1rem 0;overflow-x:auto;font-size:0.82rem;';
    });
    tmp.querySelectorAll('code').forEach(code => {
      if (code.parentElement?.tagName !== 'PRE') {
        code.style.cssText = 'font-family:"DM Mono","JetBrains Mono",monospace;font-size:0.82em;background:var(--bt-surface,#2a2418);color:var(--bt-accent,#c9875a);padding:0.15em 0.4em;border-radius:3px;border:1px solid var(--bt-border,#3d3426);';
      }
    });
    tmp.querySelectorAll('table').forEach(t => {
      t.style.cssText = 'width:100%;border-collapse:collapse;font-size:0.9em;margin:1.2rem 0;';
    });
    tmp.querySelectorAll('td,th').forEach(cell => {
      if (cell.tagName === 'TH') {
        cell.style.cssText = 'background:var(--bt-surface,#2a2418);color:var(--bt-h2,#ddd0b0);font-family:"Lora",serif;font-weight:600;text-transform:uppercase;font-size:0.78em;letter-spacing:0.09em;padding:0.6rem 0.8rem;border-bottom:2px solid var(--bt-border,#3d3426);text-align:left;';
      } else {
        cell.style.cssText = 'padding:0.5rem 0.8rem;border-bottom:1px solid var(--bt-border-soft,#302820);color:var(--bt-ink,#e8dfc8);vertical-align:top;';
      }
    });
    tmp.querySelectorAll('hr').forEach(hr => {
      hr.style.cssText = 'border:none;border-top:1px solid var(--bt-border,#3d3426);margin:2.5rem auto;width:40%;display:block;';
    });
  } else {
    // ── Non-book-theme fields: apply generic inline styles ──
    tmp.querySelectorAll('h1,h2,h3,h4,h5,h6').forEach(h => {
      const lvl = parseInt(h.tagName[1]);
      h.style.cssText = `font-weight:700;margin:10px 0 4px;line-height:1.35;color:var(--text);font-size:${Math.max(0.85, 1.3 - (lvl-1)*0.12)}em`;
    });
    tmp.querySelectorAll('blockquote').forEach(bq => {
      bq.style.cssText = 'border-left:3px solid var(--gold-d);padding:6px 14px;margin:8px 0;color:var(--text2);font-style:italic;background:var(--gold-bg);border-radius:0 4px 4px 0';
    });
    tmp.querySelectorAll('pre').forEach(pre => {
      pre.style.cssText = 'background:var(--bg2);border:1px solid var(--border);border-radius:6px;padding:10px 14px;font-family:var(--font-mono);font-size:12px;white-space:pre-wrap;overflow-x:auto;margin:8px 0;color:var(--green2)';
    });
    tmp.querySelectorAll('code').forEach(code => {
      if (code.parentElement?.tagName !== 'PRE') {
        code.style.cssText = 'background:var(--bg2);border:1px solid var(--border);border-radius:3px;padding:1px 5px;font-family:var(--font-mono);font-size:0.88em;color:var(--violet2)';
      }
    });
    tmp.querySelectorAll('table').forEach(t => {
      t.style.cssText = 'border-collapse:collapse;width:100%;margin:8px 0;font-size:0.9em';
    });
    tmp.querySelectorAll('td,th').forEach(cell => {
      cell.style.cssText = 'border:1px solid var(--border2);padding:6px 10px;text-align:left';
      if (cell.tagName === 'TH') cell.style.background = 'var(--surface2)';
    });
    tmp.querySelectorAll('hr').forEach(hr => {
      hr.style.cssText = 'border:none;border-top:1px solid var(--border2);margin:10px 0';
    });
  }

  // Wrap <img> elements in resizable wraps
  tmp.querySelectorAll('img').forEach(img => {
    const w = createImageWrap(img.src, img.style.width || '100%');
    img.parentNode.insertBefore(w, img); img.remove();
  });

  // Append extra image blobs (clipboard items not embedded in HTML)
  for (const blob of imageBlobs) {
    const b64 = await new Promise(res => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(blob); });
    tmp.appendChild(createImageWrap(b64, '100%'));
  }

  // Insert at cursor
  const frag = document.createDocumentFragment();
  while (tmp.firstChild) frag.appendChild(tmp.firstChild);
  const sel = window.getSelection();
  if (sel && sel.rangeCount && container.contains(sel.anchorNode)) {
    const range = sel.getRangeAt(0);
    range.deleteContents();
    range.insertNode(frag);
    range.collapse(false);
    sel.removeAllRanges(); sel.addRange(range);
  } else { container.appendChild(frag); }
}


async function fetchImageAsBase64(url) {
  try {
    const res = await fetch(url, { mode: 'cors' });
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise(resolve => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.readAsDataURL(blob);
    });
  } catch { return null; }
}

function insertImageFromBlob(container, blob) {
  // Sync wrapper for legacy callers
  const reader = new FileReader();
  reader.onload = ev => {
    const wrap = createImageWrap(ev.target.result, '100%');
    const sel = window.getSelection();
    if (sel && sel.rangeCount && container.contains(sel.anchorNode)) {
      const range = sel.getRangeAt(0);
      range.deleteContents();
      range.insertNode(wrap);
      range.setStartAfter(wrap);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    } else {
      container.appendChild(wrap);
    }
  };
  reader.readAsDataURL(blob);
}

function insertImageFromBlobAsync(container, blob) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = ev => {
      const wrap = createImageWrap(ev.target.result, '100%');
      const sel = window.getSelection();
      if (sel && sel.rangeCount && container.contains(sel.anchorNode)) {
        const range = sel.getRangeAt(0);
        range.deleteContents();
        range.insertNode(wrap);
        range.setStartAfter(wrap);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      } else {
        container.appendChild(wrap);
      }
      resolve();
    };
    reader.readAsDataURL(blob);
  });
}

/* ── Formatting toolbar actions ── */
function qeToolbarExpand() {
  const bar = document.getElementById('qe-fmt-bar');
  const pill = document.getElementById('qe-fmt-toggle');
  if (bar) { bar.classList.add('visible'); }
  if (pill) { pill.classList.remove('visible'); }
}

function qeToolbarCollapse() {
  const bar = document.getElementById('qe-fmt-bar');
  const pill = document.getElementById('qe-fmt-toggle');
  if (bar) { bar.classList.remove('visible'); }
  if (pill) { pill.classList.add('visible'); }
}

function qeFmt(cmd) {
  const field = _lastFocusedField || document.querySelector('[contenteditable="true"]');
  if (!field) return;
  field.focus();
  document.execCommand(cmd, false, null);
  updateFmtBar();
}

function qeFontFamily(val) {
  if (!val) return;
  const field = _lastFocusedField || document.querySelector('[contenteditable="true"]');
  if (!field) return;
  field.focus();
  document.execCommand('fontName', false, val);
  // Reset select display
  setTimeout(() => { const s = document.getElementById('qe-font-family'); if(s) s.value=''; }, 50);
}

function qeFontSize(val) {
  if (!val) return;
  const field = _lastFocusedField || document.querySelector('[contenteditable="true"]');
  if (!field) return;
  field.focus();
  // execCommand fontSize uses 1-7, so use insertHTML with span instead for pt sizes
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount) return;
  const range = sel.getRangeAt(0);
  if (range.collapsed) return;
  const span = document.createElement('span');
  span.style.fontSize = val;
  range.surroundContents(span);
  setTimeout(() => { const s = document.getElementById('qe-font-size'); if(s) s.value=''; }, 50);
}

function qeForeColor(color) {
  const field = _lastFocusedField || document.querySelector('[contenteditable="true"]');
  if (!field) return;
  field.focus();
  document.execCommand('foreColor', false, color);
}

function qeFmtBlock(tag) {
  const field = _lastFocusedField || document.querySelector('[contenteditable="true"]');
  if (!field) return;
  field.focus();
  document.execCommand('formatBlock', false, tag);
  updateFmtBar();
}

function qeInsertHR() {
  const field = _lastFocusedField || document.querySelector('[contenteditable="true"]');
  if (!field) return;
  field.focus();
  document.execCommand('insertHTML', false, '<hr style="border:none;border-top:1px solid var(--border2);margin:10px 0">');
}

function qeClearFmt() {
  const field = _lastFocusedField || document.querySelector('[contenteditable="true"]');
  if (!field) return;
  field.focus();
  document.execCommand('removeFormat', false, null);
  document.execCommand('formatBlock', false, 'p');
  updateFmtBar();
}

function qeInsertImagePicker() {
  const field = _lastFocusedField || document.querySelector('[contenteditable="true"]');
  if (!field) return;
  const inp = document.createElement('input');
  inp.type = 'file';
  inp.accept = 'image/*';
  inp.style.display = 'none';
  document.body.appendChild(inp);
  inp.onchange = () => {
    const file = inp.files[0];
    document.body.removeChild(inp);
    if (!file) return;
    field.focus();
    insertImageFromBlobAsync(field, file);
  };
  inp.click();
}

function updateFmtBar() {
  const btns = document.querySelectorAll('.qe-fmt-btn[data-cmd]');
  btns.forEach(btn => {
    const cmd = btn.dataset.cmd;
    if (!cmd) return;
    try {
      btn.classList.toggle('active', document.queryCommandState(cmd));
    } catch {}
  });
}

// Update toolbar state on selection change
document.addEventListener('selectionchange', () => {
  if (!_editMode) return;
  updateFmtBar();
});

/* ── Wrap existing imgs in resizable wrap ── */
function wrapImages(container) {
  container.querySelectorAll('img:not(.in-wrap)').forEach(img => {
    const wrap = createImageWrap(img.src, img.style.width || img.getAttribute('width') || '100%');
    img.parentNode.insertBefore(wrap, img);
    img.remove();
  });
}

function createImageWrap(src, width) {
  const wrap = document.createElement('div');
  wrap.className = 'qe-img-wrap';
  wrap.contentEditable = 'false'; // prevent wrap itself from being editable

  const img = document.createElement('img');
  img.src = src;
  img.className = 'in-wrap';
  img.draggable = false;
  if (width && width !== '100%') img.style.width = width;
  else img.style.width = '100%';

  const delBtn = document.createElement('button');
  delBtn.className = 'qe-img-del';
  delBtn.innerHTML = '✕';
  delBtn.title = 'Apagar imagem';
  delBtn.onclick = (e) => { e.stopPropagation(); e.preventDefault(); wrap.remove(); };

  const resizeHandle = document.createElement('div');
  resizeHandle.className = 'qe-img-resize';
  resizeHandle.title = 'Redimensionar';

  const sizeLabel = document.createElement('div');
  sizeLabel.className = 'qe-img-sizelabel';

  wrap.appendChild(img);
  wrap.appendChild(delBtn);
  wrap.appendChild(resizeHandle);
  wrap.appendChild(sizeLabel);

  // Click to select
  wrap.addEventListener('click', (e) => {
    e.stopPropagation();
    document.querySelectorAll('.qe-img-wrap.selected').forEach(w => { if(w!==wrap) w.classList.remove('selected'); });
    wrap.classList.toggle('selected');
  });

  // Resize logic — pointer events for touch + mouse
  let resizing = false, startX = 0, startW = 0;

  resizeHandle.addEventListener('pointerdown', (e) => {
    e.stopPropagation(); e.preventDefault();
    resizeHandle.setPointerCapture(e.pointerId);
    resizing = true;
    startX = e.clientX;
    startW = img.getBoundingClientRect().width;
    wrap.classList.add('selected', 'resizing');
  });

  resizeHandle.addEventListener('pointermove', (e) => {
    if (!resizing) return;
    const delta = e.clientX - startX;
    const newW = Math.max(60, Math.min(startW + delta, wrap.parentElement?.getBoundingClientRect().width || 800));
    img.style.width = newW + 'px';
    img.style.maxWidth = '100%';
    sizeLabel.textContent = Math.round(newW) + 'px';
  });

  resizeHandle.addEventListener('pointerup', () => {
    resizing = false;
    wrap.classList.remove('resizing');
  });

  return wrap;
}
