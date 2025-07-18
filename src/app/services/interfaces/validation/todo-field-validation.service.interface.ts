/**
 * @fileoverview Individual field validation interface for todo fields
 * @description Defines validation contracts for specific todo field validation.
 */

import { ValidationResult, ValidationConfig } from './validation-types';

/**
 * Interface for individual todo field validation.
 * @description Handles validation of specific todo fields like title, description, etc.
 * Each method focuses on a single field's validation rules.
 */
export interface ITodoFieldValidation {
  /**
   * Validates a todo title.
   * @param title - The todo title to validate
   * @param config - Optional validation configuration
   * @returns Validation result with title-specific errors
   */
  validateTodoTitle(title: string, config?: ValidationConfig): ValidationResult;

  /**
   * Validates a todo description.
   * @param description - The todo description to validate (optional)
   * @param config - Optional validation configuration
   * @returns Validation result with description-specific errors
   */
  validateTodoDescription(description?: string, config?: ValidationConfig): ValidationResult;

  /**
   * Validates a todo priority.
   * @param priority - The todo priority to validate
   * @param config - Optional validation configuration
   * @returns Validation result with priority-specific errors
   */
  validateTodoPriority(priority: string, config?: ValidationConfig): ValidationResult;

  /**
   * Validates a todo due date.
   * @param dueDate - The todo due date to validate (optional)
   * @param config - Optional validation configuration
   * @returns Validation result with due date-specific errors
   */
  validateTodoDueDate(dueDate?: Date, config?: ValidationConfig): ValidationResult;

  /**
   * Validates todo tags.
   * @param tags - The todo tags to validate (optional)
   * @param config - Optional validation configuration
   * @returns Validation result with tags-specific errors
   */
  validateTodoTags(tags?: string[], config?: ValidationConfig): ValidationResult;

  /**
   * Validates multiple fields simultaneously.
   * @param fields - Object containing fields to validate
   * @param config - Optional validation configuration
   * @returns Comprehensive validation result with all field errors
   */
  validateFields(fields: Record<string, unknown>, config?: ValidationConfig): ValidationResult;

  /**
   * Validates a single field by name and value.
   * @param fieldName - Name of the field to validate
   * @param value - Value to validate
   * @param config - Optional validation configuration
   * @returns Validation result for the specific field
   */
  validateField(fieldName: string, value: unknown, config?: ValidationConfig): ValidationResult;
}