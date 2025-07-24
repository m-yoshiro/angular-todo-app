/**
 * @fileoverview Filter state management service for todo items using Angular 20 signals
 * @description Manages the current filter state and provides reactive filtering logic
 * for todo items. Follows Single Responsibility Principle by focusing solely on 
 * filter state management and filtering operations.
 */

import { Injectable, signal, computed, Signal } from '@angular/core';
import { Todo, FilterType } from '../models/todo.model';

/**
 * Service responsible for managing filter state and providing reactive filtering logic.
 * @description Implements signal-based filter state management with reactive filtering
 * computations. Provides both stateful filter management and stateless filtering
 * operations that can be composed with other services.
 * 
 * **Single Responsibility**: This service focuses exclusively on filter state
 * and filtering logic, without handling UI concerns or data persistence.
 * 
 * **Reactive Filtering**: Uses computed signals to provide reactive filtering
 * that automatically updates when input todos or filter state changes.
 * 
 * @example
 * ```typescript
 * constructor(private filterService: TodoFilterService) {
 *   // Set filter state
 *   this.filterService.setFilter('active');
 *   
 *   // Get current filter
 *   const currentFilter = this.filterService.currentFilter();
 *   
 *   // Create reactive filtered signal
 *   const filtered = this.filterService.getFilteredTodos(this.todosSignal);
 * }
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class TodoFilterService {
  
  /** Private signal for the current filter state */
  private _currentFilter = signal<FilterType>('all');
  
  /** Readonly signal exposing the current filter for external consumption */
  readonly currentFilter = this._currentFilter.asReadonly();

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
   * Creates a reactive computed signal that filters todos based on current filter state.
   * @param todosSignal - Input signal containing the array of todos to filter
   * @returns A computed signal that provides filtered todos based on current filter state
   * @description This method creates a new computed signal each time it's called.
   * The computed signal automatically recalculates when either the input todos
   * or the filter state changes, providing reactive filtering behavior.
   */
  getFilteredTodos(todosSignal: Signal<Todo[]>): Signal<Todo[]> {
    return computed<Todo[]>(() => {
      const todos = todosSignal();
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
  }
}