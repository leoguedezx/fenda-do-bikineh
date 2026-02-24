/* ════════════════════════════════════════════════════════
   theme.js - Theme Management System
   ════════════════════════════════════════════════════════ */

const Themes = {
  available: {
    'charcoal-gold': 'Charcoal Gold',
    'ocean': 'Ocean',
    'annapurna': 'Annapurna',
    'crimson': 'Crimson Dusk',
    'frost': 'White Cliffs',
    'alpine': 'Alpine Dusk',
  },
  current: 'charcoal-gold',

  init() {
    const saved = localStorage.getItem('theme');
    if (saved && this.available[saved]) this.set(saved);
    else this.set('charcoal-gold');
    this.setupListeners();
  },

  set(themeName) {
    if (this.available[themeName]) {
      this.current = themeName;
      const html = document.documentElement;
      if (themeName === 'charcoal-gold') html.removeAttribute('data-theme');
      else html.setAttribute('data-theme', themeName);
      localStorage.setItem('theme', themeName);
      this.emit('themeChanged', themeName);
    }
  },

  getName() { return this.available[this.current] || 'Unknown'; },
  getNext() {
    const keys = Object.keys(this.available);
    const currentIndex = keys.indexOf(this.current);
    return keys[(currentIndex + 1) % keys.length];
  },
  cycle() { this.set(this.getNext()); },
  setupListeners() {
    Events.on_custom('cycleTheme', () => this.cycle());
  },
  emit(name, data) { Events.emit(name, data); },
};

function openThemePanelOrb() {
  const container = DOM.create('div');
  container.innerHTML = `
    <div style="padding: 12px;">
      <div style="font-size: 12px; font-weight: 600; color: var(--accent-gold); margin-bottom: 12px;">Selecione um tema:</div>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;" id="theme-btns">
      </div>
    </div>
  `;
  const grid = container.querySelector('#theme-btns');
  Object.entries(Themes.available).forEach(([key, name]) => {
    const btn = DOM.create('button', 'btn btn-secondary');
    btn.textContent = name;
    btn.style.fontSize = '12px';
    btn.onclick = () => {
      Themes.set(key);
      Modals.close(Modals.modals[Modals.modals.length - 1]);
    };
    grid.appendChild(btn);
  });
  Modals.create('Temas', container, [{ text: 'Fechar', className: 'btn-primary' }]);
}

document.addEventListener('DOMContentLoaded', () => { Themes.init(); });
