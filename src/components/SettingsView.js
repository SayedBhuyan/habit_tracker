/**
 * Settings & Data Management View Component
 */

import { store } from '../state/store.js';
import { getIcon } from '../utils/icons.js';
import { exportDataAsJSON, importDataFromJSON } from '../state/storage.js';
import { toast } from './Toast.js';
import { categoryModal } from './CategoryModal.js';

export function renderSettingsView(container) {
  const prefs = store.preferences;
  const categories = store.categories;

  container.innerHTML = `
    <div class="view-transition-enter">
      <header class="view-header">
        <div>
          <h1 class="date-primary">Settings & Preferences</h1>
          <span class="date-subtitle">Customize application behavior, categories, themes, and data</span>
        </div>
      </header>

      <!-- Manage Categories -->
      <section class="card" style="margin-bottom: 1.5rem;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
          <div>
            <h3 style="font-size: 1.1rem; font-weight: 700;">Custom Categories</h3>
            <span style="font-size: 0.8rem; color: var(--text-muted);">Organize your habits with custom tags, icons & colors</span>
          </div>
          <button class="btn btn-primary" id="addCategorySettingBtn" style="padding: 0.45rem 0.9rem; font-size: 0.82rem; min-height: 38px;" type="button">
            ${getIcon('plus')}
            <span>Add Category</span>
          </button>
        </div>

        <div style="display: flex; flex-direction: column; gap: 0.65rem;">
          ${categories.map(cat => {
            const count = store.habits.filter(h => h.category === cat.id).length;
            return `
              <div style="
                display: flex; 
                align-items: center; 
                justify-content: space-between; 
                padding: 0.75rem 0.95rem; 
                background: var(--bg-tertiary); 
                border-radius: var(--radius-md); 
                border-left: 4px solid ${cat.color};
                gap: 0.75rem;
              ">
                <div style="display: flex; align-items: center; gap: 0.75rem; min-width: 0;">
                  <div class="habit-icon-badge" style="width: 2.25rem; height: 2.25rem; background: ${cat.color}20; color: ${cat.color};">
                    ${getIcon(cat.icon || 'star')}
                  </div>
                  <div style="min-width: 0;">
                    <div style="font-weight: 700; font-size: 0.95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                      ${escapeHtml(cat.name)}
                    </div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">
                      ${count} ${count === 1 ? 'habit' : 'habits'} linked
                    </div>
                  </div>
                </div>

                <div style="display: flex; align-items: center; gap: 0.35rem;">
                  <button class="btn btn-ghost btn-icon" data-edit-cat="${cat.id}" title="Edit Category" type="button" aria-label="Edit category" style="width: 2.25rem; height: 2.25rem;">
                    ${getIcon('edit')}
                  </button>
                  <button class="btn btn-ghost btn-icon" data-delete-cat="${cat.id}" title="Delete Category" type="button" aria-label="Delete category" style="width: 2.25rem; height: 2.25rem; color: #ef4444;" ${categories.length <= 1 ? 'disabled style="opacity:0.3;"' : ''}>
                    ${getIcon('trash')}
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </section>

      <!-- Appearance -->
      <section class="card" style="margin-bottom: 1.5rem;">
        <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 1rem;">Appearance</h3>
        <div class="form-group">
          <label class="form-label" for="themeSelect">Theme</label>
          <select id="themeSelect" class="form-select">
            <option value="system" ${prefs.theme === 'system' ? 'selected' : ''}>Auto (Follow System)</option>
            <option value="dark" ${prefs.theme === 'dark' ? 'selected' : ''}>Dark Mode</option>
            <option value="light" ${prefs.theme === 'light' ? 'selected' : ''}>Light Mode</option>
          </select>
        </div>
      </section>

      <!-- Sound & Haptics -->
      <section class="card" style="margin-bottom: 1.5rem;">
        <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 1rem;">Audio & Haptics</h3>
        
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <label style="display: flex; align-items: center; justify-content: space-between; cursor: pointer;">
            <div>
              <div style="font-weight: 600; font-size: 0.95rem;">Tactile Audio Feedback</div>
              <div style="font-size: 0.8rem; color: var(--text-muted);">Play audio chime when checking off habits</div>
            </div>
            <input type="checkbox" id="soundToggle" ${prefs.soundEnabled ? 'checked' : ''} style="width: 1.25rem; height: 1.25rem; accent-color: var(--accent-primary);" />
          </label>

          <label style="display: flex; align-items: center; justify-content: space-between; cursor: pointer;">
            <div>
              <div style="font-weight: 600; font-size: 0.95rem;">Celebrations & Confetti</div>
              <div style="font-size: 0.8rem; color: var(--text-muted);">Shower confetti when completing 100% of daily goals</div>
            </div>
            <input type="checkbox" id="celebrationToggle" ${prefs.celebrationsEnabled !== false ? 'checked' : ''} style="width: 1.25rem; height: 1.25rem; accent-color: var(--accent-primary);" />
          </label>
        </div>
      </section>

      <!-- Data Backup & Portability -->
      <section class="card" style="margin-bottom: 1.5rem;">
        <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem;">Data & Portability</h3>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.25rem;">
          Your data is stored completely locally in your browser. You can export a JSON backup anytime or import previous archives.
        </p>

        <div style="display: flex; flex-wrap: wrap; gap: 0.75rem;">
          <button class="btn btn-secondary" id="exportDataBtn" type="button">
            ${getIcon('download')}
            <span>Export JSON Backup</span>
          </button>

          <label class="btn btn-secondary" style="cursor: pointer;">
            ${getIcon('upload')}
            <span>Import JSON Backup</span>
            <input type="file" id="importFileInput" accept=".json" style="display: none;" />
          </label>

          <button class="btn btn-secondary" id="loadDemoDataBtn" type="button">
            ${getIcon('sparkles')}
            <span>Reload Sample Demo Habits</span>
          </button>
        </div>
      </section>

      <!-- Danger Zone -->
      <section class="card" style="border-color: rgba(239, 68, 68, 0.25);">
        <h3 style="font-size: 1.1rem; font-weight: 700; color: #ef4444; margin-bottom: 0.5rem;">Danger Zone</h3>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.25rem;">
          Permanently clear all habits, completions, and history to start with a fresh empty state.
        </p>

        <button class="btn btn-danger" id="clearAllDataBtn" type="button">
          ${getIcon('trash')}
          <span>Clear All Habits & Data</span>
        </button>
      </section>
    </div>
  `;

  // Category Handlers
  container.querySelector('#addCategorySettingBtn').addEventListener('click', () => {
    categoryModal.open(null);
  });

  container.querySelectorAll('[data-edit-cat]').forEach(btn => {
    btn.addEventListener('click', () => {
      const catId = btn.getAttribute('data-edit-cat');
      const cat = store.categories.find(c => c.id === catId);
      if (cat) categoryModal.open(cat);
    });
  });

  container.querySelectorAll('[data-delete-cat]').forEach(btn => {
    btn.addEventListener('click', () => {
      const catId = btn.getAttribute('data-delete-cat');
      const cat = store.categories.find(c => c.id === catId);
      if (cat && confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
        store.deleteCategory(catId);
      }
    });
  });

  // Theme Select Handler
  container.querySelector('#themeSelect').addEventListener('change', (e) => {
    store.updatePreferences({ theme: e.target.value });
    toast.show({ message: `Theme changed to ${e.target.value}`, type: 'info' });
  });

  // Sound Toggles
  container.querySelector('#soundToggle').addEventListener('change', (e) => {
    store.updatePreferences({ soundEnabled: e.target.checked });
  });

  container.querySelector('#celebrationToggle').addEventListener('change', (e) => {
    store.updatePreferences({ celebrationsEnabled: e.target.checked });
  });

  // Export JSON
  container.querySelector('#exportDataBtn').addEventListener('click', () => {
    const jsonStr = exportDataAsJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habitflow_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.show({ message: 'Backup file exported', type: 'success' });
  });

  // Import JSON
  container.querySelector('#importFileInput').addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const res = importDataFromJSON(event.target.result);
      if (res.success) {
        toast.show({ message: 'Backup imported successfully!', type: 'success' });
        setTimeout(() => window.location.reload(), 600);
      } else {
        toast.show({ message: `Import failed: ${res.error}`, type: 'error' });
      }
    };
    reader.readAsText(file);
  });

  // Load Demo Data
  container.querySelector('#loadDemoDataBtn').addEventListener('click', () => {
    if (confirm('Load demo sample habits and 45-day history?')) {
      store.resetAllData();
      store.setView('today');
    }
  });

  // Clear All Data
  container.querySelector('#clearAllDataBtn').addEventListener('click', () => {
    if (confirm('Are you sure you want to permanently clear ALL habits, categories, and logs? This cannot be undone.')) {
      store.clearToEmptyState();
      store.setView('today');
    }
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
