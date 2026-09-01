/**
 * Statistics & Analytics View Component
 * Renders 60-day heatmap, metric cards, weekly consistency distribution, and per-habit breakdowns.
 */

import { store } from '../state/store.js';
import { getIcon } from '../utils/icons.js';
import {
  getTodayString,
  addDays,
  formatShortDate,
  formatFriendlyDate
} from '../utils/dateUtils.js';
import {
  calculateHabitStreaks,
  getHeatmapData,
  getWeeklyStats,
  getDailyProgress
} from '../state/streakCalculator.js';

export function renderStatsView(container) {
  const habits = store.habits;
  const completions = store.completions;
  const todayStr = getTodayString();

  // Aggregate Metrics
  let bestCurrentStreak = 0;
  let allTimeLongestStreak = 0;
  let totalCompletionsCount = 0;

  habits.forEach(h => {
    const s = calculateHabitStreaks(h, completions, todayStr);
    if (s.currentStreak > bestCurrentStreak) bestCurrentStreak = s.currentStreak;
    if (s.longestStreak > allTimeLongestStreak) allTimeLongestStreak = s.longestStreak;
    totalCompletionsCount += s.totalCompletions;
  });

  // Calculate 30-day global completion rate
  let total30DayScheduled = 0;
  let total30DayCompleted = 0;
  for (let i = 29; i >= 0; i--) {
    const d = addDays(todayStr, -i);
    const p = getDailyProgress(habits, completions, d);
    total30DayScheduled += p.total;
    total30DayCompleted += p.completed;
  }
  const global30DayRate = total30DayScheduled > 0
    ? Math.round((total30DayCompleted / total30DayScheduled) * 100)
    : 0;

  // Heatmap data for last 60 days
  const heatmapCells = getHeatmapData(habits, completions, 60, todayStr);

  // Weekly Mon-Sun distribution
  const weeklyStats = getWeeklyStats(habits, completions, todayStr);
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  container.innerHTML = `
    <div class="view-transition-enter">
      <header class="view-header">
        <div>
          <h1 class="date-primary">Progress & Analytics</h1>
          <span class="date-subtitle">Understand your patterns and visualize your consistency</span>
        </div>
      </header>

      <!-- Key Metrics 4-Grid -->
      <section class="stats-metrics-grid">
        <div class="metric-card">
          <div class="metric-label">Current Best Streak</div>
          <div class="metric-value" style="color: var(--accent-flame); display: flex; align-items: center; gap: 0.3rem;">
            ${getIcon('flame')}
            ${bestCurrentStreak} <small style="font-size: 0.9rem; font-weight: 500;">days</small>
          </div>
          <div class="metric-sub">Active continuous streak</div>
        </div>

        <div class="metric-card">
          <div class="metric-label">All-Time Longest</div>
          <div class="metric-value" style="color: #10b981; display: flex; align-items: center; gap: 0.3rem;">
            ${getIcon('award')}
            ${allTimeLongestStreak} <small style="font-size: 0.9rem; font-weight: 500;">days</small>
          </div>
          <div class="metric-sub">Personal record</div>
        </div>

        <div class="metric-card">
          <div class="metric-label">30-Day Consistency</div>
          <div class="metric-value" style="color: var(--accent-primary);">
            ${global30DayRate}%
          </div>
          <div class="metric-sub">${total30DayCompleted} of ${total30DayScheduled} habits done</div>
        </div>

        <div class="metric-card">
          <div class="metric-label">Total Check-ins</div>
          <div class="metric-value" style="color: #ec4899;">
            ${totalCompletionsCount}
          </div>
          <div class="metric-sub">Lifetime completed tasks</div>
        </div>
      </section>

      <!-- 60-Day Activity Heatmap -->
      <section class="card" style="margin-bottom: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <div>
            <h3 style="font-size: 1.1rem; font-weight: 700;">Activity Heatmap</h3>
            <span style="font-size: 0.8rem; color: var(--text-muted);">Last 60 days of consistency</span>
          </div>
          <div style="display: flex; align-items: center; gap: 0.3rem; font-size: 0.75rem; color: var(--text-muted);">
            <span>Less</span>
            <div class="heatmap-cell" data-level="0" style="width:10px; height:10px;"></div>
            <div class="heatmap-cell" data-level="1" style="width:10px; height:10px;"></div>
            <div class="heatmap-cell" data-level="2" style="width:10px; height:10px;"></div>
            <div class="heatmap-cell" data-level="3" style="width:10px; height:10px;"></div>
            <div class="heatmap-cell" data-level="4" style="width:10px; height:10px;"></div>
            <span>More</span>
          </div>
        </div>

        <div class="heatmap-container">
          <div class="heatmap-grid" id="heatmapGrid">
            ${heatmapCells.map(c => `
              <div 
                class="heatmap-cell" 
                data-level="${c.level}" 
                data-date="${c.date}"
                data-percentage="${c.percentage}"
                data-completed="${c.completed}"
                data-total="${c.total}"
                title="${formatShortDate(c.date)}: ${c.completed}/${c.total} completed (${c.percentage}%)"
              ></div>
            `).join('')}
          </div>
        </div>

        <div id="heatmapSelectedInfo" style="margin-top: 0.75rem; font-size: 0.85rem; color: var(--text-secondary); text-align: center;">
          Hover or tap any square to inspect that day
        </div>
      </section>

      <!-- Weekly Distribution Bar Chart -->
      <section class="card" style="margin-bottom: 1.5rem;">
        <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.25rem;">Weekly Consistency</h3>
        <span style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-bottom: 1.25rem;">
          Completion rate for each day of the current week (Avg: ${weeklyStats.overallRate}%)
        </span>

        <div style="display: flex; justify-content: space-between; align-items: flex-end; height: 140px; padding-top: 1rem;">
          ${weeklyStats.dayStats.map((ds, idx) => {
            const isToday = ds.date === todayStr;
            const barHeight = Math.max(8, ds.percentage);
            return `
              <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
                <span style="font-size: 0.75rem; font-weight: 700; color: ${isToday ? 'var(--accent-primary)' : 'var(--text-muted)'};">
                  ${ds.percentage}%
                </span>
                <div style="width: 28px; height: 100px; background: var(--bg-tertiary); border-radius: var(--radius-sm); position: relative; overflow: hidden; display: flex; align-items: flex-end;">
                  <div style="
                    width: 100%; 
                    height: ${barHeight}%; 
                    background: ${isToday ? 'linear-gradient(to top, #4f46e5, #818cf8)' : 'linear-gradient(to top, #10b981, #34d399)'}; 
                    border-radius: var(--radius-sm);
                    transition: height 0.6s var(--ease-smooth);
                  "></div>
                </div>
                <span style="font-size: 0.78rem; font-weight: 600; color: ${isToday ? 'var(--accent-primary)' : 'var(--text-secondary)'};">
                  ${dayNames[idx]}
                </span>
              </div>
            `;
          }).join('')}
        </div>
      </section>

      <!-- Habit by Habit Breakdown -->
      <section class="card">
        <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 1rem;">Habit Breakdown</h3>
        <div style="display: flex; flex-direction: column; gap: 0.85rem;">
          ${habits.filter(h => h.status !== 'archived').map(habit => {
            const s = calculateHabitStreaks(habit, completions, todayStr);
            return `
              <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem; background: var(--bg-tertiary); border-radius: var(--radius-md); gap: 0.75rem;">
                <div style="display: flex; align-items: center; gap: 0.75rem; min-width: 0;">
                  <div class="habit-icon-badge" style="width: 2.25rem; height: 2.25rem; background: ${habit.color}20; color: ${habit.color};">
                    ${getIcon(habit.icon || 'star')}
                  </div>
                  <div style="min-width: 0;">
                    <div style="font-weight: 600; font-size: 0.95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                      ${escapeHtml(habit.name)}
                    </div>
                    <div style="font-size: 0.78rem; color: var(--text-muted);">
                      Total: ${s.totalCompletions} completions
                    </div>
                  </div>
                </div>

                <div style="display: flex; align-items: center; gap: 1rem; flex-shrink: 0;">
                  <div style="text-align: right;">
                    <span class="streak-badge ${s.currentStreak > 0 ? 'fire-active' : ''}">
                      ${getIcon('flame')} ${s.currentStreak}d
                    </span>
                    <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 0.1rem;">
                      Best: ${s.longestStreak}d
                    </div>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </section>
    </div>
  `;

  // Attach heatmap hover events
  const infoEl = container.querySelector('#heatmapSelectedInfo');
  container.querySelectorAll('.heatmap-cell').forEach(cell => {
    cell.addEventListener('mouseenter', () => {
      const d = cell.getAttribute('data-date');
      const comp = cell.getAttribute('data-completed');
      const tot = cell.getAttribute('data-total');
      const pct = cell.getAttribute('data-percentage');
      if (d) {
        infoEl.innerHTML = `<strong>${formatFriendlyDate(d)}</strong>: ${comp} of ${tot} habits completed (${pct}%)`;
      }
    });

    cell.addEventListener('click', () => {
      const d = cell.getAttribute('data-date');
      if (d) {
        store.setSelectedDate(d);
        store.setView('history');
      }
    });
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
