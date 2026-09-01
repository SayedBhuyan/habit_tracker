/**
 * History & Calendar Log View Component
 * Enables retrospective inspection and frictionless backfill logging.
 */

import { store } from '../state/store.js';
import { getIcon } from '../utils/icons.js';
import {
  getTodayString,
  parseDateString,
  getMonthCalendarMatrix,
  formatFriendlyDate,
  formatDateString
} from '../utils/dateUtils.js';
import { getDailyProgress, isHabitScheduledOnDate } from '../state/streakCalculator.js';

export function renderHistoryView(container) {
  const selectedDate = store.selectedDate || getTodayString();
  const todayStr = getTodayString();
  const parsedDate = parseDateString(selectedDate);
  
  let historyYear = parsedDate.getFullYear();
  let historyMonth = parsedDate.getMonth(); // 0-indexed

  function render() {
    const matrix = getMonthCalendarMatrix(historyYear, historyMonth, true);
    const monthDate = new Date(historyYear, historyMonth, 1);
    const monthName = monthDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

    // Progress for selected history date
    const dayProgress = getDailyProgress(store.habits, store.completions, store.selectedDate);
    const dayHabits = store.habits.filter(h => isHabitScheduledOnDate(h, store.selectedDate));
    const isPastOrToday = store.selectedDate <= todayStr;

    container.innerHTML = `
      <div class="view-transition-enter">
        <header class="view-header">
          <div>
            <h1 class="date-primary">History & Calendar</h1>
            <span class="date-subtitle">Review previous days and backfill missed entries</span>
          </div>
        </header>

        <!-- Month Navigation Calendar Card -->
        <section class="card" style="margin-bottom: 1.5rem;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem;">
            <button class="btn btn-secondary btn-icon" id="prevMonthBtn" type="button" aria-label="Previous month">
              ${getIcon('chevron-left')}
            </button>
            <h3 style="font-size: 1.15rem; font-weight: 700;">${monthName}</h3>
            <button class="btn btn-secondary btn-icon" id="nextMonthBtn" type="button" aria-label="Next month">
              ${getIcon('chevron-right')}
            </button>
          </div>

          <!-- Days of Week Header -->
          <div style="display: grid; grid-template-columns: repeat(7, 1fr); text-align: center; font-size: 0.78rem; font-weight: 700; color: var(--text-muted); margin-bottom: 0.5rem;">
            <div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div><div>Sun</div>
          </div>

          <!-- Calendar Days Grid -->
          <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px;">
            ${matrix.map(week => week.map(dateStr => {
              if (!dateStr) {
                return `<div style="height: 44px;"></div>`;
              }

              const isSelected = dateStr === store.selectedDate;
              const isToday = dateStr === todayStr;
              const dateNum = parseDateString(dateStr).getDate();
              const p = getDailyProgress(store.habits, store.completions, dateStr);

              let dotColor = 'transparent';
              if (p.total > 0) {
                if (p.percentage === 100) dotColor = '#10b981';
                else if (p.percentage > 0) dotColor = 'var(--accent-primary)';
                else dotColor = 'var(--border-medium)';
              }

              return `
                <button 
                  type="button" 
                  class="cal-day-btn" 
                  data-date="${dateStr}"
                  style="
                    height: 46px;
                    min-width: 0;
                    padding: 0;
                    border-radius: var(--radius-sm);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 3px;
                    border: 1px solid ${isSelected ? 'var(--accent-primary)' : isToday ? 'var(--border-medium)' : 'transparent'};
                    background: ${isSelected ? 'var(--accent-primary-subtle)' : 'var(--bg-tertiary)'};
                    color: ${isSelected ? 'var(--accent-primary)' : 'var(--text-primary)'};
                    font-weight: ${isSelected || isToday ? '700' : '500'};
                    cursor: pointer;
                    touch-action: manipulation;
                    transition: all var(--duration-fast) ease;
                  "
                >
                  <span style="font-size: 0.88rem;">${dateNum}</span>
                  <div style="width: 5px; height: 5px; border-radius: 50%; background: ${dotColor};"></div>
                </button>
              `;
            }).join('')).join('')}
          </div>
        </section>

        <!-- Selected Date Detailed Breakdown & Backfill -->
        <section class="card">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 0.5rem;">
            <div>
              <h3 style="font-size: 1.15rem; font-weight: 700;">${formatFriendlyDate(store.selectedDate)}</h3>
              <span style="font-size: 0.85rem; color: var(--text-muted);">
                ${dayProgress.completed} of ${dayProgress.total} completed (${dayProgress.percentage}%)
              </span>
            </div>
            <span class="streak-badge" style="background: ${dayProgress.percentage === 100 ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-tertiary)'}; color: ${dayProgress.percentage === 100 ? '#10b981' : 'var(--text-secondary)'}; font-size: 0.85rem;">
              ${dayProgress.percentage === 100 ? '🎉 All Done' : `${dayProgress.percentage}% Done`}
            </span>
          </div>

          <div class="habits-list">
            ${dayHabits.length === 0 ? `
              <div style="text-align: center; padding: 1.5rem; color: var(--text-muted); font-size: 0.9rem;">
                No habits were scheduled on this date.
              </div>
            ` : ''}

            ${dayHabits.map(habit => {
              const k = `${habit.id}_${store.selectedDate}`;
              const isDone = !!store.completions[k]?.completed;
              return `
                <div style="
                  display: flex; 
                  align-items: center; 
                  justify-content: space-between; 
                  padding: 0.85rem 1rem; 
                  background: var(--bg-tertiary); 
                  border-radius: var(--radius-md);
                  border-left: 3px solid ${habit.color};
                  gap: 0.75rem;
                ">
                  <div style="display: flex; align-items: center; gap: 0.75rem; min-width: 0;">
                    <div class="habit-icon-badge" style="width: 2.25rem; height: 2.25rem; background: ${habit.color}20; color: ${habit.color};">
                      ${getIcon(habit.icon || 'star')}
                    </div>
                    <div style="min-width: 0;">
                      <div style="font-weight: 600; font-size: 0.95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: ${isDone ? 'var(--text-muted)' : 'var(--text-primary)'};">
                        ${escapeHtml(habit.name)}
                      </div>
                      <div style="font-size: 0.75rem; color: var(--text-muted);">
                        ${isDone ? '✅ Completed on this day' : (isPastOrToday ? '⚪ Missed / Pending' : '⚪ Upcoming')}
                      </div>
                    </div>
                  </div>

                  <button 
                    class="check-btn ${isDone ? 'checked' : ''}" 
                    data-habit-id="${habit.id}"
                    title="${isDone ? 'Uncheck' : 'Check'}"
                    type="button"
                    style="width: 2.35rem; height: 2.35rem;"
                  >
                    ${getIcon('check')}
                  </button>
                </div>
              `;
            }).join('')}
          </div>
        </section>
      </div>
    `;

    // Month navigation buttons
    container.querySelector('#prevMonthBtn').addEventListener('click', () => {
      if (historyMonth === 0) {
        historyMonth = 11;
        historyYear--;
      } else {
        historyMonth--;
      }
      // Update selected date to 1st of that month
      const mStr = String(historyMonth + 1).padStart(2, '0');
      store.setSelectedDate(`${historyYear}-${mStr}-01`);
      render();
    });

    container.querySelector('#nextMonthBtn').addEventListener('click', () => {
      if (historyMonth === 11) {
        historyMonth = 0;
        historyYear++;
      } else {
        historyMonth++;
      }
      // Update selected date to 1st of that month
      const mStr = String(historyMonth + 1).padStart(2, '0');
      store.setSelectedDate(`${historyYear}-${mStr}-01`);
      render();
    });

    // Calendar day selector
    container.querySelectorAll('.cal-day-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const d = btn.getAttribute('data-date');
        if (d) {
          store.setSelectedDate(d);
          render();
        }
      });
    });

    // Backfill Checkbox toggle buttons
    container.querySelectorAll('.check-btn[data-habit-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const hid = btn.getAttribute('data-habit-id');
        store.toggleCompletion(hid, store.selectedDate);
        render();
      });
    });
  }

  render();
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
