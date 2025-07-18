/**
 * @fileoverview Business rules validation interface for complex todo validation
 * @description Defines validation contracts for complex business logic and rules.
 */

import { CreateTodoRequest, UpdateTodoRequest } from '../../../models/todo.model';
import { ValidationResult, ValidationConfig } from './validation-types';

/**
 * Interface for todo business rules validation.
 * @description Handles complex business logic validation that spans multiple fields
 * or requires context-aware validation rules.
 */
export interface ITodoBusinessRules {
  /**
   * Validates complex business rules for todo operations.
   * @param request - The todo request to validate business rules against
   * @param config - Optional validation configuration
   * @returns Validation result with business rule-specific errors
   */
  validateBusinessRules(request: CreateTodoRequest | UpdateTodoRequest, config?: ValidationConfig): ValidationResult;

  /**
   * Validates due date business rules in relation to priority.
   * @param dueDate - The due date to validate (optional)
   * @param priority - The priority level for context
   * @param config - Optional validation configuration
   * @returns Validation result for due date business rules
   */
  validateDueDateBusinessRules(dueDate?: Date, priority?: string, config?: ValidationConfig): ValidationResult;

  /**
   * Validates tag business rules including combinations and restrictions.
   * @param tags - The tags to validate (optional)
   * @param config - Optional validation configuration
   * @returns Validation result for tag business rules
   */
  validateTagBusinessRules(tags?: string[], config?: ValidationConfig): ValidationResult;

  /**
   * Validates priority business rules in context of other fields.
   * @param priority - The priority to validate
   * @param dueDate - Optional due date for context
   * @param tags - Optional tags for context
   * @param config - Optional validation configuration
   * @returns Validation result for priority business rules
   */
  validatePriorityBusinessRules(priority: string, dueDate?: Date, tags?: string[], config?: ValidationConfig): ValidationResult;

  /**
   * Validates cross-field dependencies and relationships.
   * @param request - The complete request to validate
   * @param config - Optional validation configuration
   * @returns Validation result for cross-field rules
   */
  validateCrossFieldRules(request: CreateTodoRequest | UpdateTodoRequest, config?: ValidationConfig): ValidationResult;

  /**
   * Validates business rules for batch operations.
   * @param requests - Array of requests to validate
   * @param config - Optional validation configuration
   * @returns Array of validation results for business rules
   */
  validateBatchBusinessRules(requests: (CreateTodoRequest | UpdateTodoRequest)[], config?: ValidationConfig): ValidationResult[];
}