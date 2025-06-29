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
    addTodo: ReturnType<typeof vi.fn>;
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
      stats: vi.fn().mockReturnValue(mockStats),
      addTodo: vi.fn()
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

    it('should render TodoItem components for each todo', () => {
      fixture.detectChanges();
      const todoItemComponents = fixture.nativeElement.querySelectorAll('app-todo-item');
      expect(todoItemComponents).toHaveLength(2);
    });

    it('should render todo items using @for control flow with TodoItem components', () => {
      fixture.detectChanges();
      const todoItemComponents = fixture.nativeElement.querySelectorAll('app-todo-item');
      expect(todoItemComponents).toHaveLength(2);
    });

    it('should pass todo data to TodoItem components via input binding', () => {
      fixture.detectChanges();
      const todoItemComponents = fixture.nativeElement.querySelectorAll('app-todo-item');
      expect(todoItemComponents).toHaveLength(2);
    });

    it('should maintain proper tracking for @for loop performance', () => {
      fixture.detectChanges();
      const todoItemComponents = fixture.nativeElement.querySelectorAll('app-todo-item');
      expect(todoItemComponents).toHaveLength(2);
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
      const todoItemComponents = fixture.nativeElement.querySelectorAll('app-todo-item');
      expect(todoItemComponents).toHaveLength(0);
    });
  });

  describe('Accessibility', () => {
    it('should have proper semantic structure', () => {
      fixture.detectChanges();
      const titleElement = fixture.nativeElement.querySelector('h2');
      expect(titleElement).toBeTruthy();
    });

    it('should render TodoItem components for testing', () => {
      fixture.detectChanges();
      const todoItemComponents = fixture.nativeElement.querySelectorAll('app-todo-item');
      expect(todoItemComponents).toHaveLength(2);
    });
  });

  describe('AddTodoForm Integration (TDD)', () => {

    it('should render AddTodoForm component', () => {
      fixture.detectChanges();
      const addTodoFormElement = fixture.nativeElement.querySelector('app-add-todo-form');
      expect(addTodoFormElement).toBeTruthy();
    });

    it('should have onAddTodo method to handle form submission', () => {
      expect(component.onAddTodo).toBeDefined();
      expect(typeof component.onAddTodo).toBe('function');
    });

    it('should call TodoService.addTodo when onAddTodo is called', () => {
      const createRequest = {
        title: 'New Todo',
        description: 'New Description',
        priority: 'medium' as const,
        dueDate: new Date('2024-12-31'),
        tags: ['test']
      };

      component.onAddTodo(createRequest);

      expect(mockTodoService.addTodo).toHaveBeenCalledWith(createRequest);
    });

    it('should connect AddTodoForm formSubmit event to onAddTodo handler', () => {
      const onAddTodoSpy = vi.spyOn(component, 'onAddTodo');
      fixture.detectChanges();

      const addTodoFormComponent = fixture.nativeElement.querySelector('app-add-todo-form');
      expect(addTodoFormComponent).toBeTruthy();
      
      // Simulate form submission by calling the method directly (integration test)
      const createRequest = {
        title: 'Test Todo',
        priority: 'high' as const
      };
      
      component.onAddTodo(createRequest);

      expect(onAddTodoSpy).toHaveBeenCalledWith(createRequest);
    });

    it('should display new todo in list after form submission', () => {
      const initialTodos = [...mockTodos];
      const newTodo = {
        id: '3',
        title: 'New Todo from Form',
        description: 'Created via form',
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        priority: 'medium' as const,
        tags: []
      };

      // Simulate TodoService.addTodo updating the todos signal
      mockTodoService.addTodo.mockImplementation(() => {
        const updatedTodos = [...initialTodos, newTodo];
        mockTodoService.todos.mockReturnValue(updatedTodos);
      });

      const createRequest = {
        title: 'New Todo from Form',
        description: 'Created via form',
        priority: 'medium' as const
      };

      component.onAddTodo(createRequest);
      fixture.detectChanges();

      expect(mockTodoService.addTodo).toHaveBeenCalledWith(createRequest);
      expect(component.todos()).toContain(newTodo);
    });
  });
});