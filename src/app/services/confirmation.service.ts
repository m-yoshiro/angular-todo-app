/**
 * @fileoverview Service for handling user confirmation dialogs.
 * @description Provides abstraction layer for confirmation dialogs to remove direct browser API
 * dependencies from components. Supports custom messages and future extension to UI-based dialogs.
 * Extracted from components to follow Single Responsibility Principle.
 */

import { Injectable } from '@angular/core';

/**
 * Service responsible for handling user confirmation dialogs.
 * @description Abstracts browser confirmation dialogs to enable testing and future
 * replacement with custom UI components. Provides specific methods for different
 * types of confirmations (delete, todo-specific) while maintaining a consistent API.
 * 
 * @example
 * ```typescript
 * constructor(private confirmationService: ConfirmationService) {}
 * 
 * async onDeleteTodo(todoTitle: string) {
 *   const confirmed = await this.confirmationService.confirmDeleteTodo(todoTitle);
 *   if (confirmed) {
 *     // Proceed with deletion
 *   }
 * }
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {

  /** Default confirmation message for generic deletions */
  private readonly DEFAULT_DELETE_MESSAGE = 'Are you sure you want to delete this item?';
  
  /** Default confirmation message for todo deletions */
  private readonly DEFAULT_TODO_DELETE_MESSAGE = 'Are you sure you want to delete this todo?';

  /**
   * Shows a confirmation dialog with a custom message.
   * @param message - The confirmation message to display
   * @returns Promise resolving to true if user confirms, false if cancelled or error occurs
   */
  async confirmDelete(message?: string): Promise<boolean> {
    try {
      // Check for browser environment
      if (typeof window === 'undefined' || typeof window.confirm !== 'function') {
        return false;
      }

      // Use custom message or default
      const confirmMessage = this.getValidMessage(message, this.DEFAULT_DELETE_MESSAGE);
      
      // Show confirmation dialog
      const result = window.confirm(confirmMessage);
      
      // Ensure boolean result (handle null/undefined)
      return Boolean(result);
    } catch (error) {
      // Log error in development, return false for safety
      if (typeof console !== 'undefined' && console.warn) {
        console.warn('Confirmation dialog failed:', error);
      }
      return false;
    }
  }

  /**
   * Shows a confirmation dialog specifically for todo deletion.
   * @param todoTitle - The title of the todo being deleted (optional)
   * @returns Promise resolving to true if user confirms, false if cancelled or error occurs
   */
  async confirmDeleteTodo(todoTitle?: string): Promise<boolean> {
    try {
      // Check for browser environment
      if (typeof window === 'undefined' || typeof window.confirm !== 'function') {
        return false;
      }

      // Create todo-specific message
      const confirmMessage = this.createTodoDeleteMessage(todoTitle);
      
      // Show confirmation dialog
      const result = window.confirm(confirmMessage);
      
      // Ensure boolean result (handle null/undefined)
      return Boolean(result);
    } catch (error) {
      // Log error in development, return false for safety
      if (typeof console !== 'undefined' && console.warn) {
        console.warn('Todo confirmation dialog failed:', error);
      }
      return false;
    }
  }

  /**
   * Creates a confirmation message for todo deletion.
   * @param todoTitle - The title of the todo being deleted
   * @returns Formatted confirmation message
   */
  private createTodoDeleteMessage(todoTitle?: string): string {
    if (!todoTitle || typeof todoTitle !== 'string' || todoTitle.trim().length === 0) {
      return this.DEFAULT_TODO_DELETE_MESSAGE;
    }

    const trimmedTitle = todoTitle.trim();
    return `Are you sure you want to delete "${trimmedTitle}"?`;
  }

  /**
   * Gets a valid confirmation message, falling back to default if invalid.
   * @param message - The proposed message
   * @param defaultMessage - The default message to use
   * @returns Valid confirmation message
   */
  private getValidMessage(message?: string, defaultMessage: string = this.DEFAULT_DELETE_MESSAGE): string {
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return defaultMessage;
    }
    return message;
  }
}