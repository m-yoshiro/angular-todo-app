import { Page, Locator, expect } from '@playwright/test';

export interface CreateTodoData {
  title: string;
  description?: string;
  priority?: 'Low' | 'Medium' | 'High';
  dueDate?: string;
  tags?: string[];
}

export interface TodoStats {
  total: number;
  completed: number;
  pending: number;
}

/**
 * Page Object Model for the main Todo App page
 * Handles navigation, page loading, form interactions, and todo management
 */
export class TodoAppPage {
  readonly page: Page;
  
  // Main page elements
  readonly pageTitle: Locator;
  readonly todoListSection: Locator;
  readonly statsSection: Locator;
  readonly emptyState: Locator;
  
  // Form elements
  readonly addTodoForm: Locator;
  readonly titleInput: Locator;
  readonly descriptionInput: Locator;
  readonly prioritySelect: Locator;
  readonly dueDateInput: Locator;
  readonly tagInput: Locator;
  readonly submitButton: Locator;
  
  // Todo list elements
  readonly todoItemsList: Locator;
  readonly todoItems: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Main page elements
    this.pageTitle = page.getByTestId('todo-list-title');
    this.todoListSection = page.getByTestId('todo-list');
    this.statsSection = page.getByTestId('todo-stats');
    this.emptyState = page.getByTestId('empty-state');
    
    // Form elements
    this.addTodoForm = page.getByTestId('add-todo-form');
    this.titleInput = page.getByTestId('title-input');
    this.descriptionInput = page.getByTestId('description-input');
    this.prioritySelect = page.getByTestId('priority-select');
    this.dueDateInput = page.getByTestId('due-date-input');
    this.tagInput = page.getByTestId('tag-input');
    this.submitButton = page.getByTestId('submit-button');
    
