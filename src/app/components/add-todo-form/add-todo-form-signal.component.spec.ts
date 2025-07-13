import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { provideZonelessChangeDetection } from '@angular/core';
import { vi, expect } from 'vitest';
import { AddTodoFormSignalComponent } from './add-todo-form-signal.component';
import { CreateTodoRequest } from '../../models/todo.model';

describe('AddTodoFormSignalComponent', () => {
  let component: AddTodoFormSignalComponent;
  let fixture: ComponentFixture<AddTodoFormSignalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddTodoFormSignalComponent, FormsModule],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(AddTodoFormSignalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Creation and Form Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize signal-based form with correct fields', () => {
      expect(component.todoForm).toBeTruthy();
      expect(component.todoForm.get('title')).toBeTruthy();
      expect(component.todoForm.get('description')).toBeTruthy();
      expect(component.todoForm.get('priority')).toBeTruthy();
      expect(component.todoForm.get('dueDate')).toBeTruthy();
    });

    it('should have empty initial form values', () => {
      expect(component.todoForm.get('title').value()).toBe('');
      expect(component.todoForm.get('description').value()).toBe('');
      expect(component.todoForm.get('dueDate').value()).toBe('');
    });

    it('should have default priority value as medium', () => {
      expect(component.todoForm.get('priority').value()).toBe('medium');
    });

    it('should initialize tags array as empty', () => {
      expect(component.tagsArray.items()).toEqual([]);
      expect(component.tagsArray.length()).toBe(0);
    });

    it('should initialize tag input and error signals', () => {
      expect(component.currentTagInput()).toBe('');
      expect(component.tagError()).toBe('');
    });
  });

  describe('Signal-based Form Validation', () => {
    it('should mark title as required', () => {
      component.todoForm.get('title').setValue('');
      component.todoForm.get('title').markAsTouched();
      
      expect(component.titleErrors()).toEqual({ required: true });
      expect(component.todoForm.get('title').invalid()).toBe(true);
    });

    it('should validate title field when filled', () => {
      component.todoForm.get('title').setValue('Test Todo');
      
      expect(component.titleErrors()).toBeNull();
      expect(component.todoForm.get('title').valid()).toBe(true);
    });

    it('should validate past due dates', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const pastDateString = yesterday.toISOString().split('T')[0];
      
      component.todoForm.get('dueDate').setValue(pastDateString);
      component.todoForm.get('dueDate').markAsTouched();
      
      expect(component.dueDateErrors()).toEqual({ pastDate: true });
      expect(component.todoForm.get('dueDate').invalid()).toBe(true);
    });

    it('should allow future due dates', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const futureDateString = tomorrow.toISOString().split('T')[0];
      
      component.todoForm.get('dueDate').setValue(futureDateString);
      
      expect(component.dueDateErrors()).toBeNull();
      expect(component.todoForm.get('dueDate').valid()).toBe(true);
    });

    it('should compute form disabled state correctly', () => {
      // Empty title should disable form
      component.todoForm.get('title').setValue('');
      expect(component.isFormDisabled()).toBe(true);
      
      // Valid title should enable form
      component.todoForm.get('title').setValue('Test Todo');
      expect(component.isFormDisabled()).toBe(false);
      
      // Invalid due date should disable form
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      component.todoForm.get('dueDate').setValue(yesterday.toISOString().split('T')[0]);
      expect(component.isFormDisabled()).toBe(true);
    });
  });

  describe('Tag Management with Signal-based Array', () => {
    it('should add valid tags', () => {
      component.currentTagInput.set('work');
      component.addTag();
      
      expect(component.tagsArray.items()).toEqual(['work']);
      expect(component.currentTagInput()).toBe('');
      expect(component.tagError()).toBe('');
    });

    it('should prevent empty tags', () => {
      component.currentTagInput.set('');
      component.addTag();
      
      expect(component.tagsArray.items()).toEqual([]);
      expect(component.tagError()).toBe('Tag cannot be empty');
    });

    it('should prevent duplicate tags (case insensitive)', () => {
      component.currentTagInput.set('Work');
      component.addTag();
      
      component.currentTagInput.set('work');
      component.addTag();
      
      expect(component.tagsArray.items()).toEqual(['Work']);
      expect(component.tagError()).toBe('Tag already exists');
    });

    it('should enforce tag length limit', () => {
      const longTag = 'a'.repeat(component.MAX_TAG_LENGTH + 1);
      component.currentTagInput.set(longTag);
      component.addTag();
      
      expect(component.tagsArray.items()).toEqual([]);
      expect(component.tagError()).toContain('cannot exceed');
    });

    it('should enforce maximum tag count', () => {
      // Add maximum number of tags
      for (let i = 0; i < component.MAX_TAGS_COUNT; i++) {
        component.currentTagInput.set(`tag${i}`);
        component.addTag();
      }
      
      expect(component.tagsArray.length()).toBe(component.MAX_TAGS_COUNT);
      
      // Try to add one more
      component.currentTagInput.set('extra');
      component.addTag();
      
      expect(component.tagsArray.length()).toBe(component.MAX_TAGS_COUNT);
      expect(component.tagError()).toContain('Maximum');
    });

    it('should remove tags by index', () => {
      component.currentTagInput.set('tag1');
      component.addTag();
      component.currentTagInput.set('tag2');
      component.addTag();
      
      expect(component.tagsArray.items()).toEqual(['tag1', 'tag2']);
      
      component.removeTag(0);
      expect(component.tagsArray.items()).toEqual(['tag2']);
    });

    it('should handle keyboard events for tag input', () => {
      component.currentTagInput.set('work');
      
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      Object.defineProperty(enterEvent, 'preventDefault', { value: vi.fn() });
      
      component.onTagInputKeyDown(enterEvent);
      
      expect(component.tagsArray.items()).toEqual(['work']);
      expect(enterEvent.preventDefault).toHaveBeenCalled();
    });
  });

  describe('Input Handlers', () => {
    it('should handle title input changes', () => {
      component.onTitleChange('New Title');
      expect(component.todoForm.get('title').value()).toBe('New Title');
    });

    it('should handle description input changes', () => {
      component.onDescriptionChange('New Description');
      expect(component.todoForm.get('description').value()).toBe('New Description');
    });

    it('should handle priority selection changes', () => {
      component.onPriorityChange('high');
      expect(component.todoForm.get('priority').value()).toBe('high');
    });

    it('should handle due date input changes', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateString = tomorrow.toISOString().split('T')[0];
      
      component.onDueDateChange(dateString);
      expect(component.todoForm.get('dueDate').value()).toBe(dateString);
    });

    it('should handle tag input value changes', () => {
      component.onTagInputChange('new tag');
      expect(component.currentTagInput()).toBe('new tag');
    });
  });

  describe('Form Submission', () => {
    it('should emit formSubmit with valid data', () => {
      const formSubmitSpy = vi.fn();
      component.formSubmit.subscribe(formSubmitSpy);
      
      component.todoForm.get('title').setValue('Test Todo');
      component.todoForm.get('description').setValue('Test Description');
      component.todoForm.get('priority').setValue('high');
      
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateString = tomorrow.toISOString().split('T')[0];
      component.todoForm.get('dueDate').setValue(dateString);
      
      component.currentTagInput.set('work');
      component.addTag();
      
      component.onSubmit();
      
      expect(formSubmitSpy).toHaveBeenCalledWith({
        title: 'Test Todo',
        description: 'Test Description',
        priority: 'high',
        dueDate: new Date(dateString),
        tags: ['work']
      });
    });

    it('should not submit invalid form', () => {
      const formSubmitSpy = vi.fn();
      component.formSubmit.subscribe(formSubmitSpy);
      
      // Empty title makes form invalid
      component.todoForm.get('title').setValue('');
      component.onSubmit();
      
      expect(formSubmitSpy).not.toHaveBeenCalled();
    });

    it('should handle form reset after submission', (done) => {
      component.todoForm.get('title').setValue('Test Todo');
      component.currentTagInput.set('work');
      component.addTag();
      
      component.onSubmit();
      
      // Check that form resets after timeout
      setTimeout(() => {
        expect(component.todoForm.get('title').value()).toBe('');
        expect(component.todoForm.get('description').value()).toBe('');
        expect(component.todoForm.get('priority').value()).toBe('medium');
        expect(component.todoForm.get('dueDate').value()).toBe('');
        expect(component.tagsArray.items()).toEqual([]);
        expect(component.currentTagInput()).toBe('');
        expect(component.tagError()).toBe('');
        expect(component.isSubmitting()).toBe(false);
        done();
      }, 350);
    });

    it('should set submitting state during submission', () => {
      component.todoForm.get('title').setValue('Test Todo');
      
      expect(component.isSubmitting()).toBe(false);
      
      component.onSubmit();
      
      expect(component.isSubmitting()).toBe(true);
    });
  });

  describe('Template Integration', () => {
    it('should render form title input with signal binding', () => {
      const titleInput = fixture.nativeElement.querySelector('[data-testid="title-input-signal"]');
      expect(titleInput).toBeTruthy();
      expect(titleInput.value).toBe('');
      
      component.todoForm.get('title').setValue('Test Title');
      fixture.detectChanges();
      
      expect(titleInput.value).toBe('Test Title');
    });

    it('should display validation errors in template', () => {
      component.todoForm.get('title').setValue('');
      component.todoForm.get('title').markAsTouched();
      fixture.detectChanges();
      
      const errorElement = fixture.nativeElement.querySelector('[data-testid="title-error-signal"]');
      expect(errorElement).toBeTruthy();
      expect(errorElement.textContent.trim()).toBe('Title is required');
    });

    it('should render tags in template', () => {
      component.currentTagInput.set('work');
      component.addTag();
      component.currentTagInput.set('personal');
      component.addTag();
      
      fixture.detectChanges();
      
      const tagChips = fixture.nativeElement.querySelectorAll('[data-testid="tag-chip-signal"]');
      expect(tagChips).toHaveLength(2);
      expect(tagChips[0].textContent.trim()).toContain('work');
      expect(tagChips[1].textContent.trim()).toContain('personal');
    });

    it('should disable submit button when form is invalid', () => {
      component.todoForm.get('title').setValue('');
      fixture.detectChanges();
      
      const submitButton = fixture.nativeElement.querySelector('[data-testid="submit-button-signal"]');
      expect(submitButton.disabled).toBe(true);
      
      component.todoForm.get('title').setValue('Valid Title');
      fixture.detectChanges();
      
      expect(submitButton.disabled).toBe(false);
    });
  });

  describe('Priority Validation', () => {
    it('should validate priority options', () => {
      expect(component.priorityOptions).toEqual([
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' }
      ]);
    });

    it('should handle invalid priority gracefully', () => {
      const createRequest = {
        title: 'Test',
        priority: 'invalid' as any
      };
      
      // The validatePriority method should handle this
      const validPriority = (component as any).validatePriority('invalid');
      expect(validPriority).toBe('medium');
    });
  });

  describe('Computed Signal Reactivity', () => {
    it('should update currentTags computed signal when tags array changes', () => {
      expect(component.currentTags()).toEqual([]);
      
      component.currentTagInput.set('tag1');
      component.addTag();
      
      expect(component.currentTags()).toEqual(['tag1']);
      
      component.removeTag(0);
      
      expect(component.currentTags()).toEqual([]);
    });

    it('should update form disabled state when form validity changes', () => {
      expect(component.isFormDisabled()).toBe(true); // Initially disabled due to empty title
      
      component.todoForm.get('title').setValue('Valid Title');
      
      expect(component.isFormDisabled()).toBe(false);
      
      // Add invalid due date
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      component.todoForm.get('dueDate').setValue(yesterday.toISOString().split('T')[0]);
      
      expect(component.isFormDisabled()).toBe(true);
    });
  });
});