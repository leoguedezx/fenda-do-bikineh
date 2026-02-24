/* ════════════════════════════════════════════════════════
   notifications.js - Toast & Modal System
   ════════════════════════════════════════════════════════ */

class NotificationManager {
  constructor() {
    this.notifications = [];
  }

  show(message, type = 'info', duration = 3000) {
    const id = Date.now();
    const container = document.querySelector('.notifications') || this.createContainer();
    const el = document.createElement('div');
    el.className = `notification ${type}`;
    el.id = `notif-${id}`;
    el.textContent = message;
    el.style.animation = 'notifIn 0.3s ease';
    container.appendChild(el);
    this.notifications.push({ id, message, type });
    if (duration > 0) setTimeout(() => this.remove(id), duration);
    return id;
  }

  remove(id) {
    const el = document.getElementById(`notif-${id}`);
    if (el) {
      el.style.animation = 'fadeUp 0.2s ease';
      setTimeout(() => el.remove(), 200);
    }
    this.notifications = this.notifications.filter(n => n.id !== id);
  }

  createContainer() {
    const container = document.createElement('div');
    container.className = 'notifications';
    document.body.appendChild(container);
    return container;
  }

  success(message, duration = 3000) {
    Audio?.playSuccess?.();
    this.show(message, 'success', duration);
  }

  error(message, duration = 4000) {
    Audio?.playError?.();
    this.show(message, 'error', duration);
  }

  warning(message, duration = 3000) {
    this.show(message, 'warning', duration);
  }
}

const Notifications = new NotificationManager();

class ModalManager {
  constructor() {
    this.modals = [];
  }

  create(title, content, buttons = []) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    const modal = document.createElement('div');
    modal.className = 'modal-content';
    const header = document.createElement('div');
    header.className = 'modal-header';
    header.innerHTML = `<span>${title}</span><button class="modal-close">&times;</button>`;
    const body = document.createElement('div');
    body.className = 'modal-body';
    if (typeof content === 'string') body.innerHTML = content;
    else body.appendChild(content);
    const footer = document.createElement('div');
    footer.className = 'modal-footer';
    buttons.forEach(btn => {
      const button = document.createElement('button');
      button.className = `btn ${btn.className || ''}`;
      button.textContent = btn.text;
      button.onclick = () => {
        btn.onClick?.();
        this.close(overlay);
      };
      footer.appendChild(button);
    });
    modal.appendChild(header);
    modal.appendChild(body);
    if (buttons.length > 0) modal.appendChild(footer);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    header.querySelector('.modal-close').onclick = () => this.close(overlay);
    overlay.onclick = (e) => { if (e.target === overlay) this.close(overlay); };
    this.modals.push(overlay);
    return overlay;
  }

  close(overlay) {
    overlay.style.opacity = '0';
    setTimeout(() => {
      overlay.remove();
      this.modals = this.modals.filter(m => m !== overlay);
    }, 200);
  }

  confirm(title, message, onConfirm) {
    return this.create(title, message, [
      { text: 'Cancelar', className: 'btn-secondary' },
      { text: 'Confirmar', className: 'btn-primary', onClick: onConfirm },
    ]);
  }

  alert(title, message) {
    return this.create(title, message, [{ text: 'OK', className: 'btn-primary' }]);
  }
}

const Modals = new ModalManager();
