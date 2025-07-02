import { test, expect } from '@playwright/test';
import { TodoAppPage } from './page-objects/todo-app.page';
import { TodoItemPage } from './page-objects/todo-item.page';

test.describe('Todo Statistics - Real-time Updates', () => {
  let todoApp: TodoAppPage;

  test.beforeEach(async ({ page }) => {
    todoApp = new TodoAppPage(page);
    await todoApp.goto();
  });

  test('should show correct stats with single todo', async ({ page }) => {
    // Initially empty state should be visible
    await expect(todoApp.isEmptyStateVisible()).toBeTruthy();

    // Add one todo
    await todoApp.addTodo({ title: 'Single Todo' });

    // Verify stats appear and are correct
    await todoApp.waitForStats({ total: 1, completed: 0, pending: 1 });

    // Complete the todo
    await todoApp.toggleTodoCompletion(0);

    // Verify stats update immediately
    await todoApp.waitForStats({ total: 1, completed: 1, pending: 0 });
  });

  test('should update stats correctly with multiple operations', async ({ page }) => {
    // Add 3 todos
    const todoTitles = ['Todo 1', 'Todo 2', 'Todo 3'];
    
    for (const title of todoTitles) {
      await todoApp.addTodo({ title });
    }

    // Verify initial stats
    await todoApp.waitForStats({ total: 3, completed: 0, pending: 3 });

    // Complete first todo
    await todoApp.toggleTodoCompletion(0);
    
    // Verify stats update
    await todoApp.waitForStats({ completed: 1, pending: 2 });

    // Complete second todo
    await todoApp.toggleTodoCompletion(1);
    
    // Verify stats update again
    await todoApp.waitForStats({ completed: 2, pending: 1 });

    // Delete one completed todo
    await todoApp.deleteTodo(0);

    // Verify stats after deletion
    await todoApp.waitForStats({ total: 2, completed: 1, pending: 1 });
  });

  test('should handle rapid state changes correctly', async ({ page }) => {
    // Add a todo
    await todoApp.addTodo({ title: 'Rapid Change Todo' });

    const todoItem = TodoItemPage.forIndex(page, 0);

    // Rapidly toggle completion status multiple times
    await todoItem.toggleCompletion();
    await todoApp.waitForStats({ completed: 1, pending: 0 });

    await todoItem.toggleCompletion();
    await todoApp.waitForStats({ completed: 0, pending: 1 });

    await todoItem.toggleCompletion();
    await todoApp.waitForStats({ completed: 1, pending: 0 });

    // Total should remain consistent
    await todoApp.waitForStats({ total: 1 });
  });

  test('should return to no stats when all todos deleted', async ({ page }) => {
    // Add multiple todos
    await todoApp.addTodo({ title: 'Todo 1' });
    await todoApp.addTodo({ title: 'Todo 2' });

    // Verify stats are visible
    await todoApp.waitForStats({ total: 2 });

    // Delete all todos
    await todoApp.deleteTodo(0);
    await todoApp.deleteTodo(0); // After first deletion, indices shift

    // Verify empty state returns
    await todoApp.waitForEmptyState();
  });

  test('should show correct stats with mixed priorities', async ({ page }) => {
    // Add todos with different priorities
    const todos = [
      { title: 'High Priority Todo', priority: 'High' as const },
      { title: 'Medium Priority Todo', priority: 'Medium' as const },
      { title: 'Low Priority Todo', priority: 'Low' as const }
    ];

    for (const todo of todos) {
      await todoApp.addTodo(todo);
    }

    // Verify total count
    await todoApp.waitForStats({ total: 3, pending: 3 });

    // Verify all priorities are displayed
    const highPriorityTodo = TodoItemPage.forTitle(page, 'High Priority Todo');
    const mediumPriorityTodo = TodoItemPage.forTitle(page, 'Medium Priority Todo');
    const lowPriorityTodo = TodoItemPage.forTitle(page, 'Low Priority Todo');
    
    await highPriorityTodo.expectPriority('HIGH');
    await mediumPriorityTodo.expectPriority('MEDIUM');
    await lowPriorityTodo.expectPriority('LOW');

    // Complete the high priority todo
    await todoApp.toggleTodoCompletionByTitle('High Priority Todo');

    // Verify stats update
    await todoApp.waitForStats({ total: 3, completed: 1, pending: 2 });
  });

  test('should handle complex scenario with all operations', async ({ page }) => {
    // Add 5 todos
    for (let i = 1; i <= 5; i++) {
      await todoApp.addTodo({ title: `Todo ${i}` });
    }

    // Initial state: 5 total, 0 completed, 5 pending
    await todoApp.waitForStats({ total: 5, completed: 0, pending: 5 });

    // Complete 3 todos
    for (let i = 0; i < 3; i++) {
      await todoApp.toggleTodoCompletion(i);
    }

    // Verify: 5 total, 3 completed, 2 pending
    await todoApp.waitForStats({ total: 5, completed: 3, pending: 2 });

    // Delete 2 completed todos
    await todoApp.deleteTodo(0);
    await todoApp.deleteTodo(0);

    // Verify: 3 total, 1 completed, 2 pending
    await todoApp.waitForStats({ total: 3, completed: 1, pending: 2 });

    // Uncomplete the remaining completed todo
    const todoItems = await todoApp.getTodoCount();
    for (let i = 0; i < todoItems; i++) {
      const todoItem = TodoItemPage.forIndex(page, i);
      if (await todoItem.isCompleted()) {
        await todoItem.toggleCompletion();
        break;
      }
    }

    // Final state: 3 total, 0 completed, 3 pending
    await todoApp.waitForStats({ total: 3, completed: 0, pending: 3 });
  });
});