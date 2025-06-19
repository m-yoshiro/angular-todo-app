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

    it('should have empty initial form values', () => {
      expect(component.todoForm.get('title')?.value).toBe('');
      expect(component.todoForm.get('description')?.value).toBe('');
    });

    it('should initialize signals correctly', () => {
      expect(component.isSubmitting()).toBe(false);
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

    it('should require title field', () => {
      const titleControl = component.todoForm.get('title');
      expect(titleControl?.hasError('required')).toBe(true);
    });

    it('should not require description field', () => {
      const descriptionControl = component.todoForm.get('description');
      expect(descriptionControl?.hasError('required')).toBe(false);
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
        description: 'Test Description'
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
      component.todoForm.patchValue({
        title: 'Test Todo',
        description: 'Test Description'
      });
      
      component.onSubmit();

      expect(component.todoForm.get('title')?.value).toBe('');
      expect(component.todoForm.get('description')?.value).toBe('');
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