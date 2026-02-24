/* ════════════════════════════════════════════════════════
   question-editor.js - Question CRUD Operations
   ════════════════════════════════════════════════════════ */

const QuestionEditor = {
  currentEditId: null,

  createNew() {
    const newQuestion = {
      id: Helpers.uuid(),
      question: '',
      type: 'open-ended',
      options: [],
      answer: '',
      explanation: '',
      tags: [],
      difficulty: 'medium',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    State.addQuestion(newQuestion);
    return newQuestion;
  },

  edit(id, data) {
    const question = State.getCurrentQuestion();
    if (!question) return false;
    Object.assign(question, data, { updatedAt: new Date().toISOString() });
    Events.emit('questionUpdated', question);
    Notifications?.success?.('Questão atualizada');
    return true;
  },

  delete(id) {
    Modals.confirm('Deletar', 'Tem certeza que deseja deletar esta questão?', () => {
      State.removeQuestion(id);
      Notifications?.success?.('Questão deletada');
      Events.emit('questionDeleted', id);
    });
  },

  duplicate(id) {
    const original = State.library.find(q => q.id === id);
    if (!original) return;
    const copy = JSON.parse(JSON.stringify(original));
    copy.id = Helpers.uuid();
    copy.createdAt = new Date().toISOString();
    State.addQuestion(copy);
    Notifications?.success?.('Questão duplicada');
    Events.emit('questionDuplicated', copy);
  },

  openEditor(questionId = null) {
    const question = questionId
      ? State.library.find(q => q.id === questionId)
      : State.getCurrentQuestion();
    if (!question) return;

    const container = DOM.create('div', 'editor-content');
    container.innerHTML = `
      <div class="editor-section">
        <label>Tipo de Questão</label>
        <select id="type-select" class="form-control">
          <option value="open-ended">Aberta</option>
          <option value="multiple-choice">Múltipla Escolha</option>
          <option value="true-false">Verdadeiro/Falso</option>
          <option value="numerical">Numérica</option>
        </select>
      </div>
      <div class="editor-section">
        <label>Questão</label>
        <textarea id="question-input" class="form-control" rows="6" placeholder="Digite a questão..."></textarea>
      </div>
      <div class="editor-section" id="options-section" style="display: none;">
        <label>Opções</label>
        <div id="options-list"></div>
        <button class="btn btn-secondary" onclick="QuestionEditor.addOption()">+ Opção</button>
      </div>
      <div class="editor-section">
        <label>Resposta</label>
        <input type="text" id="answer-input" class="form-control" placeholder="Digite a resposta...">
      </div>
      <div class="editor-section">
        <label>Explicação</label>
        <textarea id="explanation-input" class="form-control" rows="3" placeholder="Explicação da resposta..."></textarea>
      </div>
      <div class="editor-section">
        <label>Dificuldade</label>
        <select id="difficulty-select" class="form-control">
          <option value="easy">Fácil</option>
          <option value="medium">Médio</option>
          <option value="hard">Difícil</option>
        </select>
      </div>
      <div class="editor-section">
        <label>Tags</label>
        <input type="text" id="tags-input" class="form-control" placeholder="Separe por vírgula...">
      </div>
    `;

    const typeSelect = container.querySelector('#type-select');
    const options = container.querySelector('#options-section');
    typeSelect.value = question.type;
    typeSelect.onchange = () => {
      options.style.display = 
        ['multiple-choice', 'true-false'].includes(typeSelect.value) ? 'block' : 'none';
    };
    typeSelect.onchange();

    container.querySelector('#question-input').value = question.question;
    container.querySelector('#answer-input').value = question.answer;
    container.querySelector('#explanation-input').value = question.explanation;
    container.querySelector('#difficulty-select').value = question.difficulty;
    container.querySelector('#tags-input').value = question.tags.join(', ');

    const optionsList = container.querySelector('#options-list');
    question.options.forEach((opt, idx) => {
      const input = DOM.create('input', 'form-control');
      input.type = 'text';
      input.value = opt;
      optionsList.appendChild(input);
    });

    this.currentEditId = question.id;
    Modals.create('Editor de Questão', container, [
      { text: 'Cancelar', className: 'btn-secondary' },
      { text: 'Salvar', className: 'btn-primary', onClick: () => {
        this.saveEditor();
      }},
    ]);
  },

  addOption() {
    const optList = DOM.q('#options-list');
    if (optList) {
      const input = DOM.create('input', 'form-control');
      input.type = 'text';
      input.placeholder = 'Digite a opção...';
      optList.appendChild(input);
    }
  },

  saveEditor() {
    const type = DOM.q('#type-select').value;
    const question = DOM.q('#question-input').value;
    const answer = DOM.q('#answer-input').value;
    const explanation = DOM.q('#explanation-input').value;
    const difficulty = DOM.q('#difficulty-select').value;
    const tags = DOM.q('#tags-input').value.split(',').map(t => t.trim());
    const options = Array.from(DOM.qa('#options-list input')).map(i => i.value);

    this.edit(this.currentEditId, {
      type, question, answer, explanation, difficulty, tags, options,
    });
  },
};
