/**
 * @fileoverview Unit tests for TodoFilterService - Filter state management for todo items
 */

import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { signal } from '@angular/core';
import { TodoFilterService } from './todo-filter.service';
import { Todo, FilterType } from '../models/todo.model';

describe('TodoFilterService', () => {
  let service: TodoFilterService;
  
  const mockTodos: Todo[] = [
    {
      id: '1',
      title: 'Active Todo',
      description: 'Active description',
      completed: false,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      priority: 'medium',
      tags: ['work']
    },
    {
      id: '2',
      title: 'Completed Todo',
      completed: true,
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
      priority: 'high',
      tags: ['personal']
    },
    {
      id: '3',
      title: 'Another Active Todo',
      completed: false,
      createdAt: new Date('2024-01-03'),
      updatedAt: new Date('2024-01-03'),
      priority: 'low',
      tags: ['hobby']
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        TodoFilterService
      ]
    });
    
    service = TestBed.inject(TodoFilterService);
  });

  describe('Service Creation & Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should initialize with "all" filter by default', () => {
      expect(service.currentFilter()).toBe('all');
    });

    it('should expose readonly currentFilter signal', () => {
      expect(service.currentFilter).toBeDefined();
      expect(typeof service.currentFilter).toBe('function');
    });
  });

  describe('Filter State Management', () => {
    it('should set filter to "active"', () => {
      service.setFilter('active');
      expect(service.currentFilter()).toBe('active');
    });

    it('should set filter to "completed"', () => {
      service.setFilter('completed');
      expect(service.currentFilter()).toBe('completed');
    });

    it('should set filter to "all"', () => {
      service.setFilter('all');
      expect(service.currentFilter()).toBe('all');
    });

    it('should update filter state reactively', () => {
      expect(service.currentFilter()).toBe('all');
      
      service.setFilter('active');
      expect(service.currentFilter()).toBe('active');
      
      service.setFilter('completed');
      expect(service.currentFilter()).toBe('completed');
      
      service.setFilter('all');
      expect(service.currentFilter()).toBe('all');
    });
  });

  describe('Convenience Filter Methods', () => {
    it('should provide showAll() convenience method', () => {
      service.setFilter('active');
      service.showAll();
      expect(service.currentFilter()).toBe('all');
    });

    it('should provide showActive() convenience method', () => {
      service.setFilter('all');
      service.showActive();
      expect(service.currentFilter()).toBe('active');
    });

    it('should provide showCompleted() convenience method', () => {
      service.setFilter('all');
      service.showCompleted();
      expect(service.currentFilter()).toBe('completed');
    });
  });

  describe('Todo Filtering Logic', () => {
    it('should return all todos when filter is "all"', () => {
      const inputSignal = signal(mockTodos);
      service.setFilter('all');
      
      const filtered = service.getFilteredTodos(inputSignal)();
      
      expect(filtered).toEqual(mockTodos);
      expect(filtered.length).toBe(3);
    });

    it('should return only active todos when filter is "active"', () => {
      const inputSignal = signal(mockTodos);
      service.setFilter('active');
      
      const filtered = service.getFilteredTodos(inputSignal)();
      
      const expectedActive = mockTodos.filter(todo => !todo.completed);
      expect(filtered).toEqual(expectedActive);
      expect(filtered.length).toBe(2);
      expect(filtered.every(todo => !todo.completed)).toBe(true);
    });

    it('should return only completed todos when filter is "completed"', () => {
      const inputSignal = signal(mockTodos);
      service.setFilter('completed');
      
      const filtered = service.getFilteredTodos(inputSignal)();
      
      const expectedCompleted = mockTodos.filter(todo => todo.completed);
      expect(filtered).toEqual(expectedCompleted);
      expect(filtered.length).toBe(1);
      expect(filtered.every(todo => todo.completed)).toBe(true);
    });

    it('should handle empty todo list for all filters', () => {
      const emptySignal = signal<Todo[]>([]);
      
      service.setFilter('all');
      expect(service.getFilteredTodos(emptySignal)()).toEqual([]);
      
      service.setFilter('active');
      expect(service.getFilteredTodos(emptySignal)()).toEqual([]);
      
      service.setFilter('completed');
      expect(service.getFilteredTodos(emptySignal)()).toEqual([]);
    });

    it('should handle todos with only active items', () => {
      const activeTodos = mockTodos.filter(todo => !todo.completed);
      const activeSignal = signal(activeTodos);
      
      service.setFilter('all');
      expect(service.getFilteredTodos(activeSignal)()).toEqual(activeTodos);
      
      service.setFilter('active');
      expect(service.getFilteredTodos(activeSignal)()).toEqual(activeTodos);
      
      service.setFilter('completed');
      expect(service.getFilteredTodos(activeSignal)()).toEqual([]);
    });

    it('should handle todos with only completed items', () => {
      const completedTodos = mockTodos.filter(todo => todo.completed);
      const completedSignal = signal(completedTodos);
      
      service.setFilter('all');
      expect(service.getFilteredTodos(completedSignal)()).toEqual(completedTodos);
      
      service.setFilter('active');
      expect(service.getFilteredTodos(completedSignal)()).toEqual([]);
      
      service.setFilter('completed');
      expect(service.getFilteredTodos(completedSignal)()).toEqual(completedTodos);
    });
  });

  describe('Reactive Signal Behavior', () => {
    it('should update filtered results when input todos change', () => {
      const todosSignal = signal([...mockTodos]);
      service.setFilter('active');
      
      const filteredSignal = service.getFilteredTodos(todosSignal);
      expect(filteredSignal().length).toBe(2);
      
      // Add a new active todo
      const newActiveTodo: Todo = {
        id: '4',
        title: 'New Active Todo',
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        priority: 'medium',
        tags: []
      };
      
      todosSignal.update(todos => [...todos, newActiveTodo]);
      expect(filteredSignal().length).toBe(3);
    });

    it('should update filtered results when filter changes', () => {
      const todosSignal = signal(mockTodos);
      const filteredSignal = service.getFilteredTodos(todosSignal);
      
      service.setFilter('all');
      expect(filteredSignal().length).toBe(3);
      
      service.setFilter('active');
      expect(filteredSignal().length).toBe(2);
      
      service.setFilter('completed');
      expect(filteredSignal().length).toBe(1);
    });

    it('should handle rapid filter changes correctly', () => {
      const todosSignal = signal(mockTodos);
      const filteredSignal = service.getFilteredTodos(todosSignal);
      
      // Rapid filter changes
      service.setFilter('active');
      service.setFilter('completed');
      service.setFilter('all');
      service.setFilter('active');
      
      // Should end up with active todos
      expect(filteredSignal().length).toBe(2);
      expect(filteredSignal().every(todo => !todo.completed)).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid filter type gracefully by defaulting to "all"', () => {
      const todosSignal = signal(mockTodos);
      
      // Cast to bypass TypeScript checking for testing purposes
      service.setFilter('invalid' as FilterType);
      
      const filtered = service.getFilteredTodos(todosSignal)();
      expect(filtered).toEqual(mockTodos);
    });

    it('should maintain filter state across multiple getFilteredTodos calls', () => {
      const todosSignal1 = signal(mockTodos.slice(0, 2));
      const todosSignal2 = signal(mockTodos.slice(1, 3));
      
      service.setFilter('active');
      
      const filtered1 = service.getFilteredTodos(todosSignal1)();
      const filtered2 = service.getFilteredTodos(todosSignal2)();
      
      expect(filtered1.every(todo => !todo.completed)).toBe(true);
      expect(filtered2.every(todo => !todo.completed)).toBe(true);
    });
  });

  describe('Signal Memory Management', () => {
    it('should not cause memory leaks with multiple signal subscriptions', () => {
      const todosSignal = signal(mockTodos);
      
      // Create multiple filtered signals
      const filtered1 = service.getFilteredTodos(todosSignal);
      const filtered2 = service.getFilteredTodos(todosSignal);
      const filtered3 = service.getFilteredTodos(todosSignal);
      
      // Change filter multiple times
      service.setFilter('active');
      service.setFilter('completed');
      service.setFilter('all');
      
      // All signals should reflect current state
      expect(filtered1()).toEqual(mockTodos);
      expect(filtered2()).toEqual(mockTodos);
      expect(filtered3()).toEqual(mockTodos);
    });
  });
});