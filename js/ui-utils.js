/* ════════════════════════════════════════════════════════
   ui-utils.js - DOM & UI Helper Functions
   ════════════════════════════════════════════════════════ */

const DOM = {
  q(selector) { return document.querySelector(selector); },
  qa(selector) { return document.querySelectorAll(selector); },
  create(tag, className = '', attributes = {}) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'text') el.textContent = value;
      else if (key === 'html') el.innerHTML = value;
      else el.setAttribute(key, value);
    });
    return el;
  },
  addClass(el, className) { el?.classList.add(className); },
  removeClass(el, className) { el?.classList.remove(className); },
  toggleClass(el, className) { el?.classList.toggle(className); },
  hasClass(el, className) { return el?.classList.contains(className); },
  show(el) { if (el) el.style.display = ''; },
  hide(el) { if (el) el.style.display = 'none'; },
  setText(el, text) { if (el) el.textContent = text; },
  setHTML(el, html) { if (el) el.innerHTML = html; },
  getValue(el) { return el?.value || ''; },
  setValue(el, value) { if (el) el.value = value; },
  append(parent, ...children) {
    children.forEach(child => {
      parent.appendChild(typeof child === 'string' ? DOM.create('div', '', { text: child }) : child);
    });
  },
  empty(el) { while (el?.firstChild) el.removeChild(el.firstChild); },
};

const Events = {
  on(el, event, handler, options = {}) {
    el?.addEventListener(event, handler, options);
    return () => el?.removeEventListener(event, handler);
  },
  off(el, event, handler) { el?.removeEventListener(event, handler); },
  emit(name, detail) { window.dispatchEvent(new CustomEvent(name, { detail })); },
  on_custom(name, handler) {
    window.addEventListener(name, handler);
    return () => window.removeEventListener(name, handler);
  },
  debounce(fn, delay) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), delay);
    };
  },
  throttle(fn, delay) {
    let lastCall = 0;
    return (...args) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        fn(...args);
        lastCall = now;
      }
    };
  },
};

const Format = {
  time(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  },
  duration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  },
  sanitize(html) {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  },
  truncate(text, length = 100) {
    return text.length > length ? text.slice(0, length) + '…' : text;
  },
};

const Helpers = {
  copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      Notifications?.success?.('Copiado!');
    }).catch(() => {
      Notifications?.error?.('Erro ao copiar');
    });
  },
  download(data, filename, type = 'application/json') {
    const blob = new Blob([data], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
  uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  },
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },
};
