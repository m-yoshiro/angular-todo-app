/**
 * @fileoverview User feedback service for managing error, success, and loading states.
 * @description Provides centralized user feedback management using Angular 20 signals for reactive state.
 * Extracted from TodoService to follow Single Responsibility Principle and improve testability.
 */

import { Injectable, signal, OnDestroy, Signal } from '@angular/core';

/**
 * Interface defining the contract for user feedback service.
 * @description Provides reactive signals for user feedback states and methods for updating them.
 */
export interface IUserFeedbackService {
  /** Readonly signal exposing error messages for external consumption */
  readonly errorMessage: Signal<string | null>;
  
  /** Readonly signal exposing success messages for external consumption */
  readonly successMessage: Signal<string | null>;
  
  /** Readonly signal exposing loading state for external consumption */
  readonly isLoading: Signal<boolean>;
  
  /**
   * Sets an error message for user feedback.
   * @param message - The error message to display to the user
   */
  setErrorMessage(message: string): void;
  
  /**
   * Sets a success message for user feedback with auto-clearing after 3 seconds.
   * @param message - The success message to display to the user
   */
  setSuccessMessage(message: string): void;
  
  /**
   * Sets the loading state for user feedback.
   * @param loading - True if an operation is in progress, false otherwise
   */
  setLoadingState(loading: boolean): void;
  
  /**
   * Clears all user feedback messages.
   */
  clearMessages(): void;
}

/**
 * Service responsible for managing user feedback messages and loading states.
 * @description Implements signal-based state management using Angular 20's signal primitives.
 * Provides centralized management of error messages, success messages, and loading states
 * with automatic success message clearing and proper memory management.
 * 
 * **Memory Management**: Implements proper cleanup for auto-clearing success message timeouts
 * to prevent memory leaks. The service automatically clears pending timeouts when destroyed
 * or when new success messages override existing ones.
 * 
 * **Lifecycle**: Implements OnDestroy to ensure proper resource cleanup when the service
 * is no longer needed, particularly important for the auto-clearing timeout functionality.
 * 
 * @example
 * ```typescript
 * constructor(private userFeedbackService: UserFeedbackService) {
 *   // Access reactive feedback state
 *   const errorMessage = this.userFeedbackService.errorMessage();
 *   const successMessage = this.userFeedbackService.successMessage();
 *   const isLoading = this.userFeedbackService.isLoading();
 *   
 *   // Set feedback messages
 *   this.userFeedbackService.setSuccessMessage('Operation completed!');
 *   this.userFeedbackService.setErrorMessage('Operation failed!');
 *   this.userFeedbackService.setLoadingState(true);
 * }
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class UserFeedbackService implements IUserFeedbackService, OnDestroy {
  /** Private signal for user feedback error messages */
  private _errorMessage = signal<string | null>(null);
  
  /** Private signal for user feedback success messages */
  private _successMessage = signal<string | null>(null);
  
  /** Private signal for loading state */
  private _isLoading = signal<boolean>(false);
  
  /** Private timeout ID for success message auto-clearing to prevent memory leaks */
  private successTimeoutId?: number;
  
  /** Readonly signal exposing error messages for external consumption */
  readonly errorMessage = this._errorMessage.asReadonly();
  
  /** Readonly signal exposing success messages for external consumption */
  readonly successMessage = this._successMessage.asReadonly();
  
  /** Readonly signal exposing loading state for external consumption */
  readonly isLoading = this._isLoading.asReadonly();

  /**
   * Sets an error message for user feedback.
   * @description Clears any existing success message and timeout when setting an error message
   * to avoid conflicting feedback states.
   * @param message - The error message to display to the user
   */
  setErrorMessage(message: string): void {
    this.clearExistingTimeout();
    this._errorMessage.set(message);
    this._successMessage.set(null); // Clear success message when setting error
  }

  /**
   * Sets a success message for user feedback with auto-clearing after 3 seconds.
   * @description Sets the success message and automatically clears it after 3 seconds
   * to provide toast-like behavior for better user experience. Error messages are cleared
   * when success messages are set to avoid conflicting feedback. Includes proper memory
   * management to prevent timeout leaks when called multiple times rapidly.
   * @param message - The success message to display to the user
   */
  setSuccessMessage(message: string): void {
    // Clear any existing timeout to prevent memory leaks from rapid successive calls
    this.clearExistingTimeout();

    this._successMessage.set(message);
    this._errorMessage.set(null); // Clear error message when setting success
    
    // Auto-clear success message after 3 seconds and store timeout ID for cleanup
    this.successTimeoutId = window.setTimeout(() => {
      this._successMessage.set(null);
      this.successTimeoutId = undefined; // Clear the timeout ID when done
    }, 3000);
  }

  /**
   * Sets the loading state for user feedback.
   * @param loading - True if an operation is in progress, false otherwise
   */
  setLoadingState(loading: boolean): void {
    this._isLoading.set(loading);
  }

  /**
   * Clears all user feedback messages.
   * @description Resets error and success messages to null and clears any pending timeouts
   * for a clean state.
   */
  clearMessages(): void {
    this.clearExistingTimeout();
    this._errorMessage.set(null);
    this._successMessage.set(null);
  }

  /**
   * Cleanup method called when the service is destroyed.
   * @description Clears any pending success message timeouts to prevent memory leaks
   * and ensure proper resource cleanup when the service is no longer needed.
   */
  ngOnDestroy(): void {
    this.clearExistingTimeout();
  }

  /**
   * Clears existing timeout for success message auto-clearing.
   * @description Private helper method to prevent timeout leaks when setting new messages
   * or when the service is destroyed.
   */
  private clearExistingTimeout(): void {
    if (this.successTimeoutId) {
      clearTimeout(this.successTimeoutId);
      this.successTimeoutId = undefined;
    }
  }
}