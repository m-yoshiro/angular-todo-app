/**
 * @fileoverview Validation utilities interface for configuration and limits
 * @description Defines validation utility contracts for limits and configuration management.
 */

import { ValidationLimits, ValidationConfig } from './validation-types';

/**
 * Interface for todo validation utilities and configuration.
 * @description Handles validation limits, configuration management, and utility operations.
 */
export interface ITodoValidationUtilities {
  /**
   * Gets current validation limits and constraints.
   * @returns Object containing all validation limits and constraints
   */
  getValidationLimits(): ValidationLimits;

  /**
   * Updates validation limits with new values.
   * @param limits - Partial limits to update
   * @returns Updated validation limits
   */
  updateValidationLimits(limits: Partial<ValidationLimits>): ValidationLimits;

  /**
   * Resets validation limits to default values.
   * @returns Default validation limits
   */
  resetValidationLimits(): ValidationLimits;

  /**
   * Creates a validation configuration with defaults and overrides.
   * @param overrides - Custom configuration overrides
   * @returns Complete validation configuration with defaults
   */
  createValidationConfig(overrides?: Partial<ValidationConfig>): ValidationConfig;

  /**
   * Gets the default validation configuration.
   * @returns Default validation configuration
   */
  getDefaultValidationConfig(): ValidationConfig;

  /**
   * Validates a validation configuration for correctness.
   * @param config - Configuration to validate
   * @returns True if configuration is valid, false otherwise
   */
  isValidValidationConfig(config: ValidationConfig): boolean;

  /**
   * Merges multiple validation configurations.
   * @param configs - Array of configurations to merge
   * @returns Merged validation configuration
   */
  mergeValidationConfigs(configs: Partial<ValidationConfig>[]): ValidationConfig;

  /**
   * Gets validation statistics and metrics.
   * @returns Object containing validation usage statistics
   */
  getValidationStatistics(): {
    totalValidations: number;
    successfulValidations: number;
    failedValidations: number;
    averageValidationTime: number;
    mostCommonErrors: Record<string, number>;
  };
}