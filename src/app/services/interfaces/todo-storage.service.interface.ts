/**
 * @fileoverview Simplified interface for todo storage service managing persistent data operations
 * @description Defines a synchronous contract for core storage operations with SSR compatibility
 * and error handling. This simplified interface maintains behavioral compatibility with existing
 * TodoService implementation while enabling proper testing and separation of concerns.
 * 
 * **Key Design Principles:**
 * - Synchronous API to maintain behavioral compatibility
 * - Interface Segregation Principle (ISP) - focused on core storage responsibility
 * - SSR compatibility with graceful degradation
 * - Simple error handling with boolean health status
 * 
 * **Future Enhancement:**
 * Advanced features (async operations, detailed health monitoring, corruption recovery)
 * will be added in a future PR to avoid breaking changes during this refactoring phase.
 */

import { Todo } from '../../models/todo.model';

/**
 * Basic storage health information for monitoring.
 * @description Provides essential health status information for storage operations.
 * Simplified from the original complex health interface to focus on core needs.
 */
export interface StorageHealthInfo {
  /** Whether storage is available and functional */
  available: boolean;
  
  /** Whether any storage errors have occurred */
  hasError: boolean;
}

/**
 * Interface for todo storage service providing core persistent data operations.
 * @description Defines the contract for managing todo persistence with SSR compatibility
 * and basic error handling. This simplified interface maintains synchronous operations
 * to preserve existing TodoService behavior while enabling dependency injection and testing.
 * 
 * **Key Features:**
 * - Synchronous operations for behavioral compatibility
 * - SSR compatibility with environment detection
 * - Graceful error handling with console warnings
 * - Proper Date serialization/deserialization
 * - Basic health monitoring
 * 
 * **Implementation Requirements:**
 * - Must handle SSR environments gracefully (no window/localStorage)
 * - Must implement proper Date serialization/deserialization
 * - Must provide graceful error handling with console.warn
 * - Must maintain exact same behavior as current TodoService localStorage methods
 * 
 * @example
 * ```typescript
 * // Service usage example (maintains existing TodoService patterns)
 * class TodoService {
 *   constructor(private storageService = inject(TodoStorageService)) {
 *     // Maintains exact same synchronous initialization
 *     this._todos = signal<Todo[]>(this.storageService.loadTodos());
 *   }
 *   
 *   private saveTodosToStorage(): void {
 *     // Maintains exact same synchronous persistence
 *     this.storageService.saveTodos(this._todos());
 *   }
 * }
 * ```
 */
export interface ITodoStorageService {
  /**
   * Loads todos from persistent storage synchronously.
   * @description Retrieves and deserializes todos from localStorage, handling Date objects
   * gracefully. Returns empty array if storage is unavailable or data is corrupt.
   * Maintains exact same behavior as current TodoService.loadTodosFromStorage().
   * @returns Array of todos from storage or empty array if none found
   */
  loadTodos(): Todo[];

  /**
   * Saves todos to persistent storage synchronously.
   * @description Serializes and stores todos with proper Date handling.
   * Maintains exact same behavior as current TodoService.saveTodosToStorage().
   * @param todos - Array of todos to save to storage
   */
  saveTodos(todos: Todo[]): void;

  /**
   * Clears all todos from persistent storage synchronously.
   * @description Removes all stored todo data.
   * Useful for data reset or cleanup operations.
   */
  clearStorage(): void;

  /**
   * Checks if storage is available in the current environment.
   * @description Determines if storage operations are supported, considering SSR environments,
   * browser compatibility, and localStorage availability. Critical for graceful degradation.
   * Maintains exact same logic as current TodoService storage methods.
   * @returns True if storage is available and functional, false otherwise
   */
  isAvailable(): boolean;

  /**
   * Gets basic storage health information.
   * @description Provides essential health status for storage operations.
   * Simplified interface focusing on availability and error state.
   * @returns Storage health information with availability and error status
   */
  getStorageHealth(): StorageHealthInfo;
}