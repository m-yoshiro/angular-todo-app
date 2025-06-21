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
        const todayString = today.toISOString().split('T')[0];
        
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

    it('should reset form after successful submission', () => {
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

      expect(component.todoForm.get('title')?.value).toBe('');
      expect(component.todoForm.get('description')?.value).toBe('');
      expect(component.todoForm.get('priority')?.value).toBe('medium');
      expect(component.todoForm.get('dueDate')?.value).toBe('');
    });

    it('should set submitting state during submission', () => {
      component.todoForm.patchValue({ title: 'Test Todo' });
      
      component.onSubmit();
      
      // Should be false after synchronous submission
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
});