/* ════════════════════════════════════════════════════════
   gemini-evaluator.js - AI Question Evaluation
   ════════════════════════════════════════════════════════ */

class GeminiEvaluator {
  constructor() {
    this.apiKey = null;
    this.endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
    this.isConfigured = false;
  }

  configure(apiKey) {
    this.apiKey = apiKey;
    this.isConfigured = !!apiKey;
    localStorage.setItem('geminiApiKey', apiKey);
  }

  async evaluate(question, userAnswer) {
    if (!this.isConfigured) {
      Notifications?.warning?.('Configure sua chave API do Gemini primeiro');
      return null;
    }

    try {
      const prompt = `Avalie esta resposta de forma clara e construtiva.
      
Questão: ${question.question}
Tipo: ${question.type}
Resposta esperada: ${question.answer}
Resposta do usuário: ${userAnswer}
Explicação: ${question.explanation}

Forneça: 1) Se está correto/incorreto, 2) Feedback construtivo, 3) Dicas para melhorar`;

      const response = await fetch(`${this.endpoint}?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      });

      if (!response.ok) throw new Error('Erro na API');
      
      const data = await response.json();
      const evaluation = data.contents?.[0]?.parts?.[0]?.text;
      return evaluation;
    } catch (error) {
      console.error('Erro ao avaliar:', error);
      Notifications?.error?.('Erro ao conectar com Gemini');
      return null;
    }
  }

  async generateQuestions(topic, quantity = 5, difficulty = 'medium') {
    if (!this.isConfigured) return [];

    try {
      const prompt = `Gere ${quantity} questões sobre "${topic}" com dificuldade ${difficulty}.
Formato JSON: [{"question": "...", "type": "multiple-choice|true-false|open-ended", "options": [...], "answer": "...", "explanation": "..."}]`;

      const response = await fetch(`${this.endpoint}?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      });

      if (!response.ok) throw new Error('Erro na API');
      
      const data = await response.json();
      const content = data.contents?.[0]?.parts?.[0]?.text;
      const parsed = JSON.parse(content);
      return parsed;
    } catch (error) {
      console.error('Erro ao gerar questões:', error);
      Notifications?.error?.('Erro ao gerar questões');
      return [];
    }
  }

  openConfigDialog() {
    const container = DOM.create('div');
    container.innerHTML = `
      <div style="padding: 12px;">
        <p style="font-size: 12px; margin-bottom: 12px;">
          Para usar a avaliação com IA, obtenha sua chave em: <br>
          <a href="https://makersuite.google.com/app/apikey" target="_blank">Google AI Studio</a>
        </p>
        <input type="password" id="api-key-input" class="form-control" placeholder="Cole sua chave..." style="margin-bottom: 12px;">
      </div>
    `;
    Modals.create('Configurar Gemini AI', container, [
      { text: 'Cancelar', className: 'btn-secondary' },
      { text: 'Salvar', className: 'btn-primary', onClick: () => {
        const key = DOM.q('#api-key-input').value;
        if (key) {
          this.configure(key);
          Notifications?.success?.('Gemini configurado!');
        }
      }},
    ]);
  }
}

const Evaluator = new GeminiEvaluator();

document.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('geminiApiKey');
  if (saved) Evaluator.configure(saved);
});
