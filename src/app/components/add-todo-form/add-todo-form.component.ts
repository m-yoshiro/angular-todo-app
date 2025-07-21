/**
 * @fileoverview Form component for creating new todo items with validation and type safety.
 * @description This standalone component provides a reactive form for todo creation with
 * comprehensive validation, priority selection, and due date handling. Uses Angular 20's
 * inject function and reactive forms with custom validators for robust data input.
 */

import { Component, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormArray } from '@angular/forms';
import { CreateTodoRequest } from '../../models/todo.model';
import { TodoValidationService } from '../../services/todo-validation.service';

/**
 * Standalone form component for creating new todo items.
 * @description Provides a comprehensive form interface for todo creation with validation,
 * priority selection, and due date management. Uses reactive forms with custom validators
 * and Angular 20's signal-based state management for optimal performance.
 * 
 * Features:
 * - Reactive form validation with immediate feedback
 * - Priority level selection with visual indicators
 * - Due date validation (prevents past dates)
 * - Type-safe form handling with TypeScript
 * - Accessibility support with proper labeling
 * - Loading states during form submission
 * 
 * @example
 * ```html
 * <app-add-todo-form 
 *   (formSubmit)="onCreateTodo($event)">
 * </app-add-todo-form>
 * ```
 */
@Component({
  selector: 'app-add-todo-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-todo-form.component.html',
  styleUrl: './add-todo-form.component.scss'
})
export class AddTodoFormComponent {
  /** Injected FormBuilder service for creating reactive forms */
  private fb = inject(FormBuilder);
  
  /** Injected validation service for centralized validation logic */
  private validationService = inject(TodoValidationService);
  
  /** Event emitted when the form is submitted with valid data */
  formSubmit = output<CreateTodoRequest>();
  
  /** Signal tracking form submission state for UI feedback */
  isSubmitting = signal(false);
  
  /** Available priority options for the dropdown selection */
  priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' }
  ];
  
  /** 
   * Reactive form group with validation rules for todo creation.
   * @description Defines form controls with validators from TodoValidationService,
   * providing centralized validation logic and consistent error handling.
   */
  todoForm = this.fb.group({
    title: ['', [
      Validators.required, 
      this.validationService.titleValidator()
    ]],
    description: ['', [
      this.validationService.descriptionValidator()
    ]],
    priority: ['medium'],
    dueDate: ['', [
      this.validationService.dueDateValidator()
    ]],
    tags: this.fb.array([])
  });

  /** Signal for managing current tag input value */
  currentTagInput = signal('');

  /** Signal for current tags array that updates with form changes */
  currentTags = signal<string[]>([]);

  /** Signal for tag validation error messages */
  tagError = signal<string>('');


  /**
   * Validates and ensures priority value is within allowed options.
   * @param priority - The priority value from the form
   * @returns A valid priority value, defaulting to 'medium' if invalid
   */
  private validatePriority(priority: string | null | undefined): 'low' | 'medium' | 'high' {
    const validPriorities: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];
    return validPriorities.includes(priority as 'low' | 'medium' | 'high') ? (priority as 'low' | 'medium' | 'high') : 'medium';
  }

  /**
   * Gets the tags FormArray from the form.
   * @returns The tags FormArray
   */
  private get tagsArray(): FormArray {
    return this.todoForm.get('tags') as FormArray;
  }

  /**
   * Adds a new tag to the tags array using centralized validation.
   * @description Uses TodoValidationService to validate tag input with
   * consistent business rules and error messaging.
   */
  addTag(): void {
    const tagValue = this.currentTagInput().trim();
    const currentTags = this.tagsArray.value;
    
    // Clear previous error
    this.tagError.set('');
    
    // Use validation service for centralized tag validation
    const validationResult = this.validationService.validateNewTag(tagValue, currentTags);
    
    if (!validationResult.valid) {
      this.tagError.set(validationResult.error || 'Invalid tag');
      return;
    }

    // Add tag to form array
    this.tagsArray.push(this.fb.control(tagValue));
    this.currentTagInput.set('');
    
    // Update the signal
    this.currentTags.set(this.tagsArray.value);
  }

  /**
   * Removes a tag from the tags array at the specified index.
   * @param index - The index of the tag to remove
   */
  removeTag(index: number): void {
    if (index >= 0 && index < this.tagsArray.length) {
      this.tagsArray.removeAt(index);
      // Update the signal
      this.currentTags.set(this.tagsArray.value);
    }
  }

  /**
   * Handles keyboard events for tag input.
   * @param event - The keyboard event
   */
  onTagInputKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      this.addTag();
    }
  }

  /**
   * Computed getter that determines if the form should be disabled.
   * @description Returns true if the title field is empty/whitespace or if the form has validation errors,
   * providing immediate feedback to users about form completeness and validity.
   * @returns boolean indicating if the submit button should be disabled
   */
  get isFormDisabled(): boolean {
    const titleValue = this.todoForm.get('title')?.value?.trim();
    const hasEmptyTitle = !titleValue || titleValue.length === 0;
    const hasValidationErrors = this.todoForm.invalid;
    
    return hasEmptyTitle || hasValidationErrors;
  }

  /**
   * Handles form submission with validation and data transformation.
   * @description Validates the form, creates a properly typed request object,
   * emits the form data, and resets the form to its initial state.
   */
  onSubmit(): void {
    if (this.todoForm.valid) {
      this.isSubmitting.set(true);
      
      const formValue = this.todoForm.value;
      const tags = this.tagsArray.value;
      
      const createRequest: CreateTodoRequest = {
        title: formValue.title || '',
        description: formValue.description || undefined,
        priority: this.validatePriority(formValue.priority),
        dueDate: formValue.dueDate ? new Date(formValue.dueDate) : undefined,
        ...(tags.length > 0 && { tags })
      };
      
      this.formSubmit.emit(createRequest);
      
      // Simulate async operation for better UX - show loading state briefly
      setTimeout(() => {
        this.todoForm.reset({
          title: '',
          description: '',
          priority: 'medium',
          dueDate: ''
        });
        
        // Reset tags array
        while (this.tagsArray.length !== 0) {
          this.tagsArray.removeAt(0);
        }
        
        // Reset tags and error signals
        this.currentTags.set([]);
        this.tagError.set('');
        
        this.isSubmitting.set(false);
      }, 300);
    }
  }
}