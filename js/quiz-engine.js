/* ════════════════════════════════════════════════════════
   quiz-engine.js - Quiz Execution & Scoring
   ════════════════════════════════════════════════════════ */

class QuizEngine {
  constructor() {
    this.questions = [];
    this.currentIndex = 0;
    this.answers = {};
    this.score = 0;
    this.started = false;
    this.finished = false;
  }

  start(questions = State.library.filter(q => q.type !== 'open-ended')) {
    if (questions.length === 0) {
      Notifications.error('Nenhuma questão para iniciar quiz');
      return false;
    }
    this.questions = questions.sort(() => Math.random() - 0.5);
    this.currentIndex = 0;
    this.answers = {};
    this.score = 0;
    this.started = true;
    this.finished = false;
    Events.emit('quizStarted', { total: questions.length });
    this.displayQuestion();
    return true;
  }

  displayQuestion() {
    if (!this.started || this.finished) return;
    const q = this.questions[this.currentIndex];
    if (!q) return;
    
    const container = DOM.q('.quiz-container');
    if (!container) return;

    const progressBar = `<div class="quiz-progress">
      <div class="progress-bar" style="width: ${((this.currentIndex + 1) / this.questions.length) * 100}%"></div>
    </div>`;
    
    let optionsHtml = '';
    if (['multiple-choice', 'true-false'].includes(q.type)) {
      optionsHtml = q.options.map((opt, idx) => {
        const letter = String.fromCharCode(97 + idx);
        return `
          <label class="option-label">
            <input type="radio" name="answer" value="${letter}" 
              ${this.answers[q.id] === letter ? 'checked' : ''}>
            <span>${opt}</span>
          </label>
        `;
      }).join('');
    }

    container.innerHTML = `
      ${progressBar}
      <div class="quiz-content">
        <div class="quiz-meta">
          Questão ${this.currentIndex + 1} de ${this.questions.length} | 
          Dificuldade: <strong>${q.difficulty}</strong>
        </div>
        <div class="quiz-question">${q.question}</div>
        <div class="quiz-options">${optionsHtml}</div>
      </div>
      <div class="quiz-actions">
        ${this.currentIndex > 0 ? '<button class="btn btn-secondary" onclick="Quiz.previous()">Anterior</button>' : ''}
        <button class="btn btn-secondary" onclick="Quiz.skip()">Pular</button>
        ${this.currentIndex < this.questions.length - 1 ? 
          '<button class="btn btn-primary" onclick="Quiz.next()">Próxima</button>' :
          '<button class="btn btn-success" onclick="Quiz.finish()">Finalizar</button>'}
      </div>
    `;

    const radios = container.querySelectorAll('input[type="radio"]');
    radios.forEach(r => r.onchange = () => {
      this.answers[q.id] = r.value;
    });
  }

  next() {
    const q = this.questions[this.currentIndex];
    const answer = document.querySelector('input[name="answer"]:checked');
    if (answer) this.answers[q.id] = answer.value;
    if (this.currentIndex < this.questions.length - 1) {
      this.currentIndex++;
      this.displayQuestion();
    }
  }

  previous() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.displayQuestion();
    }
  }

  skip() {
    this.next();
  }

  finish() {
    this.score = 0;
    this.questions.forEach(q => {
      if (this.answers[q.id] === q.answer) this.score++;
    });
    this.finished = true;
    this.displayResults();
  }

  displayResults() {
    const total = this.questions.length;
    const percentage = Math.round((this.score / total) * 100);
    const container = DOM.q('.quiz-container');
    container.innerHTML = `
      <div class="quiz-results">
        <h2>Resultado Final</h2>
        <div class="score-display">
          <div class="score-number">${this.score}/${total}</div>
          <div class="score-percentage">${percentage}%</div>
        </div>
        <div class="score-feedback">
          ${percentage >= 80 ? '🎉 Excelente!' :
            percentage >= 60 ? '👍 Bom!' :
            percentage >= 40 ? '📚 Continue estudando' :
            '💪 Muito treino ainda!'}
        </div>
        <button class="btn btn-primary" onclick="Quiz.reset()">Fazer Novamente</button>
        <button class="btn btn-secondary" onclick="App.goToTab('library')">Voltar à Biblioteca</button>
      </div>
    `;
    Audio?.playSuccess?.();
    Events.emit('quizFinished', { score: this.score, total, percentage });
  }

  reset() {
    this.started = false;
    this.finished = false;
    const container = DOM.q('.quiz-container');
    if (container) DOM.empty(container);
  }
}

const Quiz = new QuizEngine();
