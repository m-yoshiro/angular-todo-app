import { signal, computed } from '@angular/core';
import { expect, describe, it, beforeEach } from 'vitest';
import { 
  fieldSignal, 
  formSignal, 
  arrayFieldSignal, 
  Validators,
  createTodoFormSignal,
  type FieldConfig,
  type ValidationError
} from './signal-forms';

describe('Signal Forms Utilities', () => {
  
  describe('fieldSignal', () => {
    it('should create a field signal with initial value', () => {
      const config: FieldConfig<string> = {
        initialValue: 'test'
      };
      
      const field = fieldSignal(config);
      
      expect(field.value()).toBe('test');
      expect(field.valid()).toBe(true);
      expect(field.invalid()).toBe(false);
      expect(field.touched()).toBe(false);
      expect(field.errors()).toBeNull();
    });

    it('should handle required validation', () => {
      const config: FieldConfig<string> = {
        initialValue: '',
        required: true
      };
      
      const field = fieldSignal(config);
      
      expect(field.valid()).toBe(false);
      expect(field.invalid()).toBe(true);
      expect(field.errors()).toEqual({ required: true });
    });

    it('should handle custom validators', () => {
      const minLengthValidator = (value: string): ValidationError | null => {
        if (value.length < 3) {
          return { minLength: { requiredLength: 3, actualLength: value.length } };
        }
        return null;
      };

      const config: FieldConfig<string> = {
        initialValue: 'ab',
        validators: [minLengthValidator]
      };
      
      const field = fieldSignal(config);
      
      expect(field.valid()).toBe(false);
      expect(field.errors()).toEqual({ minLength: { requiredLength: 3, actualLength: 2 } });
      
      field.setValue('abc');
      expect(field.valid()).toBe(true);
      expect(field.errors()).toBeNull();
    });

    it('should update touched state', () => {
      const field = fieldSignal({ initialValue: '' });
      
      expect(field.touched()).toBe(false);
      
      field.markAsTouched();
      expect(field.touched()).toBe(true);
    });

    it('should update touched state on setValue', () => {
      const field = fieldSignal({ initialValue: '' });
      
      expect(field.touched()).toBe(false);
      
      field.setValue('new value');
      expect(field.touched()).toBe(true);
      expect(field.value()).toBe('new value');
    });

    it('should reset to initial state', () => {
      const field = fieldSignal({ initialValue: 'initial', required: true });
      
      field.setValue('changed');
      field.markAsTouched();
      
      expect(field.value()).toBe('changed');
      expect(field.touched()).toBe(true);
      
      field.reset();
      
      expect(field.value()).toBe('initial');
      expect(field.touched()).toBe(false);
    });

    it('should handle multiple validators', () => {
      const validator1 = (value: string) => value.length < 2 ? { minLength: true } : null;
      const validator2 = (value: string) => value.length > 5 ? { maxLength: true } : null;

      const field = fieldSignal({
        initialValue: '',
        validators: [validator1, validator2]
      });
      
      // Too short
      field.setValue('a');
      expect(field.errors()).toEqual({ minLength: true });
      
      // Just right
      field.setValue('abc');
      expect(field.errors()).toBeNull();
      
      // Too long
      field.setValue('abcdef');
      expect(field.errors()).toEqual({ maxLength: true });
    });
  });

  describe('formSignal', () => {
    it('should create a form signal with multiple fields', () => {
      const form = formSignal({
        title: { initialValue: 'Test Title', required: true },
        description: { initialValue: '', required: false }
      });
      
      expect(form.value()).toEqual({
        title: 'Test Title',
        description: ''
      });
      
      expect(form.valid()).toBe(true);
      expect(form.invalid()).toBe(false);
      expect(form.touched()).toBe(false);
    });

    it('should handle form-level validation', () => {
      const form = formSignal({
        title: { initialValue: '', required: true },
        description: { initialValue: 'desc', required: false }
      });
      
      expect(form.valid()).toBe(false);
      expect(form.invalid()).toBe(true);
      
      const errors = form.errors();
      expect(errors.title).toEqual({ required: true });
      expect(errors.description).toBeUndefined();
    });

    it('should provide access to individual fields', () => {
      const form = formSignal({
        title: { initialValue: 'Test', required: true },
        description: { initialValue: '', required: false }
      });
      
      const titleField = form.get('title');
      const descField = form.get('description');
      
      expect(titleField.value()).toBe('Test');
      expect(descField.value()).toBe('');
      
      titleField.setValue('New Title');
      expect(form.value().title).toBe('New Title');
    });

    it('should handle touched state at form level', () => {
      const form = formSignal({
        title: { initialValue: '', required: true },
        description: { initialValue: '', required: false }
      });
      
      expect(form.touched()).toBe(false);
      
      form.get('title').markAsTouched();
      expect(form.touched()).toBe(true);
    });

    it('should mark all fields as touched', () => {
      const form = formSignal({
        title: { initialValue: '', required: true },
        description: { initialValue: '', required: false }
      });
      
      expect(form.get('title').touched()).toBe(false);
      expect(form.get('description').touched()).toBe(false);
      
      form.markAllAsTouched();
      
      expect(form.get('title').touched()).toBe(true);
      expect(form.get('description').touched()).toBe(true);
    });

    it('should reset all fields', () => {
      const form = formSignal({
        title: { initialValue: 'Initial', required: true },
        description: { initialValue: '', required: false }
      });
      
      form.get('title').setValue('Changed');
      form.get('title').markAsTouched();
      form.get('description').setValue('Changed too');
      
      form.reset();
      
      expect(form.get('title').value()).toBe('Initial');
      expect(form.get('title').touched()).toBe(false);
      expect(form.get('description').value()).toBe('');
      expect(form.get('description').touched()).toBe(false);
    });

    it('should be reactive to field changes', () => {
      const form = formSignal({
        title: { initialValue: '', required: true },
        count: { initialValue: 0, required: false }
      });
      
      // Initial state
      expect(form.valid()).toBe(false);
      
      // Update title to make form valid
      form.get('title').setValue('Valid Title');
      expect(form.valid()).toBe(true);
      
      // Update count
      form.get('count').setValue(5);
      expect(form.value().count).toBe(5);
    });
  });

  describe('arrayFieldSignal', () => {
    it('should initialize with empty array', () => {
      const arrayField = arrayFieldSignal<string>();
      
      expect(arrayField.items()).toEqual([]);
      expect(arrayField.length()).toBe(0);
    });

    it('should initialize with provided items', () => {
      const initialItems = ['item1', 'item2'];
      const arrayField = arrayFieldSignal(initialItems);
      
      expect(arrayField.items()).toEqual(initialItems);
      expect(arrayField.length()).toBe(2);
    });

    it('should add items', () => {
      const arrayField = arrayFieldSignal<string>();
      
      arrayField.push('first');
      expect(arrayField.items()).toEqual(['first']);
      expect(arrayField.length()).toBe(1);
      
      arrayField.push('second');
      expect(arrayField.items()).toEqual(['first', 'second']);
      expect(arrayField.length()).toBe(2);
    });

    it('should remove items by index', () => {
      const arrayField = arrayFieldSignal(['a', 'b', 'c']);
      
      arrayField.removeAt(1);
      expect(arrayField.items()).toEqual(['a', 'c']);
      expect(arrayField.length()).toBe(2);
    });

    it('should clear all items', () => {
      const arrayField = arrayFieldSignal(['a', 'b', 'c']);
      
      arrayField.clear();
      expect(arrayField.items()).toEqual([]);
      expect(arrayField.length()).toBe(0);
    });

    it('should get item at index', () => {
      const arrayField = arrayFieldSignal(['a', 'b', 'c']);
      
      expect(arrayField.at(0)).toBe('a');
      expect(arrayField.at(1)).toBe('b');
      expect(arrayField.at(2)).toBe('c');
      expect(arrayField.at(3)).toBeUndefined();
    });

    it('should maintain immutability of original array', () => {
      const originalItems = ['a', 'b'];
      const arrayField = arrayFieldSignal(originalItems);
      
      arrayField.push('c');
      
      expect(originalItems).toEqual(['a', 'b']); // Original unchanged
      expect(arrayField.items()).toEqual(['a', 'b', 'c']);
    });
  });

  describe('Validators', () => {
    describe('required', () => {
      it('should validate required values', () => {
        expect(Validators.required('')).toEqual({ required: true });
        expect(Validators.required(null)).toEqual({ required: true });
        expect(Validators.required(undefined)).toEqual({ required: true });
        expect(Validators.required('value')).toBeNull();
        expect(Validators.required(0)).toBeNull();
        expect(Validators.required(false)).toBeNull();
      });
    });

    describe('minLength', () => {
      it('should validate minimum length', () => {
        const validator = Validators.minLength(3);
        
        expect(validator('ab')).toEqual({ minLength: { requiredLength: 3, actualLength: 2 } });
        expect(validator('abc')).toBeNull();
        expect(validator('abcd')).toBeNull();
        expect(validator('')).toEqual({ minLength: { requiredLength: 3, actualLength: 0 } });
      });
    });

    describe('maxLength', () => {
      it('should validate maximum length', () => {
        const validator = Validators.maxLength(3);
        
        expect(validator('ab')).toBeNull();
        expect(validator('abc')).toBeNull();
        expect(validator('abcd')).toEqual({ maxLength: { requiredLength: 3, actualLength: 4 } });
      });
    });

    describe('futureDate', () => {
      it('should validate future dates', () => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const yesterdayString = yesterday.toISOString().split('T')[0];
        const tomorrowString = tomorrow.toISOString().split('T')[0];
        
        expect(Validators.futureDate(yesterdayString)).toEqual({ pastDate: true });
        expect(Validators.futureDate(tomorrowString)).toBeNull();
        expect(Validators.futureDate('')).toBeNull(); // Empty values are allowed
      });
    });

    describe('email', () => {
      it('should validate email format', () => {
        expect(Validators.email('invalid')).toEqual({ email: true });
        expect(Validators.email('invalid@')).toEqual({ email: true });
        expect(Validators.email('invalid@domain')).toEqual({ email: true });
        expect(Validators.email('valid@domain.com')).toBeNull();
        expect(Validators.email('user+tag@example.org')).toBeNull();
        expect(Validators.email('')).toBeNull(); // Empty values are allowed
      });
    });
  });

  describe('createTodoFormSignal', () => {
    it('should create a form with todo-specific fields', () => {
      const form = createTodoFormSignal();
      
      expect(form.get('title')).toBeDefined();
      expect(form.get('description')).toBeDefined();
      expect(form.get('priority')).toBeDefined();
      expect(form.get('dueDate')).toBeDefined();
      
      expect(form.get('title').value()).toBe('');
      expect(form.get('description').value()).toBe('');
      expect(form.get('priority').value()).toBe('medium');
      expect(form.get('dueDate').value()).toBe('');
    });

    it('should have proper validation for todo form', () => {
      const form = createTodoFormSignal();
      
      // Title is required
      expect(form.get('title').valid()).toBe(false);
      expect(form.get('title').errors()).toEqual({ required: true });
      
      // Description is optional
      expect(form.get('description').valid()).toBe(true);
      expect(form.get('description').errors()).toBeNull();
      
      // Priority is optional with default
      expect(form.get('priority').valid()).toBe(true);
      
      // Due date is optional
      expect(form.get('dueDate').valid()).toBe(true);
    });

    it('should validate due date as future date', () => {
      const form = createTodoFormSignal();
      
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const pastDateString = yesterday.toISOString().split('T')[0];
      
      form.get('dueDate').setValue(pastDateString);
      expect(form.get('dueDate').valid()).toBe(false);
      expect(form.get('dueDate').errors()).toEqual({ pastDate: true });
    });

    it('should be valid when all required fields are filled', () => {
      const form = createTodoFormSignal();
      
      form.get('title').setValue('Test Todo');
      
      expect(form.valid()).toBe(true);
      expect(form.value()).toEqual({
        title: 'Test Todo',
        description: '',
        priority: 'medium',
        dueDate: ''
      });
    });
  });

  describe('Signal Reactivity', () => {
    it('should be reactive to field changes in form', () => {
      const form = formSignal({
        field1: { initialValue: '', required: true },
        field2: { initialValue: '', required: false }
      });
      
      // Track form validity changes
      const validityChanges: boolean[] = [];
      const validitySignal = computed(() => {
        const isValid = form.valid();
        validityChanges.push(isValid);
        return isValid;
      });
      
      // Initial state
      expect(validitySignal()).toBe(false);
      expect(validityChanges).toEqual([false]);
      
      // Make form valid
      form.get('field1').setValue('value');
      expect(validitySignal()).toBe(true);
      expect(validityChanges).toEqual([false, true]);
    });

    it('should be reactive to array changes', () => {
      const arrayField = arrayFieldSignal<string>();
      
      // Track length changes
      const lengthChanges: number[] = [];
      const lengthSignal = computed(() => {
        const length = arrayField.length();
        lengthChanges.push(length);
        return length;
      });
      
      // Initial state
      expect(lengthSignal()).toBe(0);
      expect(lengthChanges).toEqual([0]);
      
      // Add item
      arrayField.push('item1');
      expect(lengthSignal()).toBe(1);
      expect(lengthChanges).toEqual([0, 1]);
      
      // Add another item
      arrayField.push('item2');
      expect(lengthSignal()).toBe(2);
      expect(lengthChanges).toEqual([0, 1, 2]);
      
      // Remove item
      arrayField.removeAt(0);
      expect(lengthSignal()).toBe(1);
      expect(lengthChanges).toEqual([0, 1, 2, 1]);
    });
  });

  describe('Complex Form Scenarios', () => {
    it('should handle nested validation scenarios', () => {
      const customValidator = (value: string): ValidationError | null => {
        if (value.includes('banned')) {
          return { bannedWord: true };
        }
        return null;
      };

      const form = formSignal({
        title: { 
          initialValue: '', 
          required: true, 
          validators: [Validators.minLength(3), customValidator] 
        },
        priority: { initialValue: 'low' as 'low' | 'medium' | 'high' }
      });
      
      // Empty title - required error takes precedence
      expect(form.get('title').errors()).toEqual({ required: true });
      
      // Too short title
      form.get('title').setValue('ab');
      expect(form.get('title').errors()).toEqual({ minLength: { requiredLength: 3, actualLength: 2 } });
      
      // Banned word
      form.get('title').setValue('banned word');
      expect(form.get('title').errors()).toEqual({ bannedWord: true });
      
      // Valid title
      form.get('title').setValue('valid title');
      expect(form.get('title').errors()).toBeNull();
      expect(form.valid()).toBe(true);
    });

    it('should handle form with array field integration', () => {
      const form = formSignal({
        title: { initialValue: '', required: true },
        description: { initialValue: '' }
      });
      
      const tagsArray = arrayFieldSignal<string>();
      
      // Form + array combination
      form.get('title').setValue('Test Todo');
      tagsArray.push('work');
      tagsArray.push('urgent');
      
      expect(form.valid()).toBe(true);
      expect(tagsArray.items()).toEqual(['work', 'urgent']);
      
      // Could be combined for full form submission
      const fullFormData = {
        ...form.value(),
        tags: tagsArray.items()
      };
      
      expect(fullFormData).toEqual({
        title: 'Test Todo',
        description: '',
        tags: ['work', 'urgent']
      });
    });
  });
});