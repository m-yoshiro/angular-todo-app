/**
 * @fileoverview Unit tests for TodoStateService - Core state management for todo items
 */

import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { vi } from 'vitest';
import { TodoStateService } from './todo-state.service';
import { Todo, CreateTodoRequest, UpdateTodoRequest } from '../models/todo.model';
import { TodoStorageService } from './todo-storage.service';

describe('TodoStateService', () => {
  let service: TodoStateService;
  let mockStorageService: {
    loadTodos: ReturnType<typeof vi.fn>;
    saveTodos: ReturnType<typeof vi.fn>;
  };
  
  const mockTodos: Todo[] = [
    {
      id: '1',
      title: 'Test Todo 1',
      description: 'Test description 1',
      completed: false,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      priority: 'medium',
      tags: ['work']
    },
    {
      id: '2',
      title: 'Test Todo 2',
      completed: true,
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
      priority: 'high',
      tags: ['personal']
    }
  ];

  beforeEach(() => {
    // Create mock TodoStorageService
    mockStorageService = {
      loadTodos: vi.fn().mockReturnValue([...mockTodos]),
      saveTodos: vi.fn()
    };
    
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        TodoStateService,
        { provide: TodoStorageService, useValue: mockStorageService }
      ]
    });
    
    service = TestBed.inject(TodoStateService);
  });

  describe('Service Creation & Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should initialize todos from storage service', () => {
      expect(mockStorageService.loadTodos).toHaveBeenCalled();
      expect(service.todos()).toEqual(mockTodos);
    });

    it('should expose readonly todos signal', () => {
      expect(service.todos).toBeDefined();
      expect(typeof service.todos).toBe('function');
    });

    it('should expose readonly stats signal', () => {
      expect(service.stats).toBeDefined();
      expect(typeof service.stats).toBe('function');
    });
  });

  describe('Statistics Computation', () => {
    it('should compute correct statistics for mixed todos', () => {
      const stats = service.stats();
      
      expect(stats.total).toBe(2);
      expect(stats.completed).toBe(1);
      expect(stats.pending).toBe(1);
      expect(stats.byPriority.low).toBe(0);
      expect(stats.byPriority.medium).toBe(1);
      expect(stats.byPriority.high).toBe(1);
    });

    it('should compute zero statistics for empty todos', () => {
      // Create service with empty storage
      mockStorageService.loadTodos.mockReturnValue([]);
      
      // Reconfigure TestBed with new mock
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          provideZonelessChangeDetection(),
          TodoStateService,
          { provide: TodoStorageService, useValue: mockStorageService }
        ]
      });
      service = TestBed.inject(TodoStateService);
      
      const stats = service.stats();
      
      expect(stats.total).toBe(0);
      expect(stats.completed).toBe(0);
      expect(stats.pending).toBe(0);
      expect(stats.overdue).toBe(0);
      expect(stats.byPriority.low).toBe(0);
      expect(stats.byPriority.medium).toBe(0);
      expect(stats.byPriority.high).toBe(0);
    });

    it('should correctly identify overdue todos', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1); // Yesterday
      
      const overdueTodo: Todo = {
        id: '3',
        title: 'Overdue Todo',
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        priority: 'high',
        dueDate: pastDate
      };
      
      mockStorageService.loadTodos.mockReturnValue([overdueTodo]);
      
      // Reconfigure TestBed with new mock
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          provideZonelessChangeDetection(),
          TodoStateService,
          { provide: TodoStorageService, useValue: mockStorageService }
        ]
      });
      service = TestBed.inject(TodoStateService);
      
      const stats = service.stats();
      expect(stats.overdue).toBe(1);
    });

    it('should not count completed todos as overdue', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      
      const completedOverduetodo: Todo = {
        id: '3',
        title: 'Completed Overdue Todo',
        completed: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        priority: 'high',
        dueDate: pastDate
      };
      
      mockStorageService.loadTodos.mockReturnValue([completedOverduetodo]);
      
      // Reconfigure TestBed with new mock
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          provideZonelessChangeDetection(),
          TodoStateService,
          { provide: TodoStorageService, useValue: mockStorageService }
        ]
      });
      service = TestBed.inject(TodoStateService);
      
      const stats = service.stats();
      expect(stats.overdue).toBe(0);
    });
  });

  describe('Add Todo Operations', () => {
    it('should add a new todo with all required fields', () => {
      const initialCount = service.todos().length;
      const request: CreateTodoRequest = {
        title: 'New Todo',
        description: 'New description',
        priority: 'high',
        tags: ['test']
      };
      
      const result = service.addTodo(request);
      
      expect(result).toBeDefined();
      expect(result.title).toBe('New Todo');
      expect(result.description).toBe('New description');
      expect(result.priority).toBe('high');
      expect(result.completed).toBe(false);
      expect(result.tags).toEqual(['test']);
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
      
      expect(service.todos().length).toBe(initialCount + 1);
      expect(service.todos()).toContain(result);
    });

    it('should add todo with minimal fields (title only)', () => {
      const request: CreateTodoRequest = {
        title: 'Minimal Todo'
      };
      
      const result = service.addTodo(request);
      
      expect(result.title).toBe('Minimal Todo');
      expect(result.priority).toBe('medium'); // Default priority
      expect(result.tags).toEqual([]); // Default empty tags
      expect(result.description).toBeUndefined();
    });

    it('should generate unique IDs for new todos', () => {
      const todo1 = service.addTodo({ title: 'Todo 1' });
      const todo2 = service.addTodo({ title: 'Todo 2' });
      
      expect(todo1.id).not.toBe(todo2.id);
      expect(todo1.id).toBeDefined();
      expect(todo2.id).toBeDefined();
    });

    it('should update stats after adding todo', () => {
      const initialStats = service.stats();
      
      service.addTodo({ title: 'New Todo', priority: 'low' });
      
      const newStats = service.stats();
      expect(newStats.total).toBe(initialStats.total + 1);
      expect(newStats.pending).toBe(initialStats.pending + 1);
      expect(newStats.byPriority.low).toBe(initialStats.byPriority.low + 1);
    });
  });

  describe('Update Todo Operations', () => {
    it('should update existing todo and return updated todo', () => {
      const request: UpdateTodoRequest = {
        title: 'Updated Title',
        description: 'Updated description',
        priority: 'low'
      };
      
      const result = service.updateTodo('1', request);
      
      expect(result).toBeDefined();
      expect(result!.title).toBe('Updated Title');
      expect(result!.description).toBe('Updated description');
      expect(result!.priority).toBe('low');
      expect(result!.updatedAt.getTime()).toBeGreaterThan(result!.createdAt.getTime());
      
      const updatedTodo = service.getTodoById('1');
      expect(updatedTodo!.title).toBe('Updated Title');
    });

    it('should return null for non-existent todo', () => {
      const result = service.updateTodo('nonexistent', { title: 'New Title' });
      expect(result).toBeNull();
    });

    it('should preserve unchanged fields during update', () => {
      const originalTodo = service.getTodoById('1')!;
      
      service.updateTodo('1', { title: 'New Title' });
      
      const updatedTodo = service.getTodoById('1')!;
      expect(updatedTodo.title).toBe('New Title');
      expect(updatedTodo.description).toBe(originalTodo.description);
      expect(updatedTodo.priority).toBe(originalTodo.priority);
      expect(updatedTodo.completed).toBe(originalTodo.completed);
      expect(updatedTodo.id).toBe(originalTodo.id);
    });
  });

  describe('Toggle Todo Operations', () => {
    it('should toggle completion status from false to true', () => {
      const result = service.toggleTodo('1');
      
      expect(result).toBeDefined();
      expect(result!.completed).toBe(true);
      expect(result!.updatedAt.getTime()).toBeGreaterThan(result!.createdAt.getTime());
    });

    it('should toggle completion status from true to false', () => {
      const result = service.toggleTodo('2');
      
      expect(result).toBeDefined();
      expect(result!.completed).toBe(false);
    });

    it('should return null for non-existent todo', () => {
      const result = service.toggleTodo('nonexistent');
      expect(result).toBeNull();
    });

    it('should update stats when toggling completion', () => {
      const initialStats = service.stats();
      
      service.toggleTodo('1'); // Mark as completed
      
      const newStats = service.stats();
      expect(newStats.completed).toBe(initialStats.completed + 1);
      expect(newStats.pending).toBe(initialStats.pending - 1);
    });
  });

  describe('Delete Todo Operations', () => {
    it('should delete existing todo and return true', () => {
      const initialCount = service.todos().length;
      
      const result = service.deleteTodo('1');
      
      expect(result).toBe(true);
      expect(service.todos().length).toBe(initialCount - 1);
      expect(service.getTodoById('1')).toBeUndefined();
    });

    it('should return false for non-existent todo', () => {
      const initialCount = service.todos().length;
      
      const result = service.deleteTodo('nonexistent');
      
      expect(result).toBe(false);
      expect(service.todos().length).toBe(initialCount);
    });

    it('should update stats after deleting todo', () => {
      const initialStats = service.stats();
      
      service.deleteTodo('2'); // Delete completed todo
      
      const newStats = service.stats();
      expect(newStats.total).toBe(initialStats.total - 1);
      expect(newStats.completed).toBe(initialStats.completed - 1);
    });
  });

  describe('Clear Completed Operations', () => {
    it('should remove all completed todos', () => {
      const initialCount = service.todos().length;
      const completedCount = service.todos().filter(t => t.completed).length;
      
      service.clearCompleted();
      
      expect(service.todos().length).toBe(initialCount - completedCount);
      expect(service.todos().every(t => !t.completed)).toBe(true);
    });

    it('should not affect active todos', () => {
      const activeTodos = service.todos().filter(t => !t.completed);
      
      service.clearCompleted();
      
      const remainingTodos = service.todos();
      activeTodos.forEach(todo => {
        expect(remainingTodos.find(t => t.id === todo.id)).toBeDefined();
      });
    });
  });

  describe('Query Operations', () => {
    it('should find todo by ID', () => {
      const todo = service.getTodoById('1');
      
      expect(todo).toBeDefined();
      expect(todo!.id).toBe('1');
      expect(todo!.title).toBe('Test Todo 1');
    });

    it('should return undefined for non-existent ID', () => {
      const todo = service.getTodoById('nonexistent');
      expect(todo).toBeUndefined();
    });
  });

  describe('Storage Integration', () => {
    it('should call storage service when todos change', async () => {
      // Reset mock call count
      mockStorageService.saveTodos.mockClear();
      
      service.addTodo({ title: 'Test Todo' });
      
      // Storage should be called asynchronously via effect
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(mockStorageService.saveTodos).toHaveBeenCalled();
    });
  });

  describe('Immutability', () => {
    it('should not mutate original todos array when adding', () => {
      const originalTodos = service.todos();
      const originalLength = originalTodos.length;
      
      service.addTodo({ title: 'New Todo' });
      
      expect(originalTodos.length).toBe(originalLength);
    });

    it('should not mutate original todos array when updating', () => {
      const originalTodos = service.todos();
      const originalTodo = originalTodos.find(t => t.id === '1')!;
      const originalTitle = originalTodo.title;
      
      service.updateTodo('1', { title: 'Updated Title' });
      
      expect(originalTodo.title).toBe(originalTitle);
    });
  });
});