/**
 * @fileoverview Interface for todo validation service managing business rule validation
 * @description Defines the contract for a service that provides comprehensive validation
 * of todo operations with structured error reporting and field-specific feedback.
 * This interface enables proper testing and separation of concerns by abstracting
 * validation logic from components and business operations.
 */

import { CreateTodoRequest, UpdateTodoRequest } from '../../models/todo.model';

/**
 * Validation error severity levels for enhanced error categorization.
 * @description Enables different UI treatments and user guidance based on error severity.
 */
export type ValidationSeverity = 'error' | 'warning' | 'info';

/**
 * Enhanced validation result with comprehensive error reporting.
 * @description Provides structured validation results with field-specific errors,
 * severity levels, and programmatic error codes for better error handling and UX.
 */
export interface ValidationResult {
  /** Whether the validation passed successfully */
  valid: boolean;

  /** Primary error message for general display */
  error?: string;

  /** Field-specific error messages keyed by field name */
  fieldErrors?: Record<string, string>;

  /** Programmatic error code for handling specific validation failures */
  code?: string;

  /** Severity level of the validation error */
  severity?: ValidationSeverity;

  /** Array of all validation errors with detailed information */
  errors?: ValidationError[];

  /** Warnings that don't prevent operation but should be shown to user */
  warnings?: ValidationWarning[];

  /** Additional context information for debugging or advanced error handling */
  context?: Record<string, unknown>;
}

/**
 * Detailed validation error with field-specific information.
 * @description Provides comprehensive information about specific validation failures
 * including field context, error codes, and severity levels.
 */
export interface ValidationError {
  /** Field name where the error occurred */
  field: string;

  /** Error message for user display */
  message: string;

  /** Programmatic error code */
  code: string;

  /** Severity level of the error */
  severity: ValidationSeverity;

  /** Current field value that caused the error */
  value?: unknown;

  /** Expected or valid values for the field */
  expectedValues?: unknown[];

  /** Additional context for the error */
  context?: Record<string, unknown>;
}

/**
 * Validation warning for non-critical issues.
 * @description Represents validation warnings that don't prevent operation
 * but should be communicated to the user for better UX.
 */
export interface ValidationWarning {
  /** Field name where the warning occurred */
  field: string;

  /** Warning message for user display */
  message: string;

  /** Warning code for programmatic handling */
  code: string;

  /** Suggested action to resolve the warning */
  suggestion?: string;
}

/**
 * Validation configuration for customizable validation behavior.
 * @description Allows customization of validation rules and behavior
 * for different contexts or user preferences.
 */
export interface ValidationConfig {
  /** Whether to perform strict validation (all rules) or lenient (required only) */
  strict?: boolean;

  /** Whether to stop on first error or collect all errors */
  stopOnFirstError?: boolean;

  /** Custom validation limits overriding defaults */
  customLimits?: {
    titleMaxLength?: number;
    descriptionMaxLength?: number;
    tagMaxLength?: number;
    tagMaxCount?: number;
  };

  /** Fields to skip during validation */
  skipFields?: string[];

  /** Whether to include warnings in the result */
  includeWarnings?: boolean;
}

/**
 * Interface for todo validation service providing comprehensive business rule validation.
 * @description Defines the contract for validating todo operations with structured error
 * reporting, field-specific feedback, and configurable validation behavior. Implementations
 * should centralize all business validation rules and provide detailed error information.
 * 
 * **Key Features:**
 * - Comprehensive validation with field-specific error reporting
 * - Configurable validation behavior for different contexts
 * - Structured error results with severity levels and codes
 * - Support for both synchronous and asynchronous validation
 * - Centralized business rule management
 * 
 * **Implementation Requirements:**
 * - Must validate all business rules consistently
 * - Should provide detailed error information for debugging
 * - Must support field-specific error reporting for form UX
 * - Should be configurable for different validation strictness levels
 * - Must handle edge cases and boundary conditions
 * 
 * @example
 * ```typescript
 * // Service usage example
 * class TodoComponent {
 *   constructor(private validator: ITodoValidationService) {}
 *   
 *   onSubmit(formData: CreateTodoRequest) {
 *     const result = this.validator.validateCreateRequest(formData);
 *     
 *     if (!result.valid) {
 *       // Display general error
 *       this.showError(result.error);
 *       
 *       // Display field-specific errors
 *       if (result.fieldErrors) {
 *         Object.keys(result.fieldErrors).forEach(field => {
 *           this.showFieldError(field, result.fieldErrors![field]);
 *         });
 *       }
 *       
 *       // Handle warnings
 *       if (result.warnings) {
 *         result.warnings.forEach(warning => {
 *           this.showWarning(warning.message);
 *         });
 *       }
 *       
 *       return;
 *     }
 *     
 *     // Proceed with todo creation
 *     this.createTodo(formData);
 *   }
 * }
 * ```
 */
