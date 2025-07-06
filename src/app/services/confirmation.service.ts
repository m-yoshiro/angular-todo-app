/**
 * @fileoverview Service for handling user confirmation dialogs
 * @description Provides an abstraction layer over browser confirmation dialogs
 * to improve testability and maintainability. This service can be easily mocked
 * in tests and provides a consistent interface for user confirmations across
 * the application.
 */

import { Injectable } from '@angular/core';

/**
 * Service for handling user confirmation dialogs.
 * @description Abstracts browser confirmation dialogs behind a service interface
 * to enable proper testing and maintain separation of concerns. Components should
 * use this service instead of calling window.confirm() directly.
 */
@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {

  /**
   * Displays a confirmation dialog to the user.
   * @description Shows a browser confirmation dialog with the specified message
   * and returns the user's choice. This method wraps window.confirm() to provide
   * a testable interface.
   * @param message - The message to display in the confirmation dialog
   * @returns True if user confirms, false if user cancels
   */
  confirm(message: string): boolean {
    return window.confirm(message);
  }
}