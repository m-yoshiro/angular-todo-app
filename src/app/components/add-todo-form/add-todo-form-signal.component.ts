/**
 * @fileoverview Signal-based form component for creating new todo items.
 * @description Experimental implementation using Angular 20 signal-based forms instead
 * of reactive forms. Provides identical functionality to AddTodoFormComponent for
 * performance and architectural comparison.
 */

import { Component, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreateTodoRequest } from '../../models/todo.model';
import { 
  formSignal, 
  arrayFieldSignal, 
  Validators, 
  ValidationError,
  createTodoFormSignal 
} from '../../utils/signal-forms';

/**
 * Experimental signal-based form component for creating new todo items.
 * @description Provides identical functionality to AddTodoFormComponent using
 * signal-based form management instead of reactive forms. Designed for
 * performance comparison and architectural exploration.
 * 
 * Features:
 * - Signal-based form validation with immediate feedback
 * - Priority level selection with visual indicators
 * - Due date validation (prevents past dates)
 * - Tag management system with validation
 * - Type-safe form handling with TypeScript
 * - Accessibility support with proper labeling
 * - Loading states during form submission
 * 
 * @example
 * ```html
 * <app-add-todo-form-signal
 *   (formSubmit)="onCreateTodo($event)">
 * </app-add-todo-form-signal>
 * ```
 */
@Component({
  selector: 'app-add-todo-form-signal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-todo-form-signal.component.html',
  styleUrl: './add-todo-form-signal.component.scss'
})
export class AddTodoFormSignalComponent {
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
  
  /** Signal-based form using our custom utilities */
  todoForm = createTodoFormSignal();
  
  /** Signal-based array for tag management */
  tagsArray = arrayFieldSignal<string>([]);
  
  /** Signal for managing current tag input value */
  currentTagInput = signal('');
  
  /** Signal for tag validation error messages */
  tagError = signal<string>('');
  
  /** Maximum tag length allowed */
  readonly MAX_TAG_LENGTH = 50;
  
  /** Maximum number of tags allowed */
  readonly MAX_TAGS_COUNT = 10;
  
  /**
   * Computed signal for current tags array
   */
  readonly currentTags = computed(() => this.tagsArray.items());
  
  /**
   * Computed signal that determines if the form should be disabled.
   * @description Returns true if the title field is empty/whitespace or if the form has validation errors,
   * providing immediate feedback to users about form completeness and validity.
   */
  readonly isFormDisabled = computed(() => {
    const titleValue = this.todoForm.get('title').value().trim();
    const hasEmptyTitle = !titleValue || titleValue.length === 0;
    const hasValidationErrors = this.todoForm.invalid();
    
    return hasEmptyTitle || hasValidationErrors;
  });
  
  /**
   * Computed signal for title field validation state
   */
  readonly titleErrors = computed(() => this.todoForm.get('title').errors());
  
  /**
   * Computed signal for due date field validation state
   */
  readonly dueDateErrors = computed(() => this.todoForm.get('dueDate').errors());
  
  /**
   * Validates and ensures priority value is within allowed options.
   * @param priority - The priority value from the form
   * @returns A valid priority value, defaulting to 'medium' if invalid
   */
  private validatePriority(priority: string | null | undefined): 'low' | 'medium' | 'high' {
    const validPriorities: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];
    return validPriorities.includes(priority as 'low' | 'medium' | 'high') 
      ? (priority as 'low' | 'medium' | 'high') 
      : 'medium';
  }
  
  /**
   * Adds a new tag to the tags array.
   * @description Validates the tag input, checks for duplicates, length limits,
   * and maximum tag count before adding to the array.
   */
  addTag(): void {
    const tagValue = this.currentTagInput().trim();
    
    // Clear previous error
    this.tagError.set('');
    
    // Validate tag input
    if (!tagValue || tagValue.length === 0) {
      this.tagError.set('Tag cannot be empty');
      return;
    }
    
    // Check tag length limit
    if (tagValue.length > this.MAX_TAG_LENGTH) {
      this.tagError.set(`Tag cannot exceed ${this.MAX_TAG_LENGTH} characters`);
      return;
    }
    
    // Check maximum tags count
    if (this.tagsArray.length() >= this.MAX_TAGS_COUNT) {
      this.tagError.set(`Maximum ${this.MAX_TAGS_COUNT} tags allowed`);
      return;
    }
    
    // Check for duplicates (case insensitive)
    const currentTags = this.tagsArray.items();
    const isDuplicate = currentTags.some((tag: string) => 
      tag.toLowerCase() === tagValue.toLowerCase()
    );
    
    if (isDuplicate) {
      this.tagError.set('Tag already exists');
      return;
    }
    
    // Add tag to array
    this.tagsArray.push(tagValue);
    this.currentTagInput.set('');
  }
  
  /**
   * Removes a tag from the tags array at the specified index.
   * @param index - The index of the tag to remove
   */
  removeTag(index: number): void {
    this.tagsArray.removeAt(index);
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
   * Handles title input changes
   */
  onTitleChange(value: string): void {
    this.todoForm.get('title').setValue(value);
  }
  
  /**
   * Handles description input changes
   */
  onDescriptionChange(value: string): void {
    this.todoForm.get('description').setValue(value);
  }
  
  /**
   * Handles priority selection changes
   */
  onPriorityChange(value: string): void {
    this.todoForm.get('priority').setValue(value as 'low' | 'medium' | 'high');
  }
  
  /**
   * Handles due date input changes
   */
  onDueDateChange(value: string): void {
    this.todoForm.get('dueDate').setValue(value);
  }
  
  /**
   * Handles tag input value changes
   */
  onTagInputChange(value: string): void {
    this.currentTagInput.set(value);
  }
  
  /**
   * Handles form submission with validation and data transformation.
   * @description Validates the form, creates a properly typed request object,
   * emits the form data, and resets the form to its initial state.
   */
  onSubmit(): void {
    if (this.todoForm.valid()) {
      this.isSubmitting.set(true);
      
      const formValue = this.todoForm.value();
      const tags = this.tagsArray.items();
      
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
        // Reset form
        this.todoForm.reset();
        
        // Reset tags array
        this.tagsArray.clear();
        
        // Reset tags and error signals
        this.tagError.set('');
        this.currentTagInput.set('');
        
        this.isSubmitting.set(false);
      }, 300);
    }
  }
}