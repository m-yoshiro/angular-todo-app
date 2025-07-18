/**
 * @fileoverview Shared validation types and interfaces
 * @description Common validation types used across all validation interfaces.
 */

/**
 * Validation error severity levels.
 */
export type ValidationSeverity = 'error' | 'warning' | 'info';

/**
 * Enhanced validation result with comprehensive error reporting.
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

  /** Additional context information for debugging */
  context?: Record<string, unknown>;
}

/**
 * Detailed validation error with field-specific information.
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
 * Validation limits and constraints.
 */
export interface ValidationLimits {
  title: { minLength: number; maxLength: number };
  description: { maxLength: number };
  tag: { maxLength: number; maxCount: number };
  priority: { allowedValues: string[] };
}