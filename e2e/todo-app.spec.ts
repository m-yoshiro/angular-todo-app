import { test, expect } from '@playwright/test';

test.describe('Todo App - Main User Flows', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the todo app
    await page.goto('/');
    
    // Wait for the app to load
    await expect(page.getByRole('heading', { name: 'Todo List' })).toBeVisible();
  });

  test('should display empty state when no todos exist', async ({ page }) => {
    // Verify empty state message is shown
    await expect(page.getByText('No todos found. Add your first todo to get started!')).toBeVisible();
    
    // Verify the add todo form is visible
    await expect(page.getByRole('form', { name: 'Add new todo form' })).toBeVisible();
  });

  test('should add a new todo successfully', async ({ page }) => {
    // Fill in the todo form
    await page.getByRole('textbox', { name: 'Title *' }).fill('My First Todo');
    await page.getByRole('textbox', { name: 'Description' }).fill('This is a test todo item');
    
    // Wait for form to be valid and submit
    await page.waitForTimeout(100); // Allow form validation to complete
    const submitButton = page.getByRole('button', { name: 'Add new todo item' });
    await expect(submitButton).toBeEnabled();
    await submitButton.click();
    
    // Verify the todo appears in the list
    await expect(page.getByText('My First Todo')).toBeVisible();
    await expect(page.getByText('This is a test todo item')).toBeVisible();
    
    // Verify the form is reset
    await expect(page.getByRole('textbox', { name: 'Title *' })).toHaveValue('');
    await expect(page.getByRole('textbox', { name: 'Description' })).toHaveValue('');
    
    // Verify stats are now visible and correct
    await expect(page.getByText('1 total')).toBeVisible();
    await expect(page.getByText('0 completed')).toBeVisible();
    await expect(page.getByText('1 pending')).toBeVisible();
  });

  test('should toggle todo completion status', async ({ page }) => {
    // First add a todo
    await page.getByRole('textbox', { name: 'Title *' }).fill('Toggle Test Todo');
    await page.getByRole('button', { name: 'Add new todo item' }).click();
    
    // Find and click the checkbox to complete the todo
    const todoCheckbox = page.locator('input[type="checkbox"]').first();
    await todoCheckbox.check();
    
    // Verify the todo appears completed (has completed class)
    const todoItem = page.locator('.todo-item').first();
    await expect(todoItem).toHaveClass(/completed/);
    
    // Verify stats updated
    await expect(page.getByText('1 completed')).toBeVisible();
    await expect(page.getByText('0 pending')).toBeVisible();
    
    // Toggle back to incomplete
    await todoCheckbox.uncheck();
    
    // Verify the todo is no longer completed
    await expect(todoItem).not.toHaveClass(/completed/);
    
    // Verify stats updated again
    await expect(page.getByText('0 completed')).toBeVisible();
    await expect(page.getByText('1 pending')).toBeVisible();
  });

  test('should delete a todo successfully', async ({ page }) => {
    // Add a todo first
    await page.getByRole('textbox', { name: 'Title *' }).fill('Todo to Delete');
    await page.getByRole('button', { name: 'Add new todo item' }).click();
    
    // Verify todo exists
    await expect(page.getByText('Todo to Delete')).toBeVisible();
    
    // Set up dialog handler for confirmation
    page.on('dialog', dialog => dialog.accept());
    
    // Click delete button
    await page.getByRole('button', { name: 'Delete todo' }).click();
    
    // Wait for empty state to appear (confirms deletion worked)
    await expect(page.getByText('No todos found. Add your first todo to get started!')).toBeVisible();
  });

  test('should handle multiple todos correctly', async ({ page }) => {
    // Add multiple todos
    const todos = [
      { title: 'First Todo', description: 'First description' },
      { title: 'Second Todo', description: 'Second description' },
      { title: 'Third Todo', description: 'Third description' }
    ];

    for (const todo of todos) {
      await page.getByRole('textbox', { name: 'Title *' }).fill(todo.title);
      await page.getByRole('textbox', { name: 'Description' }).fill(todo.description);
      await page.waitForTimeout(100); // Allow form validation
      const submitButton = page.getByRole('button', { name: 'Add new todo item' });
      await expect(submitButton).toBeEnabled();
      await submitButton.click();
    }

    // Verify all todos are displayed
    for (const todo of todos) {
      await expect(page.getByText(todo.title)).toBeVisible();
    }

    // Verify correct stats
    await expect(page.getByText('3 total')).toBeVisible();
    await expect(page.getByText('0 completed')).toBeVisible();     
    await expect(page.getByText('3 pending')).toBeVisible();

    // Complete the first todo
    const firstCheckbox = page.locator('input[type="checkbox"]').first();
    await firstCheckbox.check();

    // Verify updated stats
    await expect(page.getByText('1 completed')).toBeVisible();
    await expect(page.getByText('2 pending')).toBeVisible();

    // Set up dialog handler for confirmation
    page.on('dialog', dialog => dialog.accept());
    
    // Delete the second todo
    const deleteButtons = page.getByRole('button', { name: 'Delete todo' });
    await deleteButtons.nth(1).click();

    // Verify updated stats after deletion
    await expect(page.getByText('2 total')).toBeVisible();
    await expect(page.getByText('Second Todo')).not.toBeVisible();
  });

  test('should preserve todo state on page reload', async ({ page }) => {
    // Add a todo
    await page.getByRole('textbox', { name: 'Title *' }).fill('Persistent Todo');
    await page.getByRole('button', { name: 'Add new todo item' }).click();
    
    // Complete the todo
    await page.locator('input[type="checkbox"]').first().check();
    
    // Reload the page
    await page.reload();
    
    // Wait for app to load again
    await expect(page.getByRole('heading', { name: 'Todo List' })).toBeVisible();
    
    // Verify todo and its state are preserved
    await expect(page.getByText('Persistent Todo')).toBeVisible();
    
    // Verify the todo is still marked as completed
    const todoItem = page.locator('.todo-item').first();
    await expect(todoItem).toHaveClass(/completed/);
    
    // Verify stats are correct
    await expect(page.getByText('1 total')).toBeVisible();
    await expect(page.getByText('1 completed')).toBeVisible();
  });
});