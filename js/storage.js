/* ════════════════════════════════════════════════════════
   storage.js - Local Storage & Data Persistence
   ════════════════════════════════════════════════════════ */

const Storage = {
  PREFIX: 'qb_',

  save(key, data) {
    try {
      const json = typeof data === 'string' ? data : JSON.stringify(data);
      localStorage.setItem(this.PREFIX + key, json);
      return true;
    } catch (e) {
      console.error('Storage save error:', e);
      Notifications?.error?.('Erro ao salvar dados');
      return false;
    }
  },

  load(key, defaultValue = null) {
    try {
      const data = localStorage.getItem(this.PREFIX + key);
      if (data === null) return defaultValue;
      try { return JSON.parse(data); }
      catch { return data; }
    } catch (e) {
      console.error('Storage load error:', e);
      return defaultValue;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(this.PREFIX + key);
      return true;
    } catch (e) {
      console.error('Storage remove error:', e);
      return false;
    }
  },

  clear() {
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith(this.PREFIX)) keysToRemove.push(key);
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      return true;
    } catch (e) {
      console.error('Storage clear error:', e);
      return false;
    }
  },

  exportJSON() {
    const data = {
      title: State.title,
      subtitle: State.subtitle,
      library: State.library,
      doubts: Array.from(State.doubts),
      incompletes: Array.from(State.incompletes),
      exportedAt: new Date().toISOString(),
    };
    Helpers.download(JSON.stringify(data, null, 2), 'questoes.json');
    Notifications?.success?.('Exportado com sucesso!');
  },

  async importJSON(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (data.title) State.title = data.title;
          if (data.subtitle) State.subtitle = data.subtitle;
          if (data.library) State.library = data.library;
          if (data.doubts) State.doubts = new Set(data.doubts);
          if (data.incompletes) State.incompletes = new Set(data.incompletes);
          Notifications?.success?.('Importado com sucesso!');
          Events.emit('importedData');
          resolve(data);
        } catch (err) {
          Notifications?.error?.('Erro ao importar arquivo');
          reject(err);
        }
      };
      reader.onerror = () => {
        Notifications?.error?.('Erro ao ler arquivo');
        reject('Erro ao ler arquivo');
      };
      reader.readAsText(file);
    });
  },

  exportCSV() {
    const rows = [['Número', 'Questão', 'Dúvida', 'Incompleta']];
    State.library.forEach((q, idx) => {
      rows.push([
        idx + 1,
        q.question || '',
        State.doubts.has(q.id) ? 'Sim' : 'Não',
        State.incompletes.has(q.id) ? 'Sim' : 'Não',
      ]);
    });
    const csv = rows.map(row => row.map(cell => {
      const str = String(cell);
      return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
    }).join(',')).join('\n');
    Helpers.download(csv, 'questoes.csv', 'text/csv');
    Notifications?.success?.('Exportado em CSV!');
  },

  autoSave() {
    setInterval(() => {
      this.save('state', {
        title: State.title,
        subtitle: State.subtitle,
        library: State.library,
        doubts: Array.from(State.doubts),
        incompletes: Array.from(State.incompletes),
      });
    }, 30000);
  },
};

document.addEventListener('DOMContentLoaded', () => {
  Storage.autoSave();
  const saved = Storage.load('state');
  if (saved) {
    if (saved.title) State.title = saved.title;
    if (saved.subtitle) State.subtitle = saved.subtitle;
    if (saved.library) State.library = saved.library;
    if (saved.doubts) State.doubts = new Set(saved.doubts);
    if (saved.incompletes) State.incompletes = new Set(saved.incompletes);
  }
});
