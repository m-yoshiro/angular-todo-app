/**
 * @fileoverview Signal-based form utilities for Angular 20+ applications
 * @description Experimental signal-based form implementation providing reactive form
 * functionality using Angular 20's signal primitives instead of FormBuilder.
 * Designed for performance comparison and architectural exploration.
 */

import { signal, computed, Signal, WritableSignal } from '@angular/core';

/**
 * Validation function type that can be synchronous or asynchronous
 */
export type ValidatorFn<T = any> = (value: T) => ValidationError | null;

/**
 * Validation error object with error key and optional context
 */
export interface ValidationError {
  [key: string]: any;
}

/**
 * Configuration options for creating a field signal
 */
export interface FieldConfig<T> {
  /** Initial value for the field */
  initialValue: T;
  /** Array of validation functions to apply */
  validators?: ValidatorFn<T>[];
  /** Whether the field is required */
  required?: boolean;
}

/**
 * Field signal interface providing reactive form field functionality
 */
export interface FieldSignal<T> {
  /** Current value signal */
  value: WritableSignal<T>;
  /** Current validation errors signal */
  errors: Signal<ValidationError | null>;
  /** Whether the field has been touched signal */
  touched: WritableSignal<boolean>;
  /** Whether the field is valid signal */
  valid: Signal<boolean>;
  /** Whether the field is invalid signal */
  invalid: Signal<boolean>;
  /** Mark field as touched */
  markAsTouched: () => void;
  /** Update field value and trigger validation */
  setValue: (value: T) => void;
  /** Reset field to initial state */
  reset: () => void;
}

/**
 * Form signal interface providing reactive form functionality
 */
export interface FormSignal<T extends Record<string, any>> {
  /** All field values as a computed signal */
  value: Signal<T>;
  /** All form errors as a computed signal */
  errors: Signal<Partial<Record<keyof T, ValidationError | null>>>;
  /** Whether the entire form is valid */
  valid: Signal<boolean>;
  /** Whether the entire form is invalid */
  invalid: Signal<boolean>;
  /** Whether any field has been touched */
  touched: Signal<boolean>;
  /** Get a specific field signal */
  get<K extends keyof T>(key: K): FieldSignal<T[K]>;
  /** Mark all fields as touched */
  markAllAsTouched: () => void;
  /** Reset entire form to initial state */
  reset: () => void;
}

/**
 * Creates a reactive field signal with validation
 * @param config - Configuration options for the field
 * @returns A FieldSignal instance
 */
export function fieldSignal<T>(config: FieldConfig<T>): FieldSignal<T> {
  const initialValue = config.initialValue;
  const validators = config.validators || [];
  
  // Core signals
  const value = signal<T>(initialValue);
  const touched = signal(false);
  
  // Validation logic using computed signal
  const errors = computed<ValidationError | null>(() => {
    const currentValue = value();
    
    // Check required validation
    if (config.required && (currentValue === null || currentValue === undefined || currentValue === '')) {
      return { required: true };
    }
    
    // Run custom validators
    for (const validator of validators) {
      const error = validator(currentValue);
      if (error) {
        return error;
      }
    }
    
    return null;
  });
  
  // Computed validity signals
  const valid = computed(() => errors() === null);
  const invalid = computed(() => !valid());
  
  return {
    value,
    errors,
    touched,
    valid,
    invalid,
    markAsTouched: () => touched.set(true),
    setValue: (newValue: T) => {
      value.set(newValue);
      touched.set(true);
    },
    reset: () => {
      value.set(initialValue);
      touched.set(false);
    }
  };
}

/**
 * Creates a reactive form signal managing multiple fields
 * @param fields - Object containing field configurations
 * @returns A FormSignal instance
 */
