/**
 * @fileoverview Interface for user feedback service managing error messages, success messages, and loading states
 * @description Defines the contract for a service that provides signal-based reactive user feedback
 * with auto-clearing timeout management and memory safety. This interface enables proper testing
 * and separation of concerns by abstracting user feedback functionality from business logic.
 */

import { Signal } from '@angular/core';

/**
 * Message severity levels for enhanced user feedback categorization.
 * @description Enables different UI treatments for messages based on their importance
 * and allows for more sophisticated error handling and user experience patterns.
 */
export type MessageSeverity = 'error' | 'warning' | 'info' | 'success';

/**
 * Interface for user feedback service providing reactive message and loading state management.
 * @description Defines the contract for managing user feedback through signal-based reactive properties.
 * Implementations should provide auto-clearing timeout management for success messages and proper
 * memory cleanup to prevent leaks. The service should handle concurrent message scenarios gracefully.
 * 
 * **Key Features:**
 * - Signal-based reactive properties for real-time UI updates
 * - Auto-clearing timeout management for success messages
 * - Memory-safe timeout cleanup to prevent leaks
 * - Loading state coordination for UX consistency
 * - Message severity classification for enhanced UX
 * 
 * **Implementation Requirements:**
 * - Must implement OnDestroy for timeout cleanup
 * - Should handle rapid successive message calls safely
 * - Must provide readonly signals for external consumption
 * - Should clear conflicting message types (error when success, success when error)
 * 
 * @example
 * ```typescript
 * // Service usage example
 * class TodoComponent {
 *   constructor(private userFeedback: IUserFeedbackService) {}
 *   
 *   onSave() {
 *     this.userFeedback.setLoading(true);
 *     this.todoService.save().subscribe({
 *       next: () => this.userFeedback.setSuccessMessage('Todo saved successfully'),
 *       error: (err) => this.userFeedback.setErrorMessage('Failed to save todo'),
 *       complete: () => this.userFeedback.setLoading(false)
 *     });
 *   }
 * }
 * 
 * // Template usage example
 * @if (userFeedback.errorMessage()) {
 *   <div class="error-message" [attr.aria-live]="'polite'">
 *     {{ userFeedback.errorMessage() }}
 *   </div>
 * }
 * @if (userFeedback.successMessage()) {
 *   <div class="success-message" [attr.aria-live]="'polite'">
 *     {{ userFeedback.successMessage() }}
 *   </div>
 * }
 * ```
 */
export interface IUserFeedbackService {
  /**
   * Readonly signal containing the current error message.
   * @description Provides reactive access to error messages for UI binding.
   * Value is null when no error message is active.
   */
  readonly errorMessage: Signal<string | null>;

  /**
   * Readonly signal containing the current success message.
   * @description Provides reactive access to success messages for UI binding.
   * Value is null when no success message is active. Success messages
   * auto-clear after 3 seconds by default.
   */
  readonly successMessage: Signal<string | null>;

  /**
   * Readonly signal containing the current loading state.
   * @description Provides reactive access to loading state for UI binding.
   * Use this to show loading indicators, disable buttons, or prevent user interactions.
   */
  readonly isLoading: Signal<boolean>;

  /**
   * Sets an error message for user feedback.
   * @description Displays an error message to the user and clears any existing success message.
   * Error messages persist until explicitly cleared or replaced with a success message.
   * @param message - The error message to display to the user
   * @param severity - Optional severity level for the error (defaults to 'error')
   */
  setErrorMessage(message: string, severity?: MessageSeverity): void;

  /**
   * Sets a success message for user feedback with auto-clearing behavior.
   * @description Displays a success message to the user and clears any existing error message.
   * Success messages automatically clear after 3 seconds to provide toast-like behavior.
   * Includes memory management to prevent timeout leaks when called multiple times rapidly.
   * @param message - The success message to display to the user
   * @param severity - Optional severity level for the success (defaults to 'success')
   */
  setSuccessMessage(message: string, severity?: MessageSeverity): void;

  /**
   * Clears all user feedback messages.
   * @description Resets both error and success messages to null for a clean state.
   * Useful for resetting the UI state before performing new operations.
   */
  clearMessages(): void;

  /**
   * Sets the loading state for user feedback.
   * @description Controls the loading state to indicate when operations are in progress.
   * Use this to show loading indicators, disable forms, or prevent user interactions.
   * @param loading - True if an operation is in progress, false otherwise
   */
  setLoading(loading: boolean): void;

  /**
   * Sets a general message with specified severity.
   * @description Provides a unified interface for setting messages with different severity levels.
   * Behavior depends on severity: 'error' and 'warning' persist, 'success' and 'info' auto-clear.
   * @param message - The message to display to the user
   * @param severity - The severity level determining message behavior and styling
   */
  setMessage(message: string, severity: MessageSeverity): void;

  /**
   * Checks if any message is currently active.
   * @description Utility method to determine if any user feedback message is being displayed.
   * Useful for UI state management and conditional rendering.
   * @returns True if any error or success message is active, false otherwise
   */
  hasActiveMessage(): boolean;
}