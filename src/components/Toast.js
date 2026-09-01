/**
 * Toast Notification System with optional action callbacks
 */

import { getIcon } from '../utils/icons.js';

class ToastManager {
  constructor() {
    this.container = null;
    this.init();
  }

  init() {
    if (typeof document === 'undefined') return;
    this.container = document.createElement('div');
    this.container.className = 'toast-container';
    this.container.setAttribute('role', 'region');
    this.container.setAttribute('aria-label', 'Notifications');
    document.body.appendChild(this.container);
  }

  show({ message, type = 'info', duration = 3500, action = null }) {
    if (typeof document === 'undefined') return;
    if (!this.container) this.init();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'status');

    let iconName = 'sparkles';
    if (type === 'success') iconName = 'check-circle-2';
    if (type === 'error') iconName = 'x';
    if (type === 'warning') iconName = 'flame';

    toast.innerHTML = `
      <div class="toast-content">
        ${getIcon(iconName, 'toast-icon')}
        <span class="toast-message">${message}</span>
      </div>
      ${action ? `<button class="toast-action-btn" type="button">${action.label}</button>` : ''}
    `;

    if (action) {
      const actionBtn = toast.querySelector('.toast-action-btn');
      actionBtn.addEventListener('click', () => {
        action.onClick();
        this.dismiss(toast);
      });
    }

    this.container.appendChild(toast);

    // Enter animation
    requestAnimationFrame(() => {
      toast.classList.add('toast-show');
    });

    const timeout = setTimeout(() => {
      this.dismiss(toast);
    }, duration);

    toast.addEventListener('click', (e) => {
      if (e.target.tagName !== 'BUTTON') {
        clearTimeout(timeout);
        this.dismiss(toast);
      }
    });
  }

  dismiss(toast) {
    if (typeof document === 'undefined' || !toast) return;
    toast.classList.remove('toast-show');
    toast.classList.add('toast-hide');
    setTimeout(() => {
      if (toast && toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 250);
  }
}

export const toast = new ToastManager();
