/**
 * @fileoverview Interface for confirmation service managing user confirmation dialogs
 * @description Defines the contract for a service that provides user confirmation
 * functionality with support for both synchronous and asynchronous confirmations.
 * This interface enables proper testing and separation of concerns by abstracting
 * confirmation logic from business operations.
 */

/**
 * Confirmation dialog options for customizable confirmation behavior.
 * @description Allows customization of confirmation dialog appearance and behavior
 * for different contexts and user experience requirements.
 */
export interface ConfirmationOptions {
  /** Title of the confirmation dialog */
  title?: string;

  /** Main confirmation message */
  message: string;

  /** Text for the confirm button (default: 'OK' or 'Yes') */
  confirmText?: string;

  /** Text for the cancel button (default: 'Cancel' or 'No') */
  cancelText?: string;

  /** Whether the action is dangerous/destructive (affects styling) */
  dangerous?: boolean;

  /** Icon to display in the confirmation dialog */
  icon?: 'warning' | 'question' | 'info' | 'error';

  /** Whether to show a checkbox for "Don't ask again" functionality */
  showDontAskAgain?: boolean;

  /** Additional context information for the confirmation */
  context?: Record<string, unknown>;

  /** Timeout in milliseconds after which the dialog auto-cancels */
  timeout?: number;
}

/**
 * Confirmation result with detailed information about user choice.
 * @description Provides structured results for confirmation operations with
 * additional context about the user's decision and interaction.
 */
export interface ConfirmationResult {
  /** Whether the user confirmed the action */
  confirmed: boolean;

  /** Whether the user selected "Don't ask again" option */
  dontAskAgain?: boolean;

  /** Whether the confirmation was cancelled due to timeout */
  timedOut?: boolean;

  /** Additional context from the confirmation process */
  context?: Record<string, unknown>;

  /** Timestamp when the confirmation was made */
  timestamp: Date;
}

/**
 * Interface for confirmation service providing user confirmation functionality.
 * @description Defines the contract for managing user confirmations with support
 * for both simple browser-based confirmations and advanced modal-based confirmations.
 * Implementations should provide consistent confirmation behavior across the application
 * while enabling proper testing through abstraction.
 * 
 * **Key Features:**
 * - Support for both synchronous and asynchronous confirmations
 * - Customizable confirmation dialog options
 * - Structured confirmation results with context
 * - Testable interface for easy mocking
 * - Framework-independent design
 * 
 * **Implementation Requirements:**
 * - Must provide fallback to browser confirm() for simple cases
 * - Should support advanced modal confirmations for better UX
 * - Must be easily mockable for testing
 * - Should handle edge cases gracefully (closed dialogs, timeouts)
 * - Must provide consistent API across different confirmation types
 * 
 * @example
 * ```typescript
 * // Service usage example
 * class TodoService {
 *   constructor(private confirmation: IConfirmationService) {}
 *   
 *   async deleteTodo(id: string) {
 *     // Simple confirmation
 *     const confirmed = this.confirmation.confirm('Are you sure you want to delete this todo?');
 *     if (!confirmed) return false;
 *     
 *     // Advanced confirmation with options
 *     const result = await this.confirmation.confirmAsync({
 *       title: 'Delete Todo',
 *       message: 'This action cannot be undone. Are you sure?',
 *       dangerous: true,
 *       confirmText: 'Delete',
 *       cancelText: 'Keep'
 *     });
 *     
 *     if (result.confirmed) {
 *       await this.performDelete(id);
 *       
 *       if (result.dontAskAgain) {
 *         this.setPreference('skipDeleteConfirmation', true);
 *       }
 *     }
 *     
 *     return result.confirmed;
 *   }
 * }
 * 
 * // Testing example
 * describe('TodoService', () => {
 *   let mockConfirmation: jasmine.SpyObj<IConfirmationService>;
 *   
 *   beforeEach(() => {
 *     mockConfirmation = jasmine.createSpyObj('IConfirmationService', ['confirm', 'confirmAsync']);
 *   });
 *   
 *   it('should delete todo when confirmed', async () => {
 *     mockConfirmation.confirm.and.returnValue(true);
 *     
 *     const result = await service.deleteTodo('123');
 *     
 *     expect(mockConfirmation.confirm).toHaveBeenCalledWith('Are you sure you want to delete this todo?');
 *     expect(result).toBe(true);
 *   });
 * });
 * ```
 */
