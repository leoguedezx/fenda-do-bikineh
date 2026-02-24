/* ════════════════════════════════════════════════════════
   app.js - Main Application Orchestrator
   ════════════════════════════════════════════════════════ */

const App = {
  currentTab: 'home',

  async init() {
    console.log('🚀 Iniciando Construtor de Questões...');
    
    State.init();
    Themes.init();
    this.setupEventListeners();
    this.setupNavigation();
    this.goToTab('home');
    
    Events.emit('appReady');
    Notifications?.success?.('Bem-vindo!');
    console.log('✅ Aplicação iniciada');
  },

  setupEventListeners() {
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 's') { e.preventDefault(); Notifications?.success?.('Salvo auto-save'); }
      if (e.key === 'Escape') document.querySelector('.modal-overlay')?.remove?.();
    });
    
    window.addEventListener('beforeunload', () => {
      Storage.save('lastState', {
        title: State.title,
        library: State.library,
        tab: App.currentTab,
      });
    });

    Events.on_custom('importedData', () => Library.display());
    Events.on_custom('themeChanged', () => this.onThemeChange());
  },

  setupNavigation() {
    const tabs = DOM.qa('[data-tab]');
    tabs.forEach(tab => {
      tab.onclick = () => this.goToTab(tab.dataset.tab);
    });
  },

  goToTab(tabName) {
    if (!Object.keys(this.getTabConfig()).includes(tabName)) return;
    
    this.currentTab = tabName;
    const tabs = DOM.qa('[data-tab]');
    tabs.forEach(t => {
      DOM.removeClass(t, 'active');
      if (t.dataset.tab === tabName) DOM.addClass(t, 'active');
    });

    const sections = DOM.qa('[data-section]');
    sections.forEach(s => {
      DOM.hide(s);
      if (s.dataset.section === tabName) DOM.show(s);
    });

    this.onTabChange(tabName);
  },

  onTabChange(tabName) {
    const config = this.getTabConfig()[tabName];
    if (config?.onEnter) config.onEnter();
  },

  getTabConfig() {
    return {
      home: {
        onEnter: () => this.displayHome(),
      },
      library: {
        onEnter: () => Library.display(),
      },
      quiz: {
        onEnter: () => this.displayQuizSetup(),
      },
      tools: {
        onEnter: () => this.displayTools(),
      },
      settings: {
        onEnter: () => this.displaySettings(),
      },
    };
  },

  displayHome() {
    const section = DOM.q('[data-section="home"]');
    if (!section) return;
    const stats = Library.getStats();
    section.innerHTML = `
      <div class="home-hero">
        <h1>${State.title}</h1>
        <p>${State.subtitle}</p>
      </div>
      <div class="home-stats">
        <div class="stat-card">
          <div class="stat-value">${stats.total}</div>
          <div class="stat-label">Questões</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.doubts}</div>
          <div class="stat-label">Dúvidas</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.incompletes}</div>
          <div class="stat-label">Incompletas</div>
        </div>
      </div>
      <div class="home-actions">
        <button class="btn btn-primary" onclick="App.goToTab('library')">Minha Biblioteca</button>
        <button class="btn btn-success" onclick="App.goToTab('quiz')">Começar Quiz</button>
        <button class="btn btn-secondary" onclick="App.goToTab('tools')">Ferramentas</button>
      </div>
    `;
  },

  displayQuizSetup() {
    const section = DOM.q('[data-section="quiz"]');
    if (!section) return;
    section.innerHTML = `
      <div class="quiz-setup">
        <h2>Configurar Quiz</h2>
        <div class="quiz-options">
          <label>
            <input type="checkbox" id="use-doubts" checked> Incluir apenas dúvidas
          </label>
          <label>
            <input type="checkbox" id="use-incompletes"> Incluir apenas incompletas
          </label>
        </div>
        <button class="btn btn-success" onclick="App.startQuiz()">Iniciar Quiz</button>
        <div class="quiz-container"></div>
      </div>
    `;
  },

  startQuiz() {
    const useDoubts = DOM.q('#use-doubts')?.checked;
    const useIncompletes = DOM.q('#use-incompletes')?.checked;
    
    let questions = State.library;
    if (useDoubts) questions = questions.filter(q => State.doubts.has(q.id));
    if (useIncompletes) questions = questions.filter(q => State.incompletes.has(q.id));
    
    Quiz.start(questions);
  },

  displayTools() {
    const section = DOM.q('[data-section="tools"]');
    if (!section) return;
    section.innerHTML = `
      <div class="tools-grid">
        <div class="tool-card">
          <h3>📥 Importar</h3>
          <p>Carregue um arquivo JSON ou CSV com suas questões</p>
          <input type="file" id="import-file" accept=".json,.csv" style="display: none;">
          <button class="btn btn-primary" onclick="document.getElementById('import-file').click()">Selecionar Arquivo</button>
        </div>
        <div class="tool-card">
          <h3>📤 Exportar</h3>
          <p>Baixe suas questões em diferentes formatos</p>
          <button class="btn btn-primary" onclick="Storage.exportJSON()">Exportar JSON</button>
          <button class="btn btn-secondary" onclick="Storage.exportCSV()">Exportar CSV</button>
        </div>
        <div class="tool-card">
          <h3>🤖 IA - Gemini</h3>
          <p>Configure a avaliação automática com Gemini</p>
          <button class="btn btn-primary" onclick="Evaluator.openConfigDialog()">Configurar</button>
        </div>
        <div class="tool-card">
          <h3>🎨 Temas</h3>
          <p>Altere a aparência da aplicação</p>
          <button class="btn btn-primary" onclick="openThemePanelOrb()">Abrir Temas</button>
        </div>
      </div>
    `;
    
    const fileInput = DOM.q('#import-file');
    if (fileInput) {
      fileInput.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) await Storage.importJSON(file);
      };
    }
  },

  displaySettings() {
    const section = DOM.q('[data-section="settings"]');
    if (!section) return;
    section.innerHTML = `
      <div class="settings-panel">
        <h2>Configurações</h2>
        <div class="settings-group">
          <label>Título da Biblioteca</label>
          <input type="text" class="form-control" value="${State.title}" 
            onchange="State.title = this.value">
        </div>
        <div class="settings-group">
          <label>Subtítulo</label>
          <input type="text" class="form-control" value="${State.subtitle}" 
            onchange="State.subtitle = this.value">
        </div>
        <div class="settings-actions">
          <button class="btn btn-danger" onclick="if(confirm('Limpar tudo?')) Storage.clear();">Limpar Tudo</button>
          <button class="btn btn-secondary" onclick="App.goToTab('home')">Voltar</button>
        </div>
      </div>
    `;
  },

  onThemeChange() {
    console.log('🎨 Tema alterado para:', Themes.current);
  },
};

document.addEventListener('DOMContentLoaded', () => App.init());
