import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { vi, expect } from 'vitest';
import { TodoListComponent } from './todo-list.component';
import { TodoService } from '../../services/todo.service';
import { Todo } from '../../models/todo.model';

describe('TodoListComponent', () => {
  let component: TodoListComponent;
  let fixture: ComponentFixture<TodoListComponent>;
  let mockTodoService: {
    todos: ReturnType<typeof vi.fn>;
    stats: ReturnType<typeof vi.fn>;
  };

  const mockTodos: Todo[] = [
    {
      id: '1',
      title: 'Test Todo 1',
      description: 'Test Description 1',
      completed: false,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
      priority: 'medium',
      dueDate: new Date('2023-12-31'),
      tags: ['test']
    },
    {
      id: '2',
      title: 'Test Todo 2',
      description: 'Test Description 2',
      completed: true,
      createdAt: new Date('2023-01-02'),
      updatedAt: new Date('2023-01-02'),
      priority: 'high',
      tags: ['test', 'completed']
    }
  ];

  const mockStats = {
    total: 2,
    completed: 1,
    pending: 1,
    completionRate: 50
  };

  beforeEach(async () => {
    // Mock TodoService with signal methods
    mockTodoService = {
      todos: vi.fn().mockReturnValue(mockTodos),
      stats: vi.fn().mockReturnValue(mockStats)
    };

    await TestBed.configureTestingModule({
      imports: [TodoListComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: TodoService, useValue: mockTodoService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TodoListComponent);
    component = fixture.componentInstance;
  });

  describe('Component Creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should inject TodoService', () => {
      expect(component.todoService).toBeTruthy();
    });

    it('should render without errors', () => {
      expect(() => fixture.detectChanges()).not.toThrow();
    });
  });

  describe('Signal-based State Management', () => {
    it('should have todos computed signal', () => {
      expect(component.todos).toBeDefined();
      expect(component.todos()).toEqual(mockTodos);
    });

    it('should have stats computed signal', () => {
      expect(component.stats).toBeDefined();
      expect(component.stats()).toEqual(mockStats);
    });

    it('should update when service signals change', () => {
      const newTodos = [...mockTodos, {
        id: '3',
        title: 'New Todo',
        description: 'New Description',
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        priority: 'low' as const,
        tags: []
      }];

      mockTodoService.todos.mockReturnValue(newTodos);
      expect(component.todos()).toEqual(newTodos);
    });
  });

  describe('Template Rendering', () => {
    it('should display todo list title', () => {
      fixture.detectChanges();
      const titleElement = fixture.nativeElement.querySelector('.todo-list__title');
      expect(titleElement).toBeTruthy();
      expect(titleElement.textContent.trim()).toBe('Todo List');
    });

    it('should display statistics when todos exist', () => {
      fixture.detectChanges();
      const statsElement = fixture.nativeElement.querySelector('.todo-list__stats');
      expect(statsElement).toBeTruthy();
      
      const statElements = fixture.nativeElement.querySelectorAll('.todo-list__stat');
      expect(statElements).toHaveLength(3);
      expect(statElements[0].textContent.trim()).toBe('2 total');
      expect(statElements[1].textContent.trim()).toBe('1 completed');
      expect(statElements[2].textContent.trim()).toBe('1 pending');
    });

    it('should render todo items using @for control flow', () => {
      fixture.detectChanges();
      const todoItems = fixture.nativeElement.querySelectorAll('.todo-list__item');
      expect(todoItems).toHaveLength(2);

      expect(todoItems[0].querySelector('h3').textContent.trim()).toBe('Test Todo 1');
      expect(todoItems[1].querySelector('h3').textContent.trim()).toBe('Test Todo 2');
    });

    it('should display todo details correctly', () => {
      fixture.detectChanges();
      const firstTodoItem = fixture.nativeElement.querySelector('.todo-list__item');
      
      expect(firstTodoItem.querySelector('h3').textContent.trim()).toBe('Test Todo 1');
      expect(firstTodoItem.querySelector('p').textContent.trim()).toBe('Test Description 1');
      expect(firstTodoItem.textContent).toContain('Priority: medium');
      expect(firstTodoItem.textContent).toContain('Status: Pending');
    });

    it('should use track by id for @for loop', () => {
      fixture.detectChanges();
      const todoItems = fixture.nativeElement.querySelectorAll('.todo-list__item');
      
      expect(todoItems[0].getAttribute('data-todo-id')).toBe('1');
      expect(todoItems[1].getAttribute('data-todo-id')).toBe('2');
    });
  });

  describe('Empty State', () => {
    beforeEach(() => {
      mockTodoService.todos.mockReturnValue([]);
      mockTodoService.stats.mockReturnValue({
        total: 0,
        completed: 0,
        pending: 0,
        completionRate: 0
      });
    });

    it('should display empty state when no todos exist', () => {
      fixture.detectChanges();
      const emptyElement = fixture.nativeElement.querySelector('.todo-list__empty');
      expect(emptyElement).toBeTruthy();
      expect(emptyElement.textContent.trim()).toContain('No todos found');
    });

    it('should not display stats when no todos exist', () => {
      fixture.detectChanges();
      const statsElement = fixture.nativeElement.querySelector('.todo-list__stats');
      expect(statsElement).toBeFalsy();
    });

    it('should not display todo items when empty', () => {
      fixture.detectChanges();
      const todoItems = fixture.nativeElement.querySelectorAll('.todo-list__item');
      expect(todoItems).toHaveLength(0);
    });
  });

  describe('Accessibility', () => {
    it('should have proper semantic structure', () => {
      fixture.detectChanges();
      const titleElement = fixture.nativeElement.querySelector('h2');
      const todoTitles = fixture.nativeElement.querySelectorAll('h3');
      
      expect(titleElement).toBeTruthy();
      expect(todoTitles).toHaveLength(2);
    });

    it('should provide data attributes for testing', () => {
      fixture.detectChanges();
      const todoItems = fixture.nativeElement.querySelectorAll('[data-todo-id]');
      expect(todoItems).toHaveLength(2);
    });
  });
});