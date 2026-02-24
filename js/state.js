/* ════════════════════════════════════════════════════════
   state.js - Global State Management
   Manages: user data, library, quiz state, doubts
   ════════════════════════════════════════════════════════ */

// Parse embedded data
function parseEmbeddedData() {
  const scriptTag = document.getElementById('embedded-data');
  if (!scriptTag) return { title: 'Matéria', subtitle: 'Banco de Questões', library: [] };
  try {
    return JSON.parse(scriptTag.textContent);
  } catch (e) {
    console.error('Failed to parse embedded data:', e);
    return { title: 'Matéria', subtitle: 'Banco de Questões', library: [] };
  }
}

// Global State
const State = {
  title: 'Matéria',
  subtitle: 'Banco de Questões',
  library: [],
  currentTab: 'quiz',
  currentQuestionIndex: 0,
  answers: {},
  doubts: new Set(),
  incompletes: new Set(),
  currentTheme: 'charcoal-gold',
  showChronometer: false,
  showTypography: false,
  musicPlaying: false,
  volume: 0.35,
  editingQuestionId: null,

  init(data) {
    if (data.title) this.title = data.title;
    if (data.subtitle) this.subtitle = data.subtitle;
    if (data.library) this.library = data.library;
    console.log('✅ State initialized');
  },

  getCurrentQuestion() {
    return this.library[this.currentQuestionIndex] || null;
  },

  goToQuestion(index) {
    if (index >= 0 && index < this.library.length) {
      this.currentQuestionIndex = index;
    }
  },

  addQuestion(question) {
    question.id = Date.now();
    this.library.push(question);
    return question.id;
  },

  removeQuestion(index) {
    if (index >= 0 && index < this.library.length) {
      this.library.splice(index, 1);
      if (this.currentQuestionIndex >= this.library.length) {
        this.currentQuestionIndex = Math.max(0, this.library.length - 1);
      }
    }
  },

  toggleDoubt(questionId) {
    if (this.doubts.has(questionId)) {
      this.doubts.delete(questionId);
    } else {
      this.doubts.add(questionId);
    }
  },

  toggleIncomplete(questionId) {
    if (this.incompletes.has(questionId)) {
      this.incompletes.delete(questionId);
    } else {
      this.incompletes.add(questionId);
    }
  },
};

document.addEventListener('DOMContentLoaded', () => {
  const data = parseEmbeddedData();
  State.init(data);
});
