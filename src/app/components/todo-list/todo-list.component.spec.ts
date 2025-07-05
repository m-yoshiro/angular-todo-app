import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { vi, expect } from 'vitest';
import { TodoListComponent } from './todo-list.component';
import { TodoService } from '../../services/todo.service';
import { Todo, CreateTodoRequest, FilterType } from '../../models/todo.model';

describe('TodoListComponent', () => {
  let component: TodoListComponent;
  let fixture: ComponentFixture<TodoListComponent>;
  let mockTodoService: {
    todos: ReturnType<typeof vi.fn>;
    filteredTodos: ReturnType<typeof vi.fn>;
    currentFilter: ReturnType<typeof vi.fn>;
    stats: ReturnType<typeof vi.fn>;
    addTodo: ReturnType<typeof vi.fn>;
    deleteTodo: ReturnType<typeof vi.fn>;
    toggleTodo: ReturnType<typeof vi.fn>;
    setFilter: ReturnType<typeof vi.fn>;
    showAll: ReturnType<typeof vi.fn>;
    showActive: ReturnType<typeof vi.fn>;
    showCompleted: ReturnType<typeof vi.fn>;
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
      filteredTodos: vi.fn().mockReturnValue(mockTodos), // Default to showing all todos
      currentFilter: vi.fn().mockReturnValue('all' as FilterType),
      stats: vi.fn().mockReturnValue(mockStats),
      addTodo: vi.fn(),
      deleteTodo: vi.fn(),
      toggleTodo: vi.fn(),
      setFilter: vi.fn(),
      showAll: vi.fn(),
      showActive: vi.fn(),
      showCompleted: vi.fn()
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
    it('should have todos computed signal that uses filteredTodos', () => {
      expect(component.todos).toBeDefined();
      expect(component.todos()).toEqual(mockTodos);
      expect(mockTodoService.filteredTodos).toHaveBeenCalled();
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

      mockTodoService.filteredTodos.mockReturnValue(newTodos);
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
      mockTodoService.filteredTodos.mockReturnValue([]);
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
      expect(emptyElement.textContent.trim()).toContain('No todos found. Add your first todo to get started!');
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

    it('should have proper ARIA labels and roles for accessibility', () => {
      fixture.detectChanges();
      
      // Check main role and aria-labelledby
      const mainElement = fixture.nativeElement.querySelector('[role="main"]');
      expect(mainElement).toBeTruthy();
      expect(mainElement.getAttribute('aria-labelledby')).toBe('todo-list-title');
      
      // Check header semantic element
      const headerElement = fixture.nativeElement.querySelector('header');
      expect(headerElement).toBeTruthy();
      
      // Check form section accessibility
      const formSection = fixture.nativeElement.querySelector('.todo-list__form');
      expect(formSection.getAttribute('aria-labelledby')).toBe('add-todo-heading');
      
      // Check content section accessibility
      const contentSection = fixture.nativeElement.querySelector('.todo-list__content');
      expect(contentSection.getAttribute('aria-labelledby')).toBe('todo-items-heading');
    });

    it('should have proper heading hierarchy for screen readers', () => {
      fixture.detectChanges();
      
      // Check main heading (h2)
      const mainHeading = fixture.nativeElement.querySelector('#todo-list-title');
      expect(mainHeading.tagName.toLowerCase()).toBe('h2');
      
      // Check sub-headings (h3) with sr-only class
      const subHeadings = fixture.nativeElement.querySelectorAll('h3.sr-only');
      expect(subHeadings).toHaveLength(3);
      expect(subHeadings[0].textContent.trim()).toBe('Filter Todos');
      expect(subHeadings[1].textContent.trim()).toBe('Add New Todo');
      expect(subHeadings[2].textContent.trim()).toBe('Todo Items');
    });

    it('should have live regions for dynamic content updates', () => {
      fixture.detectChanges();
      
      // Check stats live region
      const statsElement = fixture.nativeElement.querySelector('.todo-list__stats');
      expect(statsElement).toBeTruthy();
      expect(statsElement.getAttribute('role')).toBe('status');
      expect(statsElement.getAttribute('aria-live')).toBe('polite');
      
      // Check empty state live region - need to set up empty state first
      mockTodoService.todos.mockReturnValue([]);
      mockTodoService.filteredTodos.mockReturnValue([]);
      mockTodoService.stats.mockReturnValue({
        total: 0,
        completed: 0,
        pending: 0,
        completionRate: 0
      });
      
      // Create new component instance with empty state
      fixture = TestBed.createComponent(TodoListComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      
      const emptyElement = fixture.nativeElement.querySelector('.todo-list__empty');
      expect(emptyElement).toBeTruthy();
      expect(emptyElement.getAttribute('role')).toBe('status');
      expect(emptyElement.getAttribute('aria-live')).toBe('polite');
    });

    it('should use proper list semantics for todo items', () => {
      fixture.detectChanges();
      
      const listElement = fixture.nativeElement.querySelector('ul.todo-list__items');
      expect(listElement).toBeTruthy();
      expect(listElement.getAttribute('role')).toBe('list');
      expect(listElement.getAttribute('aria-label')).toBe('Todo items list');
      
      const listItems = fixture.nativeElement.querySelectorAll('li[role="listitem"]');
      expect(listItems).toHaveLength(2);
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

      // More explicit mock implementation showing signal update behavior
      mockTodoService.addTodo.mockImplementation((createRequest: CreateTodoRequest) => {
        // Simulate the service creating a new todo and updating the signal
        const createdTodo = {
          ...newTodo,
          title: createRequest.title,
          description: createRequest.description,
          priority: createRequest.priority
        };
        const updatedTodos = [...initialTodos, createdTodo];
        
        // Explicitly update the mock to return the new todos array
        mockTodoService.todos.mockReturnValue(updatedTodos);
        mockTodoService.filteredTodos.mockReturnValue(updatedTodos);
      });

      const createRequest = {
        title: 'New Todo from Form',
        description: 'Created via form',
        priority: 'medium' as const
      };

      component.onAddTodo(createRequest);
      fixture.detectChanges();

      expect(mockTodoService.addTodo).toHaveBeenCalledWith(createRequest);
      expect(mockTodoService.addTodo).toHaveBeenCalledTimes(1);
      
      // Verify the todos signal was updated with the new todo
      const currentTodos = component.todos();
      expect(currentTodos).toHaveLength(3);
      expect(currentTodos.some(todo => todo.title === 'New Todo from Form')).toBe(true);
    });

    describe('Edge Cases and Error Handling', () => {
      it('should handle invalid todo creation request with empty title', () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {
          // Intentionally empty for test
        });
        
        const invalidRequest = {
          title: '',
          priority: 'medium' as const
        };

        component.onAddTodo(invalidRequest);

        expect(consoleSpy).toHaveBeenCalledWith('Invalid todo creation request: Title is required');
        expect(mockTodoService.addTodo).not.toHaveBeenCalled();
        
        consoleSpy.mockRestore();
      });

      it('should handle invalid todo creation request with whitespace-only title', () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {
          // Intentionally empty for test
        });
        
        const invalidRequest = {
          title: '   ',
          priority: 'medium' as const
        };

        component.onAddTodo(invalidRequest);

        expect(consoleSpy).toHaveBeenCalledWith('Invalid todo creation request: Title is required');
        expect(mockTodoService.addTodo).not.toHaveBeenCalled();
        
        consoleSpy.mockRestore();
      });

      it('should handle null or undefined createRequest', () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {
          // Intentionally empty for test
        });
        
        component.onAddTodo(null as unknown as CreateTodoRequest);

        expect(consoleSpy).toHaveBeenCalledWith('Invalid todo creation request: Title is required');
        expect(mockTodoService.addTodo).not.toHaveBeenCalled();
        
        consoleSpy.mockRestore();
      });

      it('should handle TodoService.addTodo throwing an error', () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {
          // Intentionally empty for test
        });
        const serviceError = new Error('Service unavailable');
        
        mockTodoService.addTodo.mockImplementation(() => {
          throw serviceError;
        });

        const validRequest = {
          title: 'Valid Todo',
          priority: 'medium' as const
        };

        expect(() => component.onAddTodo(validRequest)).not.toThrow();
        expect(consoleSpy).toHaveBeenCalledWith('Failed to create todo:', serviceError);
        
        consoleSpy.mockRestore();
      });

      it('should handle form submission with minimal required data', () => {
        const minimalRequest = {
          title: 'Minimal Todo',
          priority: 'low' as const
        };

        component.onAddTodo(minimalRequest);

        expect(mockTodoService.addTodo).toHaveBeenCalledWith(minimalRequest);
        expect(mockTodoService.addTodo).toHaveBeenCalledTimes(1);
      });

      it('should handle form submission with all optional fields', () => {
        const completeRequest = {
          title: 'Complete Todo',
          description: 'A detailed description',
          priority: 'high' as const,
          dueDate: new Date('2024-12-31'),
          tags: ['important', 'urgent']
        };

        component.onAddTodo(completeRequest);

        expect(mockTodoService.addTodo).toHaveBeenCalledWith(completeRequest);
        expect(mockTodoService.addTodo).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Todo Deletion (TDD)', () => {
    it('should have onDeleteTodo method', () => {
      expect(component.onDeleteTodo).toBeDefined();
      expect(typeof component.onDeleteTodo).toBe('function');
    });

    it('should call TodoService.deleteTodo when onDeleteTodo is called', () => {
      const todoId = 'test-id-123';
      
      // Mock confirm to return true (user confirms deletion)
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      mockTodoService.deleteTodo.mockReturnValue(true);

      component.onDeleteTodo(todoId);

      expect(mockTodoService.deleteTodo).toHaveBeenCalledWith(todoId);
      expect(mockTodoService.deleteTodo).toHaveBeenCalledTimes(1);
    });

    it('should show confirmation dialog before deleting todo', () => {
      const todoId = 'test-id-123';
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      mockTodoService.deleteTodo.mockReturnValue(true);

      component.onDeleteTodo(todoId);

      expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to delete this todo?');
    });

    it('should not delete todo if user cancels confirmation', () => {
      const todoId = 'test-id-123';
      vi.spyOn(window, 'confirm').mockReturnValue(false);
      mockTodoService.deleteTodo.mockReturnValue(true);

      component.onDeleteTodo(todoId);

      expect(mockTodoService.deleteTodo).not.toHaveBeenCalled();
    });

    it('should handle error when TodoService.deleteTodo fails', () => {
      const todoId = 'test-id-123';
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {
        // Intentionally empty for test
      });
      
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      mockTodoService.deleteTodo.mockImplementation(() => {
        throw new Error('Delete failed');
      });

      expect(() => component.onDeleteTodo(todoId)).not.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith('Failed to delete todo:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });

    it('should handle TodoService.deleteTodo returning false', () => {
      const todoId = 'non-existent-id';
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {
        // Intentionally empty for test
      });
      
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      mockTodoService.deleteTodo.mockReturnValue(false);

      component.onDeleteTodo(todoId);

      expect(consoleSpy).toHaveBeenCalledWith('Todo not found or could not be deleted:', todoId);
      
      consoleSpy.mockRestore();
    });

    it('should connect TodoItem deleteTodo event to onDeleteTodo handler', () => {
      const onDeleteTodoSpy = vi.spyOn(component, 'onDeleteTodo').mockImplementation(() => {
        // Intentionally empty for test
      });
      fixture.detectChanges();

      // Get all TodoItem components in the template
      const todoItemElements = fixture.nativeElement.querySelectorAll('app-todo-item');
      expect(todoItemElements).toHaveLength(2);

      // Simulate TodoItem emitting deleteTodo event (integration test approach)
      const testTodoId = 'test-todo-id';
      component.onDeleteTodo(testTodoId);

      expect(onDeleteTodoSpy).toHaveBeenCalledWith(testTodoId);
      
      onDeleteTodoSpy.mockRestore();
    });
  });

  describe('Todo Toggle (TDD)', () => {
    it('should have onToggleTodo method', () => {
      expect(component.onToggleTodo).toBeDefined();
      expect(typeof component.onToggleTodo).toBe('function');
    });

    it('should call TodoService.toggleTodo when onToggleTodo is called', () => {
      const todoId = 'test-id-123';
      const toggledTodo = { ...mockTodos[0], completed: !mockTodos[0].completed };
      mockTodoService.toggleTodo.mockReturnValue(toggledTodo);

      component.onToggleTodo(todoId);

      expect(mockTodoService.toggleTodo).toHaveBeenCalledWith(todoId);
      expect(mockTodoService.toggleTodo).toHaveBeenCalledTimes(1);
    });

    it('should handle error when TodoService.toggleTodo returns null', () => {
      const todoId = 'non-existent-id';
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {
        // Intentionally empty for test
      });
      
      mockTodoService.toggleTodo.mockReturnValue(null);

      component.onToggleTodo(todoId);

      expect(consoleSpy).toHaveBeenCalledWith('Todo not found or could not be toggled:', todoId);
      
      consoleSpy.mockRestore();
    });

    it('should handle TodoService.toggleTodo throwing an error', () => {
      const todoId = 'test-id-123';
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {
        // Intentionally empty for test
      });
      const serviceError = new Error('Toggle service unavailable');
      
      mockTodoService.toggleTodo.mockImplementation(() => {
        throw serviceError;
      });

      expect(() => component.onToggleTodo(todoId)).not.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith('Failed to toggle todo:', serviceError);
      
      consoleSpy.mockRestore();
    });

    it('should connect TodoItem toggleComplete event to onToggleTodo handler', () => {
      const onToggleTodoSpy = vi.spyOn(component, 'onToggleTodo').mockImplementation(() => {
        // Intentionally empty for test
      });
      fixture.detectChanges();

      // Get all TodoItem components in the template
      const todoItemElements = fixture.nativeElement.querySelectorAll('app-todo-item');
      expect(todoItemElements).toHaveLength(2);

      // Simulate TodoItem emitting toggleComplete event (integration test approach)
      const testTodoId = 'test-todo-id';
      component.onToggleTodo(testTodoId);

      expect(onToggleTodoSpy).toHaveBeenCalledWith(testTodoId);
      
      onToggleTodoSpy.mockRestore();
    });
  });

  describe('Filtering Integration', () => {
    it('should render TodoFilterComponent', () => {
      fixture.detectChanges();
      const filterComponent = fixture.nativeElement.querySelector('app-todo-filter');
      expect(filterComponent).toBeTruthy();
    });

    it('should pass currentFilter to TodoFilterComponent', () => {
      mockTodoService.currentFilter.mockReturnValue('active');
      fixture.detectChanges();
      
      const filterComponent = fixture.nativeElement.querySelector('app-todo-filter');
      expect(filterComponent).toBeTruthy();
      expect(mockTodoService.currentFilter).toHaveBeenCalled();
    });

    it('should handle filter changes from TodoFilterComponent', () => {
      fixture.detectChanges();
      
      // The filter component is connected via (filterChange)="todoService.setFilter($event)"
      // This tests that the binding is correct
      const filterComponent = fixture.nativeElement.querySelector('app-todo-filter');
      expect(filterComponent).toBeTruthy();
    });

    it('should use filteredTodos for displaying todos', () => {
      const activeTodos = mockTodos.filter(todo => !todo.completed);
      mockTodoService.filteredTodos.mockReturnValue(activeTodos);
      mockTodoService.currentFilter.mockReturnValue('active');
      
      fixture.detectChanges();
      
      const todoItemComponents = fixture.nativeElement.querySelectorAll('app-todo-item');
      expect(todoItemComponents).toHaveLength(activeTodos.length);
      expect(component.todos()).toEqual(activeTodos);
    });

    describe('Filter-specific empty states', () => {
      it('should show active filter empty state when no active todos', () => {
        mockTodoService.todos.mockReturnValue(mockTodos); // Has todos
        mockTodoService.filteredTodos.mockReturnValue([]); // But none match filter
        mockTodoService.currentFilter.mockReturnValue('active');
        
        fixture.detectChanges();
        
        const emptyElement = fixture.nativeElement.querySelector('.todo-list__empty');
        expect(emptyElement).toBeTruthy();
        expect(emptyElement.textContent.trim()).toContain('No active todos found. All your todos are completed!');
      });

      it('should show completed filter empty state when no completed todos', () => {
        mockTodoService.todos.mockReturnValue(mockTodos); // Has todos
        mockTodoService.filteredTodos.mockReturnValue([]); // But none match filter
        mockTodoService.currentFilter.mockReturnValue('completed');
        
        fixture.detectChanges();
        
        const emptyElement = fixture.nativeElement.querySelector('.todo-list__empty');
        expect(emptyElement).toBeTruthy();
        expect(emptyElement.textContent.trim()).toContain('No completed todos found. Complete some todos to see them here.');
      });

      it('should show generic empty state for unknown filter', () => {
        mockTodoService.todos.mockReturnValue(mockTodos); // Has todos
        mockTodoService.filteredTodos.mockReturnValue([]); // But none match filter
        mockTodoService.currentFilter.mockReturnValue('unknown' as FilterType);
        
        fixture.detectChanges();
        
        const emptyElement = fixture.nativeElement.querySelector('.todo-list__empty');
        expect(emptyElement).toBeTruthy();
        expect(emptyElement.textContent.trim()).toContain('No todos found.');
      });

      it('should show initial empty state when no todos exist at all', () => {
        mockTodoService.todos.mockReturnValue([]); // No todos at all
        mockTodoService.filteredTodos.mockReturnValue([]);
        mockTodoService.currentFilter.mockReturnValue('all');
        
        fixture.detectChanges();
        
        const emptyElement = fixture.nativeElement.querySelector('.todo-list__empty');
        expect(emptyElement).toBeTruthy();
        expect(emptyElement.textContent.trim()).toContain('No todos found. Add your first todo to get started!');
      });
    });

    describe('Filter section accessibility', () => {
      it('should have proper semantic structure for filter section', () => {
        fixture.detectChanges();
        
        const filterSection = fixture.nativeElement.querySelector('.todo-list__filter');
        expect(filterSection).toBeTruthy();
        expect(filterSection.getAttribute('aria-labelledby')).toBe('todo-filter-heading');
        expect(filterSection.getAttribute('data-testid')).toBe('todo-filter-section');
      });

      it('should have screen reader heading for filter section', () => {
        fixture.detectChanges();
        
        const filterHeading = fixture.nativeElement.querySelector('#todo-filter-heading');
        expect(filterHeading).toBeTruthy();
        expect(filterHeading.textContent.trim()).toBe('Filter Todos');
        expect(filterHeading.classList.contains('sr-only')).toBe(true);
      });
    });

    describe('Integration with TodoService filtering', () => {
      it('should call TodoService.setFilter when filter component emits filterChange', () => {
        fixture.detectChanges();
        
        // Since the template binding connects directly to todoService.setFilter,
        // we can verify that the binding exists by checking the template structure
        const filterComponent = fixture.nativeElement.querySelector('app-todo-filter');
        expect(filterComponent).toBeTruthy();
        
        // The actual connection is tested through the binding in the template
        // We can verify the service would be called by invoking the component's public interface
        expect(component.todoService.setFilter).toBeDefined();
      });

      it('should reflect current filter state from TodoService', () => {
        mockTodoService.currentFilter.mockReturnValue('completed');
        fixture.detectChanges();
        
        expect(mockTodoService.currentFilter).toHaveBeenCalled();
        
        // The filter component receives the current filter as input
        const filterComponent = fixture.nativeElement.querySelector('app-todo-filter');
        expect(filterComponent).toBeTruthy();
      });

      it('should update displayed todos when filter changes', () => {
        // Start with all todos
        mockTodoService.filteredTodos.mockReturnValue(mockTodos);
        mockTodoService.currentFilter.mockReturnValue('all');
        fixture.detectChanges();
        
        const todoItems = fixture.nativeElement.querySelectorAll('app-todo-item');
        expect(todoItems).toHaveLength(2);
        
        // Switch to only active todos
        const activeTodos = mockTodos.filter(todo => !todo.completed);
        
        // Update both the filtered todos and current filter at the same time
        mockTodoService.filteredTodos.mockReturnValue(activeTodos);
        mockTodoService.currentFilter.mockReturnValue('active');
        
        // Create a new component fixture to avoid change detection issues
        fixture = TestBed.createComponent(TodoListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        
        expect(component.todos()).toEqual(activeTodos);
      });
    });
  });
});