/**
 * Create / Edit Habit Modal Dialog Component
 */

import { store } from '../state/store.js';
import { HABIT_COLORS, HABIT_ICONS } from '../models/types.js';
import { getIcon } from '../utils/icons.js';
import { categoryModal } from './CategoryModal.js';

export class HabitModal {
  constructor() {
    this.overlay = null;
    this.currentHabit = null; // null for Create, habit object for Edit
    this.selectedIcon = 'star';
    this.selectedColor = '#6366f1';
    this.selectedDaysOfWeek = [1, 2, 3, 4, 5]; // default weekdays
    this.init();
  }

  init() {
    if (typeof document === 'undefined') return;
    this.overlay = document.createElement('div');
    this.overlay.className = 'modal-overlay';
    this.overlay.setAttribute('role', 'dialog');
    this.overlay.setAttribute('aria-modal', 'true');
    this.overlay.innerHTML = `
      <div class="modal-content">
        <div class="sheet-drag-handle" aria-hidden="true"></div>
        <div class="modal-header">
          <h2 class="modal-title" id="modalTitle">Create Habit</h2>
          <button class="btn btn-ghost btn-icon" id="closeModalBtn" type="button" aria-label="Close modal">
            ${getIcon('x')}
          </button>
        </div>

        <form id="habitForm">
          <!-- Name -->
          <div class="form-group">
            <label class="form-label" for="habitNameInput">Habit Name *</label>
            <input 
              type="text" 
              id="habitNameInput" 
              class="form-input" 
              placeholder="e.g. Read 20 minutes, Drink 2L water" 
              required 
              maxlength="60"
            />
          </div>

          <!-- Category with + New Category Action -->
          <div class="form-group">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.4rem;">
              <label class="form-label" for="habitCategorySelect" style="margin-bottom: 0;">Category</label>
              <button type="button" class="btn btn-ghost" id="openCatManagerBtn" style="padding: 0.1rem 0.4rem; font-size: 0.78rem; color: var(--accent-primary); font-weight: 700;">
                + Manage Categories
              </button>
            </div>
            <select id="habitCategorySelect" class="form-select"></select>
          </div>

          <!-- Icon Picker -->
          <div class="form-group">
            <label class="form-label">Icon</label>
            <div class="icon-selector-grid" id="iconGrid">
              ${HABIT_ICONS.map(ic => `
                <button 
                  type="button" 
                  class="icon-choice-btn" 
                  data-icon="${ic.id}"
                  title="${ic.label}"
                >
                  ${getIcon(ic.id)}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Color Swatches -->
          <div class="form-group">
            <label class="form-label">Accent Color</label>
            <div class="color-selector-grid" id="colorGrid">
              ${HABIT_COLORS.map(col => `
                <button 
                  type="button" 
                  class="color-swatch-btn" 
                  data-color="${col}" 
                  style="background-color: ${col};"
                  title="${col}"
                ></button>
              `).join('')}
            </div>
          </div>

          <!-- Frequency -->
          <div class="form-group">
            <label class="form-label" for="frequencySelect">Frequency</label>
            <select id="frequencySelect" class="form-select">
              <option value="daily">Every Day</option>
              <option value="weekly_days">Specific Days of Week</option>
              <option value="custom_interval">Every X Days</option>
            </select>
          </div>

          <!-- Weekday Picker (Conditional) -->
          <div class="form-group" id="weekdayPickerGroup" style="display: none;">
            <label class="form-label">Repeat on Days</label>
            <div class="weekday-selector">
              ${[
                { day: 1, label: 'M' },
                { day: 2, label: 'T' },
                { day: 3, label: 'W' },
                { day: 4, label: 'T' },
                { day: 5, label: 'F' },
                { day: 6, label: 'S' },
                { day: 0, label: 'S' }
              ].map(d => `
                <button type="button" class="weekday-btn" data-day="${d.day}">${d.label}</button>
              `).join('')}
            </div>
          </div>

          <!-- Interval Picker (Conditional) -->
          <div class="form-group" id="intervalPickerGroup" style="display: none;">
            <label class="form-label" for="intervalInput">Repeat Every (Days)</label>
            <input type="number" id="intervalInput" class="form-input" min="2" max="30" value="2" />
          </div>

          <!-- Target (Optional) -->
          <div class="form-group">
            <label class="form-label" style="display: flex; align-items: center; gap: 0.5rem;">
              <input type="checkbox" id="targetCheckbox" style="accent-color: var(--accent-primary);" />
              Set Quantitative Goal / Target
            </label>
            <div id="targetInputsContainer" style="display: none; margin-top: 0.5rem; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.5rem;">
              <div>
                <label class="form-label" style="font-size: 0.75rem;">Goal Amount</label>
                <input type="number" id="targetValueInput" class="form-input" placeholder="e.g. 2000" min="1" />
              </div>
              <div>
                <label class="form-label" style="font-size: 0.75rem;">Unit</label>
                <input type="text" id="targetUnitInput" class="form-input" placeholder="e.g. ml, mins" />
              </div>
              <div>
                <label class="form-label" style="font-size: 0.75rem;">Step Size</label>
                <input type="number" id="targetStepInput" class="form-input" placeholder="e.g. 250" min="1" value="1" />
              </div>
            </div>
          </div>

          <!-- Reminder -->
          <div class="form-group">
            <label class="form-label" for="reminderInput">Optional Reminder Time</label>
            <input type="time" id="reminderInput" class="form-input" />
          </div>

          <!-- Actions -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1.5rem; gap: 0.75rem;">
            <button type="button" class="btn btn-danger" id="deleteHabitModalBtn" style="display: none;">
              ${getIcon('trash')}
              <span>Delete</span>
            </button>
            <div style="display: flex; gap: 0.75rem; margin-left: auto;">
              <button type="button" class="btn btn-secondary" id="cancelModalBtn">Cancel</button>
              <button type="submit" class="btn btn-primary" id="saveModalBtn">Save Habit</button>
            </div>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(this.overlay);
    this.attachEventListeners();
  }

