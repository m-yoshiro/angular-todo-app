/**
 * @fileoverview Barrel export file for validation interfaces
 * @description Provides clean exports for all validation-related interfaces and types.
 */

// Validation Types
export type {
  ValidationResult,
  ValidationError,
  ValidationWarning,
  ValidationConfig,
  ValidationSeverity,
  ValidationLimits
} from './validation-types';

// Basic Validation Interface
export type {
  ITodoBasicValidation
} from './todo-basic-validation.service.interface';

// Field Validation Interface
export type {
  ITodoFieldValidation
} from './todo-field-validation.service.interface';

// Business Rules Interface
export type {
  ITodoBusinessRules
} from './todo-business-rules.service.interface';

// Validation Utilities Interface
export type {
  ITodoValidationUtilities
} from './todo-validation-utilities.service.interface';

// Import the individual interfaces
import type { ITodoBasicValidation } from './todo-basic-validation.service.interface';
import type { ITodoFieldValidation } from './todo-field-validation.service.interface';
import type { ITodoBusinessRules } from './todo-business-rules.service.interface';
import type { ITodoValidationUtilities } from './todo-validation-utilities.service.interface';

/**
 * Combined validation service interface for backward compatibility.
 * @description Provides a unified interface that combines all validation concerns.
 * Services can implement individual interfaces or this combined interface.
 */
export interface ITodoValidationService extends 
  ITodoBasicValidation,
  ITodoFieldValidation,
  ITodoBusinessRules,
  ITodoValidationUtilities {
}