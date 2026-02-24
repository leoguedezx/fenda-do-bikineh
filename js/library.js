/* ════════════════════════════════════════════════════════
   library.js - Question Library Management
   ════════════════════════════════════════════════════════ */

const Library = {
  filteredList: [],
  searchTerm: '',
  sortBy: 'createdAt',

  display() {
    const container = DOM.q('.library-container');
    if (!container) return;
    
    this.update();
    DOM.empty(container);
    
    const headerDiv = DOM.create('div', 'library-header');
    headerDiv.innerHTML = `
      <div class="search-box">
        <input type="text" id="search-input" class="form-control" placeholder="Buscar...">
        <select id="sort-select" class="form-control">
          <option value="createdAt">Data (Recente)</option>
          <option value="difficulty">Dificuldade</option>
          <option value="type">Tipo</option>
        </select>
      </div>
      <div>
        <button class="btn btn-primary" onclick="QuestionEditor.createNew()">+ Nova</button>
        <button class="btn btn-secondary" onclick="QuestionEditor.openEditor()">Editar</button>
      </div>
    `;
    container.appendChild(headerDiv);

    const searchInput = headerDiv.querySelector('#search-input');
    const sortSelect = headerDiv.querySelector('#sort-select');
    searchInput.oninput = (e) => { this.searchTerm = e.target.value; this.display(); };
    sortSelect.onchange = (e) => { this.sortBy = e.target.value; this.display(); };

    const listDiv = DOM.create('div', 'library-list');
    this.filteredList.forEach((q, idx) => {
      const item = DOM.create('div', 'library-item');
      const isDoubt = State.doubts.has(q.id);
      const isIncomplete = State.incompletes.has(q.id);
      item.innerHTML = `
        <div class="item-header">
          <span class="item-number">${idx + 1}</span>
          <span class="item-question">${q.question.substring(0, 60)}...</span>
          <span class="item-type">${q.type}</span>
          <span class="item-difficulty ${q.difficulty}">${q.difficulty}</span>
        </div>
        <div class="item-actions">
          ${isDoubt ? '<span class="badge doubt">Dúvida</span>' : ''}
          ${isIncomplete ? '<span class="badge incomplete">Incompleta</span>' : ''}
          <button class="btn-icon" onclick="State.toggleDoubt('${q.id}')">💭</button>
          <button class="btn-icon" onclick="State.toggleIncomplete('${q.id}')">⚠️</button>
          <button class="btn-icon" onclick="QuestionEditor.duplicate('${q.id}')">📋</button>
          <button class="btn-icon danger" onclick="QuestionEditor.delete('${q.id}')">🗑️</button>
        </div>
      `;
      listDiv.appendChild(item);
    });
    container.appendChild(listDiv);
  },

  update() {
    let list = [...State.library];
    if (this.searchTerm) {
      list = list.filter(q => {
        const term = this.searchTerm.toLowerCase();
        return q.question.toLowerCase().includes(term) ||
               q.tags.some(t => t.toLowerCase().includes(term));
      });
    }
    list.sort((a, b) => {
      if (this.sortBy === 'createdAt') return new Date(b.createdAt) - new Date(a.createdAt);
      if (this.sortBy === 'difficulty') return ['easy', 'medium', 'hard'].indexOf(a.difficulty) - ['easy', 'medium', 'hard'].indexOf(b.difficulty);
      return a.type.localeCompare(b.type);
    });
    this.filteredList = list;
  },

  getStats() {
    return {
      total: State.library.length,
      doubts: State.doubts.size,
      incompletes: State.incompletes.size,
      easy: State.library.filter(q => q.difficulty === 'easy').length,
      medium: State.library.filter(q => q.difficulty === 'medium').length,
      hard: State.library.filter(q => q.difficulty === 'hard').length,
    };
  },

  displayStats() {
    const stats = this.getStats();
    const container = DOM.q('.library-stats');
    if (!container) return;
    container.innerHTML = `
      <div class="stat">Total: <strong>${stats.total}</strong></div>
      <div class="stat">Fácil: <strong>${stats.easy}</strong></div>
      <div class="stat">Médio: <strong>${stats.medium}</strong></div>
      <div class="stat">Difícil: <strong>${stats.hard}</strong></div>
      <div class="stat">Dúvidas: <strong>${stats.doubts}</strong></div>
      <div class="stat">Incompletas: <strong>${stats.incompletes}</strong></div>
    `;
  },
};

Events.on_custom('questionUpdated', () => { Library.display(); });
Events.on_custom('questionDeleted', () => { Library.display(); });
Events.on_custom('questionDuplicated', () => { Library.display(); });
