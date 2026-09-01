/**
 * Navigation Dock and Desktop Sidebar Component
 */

import { store } from '../state/store.js';
import { getIcon } from '../utils/icons.js';

export function renderNavigation(container) {
  const currentView = store.currentView;
  const currentTheme = store.preferences.theme;

  const items = [
    { id: 'today', label: 'Today', icon: 'check-circle-2' },
    { id: 'habits', label: 'Habits', icon: 'list' },
    { id: 'stats', label: 'Statistics', icon: 'bar-chart' },
    { id: 'history', label: 'History', icon: 'history' },
    { id: 'settings', label: 'Settings', icon: 'settings' }
  ];

  container.innerHTML = `
    <nav class="app-nav" aria-label="Main Navigation">
      <div class="nav-brand">
        <div class="nav-brand-icon">
          ${getIcon('sparkles')}
        </div>
        <span>HabitFlow</span>
      </div>

      ${items.map(item => `
        <button 
          class="nav-item ${currentView === item.id ? 'active' : ''}" 
          data-view="${item.id}"
          type="button"
          aria-label="${item.label}"
        >
          ${getIcon(item.icon)}
          <span>${item.label}</span>
        </button>
      `).join('')}

      <div class="nav-footer">
        <button class="btn btn-ghost btn-icon" id="quickThemeBtn" title="Toggle Theme" type="button" aria-label="Toggle Theme">
          ${getIcon(currentTheme === 'dark' ? 'sun' : 'moon')}
        </button>
      </div>
    </nav>
  `;

  // Attach navigation event handlers
  container.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.getAttribute('data-view');
      store.setView(view);
    });
  });

  const themeBtn = container.querySelector('#quickThemeBtn');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const nextTheme = store.preferences.theme === 'dark' ? 'light' : 'dark';
      store.updatePreferences({ theme: nextTheme });
    });
  }
}
