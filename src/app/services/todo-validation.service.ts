/**
 * @fileoverview Todo validation service implementation
 * @description Implements comprehensive validation for todo operations with Angular form integration
 */

import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { CreateTodoRequest, UpdateTodoRequest } from '../models/todo.model';
import {
  ITodoValidationService,
  ValidationResult,
  ValidationConfig,
  ValidationLimits,
  ValidationError
} from './interfaces/validation';
import { DEFAULT_VALIDATION_LIMITS, VALIDATION_MESSAGES } from '../constants/validation-constants';

/**
 * Todo validation service implementing comprehensive validation interfaces.
 * Provides both programmatic validation and Angular ValidatorFn integration.
 */
@Injectable({ providedIn: 'root' })
export class TodoValidationService implements ITodoValidationService {
  private validationLimits: ValidationLimits = { ...DEFAULT_VALIDATION_LIMITS };
  private validationStats = {
    totalValidations: 0,
    successfulValidations: 0,
    failedValidations: 0,
    validationTimes: [] as number[],
    errorCounts: {} as Record<string, number>
  };

  // ======================== Basic Validation Interface ========================

  validateCreateRequest(request: CreateTodoRequest, config?: ValidationConfig): ValidationResult {
    const startTime = performance.now();
    this.validationStats.totalValidations++;

    try {
      if (!request) {
        return this.createErrorResult('REQUEST_REQUIRED', VALIDATION_MESSAGES.REQUEST.REQUIRED);
      }

      const errors: ValidationError[] = [];
      const stopOnFirst = config?.stopOnFirstError ?? false;

      // Validate title
      const titleResult = this.validateTodoTitle(request.title, config);
      if (!titleResult.valid && titleResult.errors) {
        errors.push(...titleResult.errors);
        if (stopOnFirst) return titleResult;
      }

      // Validate description if provided
      if (request.description !== undefined) {
        const descResult = this.validateTodoDescription(request.description, config);
        if (!descResult.valid && descResult.errors) {
          errors.push(...descResult.errors);
          if (stopOnFirst) return descResult;
        }
      }

      // Validate priority if provided
      if (request.priority !== undefined) {
        const priorityResult = this.validateTodoPriority(request.priority, config);
        if (!priorityResult.valid && priorityResult.errors) {
          errors.push(...priorityResult.errors);
          if (stopOnFirst) return priorityResult;
        }
      }

      // Validate due date if provided
      if (request.dueDate !== undefined) {
        const dueDateResult = this.validateTodoDueDate(request.dueDate, config);
        if (!dueDateResult.valid && dueDateResult.errors) {
          errors.push(...dueDateResult.errors);
          if (stopOnFirst) return dueDateResult;
        }
      }

      // Validate tags if provided
      if (request.tags !== undefined) {
        const tagsResult = this.validateTodoTags(request.tags, config);
        if (!tagsResult.valid && tagsResult.errors) {
          errors.push(...tagsResult.errors);
          if (stopOnFirst) return tagsResult;
        }
      }

      const result = this.createValidationResult(errors);
      if (result.valid) {
        this.validationStats.successfulValidations++;
      } else {
        this.validationStats.failedValidations++;
        this.updateErrorStats(errors);
      }

      return result;
    } finally {
      const endTime = performance.now();
      this.validationStats.validationTimes.push(endTime - startTime);
    }
  }

  validateUpdateRequest(request: UpdateTodoRequest, config?: ValidationConfig): ValidationResult {
    const errors: ValidationError[] = [];
    const stopOnFirst = config?.stopOnFirstError ?? false;

    // Only validate provided fields for update requests
    if (request.title !== undefined) {
      const titleResult = this.validateTodoTitle(request.title, config);
      if (!titleResult.valid && titleResult.errors) {
        errors.push(...titleResult.errors);
        if (stopOnFirst) return titleResult;
      }
    }

    if (request.description !== undefined) {
      const descResult = this.validateTodoDescription(request.description, config);
      if (!descResult.valid && descResult.errors) {
        errors.push(...descResult.errors);
        if (stopOnFirst) return descResult;
      }
    }

    if (request.priority !== undefined) {
      const priorityResult = this.validateTodoPriority(request.priority, config);
      if (!priorityResult.valid && priorityResult.errors) {
        errors.push(...priorityResult.errors);
        if (stopOnFirst) return priorityResult;
      }
    }

    if (request.dueDate !== undefined) {
      const dueDateResult = this.validateTodoDueDate(request.dueDate, config);
      if (!dueDateResult.valid && dueDateResult.errors) {
        errors.push(...dueDateResult.errors);
        if (stopOnFirst) return dueDateResult;
      }
    }

    if (request.tags !== undefined) {
      const tagsResult = this.validateTodoTags(request.tags, config);
      if (!tagsResult.valid && tagsResult.errors) {
        errors.push(...tagsResult.errors);
        if (stopOnFirst) return tagsResult;
      }
    }

    return this.createValidationResult(errors);
  }

