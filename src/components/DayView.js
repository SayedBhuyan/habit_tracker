/**
 * Today / Day Dashboard View Component
 */

import { store } from '../state/store.js';
import { getIcon } from '../utils/icons.js';
import { createHabitCard } from './HabitCard.js';
import { habitModal } from './HabitModal.js';
import { CATEGORIES } from '../models/types.js';
import {
  getTodayString,
  addDays,
  getRelativeDayLabel,
  formatFriendlyDate
} from '../utils/dateUtils.js';
import {
  getDailyProgress,
  getMotivationalMessage
} from '../state/streakCalculator.js';
import { habitDetailModal } from './HabitDetailModal.js';

export function renderDayView(container) {
  const selectedDate = store.selectedDate;
  const todayStr = getTodayString();
  const isToday = selectedDate === todayStr;

  const progress = getDailyProgress(store.habits, store.completions, selectedDate);
  const motivational = getMotivationalMessage(progress.percentage);
  const isBannerVisible = store.preferences.progressBannerEnabled !== false;

  // Filter scheduled habits by category if selected
  let displayedHabits = progress.scheduledHabits;
  if (store.categoryFilter !== 'all') {
    displayedHabits = displayedHabits.filter(h => h.category === store.categoryFilter);
  }

  // Progress ring circumference: r = 36 -> C = 2 * PI * 36 ~= 226.19
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (circumference * progress.percentage) / 100;

  container.innerHTML = `
    <div class="view-transition-enter">
      <!-- Header with Date Navigator -->
      <header class="view-header">
        <div class="date-navigator">
          <button class="btn btn-secondary btn-icon" id="prevDayBtn" title="Previous Day" type="button" aria-label="Previous day">
            ${getIcon('chevron-left')}
          </button>
          
          <div class="date-title-group">
            <span class="date-subtitle">${formatFriendlyDate(selectedDate)}</span>
            <div class="date-primary">
              <span>${getRelativeDayLabel(selectedDate)}</span>
              ${!isToday ? `
                <button class="btn btn-secondary" id="jumpTodayBtn" style="padding: 0.2rem 0.6rem; font-size: 0.75rem; border-radius: var(--radius-full);" type="button">
                  Back to Today
                </button>
              ` : ''}
            </div>
          </div>

          <button class="btn btn-secondary btn-icon" id="nextDayBtn" title="Next Day" type="button" aria-label="Next day">
            ${getIcon('chevron-right')}
          </button>
        </div>

        <button class="btn btn-primary" id="addHabitBtn" type="button">
          ${getIcon('plus')}
          <span>New Habit</span>
        </button>
      </header>

      <!-- Category Filter Pills -->
      <section style="margin: 1.5rem 0 1rem 0;">
        <div class="category-pills" role="tablist">
          <button 
            class="pill-btn ${store.categoryFilter === 'all' ? 'active' : ''}" 
            data-cat="all"
            type="button"
          >
            All Habits (${progress.scheduledHabits.length})
          </button>
          ${store.categories.map(cat => {
            const count = progress.scheduledHabits.filter(h => h.category === cat.id).length;
            if (count === 0 && store.categoryFilter !== cat.id) return '';
            return `
              <button 
                class="pill-btn ${store.categoryFilter === cat.id ? 'active' : ''}" 
                data-cat="${cat.id}"
                type="button"
              >
                ${cat.name} (${count})
              </button>
            `;
          }).join('')}
        </div>
      </section>

      <div class="section-header">
        <h3 class="section-title">Today's Habits</h3>
      </div>

      ${isBannerVisible ? `
        <section class="progress-banner" aria-label="Daily Progress" style="margin-top: 0.5rem; margin-bottom: 1rem;">
          <div class="progress-banner-info">
            <h2 class="progress-banner-title">${motivational.title}</h2>
            <p class="progress-banner-sub">${motivational.subtitle}</p>
          </div>

          <div class="progress-ring-wrap">
            <svg class="progress-ring-svg" viewBox="0 0 84 84">
              <circle class="progress-ring-bg" cx="42" cy="42" r="${radius}" />
              <circle 
                class="progress-ring-fill" 
                cx="42" 
                cy="42" 
                r="${radius}" 
                stroke-dasharray="${circumference}" 
                stroke-dashoffset="${strokeOffset}" 
              />
            </svg>
            <div class="progress-ring-text">${progress.percentage}%</div>
          </div>
        </section>
      ` : ''}

      <!-- Habits List or Empty State -->
      <div class="habits-list" id="habitsListContainer"></div>
    </div>
  `;

  // Attach Header event listeners
  const prevBtn = container.querySelector('#prevDayBtn');
  const nextBtn = container.querySelector('#nextDayBtn');
  const jumpTodayBtn = container.querySelector('#jumpTodayBtn');
  const addHabitBtn = container.querySelector('#addHabitBtn');

  prevBtn.addEventListener('click', () => {
    store.setSelectedDate(addDays(selectedDate, -1));
  });

  nextBtn.addEventListener('click', () => {
    store.setSelectedDate(addDays(selectedDate, 1));
  });

  if (jumpTodayBtn) {
    jumpTodayBtn.addEventListener('click', () => {
      store.setSelectedDate(todayStr);
    });
  }

  addHabitBtn.addEventListener('click', () => {
    habitModal.open(null);
  });

  // Category filter handlers
  container.querySelectorAll('.pill-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.getAttribute('data-cat');
      store.setCategoryFilter(cat);
    });
  });

  // Render habit cards or empty state
  const listContainer = container.querySelector('#habitsListContainer');
  if (displayedHabits.length === 0) {
    if (store.habits.length === 0) {
      listContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">
            ${getIcon('sparkles')}
          </div>
          <h4 class="empty-state-title">Build your first routine</h4>
          <p class="empty-state-text">
            Start with one small habit. Consistency matters far more than perfection.
          </p>
          <button class="btn btn-primary" id="emptyStateAddBtn" style="margin-top: 0.5rem;" type="button">
            ${getIcon('plus')}
            <span>Create Your First Habit</span>
          </button>
        </div>
      `;
      listContainer.querySelector('#emptyStateAddBtn').addEventListener('click', () => {
        habitModal.open(null);
      });
    } else {
      listContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">
            ${getIcon('calendar')}
          </div>
          <h4 class="empty-state-title">No habits scheduled for this day</h4>
          <p class="empty-state-text">
            Enjoy your rest or add a new habit to keep the momentum going.
          </p>
        </div>
      `;
    }
  } else {
    displayedHabits.forEach(habit => {
      const card = createHabitCard(habit, selectedDate, (h) => {
        habitDetailModal.open(h, selectedDate);
      });
      listContainer.appendChild(card);
    });
  }
}
