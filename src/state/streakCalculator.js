/**
 * Frequency-Aware Streak & Progress Calculation Engine
 */

import {
  getTodayString,
  addDays,
  getDayOfWeek,
  parseDateString,
  formatDateString,
  getWeekDates
} from '../utils/dateUtils.js';

/**
 * Checks if a habit is scheduled on a specific date.
 */
export function isHabitScheduledOnDate(habit, dateStr) {
  if (!habit || habit.status === 'archived') return false;

  const freq = habit.frequency || { type: 'daily' };

  if (freq.type === 'daily') {
    return true;
  }

  if (freq.type === 'weekly_days') {
    const dayOfWeek = getDayOfWeek(dateStr); // 0 (Sun) to 6 (Sat)
    return Array.isArray(freq.daysOfWeek) && freq.daysOfWeek.includes(dayOfWeek);
  }

  if (freq.type === 'times_per_week') {
    // Scheduled every day as an eligible day until weekly quota is met
    return true;
  }

  if (freq.type === 'custom_interval') {
    const interval = freq.intervalDays || 1;
    if (interval <= 1) return true;
    const start = parseDateString(habit.createdAt || '2026-01-01');
    const target = parseDateString(dateStr);
    const diffDays = Math.round((target - start) / (1000 * 60 * 60 * 24));
    return Math.abs(diffDays) % interval === 0;
  }

  return true;
}

/**
 * Calculates current streak and longest streak for a habit.
 * completionsMap: Map<string, HabitCompletion> or Record<"habitId_date", HabitCompletion>
 */
export function calculateHabitStreaks(habit, completionsMap, todayStr = getTodayString()) {
  if (!habit) return { currentStreak: 0, longestStreak: 0, totalCompletions: 0 };

  const habitId = habit.id;
  const isCompletedOn = (d) => {
    const key = `${habitId}_${d}`;
    const comp = completionsMap[key];
    return comp && comp.completed;
  };

  // Find all completion records for this habit
  let totalCompletions = 0;
  Object.keys(completionsMap).forEach(key => {
    if (key.startsWith(`${habitId}_`) && completionsMap[key]?.completed) {
      totalCompletions++;
    }
  });

  // Calculate current streak
  let currentStreak = 0;
  let checkDate = todayStr;
  let isTodayCompleted = isCompletedOn(todayStr);
  let isTodayScheduled = isHabitScheduledOnDate(habit, todayStr);

  // If today is scheduled and completed, streak starts at today
  // If today is scheduled but not yet completed, check backward from yesterday
  // If today is not scheduled, streak carries over from previous scheduled day
  if (isTodayScheduled && isTodayCompleted) {
    currentStreak = 1;
    checkDate = addDays(todayStr, -1);
  } else if (!isTodayScheduled) {
    // Skip today and start checking from yesterday
    checkDate = addDays(todayStr, -1);
  } else {
    // Today is scheduled but not completed yet: streak is from yesterday backward
    checkDate = addDays(todayStr, -1);
  }

  // Traverse backward in time
  const maxLookback = 365;
  let daysChecked = 0;

  while (daysChecked < maxLookback) {
    if (habit.createdAt && checkDate < habit.createdAt) {
      break;
    }

    const scheduled = isHabitScheduledOnDate(habit, checkDate);
    if (scheduled) {
      if (isCompletedOn(checkDate)) {
        currentStreak++;
      } else {
        // Streak broken
        break;
      }
    }
    // If not scheduled, skip without breaking streak
    checkDate = addDays(checkDate, -1);
    daysChecked++;
  }

  // Calculate longest streak across history
  // Scan historical window from habit creation (or past 180 days) to today
  let longestStreak = currentStreak;
  let tempStreak = 0;
  const startDate = habit.createdAt || addDays(todayStr, -180);
  let scanDate = startDate;

  while (scanDate <= todayStr) {
    const scheduled = isHabitScheduledOnDate(habit, scanDate);
    if (scheduled) {
      if (isCompletedOn(scanDate)) {
        tempStreak++;
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
      } else {
        tempStreak = 0;
      }
    }
    scanDate = addDays(scanDate, 1);
  }

  return {
    currentStreak,
    longestStreak,
    totalCompletions
  };
}

