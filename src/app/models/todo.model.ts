/**
 * @fileoverview Core data models and interfaces for the Angular 20 Todo application.
 * @description This module defines all TypeScript interfaces used throughout the application
 * for todo items, API requests, filters, and statistics. These models ensure type safety
 * and provide clear data contracts between components and services.
 */

/**
 * Represents a complete todo item with all its properties.
 * @description The main todo entity containing all information about a task including
 * metadata, priority, due dates, and organizational tags.
 * @example
 * ```typescript
 * const todo: Todo = {
 *   id: '123',
 *   title: 'Complete project',
 *   description: 'Finish the Angular todo app',
 *   completed: false,
 *   createdAt: new Date(),
 *   updatedAt: new Date(),
 *   priority: 'high',
 *   dueDate: new Date('2024-12-31'),
 *   tags: ['work', 'urgent']
 * };
 * ```
 */
export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  tags?: string[];
}

/**
 * Request payload for creating a new todo item.
 * @description Used when submitting data to create a new todo. Only essential
 * fields are required, with optional metadata that can be added during creation.
 */
export interface CreateTodoRequest {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: Date;
  tags?: string[];
}

/**
 * Request payload for updating an existing todo item.
 * @description Partial update interface allowing modification of any todo property.
 * All fields are optional to support incremental updates.
 */
export interface UpdateTodoRequest {
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: Date;
  tags?: string[];
}

/**
 * Filter criteria for searching and filtering todo items.
 * @description Supports multiple filter combinations including completion status,
 * priority levels, text search, tags, and date ranges.
 */
export interface TodoFilter {
  completed?: boolean;
  priority?: 'low' | 'medium' | 'high';
  search?: string;
  tags?: string[];
  dueDateFrom?: Date;
  dueDateTo?: Date;
}

/**
 * Simple filter types for displaying todos by completion status.
 * @description Used with signal-based filtering to show all todos, only active (incomplete),
 * or only completed todos. Simpler than the complex TodoFilter interface for basic filtering.
 */
export type FilterType = 'all' | 'active' | 'completed';

/**
 * Statistical summary of todo items across various dimensions.
 * @description Computed statistics providing insights into todo completion rates,
 * priority distribution, and overdue items for dashboard and reporting purposes.
 */
export interface TodoStatistics {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  byPriority: {
    low: number;
    medium: number;
    high: number;
  };
}

/**
 * Available sorting criteria for todo items.
 * @description Defines the different properties by which todos can be sorted.
 */
export type SortType = 'date' | 'priority' | 'title';

/**
 * Sort order direction.
 * @description Defines whether sorting should be ascending or descending.
 */
export type SortOrder = 'asc' | 'desc';

/**
 * Complete sorting configuration.
 * @description Combines sort criteria and direction for comprehensive sorting control.
 */
export interface SortConfig {
  key: SortType;
  order: SortOrder;
}

/**
 * Result of validation operations.
 * @description Contains validation status and any error messages for failed validations.
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Result of service operations.
 * @description Contains operation status and result data or error information.
 */
export interface ServiceResult<T = any> {
  success: boolean;
  data?: T;
  errors?: string[];
}