export interface IConfirmationService {
  /**
   * Displays a simple confirmation dialog with yes/no options.
   * @description Shows a basic confirmation dialog using browser confirm() or equivalent.
   * This is the simplest form of confirmation suitable for basic yes/no decisions.
   * @param message - The confirmation message to display to the user
   * @returns True if user confirms, false if user cancels
   */
  confirm(message: string): boolean;

  /**
   * Displays an advanced confirmation dialog with custom options.
   * @description Shows a customizable confirmation dialog with advanced options like
   * custom button text, icons, and additional functionality. Returns a Promise for
   * asynchronous handling and better user experience.
   * @param options - Configuration options for the confirmation dialog
   * @returns Promise resolving to detailed confirmation result
   */
  confirmAsync(options: ConfirmationOptions): Promise<ConfirmationResult>;

  /**
   * Displays a confirmation dialog for dangerous/destructive actions.
   * @description Shows a confirmation dialog specifically styled and configured for
   * dangerous actions like deletions. Provides additional safety measures and clear
   * visual indicators of the destructive nature of the action.
   * @param message - The confirmation message to display
   * @param actionName - Name of the destructive action (e.g., 'Delete', 'Remove')
   * @returns Promise resolving to confirmation result with safety context
   */
  confirmDangerous(message: string, actionName?: string): Promise<ConfirmationResult>;

  /**
   * Displays a confirmation dialog with custom button text.
   * @description Shows a confirmation dialog with customizable button text for
   * better user experience and clearer action indication.
   * @param message - The confirmation message to display
   * @param confirmText - Text for the confirm button
   * @param cancelText - Text for the cancel button
   * @returns Promise resolving to confirmation result
   */
  confirmWithButtons(message: string, confirmText: string, cancelText: string): Promise<ConfirmationResult>;

  /**
   * Checks if a confirmation preference is set to skip certain confirmations.
   * @description Checks user preferences to determine if certain confirmations
   * should be skipped based on previous "Don't ask again" selections.
   * @param key - The preference key to check
   * @returns True if confirmations should be skipped, false otherwise
   */
  shouldSkipConfirmation(key: string): boolean;

  /**
   * Sets a confirmation preference to skip certain confirmations.
   * @description Sets user preferences to skip certain confirmations based on
   * "Don't ask again" selections. Useful for improving user experience.
   * @param key - The preference key to set
   * @param skip - Whether to skip confirmations for this key
   */
  setConfirmationPreference(key: string, skip: boolean): void;

  /**
   * Clears all confirmation preferences.
   * @description Resets all "Don't ask again" preferences to default state.
   * Useful for user preference management or debugging.
   */
  clearConfirmationPreferences(): void;

  /**
   * Gets the current confirmation implementation type.
   * @description Returns information about the current confirmation implementation
   * (browser, modal, custom) for debugging or conditional behavior.
   * @returns String indicating the confirmation implementation type
   */
  getImplementationType(): 'browser' | 'modal' | 'custom';

  /**
   * Sets the default confirmation options for all confirmations.
   * @description Configures default options that will be applied to all confirmations
   * unless explicitly overridden. Useful for consistent styling and behavior.
   * @param defaults - Default confirmation options to apply
   */
  setDefaultOptions(defaults: Partial<ConfirmationOptions>): void;

  /**
   * Gets the current default confirmation options.
   * @description Returns the current default options being applied to confirmations.
   * Useful for configuration management and debugging.
   * @returns Current default confirmation options
   */
  getDefaultOptions(): Partial<ConfirmationOptions>;
}