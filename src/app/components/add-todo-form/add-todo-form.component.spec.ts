import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideZonelessChangeDetection } from '@angular/core';
import { vi, expect } from 'vitest';
import { AddTodoFormComponent } from './add-todo-form.component';
import { CreateTodoRequest } from '../../models/todo.model';

describe('AddTodoFormComponent', () => {
  let component: AddTodoFormComponent;
  let fixture: ComponentFixture<AddTodoFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddTodoFormComponent, ReactiveFormsModule],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(AddTodoFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Creation and Form Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize form with title and description fields', () => {
      expect(component.todoForm).toBeTruthy();
      expect(component.todoForm.get('title')).toBeTruthy();
      expect(component.todoForm.get('description')).toBeTruthy();
    });

    it('should initialize form with priority and dueDate fields', () => {
      expect(component.todoForm.get('priority')).toBeTruthy();
      expect(component.todoForm.get('dueDate')).toBeTruthy();
    });

    it('should have empty initial form values', () => {
      expect(component.todoForm.get('title')?.value).toBe('');
      expect(component.todoForm.get('description')?.value).toBe('');
    });

    it('should have default priority value as medium', () => {
      expect(component.todoForm.get('priority')?.value).toBe('medium');
    });

    it('should have empty initial dueDate value', () => {
      expect(component.todoForm.get('dueDate')?.value).toBe('');
    });

    it('should initialize signals correctly', () => {
      expect(component.isSubmitting()).toBe(false);
    });

    it('should have priority options available', () => {
      expect(component.priorityOptions).toBeTruthy();
      expect(component.priorityOptions.length).toBe(3);
      expect(component.priorityOptions).toEqual([
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' }
      ]);
    });
  });

  describe('Form Validation', () => {
    it('should be invalid when title is empty', () => {
      component.todoForm.get('title')?.setValue('');
      expect(component.todoForm.invalid).toBe(true);
    });

    it('should be valid when title has value', () => {
      component.todoForm.get('title')?.setValue('Test Todo');
      expect(component.todoForm.valid).toBe(true);
    });

    it('should be valid when title has value and priority is set', () => {
      component.todoForm.get('title')?.setValue('Test Todo');
      component.todoForm.get('priority')?.setValue('high');
      expect(component.todoForm.valid).toBe(true);
    });

    it('should be valid when title has value with optional due date', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      const futureDateString = futureDate.toISOString().split('T')[0];
      
      component.todoForm.get('title')?.setValue('Test Todo');
      component.todoForm.get('dueDate')?.setValue(futureDateString);
      expect(component.todoForm.valid).toBe(true);
    });

    it('should require title field', () => {
      const titleControl = component.todoForm.get('title');
      expect(titleControl?.hasError('required')).toBe(true);
    });

    it('should not require description field', () => {
      const descriptionControl = component.todoForm.get('description');
      expect(descriptionControl?.hasError('required')).toBe(false);
    });

    describe('Priority Type Safety', () => {
      it('should handle valid priority values correctly', () => {
        const validPriorities: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];
        
        validPriorities.forEach(priority => {
          component.todoForm.get('priority')?.setValue(priority);
          expect(component.todoForm.get('priority')?.value).toBe(priority);
        });
      });

      it('should default to medium when priority is invalid or null', () => {
        component.todoForm.get('title')?.setValue('Test Todo');
        component.todoForm.get('priority')?.setValue(null);
        
        vi.spyOn(component.formSubmit, 'emit');
        component.onSubmit();
        
        expect(component.formSubmit.emit).toHaveBeenCalledWith(
          expect.objectContaining({
            priority: 'medium'
          })
        );
      });

      it('should handle empty string priority by defaulting to medium', () => {
        component.todoForm.get('title')?.setValue('Test Todo');
        component.todoForm.get('priority')?.setValue('');
        
        vi.spyOn(component.formSubmit, 'emit');
        component.onSubmit();
        
        expect(component.formSubmit.emit).toHaveBeenCalledWith(
          expect.objectContaining({
            priority: 'medium'
          })
        );
      });
    });

    describe('Due Date Validation', () => {
      it('should be invalid when due date is in the past', () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayString = yesterday.toISOString().split('T')[0];
        
        component.todoForm.get('title')?.setValue('Test Todo');
        component.todoForm.get('dueDate')?.setValue(yesterdayString);
        
        expect(component.todoForm.get('dueDate')?.hasError('pastDate')).toBe(true);
        expect(component.todoForm.invalid).toBe(true);
      });

      it('should be valid when due date is today', () => {
        const today = new Date();
        // Use local date formatting to get today's date in the current timezone
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const todayString = `${year}-${month}-${day}`;
        
        component.todoForm.get('title')?.setValue('Test Todo');
        component.todoForm.get('dueDate')?.setValue(todayString);
        
        expect(component.todoForm.get('dueDate')?.hasError('pastDate')).toBe(false);
        expect(component.todoForm.valid).toBe(true);
      });

      it('should be valid when due date is in the future', () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowString = tomorrow.toISOString().split('T')[0];
        
        component.todoForm.get('title')?.setValue('Test Todo');
        component.todoForm.get('dueDate')?.setValue(tomorrowString);
        
        expect(component.todoForm.get('dueDate')?.hasError('pastDate')).toBe(false);
        expect(component.todoForm.valid).toBe(true);
      });

      it('should be valid when due date is empty', () => {
        component.todoForm.get('title')?.setValue('Test Todo');
        component.todoForm.get('dueDate')?.setValue('');
        
        expect(component.todoForm.get('dueDate')?.hasError('pastDate')).toBe(false);
        expect(component.todoForm.valid).toBe(true);
      });
    });
  });

  describe('Form Submission', () => {
    it('should emit formSubmit event when form is submitted with valid data', () => {
      vi.spyOn(component.formSubmit, 'emit');
      
      const formData = {
        title: 'Test Todo',
        description: 'Test Description'
      };
      
      component.todoForm.patchValue(formData);
      component.onSubmit();

      const expectedRequest: CreateTodoRequest = {
        title: 'Test Todo',
        description: 'Test Description',
        priority: 'medium',
        dueDate: undefined
      };

      expect(component.formSubmit.emit).toHaveBeenCalledWith(expectedRequest);
    });

    it('should emit formSubmit event with priority and due date when provided', () => {
      vi.spyOn(component.formSubmit, 'emit');
      
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      const futureDateString = futureDate.toISOString().split('T')[0];
      
      const formData = {
        title: 'Test Todo',
        description: 'Test Description',
        priority: 'high',
        dueDate: futureDateString
      };
      
      component.todoForm.patchValue(formData);
      component.onSubmit();

      const expectedRequest: CreateTodoRequest = {
        title: 'Test Todo',
        description: 'Test Description',
        priority: 'high',
        dueDate: new Date(futureDateString)
      };

      expect(component.formSubmit.emit).toHaveBeenCalledWith(expectedRequest);
    });

    it('should emit formSubmit event with default priority when not specified', () => {
      vi.spyOn(component.formSubmit, 'emit');
      
      const formData = {
        title: 'Test Todo',
        description: 'Test Description'
      };
      
      component.todoForm.patchValue(formData);
      component.onSubmit();

      const expectedRequest: CreateTodoRequest = {
        title: 'Test Todo',
        description: 'Test Description',
        priority: 'medium'
      };

      expect(component.formSubmit.emit).toHaveBeenCalledWith(expectedRequest);
    });

    it('should not submit when form is invalid', () => {
      vi.spyOn(component.formSubmit, 'emit');
      
      component.todoForm.get('title')?.setValue('');
      component.onSubmit();

      expect(component.formSubmit.emit).not.toHaveBeenCalled();
    });

    it('should reset form after successful submission', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      const futureDateString = futureDate.toISOString().split('T')[0];
      
      component.todoForm.patchValue({
        title: 'Test Todo',
        description: 'Test Description',
        priority: 'high',
        dueDate: futureDateString
      });
      
      component.onSubmit();

      // Wait for async reset
      await new Promise(resolve => setTimeout(resolve, 350));

      expect(component.todoForm.get('title')?.value).toBe('');
      expect(component.todoForm.get('description')?.value).toBe('');
      expect(component.todoForm.get('priority')?.value).toBe('medium');
      expect(component.todoForm.get('dueDate')?.value).toBe('');
    });

    it('should set submitting state during submission', async () => {
      component.todoForm.patchValue({ title: 'Test Todo' });
      
      component.onSubmit();
      
      // Should be true immediately after submission
      expect(component.isSubmitting()).toBe(true);
      
      // Wait for async reset
      await new Promise(resolve => setTimeout(resolve, 350));
      
      // Should be false after async reset
      expect(component.isSubmitting()).toBe(false);
    });
  });

  describe('Template Rendering', () => {
    it('should render form fields', () => {
      const compiled = fixture.nativeElement;
      
      expect(compiled.querySelector('#title')).toBeTruthy();
      expect(compiled.querySelector('#description')).toBeTruthy();
      expect(compiled.querySelector('#priority')).toBeTruthy();
      expect(compiled.querySelector('#dueDate')).toBeTruthy();
    });

    it('should render submit button', () => {
      const compiled = fixture.nativeElement;
      const submitButton = compiled.querySelector('button[type="submit"]');
      
      expect(submitButton).toBeTruthy();
      expect(submitButton.textContent.trim()).toBe('Add Todo');
    });

    it('should disable submit button when form is invalid', () => {
      component.todoForm.get('title')?.setValue('');
      fixture.detectChanges();

      const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
      expect(submitButton.disabled).toBe(true);
    });

    it('should enable submit button when form is valid', () => {
      component.todoForm.get('title')?.setValue('Test Todo');
      fixture.detectChanges();

      const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
      expect(submitButton.disabled).toBe(false);
    });

    it('should render priority dropdown with correct options', () => {
      const compiled = fixture.nativeElement;
      const prioritySelect = compiled.querySelector('#priority');
      
      expect(prioritySelect).toBeTruthy();
      expect(prioritySelect.tagName).toBe('SELECT');
      
      const options = prioritySelect.querySelectorAll('option');
      expect(options.length).toBe(3);
      expect(options[0].value).toBe('low');
      expect(options[1].value).toBe('medium');
      expect(options[2].value).toBe('high');
    });

    it('should have medium as default selected priority', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      const prioritySelect = compiled.querySelector('#priority');
      
      expect(prioritySelect.value).toBe('medium');
    });

    it('should render date input with correct type', () => {
      const compiled = fixture.nativeElement;
      const dateInput = compiled.querySelector('#dueDate');
      
      expect(dateInput).toBeTruthy();
      expect(dateInput.type).toBe('date');
    });

    describe('Accessibility', () => {
      it('should have aria-describedby attribute on priority select', () => {
        const compiled = fixture.nativeElement;
        const prioritySelect = compiled.querySelector('#priority');
        
        expect(prioritySelect).toBeTruthy();
        expect(prioritySelect.getAttribute('aria-describedby')).toBe('priority-help');
      });

      it('should have aria-describedby attribute on due date input', () => {
        const compiled = fixture.nativeElement;
        const dueDateInput = compiled.querySelector('#dueDate');
        
        expect(dueDateInput).toBeTruthy();
        expect(dueDateInput.getAttribute('aria-describedby')).toBe('duedate-help');
      });

      it('should have proper aria-label for submit button', () => {
        const compiled = fixture.nativeElement;
        const submitButton = compiled.querySelector('button[type="submit"]');
        
        expect(submitButton).toBeTruthy();
        expect(submitButton.getAttribute('aria-label')).toBe('Add new todo item');
      });

      it('should have role attribute on form for screen readers', () => {
        const compiled = fixture.nativeElement;
        const form = compiled.querySelector('form');
        
        expect(form).toBeTruthy();
        expect(form.getAttribute('role')).toBe('form');
        expect(form.getAttribute('aria-label')).toBe('Add new todo form');
      });
    });
  });

  describe('Error Display', () => {
    it('should show error message when title is invalid and touched', () => {
      const titleControl = component.todoForm.get('title');
      titleControl?.setValue('');
      titleControl?.markAsTouched();
      fixture.detectChanges();

      const errorElement = fixture.nativeElement.querySelector('.error-message');
      expect(errorElement).toBeTruthy();
    });

    it('should not show error message when title is valid', () => {
      const titleControl = component.todoForm.get('title');
      titleControl?.setValue('Test Todo');
      titleControl?.markAsTouched();
      fixture.detectChanges();

      const errorElement = fixture.nativeElement.querySelector('.error-message');
      expect(errorElement).toBeFalsy();
    });
  });

  describe('Tag Management System - TDD Tests', () => {
    describe('Tag Input Functionality', () => {
      it('should have tags FormArray in the form', () => {
        expect(component.todoForm.get('tags')).toBeTruthy();
        expect(component.todoForm.get('tags')?.value).toEqual([]);
      });

      it('should have currentTagInput signal for managing tag input state', () => {
        expect(component.currentTagInput).toBeTruthy();
        expect(component.currentTagInput()).toBe('');
      });

      it('should add tag when addTag method is called with valid input', () => {
        component.currentTagInput.set('work');
        component.addTag();
        
        const tagsArray = component.todoForm.get('tags')?.value as string[];
        expect(tagsArray).toContain('work');
        expect(component.currentTagInput()).toBe('');
      });

      it('should add tag when Enter key is pressed in tag input', () => {
        component.currentTagInput.set('urgent');
        component.onTagInputKeyDown({ key: 'Enter', preventDefault: vi.fn() } as unknown as KeyboardEvent);
        
        const tagsArray = component.todoForm.get('tags')?.value as string[];
        expect(tagsArray).toContain('urgent');
      });

      it('should add tag when comma is entered in tag input', () => {
        component.currentTagInput.set('home');
        component.onTagInputKeyDown({ key: ',', preventDefault: vi.fn() } as unknown as KeyboardEvent);
        
        const tagsArray = component.todoForm.get('tags')?.value as string[];
        expect(tagsArray).toContain('home');
      });

      it('should trim whitespace from tags before adding', () => {
        component.currentTagInput.set('  spaced  ');
        component.addTag();
        
        const tagsArray = component.todoForm.get('tags')?.value as string[];
        expect(tagsArray).toContain('spaced');
        expect(tagsArray).not.toContain('  spaced  ');
      });
    });

    describe('Tag Validation', () => {
      it('should not add empty tags', () => {
        component.currentTagInput.set('');
        component.addTag();
        
        const tagsArray = component.todoForm.get('tags')?.value as string[];
        expect(tagsArray).toEqual([]);
      });

      it('should not add whitespace-only tags', () => {
        component.currentTagInput.set('   ');
        component.addTag();
        
        const tagsArray = component.todoForm.get('tags')?.value as string[];
        expect(tagsArray).toEqual([]);
      });

      it('should not add duplicate tags', () => {
        component.currentTagInput.set('work');
        component.addTag();
        component.currentTagInput.set('work');
        component.addTag();
        
        const tagsArray = component.todoForm.get('tags')?.value as string[];
        expect(tagsArray.filter((tag: string) => tag === 'work')).toHaveLength(1);
      });

      it('should not add duplicate tags (case insensitive)', () => {
        component.currentTagInput.set('Work');
        component.addTag();
        component.currentTagInput.set('WORK');
        component.addTag();
        
        const tagsArray = component.todoForm.get('tags')?.value as string[];
        expect(tagsArray).toHaveLength(1);
        expect(tagsArray[0]).toBe('Work');
      });

      it('should enforce maximum tag length limit', () => {
        const longTag = 'a'.repeat(51); // Assuming 50 char limit
        component.currentTagInput.set(longTag);
        component.addTag();
        
        const tagsArray = component.todoForm.get('tags')?.value as string[];
        expect(tagsArray).toEqual([]);
      });

      it('should enforce maximum number of tags limit', () => {
        // Add 10 tags (assuming 10 is the limit)
        for (let i = 1; i <= 11; i++) {
          component.currentTagInput.set(`tag${i}`);
          component.addTag();
        }
        
        const tagsArray = component.todoForm.get('tags')?.value as string[];
        expect(tagsArray).toHaveLength(10);
        expect(tagsArray).not.toContain('tag11');
      });
    });

    describe('Tag Chip Display and Removal', () => {
      beforeEach(() => {
        // Add some test tags
        component.currentTagInput.set('work');
        component.addTag();
        component.currentTagInput.set('urgent');
        component.addTag();
        fixture.detectChanges();
      });

      it('should display tag chips for existing tags', () => {
        fixture.detectChanges();
        const tagChips = fixture.nativeElement.querySelectorAll('.tag-chip');
        expect(tagChips.length).toBe(2);
      });

      it('should display correct tag text in chips', () => {
        fixture.detectChanges();
        const tagChips = fixture.nativeElement.querySelectorAll('.tag-chip');
        const tagTexts = Array.from(tagChips as NodeListOf<Element>).map((chip: Element) => {
          // Extract just the tag text (before the remove button)
          const textNode = chip.childNodes[0];
          return textNode ? textNode.textContent?.trim() : '';
        });
        expect(tagTexts).toContain('work');
        expect(tagTexts).toContain('urgent');
      });

      it('should have remove button for each tag chip', () => {
        fixture.detectChanges();
        const removeButtons = fixture.nativeElement.querySelectorAll('.tag-remove-btn');
        expect(removeButtons.length).toBe(2);
      });

      it('should remove tag when remove button is clicked', () => {
        fixture.detectChanges();
        const removeButtons = fixture.nativeElement.querySelectorAll('.tag-remove-btn');
        removeButtons[0].click();
        fixture.detectChanges();
        
        const tagsArray = component.todoForm.get('tags')?.value as string[];
        expect(tagsArray).toHaveLength(1);
        expect(tagsArray).not.toContain('work');
      });

      it('should call removeTag method with correct index', () => {
        vi.spyOn(component, 'removeTag');
        fixture.detectChanges();
        const removeButtons = fixture.nativeElement.querySelectorAll('.tag-remove-btn');
        removeButtons[1].click();
        
        expect(component.removeTag).toHaveBeenCalledWith(1);
      });
    });

    describe('Form Integration with Tags', () => {
      it('should include tags in form submission when tags are present', () => {
        vi.spyOn(component.formSubmit, 'emit');
        
        component.todoForm.patchValue({ title: 'Test Todo' });
        component.currentTagInput.set('work');
        component.addTag();
        component.currentTagInput.set('urgent');
        component.addTag();
        
        component.onSubmit();

        const expectedRequest: CreateTodoRequest = {
          title: 'Test Todo',
          priority: 'medium',
          tags: ['work', 'urgent']
        };

        expect(component.formSubmit.emit).toHaveBeenCalledWith(expectedRequest);
      });

      it('should not include tags field when no tags are added', () => {
        vi.spyOn(component.formSubmit, 'emit');
        
        component.todoForm.patchValue({ title: 'Test Todo' });
        component.onSubmit();

        const expectedRequest: CreateTodoRequest = {
          title: 'Test Todo',
          priority: 'medium'
        };

        expect(component.formSubmit.emit).toHaveBeenCalledWith(expectedRequest);
      });

      it('should reset tags when form is reset after submission', async () => {
        component.todoForm.patchValue({ title: 'Test Todo' });
        component.currentTagInput.set('work');
        component.addTag();
        
        component.onSubmit();

        // Wait for async reset
        await new Promise(resolve => setTimeout(resolve, 350));

        const tagsArray = component.todoForm.get('tags')?.value as string[];
        expect(tagsArray).toEqual([]);
      });

      it('should maintain form validity with tags added', () => {
        component.todoForm.patchValue({ title: 'Test Todo' });
        component.currentTagInput.set('work');
        component.addTag();
        
        expect(component.todoForm.valid).toBe(true);
      });
    });

    describe('Tag Input Template Elements', () => {
      it('should render tag input field', () => {
        const tagInput = fixture.nativeElement.querySelector('#tagInput');
        expect(tagInput).toBeTruthy();
        expect(tagInput.type).toBe('text');
      });

      it('should render tag chips container', () => {
        const tagsContainer = fixture.nativeElement.querySelector('.tags-container');
        expect(tagsContainer).toBeTruthy();
      });

      it('should have proper accessibility attributes for tag input', () => {
        const tagInput = fixture.nativeElement.querySelector('#tagInput');
        expect(tagInput.getAttribute('aria-label')).toBeTruthy();
        expect(tagInput.getAttribute('placeholder')).toBeTruthy();
      });

      it('should bind tag input value to currentTagInput signal', () => {
        const tagInput = fixture.nativeElement.querySelector('#tagInput');
        tagInput.value = 'test-tag';
        tagInput.dispatchEvent(new Event('input'));
        fixture.detectChanges();
        
        expect(component.currentTagInput()).toBe('test-tag');
      });
    });
  });

  describe('Enhanced Error Handling and Display', () => {
    describe('Due Date Error Display', () => {
      it('should show error message when due date is in the past and touched', () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayString = yesterday.toISOString().split('T')[0];
        
        const dueDateControl = component.todoForm.get('dueDate');
        dueDateControl?.setValue(yesterdayString);
        dueDateControl?.markAsTouched();
        fixture.detectChanges();

        const errorElement = fixture.nativeElement.querySelector('.error-message');
        expect(errorElement).toBeTruthy();
        expect(errorElement.textContent.trim()).toBe('Due date cannot be in the past');
      });

      it('should not show error message when due date is valid', () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowString = tomorrow.toISOString().split('T')[0];
        
        const dueDateControl = component.todoForm.get('dueDate');
        dueDateControl?.setValue(tomorrowString);
        dueDateControl?.markAsTouched();
        fixture.detectChanges();

        const errorElements = fixture.nativeElement.querySelectorAll('.error-message');
        const dueDateError = Array.from(errorElements as NodeListOf<HTMLElement>).find((el: HTMLElement) => 
          el.textContent?.includes('Due date cannot be in the past')
        );
        expect(dueDateError).toBeFalsy();
      });
    });

    describe('Tag Validation Error Display', () => {
      it('should show error when adding empty tag', () => {
        component.currentTagInput.set('');
        component.addTag();
        fixture.detectChanges();

        expect(component.tagError()).toBe('Tag cannot be empty');
        const errorElement = fixture.nativeElement.querySelector('.error-message');
        expect(errorElement.textContent.trim()).toBe('Tag cannot be empty');
      });

      it('should show error when adding tag exceeding max length', () => {
        const longTag = 'a'.repeat(51);
        component.currentTagInput.set(longTag);
        component.addTag();
        fixture.detectChanges();

        expect(component.tagError()).toBe('Tag cannot exceed 50 characters');
      });

      it('should show error when adding duplicate tag', () => {
        component.currentTagInput.set('work');
        component.addTag();
        component.currentTagInput.set('work');
        component.addTag();
        fixture.detectChanges();

        expect(component.tagError()).toBe('Tag already exists');
      });

      it('should show error when exceeding max tags count', () => {
        // Add 10 tags
        for (let i = 1; i <= 10; i++) {
          component.currentTagInput.set(`tag${i}`);
          component.addTag();
        }
        // Try to add 11th tag
        component.currentTagInput.set('tag11');
        component.addTag();
        fixture.detectChanges();

        expect(component.tagError()).toBe('Maximum 10 tags allowed');
      });

      it('should clear error when valid tag is added successfully', () => {
        // First create an error
        component.currentTagInput.set('');
        component.addTag();
        expect(component.tagError()).toBe('Tag cannot be empty');
        
        // Then add valid tag
        component.currentTagInput.set('valid');
        component.addTag();
        
        expect(component.tagError()).toBe('');
      });
    });

    describe('Loading State Display', () => {
      it('should show loading spinner and text during submission', () => {
        component.isSubmitting.set(true);
        fixture.detectChanges();

        const button = fixture.nativeElement.querySelector('button[type="submit"]');
        expect(button.textContent.trim()).toContain('Adding...');
        
        const spinner = button.querySelector('svg.animate-spin');
        expect(spinner).toBeTruthy();
      });

      it('should show normal text when not submitting', () => {
        component.isSubmitting.set(false);
        fixture.detectChanges();

        const button = fixture.nativeElement.querySelector('button[type="submit"]');
        expect(button.textContent.trim()).toBe('Add Todo');
        
        const spinner = button.querySelector('svg.animate-spin');
        expect(spinner).toBeFalsy();
      });
    });
  });

  describe('Integration Tests - Complete Form Workflow', () => {
    it('should handle complete form submission workflow with all fields', async () => {
      vi.spyOn(component.formSubmit, 'emit');
      
      // Fill out all form fields
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      const futureDateString = futureDate.toISOString().split('T')[0];
      
      component.todoForm.patchValue({
        title: 'Complete Integration Test Todo',
        description: 'Testing complete workflow',
        priority: 'high',
        dueDate: futureDateString
      });
      
      // Add tags
      component.currentTagInput.set('integration');
      component.addTag();
      component.currentTagInput.set('testing');
      component.addTag();
      
      expect(component.todoForm.valid).toBe(true);
      expect(component.currentTags()).toEqual(['integration', 'testing']);
      
      // Submit form
      component.onSubmit();
      
      // Verify emission
      const expectedRequest: CreateTodoRequest = {
        title: 'Complete Integration Test Todo',
        description: 'Testing complete workflow',
        priority: 'high',
        dueDate: new Date(futureDateString),
        tags: ['integration', 'testing']
      };
      
      expect(component.formSubmit.emit).toHaveBeenCalledWith(expectedRequest);
      expect(component.isSubmitting()).toBe(true);
      
      // Wait for async reset
      await new Promise(resolve => setTimeout(resolve, 350));
      
      // Verify form reset
      expect(component.todoForm.get('title')?.value).toBe('');
      expect(component.todoForm.get('description')?.value).toBe('');
      expect(component.todoForm.get('priority')?.value).toBe('medium');
      expect(component.todoForm.get('dueDate')?.value).toBe('');
      expect(component.currentTags()).toEqual([]);
      expect(component.tagError()).toBe('');
      expect(component.isSubmitting()).toBe(false);
    });

    it('should handle form submission with validation errors', () => {
      vi.spyOn(component.formSubmit, 'emit');
      
      // Set past date and empty title
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toISOString().split('T')[0];
      
      component.todoForm.patchValue({
        title: '',
        dueDate: yesterdayString
      });
      
      // Mark fields as touched to trigger validation display
      component.todoForm.get('title')?.markAsTouched();
      component.todoForm.get('dueDate')?.markAsTouched();
      
      expect(component.todoForm.invalid).toBe(true);
      
      // Try to submit
      component.onSubmit();
      
      // Should not emit
      expect(component.formSubmit.emit).not.toHaveBeenCalled();
      expect(component.isSubmitting()).toBe(false);
    });

    it('should handle tag validation errors during workflow', () => {
      component.todoForm.patchValue({ title: 'Test Todo' });
      
      // Try to add invalid tags
      component.currentTagInput.set('');
      component.addTag();
      expect(component.tagError()).toBe('Tag cannot be empty');
      
      // Add valid tag
      component.currentTagInput.set('valid');
      component.addTag();
      expect(component.tagError()).toBe('');
      expect(component.currentTags()).toEqual(['valid']);
      
      // Try duplicate
      component.currentTagInput.set('valid');
      component.addTag();
      expect(component.tagError()).toBe('Tag already exists');
      expect(component.currentTags()).toEqual(['valid']);
    });

    it('should maintain accessibility during complete workflow', () => {
      fixture.detectChanges();
      
      // Check initial accessibility
      const form = fixture.nativeElement.querySelector('form');
      expect(form.getAttribute('role')).toBe('form');
      expect(form.getAttribute('aria-label')).toBe('Add new todo form');
      
      // Fill form and trigger errors
      const titleControl = component.todoForm.get('title');
      titleControl?.setValue('');
      titleControl?.markAsTouched();
      fixture.detectChanges();
      
      // Check error message accessibility
      const errorMessage = fixture.nativeElement.querySelector('.error-message');
      expect(errorMessage).toBeTruthy();
      
      // Add tags and check tag accessibility
      component.currentTagInput.set('test');
      component.addTag();
      fixture.detectChanges();
      
      const removeButton = fixture.nativeElement.querySelector('.tag-remove-btn');
      expect(removeButton.getAttribute('aria-label')).toContain('Remove tag test');
    });
  });
});