  validateBatchCreateRequests(requests: CreateTodoRequest[], config?: ValidationConfig): ValidationResult[] {
    return requests.map(request => this.validateCreateRequest(request, config));
  }

  isValidRequest(request: CreateTodoRequest | UpdateTodoRequest): boolean {
    // Check if it's a CreateTodoRequest (title is required) vs UpdateTodoRequest (title is optional)
    const isCreateRequest = 'title' in request && typeof request.title === 'string';
    const result = isCreateRequest ? 
      this.validateCreateRequest(request as CreateTodoRequest) : 
      this.validateUpdateRequest(request as UpdateTodoRequest);
    return result.valid;
  }

  // ======================== Field Validation Interface ========================

  validateTodoTitle(title: string, config?: ValidationConfig): ValidationResult {
    const errors: ValidationError[] = [];
    const limits = this.getEffectiveLimits(config);

    if (!title || !title.trim()) {
      errors.push({
        field: 'title',
        message: VALIDATION_MESSAGES.TITLE.REQUIRED,
        code: 'TITLE_REQUIRED',
        severity: 'error',
        value: title
      });
    } else if (title.trim().length > limits.title.maxLength) {
      errors.push({
        field: 'title',
        message: VALIDATION_MESSAGES.TITLE.MAX_LENGTH,
        code: 'TITLE_MAX_LENGTH',
        severity: 'error',
        value: title,
        context: { 
          maxLength: limits.title.maxLength, 
          actualLength: title.length 
        }
      });
    }

    return this.createValidationResult(errors);
  }

  validateTodoDescription(description?: string, config?: ValidationConfig): ValidationResult {
    const errors: ValidationError[] = [];
    const limits = this.getEffectiveLimits(config);

    if (description && description.length > limits.description.maxLength) {
      errors.push({
        field: 'description',
        message: VALIDATION_MESSAGES.DESCRIPTION.MAX_LENGTH,
        code: 'DESCRIPTION_MAX_LENGTH',
        severity: 'error',
        value: description,
        context: { 
          maxLength: limits.description.maxLength, 
          actualLength: description.length 
        }
      });
    }

    return this.createValidationResult(errors);
  }

