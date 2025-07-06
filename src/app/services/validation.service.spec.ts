import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ValidationService } from './validation.service';
import { CreateTodoRequest } from '../models/todo.model';

describe('ValidationService', () => {
  let service: ValidationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        ValidationService
      ]
    });
    service = TestBed.inject(ValidationService);
  });

  describe('Service Creation', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });
  });

  describe('validateCreateRequest', () => {
    describe('Valid Requests', () => {
      it('should return valid result for minimal valid request', () => {
        const request: CreateTodoRequest = {
          title: 'Valid Todo',
          priority: 'medium'
        };

        const result = service.validateCreateRequest(request);

        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual([]);
      });

      it('should return valid result for complete valid request', () => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 1); // Tomorrow
        
        const request: CreateTodoRequest = {
          title: 'Valid Todo',
          description: 'A valid description',
          priority: 'high',
          dueDate: futureDate,
          tags: ['work', 'important']
        };

        const result = service.validateCreateRequest(request);

        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual([]);
      });

      it('should return valid result for request with whitespace-padded title', () => {
        const request: CreateTodoRequest = {
          title: '  Valid Todo  ',
          priority: 'low'
        };

        const result = service.validateCreateRequest(request);

        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual([]);
      });
    });

    describe('Invalid Requests - Title Validation', () => {
      it('should return invalid result for empty title', () => {
        const request: CreateTodoRequest = {
          title: '',
          priority: 'medium'
        };

        const result = service.validateCreateRequest(request);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Title is required');
      });

      it('should return invalid result for whitespace-only title', () => {
        const request: CreateTodoRequest = {
          title: '   ',
          priority: 'medium'
        };

        const result = service.validateCreateRequest(request);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Title is required');
      });

      it('should return invalid result for null title', () => {
        const request = {
          title: null,
          priority: 'medium'
        } as unknown as CreateTodoRequest;

        const result = service.validateCreateRequest(request);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Title is required');
      });

      it('should return invalid result for undefined title', () => {
        const request = {
          priority: 'medium'
        } as unknown as CreateTodoRequest;

        const result = service.validateCreateRequest(request);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Title is required');
      });

      it('should return invalid result for title exceeding max length', () => {
        const request: CreateTodoRequest = {
          title: 'a'.repeat(256), // Assuming max length is 255
          priority: 'medium'
        };

        const result = service.validateCreateRequest(request);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Title must be less than 255 characters');
      });
    });

    describe('Invalid Requests - Priority Validation', () => {
      it('should return invalid result for invalid priority', () => {
        const request = {
          title: 'Valid Todo',
          priority: 'invalid'
        } as unknown as CreateTodoRequest;

        const result = service.validateCreateRequest(request);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Priority must be low, medium, or high');
      });

      it('should return invalid result for null priority', () => {
        const request = {
          title: 'Valid Todo',
          priority: null
        } as unknown as CreateTodoRequest;

        const result = service.validateCreateRequest(request);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Priority is required');
      });

      it('should return invalid result for undefined priority', () => {
        const request = {
          title: 'Valid Todo'
        } as unknown as CreateTodoRequest;

        const result = service.validateCreateRequest(request);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Priority is required');
      });
    });

    describe('Invalid Requests - Description Validation', () => {
      it('should return invalid result for description exceeding max length', () => {
        const request: CreateTodoRequest = {
          title: 'Valid Todo',
          description: 'a'.repeat(1001), // Assuming max length is 1000
          priority: 'medium'
        };

        const result = service.validateCreateRequest(request);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Description must be less than 1000 characters');
      });

      it('should return valid result for empty description', () => {
        const request: CreateTodoRequest = {
          title: 'Valid Todo',
          description: '',
          priority: 'medium'
        };

        const result = service.validateCreateRequest(request);

        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual([]);
      });
    });

    describe('Invalid Requests - Due Date Validation', () => {
      it('should return invalid result for past due date', () => {
        const pastDate = new Date('2020-01-01');
        const request: CreateTodoRequest = {
          title: 'Valid Todo',
          priority: 'medium',
          dueDate: pastDate
        };

        const result = service.validateCreateRequest(request);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Due date cannot be in the past');
      });

      it('should return valid result for future due date', () => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 1);
        
        const request: CreateTodoRequest = {
          title: 'Valid Todo',
          priority: 'medium',
          dueDate: futureDate
        };

        const result = service.validateCreateRequest(request);

        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual([]);
      });

      it('should return valid result for today as due date', () => {
        const today = new Date();
        today.setHours(23, 59, 59, 999); // End of today
        
        const request: CreateTodoRequest = {
          title: 'Valid Todo',
          priority: 'medium',
          dueDate: today
        };

        const result = service.validateCreateRequest(request);

        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual([]);
      });
    });

    describe('Invalid Requests - Tags Validation', () => {
      it('should return invalid result for too many tags', () => {
        const request: CreateTodoRequest = {
          title: 'Valid Todo',
          priority: 'medium',
          tags: Array.from({ length: 11 }, (_, i) => `tag${i}`) // Assuming max is 10
        };

        const result = service.validateCreateRequest(request);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Maximum 10 tags allowed');
      });

      it('should return invalid result for empty tag', () => {
        const request: CreateTodoRequest = {
          title: 'Valid Todo',
          priority: 'medium',
          tags: ['valid', '', 'tags']
        };

        const result = service.validateCreateRequest(request);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Tags cannot be empty');
      });

      it('should return invalid result for tag exceeding max length', () => {
        const request: CreateTodoRequest = {
          title: 'Valid Todo',
          priority: 'medium',
          tags: ['a'.repeat(31)] // Assuming max tag length is 30
        };

        const result = service.validateCreateRequest(request);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Tag length must be less than 30 characters');
      });

      it('should return valid result for valid tags', () => {
        const request: CreateTodoRequest = {
          title: 'Valid Todo',
          priority: 'medium',
          tags: ['work', 'important', 'urgent']
        };

        const result = service.validateCreateRequest(request);

        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual([]);
      });
    });

    describe('Invalid Requests - Null/Undefined Request', () => {
      it('should return invalid result for null request', () => {
        const result = service.validateCreateRequest(null as unknown as CreateTodoRequest);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Request cannot be null or undefined');
      });

      it('should return invalid result for undefined request', () => {
        const result = service.validateCreateRequest(undefined as unknown as CreateTodoRequest);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Request cannot be null or undefined');
      });
    });

    describe('Multiple Validation Errors', () => {
      it('should return all validation errors for completely invalid request', () => {
        const request = {
          title: '',
          description: 'a'.repeat(1001),
          priority: 'invalid',
          dueDate: new Date('2020-01-01'),
          tags: ['', 'a'.repeat(31), ...Array.from({ length: 11 }, (_, i) => `tag${i}`)]
        } as unknown as CreateTodoRequest;

        const result = service.validateCreateRequest(request);

        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(7);
        expect(result.errors).toContain('Title is required');
        expect(result.errors).toContain('Description must be less than 1000 characters');
        expect(result.errors).toContain('Priority must be low, medium, or high');
        expect(result.errors).toContain('Due date cannot be in the past');
        expect(result.errors).toContain('Tags cannot be empty');
        expect(result.errors).toContain('Maximum 10 tags allowed');
        expect(result.errors).toContain('Tag length must be less than 30 characters');
      });
    });
  });
});