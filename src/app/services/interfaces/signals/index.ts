/**
 * @fileoverview Barrel export file for signal utilities
 * @description Provides clean exports for core and advanced signal utilities.
 */

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
} from './signal-utilities-core';

// Advanced Signal Utilities (for future use)
export type {
  SignalServiceState,
  SignalEvent,
  SignalEventBus,
  ComputedSignal,
  SignalEffect,
  SignalValidator,
  SignalTransform,
  SignalFilter,
  AdvancedSignalSubscription,
  SignalStateMachine,
  SignalCache,
  SignalDebounce,
  SignalThrottle
} from './signal-utilities-advanced';