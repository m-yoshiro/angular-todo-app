import { MockTodoStorageService } from './mock-todo-storage.service';
import { Todo } from '../../models/todo.model';

describe('MockTodoStorageService', () => {
  let mockService: MockTodoStorageService;

  beforeEach(() => {
    mockService = new MockTodoStorageService();
  });

  describe('basic functionality', () => {
    it('should be created', () => {
      expect(mockService).toBeTruthy();
    });

    it('should implement ITodoStorageService interface', () => {
      expect(typeof mockService.loadTodos).toBe('function');
      expect(typeof mockService.saveTodos).toBe('function');
      expect(typeof mockService.clearStorage).toBe('function');
      expect(typeof mockService.isAvailable).toBe('function');
      expect(typeof mockService.getStorageHealth).toBe('function');
    });

    it('should start with empty storage', () => {
      expect(mockService.loadTodos()).toEqual([]);
      expect(mockService.getMockData()).toEqual([]);
    });

    it('should be available by default', () => {
      expect(mockService.isAvailable()).toBe(true);
      expect(mockService.isMockAvailable()).toBe(true);
    });
  });

  describe('data operations', () => {
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

    it('should save and load todos', () => {
      mockService.saveTodos([testTodo]);
      const loaded = mockService.loadTodos();
      
      expect(loaded).toHaveLength(1);
      expect(loaded[0].id).toBe('1');
      expect(loaded[0].title).toBe('Test Todo');
      expect(loaded[0].createdAt).toBeInstanceOf(Date);
    });

    it('should clear storage', () => {
      mockService.saveTodos([testTodo]);
      expect(mockService.loadTodos()).toHaveLength(1);
      
      mockService.clearStorage();
      expect(mockService.loadTodos()).toEqual([]);
    });

    it('should provide deep copies to prevent test interference', () => {
      mockService.saveTodos([testTodo]);
      const loaded1 = mockService.loadTodos();
      const loaded2 = mockService.loadTodos();
      
      // Modify one copy
      loaded1[0].title = 'Modified';
      
      // Other copy should be unchanged
      expect(loaded2[0].title).toBe('Test Todo');
    });
  });

  describe('test utility methods', () => {
    it('should allow setting mock data', () => {
      const testTodos: Todo[] = [
        {
          id: '1',
          title: 'Todo 1',
          description: '',
          completed: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          priority: 'low'
        }
      ];

      mockService.setMockData(testTodos);
      const loaded = mockService.loadTodos();
      
      expect(loaded).toHaveLength(1);
      expect(loaded[0].title).toBe('Todo 1');
    });

    it('should simulate error conditions', () => {
      mockService.setMockError(true);
      expect(mockService.isMockErrorEnabled()).toBe(true);
      
      expect(() => mockService.loadTodos()).toThrow('Mock storage error: Failed to load todos');
      expect(() => mockService.saveTodos([])).toThrow('Mock storage error: Failed to save todos');
      expect(() => mockService.clearStorage()).toThrow('Mock storage error: Failed to clear storage');
      
      const health = mockService.getStorageHealth();
      expect(health.hasError).toBe(true);
    });

    it('should simulate unavailability', () => {
      mockService.setMockAvailability(false);
      expect(mockService.isAvailable()).toBe(false);
      expect(mockService.isMockAvailable()).toBe(false);
      
      // Should return empty array when unavailable
      expect(mockService.loadTodos()).toEqual([]);
      
      // Should do nothing when unavailable
      mockService.saveTodos([{ id: '1' } as Todo]);
      expect(mockService.getMockData()).toEqual([]);
      
      mockService.clearStorage(); // Should not throw
    });

    it('should reset to clean state', () => {
      const testTodo = { id: '1', title: 'Test' } as Todo;
      
      mockService.setMockData([testTodo]);
      mockService.setMockError(true);
      mockService.setMockAvailability(false);
      
      expect(mockService.getMockData()).toHaveLength(1);
      expect(mockService.isMockErrorEnabled()).toBe(true);
      expect(mockService.isMockAvailable()).toBe(false);
      
      mockService.reset();
      
      expect(mockService.getMockData()).toEqual([]);
      expect(mockService.isMockErrorEnabled()).toBe(false);
      expect(mockService.isMockAvailable()).toBe(true);
      expect(mockService.isAvailable()).toBe(true);
    });
  });

  describe('health monitoring', () => {
    it('should report healthy state by default', () => {
      const health = mockService.getStorageHealth();
      expect(health.available).toBe(true);
      expect(health.hasError).toBe(false);
    });

    it('should report error state after error', () => {
      mockService.setMockError(true);
      
      try {
        mockService.loadTodos();
      } catch {
        // Expected error
      }
      
      const health = mockService.getStorageHealth();
      expect(health.hasError).toBe(true);
    });

    it('should report unavailable state when configured', () => {
      mockService.setMockAvailability(false);
      
      const health = mockService.getStorageHealth();
      expect(health.available).toBe(false);
    });
  });
});