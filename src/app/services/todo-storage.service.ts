import { Injectable } from '@angular/core';
import { ITodoStorageService, StorageHealthInfo } from './interfaces/todo-storage.service.interface';
import { Todo } from '../models/todo.model';

/**
 * TodoStorageService provides synchronous localStorage operations for todo persistence.
 * @description Implements ITodoStorageService interface with exact behavioral compatibility
 * to existing TodoService localStorage methods. Handles SSR compatibility, Date serialization,
 * and graceful error handling with console warnings.
 * 
 * **Key Features:**
 * - Synchronous API maintaining behavioral compatibility
 * - SSR compatibility with graceful degradation
 * - Proper Date serialization/deserialization
 * - Error tracking and health monitoring
 * - Exact same error handling patterns as original TodoService
 */
@Injectable({ providedIn: 'root' })
export class TodoStorageService implements ITodoStorageService {
  /** Storage key for localStorage persistence (matches TodoService) */
  private readonly STORAGE_KEY = 'todo-app-todos';
  
  /** Internal error state for health monitoring */
  private hasError = false;

  /**
   * Loads todos from localStorage synchronously.
   * @description Maintains exact same behavior as TodoService.loadTodosFromStorage().
   * Handles Date deserialization and graceful error handling.
   * @returns Array of todos from storage or empty array if none found
   */
  loadTodos(): Todo[] {
    try {
      this.hasError = false;
      
      // Check if we're in a browser environment (SSR compatibility)
      if (!this.isAvailable()) {
        return [];
      }

      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const todos = JSON.parse(stored) as Todo[];
      
      // Convert date strings back to Date objects (maintains exact same logic)
      return todos.map(todo => ({
        ...todo,
        createdAt: new Date(todo.createdAt),
        updatedAt: new Date(todo.updatedAt),
        dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined
      }));
    } catch (error) {
      this.hasError = true;
      console.warn('Failed to load todos from localStorage:', error);
      return [];
    }
  }

  /**
   * Saves todos to localStorage synchronously.
   * @description Maintains exact same behavior as TodoService.saveTodosToStorage().
   * @param todos - Array of todos to save to storage
   */
  saveTodos(todos: Todo[]): void {
    try {
      this.hasError = false;
      
      // Check if we're in a browser environment (SSR compatibility)
      if (!this.isAvailable()) {
        return;
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(todos));
    } catch (error) {
      this.hasError = true;
      console.warn('Failed to save todos to localStorage:', error);
    }
  }

  /**
   * Clears all todos from localStorage synchronously.
   * @description Removes all stored todo data.
   */
  clearStorage(): void {
    try {
      this.hasError = false;
      
      // Check if we're in a browser environment (SSR compatibility)
      if (!this.isAvailable()) {
        return;
      }

      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      this.hasError = true;
      console.warn('Failed to clear todos from localStorage:', error);
    }
  }

  /**
   * Checks if storage is available in the current environment.
   * @description Maintains exact same logic as TodoService storage methods.
   * @returns True if storage is available and functional, false otherwise
   */
  isAvailable(): boolean {
    return typeof window !== 'undefined' && !!window.localStorage;
  }

  /**
   * Gets basic storage health information.
   * @description Provides essential health status for storage operations.
   * @returns Storage health information with availability and error status
   */
  getStorageHealth(): StorageHealthInfo {
    return {
      available: this.isAvailable(),
      hasError: this.hasError
    };
  }
}