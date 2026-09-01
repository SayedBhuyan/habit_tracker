/**
 * Types and Constants for Habit Tracker
 */

export const DEFAULT_CATEGORIES = [
  { id: 'health', name: 'Health & Body', icon: 'heart', color: '#10b981' },
  { id: 'productivity', name: 'Productivity', icon: 'zap', color: '#6366f1' },
  { id: 'mindfulness', name: 'Mindfulness', icon: 'sun', color: '#f59e0b' },
  { id: 'learning', name: 'Learning & Skills', icon: 'book', color: '#3b82f6' },
  { id: 'fitness', name: 'Fitness & Sport', icon: 'activity', color: '#ec4899' },
  { id: 'other', name: 'Lifestyle & Routine', icon: 'star', color: '#8b5cf6' }
];

export const CATEGORIES = DEFAULT_CATEGORIES;

export const HABIT_COLORS = [
  '#6366f1', // Indigo
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#3b82f6', // Blue
  '#ec4899', // Pink
  '#8b5cf6', // Purple
  '#14b8a6', // Teal
  '#ef4444', // Red
  '#f97316', // Orange
  '#06b6d4', // Cyan
];

export const HABIT_ICONS = [
  { id: 'droplet', label: 'Water', category: 'health' },
  { id: 'book-open', label: 'Reading', category: 'learning' },
  { id: 'dumbbell', label: 'Exercise', category: 'fitness' },
  { id: 'moon', label: 'Sleep', category: 'health' },
  { id: 'sun', label: 'Morning', category: 'mindfulness' },
  { id: 'brain', label: 'Meditation', category: 'mindfulness' },
  { id: 'code', label: 'Coding', category: 'productivity' },
  { id: 'check-circle-2', label: 'Task', category: 'productivity' },
  { id: 'apple', label: 'Nutrition', category: 'health' },
  { id: 'flame', label: 'Streak/Power', category: 'fitness' },
  { id: 'heart', label: 'Self-care', category: 'health' },
  { id: 'coffee', label: 'Break/Coffee', category: 'other' },
  { id: 'music', label: 'Music/Instrument', category: 'learning' },
  { id: 'pen-tool', label: 'Writing/Journal', category: 'mindfulness' },
  { id: 'dollar-sign', label: 'Finances', category: 'productivity' },
  { id: 'smile', label: 'Mood', category: 'mindfulness' }
];

export const DEFAULT_PREFERENCES = {
  id: 'default_user',
  name: 'Habit Champion',
  theme: 'system', // 'system' | 'dark' | 'light'
  soundEnabled: true,
  hapticsEnabled: true,
  firstDayOfWeek: 1, // 1 = Monday, 0 = Sunday
  celebrationsEnabled: true,
  createdAt: new Date().toISOString()
};
