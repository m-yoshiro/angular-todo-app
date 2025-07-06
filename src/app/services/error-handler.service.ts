/**
 * @fileoverview Service for structured error handling and logging.
 * @description Provides centralized error handling to remove error handling logic from components.
 * Supports different error types and contexts for better debugging and future extension to
 * user-facing notifications and external logging services. Extracted from components to follow
 * Single Responsibility Principle.
 */

import { Injectable } from '@angular/core';

/**
 * Service responsible for handling and logging errors in a structured way.
 * @description Centralizes error handling logic to provide consistent error logging,
 * better debugging information, and foundation for future user-facing error notifications
 * and external logging service integration.
 * 
 * @example
 * ```typescript
 * constructor(private errorHandler: ErrorHandlerService) {}
 * 
 * try {
 *   // Some operation
 * } catch (error) {
 *   this.errorHandler.handleError(error, 'TodoService.addTodo');
 * }
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {

  /** Default context when none provided */
  private readonly DEFAULT_CONTEXT = 'Unknown Context';

  /**
   * Handles general errors with context information.
   * @param error - The error that occurred (Error object, string, or unknown type)
   * @param context - The context where the error occurred (e.g., 'TodoService.addTodo')
   */
  handleError(error: unknown, context: string): void {
    try {
      const processedContext = this.processContext(context);
      const processedError = this.processError(error);

      this.logError(processedContext, 'Error', processedError);
    } catch (loggingError) {
      // Fallback if logging itself fails - should not throw
      this.safeLog('Error in error handling:', { originalError: error, loggingError, context });
    }
  }

  /**
   * Handles validation errors with context information.
   * @param validationErrors - Array of validation error messages
   * @param context - The context where the validation failed
   */
  handleValidationError(validationErrors: string[], context: string): void {
    try {
      const processedContext = this.processContext(context);
      const processedErrors = this.processValidationErrors(validationErrors);

      this.logError(processedContext, 'Validation Error', processedErrors);
    } catch (loggingError) {
      // Fallback if logging itself fails
      this.safeLog('Error in validation error handling:', { originalErrors: validationErrors, loggingError, context });
    }
  }

  /**
   * Handles todo not found errors with context information.
   * @param todoId - The ID of the todo that was not found (optional)
   * @param context - The context where the todo lookup failed
   */
  handleTodoNotFoundError(todoId: string | undefined, context: string): void {
    try {
      const processedContext = this.processContext(context);
      const processedMessage = this.processTodoNotFoundMessage(todoId);

      this.logError(processedContext, 'Todo Not Found', processedMessage);
    } catch (loggingError) {
      // Fallback if logging itself fails
      this.safeLog('Error in todo not found error handling:', { todoId, loggingError, context });
    }
  }

  /**
   * Processes the context string to ensure it's valid and formatted.
   * @param context - The raw context string
   * @returns Processed context string
   */
  private processContext(context: string): string {
    if (!context || typeof context !== 'string' || context.trim().length === 0) {
      return this.DEFAULT_CONTEXT;
    }
    return context.trim();
  }

  /**
   * Processes an error to ensure it's loggable.
   * @param error - The raw error
   * @returns Processed error for logging
   */
  private processError(error: unknown): string {
    if (error === null || error === undefined) {
      return 'Unknown error occurred';
    }
    return error;
  }

  /**
   * Processes validation errors array into a formatted string.
   * @param validationErrors - Array of validation error messages
   * @returns Formatted validation error message
   */
  private processValidationErrors(validationErrors: string[]): string {
    if (!Array.isArray(validationErrors) || validationErrors.length === 0) {
      return 'Unknown validation error';
    }

    // Filter out empty/whitespace-only messages and join with semicolon
    const validMessages = validationErrors
      .filter(error => error && typeof error === 'string' && error.trim().length > 0)
      .map(error => error.trim());

    if (validMessages.length === 0) {
      return 'Unknown validation error';
    }

    return validMessages.join('; ');
  }

  /**
   * Processes todo not found message.
   * @param todoId - The ID of the todo that was not found
   * @returns Formatted todo not found message
   */
  private processTodoNotFoundMessage(todoId: string | undefined): string {
    if (!todoId || typeof todoId !== 'string' || todoId.trim().length === 0) {
      return 'Todo not found';
    }
    return `Todo with ID "${todoId.trim()}" not found`;
  }

  /**
   * Logs error with context and type.
   * @param context - The processed context
   * @param errorType - The type of error (e.g., 'Error', 'Validation Error')
   * @param message - The error message or object
   */
  private logError(context: string, errorType: string, message: string): void {
    if (this.isConsoleAvailable()) {
      console.error(`[${context}] ${errorType}:`, message);
    }
  }

  /**
   * Safe logging that won't throw if console is unavailable.
   * @param message - The message to log
   * @param data - Additional data to log
   */
  private safeLog(message: string, data?: unknown): void {
    try {
      if (this.isConsoleAvailable()) {
        console.error(message, data);
      }
    } catch {
      // Silently fail if even safe logging doesn't work
    }
  }

  /**
   * Checks if console is available for logging.
   * @returns True if console.error is available
   */
  private isConsoleAvailable(): boolean {
    return typeof console !== 'undefined' && typeof console.error === 'function';
  }
}