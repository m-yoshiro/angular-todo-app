/**
 * @fileoverview Angular 20 signal-specific utility types and patterns
 * @description Provides utility types and patterns for working with Angular 20 signals
 * in service interfaces and implementations. These utilities help maintain type safety
 * and provide common patterns for signal-based reactive programming.
 */

import { Signal, WritableSignal } from '@angular/core';

/**
 * A signal that contains a value with an associated timeout ID for cleanup.
 * @description Useful for implementing auto-clearing timeouts with proper memory management.
 * Combines signal reactivity with timeout lifecycle management.
 */
export type SignalWithTimeout<T> = Signal<{ value: T; timeoutId: number } | null>;

/**
 * A writable signal that contains a value with an associated timeout ID for cleanup.
 * @description Writable version of SignalWithTimeout for internal service implementations.
 * Enables both reading and writing while maintaining timeout lifecycle management.
 */
export type WritableSignalWithTimeout<T> = WritableSignal<{ value: T; timeoutId: number } | null>;

/**
 * Signal state for managing loading operations with context.
 * @description Provides structured loading state with operation context and progress tracking.
 */
export interface LoadingState {
  /** Whether a loading operation is currently in progress */
  isLoading: boolean;
  
  /** Name or identifier of the current operation */
  operation?: string;
  
  /** Progress percentage (0-100) for operations that support progress tracking */
  progress?: number;
  
  /** Additional context about the loading operation */
  context?: Record<string, unknown>;
  
  /** Timestamp when the loading operation started */
  startTime?: Date;
}

/**
 * Signal state for managing error conditions with detailed information.
 * @description Provides structured error state with severity, codes, and context.
 */
export interface ErrorState {
  /** Whether an error condition is currently active */
  hasError: boolean;
  
  /** Primary error message for display */
  message?: string;
  
  /** Programmatic error code for handling */
  code?: string;
  
  /** Error severity level */
  severity?: 'error' | 'warning' | 'info';
  
  /** Additional error context */
  context?: Record<string, unknown>;
  
  /** Timestamp when the error occurred */
  timestamp?: Date;
  
  /** Stack trace for debugging (development only) */
  stack?: string;
}

/**
 * Signal state for managing success conditions with feedback.
 * @description Provides structured success state with messages and context.
 */
export interface SuccessState {
  /** Whether a success condition is currently active */
  hasSuccess: boolean;
  
  /** Success message for display */
  message?: string;
  
  /** Type of success operation */
  type?: 'create' | 'update' | 'delete' | 'operation';
  
  /** Additional success context */
  context?: Record<string, unknown>;
  
  /** Timestamp when the success occurred */
  timestamp?: Date;
  
  /** Auto-clear timeout ID for cleanup */
  timeoutId?: number;
}

/**
 * Combined operation state for comprehensive operation tracking.
 * @description Combines loading, error, and success states for complete operation lifecycle management.
 */
export interface OperationState {
  /** Loading state information */
  loading: LoadingState;
  
  /** Error state information */
  error: ErrorState;
  
  /** Success state information */
  success: SuccessState;
  
  /** Overall operation status */
  status: 'idle' | 'loading' | 'success' | 'error';
  
  /** Last operation timestamp */
  lastOperation?: Date;
}

/**
 * Signal-based service state pattern for reactive service implementations.
 * @description Provides a standard pattern for managing service state with signals.
 * Includes common state properties and lifecycle management.
 */
export interface SignalServiceState {
  /** Whether the service is initialized */
  initialized: boolean;
  
  /** Current operation state */
  operation: OperationState;
  
  /** Service-specific data signals */
  data: Record<string, Signal<unknown>>;
  
  /** Service configuration */
  config: Record<string, unknown>;
  
  /** Service metadata */
  metadata: {
    version: string;
    lastUpdated: Date;
    operationCount: number;
  };
}

/**
 * Utility type for creating readonly signal interfaces.
 * @description Transforms a writable signal type into a readonly signal type.
 * Useful for creating public interfaces that expose readonly signals.
 */
export type ReadonlySignal<T> = Signal<T>;

/**
 * Utility type for creating signal-based service interfaces.
 * @description Transforms object properties into readonly signals for service interfaces.
 * Maintains type safety while providing reactive access to service state.
 */
export type SignalInterface<T> = {
  readonly [K in keyof T]: ReadonlySignal<T[K]>;
};

/**
 * Utility type for creating writable signal-based service implementations.
 * @description Transforms object properties into writable signals for service implementations.
 * Enables internal state management while maintaining type safety.
 */
export type WritableSignalInterface<T> = {
  [K in keyof T]: WritableSignal<T[K]>;
};

/**
 * Signal-based event emitter pattern for service events.
 * @description Provides a signal-based approach to event emission and handling.
 * Combines the benefits of signals with event-driven architecture.
 */
export interface SignalEvent<T = unknown> {
  /** Event type identifier */
  type: string;
  
  /** Event payload data */
  payload: T;
  
  /** Event timestamp */
  timestamp: Date;
  
  /** Event source identifier */
  source?: string;
  
  /** Event metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Signal-based event bus for cross-service communication.
 * @description Provides a signal-based event bus pattern for loose coupling between services.
 * Enables reactive event handling with type safety.
 */
export type SignalEventBus = Signal<SignalEvent[]>;

/**
 * Utility type for creating signal-based computed properties.
 * @description Represents a computed signal that depends on other signals.
 * Useful for defining derived state in service interfaces.
 */
export type ComputedSignal<T> = Signal<T>;

/**
 * Utility type for creating signal-based effect handlers.
 * @description Represents a function that creates effects based on signal changes.
 * Useful for defining side effects in service interfaces.
 */
export type SignalEffect = () => void;

/**
 * Signal-based cleanup function for resource management.
 * @description Represents a cleanup function that should be called when signals or services are destroyed.
 * Useful for preventing memory leaks and cleaning up resources.
 */
export type SignalCleanup = () => void;

/**
 * Utility type for creating signal-based validators.
 * @description Represents a validation function that operates on signal values.
 * Useful for reactive validation in service interfaces.
 */
export type SignalValidator<T> = (value: T) => boolean | string;

/**
 * Signal-based transformation function for data processing.
 * @description Represents a function that transforms signal values.
 * Useful for data processing pipelines in service interfaces.
 */
export type SignalTransform<T, U> = (value: T) => U;

/**
 * Signal-based filter function for data filtering.
 * @description Represents a function that filters signal values.
 * Useful for creating filtered views of data in service interfaces.
 */
export type SignalFilter<T> = (value: T) => boolean;

/**
 * Utility interface for managing signal subscriptions and cleanup.
 * @description Provides a standard pattern for managing signal subscriptions with proper cleanup.
 * Helps prevent memory leaks in signal-based services.
 */
export interface SignalSubscription {
  /** Unique identifier for the subscription */
  id: string;
  
  /** Cleanup function for the subscription */
  cleanup: SignalCleanup;
  
  /** Whether the subscription is active */
  active: boolean;
  
  /** Subscription creation timestamp */
  createdAt: Date;
  
  /** Subscription metadata */
  metadata?: Record<string, unknown>;
}