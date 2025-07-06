import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { vi, expect } from 'vitest';
import { ErrorHandlerService } from './error-handler.service';

describe('ErrorHandlerService', () => {
  let service: ErrorHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        ErrorHandlerService
      ]
    });
    service = TestBed.inject(ErrorHandlerService);
  });

  describe('Service Creation', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });
  });

  describe('handleError', () => {
    let consoleSpy: any;

    beforeEach(() => {
      consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {
        // Intentionally empty for test
      });
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    describe('Basic Error Handling', () => {
      it('should log error with context', () => {
        const error = new Error('Test error');
        const context = 'TodoService.addTodo';

        service.handleError(error, context);

        expect(consoleSpy).toHaveBeenCalledWith(`[${context}] Error:`, error);
      });

      it('should handle Error object', () => {
        const error = new Error('Test error message');
        const context = 'Component action';

        service.handleError(error, context);

        expect(consoleSpy).toHaveBeenCalledWith(`[${context}] Error:`, error);
      });

      it('should handle string error', () => {
        const error = 'String error message';
        const context = 'Service operation';

        service.handleError(error, context);

        expect(consoleSpy).toHaveBeenCalledWith(`[${context}] Error:`, error);
      });

      it('should handle null error', () => {
        const error = null;
        const context = 'Null error test';

        service.handleError(error, context);

        expect(consoleSpy).toHaveBeenCalledWith(`[${context}] Error:`, 'Unknown error occurred');
      });

      it('should handle undefined error', () => {
        const error = undefined;
        const context = 'Undefined error test';

        service.handleError(error, context);

        expect(consoleSpy).toHaveBeenCalledWith(`[${context}] Error:`, 'Unknown error occurred');
      });
    });

    describe('Context Handling', () => {
      it('should handle empty context', () => {
        const error = new Error('Test error');
        const context = '';

        service.handleError(error, context);

        expect(consoleSpy).toHaveBeenCalledWith('[Unknown Context] Error:', error);
      });

      it('should handle null context', () => {
        const error = new Error('Test error');
        const context = null as unknown as string;

        service.handleError(error, context);

        expect(consoleSpy).toHaveBeenCalledWith('[Unknown Context] Error:', error);
      });

      it('should handle undefined context', () => {
        const error = new Error('Test error');
        const context = undefined as unknown as string;

        service.handleError(error, context);

        expect(consoleSpy).toHaveBeenCalledWith('[Unknown Context] Error:', error);
      });

      it('should trim whitespace from context', () => {
        const error = new Error('Test error');
        const context = '  TodoService.updateTodo  ';

        service.handleError(error, context);

        expect(consoleSpy).toHaveBeenCalledWith('[TodoService.updateTodo] Error:', error);
      });
    });

    describe('Error Types', () => {
      it('should handle TypeError', () => {
        const error = new TypeError('Cannot read property of undefined');
        const context = 'Component.method';

        service.handleError(error, context);

        expect(consoleSpy).toHaveBeenCalledWith(`[${context}] Error:`, error);
      });

      it('should handle ReferenceError', () => {
        const error = new ReferenceError('Variable is not defined');
        const context = 'Service.operation';

        service.handleError(error, context);

        expect(consoleSpy).toHaveBeenCalledWith(`[${context}] Error:`, error);
      });

      it('should handle custom error object', () => {
        const error = { message: 'Custom error', code: 500 };
        const context = 'API.call';

        service.handleError(error, context);

        expect(consoleSpy).toHaveBeenCalledWith(`[${context}] Error:`, error);
      });

      it('should handle number as error', () => {
        const error = 404;
        const context = 'HTTP.request';

        service.handleError(error, context);

        expect(consoleSpy).toHaveBeenCalledWith(`[${context}] Error:`, error);
      });
    });

    describe('Console Availability', () => {
      it('should handle missing console gracefully', () => {
        // Mock console as undefined (some environments)
        const originalConsole = global.console;
        (global as any).console = undefined;

        const error = new Error('Test error');
        const context = 'Test context';

        // Should not throw
        expect(() => service.handleError(error, context)).not.toThrow();

        // Restore console
        global.console = originalConsole;
      });

      it('should handle missing console.error gracefully', () => {
        // Mock console.error as undefined
        const originalError = console.error;
        (console as any).error = undefined;

        const error = new Error('Test error');
        const context = 'Test context';

        // Should not throw
        expect(() => service.handleError(error, context)).not.toThrow();

        // Restore console.error
        console.error = originalError;
      });
    });
  });

  describe('handleValidationError', () => {
    let consoleSpy: any;

    beforeEach(() => {
      consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {
        // Intentionally empty for test
      });
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it('should handle validation error with single message', () => {
      const validationErrors = ['Title is required'];
      const context = 'TodoService.addTodo';

      service.handleValidationError(validationErrors, context);

      expect(consoleSpy).toHaveBeenCalledWith(`[${context}] Validation Error:`, 'Title is required');
    });

    it('should handle validation error with multiple messages', () => {
      const validationErrors = ['Title is required', 'Priority must be low, medium, or high'];
      const context = 'TodoService.addTodo';

      service.handleValidationError(validationErrors, context);

      expect(consoleSpy).toHaveBeenCalledWith(`[${context}] Validation Error:`, 'Title is required; Priority must be low, medium, or high');
    });

    it('should handle empty validation errors array', () => {
      const validationErrors: string[] = [];
      const context = 'TodoService.addTodo';

      service.handleValidationError(validationErrors, context);

      expect(consoleSpy).toHaveBeenCalledWith(`[${context}] Validation Error:`, 'Unknown validation error');
    });

    it('should handle null validation errors', () => {
      const validationErrors = null as unknown as string[];
      const context = 'TodoService.addTodo';

      service.handleValidationError(validationErrors, context);

      expect(consoleSpy).toHaveBeenCalledWith(`[${context}] Validation Error:`, 'Unknown validation error');
    });

    it('should handle undefined validation errors', () => {
      const validationErrors = undefined as unknown as string[];
      const context = 'TodoService.addTodo';

      service.handleValidationError(validationErrors, context);

      expect(consoleSpy).toHaveBeenCalledWith(`[${context}] Validation Error:`, 'Unknown validation error');
    });

    it('should filter out empty error messages', () => {
      const validationErrors = ['Title is required', '', '   ', 'Priority is required'];
      const context = 'TodoService.addTodo';

      service.handleValidationError(validationErrors, context);

      expect(consoleSpy).toHaveBeenCalledWith(`[${context}] Validation Error:`, 'Title is required; Priority is required');
    });
  });

  describe('handleTodoNotFoundError', () => {
    let consoleSpy: any;

    beforeEach(() => {
      consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {
        // Intentionally empty for test
      });
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it('should handle todo not found error with ID', () => {
      const todoId = 'todo-123';
      const context = 'TodoService.deleteTodo';

      service.handleTodoNotFoundError(todoId, context);

      expect(consoleSpy).toHaveBeenCalledWith(`[${context}] Todo Not Found:`, `Todo with ID "${todoId}" not found`);
    });

    it('should handle todo not found error without ID', () => {
      const context = 'TodoService.toggleTodo';

      service.handleTodoNotFoundError(undefined, context);

      expect(consoleSpy).toHaveBeenCalledWith(`[${context}] Todo Not Found:`, 'Todo not found');
    });

    it('should handle empty todo ID', () => {
      const todoId = '';
      const context = 'TodoService.updateTodo';

      service.handleTodoNotFoundError(todoId, context);

      expect(consoleSpy).toHaveBeenCalledWith(`[${context}] Todo Not Found:`, 'Todo not found');
    });

    it('should handle null todo ID', () => {
      const todoId = null as unknown as string;
      const context = 'TodoService.getTodo';

      service.handleTodoNotFoundError(todoId, context);

      expect(consoleSpy).toHaveBeenCalledWith(`[${context}] Todo Not Found:`, 'Todo not found');
    });
  });

  describe('Context Processing', () => {
    let consoleSpy: any;

    beforeEach(() => {
      consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {
        // Intentionally empty for test
      });
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it('should process context consistently across all methods', () => {
      const error = new Error('Test');
      const validationErrors = ['Validation failed'];
      const todoId = 'todo-123';
      const context = '  TodoService.method  ';

      service.handleError(error, context);
      service.handleValidationError(validationErrors, context);
      service.handleTodoNotFoundError(todoId, context);

      expect(consoleSpy).toHaveBeenCalledWith('[TodoService.method] Error:', error);
      expect(consoleSpy).toHaveBeenCalledWith('[TodoService.method] Validation Error:', 'Validation failed');
      expect(consoleSpy).toHaveBeenCalledWith('[TodoService.method] Todo Not Found:', 'Todo with ID "todo-123" not found');
    });
  });

  describe('Future Extension Points', () => {
    it('should be extensible for user-facing error notifications', () => {
      // This test documents that the service is designed to be extended
      // for future user-facing error notifications, logging services, etc.
      expect(service.handleError).toBeDefined();
      expect(service.handleValidationError).toBeDefined();
      expect(service.handleTodoNotFoundError).toBeDefined();
      expect(typeof service.handleError).toBe('function');
      expect(typeof service.handleValidationError).toBe('function');
      expect(typeof service.handleTodoNotFoundError).toBe('function');
    });

    it('should support various error types for future logging integration', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Test different error types that might be logged to external services
      const networkError = new Error('Network request failed');
      const validationErrors = ['Multiple', 'validation', 'issues'];
      const notFoundId = 'missing-todo-456';

      service.handleError(networkError, 'API.request');
      service.handleValidationError(validationErrors, 'Form.submit');
      service.handleTodoNotFoundError(notFoundId, 'Cache.lookup');

      expect(consoleSpy).toHaveBeenCalledTimes(3);
      
      consoleSpy.mockRestore();
    });
  });
});