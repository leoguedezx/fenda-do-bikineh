/* === PARSER === */
function parseQuestions(raw) {
  raw=(raw||"").replace(/\*\*\s*(Questão|QUESTÃO)\s*(\d+)\s*\*\*/g,"Questão $2").replace(/\*\*([^*\n]+)\*\*/g,"$1").replace(/\*([^*\n]+)\*/g,"$1");

  // ── Normaliza quebras de linha (PDF/Windows/Mac)
  let text = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // ── Pré-marca blocos dissertativos com tag [DISC] ──
  // Formatos aceitos: [DISC], [disc], #disc, (disc), DISC: no início da linha
  text = text.replace(/^\s*\[disc(?:ursiva)?\]\s*/gim, '[DISC]\n');
  text = text.replace(/^\s*#disc(?:ursiva)?\s*/gim, '[DISC]\n');
  text = text.replace(/^\s*\(disc(?:ursiva)?\)\s*/gim, '[DISC]\n');
  text = text.replace(/^\s*disc(?:ursiva)?\s*:\s*/gim, '[DISC]\n');

  // ══════════════════════════════════════════════════════════════
  // PRÉ-PROCESSAMENTO CRÍTICO
  // Textos colados frequentemente chegam com "Questão 2" no meio
  // de uma linha longa, colado ao fim da explicação anterior, e
  // com "Gabarito: BTexto..." sem quebra entre letra e explicação.
  // As substituições abaixo garantem que cada marcador e gabarito
  // fique em sua própria linha antes do split('\n').
  // ══════════════════════════════════════════════════════════════

  // 1) Forçar \n antes de "Questão N" sempre que não for início de linha
  text = text.replace(/([^\n])(Quest[aã]o\.?\s*\d{1,3}\b)/gi, '$1\n$2');

  // 2) Separar "Gabarito: B" do texto colado após a letra
  //    Ex: "Gabarito: BPara comp..." → "Gabarito: B\nPara comp..."
  //    NÃO disparar em "Gabarito esperado:" (dissertativa)
  text = text.replace(
    /((?:Gabarito(?!\s+esperado)|Gab\.?|Resposta\s+correta|Resposta|Resp\.?)\s*[:\-]\s*)([A-Ea-e])([A-ZÀ-Ûa-zà-û\d])/gi,
    '$1$2\n$3'
  );

  // 3) Forçar \n antes de "Gabarito:" quando não for início de linha
  //    MAS NÃO quebrar "Gabarito esperado:" (dissertativa)
  text = text.replace(/([^\n])((?:Gabarito(?!\s+esperado)|Gab\.?|Resposta\s+correta|Resp\.?)\s*[:\-])/gi, '$1\n$2');

  // 4) Limpar linhas em branco extras
  text = text.replace(/\n{3,}/g, '\n\n');

  // ── Regex ESTRITO de marcador explícito de questão ──
  // Só reconhece no início da linha (após trim)
  const markerExplicitRe = /^(?:Quest[aã]o\.?\s*|Q\.?\s*)(\d{1,3})[.):\-–]?\s*/i;

  const lines = text.split('\n');
  const markers = []; // { idx, num }

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    // Marcador explícito: "Questão N", "Q N", "QUESTÃO N", etc.
    const m = trimmed.match(markerExplicitRe);
    if (m) { markers.push({ idx, num: parseInt(m[1]) }); return; }

    // Marcador só-número ("1)" ou "1.") — apenas linha CURTA, sequencial e próxima
    const nm = trimmed.match(/^(\d{1,3})[.)]\s*$/);
    if (nm && markers.length > 0) {
      const n = parseInt(nm[1]);
      const prev = markers[markers.length - 1];
      const seqOk  = n > prev.num && n <= prev.num + 5;
      const distOk = (idx - prev.idx) <= 8;
      if (n >= 1 && n <= 999 && seqOk && distOk) {
        markers.push({ idx, num: n });
      }
    }
  });

  // Fallback: sem marcadores → trata como questão única
  if (markers.length === 0) {
    const parsed = parseBlock('Questão 1\n' + text.trim(), true);
    return parsed ? [parsed] : [];
  }

  const blocks = [];
  for (let i = 0; i < markers.length; i++) {
    const start = markers[i].idx;
    const end = i < markers.length - 1 ? markers[i + 1].idx : lines.length;
    const blockLines = lines.slice(start, end);
    const firstLine = blockLines[0].trim();
    const alreadyHasMarker = markerExplicitRe.test(firstLine);
    const normalized = alreadyHasMarker
      ? blockLines.join('\n').trim()
      : `Questão ${markers[i].num}\n` + blockLines.join('\n').trim();
    if (normalized) blocks.push(normalized);
  }

  return blocks.map(b => parseBlock(b, false)).filter(q => q !== null);
}

