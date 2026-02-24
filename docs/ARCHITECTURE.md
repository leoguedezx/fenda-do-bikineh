# Arquitetura Técnica - Construtor de Questões

## 🏗️ Visão Geral da Arquitetura

O Construtor de Questões é uma aplicação **Single Page Application (SPA)** vanilla JavaScript com arquitetura modular baseada em:

```
┌─────────────────────────────────────────┐
│          index.html (UI Layer)          │
├─────────────────────────────────────────┤
│    CSS Layer (Temas + Responsivo)       │
│  [themes.css] [main.css] [responsive]   │
├─────────────────────────────────────────┤
│      Module Layer (14 módulos JS)       │
│  ┌─────────────────────────────────────┐│
│  │ Core: state.js, audio.js            ││
│  │ Utils: ui-utils.js, parser.js       ││
│  │ UI: notifications.js, theme.js      ││
│  │ Data: storage.js, library.js        ││
│  │ Features: quiz-engine, editor       ││
│  │ Extra: music-player, chronometer    ││
│  │ AI: gemini-evaluator.js             ││
│  │ Main: app.js (orchestrator)         ││
│  └─────────────────────────────────────┘│
├─────────────────────────────────────────┤
│  Storage Layer (localStorage)           │
│  + JSON/CSV Import/Export               │
└─────────────────────────────────────────┘
```

## 📦 Módulos e Responsabilidades

### 1. **state.js** - Global State
```javascript
State = {
  title, subtitle, library, currentQuestionIndex,
  answers, doubts (Set), incompletes (Set),
  methods: init(), getCurrentQuestion(), 
           addQuestion(), removeQuestion(),
           toggleDoubt(), toggleIncomplete()
}
```
**Responsabilidade**: Único ponto de verdade para estado global

### 2. **audio.js** - Web Audio API
```javascript
Audio = {
  playTone(frequency), playCorrect(), playWrong(),
  playSuccess(), playError(), playNotification(),
  setVolume(), toggleMute()
}
```
**Responsabilidade**: Gerenciar efeitos sonoros e áudio

### 3. **ui-utils.js** - DOM Helpers
```javascript
DOM = { q(), qa(), create(), addClass(), ...}
Events = { on(), off(), emit(), debounce(), throttle() }
Format = { time(), duration(), sanitize(), truncate() }
Helpers = { copyToClipboard(), download(), uuid(), sleep() }
```
**Responsabilidade**: Operações DOM e utilitários comuns

### 4. **notifications.js** - Toast & Modals
```javascript
Notifications = { show(), success(), error(), warning() }
Modals = { create(), close(), confirm(), alert() }
```
**Responsabilidade**: Sistema de notificações e diálogos

### 5. **theme.js** - Tema Management
```javascript
Themes = {
  available: { 'charcoal-gold': 'name', ... },
  init(), set(name), get(), cycle()
}
```
**Responsabilidade**: Alternância de temas via data-theme

### 6. **storage.js** - Persistência
```javascript
Storage = {
  save(key, data), load(key, default),
  remove(key), clear(),
  exportJSON(), importJSON(file),
  exportCSV(), autoSave()
}
```
**Responsabilidade**: localStorage + import/export

### 7. **parser.js** - Análise de Formato
```javascript
Parser = {
  detectFormat(text), isJSON(), isMultipleChoice(),
  isTrueFalse(), isNumerical(),
  parseOptions(), extractAnswer(), parseCSV()
}
```
**Responsabilidade**: Detectar e parsear diferentes formatos

### 8. **question-editor.js** - CRUD
```javascript
QuestionEditor = {
  createNew(), edit(id, data), delete(id),
  duplicate(id), openEditor(), saveEditor()
}
```
**Responsabilidade**: Criar, editar, deletar questões

### 9. **library.js** - Gerenciador
```javascript
Library = {
  filteredList, searchTerm, sortBy,
  display(), update(), getStats(), displayStats()
}
```
**Responsabilidade**: Exibir e gerenciar biblioteca

### 10. **quiz-engine.js** - Motor de Quiz
```javascript
Quiz = new QuizEngine()
Quiz.start(), next(), previous(), skip(),
    finish(), displayResults(), reset()
```
**Responsabilidade**: Lógica de execução de quiz

### 11. **music-player.js** - Música
```javascript
Music = new MusicPlayer()
Music.play(), stop(), toggle(), nextTrack(),
     setVolume(), init()
```
**Responsabilidade**: Player de música com frequências

### 12. **chronometer.js** - Cronômetro
```javascript
Chrono = new Chronometer()
Chrono.start(), pause(), resume(), stop(),
      reset(), tick(), formatElapsed()
```
**Responsabilidade**: Timer de estudo

### 13. **gemini-evaluator.js** - IA
```javascript
Evaluator = new GeminiEvaluator()
Evaluator.configure(key), evaluate(q, answer),
          generateQuestions(topic, qty, difficulty)
```
**Responsabilidade**: Integração com Gemini AI

