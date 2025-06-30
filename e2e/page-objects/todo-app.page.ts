import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for the main Todo App page
 * Handles navigation, page loading, and overall app state
 */
export class TodoAppPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly todoListSection: Locator;
  readonly addTodoSection: Locator;
  readonly statsSection: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.getByRole('heading', { name: 'Todo List' });
    this.todoListSection = page.getByRole('main');
    this.addTodoSection = page.getByRole('form', { name: /add new todo/i });
    this.statsSection = page.locator('[role="status"][aria-live="polite"]');
  }

  /**
   * Navigate to the todo app
   */
  async goto() {
    await this.page.goto('/');
    await expect(this.pageTitle).toBeVisible();
  }

  /**
   * Wait for the app to be fully loaded and hydrated
   */
  async waitForAppReady() {
    await expect(this.todoListSection).toBeVisible();
    await expect(this.addTodoSection).toBeVisible();
  }

  /**
   * Get the current stats from the stats section
   */
  async getStats() {
    const statsText = await this.statsSection.textContent();
    if (!statsText) return { total: 0, completed: 0, pending: 0 };

    const totalMatch = statsText.match(/(\d+) total/);
    const completedMatch = statsText.match(/(\d+) completed/);
    const pendingMatch = statsText.match(/(\d+) pending/);

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
    const emptyMessage = this.page.getByText(/no todos found/i);
    return await emptyMessage.isVisible();
  }

  /**
   * Check if stats are visible (only shown when there are todos)
   */
  async areStatsVisible() {
    return await this.statsSection.isVisible();
  }
}