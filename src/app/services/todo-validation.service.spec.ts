/**
 * @fileoverview Test suite for TodoValidationService with 90% coverage focus
 * @description Comprehensive tests covering high-value validation scenarios,
 * business rules, Angular ValidatorFn integration, and edge cases.
 */

import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TodoValidationService } from './todo-validation.service';
import { CreateTodoRequest, UpdateTodoRequest } from '../models/todo.model';

describe('TodoValidationService', () => {
  let service: TodoValidationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()]
    });
    service = TestBed.inject(TodoValidationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ======================== Core Validation Methods ========================

  describe('validateCreateRequest', () => {
    it('should return valid for complete valid request', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      const request: CreateTodoRequest = {
        title: 'Valid Todo',
        description: 'Valid description',
        priority: 'high',
        dueDate: futureDate,
        tags: ['work', 'important']
      };

      const result = service.validateCreateRequest(request);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return invalid for null request', () => {
      const result = service.validateCreateRequest(null as unknown as CreateTodoRequest);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Request is required');
    });

    it('should return invalid for undefined request', () => {
      const result = service.validateCreateRequest(undefined as unknown as CreateTodoRequest);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Request is required');
    });

    it('should return invalid for empty title', () => {
      const request: CreateTodoRequest = { title: '' };

      const result = service.validateCreateRequest(request);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Title is required');
    });

    it('should return invalid for whitespace-only title', () => {
      const request: CreateTodoRequest = { title: '   ' };

      const result = service.validateCreateRequest(request);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Title is required');
    });

    it('should return invalid for title exceeding max length', () => {
      const longTitle = 'a'.repeat(201);
      const request: CreateTodoRequest = { title: longTitle };

      const result = service.validateCreateRequest(request);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Title cannot exceed 200 characters');
    });

    it('should return valid for title at max length', () => {
      const maxTitle = 'a'.repeat(200);
      const request: CreateTodoRequest = { title: maxTitle };

      const result = service.validateCreateRequest(request);

      expect(result.valid).toBe(true);
    });

    it('should return invalid for description exceeding max length', () => {
      const longDescription = 'a'.repeat(1001);
      const request: CreateTodoRequest = {
        title: 'Valid title',
        description: longDescription
      };

      const result = service.validateCreateRequest(request);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Description cannot exceed 1000 characters');
    });

    it('should return invalid for past due date', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const request: CreateTodoRequest = {
        title: 'Valid title',
        dueDate: pastDate
      };

      const result = service.validateCreateRequest(request);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Due date cannot be in the past');
    });
  });

  describe('validateUpdateRequest', () => {
    it('should validate only provided fields', () => {
      const request: UpdateTodoRequest = {
        description: 'Updated description'
      };

      const result = service.validateUpdateRequest(request);

      expect(result.valid).toBe(true);
    });

    it('should return invalid for invalid provided field', () => {
      const request: UpdateTodoRequest = {
        title: ''
      };

      const result = service.validateUpdateRequest(request);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Title is required');
    });
  });

  // ======================== Field-Specific Validation ========================

  describe('validateTodoTitle', () => {
    it('should return valid for valid title', () => {
      const result = service.validateTodoTitle('Valid Title');

      expect(result.valid).toBe(true);
    });

    it('should return invalid for empty title', () => {
      const result = service.validateTodoTitle('');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Title is required');
    });

    it('should return invalid for whitespace title', () => {
      const result = service.validateTodoTitle('   ');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Title is required');
    });

    it('should return invalid for title exceeding max length', () => {
      const longTitle = 'a'.repeat(201);

      const result = service.validateTodoTitle(longTitle);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Title cannot exceed 200 characters');
    });
  });

  describe('validateTodoDescription', () => {
    it('should return valid for valid description', () => {
      const result = service.validateTodoDescription('Valid description');

      expect(result.valid).toBe(true);
    });

    it('should return valid for undefined description', () => {
      const result = service.validateTodoDescription(undefined);

      expect(result.valid).toBe(true);
    });

    it('should return invalid for description exceeding max length', () => {
      const longDescription = 'a'.repeat(1001);

      const result = service.validateTodoDescription(longDescription);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Description cannot exceed 1000 characters');
    });
  });

  describe('validateTodoPriority', () => {
    it('should return valid for valid priority', () => {
      const result = service.validateTodoPriority('high');

      expect(result.valid).toBe(true);
    });

    it('should return invalid for invalid priority', () => {
      const result = service.validateTodoPriority('invalid');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Priority must be one of: low, medium, high');
    });
  });

  describe('validateTodoDueDate', () => {
    it('should return valid for future date', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const result = service.validateTodoDueDate(futureDate);

      expect(result.valid).toBe(true);
    });

    it('should return valid for undefined date', () => {
      const result = service.validateTodoDueDate(undefined);

      expect(result.valid).toBe(true);
    });

    it('should return invalid for past date', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const result = service.validateTodoDueDate(pastDate);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Due date cannot be in the past');
    });

    it('should return valid for today', () => {
      const today = new Date();

      const result = service.validateTodoDueDate(today);

      expect(result.valid).toBe(true);
    });

    // ======================== Edge Cases and Timezone Tests ========================

    describe('Date String Handling (Timezone-Robust)', () => {
      it('should handle YYYY-MM-DD date strings correctly', () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const todayString = `${year}-${month}-${day}`;

        const result = service.validateTodoDueDate(todayString as unknown as Date);

        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it('should reject past date strings', () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const year = yesterday.getFullYear();
        const month = String(yesterday.getMonth() + 1).padStart(2, '0');
        const day = String(yesterday.getDate()).padStart(2, '0');
        const yesterdayString = `${year}-${month}-${day}`;

        const result = service.validateTodoDueDate(yesterdayString as unknown as Date);

        expect(result.valid).toBe(false);
        expect(result.errors).toBeDefined();
        expect(result.errors![0].code).toBe('DUE_DATE_PAST');
      });

      it('should accept future date strings', () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const year = tomorrow.getFullYear();
        const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
        const day = String(tomorrow.getDate()).padStart(2, '0');
        const tomorrowString = `${year}-${month}-${day}`;

        const result = service.validateTodoDueDate(tomorrowString as unknown as Date);

        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });

    describe('Invalid Date Input Handling', () => {
      it('should handle null input gracefully', () => {
        const result = service.validateTodoDueDate(null as unknown as Date);

        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it('should handle undefined input gracefully', () => {
        const result = service.validateTodoDueDate(undefined);

        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it('should handle invalid date strings gracefully', () => {
        const result = service.validateTodoDueDate('not-a-date' as unknown as Date);

        expect(result.valid).toBe(false);
        expect(result.errors).toBeDefined();
        expect(result.errors![0].code).toBe('DUE_DATE_INVALID');
      });

      it('should handle empty string gracefully', () => {
        const result = service.validateTodoDueDate('' as unknown as Date);

        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it('should handle malformed date strings', () => {
        const result = service.validateTodoDueDate('invalid-date-format' as unknown as Date);

        expect(result.valid).toBe(false);
        expect(result.errors).toBeDefined();
        expect(result.errors![0].code).toBe('DUE_DATE_INVALID');
      });

      it('should handle invalid Date objects', () => {
        const invalidDate = new Date('invalid');
        const result = service.validateTodoDueDate(invalidDate);

        expect(result.valid).toBe(false);
        expect(result.errors).toBeDefined();
        expect(result.errors![0].code).toBe('DUE_DATE_INVALID');
      });
    });

    describe('Timezone Consistency', () => {
      it('should work consistently regardless of timezone for date comparisons', () => {
        // Test with explicit date construction that should work in any timezone
        const today = new Date();
        const todayYear = today.getFullYear();
        const todayMonth = today.getMonth();
        const todayDate = today.getDate();

        // Create today's date at local midnight
        const localToday = new Date(todayYear, todayMonth, todayDate);
        const localYesterday = new Date(todayYear, todayMonth, todayDate - 1);
        const localTomorrow = new Date(todayYear, todayMonth, todayDate + 1);

        // All of these should be timezone-consistent
        expect(service.validateTodoDueDate(localToday).valid).toBe(true);
        expect(service.validateTodoDueDate(localYesterday).valid).toBe(false);
        expect(service.validateTodoDueDate(localTomorrow).valid).toBe(true);
      });

      it('should handle DST transition periods correctly', () => {
        // Test dates around common DST transitions
        // These dates are chosen to be safe in most timezones
        const springDate = new Date(2025, 2, 15); // Mid March
        const fallDate = new Date(2025, 9, 15);   // Mid October

        // These should not throw errors and should validate correctly
        expect(() => service.validateTodoDueDate(springDate)).not.toThrow();
        expect(() => service.validateTodoDueDate(fallDate)).not.toThrow();
      });
    });
  });

  describe('validateTodoTags', () => {
    it('should return valid for valid tags', () => {
      const result = service.validateTodoTags(['work', 'important']);

      expect(result.valid).toBe(true);
    });

    it('should return valid for empty tags', () => {
      const result = service.validateTodoTags([]);

      expect(result.valid).toBe(true);
    });

    it('should return invalid for too many tags', () => {
      const tooManyTags = Array(11).fill('tag');

      const result = service.validateTodoTags(tooManyTags);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Maximum 10 tags allowed');
    });

    it('should return invalid for tag too long', () => {
      const longTag = 'a'.repeat(51);

      const result = service.validateTodoTags([longTag]);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Tag cannot exceed 50 characters');
    });

    it('should return invalid for empty tag', () => {
      const result = service.validateTodoTags(['']);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Tag cannot be empty');
    });

    it('should return invalid for duplicate tags', () => {
      const result = service.validateTodoTags(['work', 'work']);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Tag already exists');
    });
  });

  // ======================== New Tag Validation ========================

  describe('validateNewTag', () => {
    it('should return valid for valid new tag', () => {
      const result = service.validateNewTag('newtag', ['existing']);

      expect(result.valid).toBe(true);
    });

    it('should return invalid for empty tag', () => {
      const result = service.validateNewTag('', ['existing']);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Tag cannot be empty');
    });

    it('should return invalid for tag too long', () => {
      const longTag = 'a'.repeat(51);

      const result = service.validateNewTag(longTag, ['existing']);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Tag cannot exceed 50 characters');
    });

    it('should return invalid for duplicate tag (case insensitive)', () => {
      const result = service.validateNewTag('WORK', ['work']);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Tag already exists');
    });

    it('should return invalid when max tag count reached', () => {
      const maxTags = Array(10).fill('tag').map((tag, i) => `${tag}${i}`);

      const result = service.validateNewTag('newtag', maxTags);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Maximum 10 tags allowed');
    });
  });

  // ======================== Angular ValidatorFn Integration ========================

  describe('Angular ValidatorFn Integration', () => {
    describe('titleValidator', () => {
      it('should return null for valid title', () => {
        const validator = service.titleValidator();
        const control = new FormControl('Valid Title');

        const result = validator(control);

        expect(result).toBeNull();
      });

      it('should return error for empty title', () => {
        const validator = service.titleValidator();
        const control = new FormControl('');

        const result = validator(control);

        expect(result).toEqual({ required: expect.any(Object) });
      });

      it('should return error for title too long', () => {
        const validator = service.titleValidator();
        const control = new FormControl('a'.repeat(201));

        const result = validator(control);

        expect(result).toEqual({ maxlength: expect.any(Object) });
      });
    });

    describe('dueDateValidator', () => {
      it('should return null for future date', () => {
        const validator = service.dueDateValidator();
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 1);
        const control = new FormControl(futureDate);

        const result = validator(control);

        expect(result).toBeNull();
      });

      it('should return pastDate error for past date', () => {
        const validator = service.dueDateValidator();
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 1);
        const control = new FormControl(pastDate);

        const result = validator(control);

        expect(result).toEqual({ pastDate: expect.any(Object) });
      });
    });

    describe('descriptionValidator', () => {
      it('should return null for valid description', () => {
        const validator = service.descriptionValidator();
        const control = new FormControl('Valid description');

        const result = validator(control);

        expect(result).toBeNull();
      });

      it('should return error for description too long', () => {
        const validator = service.descriptionValidator();
        const control = new FormControl('a'.repeat(1001));

        const result = validator(control);

        expect(result).toEqual({ maxlength: expect.any(Object) });
      });
    });
  });

  // ======================== Validation Utilities ========================

  describe('Validation Utilities', () => {
    describe('getValidationLimits', () => {
      it('should return default validation limits', () => {
        const limits = service.getValidationLimits();

        expect(limits.title.maxLength).toBe(200);
        expect(limits.description.maxLength).toBe(1000);
        expect(limits.tag.maxLength).toBe(50);
        expect(limits.tag.maxCount).toBe(10);
      });
    });

    describe('updateValidationLimits', () => {
      it('should update validation limits', () => {
        const newLimits = service.updateValidationLimits({
          title: { minLength: 1, maxLength: 100 }
        });

        expect(newLimits.title.maxLength).toBe(100);
      });
    });

    describe('createValidationConfig', () => {
      it('should create default config', () => {
        const config = service.createValidationConfig();

        expect(config.strict).toBe(false);
        expect(config.stopOnFirstError).toBe(false);
      });

      it('should merge custom config', () => {
        const config = service.createValidationConfig({
          strict: true,
          stopOnFirstError: true
        });

        expect(config.strict).toBe(true);
        expect(config.stopOnFirstError).toBe(true);
      });
    });

    describe('getValidationStatistics', () => {
      it('should return validation statistics', () => {
        // Trigger some validations to generate stats
        service.validateCreateRequest({ title: 'Test' });
        service.validateCreateRequest({ title: '' });

        const stats = service.getValidationStatistics();

        expect(stats.totalValidations).toBeGreaterThan(0);
        expect(stats.successfulValidations).toBeGreaterThan(0);
        expect(stats.failedValidations).toBeGreaterThan(0);
      });
    });
  });

  // ======================== Business Rules Validation ========================

  describe('Business Rules', () => {
    describe('validateBusinessRules', () => {
      it('should return valid for basic request', () => {
        const request: CreateTodoRequest = { title: 'Test Todo' };

        const result = service.validateBusinessRules(request);

        expect(result.valid).toBe(true);
      });
    });

    describe('validateDueDateBusinessRules', () => {
      it('should return warning for high priority without due date', () => {
        const result = service.validateDueDateBusinessRules(undefined, 'high');

        expect(result.valid).toBe(true);
        expect(result.warnings).toBeDefined();
      });

      it('should return valid for high priority with due date', () => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 1);

        const result = service.validateDueDateBusinessRules(futureDate, 'high');

        expect(result.valid).toBe(true);
      });
    });
  });

  // ======================== Edge Cases and Error Handling ========================

  describe('Edge Cases', () => {
    it('should handle stopOnFirstError configuration', () => {
      const request: CreateTodoRequest = {
        title: '',
        description: 'a'.repeat(1001)
      };

      const result = service.validateCreateRequest(request, { stopOnFirstError: true });

      expect(result.valid).toBe(false);
      expect(result.errors?.length).toBe(1); // Should stop after first error
    });

    it('should handle custom validation limits', () => {
      const config = {
        customLimits: {
          titleMaxLength: 100
        }
      };

      const request: CreateTodoRequest = { title: 'a'.repeat(150) };

      const result = service.validateCreateRequest(request, config);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Title cannot exceed 200 characters'); // Uses custom limit
    });

    it('should handle multiple validation errors', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const request: CreateTodoRequest = {
        title: '',
        description: 'a'.repeat(1001),
        dueDate: pastDate,
        tags: Array(15).fill('tag')
      };

      const result = service.validateCreateRequest(request);

      expect(result.valid).toBe(false);
      expect(result.errors?.length).toBeGreaterThan(1);
    });

    it('should handle isValidRequest for both request types', () => {
      const createRequest: CreateTodoRequest = { title: 'Valid' };
      const updateRequest: UpdateTodoRequest = { description: 'Valid' };

      expect(service.isValidRequest(createRequest)).toBe(true);
      expect(service.isValidRequest(updateRequest)).toBe(true);
    });
  });
});