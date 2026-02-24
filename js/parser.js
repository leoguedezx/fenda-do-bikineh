/* ════════════════════════════════════════════════════════
   parser.js - Question Format Detection & Parsing
   ════════════════════════════════════════════════════════ */

const Parser = {
  detectFormat(text) {
    if (!text || text.length === 0) return 'empty';
    if (this.isJSON(text)) return 'json';
    if (this.isMultipleChoice(text)) return 'multiple-choice';
    if (this.isTrueFalse(text)) return 'true-false';
    if (this.isNumerical(text)) return 'numerical';
    return 'open-ended';
  },

  isJSON(text) {
    try {
      const obj = JSON.parse(text);
      return typeof obj === 'object' && obj !== null;
    } catch { return false; }
  },

  isMultipleChoice(text) {
    const letterPattern = /[a-e]\)\s+/gi;
    const radioPattern = /\(\s*\)\s+/g;
    return (letterPattern.test(text) && text.match(letterPattern).length >= 4) ||
           radioPattern.test(text);
  },

  isTrueFalse(text) {
    return /\(\s*\)\s*(verdadeiro|falso|true|false)/gi.test(text);
  },

  isNumerical(text) {
    return /(resposta|resultado|valor|número|number)\s*[:=]?\s*\d+/gi.test(text);
  },

  parseOptions(text) {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);
    const pattern = /^[a-e]\)\s+(.+)$/i;
    return lines
      .filter(line => pattern.test(line))
      .map(line => line.replace(pattern, '$1'));
  },

  extractAnswer(text) {
    const answerPattern = /(?:resposta|gabarito|answer)[:=]?\s*([a-e])/i;
    const match = text.match(answerPattern);
    return match ? match[1].toUpperCase() : null;
  },

  sanitizeQuestion(question) {
    return question
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<img[^>]*>/gi, '')
      .trim();
  },

  parseCSV(csvText) {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const questions = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const q = {};
      headers.forEach((header, idx) => { q[header] = values[idx] || ''; });
      if (q.question) questions.push(q);
    }
    return questions;
  },
};
