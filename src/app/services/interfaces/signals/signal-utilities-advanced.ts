/**
 * @fileoverview Advanced signal utilities for future Angular 20 patterns
 * @description Advanced signal utility types and patterns for complex reactive scenarios.
 */

import { Signal } from '@angular/core';

/**
 * Signal-based service state pattern for reactive service implementations.
 */
export interface SignalServiceState {
  /** Whether the service is initialized */
  initialized: boolean;
  
  /** Current operation state */
  operation: {
    loading: boolean;
    error: string | null;
    success: string | null;
  };
  
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
 * Signal-based event emitter pattern for service events.
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
 */
export type SignalEventBus = Signal<SignalEvent[]>;

/**
 * Utility type for creating signal-based computed properties.
 */
export type ComputedSignal<T> = Signal<T>;

/**
 * Utility type for creating signal-based effect handlers.
 */
export type SignalEffect = () => void;

/**
 * Utility type for creating signal-based validators.
 */
export type SignalValidator<T> = (value: T) => boolean | string;

/**
 * Signal-based transformation function for data processing.
 */
export type SignalTransform<T, U> = (value: T) => U;

/**
 * Signal-based filter function for data filtering.
 */
export type SignalFilter<T> = (value: T) => boolean;

/**
 * Advanced signal subscription with enhanced metadata.
 */
export interface AdvancedSignalSubscription {
  /** Unique identifier for the subscription */
  id: string;
  
  /** Cleanup function for the subscription */
  cleanup: () => void;
  
  /** Whether the subscription is active */
  active: boolean;
  
  /** Subscription creation timestamp */
  createdAt: Date;
  
  /** Subscription metadata */
  metadata?: Record<string, unknown>;
  
  /** Performance metrics */
  metrics?: {
    totalExecutions: number;
    averageExecutionTime: number;
    lastExecutionTime: Date;
  };
}

/**
 * Signal-based state machine for complex state management.
 */
export interface SignalStateMachine<T> {
  /** Current state */
  currentState: Signal<T>;
  
  /** Available transitions from current state */
  availableTransitions: Signal<string[]>;
  
  /** Transition to new state */
  transition(action: string): boolean;
  
  /** Get state history */
  getHistory(): T[];
  
  /** Reset to initial state */
  reset(): void;
}

/**
 * Signal-based caching interface for performance optimization.
 */
export interface SignalCache<T> {
  /** Get cached value */
  get(key: string): Signal<T | null>;
  
  /** Set cached value */
  set(key: string, value: T, ttl?: number): void;
  
  /** Clear cache entry */
  clear(key: string): void;
  
  /** Clear all cache entries */
  clearAll(): void;
  
  /** Get cache statistics */
  getStats(): {
    hitRate: number;
    missRate: number;
    totalRequests: number;
    cacheSize: number;
  };
}

/**
 * Signal-based debounce utility for performance optimization.
 */
export interface SignalDebounce<T> {
  /** Debounced signal */
  debouncedValue: Signal<T>;
  
  /** Update the value (will be debounced) */
  setValue(value: T): void;
  
  /** Immediately flush the pending value */
  flush(): void;
  
  /** Cancel pending debounced update */
  cancel(): void;
}

/**
 * Signal-based throttle utility for performance optimization.
 */
export interface SignalThrottle<T> {
  /** Throttled signal */
  throttledValue: Signal<T>;
  
  /** Update the value (will be throttled) */
  setValue(value: T): void;
  
  /** Get throttle statistics */
  getStats(): {
    totalUpdates: number;
    throttledUpdates: number;
    lastUpdate: Date;
  };
}