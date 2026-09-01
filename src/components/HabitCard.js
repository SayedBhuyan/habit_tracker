/**
 * Habit Card Component
 * Handles 1-tap completion, streak display, target stepper, and edit trigger.
 */

import { store } from '../state/store.js';
import { getIcon } from '../utils/icons.js';
import { calculateHabitStreaks } from '../state/streakCalculator.js';

export function createHabitCard(habit, dateStr, onEdit) {
  const card = document.createElement('div');
  const completionKey = `${habit.id}_${dateStr}`;
  const completion = store.completions[completionKey];
  const isCompleted = !!completion?.completed;
  const targetVal = habit.target?.enabled ? habit.target.value : 1;
  const currentVal = completion?.value ?? (isCompleted ? targetVal : 0);

  // Calculate streaks
  const { currentStreak } = calculateHabitStreaks(habit, store.completions, dateStr);

  card.className = `habit-card list-item-enter ${isCompleted ? 'completed' : ''}`;
  card.style.setProperty('--habit-color', habit.color);
  card.style.setProperty('--habit-color-subtle', `${habit.color}20`);

  let targetSubtitle = '';
  if (habit.target?.enabled) {
    targetSubtitle = `• Target: ${habit.target.value} ${habit.target.unit}`;
  }

  let scheduleSubtitle = '';
  if (habit.frequency?.type === 'weekly_days') {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const activeDays = (habit.frequency.daysOfWeek || []).map(d => days[d]).join(', ');
    scheduleSubtitle = `• ${activeDays}`;
  }

  card.innerHTML = `
    <div class="habit-icon-badge" title="${habit.category}">
      ${getIcon(habit.icon || 'star')}
    </div>

    <div class="habit-main-info">
      <div class="habit-name">${escapeHtml(habit.name)}</div>
      <div class="habit-meta">
        <span class="streak-badge ${currentStreak > 0 ? 'fire-active' : ''}">
          ${getIcon('flame')}
          ${currentStreak} ${currentStreak === 1 ? 'day' : 'days'}
        </span>
        ${habit.reminderTime ? `<span>• ⏰ ${habit.reminderTime}</span>` : ''}
        ${targetSubtitle ? `<span>${targetSubtitle}</span>` : ''}
        ${scheduleSubtitle ? `<span>${scheduleSubtitle}</span>` : ''}
      </div>
    </div>

    ${habit.target?.enabled ? `
      <div class="stepper-control" onclick="event.stopPropagation()">
        <button class="stepper-btn" data-action="decrement" title="Decrement" type="button" aria-label="Decrease progress">−</button>
        <span class="stepper-val">${currentVal} / ${targetVal} <small>${habit.target.unit}</small></span>
        <button class="stepper-btn" data-action="increment" title="Increment" type="button" aria-label="Increase progress">+</button>
      </div>
    ` : ''}

    <button 
      class="check-btn ${isCompleted ? 'checked' : ''}" 
      title="${isCompleted ? 'Mark Incomplete' : 'Mark Complete'}"
      type="button"
      aria-label="Toggle habit completion"
    >
      ${getIcon('check')}
    </button>
  `;

  // 1-tap Check Toggle handler
  const checkBtn = card.querySelector('.check-btn');
  checkBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    store.toggleCompletion(habit.id, dateStr);
  });

  // Target Stepper handlers
  if (habit.target?.enabled) {
    const decBtn = card.querySelector('[data-action="decrement"]');
    const incBtn = card.querySelector('[data-action="increment"]');
    const step = habit.target.step || 1;

    decBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const nextVal = Math.max(0, currentVal - step);
      store.setCompletionValue(habit.id, dateStr, nextVal);
    });

    incBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const nextVal = currentVal + step;
      store.setCompletionValue(habit.id, dateStr, nextVal);
    });
  }

  // Click card to open edit modal
  card.addEventListener('click', (e) => {
    if (!e.target.closest('button') && !e.target.closest('.stepper-control')) {
      if (onEdit) onEdit(habit);
    }
  });

  return card;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
