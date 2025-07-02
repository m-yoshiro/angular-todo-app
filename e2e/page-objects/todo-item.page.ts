import { Page, Locator, expect } from '@playwright/test';

export interface TodoItemData {
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  completed: boolean;
  hasDueDate: boolean;
  isOverdue?: boolean;
  tags?: string[];
}

/**
 * Page Object Model for individual Todo Item interactions
 * Specialized for todo item operations, editing, and state management
 */
export class TodoItemPage {
  readonly page: Page;
  private readonly itemLocator: Locator;

  // Main item elements
  readonly todoItem: Locator;
  readonly todoContent: Locator;
  readonly checkbox: Locator;
  readonly title: Locator;
  readonly description: Locator;
  readonly actions: Locator;
  
  // Action buttons
  readonly editButton: Locator;
  readonly deleteButton: Locator;
  
  // Meta information
  readonly priority: Locator;
  readonly dueDate: Locator;
  readonly tags: Locator;
  readonly tagElements: Locator;
  
  // Edit form (when in edit mode)
  readonly editForm: Locator;
  readonly editTitleInput: Locator;
  readonly editDescriptionInput: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page, itemSelector?: Locator) {
    this.page = page;
    this.itemLocator = itemSelector || page.getByTestId('todo-item').first();
    
    // Main item elements
    this.todoItem = this.itemLocator;
    this.todoContent = this.itemLocator.getByTestId('todo-content');
    this.checkbox = this.itemLocator.getByTestId('todo-checkbox');
    this.title = this.itemLocator.getByTestId('todo-title');
    this.description = this.itemLocator.getByTestId('todo-description');
    this.actions = this.itemLocator.getByTestId('todo-actions');
    
    // Action buttons
    this.editButton = this.itemLocator.getByTestId('edit-button');
    this.deleteButton = this.itemLocator.getByTestId('delete-button');
    
    // Meta information
    this.priority = this.itemLocator.getByTestId('todo-priority');
    this.dueDate = this.itemLocator.getByTestId('todo-due-date');
    this.tags = this.itemLocator.getByTestId('todo-tags');
    this.tagElements = this.itemLocator.getByTestId('todo-tag');
    
    // Edit form
    this.editForm = this.itemLocator.getByTestId('todo-edit-form');
    this.editTitleInput = this.itemLocator.getByTestId('edit-title-input');
    this.editDescriptionInput = this.itemLocator.getByTestId('edit-description-input');
    this.saveButton = this.itemLocator.getByTestId('save-button');
    this.cancelButton = this.itemLocator.getByTestId('cancel-button');
  }

  /**
   * Create a TodoItemPage for a specific todo by index
   */
  static forIndex(page: Page, index: number) {
    const itemLocator = page.getByTestId('todo-item').nth(index);
    return new TodoItemPage(page, itemLocator);
  }

  /**
   * Create a TodoItemPage for a specific todo by title
   */
  static forTitle(page: Page, title: string) {
    const itemLocator = page.getByTestId('todo-item').filter({ hasText: title });
    return new TodoItemPage(page, itemLocator);
  }

  /**
   * Wait for todo item to be visible
   */
  async waitForVisible() {
    await expect(this.todoItem).toBeVisible();
  }

  /**
   * Toggle the completion status
   */
  async toggleCompletion() {
    await this.checkbox.click();
  }

  /**
   * Check the todo as completed
   */
  async markCompleted() {
    if (!(await this.isCompleted())) {
      await this.toggleCompletion();
    }
  }

  /**
   * Uncheck the todo as incomplete
   */
  async markIncomplete() {
    if (await this.isCompleted()) {
      await this.toggleCompletion();
    }
  }

  /**
   * Check if todo is completed
   */
  async isCompleted() {
    return await this.checkbox.isChecked();
  }

  /**
   * Start editing the todo
   */
  async startEdit() {
    await this.editButton.click();
    await expect(this.editForm).toBeVisible();
  }

  /**
   * Edit the todo title and description
   */
  async editTodo(newTitle?: string, newDescription?: string) {
    await this.startEdit();
    
    if (newTitle) {
      await this.editTitleInput.clear();
      await this.editTitleInput.fill(newTitle);
    }
    
    if (newDescription !== undefined) {
      await this.editDescriptionInput.clear();
      await this.editDescriptionInput.fill(newDescription);
    }
    
    await this.saveEdit();
  }

  /**
   * Save the edit
   */
  async saveEdit() {
    await this.saveButton.click();
    await expect(this.editForm).not.toBeVisible();
  }

  /**
   * Cancel the edit
   */
  async cancelEdit() {
    await this.cancelButton.click();
    await expect(this.editForm).not.toBeVisible();
  }

  /**
   * Delete the todo (with dialog confirmation)
   */
  async delete() {
    // Set up dialog handler just before clicking and remove after
    const dialogHandler = (dialog: any) => dialog.accept();
    this.page.once('dialog', dialogHandler);
    await this.deleteButton.click();
  }

  /**
   * Get the todo title text
   */
  async getTitleText() {
    return await this.title.textContent();
  }

  /**
   * Get the todo description text
   */
  async getDescriptionText() {
    if (await this.description.isVisible()) {
      return await this.description.textContent();
    }
    return null;
  }

  /**
   * Get the priority text
   */
  async getPriorityText() {
    return await this.priority.textContent();
  }

  /**
   * Get all tag texts
   */
  async getTagTexts() {
    const tags: string[] = [];
    const tagCount = await this.tagElements.count();
    
    for (let i = 0; i < tagCount; i++) {
      const tagText = await this.tagElements.nth(i).textContent();
      if (tagText) {
        tags.push(tagText);
      }
    }
    
    return tags;
  }

  /**
   * Check if todo has description
   */
  async hasDescription() {
    return await this.description.isVisible();
  }

  /**
   * Check if todo has due date
   */
  async hasDueDate() {
    return await this.dueDate.isVisible();
  }

  /**
   * Check if todo has tags
   */
  async hasTags() {
    return await this.tags.isVisible();
  }

  /**
   * Check if todo is overdue
   */
  async isOverdue() {
    return await this.todoItem.evaluate(el => el.classList.contains('overdue'));
  }

  /**
   * Check if todo is in editing mode
   */
  async isEditing() {
    return await this.editForm.isVisible();
  }

  /**
   * Get comprehensive todo data
   */
  async getTodoData(): Promise<TodoItemData> {
    const title = await this.getTitleText() || '';
    const description = await this.getDescriptionText();
    const priorityText = await this.getPriorityText() || '';
    const priority = priorityText.trim() as 'LOW' | 'MEDIUM' | 'HIGH';
    const completed = await this.isCompleted();
    const hasDueDate = await this.hasDueDate();
    const isOverdue = await this.isOverdue();
    const tags = await this.getTagTexts();

    return {
      title,
      description: description || undefined,
      priority,
      completed,
      hasDueDate,
      isOverdue,
      tags: tags.length > 0 ? tags : undefined
    };
  }

  /**
   * Expect todo to have specific title
   */
  async expectTitle(expectedTitle: string) {
    await expect(this.title).toContainText(expectedTitle);
  }

  /**
   * Expect todo to have specific description
   */
  async expectDescription(expectedDescription: string) {
    await expect(this.description).toContainText(expectedDescription);
  }

  /**
   * Expect todo to have specific priority
   */
  async expectPriority(expectedPriority: 'LOW' | 'MEDIUM' | 'HIGH') {
    await expect(this.priority).toContainText(expectedPriority);
  }

  /**
   * Expect todo to be completed
   */
  async expectCompleted() {
    await expect(this.checkbox).toBeChecked();
    await expect(this.todoItem).toHaveClass(/completed/);
  }

  /**
   * Expect todo to be incomplete
   */
  async expectIncomplete() {
    await expect(this.checkbox).not.toBeChecked();
    await expect(this.todoItem).not.toHaveClass(/completed/);
  }

  /**
   * Expect todo to be overdue
   */
  async expectOverdue() {
    await expect(this.todoItem).toHaveClass(/overdue/);
  }

  /**
   * Expect todo to have specific tag
   */
  async expectTag(tagText: string) {
    await expect(this.tagElements.filter({ hasText: tagText })).toBeVisible();
  }

  /**
   * Expect todo to have specific number of tags
   */
  async expectTagCount(count: number) {
    if (count > 0) {
      await expect(this.tagElements).toHaveCount(count);
    } else {
      await expect(this.tags).not.toBeVisible();
    }
  }

  /**
   * Expect edit button to be disabled
   */
  async expectEditDisabled() {
    await expect(this.editButton).toBeDisabled();
  }

  /**
   * Expect edit button to be enabled
   */
  async expectEditEnabled() {
    await expect(this.editButton).toBeEnabled();
  }
}