import { test, expect } from '@playwright/test';
import { TodoAppPage } from './page-objects/todo-app.page';
import { TodoFormPage } from './page-objects/todo-form.page';
import { TodoItemPage } from './page-objects/todo-item.page';

test.describe('Todo Form - Validation and Features', () => {
  let todoApp: TodoAppPage;
  let todoForm: TodoFormPage;

  test.beforeEach(async ({ page }) => {
    todoApp = new TodoAppPage(page);
    todoForm = new TodoFormPage(page);
    await todoApp.goto();
  });

  test('should validate required title field', async ({ page }) => {
    // 1. Wait for form to be ready and trigger validation
    await todoForm.waitForFormReady();
    await todoForm.focusAndBlurTitle(); // This will trigger validation and make button disabled
    
    // 2. Now test that validation triggered properly
    await todoForm.expectTitleError();
    await todoForm.expectButtonDisabled();
    
    // 3. Test invalid input (spaces only) keeps form disabled
    await todoForm.fillSpacesInTitle();
    await todoForm.expectButtonDisabled();
    
    // 4. Test valid input enables form
    await todoForm.fillTitle('Valid Title');
    await todoForm.expectButtonEnabled();
    await todoForm.expectNoErrors();
    
    // 5. Test successful submission
    await todoForm.submitForm();
    await todoApp.expectTodoWithTitle('Valid Title');
  });

  test('should show validation error for empty title', async ({ page }) => {
    // Trigger title validation by focusing and blurring
    await todoForm.triggerTitleValidation();
    
    // Check if validation error appears
    await todoForm.expectTitleError();
    
    // Submit button should be disabled
    await todoForm.expectFormInvalid();
  });

  test('should handle priority selection', async ({ page }) => {
    // Add high priority todo
    await todoForm.fillTitle('Priority Test Todo');
    await todoForm.selectPriority('High');
    await todoForm.submitForm();
    
    // Verify todo appears with high priority
    await todoApp.expectTodoWithTitle('Priority Test Todo');
    const highPriorityTodo = TodoItemPage.forTitle(page, 'Priority Test Todo');
    await highPriorityTodo.expectPriority('HIGH');
    
    // Add another todo with low priority
    await todoForm.fillTitle('Low Priority Todo');
    await todoForm.selectPriority('Low');
    await todoForm.submitForm();
    
    // Verify both priorities are displayed
    const lowPriorityTodo = TodoItemPage.forTitle(page, 'Low Priority Todo');
    await lowPriorityTodo.expectPriority('LOW');
    await highPriorityTodo.expectPriority('HIGH');
  });

  test('should handle due date selection', async ({ page }) => {
    // Get tomorrow's date in YYYY-MM-DD format
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowString = tomorrow.toISOString().split('T')[0];
    
    // Fill form with due date
    await todoForm.fillTitle('Due Date Todo');
    await todoForm.setDueDate(tomorrowString);
    await todoForm.submitForm();
    
    // Verify todo appears with due date indicator
    await todoApp.expectTodoWithTitle('Due Date Todo');
    
    // Verify due date is displayed
    const todoWithDueDate = TodoItemPage.forTitle(page, 'Due Date Todo');
    await expect(todoWithDueDate.hasDueDate()).toBeTruthy();
  });

  test('should handle tag management', async ({ page }) => {
    // Fill basic fields
    await todoForm.fillTitle('Tagged Todo');
    
    // Add tags
    await todoForm.addTag('work');
    await todoForm.addTag('important');
    
    // Verify tags appear as chips
    await todoForm.expectTag('work');
    await todoForm.expectTag('important');
    await todoForm.expectTagCount(2);
    
    // Submit form
    await todoForm.submitForm();
    
    // Verify todo appears with tags
    await todoApp.expectTodoWithTitle('Tagged Todo');
    
    // Verify tags are displayed in the todo item
    const todoItem = TodoItemPage.forTitle(page, 'Tagged Todo');
    await todoItem.expectTag('work');
    await todoItem.expectTag('important');
    await todoItem.expectTagCount(2);
  });

  test('should remove tags when clicking remove button', async ({ page }) => {
    // Fill title
    await todoForm.fillTitle('Tag Removal Test');
    
    // Add tags
    await todoForm.addTags(['tag1', 'tag2']);
    
    // Verify both tags are visible
    await todoForm.expectTagCount(2);
    await todoForm.expectTag('tag1');
    await todoForm.expectTag('tag2');
    
    // Remove first tag
    await todoForm.removeTag(0);
    
    // Verify only second tag remains
    await todoForm.expectTagCount(1);
    await todoForm.expectTag('tag2');
  });

  test('should handle complex form with all fields', async ({ page }) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowString = tomorrow.toISOString().split('T')[0];
    
    // Fill all form fields using page object
    await todoApp.addTodo({
      title: 'Complete Todo',
      description: 'This todo has all fields filled',
      priority: 'High',
      dueDate: tomorrowString,
      tags: ['complete', 'test']
    });
    
    // Verify all elements appear in the todo item
    await todoApp.expectTodoWithTitle('Complete Todo');
    
    const todoItem = TodoItemPage.forTitle(page, 'Complete Todo');
    await todoItem.expectDescription('This todo has all fields filled');
    await todoItem.expectPriority('HIGH');
    await expect(todoItem.hasDueDate()).toBeTruthy();
    await todoItem.expectTag('complete');
    await todoItem.expectTag('test');
    await todoItem.expectTagCount(2);
  });

  test('should prevent past due dates', async ({ page }) => {
    // Get yesterday's date
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split('T')[0];
    
    // Fill form with past date
    await todoForm.fillTitle('Past Date Todo');
    await todoForm.setDueDate(yesterdayString);
    
    // Trigger validation
    await todoForm.triggerDueDateValidation();
    
    // Check for validation error
    await todoForm.expectDueDateError();
    
    // Submit button should be disabled
    await todoForm.expectFormInvalid();
  });
});