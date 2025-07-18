/**
 * @fileoverview Core signal utilities for Angular 20 reactive patterns
 * @description Essential signal utility types and patterns actually used in the TodoService.
 */

import { Signal, WritableSignal } from '@angular/core';

/**
 * A signal that contains a value with an associated timeout ID for cleanup.
 * @description Used for implementing auto-clearing timeouts with proper memory management.
 */
export type SignalWithTimeout<T> = Signal<{ value: T; timeoutId: number } | null>;

/**
 * A writable signal that contains a value with an associated timeout ID for cleanup.
 * @description Writable version for internal service implementations.
 */
export type WritableSignalWithTimeout<T> = WritableSignal<{ value: T; timeoutId: number } | null>;

/**
 * Signal state for managing loading operations.
 */
export interface LoadingState {
  /** Whether a loading operation is currently in progress */
  isLoading: boolean;
  
  /** Name or identifier of the current operation */
  operation?: string;
  
  /** Progress percentage (0-100) for operations that support progress tracking */
  progress?: number;
  
  /** Timestamp when the loading operation started */
  startTime?: Date;
}

/**
 * Signal state for managing error conditions.
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
  
  /** Timestamp when the error occurred */
  timestamp?: Date;
}

/**
 * Signal state for managing success conditions.
 */
export interface SuccessState {
  /** Whether a success condition is currently active */
  hasSuccess: boolean;
  
  /** Success message for display */
  message?: string;
  
  /** Type of success operation */
  type?: 'create' | 'update' | 'delete' | 'operation';
  
  /** Timestamp when the success occurred */
  timestamp?: Date;
  
  /** Auto-clear timeout ID for cleanup */
  timeoutId?: number;
}

/**
 * Combined operation state for comprehensive operation tracking.
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
 * Utility type for creating readonly signal interfaces.
 */
export type ReadonlySignal<T> = Signal<T>;

/**
 * Utility type for creating signal-based service interfaces.
 */
export type SignalInterface<T> = {
  readonly [K in keyof T]: ReadonlySignal<T[K]>;
};

/**
 * Utility type for creating writable signal-based service implementations.
 */
export type WritableSignalInterface<T> = {
  [K in keyof T]: WritableSignal<T[K]>;
};

/**
 * Signal-based cleanup function for resource management.
 */
export type SignalCleanup = () => void;

/**
 * Utility interface for managing signal subscriptions and cleanup.
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
}