export interface ITodoValidationService {
  /**
   * Validates a todo creation request with comprehensive error reporting.
   * @description Validates all aspects of a todo creation request including required fields,
   * business rules, and data constraints. Provides detailed field-specific error information.
   * @param request - The todo creation request to validate
   * @param config - Optional validation configuration to customize behavior
   * @returns Comprehensive validation result with detailed error information
   */
  validateCreateRequest(request: CreateTodoRequest, config?: ValidationConfig): ValidationResult;

  /**
   * Validates a todo update request with comprehensive error reporting.
   * @description Validates all aspects of a todo update request including field changes,
   * business rules, and data constraints. Handles partial updates appropriately.
   * @param request - The todo update request to validate
   * @param config - Optional validation configuration to customize behavior
   * @returns Comprehensive validation result with detailed error information
   */
  validateUpdateRequest(request: UpdateTodoRequest, config?: ValidationConfig): ValidationResult;

  /**
   * Validates a todo title with detailed error reporting.
   * @description Validates todo title according to business rules including length limits,
   * character restrictions, and required field validation.
   * @param title - The todo title to validate
   * @param config - Optional validation configuration to customize behavior
   * @returns Validation result with title-specific error information
   */
  validateTodoTitle(title: string, config?: ValidationConfig): ValidationResult;

  /**
   * Validates a todo description with detailed error reporting.
   * @description Validates todo description according to business rules including length limits
   * and content restrictions. Handles optional field validation appropriately.
   * @param description - The todo description to validate (optional)
   * @param config - Optional validation configuration to customize behavior
   * @returns Validation result with description-specific error information
   */
  validateTodoDescription(description?: string, config?: ValidationConfig): ValidationResult;

  /**
   * Validates todo priority with detailed error reporting.
   * @description Validates todo priority according to allowed values and business rules.
   * @param priority - The todo priority to validate
   * @param config - Optional validation configuration to customize behavior
   * @returns Validation result with priority-specific error information
   */
  validateTodoPriority(priority: string, config?: ValidationConfig): ValidationResult;

  /**
   * Validates todo due date with detailed error reporting.
   * @description Validates todo due date according to business rules including past dates,
   * format validation, and reasonable date ranges.
   * @param dueDate - The todo due date to validate (optional)
   * @param config - Optional validation configuration to customize behavior
   * @returns Validation result with due date-specific error information
   */
  validateTodoDueDate(dueDate?: Date, config?: ValidationConfig): ValidationResult;

  /**
   * Validates todo tags with detailed error reporting.
   * @description Validates todo tags according to business rules including tag count limits,
   * individual tag length limits, and character restrictions.
   * @param tags - The todo tags to validate (optional)
   * @param config - Optional validation configuration to customize behavior
   * @returns Validation result with tags-specific error information
   */
  validateTodoTags(tags?: string[], config?: ValidationConfig): ValidationResult;

  /**
   * Validates multiple fields simultaneously with batch error reporting.
   * @description Validates multiple todo fields at once and provides comprehensive
   * error reporting for all fields. Useful for form validation scenarios.
   * @param fields - Object containing fields to validate
   * @param config - Optional validation configuration to customize behavior
   * @returns Comprehensive validation result with all field errors
   */
  validateFields(fields: Record<string, unknown>, config?: ValidationConfig): ValidationResult;

  /**
   * Performs business rule validation for todo operations.
   * @description Validates complex business rules that span multiple fields or require
   * context-aware validation. Examples include priority-due date combinations.
   * @param request - The todo request to validate business rules against
   * @param config - Optional validation configuration to customize behavior
   * @returns Validation result with business rule-specific error information
   */
  validateBusinessRules(request: CreateTodoRequest | UpdateTodoRequest, config?: ValidationConfig): ValidationResult;

  /**
   * Gets validation limits and constraints for reference.
   * @description Provides current validation limits and constraints for use in
   * UI components, form validation, or documentation.
   * @returns Object containing all validation limits and constraints
   */
  getValidationLimits(): {
    title: { minLength: number; maxLength: number };
    description: { maxLength: number };
    tag: { maxLength: number; maxCount: number };
    priority: { allowedValues: string[] };
  };

  /**
   * Creates a custom validation configuration.
   * @description Helper method to create validation configurations with defaults
   * and custom overrides for specific validation scenarios.
   * @param overrides - Custom configuration overrides
   * @returns Complete validation configuration with defaults and overrides
   */
  createValidationConfig(overrides?: Partial<ValidationConfig>): ValidationConfig;
}