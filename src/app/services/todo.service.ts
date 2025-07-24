/**
 * @fileoverview Core todo management orchestrator service using Angular 20 signals for reactive state management.
 * @description This service acts as an orchestrator that coordinates specialized services for todo management.
 * It maintains backward compatibility while delegating responsibilities to focused services following
 * the Single Responsibility Principle. Built using Angular 20's signal composition patterns.
 */

import { Injectable, inject } from '@angular/core';
import { Todo, CreateTodoRequest, UpdateTodoRequest, FilterType, SortType, SortOrder } from '../models/todo.model';
import { ConfirmationService } from './confirmation.service';
import { UserFeedbackService } from './user-feedback.service';
import { TodoValidationService } from './todo-validation.service';
import { TodoStateService } from './todo-state.service';
import { TodoFilterService } from './todo-filter.service';
import { TodoSortService } from './todo-sort.service';

/**
 * Service responsible for orchestrating todo operations across specialized services.
 * @description Acts as a facade that coordinates TodoStateService, TodoFilterService, 
 * TodoSortService, and other specialized services. Maintains backward compatibility 
 * with existing API while following Single Responsibility Principle through delegation.
 * 
 * **Architecture**: Implements orchestrator pattern where each responsibility is 
 * delegated to a focused service, enabling better testability and maintainability.
 * 
 * **Signal Composition**: Uses computed signals to compose reactive data flow across 
 * services, providing the final reactive chain: State → Filter → Sort → UI.
 * 
 * **Backward Compatibility**: Maintains 100% API compatibility with previous version
 * while internally using the new service architecture.
 * 
 * @example
 * ```typescript
 * constructor(private todoService: TodoService) {
 *   // Access reactive todo list (same API, new architecture)
 *   const todos = this.todoService.todos();
 *   
 *   // Access computed statistics
 *   const stats = this.todoService.stats();
 *   
 *   // Add new todo (delegates to TodoStateService)
 *   this.todoService.addTodo({
 *     title: 'New Task',
 *     priority: 'medium'
 *   });
 *   
 *   // Set filter (delegates to TodoFilterService)
 *   this.todoService.setFilter('active');
 * }
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class TodoService {
  
  /** Injected specialized services for orchestration */
  private readonly stateService = inject(TodoStateService);
  private readonly filterService = inject(TodoFilterService);
  private readonly sortService = inject(TodoSortService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly userFeedbackService = inject(UserFeedbackService);
  private readonly validationService = inject(TodoValidationService);

  /** 
   * Readonly signal exposing the todo list for external consumption.
   * @description Delegates to TodoStateService for state management.
   */
  readonly todos = this.stateService.todos;

  /** 
   * Readonly signal exposing the current filter for external consumption.
   * @description Delegates to TodoFilterService for filter state management.
   */
  readonly currentFilter = this.filterService.currentFilter;

  /** 
   * Readonly signal exposing the current sort key for external consumption.
   * @description Delegates to TodoSortService for sort state management.
   */
  readonly sortKey = this.sortService.sortKey;

  /** 
   * Readonly signal exposing the current sort order for external consumption.
   * @description Delegates to TodoSortService for sort state management.
   */
  readonly sortOrder = this.sortService.sortOrder;

  /** 
   * Computed signal providing filtered todos based on current filter state.
   * @description Composes TodoStateService and TodoFilterService for reactive filtering.
   */
  readonly filteredTodos = this.filterService.getFilteredTodos(this.stateService.todos);

  /** 
   * Computed signal providing sorted and filtered todos.
   * @description Composes the complete reactive chain: State → Filter → Sort → UI.
   * This is the final composed signal that components should consume.
   */
  readonly sortedAndFilteredTodos = this.sortService.getSortedTodos(this.filteredTodos);

  /** 
   * Readonly signal exposing real-time statistics about todos.
   * @description Delegates to TodoStateService for statistics computation.
   */
  readonly stats = this.stateService.stats;

  /** Readonly signal exposing error messages for external consumption */
  readonly errorMessage = this.userFeedbackService.errorMessage;
  
  /** Readonly signal exposing success messages for external consumption */
  readonly successMessage = this.userFeedbackService.successMessage;
  
  /** Readonly signal exposing loading state for external consumption */
  readonly isLoading = this.userFeedbackService.isLoading;

  /**
   * Creates a new todo item and adds it to the collection.
   * @param request - The todo creation request containing title and optional metadata
   * @returns The newly created todo item with generated ID and timestamps
   * @description Delegates to TodoStateService for state management.
   */
  addTodo(request: CreateTodoRequest): Todo {
    return this.stateService.addTodo(request);
  }

  /**
   * Updates an existing todo item with new data.
   * @param id - The unique identifier of the todo to update
   * @param request - Partial update data containing the fields to modify
   * @returns The updated todo item or null if not found
   * @description Delegates to TodoStateService for state management.
   */
  updateTodo(id: string, request: UpdateTodoRequest): Todo | null {
    return this.stateService.updateTodo(id, request);
  }

  /**
   * Toggles the completion status of a todo item.
   * @param id - The unique identifier of the todo to toggle
   * @returns The updated todo item or null if not found
   * @description Delegates to TodoStateService for state management.
   */
  toggleTodo(id: string): Todo | null {
    return this.stateService.toggleTodo(id);
  }

  /**
   * Removes a todo item from the collection.
   * @param id - The unique identifier of the todo to delete
   * @returns True if the todo was found and deleted, false otherwise
   * @description Delegates to TodoStateService for state management.
   */
  deleteTodo(id: string): boolean {
    return this.stateService.deleteTodo(id);
  }

  /**
   * Retrieves a specific todo item by its ID.
   * @param id - The unique identifier of the todo to find
   * @returns The todo item if found, undefined otherwise
   * @description Delegates to TodoStateService for state management.
   */
  getTodoById(id: string): Todo | undefined {
    return this.stateService.getTodoById(id);
  }

  /**
   * Removes all completed todo items from the collection.
   * @description Useful for cleaning up finished tasks and maintaining a focused todo list.
   * Delegates to TodoStateService for state management.
   */
  clearCompleted(): void {
    this.stateService.clearCompleted();
  }

  /**
   * Sets the current filter for displaying todos.
   * @param filter - The filter type to apply ('all', 'active', 'completed')
   * @description Delegates to TodoFilterService for filter state management.
   */
  setFilter(filter: FilterType): void {
    this.filterService.setFilter(filter);
  }

  /**
   * Shows all todos regardless of completion status.
   * @description Convenience method for setting filter to 'all'.
   * Delegates to TodoFilterService for filter state management.
   */
  showAll(): void {
    this.filterService.showAll();
  }

  /**
   * Shows only active (incomplete) todos.
   * @description Convenience method for setting filter to 'active'.
   * Delegates to TodoFilterService for filter state management.
   */
  showActive(): void {
    this.filterService.showActive();
  }

  /**
   * Shows only completed todos.
   * @description Convenience method for setting filter to 'completed'.
   * Delegates to TodoFilterService for filter state management.
   */
  showCompleted(): void {
    this.filterService.showCompleted();
  }

  /**
   * Sets the current sort key for displaying todos.
   * @param sortKey - The sort criteria to apply ('date', 'priority', 'title')
   * @description Delegates to TodoSortService for sort state management.
   */
  setSortKey(sortKey: SortType): void {
    this.sortService.setSortKey(sortKey);
  }

  /**
   * Sets the current sort order for displaying todos.
   * @param sortOrder - The sort direction to apply ('asc', 'desc')
   * @description Delegates to TodoSortService for sort state management.
   */
  setSortOrder(sortOrder: SortOrder): void {
    this.sortService.setSortOrder(sortOrder);
  }

  /**
   * Toggles the current sort order between ascending and descending.
   * @description Delegates to TodoSortService for sort state management.
   */
  toggleSortOrder(): void {
    this.sortService.toggleSortOrder();
  }

  /**
   * Validates a todo creation request using the centralized validation service.
   * @description Delegates validation to TodoValidationService while maintaining
   * backward compatibility with existing API. This method now serves as a wrapper
   * around the comprehensive validation service.
   * @param request - The todo creation request to validate
   * @returns Validation result with success flag and optional error message
   */
  validateCreateRequest(request: CreateTodoRequest): { valid: boolean; error?: string } {
    const validationResult = this.validationService.validateCreateRequest(request);
    
    return {
      valid: validationResult.valid,
      error: validationResult.error
    };
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


}