  validateTodoPriority(priority: string, config?: ValidationConfig): ValidationResult {
    const errors: ValidationError[] = [];
    const limits = this.getEffectiveLimits(config);

    if (!limits.priority.allowedValues.includes(priority)) {
      errors.push({
        field: 'priority',
        message: VALIDATION_MESSAGES.PRIORITY.INVALID,
        code: 'PRIORITY_INVALID',
        severity: 'error',
        value: priority,
        expectedValues: limits.priority.allowedValues
      });
    }

    return this.createValidationResult(errors);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validateTodoDueDate(dueDate?: Date, config?: ValidationConfig): ValidationResult {
    const errors: ValidationError[] = [];

    if (dueDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const inputDate = new Date(dueDate);
      inputDate.setHours(0, 0, 0, 0);

      if (inputDate < today) {
        errors.push({
          field: 'dueDate',
          message: VALIDATION_MESSAGES.DATE.PAST_DATE,
          code: 'DUE_DATE_PAST',
          severity: 'error',
          value: dueDate
        });
      }
    }

    return this.createValidationResult(errors);
  }

  validateTodoTags(tags?: string[], config?: ValidationConfig): ValidationResult {
    const errors: ValidationError[] = [];
    const limits = this.getEffectiveLimits(config);

    if (tags) {
      // Check tag count
      if (tags.length > limits.tag.maxCount) {
        errors.push({
          field: 'tags',
          message: VALIDATION_MESSAGES.TAG.MAX_COUNT,
          code: 'TAGS_MAX_COUNT',
          severity: 'error',
          value: tags,
          context: { 
            maxCount: limits.tag.maxCount, 
            actualCount: tags.length 
          }
        });
      }

      // Check individual tags
      for (let i = 0; i < tags.length; i++) {
        const tag = tags[i];
        
        if (!tag.trim()) {
          errors.push({
            field: `tags[${i}]`,
            message: VALIDATION_MESSAGES.TAG.EMPTY,
            code: 'TAG_EMPTY',
            severity: 'error',
            value: tag
          });
        } else if (tag.length > limits.tag.maxLength) {
          errors.push({
            field: `tags[${i}]`,
            message: VALIDATION_MESSAGES.TAG.MAX_LENGTH,
            code: 'TAG_MAX_LENGTH',
            severity: 'error',
            value: tag,
            context: { 
              maxLength: limits.tag.maxLength, 
              actualLength: tag.length 
            }
          });
        }
      }

      // Check for duplicates
      const uniqueTags = new Set(tags);
      if (uniqueTags.size !== tags.length) {
        errors.push({
          field: 'tags',
          message: VALIDATION_MESSAGES.TAG.DUPLICATE,
          code: 'TAG_DUPLICATE',
          severity: 'error',
          value: tags
        });
      }
    }

    return this.createValidationResult(errors);
  }

  validateFields(fields: Record<string, unknown>, config?: ValidationConfig): ValidationResult {
    const errors: ValidationError[] = [];

    for (const [fieldName, value] of Object.entries(fields)) {
      const fieldResult = this.validateField(fieldName, value, config);
      if (!fieldResult.valid && fieldResult.errors) {
        errors.push(...fieldResult.errors);
      }
    }

    return this.createValidationResult(errors);
  }

  validateField(fieldName: string, value: unknown, config?: ValidationConfig): ValidationResult {
    switch (fieldName) {
      case 'title':
        return this.validateTodoTitle(value as string, config);
      case 'description':
        return this.validateTodoDescription(value as string, config);
      case 'priority':
        return this.validateTodoPriority(value as string, config);
      case 'dueDate':
        return this.validateTodoDueDate(value as Date, config);
      case 'tags':
        return this.validateTodoTags(value as string[], config);
      default:
        return { valid: true };
    }
  }

  // ======================== Business Rules Interface ========================

  validateBusinessRules(request: CreateTodoRequest | UpdateTodoRequest, config?: ValidationConfig): ValidationResult {
    // For now, implement basic business rules - can be enhanced later
    const errors: ValidationError[] = [];

    // Cross-field validation
    const crossFieldResult = this.validateCrossFieldRules(request, config);
    if (!crossFieldResult.valid && crossFieldResult.errors) {
      errors.push(...crossFieldResult.errors);
    }

    return this.createValidationResult(errors);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validateDueDateBusinessRules(dueDate?: Date, priority?: string, config?: ValidationConfig): ValidationResult {
    // Basic business rule: high priority items should have due dates
    const errors: ValidationError[] = [];

    if (priority === 'high' && !dueDate) {
      errors.push({
        field: 'dueDate',
        message: 'High priority todos should have a due date',
        code: 'HIGH_PRIORITY_NEEDS_DUE_DATE',
        severity: 'warning'
      });
    }

    return this.createValidationResult(errors);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validateTagBusinessRules(tags?: string[], config?: ValidationConfig): ValidationResult {
    // Basic tag business rules - can be enhanced
    return { valid: true };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validatePriorityBusinessRules(priority: string, dueDate?: Date, tags?: string[], config?: ValidationConfig): ValidationResult {
    // Basic priority business rules - can be enhanced  
    return { valid: true };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validateCrossFieldRules(request: CreateTodoRequest | UpdateTodoRequest, config?: ValidationConfig): ValidationResult {
    // Basic cross-field validation - can be enhanced
    return { valid: true };
  }

  validateBatchBusinessRules(requests: (CreateTodoRequest | UpdateTodoRequest)[], config?: ValidationConfig): ValidationResult[] {
    return requests.map(request => this.validateBusinessRules(request, config));
  }

  // ======================== Angular ValidatorFn Integration ========================

  /**
   * Creates an Angular ValidatorFn for title validation
   */
  titleValidator(config?: ValidationConfig): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const result = this.validateTodoTitle(control.value, config);
      return this.convertToAngularErrors(result);
    };
  }

  /**
   * Creates an Angular ValidatorFn for description validation
   */
  descriptionValidator(config?: ValidationConfig): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const result = this.validateTodoDescription(control.value, config);
      return this.convertToAngularErrors(result);
    };
  }

  /**
   * Creates an Angular ValidatorFn for priority validation
   */
  priorityValidator(config?: ValidationConfig): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const result = this.validateTodoPriority(control.value, config);
      return this.convertToAngularErrors(result);
    };
  }

  /**
   * Creates an Angular ValidatorFn for due date validation
   */
  dueDateValidator(config?: ValidationConfig): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const result = this.validateTodoDueDate(control.value, config);
      return this.convertToAngularErrors(result);
    };
  }

  /**
   * Creates an Angular ValidatorFn for tags validation
   */
  tagsValidator(config?: ValidationConfig): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const result = this.validateTodoTags(control.value, config);
      return this.convertToAngularErrors(result);
    };
  }

  /**
   * Validates a new tag against existing tags
   */
  validateNewTag(newTag: string, existingTags: string[]): ValidationResult {
    const errors: ValidationError[] = [];
    const limits = this.validationLimits;

    if (!newTag.trim()) {
      errors.push({
        field: 'newTag',
        message: VALIDATION_MESSAGES.TAG.EMPTY,
        code: 'TAG_EMPTY',
        severity: 'error',
        value: newTag
      });
    } else if (newTag.length > limits.tag.maxLength) {
      errors.push({
        field: 'newTag',
        message: VALIDATION_MESSAGES.TAG.MAX_LENGTH,
        code: 'TAG_MAX_LENGTH',
        severity: 'error',
        value: newTag,
        context: { 
          maxLength: limits.tag.maxLength, 
          actualLength: newTag.length 
        }
      });
    }

    if (existingTags.length >= limits.tag.maxCount) {
      errors.push({
        field: 'tags',
        message: VALIDATION_MESSAGES.TAG.MAX_COUNT,
        code: 'TAGS_MAX_COUNT',
        severity: 'error',
        value: existingTags,
        context: { 
          maxCount: limits.tag.maxCount, 
          actualCount: existingTags.length 
        }
      });
    }

    // Check for duplicates (case insensitive to match original behavior)
    const isDuplicate = existingTags.some(tag => 
      tag.toLowerCase() === newTag.toLowerCase()
    );
    
    if (isDuplicate) {
      errors.push({
        field: 'newTag',
        message: VALIDATION_MESSAGES.TAG.DUPLICATE,
        code: 'TAG_DUPLICATE',
        severity: 'error',
        value: newTag
      });
    }

    return this.createValidationResult(errors);
  }

  // ======================== Validation Utilities Interface ========================

  getValidationLimits(): ValidationLimits {
    return { ...this.validationLimits };
  }

  updateValidationLimits(limits: Partial<ValidationLimits>): ValidationLimits {
    this.validationLimits = { ...this.validationLimits, ...limits };
    return this.getValidationLimits();
  }

  resetValidationLimits(): ValidationLimits {
    this.validationLimits = { ...DEFAULT_VALIDATION_LIMITS };
    return this.getValidationLimits();
  }

  createValidationConfig(overrides?: Partial<ValidationConfig>): ValidationConfig {
    const defaultConfig: ValidationConfig = {
      strict: false,
      stopOnFirstError: false,
      includeWarnings: false,
      skipFields: []
    };

    return { ...defaultConfig, ...overrides };
  }

  getDefaultValidationConfig(): ValidationConfig {
    return this.createValidationConfig();
  }

  isValidValidationConfig(config: ValidationConfig): boolean {
    return typeof config === 'object' && config !== null;
  }

  mergeValidationConfigs(configs: Partial<ValidationConfig>[]): ValidationConfig {
    return configs.reduce(
      (merged, config) => ({ ...merged, ...config }),
      this.getDefaultValidationConfig()
    );
  }

  getValidationStatistics() {
    const totalTime = this.validationStats.validationTimes.reduce((sum, time) => sum + time, 0);
    const averageTime = this.validationStats.validationTimes.length > 0 ? 
      totalTime / this.validationStats.validationTimes.length : 0;

    return {
      totalValidations: this.validationStats.totalValidations,
      successfulValidations: this.validationStats.successfulValidations,
      failedValidations: this.validationStats.failedValidations,
      averageValidationTime: averageTime,
      mostCommonErrors: { ...this.validationStats.errorCounts }
    };
  }

  // ======================== Private Helper Methods ========================

  private createErrorResult(code: string, message: string): ValidationResult {
    return {
      valid: false,
      error: message,
      code,
      severity: 'error',
      errors: [{
        field: 'request',
        message,
        code,
        severity: 'error'
      }]
    };
  }

  private createValidationResult(errors: ValidationError[]): ValidationResult {
    // Only consider actual errors, not warnings, for validity
    const actualErrors = errors.filter(error => error.severity === 'error');
    const warnings = errors.filter(error => error.severity === 'warning');
    const valid = actualErrors.length === 0;
    
    if (valid) {
      return { 
        valid: true,
        warnings: warnings.length > 0 ? warnings.map(w => ({
          field: w.field,
          message: w.message,
          code: w.code,
          suggestion: 'Consider adding a due date for better task management'
        })) : undefined
      };
    }

    const fieldErrors: Record<string, string> = {};
    actualErrors.forEach(error => {
      fieldErrors[error.field] = error.message;
    });

    return {
      valid: false,
      error: actualErrors[0]?.message,
      code: actualErrors[0]?.code,
      severity: actualErrors[0]?.severity,
      errors: actualErrors,
      fieldErrors,
      warnings: warnings.length > 0 ? warnings.map(w => ({
        field: w.field,
        message: w.message,
        code: w.code,
        suggestion: 'Consider adding a due date for better task management'
      })) : undefined
    };
  }

  private convertToAngularErrors(result: ValidationResult): ValidationErrors | null {
    if (result.valid) {
      return null;
    }

    const angularErrors: ValidationErrors = {};
    
    if (result.errors) {
      result.errors.forEach(error => {
        // Map error codes to Angular form error keys that match template expectations
        let errorKey = error.code.toLowerCase();
        
        // Map specific codes to expected Angular error keys
        switch (error.code) {
          case 'DUE_DATE_PAST':
            errorKey = 'pastDate';
            break;
          case 'TITLE_REQUIRED':
            errorKey = 'required';
            break;
          case 'TITLE_MAX_LENGTH':
            errorKey = 'maxlength';
            break;
          case 'DESCRIPTION_MAX_LENGTH':
            errorKey = 'maxlength';
            break;
        }
        
        angularErrors[errorKey] = {
          message: error.message,
          value: error.value,
          ...error.context
        };
      });
    }

    return angularErrors;
  }

  private getEffectiveLimits(config?: ValidationConfig): ValidationLimits {
    if (!config?.customLimits) {
      return this.validationLimits;
    }

    return {
      title: {
        minLength: this.validationLimits.title.minLength,
        maxLength: config.customLimits.titleMaxLength ?? this.validationLimits.title.maxLength
      },
      description: {
        maxLength: config.customLimits.descriptionMaxLength ?? this.validationLimits.description.maxLength
      },
      tag: {
        maxLength: config.customLimits.tagMaxLength ?? this.validationLimits.tag.maxLength,
        maxCount: config.customLimits.tagMaxCount ?? this.validationLimits.tag.maxCount
      },
      priority: this.validationLimits.priority
    };
  }

  private updateErrorStats(errors: ValidationError[]): void {
    errors.forEach(error => {
      this.validationStats.errorCounts[error.code] = 
        (this.validationStats.errorCounts[error.code] || 0) + 1;
    });
  }
}