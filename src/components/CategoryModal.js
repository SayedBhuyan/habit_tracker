/**
 * Category Create / Edit Modal Dialog Component
 */

import { store } from '../state/store.js';
import { HABIT_COLORS, HABIT_ICONS } from '../models/types.js';
import { getIcon } from '../utils/icons.js';

export class CategoryModal {
  constructor() {
    this.overlay = null;
    this.currentCategory = null; // null for Create, category object for Edit
    this.selectedIcon = 'star';
    this.selectedColor = '#6366f1';
    this.init();
  }

  init() {
    if (typeof document === 'undefined') return;
    this.overlay = document.createElement('div');
    this.overlay.className = 'modal-overlay';
    this.overlay.setAttribute('role', 'dialog');
    this.overlay.setAttribute('aria-modal', 'true');
    this.overlay.innerHTML = `
      <div class="modal-content" style="max-width: 480px;">
        <div class="sheet-drag-handle" aria-hidden="true"></div>
        <div class="modal-header">
          <h2 class="modal-title" id="catModalTitle">Create Category</h2>
          <button class="btn btn-ghost btn-icon" id="closeCatModalBtn" type="button" aria-label="Close modal">
            ${getIcon('x')}
          </button>
        </div>

        <form id="catForm">
          <!-- Category Name -->
          <div class="form-group">
            <label class="form-label" for="catNameInput">Category Name *</label>
            <input 
              type="text" 
              id="catNameInput" 
              class="form-input" 
              placeholder="e.g. Finance, Morning, Work" 
              required 
              maxlength="40"
            />
          </div>

          <!-- Icon Picker -->
          <div class="form-group">
            <label class="form-label">Category Icon</label>
            <div class="icon-selector-grid" id="catIconGrid">
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
            <div class="color-selector-grid" id="catColorGrid">
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

          <!-- Actions -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1.5rem; gap: 0.75rem;">
            <button type="button" class="btn btn-danger" id="deleteCatBtn" style="display: none;">
              ${getIcon('trash')}
              <span>Delete</span>
            </button>
            <div style="display: flex; gap: 0.75rem; margin-left: auto;">
              <button type="button" class="btn btn-secondary" id="cancelCatModalBtn">Cancel</button>
              <button type="submit" class="btn btn-primary" id="saveCatBtn">Save Category</button>
            </div>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(this.overlay);
    this.attachEventListeners();
  }

  attachEventListeners() {
    const closeBtn = this.overlay.querySelector('#closeCatModalBtn');
    const cancelBtn = this.overlay.querySelector('#cancelCatModalBtn');
    const deleteBtn = this.overlay.querySelector('#deleteCatBtn');
    const form = this.overlay.querySelector('#catForm');

    closeBtn.addEventListener('click', () => this.close());
    cancelBtn.addEventListener('click', () => this.close());

    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
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
      if (this.currentCategory) {
        if (confirm(`Are you sure you want to delete category "${this.currentCategory.name}"? Existing habits will be reassigned.`)) {
          store.deleteCategory(this.currentCategory.id);
          this.close();
        }
      }
    });

    // Form Submit
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = this.overlay.querySelector('#catNameInput').value.trim();
      if (!name) return;

      if (this.currentCategory) {
        store.updateCategory(this.currentCategory.id, {
          name,
          icon: this.selectedIcon,
          color: this.selectedColor
        });
      } else {
        store.addCategory({
          name,
          icon: this.selectedIcon,
          color: this.selectedColor
        });
      }

      this.close();
    });
  }

  open(category = null) {
    this.currentCategory = category;
    const title = this.overlay.querySelector('#catModalTitle');
    const deleteBtn = this.overlay.querySelector('#deleteCatBtn');
    const form = this.overlay.querySelector('#catForm');

    form.reset();

    if (category) {
      title.textContent = 'Edit Category';
      deleteBtn.style.display = 'inline-flex';
      this.overlay.querySelector('#catNameInput').value = category.name;
      this.selectedIcon = category.icon || 'star';
      this.selectedColor = category.color || '#6366f1';
    } else {
      title.textContent = 'Create New Category';
      deleteBtn.style.display = 'none';
      this.selectedIcon = 'star';
      this.selectedColor = '#6366f1';
    }

    // Update active icon
    this.overlay.querySelectorAll('.icon-choice-btn').forEach(btn => {
      btn.classList.toggle('selected', btn.getAttribute('data-icon') === this.selectedIcon);
    });

    // Update active color
    this.overlay.querySelectorAll('.color-swatch-btn').forEach(btn => {
      btn.classList.toggle('selected', btn.getAttribute('data-color') === this.selectedColor);
    });

    this.overlay.classList.add('active');
    setTimeout(() => {
      this.overlay.querySelector('#catNameInput').focus();
    }, 100);
  }

  close() {
    this.overlay.classList.remove('active');
    this.currentCategory = null;
  }
}

export const categoryModal = new CategoryModal();
