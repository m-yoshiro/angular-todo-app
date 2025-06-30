import { test, expect } from '@playwright/test';

test.describe('Todo Form - Validation and Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Todo List' })).toBeVisible();
  });

  test('should validate required title field', async ({ page }) => {
    // Try to submit form without title
    await page.getByRole('button', { name: 'Add new todo item' }).click();
    
    // Verify form was not submitted (no new todo appears)
    await expect(page.getByText('No todos found. Add your first todo to get started!')).toBeVisible();
    
    // Fill only description without title
    await page.getByRole('textbox', { name: 'Description' }).fill('Description without title');
    await page.getByRole('button', { name: 'Add new todo item' }).click();
    
    // Verify still no todo added
    await expect(page.getByText('No todos found. Add your first todo to get started!')).toBeVisible();
    
    // Now add title and submit
    await page.getByRole('textbox', { name: 'Title *' }).fill('Valid Title');
    await page.getByRole('button', { name: 'Add new todo item' }).click();
    
    // Verify todo is now added
    await expect(page.getByText('Valid Title')).toBeVisible();
  });

  test('should show validation error for empty title', async ({ page }) => {
    // Focus on title field then blur it without entering text
    await page.getByRole('textbox', { name: 'Title *' }).focus();
    await page.getByRole('textbox', { name: 'Description' }).focus(); // Blur title field
    
    // Check if validation error appears
    const errorMessage = page.getByText(/title is required/i);
    await expect(errorMessage).toBeVisible();
    
    // Submit button should be disabled
    const submitButton = page.getByRole('button', { name: 'Add new todo item' });
    await expect(submitButton).toBeDisabled();
  });

  test('should handle priority selection', async ({ page }) => {
    // Fill required fields
    await page.getByRole('textbox', { name: 'Title *' }).fill('Priority Test Todo');
    
    // Select high priority
    await page.getByRole('combobox', { name: 'Priority' }).selectOption('High');
    
    // Submit form
    await page.getByRole('button', { name: 'Add new todo item' }).click();
    
    // Verify todo appears with high priority
    await expect(page.getByText('Priority Test Todo')).toBeVisible();
    await expect(page.locator('.todo-priority:has-text("HIGH")')).toBeVisible();
    
    // Add another todo with low priority
    await page.getByRole('textbox', { name: 'Title *' }).fill('Low Priority Todo');
    await page.getByRole('combobox', { name: 'Priority' }).selectOption('Low');
    await page.getByRole('button', { name: 'Add new todo item' }).click();
    
    // Verify both priorities are displayed
    await expect(page.locator('.todo-priority:has-text("LOW")')).toBeVisible();
    await expect(page.locator('.todo-priority:has-text("HIGH")')).toBeVisible();
  });

  test('should handle due date selection', async ({ page }) => {
    // Get tomorrow's date in YYYY-MM-DD format
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowString = tomorrow.toISOString().split('T')[0];
    
    // Fill form with due date
    await page.getByRole('textbox', { name: 'Title *' }).fill('Due Date Todo');
    await page.getByRole('textbox', { name: 'Due Date' }).fill(tomorrowString);
    
    // Submit form
    await page.getByRole('button', { name: 'Add new todo item' }).click();
    
    // Verify todo appears with due date indicator
    await expect(page.getByText('Due Date Todo')).toBeVisible();
    
    // Look for calendar icon or due date display
    const dueDateIndicator = page.locator('.todo-due-date, [class*="due-date"]');
    await expect(dueDateIndicator).toBeVisible();
  });

  test('should handle tag management', async ({ page }) => {
    // Fill basic fields
    await page.getByRole('textbox', { name: 'Title *' }).fill('Tagged Todo');
    
    // Add tags using the tag input
    const tagInput = page.getByRole('textbox', { name: 'Add tags to your todo item' });
    
    // Add first tag
    await tagInput.fill('work');
    await tagInput.press('Enter');
    
    // Add second tag
    await tagInput.fill('important');
    await tagInput.press('Enter');
    
    // Verify tags appear as chips
    await expect(page.getByText('work')).toBeVisible();
    await expect(page.getByText('important')).toBeVisible();
    
    // Submit form
    await page.getByRole('button', { name: 'Add new todo item' }).click();
    
    // Verify todo appears with tags
    await expect(page.getByText('Tagged Todo')).toBeVisible();
    
    // Verify tags are displayed in the todo item
    const todoItem = page.locator('.todo-item').first();
    await expect(todoItem.getByText('work')).toBeVisible();
    await expect(todoItem.getByText('important')).toBeVisible();
  });

  test('should remove tags when clicking remove button', async ({ page }) => {
    // Fill title
    await page.getByRole('textbox', { name: 'Title *' }).fill('Tag Removal Test');
    
    // Add tags
    const tagInput = page.getByRole('textbox', { name: 'Add tags to your todo item' });
    await tagInput.fill('tag1');
    await tagInput.press('Enter');
    await tagInput.fill('tag2');
    await tagInput.press('Enter');
    
    // Verify both tags are visible
    await expect(page.getByText('tag1')).toBeVisible();
    await expect(page.getByText('tag2')).toBeVisible();
    
    // Remove first tag
    const removeButtons = page.getByRole('button', { name: 'Remove tag' });
    await removeButtons.first().click();
    
    // Verify only second tag remains
    await expect(page.getByText('tag1')).not.toBeVisible();
    await expect(page.getByText('tag2')).toBeVisible();
  });

  test('should handle complex form with all fields', async ({ page }) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowString = tomorrow.toISOString().split('T')[0];
    
    // Fill all form fields
    await page.getByRole('textbox', { name: 'Title *' }).fill('Complete Todo');
    await page.getByRole('textbox', { name: 'Description' }).fill('This todo has all fields filled');
    await page.getByRole('combobox', { name: 'Priority' }).selectOption('High');
    await page.getByRole('textbox', { name: 'Due Date' }).fill(tomorrowString);
    
    // Add tags
    const tagInput = page.getByRole('textbox', { name: 'Add tags to your todo item' });
    await tagInput.fill('complete');
    await tagInput.press('Enter');
    await tagInput.fill('test');
    await tagInput.press('Enter');
    
    // Submit form
    await page.getByRole('button', { name: 'Add new todo item' }).click();
    
    // Verify all elements appear in the todo item
    await expect(page.getByText('Complete Todo')).toBeVisible();
    await expect(page.getByText('This todo has all fields filled')).toBeVisible();
    await expect(page.locator('.todo-priority:has-text("HIGH")')).toBeVisible();
    
    const todoItem = page.locator('.todo-item').first();
    await expect(todoItem.getByText('complete')).toBeVisible();
    await expect(todoItem.getByText('test')).toBeVisible();
    
    // Verify form is reset after submission
    await expect(page.getByRole('textbox', { name: 'Title *' })).toHaveValue('');
    await expect(page.getByRole('textbox', { name: 'Description' })).toHaveValue('');
    await expect(page.getByRole('textbox', { name: 'Due Date' })).toHaveValue('');
  });

  test('should prevent past due dates', async ({ page }) => {
    // Get yesterday's date
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split('T')[0];
    
    // Fill form with past date
    await page.getByRole('textbox', { name: 'Title *' }).fill('Past Date Todo');
    await page.getByRole('textbox', { name: 'Due Date' }).fill(yesterdayString);
    
    // Blur the date field to trigger validation
    await page.getByRole('textbox', { name: 'Title *' }).focus();
    
    // Check for validation error
    const errorMessage = page.getByText(/due date cannot be in the past/i);
    await expect(errorMessage).toBeVisible();
    
    // Submit button should be disabled
    const submitButton = page.getByRole('button', { name: 'Add new todo item' });
    await expect(submitButton).toBeDisabled();
  });
});