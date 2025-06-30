import { test, expect } from '@playwright/test';

test.describe('Todo Statistics - Real-time Updates', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Todo List' })).toBeVisible();
  });

  test('should show correct stats with single todo', async ({ page }) => {
    // Initially empty state should be visible
    await expect(page.getByText('No todos found. Add your first todo to get started!')).toBeVisible();

    // Add one todo
    await page.getByRole('textbox', { name: 'Title *' }).fill('Single Todo');
    await page.waitForTimeout(100); // Allow form validation
    const submitButton = page.getByRole('button', { name: 'Add new todo item' });
    await expect(submitButton).toBeEnabled();
    await submitButton.click();

    // Verify stats appear and are correct
    await expect(page.getByText('1 total')).toBeVisible();
    await expect(page.getByText('0 completed')).toBeVisible();
    await expect(page.getByText('1 pending')).toBeVisible();

    // Complete the todo
    await page.locator('input[type="checkbox"]').first().check();

    // Verify stats update immediately
    await expect(page.getByText('1 completed')).toBeVisible();
    await expect(page.getByText('0 pending')).toBeVisible();
    await expect(page.getByText('1 total')).toBeVisible(); // Total remains same
  });

  test('should update stats correctly with multiple operations', async ({ page }) => {
    // Add 3 todos
    const todoTitles = ['Todo 1', 'Todo 2', 'Todo 3'];
    
    for (const title of todoTitles) {
      await page.getByRole('textbox', { name: 'Title *' }).fill(title);
      await page.waitForTimeout(100); // Allow form validation
      const submitButton = page.getByRole('button', { name: 'Add new todo item' });
      await expect(submitButton).toBeEnabled();
      await submitButton.click();
    }

    // Verify initial stats
    await expect(page.getByText('3 total')).toBeVisible();
    await expect(page.getByText('0 completed')).toBeVisible();
    await expect(page.getByText('3 pending')).toBeVisible();

    // Complete first todo
    await page.locator('input[type="checkbox"]').first().check();
    
    // Verify stats update
    await expect(page.getByText('1 completed')).toBeVisible();
    await expect(page.getByText('2 pending')).toBeVisible();

    // Complete second todo
    await page.locator('input[type="checkbox"]').nth(1).check();
    
    // Verify stats update again
    await expect(page.getByText('2 completed')).toBeVisible();
    await expect(page.getByText('1 pending')).toBeVisible();

    // Set up dialog handler for confirmation
    page.on('dialog', dialog => dialog.accept());
    
    // Delete one completed todo
    const deleteButtons = page.getByRole('button', { name: 'Delete todo' });
    await deleteButtons.first().click();

    // Verify stats after deletion
    await expect(page.getByText('2 total')).toBeVisible();
    await expect(page.getByText('1 completed')).toBeVisible();
    await expect(page.getByText('1 pending')).toBeVisible();
  });

  test('should handle rapid state changes correctly', async ({ page }) => {
    // Add a todo
    await page.getByRole('textbox', { name: 'Title *' }).fill('Rapid Change Todo');
    await page.waitForTimeout(100); // Allow form validation
    const submitButton = page.getByRole('button', { name: 'Add new todo item' });
    await expect(submitButton).toBeEnabled();
    await submitButton.click();

    const checkbox = page.locator('input[type="checkbox"]').first();

    // Rapidly toggle completion status multiple times
    await checkbox.check();
    await expect(page.getByText('1 completed')).toBeVisible();
    await expect(page.getByText('0 pending')).toBeVisible();

    await checkbox.uncheck();
    await expect(page.getByText('0 completed')).toBeVisible();
    await expect(page.getByText('1 pending')).toBeVisible();

    await checkbox.check();
    await expect(page.getByText('1 completed')).toBeVisible();
    await expect(page.getByText('0 pending')).toBeVisible();

    // Total should remain consistent
    await expect(page.getByText('1 total')).toBeVisible();
  });

  test('should return to no stats when all todos deleted', async ({ page }) => {
    // Add multiple todos
    await page.getByRole('textbox', { name: 'Title *' }).fill('Todo 1');
    await page.waitForTimeout(100);
    await page.getByRole('button', { name: 'Add new todo item' }).click();
    
    await page.getByRole('textbox', { name: 'Title *' }).fill('Todo 2');
    await page.waitForTimeout(100);
    await page.getByRole('button', { name: 'Add new todo item' }).click();

    // Verify stats are visible
    await expect(page.getByText('2 total')).toBeVisible();

    // Set up dialog handler for confirmations
    page.on('dialog', dialog => dialog.accept());
    
    // Delete all todos
    const deleteButtons = page.getByRole('button', { name: 'Delete todo' });
    await deleteButtons.first().click();
    await deleteButtons.first().click(); // After first deletion, the second button becomes first

    // Verify empty state returns
    await expect(page.getByText('No todos found. Add your first todo to get started!')).toBeVisible();
  });

  test('should show correct stats with mixed priorities', async ({ page }) => {
    // Add todos with different priorities
    const todos = [
      { title: 'High Priority Todo', priority: 'High' },
      { title: 'Medium Priority Todo', priority: 'Medium' },
      { title: 'Low Priority Todo', priority: 'Low' }
    ];

    for (const todo of todos) {
      await page.getByRole('textbox', { name: 'Title *' }).fill(todo.title);
      await page.getByRole('combobox', { name: 'Priority' }).selectOption(todo.priority);
      await page.waitForTimeout(100); // Allow form validation
      const submitButton = page.getByRole('button', { name: 'Add new todo item' });
      await expect(submitButton).toBeEnabled();
      await submitButton.click();
    }

    // Verify total count
    await expect(page.getByText('3 total')).toBeVisible();
    await expect(page.getByText('3 pending')).toBeVisible();

    // Verify all priorities are displayed
    await expect(page.locator('.todo-priority:has-text("HIGH")')).toBeVisible();
    await expect(page.locator('.todo-priority:has-text("MEDIUM")')).toBeVisible();
    await expect(page.locator('.todo-priority:has-text("LOW")')).toBeVisible();

    // Complete the high priority todo
    const todoItems = page.locator('.todo-item');
    const highPriorityItem = todoItems.filter({ hasText: 'High Priority Todo' });
    await highPriorityItem.locator('input[type="checkbox"]').check();

    // Verify stats update
    await expect(page.getByText('1 completed')).toBeVisible();
    await expect(page.getByText('2 pending')).toBeVisible();
    await expect(page.getByText('3 total')).toBeVisible();
  });

  test('should handle complex scenario with all operations', async ({ page }) => {
    // Add 5 todos
    for (let i = 1; i <= 5; i++) {
      await page.getByRole('textbox', { name: 'Title *' }).fill(`Todo ${i}`);
      await page.waitForTimeout(100); // Allow form validation
      const submitButton = page.getByRole('button', { name: 'Add new todo item' });
      await expect(submitButton).toBeEnabled();
      await submitButton.click();
    }

    // Initial state: 5 total, 0 completed, 5 pending
    await expect(page.getByText('5 total')).toBeVisible();
    await expect(page.getByText('0 completed')).toBeVisible();
    await expect(page.getByText('5 pending')).toBeVisible();

    // Complete 3 todos
    for (let i = 0; i < 3; i++) {
      await page.locator('input[type="checkbox"]').nth(i).check();
    }

    // Verify: 5 total, 3 completed, 2 pending
    await expect(page.getByText('5 total')).toBeVisible();
    await expect(page.getByText('3 completed')).toBeVisible();
    await expect(page.getByText('2 pending')).toBeVisible();

    // Set up dialog handler for confirmations
    page.on('dialog', dialog => dialog.accept());
    
    // Delete 2 completed todos
    const deleteButtons = page.getByRole('button', { name: 'Delete todo' });
    await deleteButtons.first().click();
    await deleteButtons.first().click();

    // Verify: 3 total, 1 completed, 2 pending
    await expect(page.getByText('3 total')).toBeVisible();
    await expect(page.getByText('1 completed')).toBeVisible();
    await expect(page.getByText('2 pending')).toBeVisible();

    // Uncomplete the remaining completed todo
    const completedCheckbox = page.locator('input[type="checkbox"]:checked').first();
    await completedCheckbox.uncheck();

    // Final state: 3 total, 0 completed, 3 pending
    await expect(page.getByText('3 total')).toBeVisible();
    await expect(page.getByText('0 completed')).toBeVisible();
    await expect(page.getByText('3 pending')).toBeVisible();
  });
});