export function formSignal<T extends Record<string, any>>(
  fields: { [K in keyof T]: FieldConfig<T[K]> }
): FormSignal<T> {
  // Create field signals for each field
  const fieldSignals: { [K in keyof T]: FieldSignal<T[K]> } = {} as any;
  
  for (const [key, config] of Object.entries(fields)) {
    fieldSignals[key as keyof T] = fieldSignal(config);
  }
  
  // Computed form value from all field values
  const value = computed<T>(() => {
    const result = {} as T;
    for (const [key, field] of Object.entries(fieldSignals)) {
      result[key as keyof T] = field.value();
    }
    return result;
  });
  
  // Computed form errors from all field errors
  const errors = computed<Partial<Record<keyof T, ValidationError | null>>>(() => {
    const result: Partial<Record<keyof T, ValidationError | null>> = {};
    for (const [key, field] of Object.entries(fieldSignals)) {
      const fieldErrors = field.errors();
      if (fieldErrors) {
        result[key as keyof T] = fieldErrors;
      }
    }
    return result;
  });
  
  // Computed form validity
  const valid = computed(() => {
    return Object.values(fieldSignals).every(field => field.valid());
  });
  
  const invalid = computed(() => !valid());
  
  // Computed touched state
  const touched = computed(() => {
    return Object.values(fieldSignals).some(field => field.touched());
  });
  
  return {
    value,
    errors,
    valid,
    invalid,
    touched,
    get: <K extends keyof T>(key: K) => fieldSignals[key],
    markAllAsTouched: () => {
      Object.values(fieldSignals).forEach(field => field.markAsTouched());
    },
    reset: () => {
      Object.values(fieldSignals).forEach(field => field.reset());
    }
  };
}

/**
 * Array field signal for managing dynamic arrays (like tags)
 */
export interface ArrayFieldSignal<T> {
  /** Current array values signal */
  items: Signal<T[]>;
  /** Add item to array */
  push: (item: T) => void;
  /** Remove item at index */
  removeAt: (index: number) => void;
  /** Clear all items */
  clear: () => void;
  /** Get item at index */
  at: (index: number) => T | undefined;
  /** Current length */
  length: Signal<number>;
}

/**
 * Creates a reactive array field signal
 * @param initialItems - Initial array items
 * @returns An ArrayFieldSignal instance
 */
export function arrayFieldSignal<T>(initialItems: T[] = []): ArrayFieldSignal<T> {
  const items = signal<T[]>([...initialItems]);
  
  const length = computed(() => items().length);
  
  return {
    items: items.asReadonly(),
    length,
    push: (item: T) => {
      items.update(current => [...current, item]);
    },
    removeAt: (index: number) => {
      items.update(current => current.filter((_, i) => i !== index));
    },
    clear: () => {
      items.set([]);
    },
    at: (index: number) => {
      return items()[index];
    }
  };
}

/**
 * Common validation functions for use with signal-based forms
 */
export const Validators = {
  /**
   * Validates that a value is not empty
   */
  required: <T>(value: T): ValidationError | null => {
    if (value === null || value === undefined || value === '') {
      return { required: true };
    }
    return null;
  },
  
  /**
   * Validates minimum length for strings
   */
  minLength: (min: number) => (value: string): ValidationError | null => {
    if (value && value.length < min) {
      return { minLength: { requiredLength: min, actualLength: value.length } };
    }
    return null;
  },
  
  /**
   * Validates maximum length for strings
   */
  maxLength: (max: number) => (value: string): ValidationError | null => {
    if (value && value.length > max) {
      return { maxLength: { requiredLength: max, actualLength: value.length } };
    }
    return null;
  },
  
  /**
   * Validates that a date is in the future
   */
  futureDate: (value: string): ValidationError | null => {
    if (!value) return null;
    
    const inputDateString = value; // Format: YYYY-MM-DD
    const today = new Date();
    const todayString = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    
    if (inputDateString < todayString) {
      return { pastDate: true };
    }
    
    return null;
  },
  
  /**
   * Validates email format
   */
  email: (value: string): ValidationError | null => {
    if (!value) return null;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return { email: true };
    }
    
    return null;
  }
};

/**
 * Utility function to create a complete form for todo creation
 * This provides a pre-configured form matching the current AddTodoForm functionality
 */
export function createTodoFormSignal() {
  return formSignal({
    title: {
      initialValue: '',
      required: true,
      validators: [Validators.required]
    },
    description: {
      initialValue: '',
      required: false
    },
    priority: {
      initialValue: 'medium' as 'low' | 'medium' | 'high',
      required: false
    },
    dueDate: {
      initialValue: '',
      required: false,
      validators: [Validators.futureDate]
    }
  });
}