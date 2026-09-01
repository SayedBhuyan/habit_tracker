/**
 * Habit detail modal with per-day notes and a habit calendar view
 */

import { store } from '../state/store.js';
import { getIcon } from '../utils/icons.js';
import {
  getTodayString,
  parseDateString,
  getMonthCalendarMatrix,
  formatFriendlyDate,
  addDays
} from '../utils/dateUtils.js';
import { isHabitScheduledOnDate } from '../state/streakCalculator.js';

export class HabitDetailModal {
  constructor() {
    this.overlay = null;
    this.habit = null;
    this.selectedDate = getTodayString();
    this.viewMonth = getTodayString().slice(0, 7) + '-01';
    this.init();
  }

  init() {
    if (typeof document === 'undefined') return;

    this.overlay = document.createElement('div');
    this.overlay.className = 'modal-overlay';
    this.overlay.setAttribute('role', 'dialog');
    this.overlay.setAttribute('aria-modal', 'true');
    this.overlay.innerHTML = `
      <div class="modal-content" style="max-width: 760px;">
        <div class="sheet-drag-handle" aria-hidden="true"></div>
        <div class="modal-header">
          <h2 class="modal-title" id="habitDetailTitle">Habit Details</h2>
          <button class="btn btn-ghost btn-icon" id="closeHabitDetailBtn" type="button" aria-label="Close modal">
            ${getIcon('x')}
          </button>
        </div>

        <div id="habitDetailContent"></div>
      </div>
    `;

    document.body.appendChild(this.overlay);
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });
    this.overlay.querySelector('#closeHabitDetailBtn').addEventListener('click', () => this.close());
  }

  open(habit, dateStr = getTodayString()) {
    this.habit = habit;
    this.selectedDate = dateStr;
    this.viewMonth = `${dateStr.slice(0, 7)}-01`;
    this.render();
    this.overlay.classList.add('active');
  }

  close() {
    this.overlay.classList.remove('active');
    this.habit = null;
  }

  render() {
    if (!this.habit) return;

    const completionKey = `${this.habit.id}_${this.selectedDate}`;
    const completion = store.completions[completionKey] || {};
    const note = completion.note || '';
    const isDone = !!completion.completed;
    const monthDate = parseDateString(this.viewMonth);
    const monthName = monthDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    const matrix = getMonthCalendarMatrix(monthDate.getFullYear(), monthDate.getMonth(), true);

    const dayTotals = [];
    for (let i = 0; i < 7; i++) {
      const date = addDays(this.selectedDate, -i);
      const key = `${this.habit.id}_${date}`;
      dayTotals.push({ date, done: !!store.completions[key]?.completed, note: !!store.completions[key]?.note });
    }

    let currentStreak = 0;
    let cursor = this.selectedDate;
    while (isHabitScheduledOnDate(this.habit, cursor) && !!store.completions[`${this.habit.id}_${cursor}`]?.completed) {
      currentStreak += 1;
      cursor = addDays(cursor, -1);
    }

    let longestStreak = 0;
    let tempStreak = 0;
    let scanDate = this.habit.createdAt || addDays(this.selectedDate, -180);
    while (scanDate <= this.selectedDate) {
      if (isHabitScheduledOnDate(this.habit, scanDate)) {
        const value = !!store.completions[`${this.habit.id}_${scanDate}`]?.completed;
        if (value) {
          tempStreak += 1;
          longestStreak = Math.max(longestStreak, tempStreak);
        } else {
          tempStreak = 0;
        }
      }
      scanDate = addDays(scanDate, 1);
    }

    const content = document.getElementById('habitDetailContent');
    if (!content) return;

    content.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 1.25rem;">
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap;">
          <div style="display: flex; align-items: center; gap: 0.8rem; min-width: 0;">
            <div class="habit-icon-badge" style="width: 2.8rem; height: 2.8rem; background: ${this.habit.color}20; color: ${this.habit.color};">
              ${getIcon(this.habit.icon || 'star')}
            </div>
            <div>
              <div style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary);">${escapeHtml(this.habit.name)}</div>
              <div style="font-size: 0.8rem; color: var(--text-muted);">${formatFriendlyDate(this.selectedDate)}</div>
            </div>
          </div>

          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <span class="streak-badge" style="background: rgba(249, 115, 22, 0.12); color: #f97316;">🔥 ${currentStreak}d streak</span>
            <span class="streak-badge" style="background: var(--bg-tertiary); color: var(--text-secondary);">Best ${longestStreak}d</span>
          </div>
        </div>

        <div class="card" style="padding: 1rem;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; margin-bottom: 0.75rem; flex-wrap: wrap;">
            <div>
              <h3 style="font-size: 1rem; font-weight: 700; margin: 0;">Day status</h3>
              <div style="font-size: 0.79rem; color: var(--text-muted); margin-top: 0.2rem;">
                ${isDone ? 'Completed' : 'Not completed'}${note ? ' • Note saved' : ''}
              </div>
            </div>
            <button class="btn btn-secondary" type="button" data-modal-toggle-complete>
              ${isDone ? 'Mark Incomplete' : 'Mark Complete'}
            </button>
          </div>

          <label style="display: block; margin-bottom: 0.5rem; font-size: 0.8rem; font-weight: 700; color: var(--text-secondary);">Notes for this date</label>
          <textarea id="habitNoteInput" rows="5" style="width: 100%; resize: vertical; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); background: var(--bg-secondary); color: var(--text-primary); padding: 0.8rem 0.9rem; font: inherit;" placeholder="Add a note for this habit on ${formatFriendlyDate(this.selectedDate)}...">${escapeHtml(note)}</textarea>
          <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 0.75rem;">
            <button class="btn btn-secondary" type="button" data-modal-clear-note>Clear Note</button>
            <button class="btn btn-primary" type="button" data-modal-save-note>Save Note</button>
          </div>
        </div>

        <div class="card" style="padding: 1rem;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; gap: 0.75rem;">
            <h3 style="font-size: 1rem; font-weight: 700; margin: 0;">${monthName} overview</h3>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <button class="btn btn-secondary btn-icon" type="button" id="habitDetailPrevMonth" aria-label="Previous month">${getIcon('chevron-left')}</button>
              <button class="btn btn-secondary btn-icon" type="button" id="habitDetailNextMonth" aria-label="Next month">${getIcon('chevron-right')}</button>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); text-align: center; font-size: 0.78rem; font-weight: 700; color: var(--text-muted); margin-bottom: 0.5rem; gap: 0.35rem;">
            <div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div><div>Sun</div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 0.35rem;">
            ${matrix.map(week => week.map(dateStr => {
              if (!dateStr) return '<div style="height: 52px;"></div>';

              const key = `${this.habit.id}_${dateStr}`;
              const done = !!store.completions[key]?.completed;
              const hasNote = !!store.completions[key]?.note;
              const selected = dateStr === this.selectedDate;
              const today = dateStr === getTodayString();
              const streakValue = getLocalStreakValue(this.habit, dateStr);

              const bg = selected ? 'var(--accent-primary-subtle)' : done ? 'rgba(16, 185, 129, 0.12)' : hasNote ? 'rgba(245, 158, 11, 0.12)' : 'var(--bg-tertiary)';
              const border = selected ? '1px solid var(--accent-primary)' : done ? '1px solid rgba(16, 185, 129, 0.35)' : hasNote ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid transparent';

              return `
                <button
                  type="button"
                  class="habit-detail-day"
                  data-date="${dateStr}"
                  style="height: 52px; border-radius: var(--radius-sm); background: ${bg}; border: ${border}; color: ${selected ? 'var(--accent-primary)' : 'var(--text-primary)'}; position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; font-weight: ${selected || today ? 700 : 500};">
                  <span style="font-size: 0.82rem;">${parseDateString(dateStr).getDate()}</span>
                  <span style="font-size: 0.64rem; line-height: 1; opacity: 0.9;">
                    ${done ? '✓' : hasNote ? '✎' : streakValue > 0 ? `🔥${Math.min(streakValue, 9)}` : ''}
                  </span>
                </button>
              `;
            }).join('')).join('')}
          </div>
        </div>
      </div>
    `;

    const noteInput = content.querySelector('#habitNoteInput');
    const saveBtn = content.querySelector('[data-modal-save-note]');
    const clearBtn = content.querySelector('[data-modal-clear-note]');
    const toggleDoneBtn = content.querySelector('[data-modal-toggle-complete]');
    const prevMonthBtn = content.querySelector('#habitDetailPrevMonth');
    const nextMonthBtn = content.querySelector('#habitDetailNextMonth');

    saveBtn.addEventListener('click', () => {
      const value = noteInput.value;
      store.setHabitNote(this.habit.id, this.selectedDate, value);
      this.render();
    });

    clearBtn.addEventListener('click', () => {
      store.setHabitNote(this.habit.id, this.selectedDate, '');
      this.render();
    });

    toggleDoneBtn.addEventListener('click', () => {
      store.toggleCompletion(this.habit.id, this.selectedDate);
      this.render();
    });

    prevMonthBtn.addEventListener('click', () => {
      const date = parseDateString(this.viewMonth);
      date.setMonth(date.getMonth() - 1);
      this.viewMonth = formatMonthKey(date);
      this.selectedDate = `${this.viewMonth.slice(0, 7)}-01`;
      this.render();
    });

    nextMonthBtn.addEventListener('click', () => {
      const date = parseDateString(this.viewMonth);
      date.setMonth(date.getMonth() + 1);
      this.viewMonth = formatMonthKey(date);
      this.selectedDate = `${this.viewMonth.slice(0, 7)}-01`;
      this.render();
    });

    content.querySelectorAll('[data-date]').forEach(btn => {
      btn.addEventListener('click', () => {
        const d = btn.getAttribute('data-date');
        if (d) {
          this.selectedDate = d;
          this.viewMonth = `${d.slice(0, 7)}-01`;
          this.render();
        }
      });
    });
  }
}

function getLocalStreakValue(habit, dateStr) {
  if (!habit || !isHabitScheduledOnDate(habit, dateStr)) return 0;
  if (!store.completions[`${habit.id}_${dateStr}`]?.completed) return 0;

  let count = 0;
  let cursor = dateStr;
  while (isHabitScheduledOnDate(habit, cursor) && !!store.completions[`${habit.id}_${cursor}`]?.completed) {
    count += 1;
    cursor = addDays(cursor, -1);
  }
  return count;
}

function formatMonthKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}-01`;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

export const habitDetailModal = new HabitDetailModal();
