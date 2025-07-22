import { ValidationErrors } from '@angular/forms';
import { ValidationLimits } from '../services/interfaces/validation/validation-types';

/**
 * Default validation limits for Todo fields
 * Implements ValidationLimits interface from validation types
 */
export const DEFAULT_VALIDATION_LIMITS: ValidationLimits = {
  title: {
    minLength: 1,
    maxLength: 200
  },
  description: {
    maxLength: 1000
  },
  tag: {
    maxLength: 50,
    maxCount: 10
  },
  priority: {
    allowedValues: ['low', 'medium', 'high']
  }
};

/**
 * Legacy validation limits for backward compatibility
 */
export const VALIDATION_LIMITS = {
  TITLE: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 200
  },
  DESCRIPTION: {
    MAX_LENGTH: 1000
  },
  TAG: {
    MAX_LENGTH: 50,
    MAX_COUNT: 10
  },
  PRIORITY: {
    ALLOWED_VALUES: ['low', 'medium', 'high'] as const,
    DEFAULT: 'medium' as const
  }
} as const;

/**
 * Validation error messages for Todo fields
 */
export const VALIDATION_MESSAGES = {
  TITLE: {
    REQUIRED: 'Title is required',
    MAX_LENGTH: 'Title cannot exceed 200 characters'
  },
  DESCRIPTION: {
    MAX_LENGTH: 'Description cannot exceed 1000 characters'
  },
  TAG: {
    EMPTY: 'Tag cannot be empty',
    MAX_LENGTH: 'Tag cannot exceed 50 characters',
    MAX_COUNT: 'Maximum 10 tags allowed',
    DUPLICATE: 'Tag already exists'
  },
  REQUEST: {
    REQUIRED: 'Request is required'
  },
  DATE: {
    PAST_DATE: 'Due date cannot be in the past'
  },
  PRIORITY: {
    INVALID: 'Priority must be one of: low, medium, high'
  }
} as const;

/**
 * Custom validation errors for Todo-specific validations
 * Extends Angular's ValidationErrors for type safety
 */
export interface TodoValidationErrors extends ValidationErrors {
  titleRequired?: boolean;
  titleMaxLength?: { requiredLength: number; actualLength: number };
  descriptionMaxLength?: { requiredLength: number; actualLength: number };
  tagEmpty?: boolean;
  tagMaxLength?: { requiredLength: number; actualLength: number };
  tagDuplicate?: boolean;
  tagMaxCount?: { requiredCount: number; actualCount: number };
  pastDate?: boolean;
  invalidDate?: boolean;
  invalidPriority?: { allowedValues: readonly string[]; actualValue: string };
}

/**
 * Type for validation result from service methods
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}