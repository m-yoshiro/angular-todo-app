/**
 * @fileoverview Service for validating todo creation and update requests.
 * @description Provides comprehensive validation logic for todo data to ensure data integrity
 * and proper error handling. Extracted from components to follow Single Responsibility Principle.
 */

import { Injectable } from '@angular/core';
import { CreateTodoRequest, ValidationResult } from '../models/todo.model';

/**
 * Service responsible for validating todo creation and update requests.
 * @description Implements business logic validation rules for todo data including
 * title requirements, priority validation, description limits, due date validation,
 * and tag constraints. Provides structured validation results with detailed error messages.
 */
@Injectable({
  providedIn: 'root'
})
export class ValidationService {
  
  /** Maximum allowed title length */
  private readonly MAX_TITLE_LENGTH = 255;
  
  /** Maximum allowed description length */
  private readonly MAX_DESCRIPTION_LENGTH = 1000;
  
  /** Maximum allowed tag length */
  private readonly MAX_TAG_LENGTH = 30;
  
  /** Maximum number of tags allowed */
  private readonly MAX_TAGS_COUNT = 10;
  
  /** Valid priority values */
  private readonly VALID_PRIORITIES = ['low', 'medium', 'high'] as const;

  /**
   * Validates a todo creation request.
   * @param request - The todo creation request to validate
   * @returns ValidationResult containing validation status and any error messages
   */
  validateCreateRequest(request: CreateTodoRequest): ValidationResult {
    const errors: string[] = [];

    // Check for null/undefined request
    if (request === null || request === undefined) {
      return {
        isValid: false,
        errors: ['Request cannot be null or undefined']
      };
    }

    // Validate title
    this.validateTitle(request.title, errors);

    // Validate priority
    this.validatePriority(request.priority, errors);

    // Validate description (if provided)
    if (request.description !== undefined) {
      this.validateDescription(request.description, errors);
    }

    // Validate due date (if provided)
    if (request.dueDate !== undefined) {
      this.validateDueDate(request.dueDate, errors);
    }

    // Validate tags (if provided)
    if (request.tags !== undefined) {
      this.validateTags(request.tags, errors);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validates the title field.
   * @param title - The title to validate
   * @param errors - Array to collect validation errors
   */
  private validateTitle(title: string, errors: string[]): void {
    if (title === null || title === undefined || typeof title !== 'string') {
      errors.push('Title is required');
      return;
    }

    const trimmedTitle = title.trim();
    if (trimmedTitle.length === 0) {
      errors.push('Title is required');
      return;
    }

    if (trimmedTitle.length > this.MAX_TITLE_LENGTH) {
      errors.push(`Title must be less than ${this.MAX_TITLE_LENGTH} characters`);
    }
  }

  /**
   * Validates the priority field.
   * @param priority - The priority to validate
   * @param errors - Array to collect validation errors
   */
  private validatePriority(priority: string | undefined, errors: string[]): void {
    if (priority === null || priority === undefined) {
      errors.push('Priority is required');
      return;
    }

    if (!this.VALID_PRIORITIES.includes(priority as any)) {
      errors.push('Priority must be low, medium, or high');
    }
  }

  /**
   * Validates the description field.
   * @param description - The description to validate
   * @param errors - Array to collect validation errors
   */
  private validateDescription(description: string, errors: string[]): void {
    if (description && description.length > this.MAX_DESCRIPTION_LENGTH) {
      errors.push(`Description must be less than ${this.MAX_DESCRIPTION_LENGTH} characters`);
    }
  }

  /**
   * Validates the due date field.
   * @param dueDate - The due date to validate
   * @param errors - Array to collect validation errors
   */
  private validateDueDate(dueDate: Date, errors: string[]): void {
    if (!(dueDate instanceof Date) || isNaN(dueDate.getTime())) {
      errors.push('Due date must be a valid date');
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today

    const dueDateStartOfDay = new Date(dueDate);
    dueDateStartOfDay.setHours(0, 0, 0, 0); // Start of due date

    if (dueDateStartOfDay < today) {
      errors.push('Due date cannot be in the past');
    }
  }

  /**
   * Validates the tags array.
   * @param tags - The tags array to validate
   * @param errors - Array to collect validation errors
   */
  private validateTags(tags: string[], errors: string[]): void {
    if (!Array.isArray(tags)) {
      errors.push('Tags must be an array');
      return;
    }

    if (tags.length > this.MAX_TAGS_COUNT) {
      errors.push(`Maximum ${this.MAX_TAGS_COUNT} tags allowed`);
    }

    // Check for empty tags
    const hasEmptyTag = tags.some(tag => !tag || tag.trim().length === 0);
    if (hasEmptyTag) {
      errors.push('Tags cannot be empty');
    }

    // Check tag length
    const hasLongTag = tags.some(tag => tag && tag.length > this.MAX_TAG_LENGTH);
    if (hasLongTag) {
      errors.push(`Tag length must be less than ${this.MAX_TAG_LENGTH} characters`);
    }
  }
}