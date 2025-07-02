import { test, expect } from '@playwright/test';
import { TodoAppPage } from './page-objects/todo-app.page';
import { TodoItemPage } from './page-objects/todo-item.page';

test.describe('Todo App - Main User Flows', () => {
  let todoApp: TodoAppPage;

  test.beforeEach(async ({ page }) => {
    todoApp = new TodoAppPage(page);
    await todoApp.goto();
  });

  test('should display empty state when no todos exist', async ({ page }) => {
    // Verify empty state message is shown
    await expect(todoApp.isEmptyStateVisible()).toBeTruthy();
    
    // Verify the add todo form is visible
    await expect(todoApp.addTodoForm).toBeVisible();
  });

  test('should add a new todo successfully', async ({ page }) => {
    // Add a todo using the page object
    await todoApp.addTodo({
      title: 'My First Todo',
      description: 'This is a test todo item'
    });
    
    // Verify the todo appears in the list
    await todoApp.expectTodoWithTitle('My First Todo');
    await expect(todoApp.getTodoItemByTitle('My First Todo').getByText('This is a test todo item')).toBeVisible();
    
    // Verify stats are now visible and correct
    await todoApp.waitForStats({ total: 1, completed: 0, pending: 1 });
  });

  test('should toggle todo completion status', async ({ page }) => {
    // First add a todo
    await todoApp.addTodo({ title: 'Toggle Test Todo' });
    
    // Get the todo item page object
    const todoItem = TodoItemPage.forIndex(page, 0);
    
    // Toggle completion to completed
    await todoItem.toggleCompletion();
    await todoItem.expectCompleted();
    
    // Verify stats updated
    await todoApp.waitForStats({ completed: 1, pending: 0 });
    
    // Toggle back to incomplete
    await todoItem.toggleCompletion();
    await todoItem.expectIncomplete();
    
    // Verify stats updated again
    await todoApp.waitForStats({ completed: 0, pending: 1 });
  });

  test('should delete a todo successfully', async ({ page }) => {
    // Add a todo first
    await todoApp.addTodo({ title: 'Todo to Delete' });
    
    // Verify todo exists
    await todoApp.expectTodoWithTitle('Todo to Delete');
    
    // Delete the todo
    await todoApp.deleteTodo(0);
    
    // Wait for empty state to appear (confirms deletion worked)
    await todoApp.waitForEmptyState();
  });

  test('should handle multiple todos correctly', async ({ page }) => {
    // Add multiple todos
    const todos = [
      { title: 'First Todo', description: 'First description' },
      { title: 'Second Todo', description: 'Second description' },
      { title: 'Third Todo', description: 'Third description' }
    ];

    for (const todo of todos) {
      await todoApp.addTodo(todo);
    }

    // Verify all todos are displayed
    for (const todo of todos) {
      await todoApp.expectTodoWithTitle(todo.title);
    }

    // Verify correct stats
    await todoApp.waitForStats({ total: 3, completed: 0, pending: 3 });

    // Complete the first todo
    await todoApp.toggleTodoCompletion(0);

    // Verify updated stats
    await todoApp.waitForStats({ completed: 1, pending: 2 });

    // Delete the second todo
    await todoApp.deleteTodo(1);

    // Verify updated stats after deletion
    await todoApp.waitForStats({ total: 2 });
    await todoApp.expectTodoWithTitleNotVisible('Second Todo');
  });

  test('should preserve todo state on page reload', async ({ page }) => {
    // Add a todo
    await todoApp.addTodo({ title: 'Persistent Todo' });
    
    // Complete the todo
    await todoApp.toggleTodoCompletion(0);
    
    // Wait for localStorage to save (allow time for effect to run)
    await page.waitForTimeout(200);
    
    // Verify localStorage contains the data
    const storageData = await page.evaluate(() => {
      return localStorage.getItem('todo-app-todos');
    });
    expect(storageData).toBeTruthy();
    
    // Parse and verify the todo is marked as completed in storage
    const storedTodos = JSON.parse(storageData!);
    expect(storedTodos).toHaveLength(1);
    expect(storedTodos[0].completed).toBe(true);
    expect(storedTodos[0].title).toBe('Persistent Todo');
    
    // Reload the page
    await page.reload();
    await todoApp.waitForAppReady();
    
    // Verify todo and its state are preserved
    await todoApp.expectTodoWithTitle('Persistent Todo');
    
    // Verify the todo is still marked as completed
    const todoItem = TodoItemPage.forIndex(page, 0);
    await todoItem.expectCompleted();
    
    // Verify stats are correct
    await todoApp.waitForStats({ total: 1, completed: 1 });
  });
});