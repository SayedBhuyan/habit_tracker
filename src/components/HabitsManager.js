/**
 * Habits Manager View Component
 * Provides complete lifecycle management: reordering, pausing, archiving, and editing.
 */

import { store } from '../state/store.js';
import { getIcon } from '../utils/icons.js';
import { habitModal } from './HabitModal.js';
import { CATEGORIES } from '../models/types.js';
import { calculateHabitStreaks } from '../state/streakCalculator.js';

export function renderHabitsManager(container) {
  let activeTab = 'active'; // 'active' | 'paused' | 'archived'

  function render() {
    const allHabits = store.habits;
    const filteredHabits = allHabits.filter(h => {
      if (activeTab === 'active') return h.status === 'active' || !h.status;
      if (activeTab === 'paused') return h.status === 'paused';
      if (activeTab === 'archived') return h.status === 'archived';
      return true;
    });

    container.innerHTML = `
      <div class="view-transition-enter">
        <header class="view-header">
          <div>
            <h1 class="date-primary">Manage Habits</h1>
            <span class="date-subtitle">Organize, customize, and configure your routines</span>
          </div>

          <button class="btn btn-primary" id="mgrAddHabitBtn" type="button">
            ${getIcon('plus')}
            <span>New Habit</span>
          </button>
        </header>

        <!-- Status Filter Tabs -->
        <div class="mgr-tabs-container" role="tablist">
          <button class="mgr-tab-btn ${activeTab === 'active' ? 'active' : ''}" data-tab="active" type="button">
            Active (${allHabits.filter(h => (h.status === 'active' || !h.status)).length})
          </button>
          <button class="mgr-tab-btn ${activeTab === 'paused' ? 'active' : ''}" data-tab="paused" type="button">
            Paused (${allHabits.filter(h => h.status === 'paused').length})
          </button>
          <button class="mgr-tab-btn ${activeTab === 'archived' ? 'active' : ''}" data-tab="archived" type="button">
            Archived (${allHabits.filter(h => h.status === 'archived').length})
          </button>
        </div>

        <!-- Habits List -->
        <div class="habits-list" id="mgrHabitsList">
          ${filteredHabits.length === 0 ? `
            <div class="empty-state">
              <div class="empty-state-icon">
                ${getIcon('list')}
              </div>
              <h4 class="empty-state-title">No ${activeTab} habits found</h4>
              <p class="empty-state-text">
                ${activeTab === 'active' ? 'Create a new habit to start your journey.' : `You currently have no ${activeTab} habits.`}
              </p>
            </div>
          ` : ''}
        </div>
      </div>
    `;

    // Tab buttons
    container.querySelectorAll('[data-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        activeTab = btn.getAttribute('data-tab');
        render();
      });
    });

    // Add button
    container.querySelector('#mgrAddHabitBtn').addEventListener('click', () => {
      habitModal.open(null);
    });

    const list = container.querySelector('#mgrHabitsList');

    filteredHabits.forEach((habit, index) => {
      const item = document.createElement('div');
      item.className = 'mgr-habit-card list-item-enter';
      item.style.setProperty('--habit-color', habit.color);

      const { currentStreak, totalCompletions } = calculateHabitStreaks(habit, store.completions);
      const cat = store.categories.find(c => c.id === habit.category);

      item.innerHTML = `
        <div class="mgr-habit-main">
          <div class="habit-icon-badge" style="background: ${habit.color}20; color: ${habit.color};">
            ${getIcon(habit.icon || 'star')}
          </div>
          <div class="mgr-habit-info">
            <div class="mgr-habit-title">${escapeHtml(habit.name)}</div>
            <div class="mgr-habit-meta">
              <span class="mgr-meta-pill">🏷️ ${cat?.name || 'General'}</span>
              <span class="mgr-meta-pill">🔥 ${currentStreak}d streak</span>
              <span class="mgr-meta-pill">✅ ${totalCompletions} logs</span>
              ${habit.reminderTime ? `<span class="mgr-meta-pill">⏰ ${habit.reminderTime}</span>` : ''}
            </div>
          </div>
          <button class="btn btn-icon mgr-edit-btn" data-action="edit" title="Edit Habit" type="button" aria-label="Edit habit">
            ${getIcon('edit')}
          </button>
        </div>

        <div class="mgr-habit-actions">
          <div class="mgr-reorder-group">
            ${activeTab === 'active' ? `
              <button class="mgr-action-pill" data-action="up" title="Move Up" ${index === 0 ? 'disabled' : ''} type="button" aria-label="Move habit up">
                ${getIcon('arrow-up')} <span>Up</span>
              </button>
              <button class="mgr-action-pill" data-action="down" title="Move Down" ${index === filteredHabits.length - 1 ? 'disabled' : ''} type="button" aria-label="Move habit down">
                ${getIcon('arrow-down')} <span>Down</span>
              </button>
            ` : ''}
          </div>

          <div class="mgr-status-group">
            <button class="mgr-action-pill" data-action="pause" type="button" aria-label="${habit.status === 'paused' ? 'Resume habit' : 'Pause habit'}">
              ${getIcon(habit.status === 'paused' ? 'play' : 'pause')}
              <span>${habit.status === 'paused' ? 'Resume' : 'Pause'}</span>
            </button>

            <button class="mgr-action-pill" data-action="archive" type="button" aria-label="${habit.status === 'archived' ? 'Restore habit' : 'Archive habit'}">
              ${getIcon(habit.status === 'archived' ? 'rotate-ccw' : 'archive')}
              <span>${habit.status === 'archived' ? 'Restore' : 'Archive'}</span>
            </button>
          </div>
        </div>
      `;

      // Handlers
      item.querySelector('[data-action="edit"]').addEventListener('click', () => {
        habitModal.open(habit);
      });

      // Clicking main area also opens edit
      item.querySelector('.mgr-habit-info').addEventListener('click', () => {
        habitModal.open(habit);
      });

      item.querySelector('[data-action="pause"]').addEventListener('click', () => {
        store.togglePauseHabit(habit.id);
        render();
      });

      item.querySelector('[data-action="archive"]').addEventListener('click', () => {
        store.toggleArchiveHabit(habit.id);
        render();
      });

      const upBtn = item.querySelector('[data-action="up"]');
      const downBtn = item.querySelector('[data-action="down"]');

      if (upBtn && index > 0) {
        upBtn.addEventListener('click', () => {
          store.reorderHabits(habit.id, filteredHabits[index - 1].id);
          render();
        });
      }

      if (downBtn && index < filteredHabits.length - 1) {
        downBtn.addEventListener('click', () => {
          store.reorderHabits(habit.id, filteredHabits[index + 1].id);
          render();
        });
      }

      list.appendChild(item);
    });
  }

  render();
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
