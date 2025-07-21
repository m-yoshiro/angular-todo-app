/**
 * @fileoverview Barrel export file for service interfaces
 * @description Provides clean, organized exports for all service interfaces and utilities.
 * This file enables tree-shaking and provides a single import point for all service contracts.
 */

// User Feedback Service Interface
export type {
  IUserFeedbackService,
  MessageSeverity
} from './user-feedback.service.interface';

// Todo Storage Service Interface
export type {
  ITodoStorageService,
  StorageHealthInfo
} from './todo-storage.service.interface';

// Todo Validation Service Interfaces (focused interfaces)
export type {
  ITodoValidationService,
  ITodoBasicValidation,
  ITodoFieldValidation,
  ITodoBusinessRules,
  ITodoValidationUtilities,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  ValidationConfig,
  ValidationSeverity,
  ValidationLimits
} from './validation';

// Confirmation Service Interface
export type {
  IConfirmationService,
  ConfirmationOptions,
  ConfirmationResult
} from './confirmation.service.interface';

// Core Signal Utilities (commonly used)
export type {
  SignalWithTimeout,
  WritableSignalWithTimeout,
  LoadingState,
  ErrorState,
  SuccessState,
  OperationState,
  ReadonlySignal,
  SignalInterface,
  WritableSignalInterface,
  SignalCleanup,
  SignalSubscription
} from './signals';

// Advanced Signal Utilities (import explicitly when needed)
export type * as AdvancedSignals from './signals/signal-utilities-advanced';

/**
 * Collection of all service interfaces for easy reference and dependency injection.
 * @description Provides a centralized collection of all service interfaces for
 * easy reference, documentation, and dependency injection setup.
 */
export const SERVICE_INTERFACES = {
  UserFeedback: 'IUserFeedbackService',
  TodoStorage: 'ITodoStorageService',
  TodoValidation: 'ITodoValidationService',
  Confirmation: 'IConfirmationService'
} as const;

/**
 * Type union of all service interface names.
 * @description Provides type safety for service interface references.
 */
export type ServiceInterfaceName = typeof SERVICE_INTERFACES[keyof typeof SERVICE_INTERFACES];

/**
 * Utility type for creating service interface collections.
 * @description Helps create type-safe collections of service interfaces.
 */
export type ServiceInterfaceCollection = {
  [K in keyof typeof SERVICE_INTERFACES]: unknown;
};

/**
 * Re-export common types from Angular for convenience.
 * @description Provides convenient access to commonly used Angular types
 * without requiring additional imports.
 */
export type { Signal, WritableSignal } from '@angular/core';
export { computed, effect } from '@angular/core';