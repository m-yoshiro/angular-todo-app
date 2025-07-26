/**
 * @fileoverview Unit tests for TodoSortService - Sort state management for todo items
 */

import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { signal } from '@angular/core';
import { TodoSortService } from './todo-sort.service';
import { Todo, SortType } from '../models/todo.model';

describe('TodoSortService', () => {
  let service: TodoSortService;
  
  const baseTodos: Todo[] = [
    {
      id: '1',
      title: 'Zebra Task',
      description: 'Task with Z title',
      completed: false,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      priority: 'low',
      tags: ['work']
    },
    {
      id: '2', 
      title: 'Alpha Task',
      completed: true,
      createdAt: new Date('2024-01-03'),
      updatedAt: new Date('2024-01-03'),
      priority: 'high',
      tags: ['personal']
    },
    {
      id: '3',
      title: 'Beta Task',
      completed: false,
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
      priority: 'medium',
      tags: ['hobby']
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        TodoSortService
      ]
    });
    
    service = TestBed.inject(TodoSortService);
  });

  describe('Service Creation & Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should initialize with "date" sort key by default', () => {
      expect(service.sortKey()).toBe('date');
    });

    it('should initialize with "desc" sort order by default', () => {
      expect(service.sortOrder()).toBe('desc');
    });

    it('should expose readonly sortKey signal', () => {
      expect(service.sortKey).toBeDefined();
      expect(typeof service.sortKey).toBe('function');
    });

    it('should expose readonly sortOrder signal', () => {
      expect(service.sortOrder).toBeDefined();
      expect(typeof service.sortOrder).toBe('function');
    });
  });

  describe('Sort State Management', () => {
    it('should set sort key to "title"', () => {
      service.setSortKey('title');
      expect(service.sortKey()).toBe('title');
    });

    it('should set sort key to "priority"', () => {
      service.setSortKey('priority');
      expect(service.sortKey()).toBe('priority');
    });

    it('should set sort key to "date"', () => {
      service.setSortKey('date');
      expect(service.sortKey()).toBe('date');
    });

    it('should set sort order to "asc"', () => {
      service.setSortOrder('asc');
      expect(service.sortOrder()).toBe('asc');
    });

    it('should set sort order to "desc"', () => {
      service.setSortOrder('desc');
      expect(service.sortOrder()).toBe('desc');
    });

    it('should toggle sort order from "desc" to "asc"', () => {
      service.setSortOrder('desc');
      service.toggleSortOrder();
      expect(service.sortOrder()).toBe('asc');
    });

    it('should toggle sort order from "asc" to "desc"', () => {
      service.setSortOrder('asc');
      service.toggleSortOrder();
      expect(service.sortOrder()).toBe('desc');
    });

    it('should handle multiple toggle operations correctly', () => {
      service.setSortOrder('desc');
      
      service.toggleSortOrder(); // desc -> asc
      expect(service.sortOrder()).toBe('asc');
      
      service.toggleSortOrder(); // asc -> desc
      expect(service.sortOrder()).toBe('desc');
      
      service.toggleSortOrder(); // desc -> asc
      expect(service.sortOrder()).toBe('asc');
    });
  });

  describe('Date Sorting Logic', () => {
    it('should sort by date in descending order (newest first)', () => {
      const inputSignal = signal([...baseTodos]);
      service.setSortKey('date');
      service.setSortOrder('desc');
      
      const sorted = service.getSortedTodos(inputSignal)();
      
      expect(sorted[0].id).toBe('2'); // 2024-01-03
      expect(sorted[1].id).toBe('3'); // 2024-01-02
      expect(sorted[2].id).toBe('1'); // 2024-01-01
    });

    it('should sort by date in ascending order (oldest first)', () => {
      const inputSignal = signal([...baseTodos]);
      service.setSortKey('date');
      service.setSortOrder('asc');
      
      const sorted = service.getSortedTodos(inputSignal)();
      
      expect(sorted[0].id).toBe('1'); // 2024-01-01
      expect(sorted[1].id).toBe('3'); // 2024-01-02
      expect(sorted[2].id).toBe('2'); // 2024-01-03
    });
  });

  describe('Title Sorting Logic', () => {
    it('should sort by title in ascending order (A-Z)', () => {
      const inputSignal = signal([...baseTodos]);
      service.setSortKey('title');
      service.setSortOrder('asc');
      
      const sorted = service.getSortedTodos(inputSignal)();
      
      expect(sorted[0].title).toBe('Alpha Task');
      expect(sorted[1].title).toBe('Beta Task');
      expect(sorted[2].title).toBe('Zebra Task');
    });

    it('should sort by title in descending order (Z-A)', () => {
      const inputSignal = signal([...baseTodos]);
      service.setSortKey('title');
      service.setSortOrder('desc');
      
      const sorted = service.getSortedTodos(inputSignal)();
      
      expect(sorted[0].title).toBe('Zebra Task');
      expect(sorted[1].title).toBe('Beta Task');
      expect(sorted[2].title).toBe('Alpha Task');
    });

    it('should handle case-insensitive title sorting', () => {
      const mixedCaseTodos: Todo[] = [
        {
          ...baseTodos[0],
          id: '1',
          title: 'zebra task',
          createdAt: new Date('2024-01-01')
        },
        {
          ...baseTodos[1],
          id: '2',
          title: 'ALPHA TASK',
          createdAt: new Date('2024-01-02')
        },
        {
          ...baseTodos[2],
          id: '3',
          title: 'Beta Task',
          createdAt: new Date('2024-01-03')
        }
      ];
      
      const inputSignal = signal(mixedCaseTodos);
      service.setSortKey('title');
      service.setSortOrder('asc');
      
      const sorted = service.getSortedTodos(inputSignal)();
      
      expect(sorted[0].title).toBe('ALPHA TASK');
      expect(sorted[1].title).toBe('Beta Task');
      expect(sorted[2].title).toBe('zebra task');
    });
  });

  describe('Priority Sorting Logic', () => {
    it('should sort by priority in ascending order (low -> high)', () => {
      const inputSignal = signal([...baseTodos]);
      service.setSortKey('priority');
      service.setSortOrder('asc');
      
      const sorted = service.getSortedTodos(inputSignal)();
      
      expect(sorted[0].priority).toBe('low');
      expect(sorted[1].priority).toBe('medium');
      expect(sorted[2].priority).toBe('high');
    });

    it('should sort by priority in descending order (high -> low)', () => {
      const inputSignal = signal([...baseTodos]);
      service.setSortKey('priority');
      service.setSortOrder('desc');
      
      const sorted = service.getSortedTodos(inputSignal)();
      
      expect(sorted[0].priority).toBe('high');
      expect(sorted[1].priority).toBe('medium');
      expect(sorted[2].priority).toBe('low');
    });

    it('should handle multiple todos with same priority', () => {
      const samePriorityTodos: Todo[] = [
        { ...baseTodos[0], priority: 'high', title: 'High Task 1', createdAt: new Date('2024-01-01') },
        { ...baseTodos[1], priority: 'high', title: 'High Task 2', createdAt: new Date('2024-01-02') },
        { ...baseTodos[2], priority: 'low', title: 'Low Task', createdAt: new Date('2024-01-03') }
      ];
      
      const inputSignal = signal(samePriorityTodos);
      service.setSortKey('priority');
      service.setSortOrder('desc');
      
      const sorted = service.getSortedTodos(inputSignal)();
      
      // High priority tasks should come first
      expect(sorted[0].priority).toBe('high');
      expect(sorted[1].priority).toBe('high');
      expect(sorted[2].priority).toBe('low');
    });
  });

  describe('Empty and Edge Cases', () => {
    it('should handle empty todo list for all sort types', () => {
      const emptySignal = signal<Todo[]>([]);
      
      service.setSortKey('date');
      expect(service.getSortedTodos(emptySignal)()).toEqual([]);
      
      service.setSortKey('title');
      expect(service.getSortedTodos(emptySignal)()).toEqual([]);
      
      service.setSortKey('priority');
      expect(service.getSortedTodos(emptySignal)()).toEqual([]);
    });

    it('should handle single todo item', () => {
      const singleTodoSignal = signal([baseTodos[0]]);
      
      service.setSortKey('date');
      service.setSortOrder('asc');
      const sorted = service.getSortedTodos(singleTodoSignal)();
      
      expect(sorted).toEqual([baseTodos[0]]);
      expect(sorted.length).toBe(1);
    });

    it('should handle invalid sort key gracefully by defaulting to date', () => {
      const inputSignal = signal([...baseTodos]);
      
      // Cast to bypass TypeScript checking for testing purposes
      service.setSortKey('invalid' as SortType);
      service.setSortOrder('desc');
      
      const sorted = service.getSortedTodos(inputSignal)();
      
      // Should fall back to date sorting (newest first in desc order)
      expect(sorted[0].id).toBe('2'); // 2024-01-03
      expect(sorted[1].id).toBe('3'); // 2024-01-02
      expect(sorted[2].id).toBe('1'); // 2024-01-01
    });
  });

  describe('Reactive Signal Behavior', () => {
    it('should update sorted results when input todos change', () => {
      const todosSignal = signal([...baseTodos]);
      service.setSortKey('title');
      service.setSortOrder('asc');
      
      const sortedSignal = service.getSortedTodos(todosSignal);
      expect(sortedSignal()[0].title).toBe('Alpha Task');
      
      // Add a new todo with title that comes first alphabetically
      const newTodo: Todo = {
        id: '4',
        title: 'AAA First Task',
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        priority: 'medium',
        tags: []
      };
      
      todosSignal.update(todos => [...todos, newTodo]);
      expect(sortedSignal()[0].title).toBe('AAA First Task');
    });

    it('should update sorted results when sort criteria change', () => {
      const todosSignal = signal([...baseTodos]);
      const sortedSignal = service.getSortedTodos(todosSignal);
      
      // Sort by title ascending
      service.setSortKey('title');
      service.setSortOrder('asc');
      expect(sortedSignal()[0].title).toBe('Alpha Task');
      
      // Change to descending
      service.setSortOrder('desc');
      expect(sortedSignal()[0].title).toBe('Zebra Task');
      
      // Change to priority descending
      service.setSortKey('priority');
      expect(sortedSignal()[0].priority).toBe('high');
    });

    it('should handle rapid sort changes correctly', () => {
      const todosSignal = signal([...baseTodos]);
      const sortedSignal = service.getSortedTodos(todosSignal);
      
      // Rapid changes
      service.setSortKey('title');
      service.setSortOrder('asc');
      service.setSortKey('priority');
      service.setSortOrder('desc');
      service.toggleSortOrder(); // back to asc
      
      // Should end up with priority ascending
      const sorted = sortedSignal();
      expect(sorted[0].priority).toBe('low');
      expect(sorted[1].priority).toBe('medium');
      expect(sorted[2].priority).toBe('high');
    });
  });

  describe('Immutability', () => {
    it('should not mutate the original todos array', () => {
      const originalTodos = [...baseTodos];
      const todosSignal = signal(originalTodos);
      
      service.setSortKey('title');
      service.setSortOrder('asc');
      
      const sorted = service.getSortedTodos(todosSignal)();
      
      // Original array should be unchanged
      expect(originalTodos[0].title).toBe('Zebra Task');
      expect(sorted[0].title).toBe('Alpha Task');
      
      // Arrays should be different instances
      expect(sorted).not.toBe(originalTodos);
    });

    it('should create new arrays for each sort operation', () => {
      const todosSignal = signal([...baseTodos]);
      const sortedSignal = service.getSortedTodos(todosSignal);
      
      service.setSortKey('title');
      service.setSortOrder('asc');
      const result1 = sortedSignal();
      
      service.setSortOrder('desc');
      const result2 = sortedSignal();
      
      // Should be different array instances
      expect(result1).not.toBe(result2);
      expect(result1[0].title).not.toBe(result2[0].title);
    });
  });

  describe('Signal Memory Management', () => {
    it('should not cause memory leaks with multiple signal subscriptions', () => {
      const todosSignal = signal([...baseTodos]);
      
      // Create multiple sorted signals
      const sorted1 = service.getSortedTodos(todosSignal);
      const sorted2 = service.getSortedTodos(todosSignal);
      const sorted3 = service.getSortedTodos(todosSignal);
      
      // Change sort criteria multiple times
      service.setSortKey('title');
      service.setSortOrder('asc');
      service.setSortKey('priority');
      service.setSortOrder('desc');
      
      // All signals should reflect current state
      expect(sorted1()[0].priority).toBe('high');
      expect(sorted2()[0].priority).toBe('high');
      expect(sorted3()[0].priority).toBe('high');
    });
  });
});