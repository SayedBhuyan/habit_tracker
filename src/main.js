/**
 * Application Bootstrap & Main Controller
 */

import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/layouts.css';
import './styles/animations.css';

import { store } from './state/store.js';
import { renderNavigation } from './components/Navigation.js';
import { renderDayView } from './components/DayView.js';
import { renderHabitsManager } from './components/HabitsManager.js';
import { renderStatsView } from './components/StatsView.js';
import { renderHistoryView } from './components/HistoryView.js';
import { renderSettingsView } from './components/SettingsView.js';

function initApp() {
  const appContainer = document.getElementById('app');
  if (!appContainer) return;

  appContainer.innerHTML = `
    <div class="app-shell">
      <div id="navContainer"></div>
      <main class="app-main" id="viewContainer" role="main"></main>
    </div>
  `;

  const navContainer = document.getElementById('navContainer');
  const viewContainer = document.getElementById('viewContainer');

  function updateUI() {
    renderNavigation(navContainer);

    switch (store.currentView) {
      case 'today':
        renderDayView(viewContainer);
        break;
      case 'habits':
        renderHabitsManager(viewContainer);
        break;
      case 'stats':
        renderStatsView(viewContainer);
        break;
      case 'history':
        renderHistoryView(viewContainer);
        break;
      case 'settings':
        renderSettingsView(viewContainer);
        break;
      default:
        renderDayView(viewContainer);
    }
  }

  // Subscribe to store updates
  store.subscribe((state, event) => {
    updateUI();
  });

  // Initial render
  updateUI();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
