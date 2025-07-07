import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { vi } from 'vitest';
import { TodoService } from './todo.service';
import { ConfirmationService } from './confirmation.service';
import { CreateTodoRequest, UpdateTodoRequest } from '../models/todo.model';

describe('TodoService', () => {
  let service: TodoService;
  let confirmationService: ConfirmationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()]
    });
    service = TestBed.inject(TodoService);
    confirmationService = TestBed.inject(ConfirmationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initial state', () => {
    it('should have empty todos list', () => {
      expect(service.todos()).toEqual([]);
    });

    it('should have zero stats', () => {
      const stats = service.stats();
      expect(stats.total).toBe(0);
      expect(stats.completed).toBe(0);
      expect(stats.pending).toBe(0);
      expect(stats.overdue).toBe(0);
      expect(stats.byPriority.low).toBe(0);
      expect(stats.byPriority.medium).toBe(0);
      expect(stats.byPriority.high).toBe(0);
    });
  });

  describe('addTodo', () => {
    it('should add a new todo with required fields', () => {
      const request: CreateTodoRequest = {
        title: 'Test Todo'
      };

      const todo = service.addTodo(request);

      expect(todo.id).toBeDefined();
      expect(todo.title).toBe('Test Todo');
      expect(todo.completed).toBe(false);
      expect(todo.priority).toBe('medium');
      expect(todo.createdAt).toBeInstanceOf(Date);
      expect(todo.updatedAt).toBeInstanceOf(Date);
      expect(todo.tags).toEqual([]);
      expect(service.todos().length).toBe(1);
    });

    it('should add todo with all optional fields', () => {
      const dueDate = new Date('2024-12-31');
      const request: CreateTodoRequest = {
        title: 'Complete Todo',
        description: 'A complete todo with all fields',
        priority: 'high',
        dueDate: dueDate,
        tags: ['work', 'urgent']
      };

      const todo = service.addTodo(request);

      expect(todo.title).toBe('Complete Todo');
      expect(todo.description).toBe('A complete todo with all fields');
      expect(todo.priority).toBe('high');
      expect(todo.dueDate).toEqual(dueDate);
      expect(todo.tags).toEqual(['work', 'urgent']);
    });

    it('should update stats when adding todos', () => {
      service.addTodo({ title: 'Todo 1', priority: 'low' });
      service.addTodo({ title: 'Todo 2', priority: 'high' });

      const stats = service.stats();
      expect(stats.total).toBe(2);
      expect(stats.pending).toBe(2);
      expect(stats.completed).toBe(0);
      expect(stats.byPriority.low).toBe(1);
      expect(stats.byPriority.high).toBe(1);
    });
  });

  describe('updateTodo', () => {
    it('should update existing todo', () => {
      const todo = service.addTodo({ title: 'Original Title' });
      const updateRequest: UpdateTodoRequest = {
        title: 'Updated Title',
        description: 'Updated description',
        priority: 'high'
      };

      const updatedTodo = service.updateTodo(todo.id, updateRequest);

      expect(updatedTodo).toBeTruthy();
      expect(updatedTodo!.title).toBe('Updated Title');
      expect(updatedTodo!.description).toBe('Updated description');
      expect(updatedTodo!.priority).toBe('high');
      expect(updatedTodo!.updatedAt.getTime()).toBeGreaterThanOrEqual(updatedTodo!.createdAt.getTime());
    });

    it('should return null for non-existent todo', () => {
      const result = service.updateTodo('non-existent-id', { title: 'Updated' });
      expect(result).toBeNull();
    });

    it('should update only specified fields', () => {
      const todo = service.addTodo({ 
        title: 'Original Title', 
        description: 'Original description',
        priority: 'low'
      });

      service.updateTodo(todo.id, { title: 'Updated Title' });
      const updatedTodo = service.getTodoById(todo.id);

      expect(updatedTodo!.title).toBe('Updated Title');
      expect(updatedTodo!.description).toBe('Original description');
      expect(updatedTodo!.priority).toBe('low');
    });
  });

  describe('toggleTodo', () => {
    it('should toggle todo completion status', () => {
      const todo = service.addTodo({ title: 'Test Todo' });
      expect(todo.completed).toBe(false);

      const toggledTodo = service.toggleTodo(todo.id);
      expect(toggledTodo!.completed).toBe(true);

      const toggledAgain = service.toggleTodo(todo.id);
      expect(toggledAgain!.completed).toBe(false);
    });

    it('should update stats when toggling', () => {
      const todo = service.addTodo({ title: 'Test Todo' });
      
      service.toggleTodo(todo.id);
      let stats = service.stats();
      expect(stats.completed).toBe(1);
      expect(stats.pending).toBe(0);

      service.toggleTodo(todo.id);
      stats = service.stats();
      expect(stats.completed).toBe(0);
      expect(stats.pending).toBe(1);
    });

    it('should return null for non-existent todo', () => {
      const result = service.toggleTodo('non-existent-id');
      expect(result).toBeNull();
    });
  });

  describe('deleteTodo', () => {
    it('should delete existing todo', () => {
      const todo = service.addTodo({ title: 'Test Todo' });
      expect(service.todos().length).toBe(1);

      const deleted = service.deleteTodo(todo.id);
      expect(deleted).toBe(true);
      expect(service.todos().length).toBe(0);
    });

    it('should return false for non-existent todo', () => {
      const deleted = service.deleteTodo('non-existent-id');
      expect(deleted).toBe(false);
    });

    it('should update stats when deleting', () => {
      service.addTodo({ title: 'Todo 1' });
      const todo2 = service.addTodo({ title: 'Todo 2' });
      service.toggleTodo(todo2.id);

      service.deleteTodo(todo2.id);
      const stats = service.stats();
      expect(stats.total).toBe(1);
      expect(stats.completed).toBe(0);
      expect(stats.pending).toBe(1);
    });
  });

  describe('getTodoById', () => {
    it('should return todo by id', () => {
      const todo = service.addTodo({ title: 'Test Todo' });
      const foundTodo = service.getTodoById(todo.id);
      expect(foundTodo).toEqual(todo);
    });

    it('should return undefined for non-existent id', () => {
      const foundTodo = service.getTodoById('non-existent-id');
      expect(foundTodo).toBeUndefined();
    });
  });

  describe('clearCompleted', () => {
    it('should remove all completed todos', () => {
      const todo1 = service.addTodo({ title: 'Todo 1' });
      const todo2 = service.addTodo({ title: 'Todo 2' });
      const todo3 = service.addTodo({ title: 'Todo 3' });

      service.toggleTodo(todo1.id);
      service.toggleTodo(todo3.id);

      service.clearCompleted();
      
      expect(service.todos().length).toBe(1);
      expect(service.todos()[0].id).toBe(todo2.id);
    });

    it('should update stats after clearing completed', () => {
      service.addTodo({ title: 'Todo 1' });
      const todo2 = service.addTodo({ title: 'Todo 2' });
      service.toggleTodo(todo2.id);

      service.clearCompleted();
      const stats = service.stats();
      expect(stats.total).toBe(1);
      expect(stats.completed).toBe(0);
      expect(stats.pending).toBe(1);
    });
  });

  describe('stats computation', () => {
    it('should calculate overdue todos correctly', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      service.addTodo({ title: 'Overdue Todo', dueDate: pastDate });
      service.addTodo({ title: 'Future Todo', dueDate: futureDate });
      service.addTodo({ title: 'No Due Date' });

      const stats = service.stats();
      expect(stats.overdue).toBe(1);
    });

    it('should not count completed todos as overdue', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      
      const todo = service.addTodo({ title: 'Overdue Todo', dueDate: pastDate });
      service.toggleTodo(todo.id);

      const stats = service.stats();
      expect(stats.overdue).toBe(0);
    });
  });

  describe('signal reactivity', () => {
    it('should update computed stats when todos change', () => {
      const initialStats = service.stats();
      service.addTodo({ title: 'Test Todo' });
      const updatedStats = service.stats();
      
      expect(updatedStats.total).toBeGreaterThan(initialStats.total);
    });
  });

  describe('filtering functionality', () => {
    describe('initial filter state', () => {
      it('should have default filter set to "all"', () => {
        expect(service.currentFilter()).toBe('all');
      });

      it('should have filteredTodos equal to todos initially', () => {
        service.addTodo({ title: 'Test Todo' });
        expect(service.filteredTodos()).toEqual(service.todos());
      });
    });

    describe('setFilter', () => {
      it('should set filter to "all"', () => {
        service.setFilter('all');
        expect(service.currentFilter()).toBe('all');
      });

      it('should set filter to "active"', () => {
        service.setFilter('active');
        expect(service.currentFilter()).toBe('active');
      });

      it('should set filter to "completed"', () => {
        service.setFilter('completed');
        expect(service.currentFilter()).toBe('completed');
      });
    });

    describe('convenience filter methods', () => {
      it('should set filter to "all" when calling showAll', () => {
        service.showAll();
        expect(service.currentFilter()).toBe('all');
      });

      it('should set filter to "active" when calling showActive', () => {
        service.showActive();
        expect(service.currentFilter()).toBe('active');
      });

      it('should set filter to "completed" when calling showCompleted', () => {
        service.showCompleted();
        expect(service.currentFilter()).toBe('completed');
      });
    });

    describe('filteredTodos computed signal', () => {
      beforeEach(() => {
        // Create test todos: 2 active, 2 completed
        service.addTodo({ title: 'Active Todo 1' });
        service.addTodo({ title: 'Active Todo 2' });
        const todo3 = service.addTodo({ title: 'Completed Todo 1' });
        const todo4 = service.addTodo({ title: 'Completed Todo 2' });
        
        // Mark two as completed
        service.toggleTodo(todo3.id);
        service.toggleTodo(todo4.id);
      });

      it('should return all todos when filter is "all"', () => {
        service.setFilter('all');
        const filtered = service.filteredTodos();
        expect(filtered.length).toBe(4);
        expect(filtered).toEqual(service.todos());
      });

      it('should return only active todos when filter is "active"', () => {
        service.setFilter('active');
        const filtered = service.filteredTodos();
        expect(filtered.length).toBe(2);
        expect(filtered.every(todo => !todo.completed)).toBe(true);
        expect(filtered.some(todo => todo.title === 'Active Todo 1')).toBe(true);
        expect(filtered.some(todo => todo.title === 'Active Todo 2')).toBe(true);
      });

      it('should return only completed todos when filter is "completed"', () => {
        service.setFilter('completed');
        const filtered = service.filteredTodos();
        expect(filtered.length).toBe(2);
        expect(filtered.every(todo => todo.completed)).toBe(true);
        expect(filtered.some(todo => todo.title === 'Completed Todo 1')).toBe(true);
        expect(filtered.some(todo => todo.title === 'Completed Todo 2')).toBe(true);
      });

      it('should return empty array when no todos match filter', () => {
        // Clear all todos and add only active ones
        service.clearCompleted();
        service.setFilter('completed');
        const filtered = service.filteredTodos();
        expect(filtered.length).toBe(0);
      });
    });

    describe('filter reactivity', () => {
      it('should update filteredTodos when filter changes', () => {
        const todo1 = service.addTodo({ title: 'Active Todo' });
        const todo2 = service.addTodo({ title: 'Completed Todo' });
        service.toggleTodo(todo2.id);

        // Start with all todos
        service.setFilter('all');
        expect(service.filteredTodos().length).toBe(2);

        // Switch to active only
        service.setFilter('active');
        expect(service.filteredTodos().length).toBe(1);
        expect(service.filteredTodos()[0].id).toBe(todo1.id);

        // Switch to completed only
        service.setFilter('completed');
        expect(service.filteredTodos().length).toBe(1);
        expect(service.filteredTodos()[0].id).toBe(todo2.id);
      });

      it('should update filteredTodos when todos change', () => {
        service.setFilter('active');
        
        // Add an active todo
        const todo = service.addTodo({ title: 'New Active Todo' });
        expect(service.filteredTodos().length).toBe(1);

        // Complete the todo
        service.toggleTodo(todo.id);
        expect(service.filteredTodos().length).toBe(0);

        // Switch to completed filter
        service.setFilter('completed');
        expect(service.filteredTodos().length).toBe(1);
      });

      it('should maintain filter state when adding new todos', () => {
        service.setFilter('active');
        
        service.addTodo({ title: 'Active Todo 1' });
        expect(service.filteredTodos().length).toBe(1);

        service.addTodo({ title: 'Active Todo 2' });
        expect(service.filteredTodos().length).toBe(2);
        expect(service.currentFilter()).toBe('active');
      });

      it('should maintain filter state when deleting todos', () => {
        const todo1 = service.addTodo({ title: 'Active Todo' });
        const todo2 = service.addTodo({ title: 'Completed Todo' });
        service.toggleTodo(todo2.id);

        service.setFilter('active');
        expect(service.filteredTodos().length).toBe(1);

        service.deleteTodo(todo1.id);
        expect(service.filteredTodos().length).toBe(0);
        expect(service.currentFilter()).toBe('active');
      });
    });

    describe('edge cases', () => {
      it('should handle empty todos list for all filters', () => {
        service.setFilter('all');
        expect(service.filteredTodos().length).toBe(0);

        service.setFilter('active');
        expect(service.filteredTodos().length).toBe(0);

        service.setFilter('completed');
        expect(service.filteredTodos().length).toBe(0);
      });

      it('should handle default case in filteredTodos switch statement', () => {
        service.addTodo({ title: 'Test Todo' });
        
        // Force an invalid filter state (though this shouldn't happen in normal use)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (service as any)._currentFilter.set('invalid');
        
        const filtered = service.filteredTodos();
        expect(filtered).toEqual(service.todos());
      });

      it('should update filteredTodos when clearCompleted is called', () => {
        const todo1 = service.addTodo({ title: 'Active Todo' });
        const todo2 = service.addTodo({ title: 'Completed Todo' });
        service.toggleTodo(todo2.id);

        service.setFilter('all');
        expect(service.filteredTodos().length).toBe(2);

        service.clearCompleted();
        expect(service.filteredTodos().length).toBe(1);
        expect(service.filteredTodos()[0].id).toBe(todo1.id);
      });
    });
  });

  describe('validateCreateRequest', () => {
    it('should return valid for correct request', () => {
      const request: CreateTodoRequest = {
        title: 'Valid Todo',
        description: 'Valid description',
        priority: 'medium'
      };

      const result = service.validateCreateRequest(request);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return invalid for null request', () => {
      const result = service.validateCreateRequest(null as unknown as CreateTodoRequest);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Request is required');
    });

    it('should return invalid for undefined request', () => {
      const result = service.validateCreateRequest(undefined as unknown as CreateTodoRequest);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Request is required');
    });

    it('should return invalid for empty title', () => {
      const request: CreateTodoRequest = {
        title: ''
      };

      const result = service.validateCreateRequest(request);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Title is required');
    });

    it('should return invalid for whitespace-only title', () => {
      const request: CreateTodoRequest = {
        title: '   '
      };

      const result = service.validateCreateRequest(request);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Title is required');
    });

    it('should return invalid for missing title', () => {
      const request = {} as CreateTodoRequest;

      const result = service.validateCreateRequest(request);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Title is required');
    });

    it('should return invalid for title exceeding 200 characters', () => {
      const request: CreateTodoRequest = {
        title: 'a'.repeat(201)
      };

      const result = service.validateCreateRequest(request);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Title cannot exceed 200 characters');
    });

    it('should return valid for title exactly 200 characters', () => {
      const request: CreateTodoRequest = {
        title: 'a'.repeat(200)
      };

      const result = service.validateCreateRequest(request);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return invalid for description exceeding 1000 characters', () => {
      const request: CreateTodoRequest = {
        title: 'Valid Title',
        description: 'a'.repeat(1001)
      };

      const result = service.validateCreateRequest(request);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Description cannot exceed 1000 characters');
    });

    it('should return valid for description exactly 1000 characters', () => {
      const request: CreateTodoRequest = {
        title: 'Valid Title',
        description: 'a'.repeat(1000)
      };

      const result = service.validateCreateRequest(request);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return valid for undefined description', () => {
      const request: CreateTodoRequest = {
        title: 'Valid Title',
        description: undefined
      };

      const result = service.validateCreateRequest(request);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return valid for empty description', () => {
      const request: CreateTodoRequest = {
        title: 'Valid Title',
        description: ''
      };

      const result = service.validateCreateRequest(request);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should handle all optional fields', () => {
      const request: CreateTodoRequest = {
        title: 'Complete Todo',
        description: 'A complete description',
        priority: 'high',
        dueDate: new Date('2024-12-31'),
        tags: ['work', 'important']
      };

      const result = service.validateCreateRequest(request);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  describe('confirmAndDelete', () => {
    let todo: ReturnType<typeof service.addTodo>;

    beforeEach(() => {
      todo = service.addTodo({ title: 'Test Todo' });
    });

    it('should delete todo when user confirms', () => {
      vi.spyOn(confirmationService, 'confirm').mockReturnValue(true);

      const result = service.confirmAndDelete(todo.id);

      expect(confirmationService.confirm).toHaveBeenCalledWith('Are you sure you want to delete this todo?');
      expect(result).toBe(true);
      expect(service.getTodoById(todo.id)).toBeUndefined();
    });

    it('should not delete todo when user cancels', () => {
      vi.spyOn(confirmationService, 'confirm').mockReturnValue(false);

      const result = service.confirmAndDelete(todo.id);

      expect(confirmationService.confirm).toHaveBeenCalledWith('Are you sure you want to delete this todo?');
      expect(result).toBe(false);
      expect(service.getTodoById(todo.id)).toBeDefined();
    });

    it('should return false for non-existent todo even if user confirms', () => {
      vi.spyOn(confirmationService, 'confirm').mockReturnValue(true);

      const result = service.confirmAndDelete('non-existent-id');

      expect(confirmationService.confirm).toHaveBeenCalledWith('Are you sure you want to delete this todo?');
      expect(result).toBe(false);
    });

    it('should not call delete service if user cancels confirmation', () => {
      vi.spyOn(confirmationService, 'confirm').mockReturnValue(false);
      const deleteSpyFunction = vi.spyOn(service, 'deleteTodo');

      service.confirmAndDelete(todo.id);

      expect(deleteSpyFunction).not.toHaveBeenCalled();
      deleteSpyFunction.mockRestore();
    });

    it('should call delete service only after user confirms', () => {
      vi.spyOn(confirmationService, 'confirm').mockReturnValue(true);
      const deleteSpyFunction = vi.spyOn(service, 'deleteTodo');

      service.confirmAndDelete(todo.id);

      expect(confirmationService.confirm).toHaveBeenCalledBefore(deleteSpyFunction);
      expect(deleteSpyFunction).toHaveBeenCalledWith(todo.id);
      deleteSpyFunction.mockRestore();
    });

    it('should update todos list and stats after successful confirmed deletion', () => {
      vi.spyOn(confirmationService, 'confirm').mockReturnValue(true);
      const initialCount = service.todos().length;
      const initialStats = service.stats();

      const result = service.confirmAndDelete(todo.id);

      expect(result).toBe(true);
      expect(service.todos().length).toBe(initialCount - 1);
      expect(service.stats().total).toBe(initialStats.total - 1);
    });
  });

  describe('user feedback signals and message management', () => {
    it('should initialize feedback signals with default values', () => {
      expect(service.errorMessage()).toBeNull();
      expect(service.successMessage()).toBeNull();
      expect(service.isLoading()).toBe(false);
    });

    it('should set and clear error messages', () => {
      service.setErrorMessage('Test error');
      expect(service.errorMessage()).toBe('Test error');
      expect(service.successMessage()).toBeNull(); // Should clear success message

      service.clearMessages();
      expect(service.errorMessage()).toBeNull();
      expect(service.successMessage()).toBeNull();
    });

    it('should set and clear success messages', () => {
      service.setSuccessMessage('Test success');
      expect(service.successMessage()).toBe('Test success');
      expect(service.errorMessage()).toBeNull(); // Should clear error message

      service.clearMessages();
      expect(service.errorMessage()).toBeNull();
      expect(service.successMessage()).toBeNull();
    });

    it('should set loading state', () => {
      service.setLoading(true);
      expect(service.isLoading()).toBe(true);

      service.setLoading(false);
      expect(service.isLoading()).toBe(false);
    });

    it('should clear success message when setting error message', () => {
      service.setSuccessMessage('Success message');
      service.setErrorMessage('Error message');
      
      expect(service.errorMessage()).toBe('Error message');
      expect(service.successMessage()).toBeNull();
    });

    it('should clear error message when setting success message', () => {
      service.setErrorMessage('Error message');
      service.setSuccessMessage('Success message');
      
      expect(service.successMessage()).toBe('Success message');
      expect(service.errorMessage()).toBeNull();
    });
  });

  describe('addTodoWithValidation', () => {
    it('should create todo successfully with valid request', () => {
      const request: CreateTodoRequest = {
        title: 'Valid Todo',
        description: 'Valid description',
        priority: 'high'
      };

      const result = service.addTodoWithValidation(request);

      expect(result.success).toBe(true);
      expect(result.todo).toBeDefined();
      expect(result.todo!.title).toBe('Valid Todo');
      expect(result.error).toBeUndefined();
      expect(service.successMessage()).toBe('Todo created successfully');
      expect(service.errorMessage()).toBeNull();
      expect(service.isLoading()).toBe(false);
      expect(service.todos().length).toBe(1);
    });

    it('should fail validation with empty title', () => {
      const request: CreateTodoRequest = {
        title: ''
      };

      const result = service.addTodoWithValidation(request);

      expect(result.success).toBe(false);
      expect(result.todo).toBeUndefined();
      expect(result.error).toBe('Title is required');
      expect(service.errorMessage()).toBe('Title is required');
      expect(service.successMessage()).toBeNull();
      expect(service.isLoading()).toBe(false);
      expect(service.todos().length).toBe(0);
    });

    it('should fail validation with title too long', () => {
      const request: CreateTodoRequest = {
        title: 'a'.repeat(201)
      };

      const result = service.addTodoWithValidation(request);

      expect(result.success).toBe(false);
      expect(result.todo).toBeUndefined();
      expect(result.error).toBe('Title cannot exceed 200 characters');
      expect(service.errorMessage()).toBe('Title cannot exceed 200 characters');
      expect(service.successMessage()).toBeNull();
      expect(service.isLoading()).toBe(false);
      expect(service.todos().length).toBe(0);
    });

    it('should fail validation with description too long', () => {
      const request: CreateTodoRequest = {
        title: 'Valid Title',
        description: 'a'.repeat(1001)
      };

      const result = service.addTodoWithValidation(request);

      expect(result.success).toBe(false);
      expect(result.todo).toBeUndefined();
      expect(result.error).toBe('Description cannot exceed 1000 characters');
      expect(service.errorMessage()).toBe('Description cannot exceed 1000 characters');
      expect(service.successMessage()).toBeNull();
      expect(service.isLoading()).toBe(false);
      expect(service.todos().length).toBe(0);
    });

    it('should clear messages before processing', () => {
      service.setErrorMessage('Previous error');
      service.setSuccessMessage('Previous success');

      const request: CreateTodoRequest = {
        title: 'Valid Todo'
      };

      service.addTodoWithValidation(request);

      expect(service.successMessage()).toBe('Todo created successfully');
      expect(service.errorMessage()).toBeNull();
    });

    it('should handle exception during todo creation', () => {
      const request: CreateTodoRequest = {
        title: 'Valid Todo'
      };

      // Mock addTodo to throw an error
      const originalAddTodo = service.addTodo;
      service.addTodo = vi.fn().mockImplementation(() => {
        throw new Error('Simulated error');
      });

      const result = service.addTodoWithValidation(request);

      expect(result.success).toBe(false);
      expect(result.todo).toBeUndefined();
      expect(result.error).toBe('Failed to create todo. Please try again.');
      expect(service.errorMessage()).toBe('Failed to create todo. Please try again.');
      expect(service.successMessage()).toBeNull();
      expect(service.isLoading()).toBe(false);

      // Restore original method
      service.addTodo = originalAddTodo;
    });
  });

  describe('toggleTodoSafely', () => {
    let todo: ReturnType<typeof service.addTodo>;

    beforeEach(() => {
      todo = service.addTodo({ title: 'Test Todo' });
    });

    it('should toggle todo successfully', () => {
      const result = service.toggleTodoSafely(todo.id);

      expect(result.success).toBe(true);
      expect(result.todo).toBeDefined();
      expect(result.todo!.completed).toBe(true);
      expect(result.error).toBeUndefined();
      expect(service.successMessage()).toBe('Todo marked as completed');
      expect(service.errorMessage()).toBeNull();
      expect(service.isLoading()).toBe(false);
    });

    it('should toggle todo from completed to active', () => {
      service.toggleTodo(todo.id); // First toggle to completed
      
      const result = service.toggleTodoSafely(todo.id);

      expect(result.success).toBe(true);
      expect(result.todo).toBeDefined();
      expect(result.todo!.completed).toBe(false);
      expect(result.error).toBeUndefined();
      expect(service.successMessage()).toBe('Todo marked as active');
      expect(service.errorMessage()).toBeNull();
      expect(service.isLoading()).toBe(false);
    });

    it('should fail when todo does not exist', () => {
      const result = service.toggleTodoSafely('non-existent-id');

      expect(result.success).toBe(false);
      expect(result.todo).toBeUndefined();
      expect(result.error).toBe('Todo not found or could not be toggled');
      expect(service.errorMessage()).toBe('Todo not found or could not be toggled');
      expect(service.successMessage()).toBeNull();
      expect(service.isLoading()).toBe(false);
    });

    it('should clear messages before processing', () => {
      service.setErrorMessage('Previous error');
      service.setSuccessMessage('Previous success');

      service.toggleTodoSafely(todo.id);

      expect(service.successMessage()).toBe('Todo marked as completed');
      expect(service.errorMessage()).toBeNull();
    });

    it('should handle exception during todo toggle', () => {
      // Mock toggleTodo to throw an error
      const originalToggleTodo = service.toggleTodo;
      service.toggleTodo = vi.fn().mockImplementation(() => {
        throw new Error('Simulated error');
      });

      const result = service.toggleTodoSafely(todo.id);

      expect(result.success).toBe(false);
      expect(result.todo).toBeUndefined();
      expect(result.error).toBe('Failed to toggle todo. Please try again.');
      expect(service.errorMessage()).toBe('Failed to toggle todo. Please try again.');
      expect(service.successMessage()).toBeNull();
      expect(service.isLoading()).toBe(false);

      // Restore original method
      service.toggleTodo = originalToggleTodo;
    });
  });

  describe('deleteTodoWithConfirmation', () => {
    let todo: ReturnType<typeof service.addTodo>;

    beforeEach(() => {
      todo = service.addTodo({ title: 'Test Todo' });
    });

    it('should delete todo successfully when user confirms', () => {
      vi.spyOn(confirmationService, 'confirm').mockReturnValue(true);

      const result = service.deleteTodoWithConfirmation(todo.id);

      expect(confirmationService.confirm).toHaveBeenCalledWith('Are you sure you want to delete this todo?');
      expect(result.success).toBe(true);
      expect(result.confirmed).toBe(true);
      expect(result.error).toBeUndefined();
      expect(service.successMessage()).toBe('Todo deleted successfully');
      expect(service.errorMessage()).toBeNull();
      expect(service.isLoading()).toBe(false);
      expect(service.getTodoById(todo.id)).toBeUndefined();
    });

    it('should not delete todo when user cancels', () => {
      vi.spyOn(confirmationService, 'confirm').mockReturnValue(false);

      const result = service.deleteTodoWithConfirmation(todo.id);

      expect(confirmationService.confirm).toHaveBeenCalledWith('Are you sure you want to delete this todo?');
      expect(result.success).toBe(false);
      expect(result.confirmed).toBe(false);
      expect(result.error).toBeUndefined();
      expect(service.errorMessage()).toBeNull(); // Should clear messages on cancellation
      expect(service.successMessage()).toBeNull();
      expect(service.isLoading()).toBe(false);
      expect(service.getTodoById(todo.id)).toBeDefined(); // Todo should still exist
    });

    it('should fail when todo does not exist even if user confirms', () => {
      vi.spyOn(confirmationService, 'confirm').mockReturnValue(true);

      const result = service.deleteTodoWithConfirmation('non-existent-id');

      expect(confirmationService.confirm).toHaveBeenCalledWith('Are you sure you want to delete this todo?');
      expect(result.success).toBe(false);
      expect(result.confirmed).toBe(true);
      expect(result.error).toBe('Todo not found or could not be deleted');
      expect(service.errorMessage()).toBe('Todo not found or could not be deleted');
      expect(service.successMessage()).toBeNull();
      expect(service.isLoading()).toBe(false);
    });

    it('should clear messages before processing', () => {
      vi.spyOn(confirmationService, 'confirm').mockReturnValue(true);
      service.setErrorMessage('Previous error');
      service.setSuccessMessage('Previous success');

      service.deleteTodoWithConfirmation(todo.id);

      expect(service.successMessage()).toBe('Todo deleted successfully');
      expect(service.errorMessage()).toBeNull();
    });

    it('should handle exception during confirmation process', () => {
      // Mock confirm to throw an error
      vi.spyOn(confirmationService, 'confirm').mockImplementation(() => {
        throw new Error('Simulated error');
      });

      const result = service.deleteTodoWithConfirmation(todo.id);

      expect(result.success).toBe(false);
      expect(result.confirmed).toBe(true); // Exception after confirmation attempt
      expect(result.error).toBe('Failed to delete todo. Please try again.');
      expect(service.errorMessage()).toBe('Failed to delete todo. Please try again.');
      expect(service.successMessage()).toBeNull();
      expect(service.isLoading()).toBe(false);
    });

    it('should handle exception during deletion after confirmation', () => {
      vi.spyOn(confirmationService, 'confirm').mockReturnValue(true);
      
      // Mock deleteTodo to throw an error
      const originalDeleteTodo = service.deleteTodo;
      service.deleteTodo = vi.fn().mockImplementation(() => {
        throw new Error('Simulated error');
      });

      const result = service.deleteTodoWithConfirmation(todo.id);

      expect(result.success).toBe(false);
      expect(result.confirmed).toBe(true);
      expect(result.error).toBe('Failed to delete todo. Please try again.');
      expect(service.errorMessage()).toBe('Failed to delete todo. Please try again.');
      expect(service.successMessage()).toBeNull();
      expect(service.isLoading()).toBe(false);

      // Restore original method
      service.deleteTodo = originalDeleteTodo;
    });
  });
});