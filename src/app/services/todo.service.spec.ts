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
});