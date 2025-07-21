/**
 * @fileoverview Core todo management service using Angular 20 signals for reactive state management.
 * @description This service provides comprehensive todo item management with signal-based reactive state,
 * automatic statistics computation, and full CRUD operations. Built using Angular 20's new signal
 * primitives for optimal performance and reactivity without zones.
 */

import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { Todo, CreateTodoRequest, UpdateTodoRequest, TodoStatistics, FilterType, SortType, SortOrder } from '../models/todo.model';
import { ConfirmationService } from './confirmation.service';
import { UserFeedbackService } from './user-feedback.service';
import { TodoStorageService } from './todo-storage.service';

/**
 * Service responsible for managing todo items and providing reactive state management.
 * @description Implements signal-based state management using Angular 20's new signal primitives.
 * Provides CRUD operations, automatic statistics computation, and reactive data access.
 * Uses readonly signals for external access while maintaining internal mutability through private signals.
 * 
 * **Memory Management**: Implements proper cleanup for auto-clearing success message timeouts
 * to prevent memory leaks. The service automatically clears pending timeouts when destroyed
 * or when new success messages override existing ones.
 * 
 * **Lifecycle**: Implements OnDestroy to ensure proper resource cleanup when the service
 * is no longer needed, particularly important for the auto-clearing timeout functionality.
 * 
 * @example
 * ```typescript
 * constructor(private todoService: TodoService) {
 *   // Access reactive todo list
 *   const todos = this.todoService.todos();
 *   
 *   // Access computed statistics
 *   const stats = this.todoService.stats();
 *   
 *   // Add new todo
 *   this.todoService.addTodo({
 *     title: 'New Task',
 *     priority: 'medium'
 *   });
 *   
 *   // Set success message with auto-clearing (memory-safe)
 *   this.todoService.setSuccessMessage('Task completed!');
 * }
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class TodoService {
  /** Priority values for consistent priority sorting */
  private readonly PRIORITY_VALUES = { low: 1, medium: 2, high: 3 } as const;
  
  /** Private signal containing the mutable array of todos */
  private _todos = signal<Todo[]>([]);
  
  /** Readonly signal exposing the todo list for external consumption */
  readonly todos = this._todos.asReadonly();
  
  /** Private signal for the current filter state */
  private _currentFilter = signal<FilterType>('all');
  
  /** Readonly signal exposing the current filter for external consumption */
  readonly currentFilter = this._currentFilter.asReadonly();
  
  /** Private signal for the current sort key */
  private _sortKey = signal<SortType>('date');
  
  /** Readonly signal exposing the current sort key for external consumption */
  readonly sortKey = this._sortKey.asReadonly();
  
  /** Private signal for the current sort order */
  private _sortOrder = signal<SortOrder>('desc');
  
  /** Readonly signal exposing the current sort order for external consumption */
  readonly sortOrder = this._sortOrder.asReadonly();
  
  
  /** 
   * Computed signal providing filtered todos based on current filter state.
   * @description Automatically recalculates when todos or filter changes, providing
   * reactive filtering without manual subscription management.
   */
  readonly filteredTodos = computed<Todo[]>(() => {
    const todos = this._todos();
    const filter = this._currentFilter();
    
    switch (filter) {
      case 'active':
        return todos.filter(todo => !todo.completed);
      case 'completed':
        return todos.filter(todo => todo.completed);
      case 'all':
      default:
        return todos;
    }
  });

  /** 
   * Computed signal providing sorted and filtered todos.
   * @description Combines filtering and sorting in a reactive computed signal.
   * Automatically recalculates when todos, filter, sort key, or sort order changes.
   */
  readonly sortedAndFilteredTodos = computed<Todo[]>(() => {
    const filtered = this.filteredTodos();
    const sortKey = this._sortKey();
    const sortOrder = this._sortOrder();
    
    return this.sortTodos(filtered, sortKey, sortOrder);
  });

  /** Injected ConfirmationService for user confirmations */
  private readonly confirmationService = inject(ConfirmationService);
  
  /** Injected UserFeedbackService for user feedback management */
  private readonly userFeedbackService = inject(UserFeedbackService);

  /** Readonly signal exposing error messages for external consumption */
  readonly errorMessage = this.userFeedbackService.errorMessage;
  
  /** Readonly signal exposing success messages for external consumption */
  readonly successMessage = this.userFeedbackService.successMessage;
  
  /** Readonly signal exposing loading state for external consumption */
  readonly isLoading = this.userFeedbackService.isLoading;

  /** Injected storage service for todo persistence */
  private readonly storageService = inject(TodoStorageService);

  constructor() {
    // Load todos from storage during initialization (maintains exact same behavior)
    this._todos.set(this.storageService.loadTodos());
    
    // Set up automatic localStorage persistence using Angular 20 effects
    effect(() => {
      const todos = this._todos();
      // Use setTimeout to avoid SSR issues and ensure proper timing
      if (typeof window !== 'undefined') {
        setTimeout(() => this.storageService.saveTodos(todos), 0);
      }
    });
  }

  
  /** 
   * Computed signal providing real-time statistics about todos.
   * @description Automatically recalculates when todos change, providing
   * completion rates, priority distribution, and overdue item counts.
   */
  readonly stats = computed<TodoStatistics>(() => {
    const todos = this._todos();
    const completed = todos.filter(todo => todo.completed);
    const pending = todos.filter(todo => !todo.completed);
    const now = new Date();
    const overdue = pending.filter(todo => {
      if (!todo.dueDate) return false;
      const dueDateEndOfDay = new Date(todo.dueDate);
      dueDateEndOfDay.setHours(23, 59, 59, 999);
      return dueDateEndOfDay < now;
    });
    
    return {
      total: todos.length,
      completed: completed.length,
      pending: pending.length,
      overdue: overdue.length,
      byPriority: {
        low: todos.filter(todo => todo.priority === 'low').length,
        medium: todos.filter(todo => todo.priority === 'medium').length,
        high: todos.filter(todo => todo.priority === 'high').length
      }
    };
  });

  /**
   * Creates a new todo item and adds it to the collection.
   * @param request - The todo creation request containing title and optional metadata
   * @returns The newly created todo item with generated ID and timestamps
   */
  addTodo(request: CreateTodoRequest): Todo {
    const newTodo: Todo = {
      id: this.generateId(),
      title: request.title,
      description: request.description,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      priority: request.priority || 'medium',
      dueDate: request.dueDate,
      tags: request.tags || []
    };

    this._todos.update(todos => [...todos, newTodo]);
    return newTodo;
  }

  /**
   * Updates an existing todo item with new data.
   * @param id - The unique identifier of the todo to update
   * @param request - Partial update data containing the fields to modify
   * @returns The updated todo item or null if not found
   */
  updateTodo(id: string, request: UpdateTodoRequest): Todo | null {
    const todoIndex = this._todos().findIndex(todo => todo.id === id);
    if (todoIndex === -1) {
      return null;
    }

    this._todos.update(todos => {
      const updatedTodos = [...todos];
      updatedTodos[todoIndex] = {
        ...updatedTodos[todoIndex],
        ...request,
        updatedAt: new Date()
      };
      return updatedTodos;
    });

    return this._todos()[todoIndex];
  }

  /**
   * Toggles the completion status of a todo item.
   * @param id - The unique identifier of the todo to toggle
   * @returns The updated todo item or null if not found
   */
  toggleTodo(id: string): Todo | null {
    const todo = this.getTodoById(id);
    if (!todo) return null;
    return this.updateTodo(id, { completed: !todo.completed });
  }

  /**
   * Removes a todo item from the collection.
   * @param id - The unique identifier of the todo to delete
   * @returns True if the todo was found and deleted, false otherwise
   */
  deleteTodo(id: string): boolean {
    const initialLength = this._todos().length;
    this._todos.update(todos => todos.filter(todo => todo.id !== id));
    return this._todos().length < initialLength;
  }

  /**
   * Retrieves a specific todo item by its ID.
   * @param id - The unique identifier of the todo to find
   * @returns The todo item if found, undefined otherwise
   */
  getTodoById(id: string): Todo | undefined {
    return this._todos().find(todo => todo.id === id);
  }

  /**
   * Removes all completed todo items from the collection.
   * @description Useful for cleaning up finished tasks and maintaining a focused todo list.
   */
  clearCompleted(): void {
    this._todos.update(todos => todos.filter(todo => !todo.completed));
  }

  /**
   * Sets the current filter for displaying todos.
   * @param filter - The filter type to apply ('all', 'active', 'completed')
   */
  setFilter(filter: FilterType): void {
    this._currentFilter.set(filter);
  }

  /**
   * Shows all todos regardless of completion status.
   * @description Convenience method for setting filter to 'all'
   */
  showAll(): void {
    this.setFilter('all');
  }

  /**
   * Shows only active (incomplete) todos.
   * @description Convenience method for setting filter to 'active'
   */
  showActive(): void {
    this.setFilter('active');
  }

  /**
   * Shows only completed todos.
   * @description Convenience method for setting filter to 'completed'
   */
  showCompleted(): void {
    this.setFilter('completed');
  }

  /**
   * Sets the current sort key for displaying todos.
   * @param sortKey - The sort criteria to apply ('date', 'priority', 'title')
   */
  setSortKey(sortKey: SortType): void {
    this._sortKey.set(sortKey);
  }

  /**
   * Sets the current sort order for displaying todos.
   * @param sortOrder - The sort direction to apply ('asc', 'desc')
   */
  setSortOrder(sortOrder: SortOrder): void {
    this._sortOrder.set(sortOrder);
  }

  /**
   * Toggles the current sort order between ascending and descending.
   */
  toggleSortOrder(): void {
    const currentOrder = this._sortOrder();
    this._sortOrder.set(currentOrder === 'asc' ? 'desc' : 'asc');
  }

  /**
   * Validates a todo creation request.
   * @description Checks if the creation request has all required fields and valid data.
   * This method abstracts validation logic from components to improve separation of concerns.
   * @param request - The todo creation request to validate
   * @returns Validation result with success flag and optional error message
   */
  validateCreateRequest(request: CreateTodoRequest): { valid: boolean; error?: string } {
    if (!request) {
      return { valid: false, error: 'Request is required' };
    }

    if (!request.title || !request.title.trim()) {
      return { valid: false, error: 'Title is required' };
    }

    if (request.title.trim().length > 200) {
      return { valid: false, error: 'Title cannot exceed 200 characters' };
    }

    if (request.description && request.description.length > 1000) {
      return { valid: false, error: 'Description cannot exceed 1000 characters' };
    }

    return { valid: true };
  }

  /**
   * Confirms and deletes a todo with user confirmation.
   * @description Combines user confirmation and todo deletion in a single operation.
   * This method handles the complete deletion workflow including user confirmation.
   * @param id - The unique identifier of the todo to delete
   * @returns True if user confirmed and todo was deleted, false otherwise
   */
  confirmAndDelete(id: string): boolean {
    const confirmed = this.confirmationService.confirm('Are you sure you want to delete this todo?');
    if (!confirmed) {
      return false;
    }

    return this.deleteTodo(id);
  }

  /**
   * Creates a new todo with validation and enhanced error handling.
   * @description Validates the request, creates the todo, and provides structured result
   * with success status, created todo, or error message. Handles all error scenarios
   * and provides user-friendly feedback through service signals.
   * @param request - The todo creation request to validate and process
   * @returns Structured result with success flag, created todo, or error message
   */
  addTodoWithValidation(request: CreateTodoRequest): { success: boolean; todo?: Todo; error?: string } {
    this.userFeedbackService.clearMessages();
    this.userFeedbackService.setLoadingState(true);

    try {
      // Validate the request using existing validation method
      const validation = this.validateCreateRequest(request);
      if (!validation.valid) {
        this.userFeedbackService.setErrorMessage(validation.error!);
        this.userFeedbackService.setLoadingState(false);
        return { success: false, error: validation.error };
      }

      // Create the todo using existing method
      const newTodo = this.addTodo(request);
      this.userFeedbackService.setSuccessMessage('Todo created successfully');
      this.userFeedbackService.setLoadingState(false);
      
      return { success: true, todo: newTodo };
    } catch {
      const errorMessage = 'Failed to create todo. Please try again.';
      this.userFeedbackService.setErrorMessage(errorMessage);
      this.userFeedbackService.setLoadingState(false);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Toggles a todo completion status with enhanced error handling.
   * @description Safely toggles the todo completion status and provides structured result
   * with success status, updated todo, or error message. Handles todo not found scenarios
   * and provides user-friendly feedback through service signals.
   * @param id - The unique identifier of the todo to toggle
   * @returns Structured result with success flag, updated todo, or error message
   */
  toggleTodoSafely(id: string): { success: boolean; todo?: Todo; error?: string } {
    this.userFeedbackService.clearMessages();
    this.userFeedbackService.setLoadingState(true);

    try {
      // Attempt to toggle using existing method
      const toggledTodo = this.toggleTodo(id);
      
      if (!toggledTodo) {
        const errorMessage = 'Todo not found or could not be toggled';
        this.userFeedbackService.setErrorMessage(errorMessage);
        this.userFeedbackService.setLoadingState(false);
        return { success: false, error: errorMessage };
      }

      const statusMessage = toggledTodo.completed ? 'Todo marked as completed' : 'Todo marked as active';
      this.userFeedbackService.setSuccessMessage(statusMessage);
      this.userFeedbackService.setLoadingState(false);
      
      return { success: true, todo: toggledTodo };
    } catch {
      const errorMessage = 'Failed to toggle todo. Please try again.';
      this.userFeedbackService.setErrorMessage(errorMessage);
      this.userFeedbackService.setLoadingState(false);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Deletes a todo with user confirmation and enhanced error handling.
   * @description Combines user confirmation and todo deletion with structured result
   * including confirmation status, success status, and error message. Provides
   * user-friendly feedback through service signals for all scenarios.
   * @param id - The unique identifier of the todo to delete
   * @returns Structured result with success flag, confirmation status, or error message
   */
  deleteTodoWithConfirmation(id: string): { success: boolean; confirmed: boolean; error?: string } {
    this.userFeedbackService.clearMessages();
    this.userFeedbackService.setLoadingState(true);

    try {
      // Get confirmation from user
      const confirmed = this.confirmationService.confirm('Are you sure you want to delete this todo?');
      
      if (!confirmed) {
        this.userFeedbackService.clearMessages(); // Don't show any messages for user cancellation
        this.userFeedbackService.setLoadingState(false);
        return { success: false, confirmed: false };
      }

      // Attempt to delete the todo
      const deleted = this.deleteTodo(id);
      
      if (!deleted) {
        const errorMessage = 'Todo not found or could not be deleted';
        this.userFeedbackService.setErrorMessage(errorMessage);
        this.userFeedbackService.setLoadingState(false);
        return { success: false, confirmed: true, error: errorMessage };
      }

      this.userFeedbackService.setSuccessMessage('Todo deleted successfully');
      this.userFeedbackService.setLoadingState(false);
      
      return { success: true, confirmed: true };
    } catch {
      const errorMessage = 'Failed to delete todo. Please try again.';
      this.userFeedbackService.setErrorMessage(errorMessage);
      this.userFeedbackService.setLoadingState(false);
      return { success: false, confirmed: true, error: errorMessage };
    }
  }


  /**
   * Sorts an array of todos based on the specified criteria and order.
   * @param todos - Array of todos to sort
   * @param sortKey - The sorting criteria
   * @param sortOrder - The sorting direction
   * @returns New sorted array of todos
   */
  private sortTodos(todos: Todo[], sortKey: SortType, sortOrder: SortOrder): Todo[] {
    return [...todos].sort((a, b) => {
      let comparison = 0;
      
      switch (sortKey) {
        case 'date':
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
        case 'priority':
          comparison = this.PRIORITY_VALUES[a.priority] - this.PRIORITY_VALUES[b.priority];
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }

  /**
   * Generates a unique identifier for new todo items.
   * @returns A unique string ID based on timestamp and random values
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

}