/**
 * @fileoverview Basic todo validation interface for core CRUD operations
 * @description Defines validation contracts for create and update todo operations.
 */

import { CreateTodoRequest, UpdateTodoRequest } from '../../../models/todo.model';
import { ValidationResult, ValidationConfig } from './validation-types';

/**
 * Interface for basic todo validation operations.
 * @description Handles core CRUD validation for todo creation and updates.
 * Focus on essential validation operations without complex business rules.
 */
export interface ITodoBasicValidation {
  /**
   * Validates a todo creation request.
   * @param request - The todo creation request to validate
   * @param config - Optional validation configuration
   * @returns Comprehensive validation result
   */
  validateCreateRequest(request: CreateTodoRequest, config?: ValidationConfig): ValidationResult;

  /**
   * Validates a todo update request.
   * @param request - The todo update request to validate
   * @param config - Optional validation configuration
   * @returns Comprehensive validation result
   */
  validateUpdateRequest(request: UpdateTodoRequest, config?: ValidationConfig): ValidationResult;

  /**
   * Creates a validation configuration with defaults and overrides.
   * @param overrides - Custom configuration overrides
   * @returns Complete validation configuration
   */
  createValidationConfig(overrides?: Partial<ValidationConfig>): ValidationConfig;

  /**
   * Validates multiple requests in batch.
   * @param requests - Array of creation requests to validate
   * @param config - Optional validation configuration
   * @returns Array of validation results
   */
  validateBatchCreateRequests(requests: CreateTodoRequest[], config?: ValidationConfig): ValidationResult[];

  /**
   * Checks if a request passes basic validation quickly.
   * @param request - The request to check
   * @returns True if valid, false otherwise
   */
  isValidRequest(request: CreateTodoRequest | UpdateTodoRequest): boolean;
}