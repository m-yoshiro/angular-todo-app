/**
 * @fileoverview Sort state management service for todo items using Angular 20 signals
 * @description Manages the current sort state and provides reactive sorting logic
 * for todo items. Follows Single Responsibility Principle by focusing solely on 
 * sort state management and sorting operations.
 */

import { Injectable, signal, computed, Signal } from '@angular/core';
import { Todo, SortType, SortOrder, PRIORITY_VALUES } from '../models/todo.model';

/**
 * Service responsible for managing sort state and providing reactive sorting logic.
 * @description Implements signal-based sort state management with reactive sorting
 * computations. Provides both stateful sort management and stateless sorting
 * operations that can be composed with other services.
 * 
 * **Single Responsibility**: This service focuses exclusively on sort state
 * and sorting logic, without handling UI concerns or data persistence.
 * 
 * **Reactive Sorting**: Uses computed signals to provide reactive sorting
 * that automatically updates when input todos or sort state changes.
 * 
 * @example
 * ```typescript
 * constructor(private sortService: TodoSortService) {
 *   // Set sort criteria
 *   this.sortService.setSortKey('priority');
 *   this.sortService.setSortOrder('desc');
 *   
 *   // Get current sort state
 *   const sortKey = this.sortService.sortKey();
 *   const sortOrder = this.sortService.sortOrder();
 *   
 *   // Create reactive sorted signal
 *   const sorted = this.sortService.getSortedTodos(this.todosSignal);
 * }
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class TodoSortService {
  
  /** Private signal for the current sort key */
  private _sortKey = signal<SortType>('date');
  
  /** Private signal for the current sort order */
  private _sortOrder = signal<SortOrder>('desc');
  
  /** Readonly signal exposing the current sort key for external consumption */
  readonly sortKey = this._sortKey.asReadonly();
  
  /** Readonly signal exposing the current sort order for external consumption */
  readonly sortOrder = this._sortOrder.asReadonly();

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
   * Creates a reactive computed signal that sorts todos based on current sort criteria.
   * @param todosSignal - Input signal containing the array of todos to sort
   * @returns A computed signal that provides sorted todos based on current sort state
   * @description This method creates a new computed signal each time it's called.
   * The computed signal automatically recalculates when either the input todos
   * or the sort criteria changes, providing reactive sorting behavior.
   */
  getSortedTodos(todosSignal: Signal<Todo[]>): Signal<Todo[]> {
    return computed<Todo[]>(() => {
      const todos = todosSignal();
      const sortKey = this._sortKey();
      const sortOrder = this._sortOrder();
      
      return this.sortTodos([...todos], sortKey, sortOrder);
    });
  }

  /**
   * Sorts an array of todos based on the specified criteria and order.
   * @param todos - Array of todos to sort
   * @param sortKey - The sorting criteria
   * @param sortOrder - The sorting direction
   * @returns New sorted array of todos
   * @private
   */
  private sortTodos(todos: Todo[], sortKey: SortType, sortOrder: SortOrder): Todo[] {
    return todos.sort((a, b) => {
      let comparison = 0;
      
      switch (sortKey) {
        case 'date':
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
        case 'priority':
          comparison = PRIORITY_VALUES[a.priority] - PRIORITY_VALUES[b.priority];
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        default:
          // Default to date sorting for invalid sort keys
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }
}