    // Todo list elements
    this.todoItemsList = page.getByTestId('todo-items-list');
    this.todoItems = page.getByTestId('todo-item');
  }

  /**
   * Navigate to the todo app and wait for it to be ready
   */
  async goto() {
    await this.page.goto('/');
    await this.waitForAppReady();
  }

  /**
   * Wait for the app to be fully loaded and hydrated
   */
  async waitForAppReady() {
    await expect(this.pageTitle).toBeVisible();
    await expect(this.todoListSection).toBeVisible();
    await expect(this.addTodoForm).toBeVisible();
  }

  /**
   * Wait for form to be valid and submit button to be enabled
   */
  async waitForFormValid() {
    await expect(this.submitButton).toBeEnabled();
  }

  /**
   * Wait for form validation to complete after input changes
   */
  async waitForFormValidation() {
    // Wait a short time for Angular's reactive form validation to process
    await this.page.waitForFunction(() => {
      const form = document.querySelector('[data-testid="add-todo-form"]');
      return form && (form.classList.contains('ng-valid') || form.classList.contains('ng-invalid'));
    });
  }

  /**
   * Add a new todo with comprehensive form handling
   */
  async addTodo(data: CreateTodoData) {
    // Fill title (required)
    await this.titleInput.fill(data.title);
    
    // Fill description if provided
    if (data.description) {
      await this.descriptionInput.fill(data.description);
    }
    
    // Select priority if provided
    if (data.priority) {
      await this.prioritySelect.selectOption(data.priority);
    }
    
    // Set due date if provided
    if (data.dueDate) {
      await this.dueDateInput.fill(data.dueDate);
    }
    
    // Add tags if provided
    if (data.tags && data.tags.length > 0) {
      for (const tag of data.tags) {
        await this.tagInput.fill(tag);
        await this.tagInput.press('Enter');
      }
    }
    
    // Wait for form validation
    await this.waitForFormValidation();
    await this.waitForFormValid();
    
    // Submit the form
    await this.submitButton.click();
    
    // Wait for form to reset (indicating successful submission)
    await expect(this.titleInput).toHaveValue('');
  }

  /**
   * Get todo item by index
   */
  getTodoItem(index: number) {
    return this.todoItems.nth(index);
  }

  /**
   * Get todo item by title text
   */
  getTodoItemByTitle(title: string) {
    return this.todoItems.filter({ hasText: title });
  }

  /**
   * Toggle completion status of a todo by index
   */
  async toggleTodoCompletion(index: number) {
    const todoItem = this.getTodoItem(index);
    const checkbox = todoItem.getByTestId('todo-checkbox');
    await checkbox.click();
  }

  /**
   * Toggle completion status of a todo by title
   */
  async toggleTodoCompletionByTitle(title: string) {
    const todoItem = this.getTodoItemByTitle(title);
    const checkbox = todoItem.getByTestId('todo-checkbox');
    await checkbox.click();
  }

  /**
   * Delete a todo by index with confirmation dialog handling
   */
  async deleteTodo(index: number) {
    const todoItem = this.getTodoItem(index);
    const deleteButton = todoItem.getByTestId('delete-button');
    
    // Set up dialog handler just before clicking and remove after
    const dialogHandler = (dialog: any) => dialog.accept();
    this.page.once('dialog', dialogHandler);
    await deleteButton.click();
  }

  /**
   * Delete a todo by title with confirmation dialog handling
   */
  async deleteTodoByTitle(title: string) {
    const todoItem = this.getTodoItemByTitle(title);
    const deleteButton = todoItem.getByTestId('delete-button');
    
    // Set up dialog handler just before clicking and remove after
    const dialogHandler = (dialog: any) => dialog.accept();
    this.page.once('dialog', dialogHandler);
    await deleteButton.click();
  }

  /**
   * Wait for stats to update to expected values
   */
  async waitForStats(expectedStats: Partial<TodoStats>) {
    if (expectedStats.total !== undefined) {
      await expect(this.page.getByTestId('total-stat')).toContainText(`${expectedStats.total} total`);
    }
    if (expectedStats.completed !== undefined) {
      await expect(this.page.getByTestId('completed-stat')).toContainText(`${expectedStats.completed} completed`);
    }
    if (expectedStats.pending !== undefined) {
      await expect(this.page.getByTestId('pending-stat')).toContainText(`${expectedStats.pending} pending`);
    }
  }

  /**
   * Get the current stats from the stats section
   */
  async getStats(): Promise<TodoStats> {
    if (!(await this.statsSection.isVisible())) {
      return { total: 0, completed: 0, pending: 0 };
    }

    const totalText = await this.page.getByTestId('total-stat').textContent();
    const completedText = await this.page.getByTestId('completed-stat').textContent();
    const pendingText = await this.page.getByTestId('pending-stat').textContent();

    const totalMatch = totalText?.match(/(\d+) total/);
    const completedMatch = completedText?.match(/(\d+) completed/);
    const pendingMatch = pendingText?.match(/(\d+) pending/);

    return {
      total: totalMatch ? parseInt(totalMatch[1]) : 0,
      completed: completedMatch ? parseInt(completedMatch[1]) : 0,
      pending: pendingMatch ? parseInt(pendingMatch[1]) : 0
    };
  }

  /**
   * Check if the empty state is displayed
   */
  async isEmptyStateVisible() {
    return await this.emptyState.isVisible();
  }

  /**
   * Check if stats are visible (only shown when there are todos)
   */
  async areStatsVisible() {
    return await this.statsSection.isVisible();
  }

  /**
   * Wait for empty state to appear
   */
  async waitForEmptyState() {
    await expect(this.emptyState).toBeVisible();
  }

  /**
   * Wait for todos to be visible
   */
  async waitForTodosVisible() {
    await expect(this.todoItemsList).toBeVisible();
  }

  /**
   * Get the count of visible todos
   */
  async getTodoCount() {
    return await this.todoItems.count();
  }

  /**
   * Wait for todo count to match expected number
   */
  async waitForTodoCount(expectedCount: number) {
    await expect(this.todoItems).toHaveCount(expectedCount);
  }

  /**
   * Verify a todo with specific title exists
   */
  async expectTodoWithTitle(title: string) {
    await expect(this.getTodoItemByTitle(title)).toBeVisible();
  }

  /**
   * Verify a todo with specific title does not exist
   */
  async expectTodoWithTitleNotVisible(title: string) {
    await expect(this.getTodoItemByTitle(title)).not.toBeVisible();
  }
}