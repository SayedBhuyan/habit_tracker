/**
 * Date Utilities for Habit Tracker
 * Standardized ISO 'YYYY-MM-DD' format ensures reliable local timezone calculation.
 */

export function getTodayString() {
  const now = new Date();
  return formatDateString(now);
}

export function formatDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateString(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(dateStr, days) {
  const date = parseDateString(dateStr);
  date.setDate(date.getDate() + days);
  return formatDateString(date);
}

export function getDayOfWeek(dateStr) {
  return parseDateString(dateStr).getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
}

export function getRelativeDayLabel(dateStr) {
  const today = getTodayString();
  const yesterday = addDays(today, -1);
  const tomorrow = addDays(today, 1);

  if (dateStr === today) return 'Today';
  if (dateStr === yesterday) return 'Yesterday';
  if (dateStr === tomorrow) return 'Tomorrow';

  const date = parseDateString(dateStr);
  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

export function formatFriendlyDate(dateStr) {
  const date = parseDateString(dateStr);
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function formatShortDate(dateStr) {
  const date = parseDateString(dateStr);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/**
 * Returns an array of date strings for the week containing the specified date.
 * startOnMonday: default true
 */
export function getWeekDates(dateStr = getTodayString(), startOnMonday = true) {
  const date = parseDateString(dateStr);
  const day = date.getDay();
  // Adjust distance to start day
  const diff = startOnMonday ? (day === 0 ? -6 : 1 - day) : -day;
  
  const monday = new Date(date);
  monday.setDate(date.getDate() + diff);

  const week = [];
  for (let i = 0; i < 7; i++) {
    const current = new Date(monday);
    current.setDate(monday.getDate() + i);
    week.push(formatDateString(current));
  }
  return week;
}

/**
 * Returns the last N days as array of date strings (e.g. for heatmap)
 */
export function getLastNDays(n = 60, endDateStr = getTodayString()) {
  const dates = [];
  for (let i = n - 1; i >= 0; i--) {
    dates.push(addDays(endDateStr, -i));
  }
  return dates;
}

/**
 * Returns calendar matrix for a given month
 */
export function getMonthCalendarMatrix(year, month, startOnMonday = true) {
  // month is 0-indexed
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay(); // 0 is Sunday

  const offset = startOnMonday ? (startDayOfWeek === 0 ? 6 : startDayOfWeek - 1) : startDayOfWeek;

  const matrix = [];
  let currentWeek = [];

  // Fill preceding empty days
  for (let i = 0; i < offset; i++) {
    currentWeek.push(null);
  }

  // Fill month days
  for (let d = 1; d <= daysInMonth; d++) {
    const monthStr = String(month + 1).padStart(2, '0');
    const dayStr = String(d).padStart(2, '0');
    currentWeek.push(`${year}-${monthStr}-${dayStr}`);

    if (currentWeek.length === 7) {
      matrix.push(currentWeek);
      currentWeek = [];
    }
  }

  // Fill trailing empty days
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    matrix.push(currentWeek);
  }

  return matrix;
}