/**
 * Calculates daily completion statistics for a specific date
 */
export function getDailyProgress(habits, completionsMap, dateStr = getTodayString()) {
  const activeHabits = habits.filter(h => h.status === 'active');
  const scheduledHabits = activeHabits.filter(h => isHabitScheduledOnDate(h, dateStr));

  if (scheduledHabits.length === 0) {
    return {
      total: 0,
      completed: 0,
      percentage: 0,
      scheduledHabits: []
    };
  }

  let completedCount = 0;
  scheduledHabits.forEach(h => {
    const key = `${h.id}_${dateStr}`;
    if (completionsMap[key]?.completed) {
      completedCount++;
    }
  });

  const percentage = Math.round((completedCount / scheduledHabits.length) * 100);

  return {
    total: scheduledHabits.length,
    completed: completedCount,
    percentage,
    scheduledHabits
  };
}

/**
 * Calculates weekly completion rate and day-by-day counts
 */
export function getWeeklyStats(habits, completionsMap, referenceDate = getTodayString()) {
  const weekDates = getWeekDates(referenceDate, true);
  const dayStats = weekDates.map(dateStr => {
    const progress = getDailyProgress(habits, completionsMap, dateStr);
    return {
      date: dateStr,
      dayOfWeek: getDayOfWeek(dateStr),
      total: progress.total,
      completed: progress.completed,
      percentage: progress.percentage
    };
  });

  const totalScheduled = dayStats.reduce((acc, curr) => acc + curr.total, 0);
  const totalCompleted = dayStats.reduce((acc, curr) => acc + curr.completed, 0);
  const overallRate = totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 0;

  return {
    weekDates,
    dayStats,
    totalScheduled,
    totalCompleted,
    overallRate
  };
}

/**
 * Generates completion intensity data for the 60-day heatmap
 */
export function getHeatmapData(habits, completionsMap, days = 60, endDate = getTodayString()) {
  const data = [];
  for (let i = days - 1; i >= 0; i--) {
    const dateStr = addDays(endDate, -i);
    const progress = getDailyProgress(habits, completionsMap, dateStr);
    
    let level = 0; // 0 to 4
    if (progress.total > 0) {
      if (progress.percentage === 0) level = 0;
      else if (progress.percentage <= 25) level = 1;
      else if (progress.percentage <= 50) level = 2;
      else if (progress.percentage <= 75) level = 3;
      else level = 4;
    }

    data.push({
      date: dateStr,
      completed: progress.completed,
      total: progress.total,
      percentage: progress.percentage,
      level
    });
  }
  return data;
}

/**
 * Returns a contextual motivational quote based on progress and time
 */
export function getMotivationalMessage(percentage, hour = new Date().getHours()) {
  if (percentage === 100) {
    return {
      title: 'Flawless Victory! 🔥',
      subtitle: 'You crushed every single habit today. Keep this momentum roaring!'
    };
  }
  if (percentage >= 75) {
    return {
      title: 'Almost There! ✨',
      subtitle: 'Incredible discipline today. Just a tiny push to 100%!'
    };
  }
  if (percentage >= 50) {
    return {
      title: 'Halfway Milestone! 🚀',
      subtitle: 'Great progress. Finish your remaining habits strong.'
    };
  }
  if (percentage > 0) {
    return {
      title: 'Off to a Great Start! 🌱',
      subtitle: 'Every habit completed is a vote for the person you want to become.'
    };
  }

  if (hour < 12) {
    return {
      title: 'Good Morning! ☀️',
      subtitle: 'Make today count. Begin with your easiest habit to build momentum.'
    };
  } else if (hour < 18) {
    return {
      title: 'Keep Moving Forward! ⚡',
      subtitle: 'Small, consistent actions lead to extraordinary long-term results.'
    };
  } else {
    return {
      title: 'Evening Check-in 🌙',
      subtitle: 'Take a few peaceful minutes to reflect and complete today’s routine.'
    };
  }
}