  updateCategorySelect(selectedId = null) {
    const select = this.overlay.querySelector('#habitCategorySelect');
    if (!select) return;
    select.innerHTML = store.categories.map(c => `
      <option value="${c.id}" ${c.id === selectedId ? 'selected' : ''}>${c.name}</option>
    `).join('');
  }

  attachEventListeners() {
    const closeBtn = this.overlay.querySelector('#closeModalBtn');
    const cancelBtn = this.overlay.querySelector('#cancelModalBtn');
    const deleteBtn = this.overlay.querySelector('#deleteHabitModalBtn');
    const form = this.overlay.querySelector('#habitForm');
    const freqSelect = this.overlay.querySelector('#frequencySelect');
    const targetCheckbox = this.overlay.querySelector('#targetCheckbox');
    const openCatManagerBtn = this.overlay.querySelector('#openCatManagerBtn');

    closeBtn.addEventListener('click', () => this.close());
    cancelBtn.addEventListener('click', () => this.close());

    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });

    if (openCatManagerBtn) {
      openCatManagerBtn.addEventListener('click', () => {
        store.setView('settings');
        this.close();
      });
    }

    // Frequency toggling
    freqSelect.addEventListener('change', () => {
      this.updateFrequencyVisibility(freqSelect.value);
    });

    // Weekday toggle buttons
    this.overlay.querySelectorAll('.weekday-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const day = parseInt(btn.getAttribute('data-day'), 10);
        if (this.selectedDaysOfWeek.includes(day)) {
          if (this.selectedDaysOfWeek.length > 1) {
            this.selectedDaysOfWeek = this.selectedDaysOfWeek.filter(d => d !== day);
            btn.classList.remove('selected');
          }
        } else {
          this.selectedDaysOfWeek.push(day);
          btn.classList.add('selected');
        }
      });
    });

    // Target Checkbox toggle
    targetCheckbox.addEventListener('change', () => {
      const container = this.overlay.querySelector('#targetInputsContainer');
      container.style.display = targetCheckbox.checked ? 'grid' : 'none';
    });

    // Icon Selector
    this.overlay.querySelectorAll('.icon-choice-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.selectedIcon = btn.getAttribute('data-icon');
        this.overlay.querySelectorAll('.icon-choice-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
      });
    });

    // Color Swatch Selector
    this.overlay.querySelectorAll('.color-swatch-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.selectedColor = btn.getAttribute('data-color');
        this.overlay.querySelectorAll('.color-swatch-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
      });
    });

    // Delete Button
    deleteBtn.addEventListener('click', () => {
      if (this.currentHabit) {
        if (confirm(`Are you sure you want to delete "${this.currentHabit.name}"?`)) {
          store.deleteHabit(this.currentHabit.id);
          this.close();
        }
      }
    });

    // Form Submit
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = this.overlay.querySelector('#habitNameInput').value.trim();
      if (!name) return;

      const category = this.overlay.querySelector('#habitCategorySelect').value;
      const freqType = this.overlay.querySelector('#frequencySelect').value;
      const reminderTime = this.overlay.querySelector('#reminderInput').value || null;

      let frequency = { type: freqType };
      if (freqType === 'weekly_days') {
        frequency.daysOfWeek = [...this.selectedDaysOfWeek];
      } else if (freqType === 'custom_interval') {
        frequency.intervalDays = parseInt(this.overlay.querySelector('#intervalInput').value, 10) || 2;
      }

      const isTargetEnabled = this.overlay.querySelector('#targetCheckbox').checked;
      const targetValue = parseFloat(this.overlay.querySelector('#targetValueInput').value) || 1;
      const targetUnit = this.overlay.querySelector('#targetUnitInput').value.trim() || 'times';
      const targetStep = parseFloat(this.overlay.querySelector('#targetStepInput').value) || 1;

      const target = {
        enabled: isTargetEnabled,
        value: targetValue,
        unit: targetUnit,
        step: targetStep
      };

      if (this.currentHabit) {
        // Update existing habit
        store.updateHabit(this.currentHabit.id, {
          name,
          category,
          icon: this.selectedIcon,
          color: this.selectedColor,
          frequency,
          target,
          reminderTime
        });
      } else {
        // Create new habit
        store.addHabit({
          name,
          category,
          icon: this.selectedIcon,
          color: this.selectedColor,
          frequency,
          target,
          reminderTime
        });
      }

      this.close();
    });
  }

  updateFrequencyVisibility(type) {
    const weekGroup = this.overlay.querySelector('#weekdayPickerGroup');
    const intervalGroup = this.overlay.querySelector('#intervalPickerGroup');
    weekGroup.style.display = type === 'weekly_days' ? 'block' : 'none';
    intervalGroup.style.display = type === 'custom_interval' ? 'block' : 'none';
  }

  open(habit = null) {
    this.currentHabit = habit;
    const title = this.overlay.querySelector('#modalTitle');
    const deleteBtn = this.overlay.querySelector('#deleteHabitModalBtn');
    const form = this.overlay.querySelector('#habitForm');

    form.reset();

    const selectedCategory = habit?.category || store.categories[0]?.id || 'other';
    this.updateCategorySelect(selectedCategory);

    if (habit) {
      title.textContent = 'Edit Habit';
      deleteBtn.style.display = 'inline-flex';

      this.overlay.querySelector('#habitNameInput').value = habit.name;
      this.selectedIcon = habit.icon || 'star';
      this.selectedColor = habit.color || '#6366f1';
      this.selectedDaysOfWeek = habit.frequency?.daysOfWeek || [1, 2, 3, 4, 5];

      const freqType = habit.frequency?.type || 'daily';
      this.overlay.querySelector('#frequencySelect').value = freqType;
      this.updateFrequencyVisibility(freqType);

      if (freqType === 'custom_interval') {
        this.overlay.querySelector('#intervalInput').value = habit.frequency?.intervalDays || 2;
      }

      const targetCheckbox = this.overlay.querySelector('#targetCheckbox');
      const targetContainer = this.overlay.querySelector('#targetInputsContainer');
      if (habit.target?.enabled) {
        targetCheckbox.checked = true;
        targetContainer.style.display = 'grid';
        this.overlay.querySelector('#targetValueInput').value = habit.target.value;
        this.overlay.querySelector('#targetUnitInput').value = habit.target.unit;
        this.overlay.querySelector('#targetStepInput').value = habit.target.step || 1;
      } else {
        targetCheckbox.checked = false;
        targetContainer.style.display = 'none';
      }

      if (habit.reminderTime) {
        this.overlay.querySelector('#reminderInput').value = habit.reminderTime;
      }
    } else {
      title.textContent = 'Create New Habit';
      deleteBtn.style.display = 'none';
      this.selectedIcon = 'star';
      this.selectedColor = '#6366f1';
      this.selectedDaysOfWeek = [1, 2, 3, 4, 5];
      this.updateFrequencyVisibility('daily');
      this.overlay.querySelector('#targetInputsContainer').style.display = 'none';
    }

    // Update active icon
    this.overlay.querySelectorAll('.icon-choice-btn').forEach(btn => {
      btn.classList.toggle('selected', btn.getAttribute('data-icon') === this.selectedIcon);
    });

    // Update active color
    this.overlay.querySelectorAll('.color-swatch-btn').forEach(btn => {
      btn.classList.toggle('selected', btn.getAttribute('data-color') === this.selectedColor);
    });

    // Update weekday buttons
    this.overlay.querySelectorAll('.weekday-btn').forEach(btn => {
      const day = parseInt(btn.getAttribute('data-day'), 10);
      btn.classList.toggle('selected', this.selectedDaysOfWeek.includes(day));
    });

    this.overlay.classList.add('active');
    setTimeout(() => {
      this.overlay.querySelector('#habitNameInput').focus();
    }, 100);
  }

  close() {
    this.overlay.classList.remove('active');
    this.currentHabit = null;
  }
}

export const habitModal = new HabitModal();
