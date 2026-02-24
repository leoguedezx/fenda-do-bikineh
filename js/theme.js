/* === THEME SWITCHER === */
(function() {
  var STORAGE_KEY = 'qb_theme_v1';

  function applyTheme(themeId) {
    document.documentElement.setAttribute('data-theme', themeId);
    document.querySelectorAll('.theme-card').forEach(function(c) {
      var isActive = c.getAttribute('data-theme-id') === themeId;
      c.classList.toggle('active', isActive);
      if (isActive) {
        var label = c.querySelector('.theme-card-label');
        var nameEl = document.getElementById('theme-current-name');
        if (nameEl && label) nameEl.textContent = label.textContent.split('—')[0].trim();
        // Brief flash animation on the button
        var btn = document.getElementById('theme-floating-btn');
        if (btn) {
          btn.classList.remove('clicked');
          void btn.offsetWidth;
          btn.classList.add('clicked');
          setTimeout(function(){ btn.classList.remove('clicked'); }, 450);
        }
      }
    });
    try { localStorage.setItem(STORAGE_KEY, themeId); } catch(e){}
  }

  function openThemePanel() {
    document.getElementById('theme-panel').classList.add('open');
    document.getElementById('theme-panel-overlay').classList.add('visible');
  }

  function openThemePanelOrb() {
    var btn = document.getElementById('theme-floating-btn');
    btn.classList.remove('clicked');
    void btn.offsetWidth; // force reflow
    btn.classList.add('clicked');
    setTimeout(function() { btn.classList.remove('clicked'); }, 450);
    openThemePanel();
  }

  function closeThemePanel() {
    document.getElementById('theme-panel').classList.remove('open');
    document.getElementById('theme-panel-overlay').classList.remove('visible');
  }

  // Expose globally
  window.applyTheme = applyTheme;
  window.openThemePanel = openThemePanel;
  window.openThemePanelOrb = openThemePanelOrb;
  window.closeThemePanel = closeThemePanel;

  // Restore saved theme
  var saved;
  try { saved = localStorage.getItem(STORAGE_KEY); } catch(e){}
  if (saved && ['charcoal','ocean','neon','crimson','frost','alpine'].indexOf(saved) >= 0) {
    applyTheme(saved);
  }
})();
