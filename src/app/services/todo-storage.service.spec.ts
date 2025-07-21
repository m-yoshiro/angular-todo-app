import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { vi } from 'vitest';
import { TodoStorageService } from './todo-storage.service';
import { Todo } from '../models/todo.model';

describe('TodoStorageService', () => {
  let service: TodoStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()]
    });
    service = TestBed.inject(TodoStorageService);
  });

  // RED: This test will fail initially because TodoStorageService doesn't exist yet
  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // RED: Test interface compliance
  it('should implement ITodoStorageService interface', () => {
    expect(service).toBeInstanceOf(Object);
    expect(typeof service.loadTodos).toBe('function');
    expect(typeof service.saveTodos).toBe('function');
    expect(typeof service.clearStorage).toBe('function');
    expect(typeof service.isAvailable).toBe('function');
    expect(typeof service.getStorageHealth).toBe('function');
  });

  describe('isAvailable', () => {
    // RED: Test SSR compatibility
    it('should return false when window is undefined (SSR)', () => {
      const originalWindow = global.window;
      // @ts-expect-error - Intentionally setting window to undefined for SSR testing
      global.window = undefined;
      
      expect(service.isAvailable()).toBe(false);
      
      global.window = originalWindow;
    });

    // RED: Test localStorage availability
    it('should return false when localStorage is not available', () => {
      const originalLocalStorage = window.localStorage;
      Object.defineProperty(window, 'localStorage', {
        value: undefined,
        writable: true
      });
      
      expect(service.isAvailable()).toBe(false);
      
      Object.defineProperty(window, 'localStorage', {
        value: originalLocalStorage,
        writable: true
      });
    });

    // RED: Test normal availability
    it('should return true when localStorage is available', () => {
      expect(service.isAvailable()).toBe(true);
    });
  });

  describe('loadTodos', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    // RED: Test empty storage
    it('should return empty array when no todos are stored', () => {
      const todos = service.loadTodos();
      expect(todos).toEqual([]);
    });

    // RED: Test SSR compatibility
    it('should return empty array when storage is not available', () => {
      const originalWindow = global.window;
      // @ts-expect-error - Intentionally setting window to undefined for SSR testing
      global.window = undefined;
      
      const todos = service.loadTodos();
      expect(todos).toEqual([]);
      
      global.window = originalWindow;
    });

    // RED: Test Date deserialization
    it('should deserialize Date objects correctly', () => {
      const testTodo: Todo = {
        id: '1',
        title: 'Test Todo',
        description: 'Test Description',
        completed: false,
        createdAt: new Date('2024-01-01T10:00:00.000Z'),
        updatedAt: new Date('2024-01-02T10:00:00.000Z'),
        priority: 'medium',
        dueDate: new Date('2024-01-03T10:00:00.000Z'),
        tags: ['test']
      };

      // Manually store serialized todo
      localStorage.setItem('todo-app-todos', JSON.stringify([testTodo]));
      
      const todos = service.loadTodos();
      expect(todos).toHaveLength(1);
      expect(todos[0].createdAt).toBeInstanceOf(Date);
      expect(todos[0].updatedAt).toBeInstanceOf(Date);
      expect(todos[0].dueDate).toBeInstanceOf(Date);
      expect(todos[0].createdAt.toISOString()).toBe('2024-01-01T10:00:00.000Z');
    });

    // RED: Test error handling
    it('should handle corrupted data gracefully', () => {
      localStorage.setItem('todo-app-todos', 'invalid json');
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { /* mock implementation */ });
      
      const todos = service.loadTodos();
      expect(todos).toEqual([]);
      expect(consoleWarnSpy).toHaveBeenCalledWith('Failed to load todos from localStorage:', expect.any(Error));
      
      consoleWarnSpy.mockRestore();
    });
  });

  describe('saveTodos', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    // RED: Test basic save operation
    it('should save todos to localStorage', () => {
      const testTodos: Todo[] = [{
        id: '1',
        title: 'Test Todo',
        description: 'Test Description',
        completed: false,
        createdAt: new Date('2024-01-01T10:00:00.000Z'),
        updatedAt: new Date('2024-01-02T10:00:00.000Z'),
        priority: 'medium',
        dueDate: new Date('2024-01-03T10:00:00.000Z'),
        tags: ['test']
      }];

      service.saveTodos(testTodos);
      
      const stored = localStorage.getItem('todo-app-todos');
      expect(stored).toBeTruthy();
      const parsed = JSON.parse(stored!);
      
      // Verify structure (Date objects are serialized as strings)
      expect(parsed).toHaveLength(1);
      expect(parsed[0].id).toBe('1');
      expect(parsed[0].title).toBe('Test Todo');
      expect(parsed[0].createdAt).toBe('2024-01-01T10:00:00.000Z');
      expect(parsed[0].updatedAt).toBe('2024-01-02T10:00:00.000Z');
      expect(parsed[0].dueDate).toBe('2024-01-03T10:00:00.000Z');
    });

    // RED: Test SSR compatibility
    it('should handle missing localStorage gracefully', () => {
      const originalWindow = global.window;
      // @ts-expect-error - Intentionally setting window to undefined for SSR testing
      global.window = undefined;
      
      // Should not throw error
      expect(() => service.saveTodos([])).not.toThrow();
      
      global.window = originalWindow;
    });

    // RED: Test error handling
    it('should handle localStorage errors gracefully', () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')
        .mockImplementation(() => { throw new Error('Storage quota exceeded'); });
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { /* mock implementation */ });
      
      service.saveTodos([]);
      expect(consoleWarnSpy).toHaveBeenCalledWith('Failed to save todos to localStorage:', expect.any(Error));
      
      setItemSpy.mockRestore();
      consoleWarnSpy.mockRestore();
    });
  });

  describe('clearStorage', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    // RED: Test clear operation
    it('should clear todos from localStorage', () => {
      localStorage.setItem('todo-app-todos', JSON.stringify([{ id: '1', title: 'Test' }]));
      
      service.clearStorage();
      
      expect(localStorage.getItem('todo-app-todos')).toBeNull();
    });

    // RED: Test SSR compatibility
    it('should handle missing localStorage gracefully', () => {
      const originalWindow = global.window;
      // @ts-expect-error - Intentionally setting window to undefined for SSR testing
      global.window = undefined;
      
      expect(() => service.clearStorage()).not.toThrow();
      
      global.window = originalWindow;
    });
  });

  describe('getStorageHealth', () => {
    // RED: Test health when available
    it('should return available true when storage is available', () => {
      const health = service.getStorageHealth();
      expect(health.available).toBe(true);
      expect(health.hasError).toBe(false);
    });

    // RED: Test health when unavailable
    it('should return available false when storage is unavailable', () => {
      const originalWindow = global.window;
      // @ts-expect-error - Intentionally setting window to undefined for SSR testing
      global.window = undefined;
      
      const health = service.getStorageHealth();
      expect(health.available).toBe(false);
      
      global.window = originalWindow;
    });

    // RED: Test error state tracking
    it('should track error state when operations fail', () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')
        .mockImplementation(() => { throw new Error('Storage quota exceeded'); });
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { /* mock implementation */ });
      
      service.saveTodos([]);
      const health = service.getStorageHealth();
      expect(health.hasError).toBe(true);
      
      setItemSpy.mockRestore();
      consoleWarnSpy.mockRestore();
    });
  });
});