function parseBlock(block, singleMode) {
  const r = { num:null, text:'', options:[], correct:null, explanation:'', altExplanations:[], errors:[], warnings:[], type:'multiple' };

  // Normaliza quebras PRIMEIRO (antes de qualquer detecção)
  block = block.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // ── Detectar bloco dissertativo (em qualquer linha) ──
  if (/\[DISC\]/i.test(block)) {
    r.type = 'essay';
    block = block.replace(/\[DISC\][ \t]*\n?/gi, '').trim();
  }

  // ── Número da questão (antes de tudo para essays também) ──
  const numMAll = block.match(/^(?:Quest[aã]o\.?\s*|Q\.?\s*)(\d+)/im);
  if (numMAll) r.num = parseInt(numMAll[1]);

  // ── Para dissertativas: extrair gabarito esperado ──
  if (r.type === 'essay') {
    // Remove cabeçalho "Questão N"
    block = block.replace(/^(?:Quest[aã]o\.?\s*|Q\.?\s*)\d+[.):\-\u2013]?\s*/im, '').trim();

    // Detecta linha de gabarito
    const gabLines = block.split('\n');
    const gabLineIdx = gabLines.findIndex(function(l) {
      var t = l.trim();
      return /^Gabarito\s+esperado\s*[:\-]/i.test(t) ||
             /^Resposta\s+esperada\s*[:\-]/i.test(t) ||
             /^Gabarito\s*[:\-]/i.test(t);
    });

    if (gabLineIdx !== -1) {
      r.text = gabLines.slice(0, gabLineIdx).join('\n').trim();
      var gabLine = gabLines[gabLineIdx].replace(/^(?:Gabarito\s+esperado|Resposta\s+esperada|Gabarito)\s*[:\-]\s*/i, '').trim();
      var afterLines = gabLines.slice(gabLineIdx + 1).join('\n').trim();
      r.explanation = gabLine + (afterLines ? '\n' + afterLines : '');
    } else {
      r.text = block.trim();
    }

    if (!r.text) r.errors.push('Enunciado não encontrado.');
    return r;
  }

  // ── Pré-processamento: expande alternativas numa só linha ──
  let expanded = block;
  const singleLineOpts = /\b([A-Ea-e])\)\s+[^\n]{3,}(?=\s+[B-Eb-e]\))/;
  if (singleLineOpts.test(block)) {
    expanded = block
      .replace(/\s+([A-Ea-e])\)\s+/g, (_, l) => '\n' + l + ') ')
      .replace(/\s+([A-Ea-e])\.\s+/g, (_, l) => '\n' + l + '. ');
  }

  const lines = expanded.split('\n').map(l => l.trim()).filter(l => l);

  // ── Regex de alternativas ──
  // ESTRITO: letra + separador explícito no início da linha
  const optRe = /^(?:\()?([A-Ea-e])(?:\))?\s*[)\.\-:–]\s*(.+)/i;
  // LAX: só usado quando já estamos na fase 'opts' (≥1 alternativa coletada)
  const optReLax = /^([A-Ea-e])\s{1,4}([A-ZÁÀÃÂÉÊÍÓÔÕÚÇ\d"'(«¿¡].+)/;

  // ── Regex de gabarito ──
  // ESTRITO: início de linha
  const gabRe = /^(?:Gabarito|Gab\.?|Resposta|Resp\.?|Alternativa\s+correta|Resposta\s+correta)[:\s.–-]+([A-Ea-e])\b/i;
  // INLINE: só na fase expl e apenas em linhas curtas (< 120 chars)
  const gabInline = /\b(?:Gabarito|Gab|Resposta|Resp)[:\s.]+([A-Ea-e])\b/i;

  // ── Regex de explicação por alternativa ──
  const altRe = /^(?:[Aa]\s+)?[Aa]lternativa\s+([A-Ea-e])\b|^([A-Ea-e])\)\s*(?:está|é\s+(?:corret|incorret|errad|certa|erron))/i;

  // ── Palavras que sinalizam início da explicação geral ──
  const explStartRe = /^(?:Gabarito|Gab\.?|Resposta|Resp\.?|Análise|Analise|Justif|Coment|Para\s+comp|Para\s+enten|Esta\s+quest)/i;

  let phase = 'text'; // 'text' | 'opts' | 'expl'
  let textL = [], explL = [], curAlt = null;
  let firstLine = true;

  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i];

    // Pula cabeçalho "Questão N"
    if (firstLine && /^(?:Quest[aã]o\.?\s*|Q\.?\s*)\d+/i.test(ln)) {
      firstLine = false;
      const afterNum = ln.replace(/^(?:Quest[aã]o\.?\s*|Q\.?\s*)\d+[.):\-–]?\s*/i, '').trim();
      if (afterNum) textL.push(afterNum);
      continue;
    }
    firstLine = false;

    // ── Gabarito explícito (início de linha) ──
    if (gabRe.test(ln)) {
      r.correct = ln.match(gabRe)[1].toUpperCase();
      phase = 'expl';
      continue;
    }

    // ── Fase TEXT ──
    if (phase === 'text') {
      const om = ln.match(optRe);
      if (om) {
        phase = 'opts';
        const letter = om[1].toUpperCase();
        const optText = om[2].trim();
        if (!r.options.find(o => o.letter === letter))
          r.options.push({ letter, text: optText });
        if (/corret[ao]|gabarito|✓|✔/i.test(optText) && !r.correct)
          r.correct = letter;
        continue;
      }
      textL.push(ln);
      continue;
    }

    // ── Fase OPTS ──
    if (phase === 'opts') {
      let om = ln.match(optRe);
      if (!om && r.options.length >= 1) om = ln.match(optReLax);
      if (om) {
        const letter = om[1].toUpperCase();
        const optText = om[2].trim();
        if (!r.options.find(o => o.letter === letter))
          r.options.push({ letter, text: optText });
        if (/corret[ao]|gabarito|✓|✔/i.test(optText) && !r.correct)
          r.correct = letter;
        continue;
      }
      // Início da explicação detectado por palavra-chave
      if (explStartRe.test(ln)) {
        phase = 'expl';
        explL.push(ln);
        continue;
      }
      // Linha longa após alternativas = início da explicação
      if (ln.length > 60) {
        phase = 'expl';
        const aM = ln.match(altRe);
        if (aM) {
          if (curAlt) r.altExplanations.push(curAlt);
          curAlt = { letter: (aM[1]||aM[2]).toUpperCase(), text: ln, correct: false };
        } else {
          explL.push(ln);
        }
        continue;
      }
      // Linha curta entre alternativas — ignora
      continue;
    }

    // ── Fase EXPL ──
    if (phase === 'expl') {
      const aM = ln.match(altRe);
      if (aM) {
        if (curAlt) r.altExplanations.push(curAlt);
        curAlt = { letter: (aM[1]||aM[2]).toUpperCase(), text: ln, correct: false };
        continue;
      }
      // Gabarito inline só em linhas curtas
      const gi = ln.match(gabInline);
      if (gi && !r.correct && ln.length < 120) r.correct = gi[1].toUpperCase();
      if (curAlt) { curAlt.text += '\n' + ln; continue; }
      explL.push(ln);
      continue;
    }
  }

  if (curAlt) r.altExplanations.push(curAlt);

  // ── Monta enunciado ──
  r.text = textL.join(' ').replace(/\s+/g, ' ').trim();

  // ── Monta explicação geral ──
  r.explanation = explL.join('\n').trim();

  // ── Limpa prefixos das explicações por alternativa ──
  if (r.correct) r.altExplanations.forEach(a => { a.correct = a.letter === r.correct; });
  r.altExplanations.forEach(a => {
    a.text = a.text.replace(/^(?:[Aa]\s+)?[Aa]lternativa\s+[A-Ea-e][.):–\-]?\s*/i, '').trim() || a.text;
  });

  // ── Garante slots para todas as letras ──
  const usedLetters = r.options.length > 0 ? r.options.map(o => o.letter) : ['A','B','C','D','E'];
  usedLetters.forEach(l => {
    if (!r.altExplanations.find(a => a.letter === l))
      r.altExplanations.push({ letter: l, text: '', correct: l === r.correct });
  });
  r.altExplanations.sort((a,b) => a.letter.localeCompare(b.letter));

  // ── Erros e avisos ──
  if (!r.text) r.errors.push('Enunciado não encontrado.');
  if (r.type !== 'essay') {
    if (r.options.length < 2) r.errors.push(`Apenas ${r.options.length} alternativa(s) detectada(s). Formatos aceitos: A) A. A- A: (A)`);
    if (!r.correct) r.warnings.push('Gabarito não encontrado — questão será salva como incompleta.');
    if (!r.explanation) r.warnings.push('Análise geral ausente.');
  }
  return r;
}
