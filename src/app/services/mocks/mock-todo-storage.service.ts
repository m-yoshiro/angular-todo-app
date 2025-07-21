/**
 * @fileoverview Mock implementation of ITodoStorageService for testing purposes
 * @description Provides a controllable mock implementation for TodoStorageService
 * that enables isolated testing of components and services that depend on storage.
 * Includes test utilities for simulating various storage scenarios and error conditions.
 */

import { ITodoStorageService, StorageHealthInfo } from '../interfaces/todo-storage.service.interface';
import { Todo } from '../../models/todo.model';

/**
 * Mock implementation of ITodoStorageService for testing.
 * @description Provides in-memory storage simulation with controllable behavior
 * for testing different storage scenarios including error conditions and SSR compatibility.
 * 
 * **Key Features:**
 * - In-memory data storage for isolated testing
 * - Controllable error simulation
 * - Availability simulation for SSR testing
 * - Test utility methods for setup and verification
 * - Maintains same interface as real storage service
 */
export class MockTodoStorageService implements ITodoStorageService {
  /** Internal mock data storage */
  private mockData: Todo[] = [];
  
  /** Flag to simulate storage errors */
  private mockError = false;
  
  /** Flag to simulate storage unavailability */
  private mockUnavailable = false;
  
  /** Track error state for health monitoring */
  private hasError = false;

  /**
   * Loads todos from mock storage synchronously.
   * @description Returns mock data or simulates error/unavailability based on test configuration.
   * @returns Array of mock todos or empty array if unavailable/error
   */
  loadTodos(): Todo[] {
    if (this.mockUnavailable) {
      return [];
    }
    
    if (this.mockError) {
      this.hasError = true;
      throw new Error('Mock storage error: Failed to load todos');
    }
    
    this.hasError = false;
    // Return deep copy to prevent test interference
    return this.mockData.map(todo => ({
      ...todo,
      createdAt: new Date(todo.createdAt),
      updatedAt: new Date(todo.updatedAt),
      dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined
    }));
  }

  /**
   * Saves todos to mock storage synchronously.
   * @description Stores mock data or simulates error based on test configuration.
   * @param todos - Array of todos to save to mock storage
   */
  saveTodos(todos: Todo[]): void {
    if (this.mockUnavailable) {
      return;
    }
    
    if (this.mockError) {
      this.hasError = true;
      throw new Error('Mock storage error: Failed to save todos');
    }
    
    this.hasError = false;
    // Store deep copy to prevent test interference
    this.mockData = todos.map(todo => ({ ...todo }));
  }

  /**
   * Clears all todos from mock storage synchronously.
   * @description Removes all mock data or simulates error based on test configuration.
   */
  clearStorage(): void {
    if (this.mockUnavailable) {
      return;
    }
    
    if (this.mockError) {
      this.hasError = true;
      throw new Error('Mock storage error: Failed to clear storage');
    }
    
    this.hasError = false;
    this.mockData = [];
  }

  /**
   * Checks if mock storage is available.
   * @description Returns availability status based on test configuration.
   * @returns True if mock storage is available, false if simulating unavailability
   */
  isAvailable(): boolean {
    return !this.mockUnavailable;
  }

  /**
   * Gets mock storage health information.
   * @description Returns health status based on test configuration and error state.
   * @returns Mock storage health information
   */
  getStorageHealth(): StorageHealthInfo {
    return {
      available: this.isAvailable(),
      hasError: this.hasError
    };
  }

  // Test Utility Methods

  /**
   * Sets mock error state for testing error scenarios.
   * @description Configures mock to throw errors on storage operations.
   * @param hasError - Whether storage operations should throw errors
   */
  setMockError(hasError: boolean): void {
    this.mockError = hasError;
    if (!hasError) {
      this.hasError = false;
    }
  }

  /**
   * Sets mock availability state for testing SSR scenarios.
   * @description Configures mock to simulate storage unavailability.
   * @param available - Whether storage should be available
   */
  setMockAvailability(available: boolean): void {
    this.mockUnavailable = !available;
  }

  /**
   * Sets initial mock data for testing.
   * @description Pre-populates mock storage with test data.
   * @param todos - Array of todos to use as initial mock data
   */
  setMockData(todos: Todo[]): void {
    this.mockData = todos.map(todo => ({ ...todo }));
  }

  /**
   * Gets current mock data for test verification.
   * @description Returns current mock storage state for assertions.
   * @returns Current array of mock todos
   */
  getMockData(): Todo[] {
    return this.mockData.map(todo => ({ ...todo }));
  }

  /**
   * Resets mock service to clean state for test isolation.
   * @description Clears all mock data and resets all flags to default state.
   */
  reset(): void {
    this.mockData = [];
    this.mockError = false;
    this.mockUnavailable = false;
    this.hasError = false;
  }

  /**
   * Gets current mock error state for test verification.
   * @description Returns whether mock is currently configured to throw errors.
   * @returns True if mock will throw errors, false otherwise
   */
  isMockErrorEnabled(): boolean {
    return this.mockError;
  }

  /**
   * Gets current mock availability state for test verification.
   * @description Returns whether mock is currently configured as available.
   * @returns True if mock is available, false if simulating unavailability
   */
  isMockAvailable(): boolean {
    return !this.mockUnavailable;
  }
}