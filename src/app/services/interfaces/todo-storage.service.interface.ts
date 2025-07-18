/**
 * @fileoverview Interface for todo storage service managing persistent data operations
 * @description Defines the contract for a service that provides storage operations with
 * health monitoring, SSR compatibility, and error handling. This interface enables proper
 * testing and separation of concerns by abstracting storage functionality from business logic.
 */

import { Todo } from '../../models/todo.model';

/**
 * Storage health information for monitoring and diagnostics.
 * @description Provides insights into storage availability, usage, and performance
 * to enable better error handling and user experience.
 */
export interface StorageHealthInfo {
  /** Whether storage is available and functional */
  available: boolean;
  
  /** Amount of storage quota used in bytes (if available) */
  quotaUsed?: number;
  
  /** Total storage quota in bytes (if available) */
  quotaTotal?: number;
  
  /** Percentage of quota used (0-100) */
  quotaUsagePercentage?: number;
  
  /** Whether storage is approaching quota limits (>90% usage) */
  nearQuotaLimit?: boolean;
  
  /** Last successful operation timestamp */
  lastSuccessfulOperation?: Date;
  
  /** Number of consecutive failures */
  consecutiveFailures?: number;
}

/**
 * Storage operation result with detailed feedback.
 * @description Provides structured results for storage operations with
 * success status, error information, and performance metrics.
 */
export interface StorageOperationResult {
  /** Whether the operation was successful */
  success: boolean;
  
  /** Error message if operation failed */
  error?: string;
  
  /** Number of items processed */
  itemCount?: number;
  
  /** Operation duration in milliseconds */
  duration?: number;
  
  /** Whether data was corrupted and recovered */
  dataRecovered?: boolean;
}

/**
 * Interface for todo storage service providing persistent data operations.
 * @description Defines the contract for managing todo persistence with health monitoring,
 * SSR compatibility, and robust error handling. Implementations should provide graceful
 * degradation when storage is unavailable and comprehensive error reporting.
 * 
 * **Key Features:**
 * - SSR compatibility with environment detection
 * - Health monitoring with quota tracking
 * - Corruption detection and recovery
 * - Graceful error handling with detailed feedback
 * - Performance monitoring and metrics
 * 
 * **Implementation Requirements:**
 * - Must handle SSR environments gracefully (no window/localStorage)
 * - Should implement proper Date serialization/deserialization
 * - Must provide detailed error information for debugging
 * - Should track storage health metrics
 * - Must handle storage quota exceeded scenarios
 * 
 * @example
 * ```typescript
 * // Service usage example
 * class TodoService {
 *   constructor(private storage: ITodoStorageService) {}
 *   
 *   async saveTodos(todos: Todo[]) {
 *     if (!this.storage.isAvailable()) {
 *       console.warn('Storage not available, changes will be lost');
 *       return;
 *     }
 *     
 *     const result = await this.storage.saveTodos(todos);
 *     if (!result.success) {
 *       console.error('Failed to save todos:', result.error);
 *     }
 *   }
 *   
 *   checkStorageHealth() {
 *     const health = this.storage.getStorageHealth();
 *     if (health.nearQuotaLimit) {
 *       this.notifyUser('Storage space is running low');
 *     }
 *   }
 * }
 * ```
 */
export interface ITodoStorageService {
  /**
   * Loads todos from persistent storage.
   * @description Retrieves and deserializes todos from storage, handling Date objects
   * and corrupted data gracefully. Returns empty array if storage is unavailable or data is corrupt.
   * @returns Promise resolving to array of todos from storage or empty array if none found
   */
  loadTodos(): Promise<Todo[]>;

  /**
   * Saves todos to persistent storage.
   * @description Serializes and stores todos with proper Date handling and error recovery.
   * Provides detailed operation result including success status and error information.
   * @param todos - Array of todos to save to storage
   * @returns Promise resolving to operation result with success status and details
   */
  saveTodos(todos: Todo[]): Promise<StorageOperationResult>;

  /**
   * Clears all todos from persistent storage.
   * @description Removes all stored todo data and resets storage state.
   * Useful for data reset or cleanup operations.
   * @returns Promise resolving to operation result with success status
   */
  clearStorage(): Promise<StorageOperationResult>;

  /**
   * Checks if storage is available in the current environment.
   * @description Determines if storage operations are supported, considering SSR environments,
   * browser compatibility, and storage availability. Critical for graceful degradation.
   * @returns True if storage is available and functional, false otherwise
   */
  isAvailable(): boolean;

  /**
   * Gets comprehensive storage health information.
   * @description Provides detailed insights into storage availability, usage, performance,
   * and potential issues. Useful for monitoring and user feedback.
   * @returns Storage health information with availability, quota usage, and performance metrics
   */
  getStorageHealth(): StorageHealthInfo;

  /**
   * Checks if storage data is healthy and not corrupted.
   * @description Validates stored data integrity and detects corruption issues.
   * Enables proactive error handling and data recovery.
   * @returns True if storage data is healthy, false if corrupted or issues detected
   */
  isStorageHealthy(): boolean;

  /**
   * Attempts to recover from storage corruption.
   * @description Tries to repair corrupted data or reset storage to a clean state.
   * Should be called when corruption is detected to restore functionality.
   * @returns Promise resolving to operation result indicating recovery success
   */
  recoverFromCorruption(): Promise<StorageOperationResult>;

  /**
   * Exports todos data for backup or migration.
   * @description Provides a clean export of todo data in a portable format.
   * Useful for data backup, migration between storage implementations, or debugging.
   * @returns Promise resolving to serialized todo data suitable for backup
   */
  exportData(): Promise<string>;

  /**
   * Imports todos data from backup or migration.
   * @description Restores todo data from a previously exported format with validation.
   * Merges with existing data or replaces it based on the merge parameter.
   * @param data - Serialized todo data to import
   * @param merge - Whether to merge with existing data (true) or replace it (false)
   * @returns Promise resolving to operation result with import details
   */
  importData(data: string, merge?: boolean): Promise<StorageOperationResult>;

  /**
   * Gets storage usage statistics.
   * @description Provides detailed statistics about storage usage, performance,
   * and operation history for monitoring and optimization.
   * @returns Object containing storage statistics and performance metrics
   */
  getStorageStats(): {
    totalOperations: number;
    successfulOperations: number;
    failedOperations: number;
    averageOperationTime: number;
    lastOperationTime: Date;
  };
}