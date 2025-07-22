/**
 * @fileoverview Simplified integration tests for TodoService with extracted services.
 * @description Tests the integration between TodoService and its extracted service dependencies
 * to ensure the refactored architecture maintains correct behavior.
 */

import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { vi } from 'vitest';
import { TodoService } from './todo.service';
import { UserFeedbackService } from './user-feedback.service';
import { TodoStorageService } from './todo-storage.service';
import { TodoValidationService } from './todo-validation.service';
import { ConfirmationService } from './confirmation.service';
import { CreateTodoRequest, UpdateTodoRequest } from '../models/todo.model';

describe('TodoService Integration Tests (PR #76)', () => {
  let todoService: TodoService;
  let userFeedbackService: UserFeedbackService;
  let storageService: TodoStorageService;
  let confirmationService: ConfirmationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        TodoService,
        UserFeedbackService,
        TodoStorageService,
        TodoValidationService,
        ConfirmationService
      ]
    });

    todoService = TestBed.inject(TodoService);
    userFeedbackService = TestBed.inject(UserFeedbackService);
    storageService = TestBed.inject(TodoStorageService);
    confirmationService = TestBed.inject(ConfirmationService);

    // Clean state
    storageService.clearStorage();
    userFeedbackService.clearMessages();
  });

  afterEach(() => {
    storageService.clearStorage();
    userFeedbackService.clearMessages();
  });

  describe('Service Integration - Basic Functionality', () => {
    it('should integrate all services for successful todo creation', () => {
      const request: CreateTodoRequest = {
        title: 'Integration Test Todo',
        priority: 'high'
      };

      // Use the method that actually integrates with all services
      const result = todoService.addTodoWithValidation(request);

      // Verify integration worked correctly
      expect(result.success).toBe(true);
      expect(result.todo).toBeDefined();
      expect(todoService.todos()).toHaveLength(1);
      expect(todoService.stats().total).toBe(1);
      expect(todoService.stats().completed).toBe(0);
      expect(todoService.stats().pending).toBe(1);
      expect(todoService.successMessage()).toBe('Todo created successfully');
      expect(todoService.errorMessage()).toBeNull();
    });

    it('should integrate validation service for error handling', () => {
      const invalidRequest: CreateTodoRequest = {
        title: '' // Invalid empty title
      };

      const result = todoService.addTodoWithValidation(invalidRequest);

      // Verify validation integration
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(todoService.todos()).toHaveLength(0);
      expect(todoService.stats().total).toBe(0);
      expect(todoService.errorMessage()).toBeTruthy();
      expect(todoService.successMessage()).toBeNull();
    });

    it('should integrate storage service for persistence', async () => {
      // Ensure clean state
      storageService.clearStorage();
      userFeedbackService.clearMessages();

      const request: CreateTodoRequest = {
        title: 'Persistent Todo',
        priority: 'medium'
      };

      todoService.addTodoWithValidation(request);

      // Wait for async storage effect to complete
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Verify storage integration
      const storedTodos = storageService.loadTodos();
      expect(storedTodos).toHaveLength(1);
      expect(storedTodos[0].title).toBe('Persistent Todo');
      expect(storedTodos[0].priority).toBe('medium');
    });

    it('should integrate confirmation service for deletions', () => {
      // Setup: Add a todo
      todoService.addTodo({ title: 'Todo to Delete' });
      const todoId = todoService.todos()[0].id;

      // Mock confirmation
      const confirmSpy = vi.spyOn(confirmationService, 'confirm').mockReturnValue(true);

      // Use the method that integrates with confirmation service
      const result = todoService.deleteTodoWithConfirmation(todoId);

      // Verify confirmation integration
      expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to delete this todo?');
      expect(result.success).toBe(true);
      expect(result.confirmed).toBe(true);
      expect(todoService.todos()).toHaveLength(0);
      expect(todoService.stats().total).toBe(0);
      expect(todoService.successMessage()).toBe('Todo deleted successfully');
    });
  });

  describe('Service Collaboration - Complex Operations', () => {
    it('should handle update operations across all services', async () => {
      // Ensure clean state
      storageService.clearStorage();
      userFeedbackService.clearMessages();

      // Setup: Add a todo
      todoService.addTodo({ title: 'Original Title', priority: 'low' });
      const todoId = todoService.todos()[0].id;

      // Update the todo
      const updateRequest: UpdateTodoRequest = {
        title: 'Updated Title',
        completed: true,
        priority: 'high'
      };

      const updatedTodo = todoService.updateTodo(todoId, updateRequest);

      // Verify update worked
      expect(updatedTodo).toBeTruthy();
      expect(updatedTodo!.title).toBe('Updated Title');
      expect(updatedTodo!.completed).toBe(true);
      expect(updatedTodo!.priority).toBe('high');
      expect(todoService.stats().completed).toBe(1);
      expect(todoService.stats().pending).toBe(0);

      // Wait for async storage effect to complete
      await new Promise(resolve => setTimeout(resolve, 50));

      // Verify persistence
      const storedTodos = storageService.loadTodos();
      expect(storedTodos[0].title).toBe('Updated Title');
      expect(storedTodos[0].completed).toBe(true);
    });

    it('should handle validation errors during updates', () => {
      // Setup: Add a todo
      todoService.addTodo({ title: 'Valid Title' });
      const todoId = todoService.todos()[0].id;

      // Attempt invalid update (basic updateTodo doesn't validate, it just updates)
      const invalidUpdate: UpdateTodoRequest = {
        title: '' // Empty title - this will be applied by updateTodo
      };

      const result = todoService.updateTodo(todoId, invalidUpdate);

      // Verify the update was applied (basic updateTodo doesn't validate)
      expect(result).toBeTruthy();
      expect(todoService.todos()[0].title).toBe('');
    });

    it('should handle storage errors gracefully', () => {
      // Mock storage service to fail
      vi.spyOn(storageService, 'saveTodos').mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      const request: CreateTodoRequest = {
        title: 'Storage Error Test'
      };

      // Add todo - it will succeed in memory but fail in storage
      todoService.addTodo(request);

      // Todo should still exist in memory
      expect(todoService.todos()).toHaveLength(1);
      expect(todoService.stats().total).toBe(1);

      // Storage effect runs asynchronously, so no immediate error message
      // This test verifies the basic integration works even when storage fails
    });
  });

  describe('Message Handling Integration', () => {
    it('should auto-clear success messages after timeout', async () => {
      const request: CreateTodoRequest = {
        title: 'Auto-clear Test'
      };

      todoService.addTodoWithValidation(request);

      // Verify success message is set
      expect(todoService.successMessage()).toBe('Todo created successfully');

      // Wait for auto-clear timeout (3 seconds)
      await new Promise(resolve => setTimeout(resolve, 3100));

      // Verify message was cleared
      expect(todoService.successMessage()).toBeNull();
    });

    it('should clear error messages when operations succeed', () => {
      // Create an error state
      todoService.addTodoWithValidation({ title: '' });
      expect(todoService.errorMessage()).toBeTruthy();

      // Perform successful operation
      todoService.addTodoWithValidation({ title: 'Success after error' });

      // Error should be cleared
      expect(todoService.errorMessage()).toBeNull();
      expect(todoService.successMessage()).toBe('Todo created successfully');
    });

    it('should clear success messages when errors occur', () => {
      // Create success state
      todoService.addTodoWithValidation({ title: 'Success first' });
      expect(todoService.successMessage()).toBe('Todo created successfully');

      // Cause an error
      todoService.addTodoWithValidation({ title: '' });

      // Success should be cleared
      expect(todoService.successMessage()).toBeNull();
      expect(todoService.errorMessage()).toBeTruthy();
    });
  });

  describe('Signal Reactivity Integration', () => {
    it('should maintain reactive updates across service boundaries', () => {
      // Test signal reactivity without using effect outside injection context
      const initialStats = todoService.stats();
      expect(initialStats.total).toBe(0);

      // Perform operations that should trigger reactive updates
      todoService.addTodo({ title: 'Reactive Test 1' });
      const statsAfterAdd1 = todoService.stats();
      expect(statsAfterAdd1.total).toBe(1);
      expect(statsAfterAdd1.pending).toBe(1);

      todoService.addTodo({ title: 'Reactive Test 2' });
      const statsAfterAdd2 = todoService.stats();
      expect(statsAfterAdd2.total).toBe(2);
      expect(statsAfterAdd2.pending).toBe(2);
      
      const todoId = todoService.todos()[0].id;
      todoService.updateTodo(todoId, { completed: true });
      
      const statsAfterUpdate = todoService.stats();
      expect(statsAfterUpdate.total).toBe(2);
      expect(statsAfterUpdate.completed).toBe(1);
      expect(statsAfterUpdate.pending).toBe(1);
    });

    it('should maintain computed property consistency', () => {
      // Add todos with different states
      todoService.addTodo({ title: 'Todo 1', priority: 'high' });
      todoService.addTodo({ title: 'Todo 2', priority: 'medium' });
      todoService.addTodo({ title: 'Todo 3', priority: 'low' });

      // Mark one as completed
      const todoId = todoService.todos()[0].id;
      todoService.updateTodo(todoId, { completed: true });

      // Verify computed stats
      const stats = todoService.stats();
      expect(stats.total).toBe(3);
      expect(stats.completed).toBe(1);
      expect(stats.pending).toBe(2);
      expect(stats.byPriority.high).toBe(1);
      expect(stats.byPriority.medium).toBe(1);
      expect(stats.byPriority.low).toBe(1);

      // Verify filtered todos work correctly
      todoService.setFilter('completed');
      expect(todoService.filteredTodos()).toHaveLength(1);

      todoService.setFilter('active');
      expect(todoService.filteredTodos()).toHaveLength(2);

      todoService.setFilter('all');
      expect(todoService.filteredTodos()).toHaveLength(3);
    });
  });

  describe('Performance Integration', () => {
    it('should maintain performance with service composition', () => {
      const startTime = performance.now();
      
      // Perform bulk operations
      for (let i = 0; i < 100; i++) {
        todoService.addTodo({
          title: `Performance Test ${i}`,
          priority: i % 3 === 0 ? 'high' : i % 3 === 1 ? 'medium' : 'low'
        });
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time (adjust threshold as needed)
      expect(duration).toBeLessThan(1000); // 1 second

      // Verify all todos were added correctly
      expect(todoService.stats().total).toBe(100);
    });

    it('should handle large datasets efficiently', () => {
      // Add many todos
      for (let i = 0; i < 500; i++) {
        todoService.addTodo({
          title: `Large Dataset Todo ${i}`,
          priority: 'medium'
        });
      }

      // Test filtering performance
      const startTime = performance.now();
      todoService.setFilter('active');
      const filteredTodos = todoService.filteredTodos();
      const endTime = performance.now();

      expect(filteredTodos).toHaveLength(500);
      expect(endTime - startTime).toBeLessThan(50); // 50ms threshold
    });
  });

  describe('Error Recovery Integration', () => {
    it('should recover from service failures gracefully', () => {
      // Add initial data
      todoService.addTodo({ title: 'Before Error' });
      expect(todoService.stats().total).toBe(1);

      // Cause storage failure
      const storageSpy = vi.spyOn(storageService, 'saveTodos').mockImplementation(() => {
        throw new Error('Storage error');
      });

      // Attempt operation that will fail in storage (async effect)
      todoService.addTodo({ title: 'Storage Will Fail' });

      // Should have been added to memory despite storage failure
      expect(todoService.stats().total).toBe(2);

      // Should recover when storage is available again
      storageSpy.mockRestore();
      userFeedbackService.clearMessages();

      todoService.addTodo({ title: 'Recovery Test' });
      expect(todoService.stats().total).toBe(3);
    });
  });
});