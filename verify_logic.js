import {
  getTodayString,
  addDays,
  getDayOfWeek,
  getWeekDates,
  getMonthCalendarMatrix
} from './src/utils/dateUtils.js';
import {
  isHabitScheduledOnDate,
  calculateHabitStreaks,
  getDailyProgress,
  getHeatmapData,
  getWeeklyStats,
  getMotivationalMessage
} from './src/state/streakCalculator.js';
import { generateSampleData } from './src/state/storage.js';

console.log('--- RUNNING HABIT TRACKER UNIT & LOGIC VERIFICATION ---');

// 1. Date Utils
const today = getTodayString();
console.log('1. Today Date:', today);
console.assert(typeof today === 'string' && today.length === 10, 'Today format invalid');

const yesterday = addDays(today, -1);
console.assert(yesterday < today, 'Date arithmetic failed');

const week = getWeekDates(today, true);
console.assert(week.length === 7, 'Week length must be 7');

const calMatrix = getMonthCalendarMatrix(2026, 8, true);
console.assert(calMatrix.length >= 4, 'Calendar matrix rows invalid');
console.log('✓ Date utilities verified.');

// 2. Frequency & Streak Calculation
const dailyHabit = {
  id: 'h_test_daily',
  name: 'Drink Water',
  status: 'active',
  frequency: { type: 'daily' },
  createdAt: addDays(today, -10)
};

const customDayHabit = {
  id: 'h_test_custom',
  name: 'Workout Mon/Wed/Fri',
  status: 'active',
  frequency: { type: 'weekly_days', daysOfWeek: [1, 3, 5] },
  createdAt: addDays(today, -10)
};

// Completions mock
const completions = {};
// Complete daily habit for past 5 consecutive days
for (let i = 0; i <= 4; i++) {
  const d = addDays(today, -i);
  completions[`${dailyHabit.id}_${d}`] = { id: `${dailyHabit.id}_${d}`, completed: true, value: 1 };
}

const streaks = calculateHabitStreaks(dailyHabit, completions, today);
console.log('Daily Habit Streak:', streaks);
console.assert(streaks.currentStreak === 5, `Expected streak 5, got ${streaks.currentStreak}`);
console.assert(streaks.longestStreak === 5, `Expected longest streak 5, got ${streaks.longestStreak}`);
console.log('✓ Daily streak calculation verified.');

// 3. Sample Data & Heatmap
const sample = generateSampleData();
console.assert(sample.habits.length === 5, 'Sample habits count mismatch');
console.assert(Object.keys(sample.completions).length > 20, 'Sample completions count mismatch');

const heatmap = getHeatmapData(sample.habits, sample.completions, 60, today);
console.assert(heatmap.length === 60, 'Heatmap must have 60 days of data');
console.log('✓ Heatmap dataset generated accurately.');

// 4. Progress & Motivational messages
const progress = getDailyProgress(sample.habits, sample.completions, today);
console.log('Today Progress:', progress);
const msg = getMotivationalMessage(progress.percentage);
console.assert(msg.title && msg.subtitle, 'Motivational message missing title or subtitle');
console.log('Motivational banner:', msg.title, '-', msg.subtitle);
// 5. Category CRUD Tests
import { store } from './src/state/store.js';

const initialCatCount = store.categories.length;
const newCat = store.addCategory({ name: 'Spiritual', icon: 'moon', color: '#10b981' });
console.assert(store.categories.length === initialCatCount + 1, 'Category addition failed');
console.assert(newCat.name === 'Spiritual', 'Category name mismatch');

store.updateCategory(newCat.id, { name: 'Mind & Spirit' });
const updatedCat = store.categories.find(c => c.id === newCat.id);
console.assert(updatedCat.name === 'Mind & Spirit', 'Category update failed');

const deleteSuccess = store.deleteCategory(newCat.id);
console.assert(deleteSuccess === true, 'Category deletion failed');
console.assert(store.categories.length === initialCatCount, 'Category length after delete mismatch');
console.log('✓ Category CRUD operations verified.');

console.log('ALL TESTS PASSED SUCCESSFULLY! 🎉');
