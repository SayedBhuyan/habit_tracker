/**
 * LocalStorage persistence, seed data generator, and export/import helpers
 */

import { DEFAULT_PREFERENCES, DEFAULT_CATEGORIES } from '../models/types.js';
import { getTodayString, addDays } from '../utils/dateUtils.js';

const STORAGE_KEYS = {
  PREFERENCES: 'habit_tracker_prefs_v1',
  HABITS: 'habit_tracker_habits_v1',
  COMPLETIONS: 'habit_tracker_completions_v1',
  CATEGORIES: 'habit_tracker_categories_v1'
};

export function loadCategories() {
  try {
    if (typeof localStorage === 'undefined') return DEFAULT_CATEGORIES;
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return raw ? JSON.parse(raw) : DEFAULT_CATEGORIES;
  } catch (e) {
    console.error('Failed to load categories:', e);
    return DEFAULT_CATEGORIES;
  }
}

export function saveCategories(categories) {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  } catch (e) {
    console.error('Failed to save categories:', e);
  }
}

export function loadPreferences() {
  try {
    if (typeof localStorage === 'undefined') return { ...DEFAULT_PREFERENCES };
    const raw = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    return raw ? { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) } : { ...DEFAULT_PREFERENCES };
  } catch (e) {
    console.error('Failed to load preferences from storage:', e);
    return { ...DEFAULT_PREFERENCES };
  }
}

export function savePreferences(prefs) {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(prefs));
  } catch (e) {
    console.error('Failed to save preferences:', e);
  }
}

export function loadHabits() {
  try {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(STORAGE_KEYS.HABITS);
    if (!raw) return null; // indicates first time load
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load habits:', e);
    return [];
  }
}

export function saveHabits(habits) {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
  } catch (e) {
    console.error('Failed to save habits:', e);
  }
}

export function loadCompletions() {
  try {
    if (typeof localStorage === 'undefined') return {};
    const raw = localStorage.getItem(STORAGE_KEYS.COMPLETIONS);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error('Failed to load completions:', e);
    return {};
  }
}

export function saveCompletions(completions) {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.COMPLETIONS, JSON.stringify(completions));
  } catch (e) {
    console.error('Failed to save completions:', e);
  }
}

/**
 * Generates sample demo habits with realistic history over the past 45 days
 */
export function generateSampleData() {
  const today = getTodayString();
  const thirtyDaysAgo = addDays(today, -45);

  const sampleHabits = [
    {
      id: 'h_water_01',
      name: 'Drink 2L Water',
      icon: 'droplet',
      category: 'health',
      color: '#06b6d4',
      frequency: { type: 'daily' },
      target: { enabled: true, value: 2000, unit: 'ml', step: 250 },
      reminderTime: '09:00',
      status: 'active',
      order: 0,
      createdAt: thirtyDaysAgo
    },
    {
      id: 'h_read_02',
      name: 'Read 20 Mins',
      icon: 'book-open',
      category: 'learning',
      color: '#6366f1',
      frequency: { type: 'daily' },
      target: { enabled: true, value: 20, unit: 'mins', step: 5 },
      reminderTime: '21:00',
      status: 'active',
      order: 1,
      createdAt: thirtyDaysAgo
    },
    {
      id: 'h_workout_03',
      name: 'Morning Workout / Run',
      icon: 'dumbbell',
      category: 'fitness',
      color: '#ec4899',
      // Mon, Wed, Fri, Sat
      frequency: { type: 'weekly_days', daysOfWeek: [1, 3, 5, 6] },
      target: { enabled: false, value: 1, unit: 'session', step: 1 },
      reminderTime: '07:30',
      status: 'active',
      order: 2,
      createdAt: thirtyDaysAgo
    },
    {
      id: 'h_meditate_04',
      name: 'Mindful Meditation',
      icon: 'brain',
      category: 'mindfulness',
      color: '#f59e0b',
      frequency: { type: 'daily' },
      target: { enabled: true, value: 10, unit: 'mins', step: 5 },
      reminderTime: '08:00',
      status: 'active',
      order: 3,
      createdAt: thirtyDaysAgo
    },
    {
      id: 'h_sleep_05',
      name: 'Sleep before 11 PM',
      icon: 'moon',
      category: 'health',
      color: '#8b5cf6',
      frequency: { type: 'daily' },
      target: { enabled: false, value: 1, unit: 'session', step: 1 },
      reminderTime: '22:30',
      status: 'active',
      order: 4,
      createdAt: thirtyDaysAgo
    }
  ];

  // Generate realistic historical completions with high consistency
  const sampleCompletions = {};

  for (let i = 45; i >= 0; i--) {
    const d = addDays(today, -i);
    const isToday = i === 0;

    sampleHabits.forEach(h => {
      let shouldComplete = false;
      // High probability (75% - 90%) for past days
      if (!isToday) {
        shouldComplete = Math.random() > 0.18;
      } else {
        // First 2 habits completed today
        shouldComplete = h.id === 'h_water_01' || h.id === 'h_meditate_04';
      }

      if (shouldComplete) {
        sampleCompletions[`${h.id}_${d}`] = {
          id: `${h.id}_${d}`,
          habitId: h.id,
          date: d,
          completed: true,
          value: h.target?.enabled ? h.target.value : 1,
          completedAt: `${d}T10:00:00Z`
        };
      }
    });
  }

  return {
    habits: sampleHabits,
    completions: sampleCompletions
  };
}

/**
 * Exports complete backup payload
 */
export function exportDataAsJSON() {
  const data = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    preferences: loadPreferences(),
    categories: loadCategories(),
    habits: loadHabits() || [],
    completions: loadCompletions()
  };
  return JSON.stringify(data, null, 2);
}

/**
 * Validates and imports JSON backup
 */
export function importDataFromJSON(jsonString) {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed.habits || !Array.isArray(parsed.habits)) {
      throw new Error('Invalid habit data format: "habits" array is required.');
    }
    if (!parsed.completions || typeof parsed.completions !== 'object') {
      throw new Error('Invalid completion data format: "completions" object is required.');
    }

    if (parsed.preferences) savePreferences(parsed.preferences);
    if (parsed.categories && Array.isArray(parsed.categories)) saveCategories(parsed.categories);
    saveHabits(parsed.habits);
    saveCompletions(parsed.completions);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Clears all user data
 */
export function clearAllData() {
  localStorage.removeItem(STORAGE_KEYS.PREFERENCES);
  localStorage.removeItem(STORAGE_KEYS.HABITS);
  localStorage.removeItem(STORAGE_KEYS.COMPLETIONS);
  localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
}
