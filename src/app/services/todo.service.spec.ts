import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TodoService } from './todo.service';
import { CreateTodoRequest, UpdateTodoRequest } from '../models/todo.model';

describe('TodoService', () => {
  let service: TodoService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()]
    });
    service = TestBed.inject(TodoService);
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
        title: 'Test Todo',
        priority: 'medium'
      };

      const result = service.addTodo(request);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.id).toBeDefined();
      expect(result.data!.title).toBe('Test Todo');
      expect(result.data!.completed).toBe(false);
      expect(result.data!.priority).toBe('medium');
      expect(result.data!.createdAt).toBeInstanceOf(Date);
      expect(result.data!.updatedAt).toBeInstanceOf(Date);
      expect(result.data!.tags).toEqual([]);
      expect(service.todos().length).toBe(1);
    });

    it('should add todo with all optional fields', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1); // Tomorrow
      const request: CreateTodoRequest = {
        title: 'Complete Todo',
        description: 'A complete todo with all fields',
        priority: 'high',
        dueDate: futureDate,
        tags: ['work', 'urgent']
      };

      const result = service.addTodo(request);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.title).toBe('Complete Todo');
      expect(result.data!.description).toBe('A complete todo with all fields');
      expect(result.data!.priority).toBe('high');
      expect(result.data!.dueDate).toEqual(futureDate);
      expect(result.data!.tags).toEqual(['work', 'urgent']);
    });

    it('should update stats when adding todos', () => {
      const result1 = service.addTodo({ title: 'Todo 1', priority: 'low' });
      const result2 = service.addTodo({ title: 'Todo 2', priority: 'high' });

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);

      const stats = service.stats();
      expect(stats.total).toBe(2);
      expect(stats.pending).toBe(2);
      expect(stats.completed).toBe(0);
      expect(stats.byPriority.low).toBe(1);
      expect(stats.byPriority.high).toBe(1);
    });

    it('should handle validation errors', () => {
      const request: CreateTodoRequest = {
        title: '',
        priority: 'medium'
      };

      const result = service.addTodo(request);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Title is required');
      expect(service.todos().length).toBe(0);
    });

    it('should handle validation errors for invalid priority', () => {
      const request = {
        title: 'Valid Title',
        priority: 'invalid'
      } as unknown as CreateTodoRequest;

      const result = service.addTodo(request);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Priority must be low, medium, or high');
      expect(service.todos().length).toBe(0);
    });
  });

  describe('updateTodo', () => {
    it('should update existing todo', () => {
      const result = service.addTodo({ title: 'Original Title', priority: 'medium' });
      expect(result.success).toBe(true);
      const todo = result.data!;
      
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
});