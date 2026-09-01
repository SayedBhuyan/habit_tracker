/**
 * Central Reactive State Store with Event Dispatching
 */

import {
  loadPreferences,
  savePreferences,
  loadHabits,
  saveHabits,
  loadCompletions,
  saveCompletions,
  loadCategories,
  saveCategories,
  generateSampleData,
  clearAllData
} from './storage.js';
import { getTodayString } from '../utils/dateUtils.js';
import { sound } from '../utils/soundUtils.js';
import { confetti } from '../components/Confetti.js';
import { toast } from '../components/Toast.js';

class HabitStore {
  constructor() {
    this.preferences = loadPreferences();
    this.categories = loadCategories();
    
    // Load habits or seed sample data on first run
    let storedHabits = loadHabits();
    let storedCompletions = loadCompletions();

    if (storedHabits === null) {
      const sample = generateSampleData();
      this.habits = sample.habits;
      this.completions = sample.completions;
      saveHabits(this.habits);
      saveCompletions(this.completions);
    } else {
      this.habits = storedHabits;
      this.completions = storedCompletions;
    }

    this.selectedDate = getTodayString();
    this.currentView = 'today'; // 'today' | 'habits' | 'stats' | 'history' | 'settings'
    this.listeners = new Set();
    this.categoryFilter = 'all';

    this.applyTheme();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(event = 'state_change') {
    this.listeners.forEach(fn => fn(this, event));
  }

  // --- View & Navigation Navigation ---
  setView(view) {
    if (this.currentView !== view) {
      this.currentView = view;
      this.notify('view_change');
    }
  }

  setSelectedDate(dateStr) {
    if (this.selectedDate !== dateStr) {
      this.selectedDate = dateStr;
      this.notify('date_change');
    }
  }

  setCategoryFilter(category) {
    this.categoryFilter = category;
    this.notify('filter_change');
  }

  // --- Category Management ---
  addCategory(categoryData) {
    const id = 'cat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 3);
    const newCategory = {
      id,
      name: categoryData.name.trim(),
      icon: categoryData.icon || 'star',
      color: categoryData.color || '#6366f1'
    };

    this.categories.push(newCategory);
    saveCategories(this.categories);
    this.notify('category_added');
    toast.show({ message: `Created category "${newCategory.name}"`, type: 'success' });
    return newCategory;
  }

  updateCategory(categoryId, updates) {
    const index = this.categories.findIndex(c => c.id === categoryId);
    if (index === -1) return;

    this.categories[index] = {
      ...this.categories[index],
      ...updates
    };

    saveCategories(this.categories);
    this.notify('category_updated');
    toast.show({ message: 'Category updated', type: 'success' });
  }

  deleteCategory(categoryId) {
    if (this.categories.length <= 1) {
      toast.show({ message: 'You must have at least one category.', type: 'warning' });
      return false;
    }

    const catToDelete = this.categories.find(c => c.id === categoryId);
    if (!catToDelete) return false;

    // Remove category
    this.categories = this.categories.filter(c => c.id !== categoryId);
    saveCategories(this.categories);

    // Reassign habits using this category to the first available category or 'other'
    const fallbackCatId = this.categories[0]?.id || 'other';
    let remappedCount = 0;
    this.habits.forEach(h => {
      if (h.category === categoryId) {
        h.category = fallbackCatId;
        remappedCount++;
      }
    });

    if (remappedCount > 0) {
      saveHabits(this.habits);
    }

    if (this.categoryFilter === categoryId) {
      this.categoryFilter = 'all';
    }

    this.notify('category_deleted');
    toast.show({ message: `Deleted category "${catToDelete.name}"`, type: 'info' });
    return true;
  }

  // --- Habit Management ---
  addHabit(habitData) {
    const newHabit = {
      id: 'h_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      name: habitData.name.trim(),
      icon: habitData.icon || 'star',
      category: habitData.category || 'other',
      color: habitData.color || '#6366f1',
      frequency: habitData.frequency || { type: 'daily' },
      target: habitData.target || { enabled: false, value: 1, unit: 'times', step: 1 },
      reminderTime: habitData.reminderTime || null,
      status: 'active',
      order: this.habits.length,
      createdAt: getTodayString(),
      archivedAt: null
    };

    this.habits.push(newHabit);
    saveHabits(this.habits);
    this.notify('habit_added');
    toast.show({ message: `Created "${newHabit.name}"`, type: 'success' });
    return newHabit;
  }

  updateHabit(habitId, updates) {
    const index = this.habits.findIndex(h => h.id === habitId);
    if (index === -1) return;

    this.habits[index] = {
      ...this.habits[index],
      ...updates
    };

    saveHabits(this.habits);
    this.notify('habit_updated');
    toast.show({ message: 'Habit updated', type: 'success' });
  }

  deleteHabit(habitId) {
    const habit = this.habits.find(h => h.id === habitId);
    if (!habit) return;

    const oldHabits = [...this.habits];
    this.habits = this.habits.filter(h => h.id !== habitId);
    saveHabits(this.habits);
    this.notify('habit_deleted');

    toast.show({
      message: `Deleted "${habit.name}"`,
      type: 'warning',
      action: {
        label: 'Undo',
        onClick: () => {
          this.habits = oldHabits;
          saveHabits(this.habits);
          this.notify('habit_restored');
        }
      }
    });
  }

  togglePauseHabit(habitId) {
    const habit = this.habits.find(h => h.id === habitId);
    if (!habit) return;

    const newStatus = habit.status === 'paused' ? 'active' : 'paused';
    habit.status = newStatus;
    saveHabits(this.habits);
    this.notify('habit_status_changed');
    toast.show({
      message: newStatus === 'paused' ? `Paused "${habit.name}"` : `Resumed "${habit.name}"`,
      type: 'info'
    });
  }

  toggleArchiveHabit(habitId) {
    const habit = this.habits.find(h => h.id === habitId);
    if (!habit) return;

    const isArchiving = habit.status !== 'archived';
    habit.status = isArchiving ? 'archived' : 'active';
    habit.archivedAt = isArchiving ? new Date().toISOString() : null;

    saveHabits(this.habits);
    this.notify('habit_status_changed');
    toast.show({
      message: isArchiving ? `Archived "${habit.name}"` : `Restored "${habit.name}"`,
      type: 'info'
    });
  }

  reorderHabits(sourceId, targetId) {
    const sourceIdx = this.habits.findIndex(h => h.id === sourceId);
    const targetIdx = this.habits.findIndex(h => h.id === targetId);
    if (sourceIdx === -1 || targetIdx === -1 || sourceIdx === targetIdx) return;

    const [moved] = this.habits.splice(sourceIdx, 1);
    this.habits.splice(targetIdx, 0, moved);

    // Update order indexes
    this.habits.forEach((h, i) => (h.order = i));
    saveHabits(this.habits);
    this.notify('habits_reordered');
  }

  // --- Habit Completion Operations ---
  toggleCompletion(habitId, dateStr = this.selectedDate) {
    const key = `${habitId}_${dateStr}`;
    const habit = this.habits.find(h => h.id === habitId);
    const existing = this.completions[key];

    const isNowCompleted = !existing || !existing.completed;

    this.completions[key] = {
      id: key,
      habitId,
      date: dateStr,
      completed: isNowCompleted,
      value: isNowCompleted ? (habit?.target?.enabled ? habit.target.value : 1) : 0,
      completedAt: isNowCompleted ? new Date().toISOString() : null
    };

    saveCompletions(this.completions);

    if (isNowCompleted) {
      if (habit && (!habit.createdAt || dateStr < habit.createdAt)) {
        habit.createdAt = dateStr;
        saveHabits(this.habits);
      }

      if (this.preferences.soundEnabled || this.preferences.hapticsEnabled) {
        sound.playComplete(this.preferences.soundEnabled, this.preferences.hapticsEnabled);
      }

      // Check if all scheduled habits today are now complete
      const today = getTodayString();
      if (dateStr === today) {
        const scheduled = this.habits.filter(h => h.status === 'active');
        const allDone = scheduled.length > 0 && scheduled.every(h => {
          const k = `${h.id}_${today}`;
          return this.completions[k]?.completed;
        });

        if (allDone && this.preferences.celebrationsEnabled) {
          setTimeout(() => {
            sound.playCelebration(this.preferences.soundEnabled, this.preferences.hapticsEnabled);
            confetti.fire(70);
            toast.show({
              message: '🎉 Fantastic! All habits completed today!',
              type: 'success'
            });
          }, 150);
        }
      }
    } else {
      if (this.preferences.soundEnabled || this.preferences.hapticsEnabled) {
        sound.playPop(this.preferences.soundEnabled, this.preferences.hapticsEnabled);
      }
    }

    this.notify('completion_toggled');
  }

  setCompletionValue(habitId, dateStr, value) {
    const key = `${habitId}_${dateStr}`;
    const habit = this.habits.find(h => h.id === habitId);
    const targetVal = habit?.target?.value || 1;
    const isCompleted = value >= targetVal;

    this.completions[key] = {
      id: key,
      habitId,
      date: dateStr,
      completed: isCompleted,
      value: Math.max(0, value),
      completedAt: isCompleted ? new Date().toISOString() : null
    };

    saveCompletions(this.completions);
    if (this.preferences.soundEnabled) {
      sound.playPop(true);
    }
    this.notify('completion_value_changed');
  }

  // --- Preferences & Theme ---
  updatePreferences(updates) {
    this.preferences = {
      ...this.preferences,
      ...updates
    };
    savePreferences(this.preferences);
    this.applyTheme();
    this.notify('preferences_changed');
  }

  applyTheme() {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const theme = this.preferences.theme;

    if (theme === 'dark') {
      root.classList.add('dark-theme');
      root.classList.remove('light-theme');
    } else if (theme === 'light') {
      root.classList.add('light-theme');
      root.classList.remove('dark-theme');
    } else {
      // System
      const prefersDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark-theme');
        root.classList.remove('light-theme');
      } else {
        root.classList.add('light-theme');
        root.classList.remove('dark-theme');
      }
    }
  }

  resetAllData() {
    clearAllData();
    const sample = generateSampleData();
    this.habits = sample.habits;
    this.completions = sample.completions;
    this.preferences = loadPreferences();
    saveHabits(this.habits);
    saveCompletions(this.completions);
    this.notify('data_reset');
    toast.show({ message: 'Reset data with demo habits', type: 'info' });
  }

  clearToEmptyState() {
    clearAllData();
    this.habits = [];
    this.completions = {};
    saveHabits([]);
    saveCompletions({});
    this.notify('data_cleared');
    toast.show({ message: 'All habits cleared', type: 'info' });
  }
}

export const store = new HabitStore();