### 14. **app.js** - Orquestrador
```javascript
App = {
  init(), setupEventListeners(), goToTab(),
  displayHome(), displayQuizSetup(), displayTools(),
  displaySettings()
}
```
**Responsabilidade**: Orquestração central e fluxo

## 🔄 Fluxos de Dados

### Criar Questão
```
UI Input → QuestionEditor.createNew()
       → State.addQuestion()
       → Events.emit('questionUpdated')
       → Library.display()
       → Storage.autoSave()
```

### Fazer Quiz
```
App.goToTab('quiz') → Quiz.start()
                   → Quiz.displayQuestion()
                   → User answers
                   → Quiz.finish()
                   → Quiz.displayResults()
                   → Events.emit('quizFinished')
```

### Importar Dados
```
File Input → Storage.importJSON()
          → State.library = imported
          → Events.emit('importedData')
          → Library.display()
```

## 🎨 Camada CSS

### Estrutura
```
themes.css (6 temas com CSS Variables)
  ↓
main.css (estilos base, animações)
  ↓
mobile.css (≤600px overrides)
tablet.css (601-1024px overrides)
responsive.css (≥1025px + componentes)
```

### CSS Variables Pattern
```css
:root {
  --bg-light: #1a1a2e;
  --bg-medium: #16213e;
  --accent-gold: #d4a574;
  /* 40+ variáveis por tema */
}

[data-theme="ocean"] {
  --bg-light: #0a1628;
  --accent-gold: #4da6d6;
  /* theme-specific overrides */
}
```

## ⚙️ Event System

Usa CustomEvents para comunicação entre módulos:

```javascript
Events.emit('quizStarted', { data })
Events.emit('questionUpdated', question)
Events.emit('themeChanged', themeName)
Events.emit('importedData')
Events.emit('quizFinished', { score, total })
Events.emit('musicToggled', { playing })
```

## 💾 Estrutura de Dados

### Question Object
```javascript
{
  id: "uuid",
  question: "Qual é...?",
  type: "multiple-choice|true-false|open-ended|numerical",
  options: ["A", "B", "C"],
  answer: "b",
  explanation: "Porque...",
  tags: ["historia", "brasil"],
  difficulty: "easy|medium|hard",
  createdAt: "ISO-8601",
  updatedAt: "ISO-8601"
}
```

### State Object
```javascript
{
  title: "String",
  subtitle: "String",
  library: [Question, ...],
  doubts: Set<questionId>,
  incompletes: Set<questionId>,
  currentQuestionIndex: number
}
```

## 🔐 localStorage Keys

```
qb_state: { title, subtitle, library, doubts, incompletes }
qb_theme: themeName
qb_musicVolume: 0-1
qb_geminiApiKey: encrypted (opcional)
qb_lastState: backup automático
```

## 📱 Responsividade

### Breakpoints
```css
Mobile:    max-width: 600px
Tablet:    601px - 1024px  
Desktop:   min-width: 1025px
```

### Estratégia
1. CSS mobile-first
2. Mobile.css com 320 linhas de overrides
3. Tablet.css com 363 linhas de ajustes
4. Responsive.css com componentes completos

## 🚀 Otimizações

### Performance
- ✅ Vanilla JS (zero dependencies)
- ✅ Event delegation para listeners
- ✅ Debounce/throttle em buscas
- ✅ CSS Variables vs. inline styles
- ✅ localStorage caching

### Acessibilidade
- ✅ Semântica HTML5
- ✅ Focus visible styles
- ✅ Keyboard navigation
- ✅ ARIA labels onde necessário
- ✅ Color contrast compliance

## 🔌 Extensibilidade

### Adicionar Nova Feature
1. Criar módulo em `/js/feature.js`
2. Vincular em `index.html`
3. Usar Events para comunicar
4. Seguir padrão dos módulos existentes

### Adicionar Novo Tema
1. Editar `/css/themes.css`
2. Criar `[data-theme="newtheme"]` selector
3. Definir 40+ CSS Variables
4. Adicionar ao `Themes.available` em `theme.js`

## 🧪 Testing

Aplicação pode ser testada:
- **Unit**: Testar módulos individuais (state, parser, etc)
- **Integration**: Testar fluxos (criar → editar → quiz)
- **E2E**: Simular usuário completo

## 🐛 Error Handling

```javascript
try {
  // operação
} catch (error) {
  console.error(error)
  Notifications?.error?.('Mensagem amigável')
}
```

## 📈 Roadmap Técnico

- [ ] IndexedDB para questões > 1MB
- [ ] Service Workers para offline PWA
- [ ] Sync com Google Drive
- [ ] Analytics de performance
- [ ] Dark mode avançado
- [ ] Internacionalização (i18n)

---

**Arquitetura modular, extensível e performática para educação**
