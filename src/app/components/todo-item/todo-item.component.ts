/**
 * @fileoverview Individual todo item component for displaying and managing single todo entries.
 * @description This standalone component handles the presentation and inline editing of todo items,
 * using Angular 20's new input/output functions and signal-based reactivity. Supports completion
 * toggling, inline editing, deletion, and displays priority indicators and due date information.
 */

import { Component, input, output, signal, computed, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Todo } from '../../models/todo.model';

/**
 * Standalone component for rendering and managing individual todo items.
 * @description Displays a single todo item with interactive controls for completion,
 * inline editing, and deletion. Uses Angular 20's signal-based reactivity and new
 * input/output functions for optimal performance and clear data flow.
 * 
 * Features:
 * - Toggle completion status
 * - Inline editing with save/cancel
 * - Priority visual indicators
 * - Due date display with overdue detection
 * - Responsive design with accessibility support
 * 
 * @example
 * ```html
 * <app-todo-item 
 *   [todo]="todoItem"
 *   (toggleComplete)="onToggleComplete($event)"
 *   (editTodo)="onEditTodo($event)"
 *   (deleteTodo)="onDeleteTodo($event)">
 * </app-todo-item>
 * ```
 */
@Component({
  selector: 'app-todo-item',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './todo-item.component.html',
  styleUrl: './todo-item.component.scss'
})
export class TodoItemComponent {
  /** Required input containing the todo item to display */
  todo = input.required<Todo>();
  
  /** Event emitted when the todo completion status should be toggled */
  toggleComplete = output<string>();
  /** Event emitted when the todo has been edited and should be saved */
  editTodo = output<Todo>();
  /** Event emitted when the todo should be deleted */
  deleteTodo = output<string>();

  /** Signal tracking whether the component is currently in edit mode */
  isEditing = signal(false);
  /** Signal containing the edited title during inline editing */
  editTitle = signal('');
  /** Signal containing the edited description during inline editing */
  editDescription = signal('');

  /** Reference to the title input element for focus management */
  @ViewChild('titleInput') titleInput?: ElementRef<HTMLInputElement>;

  /** 
   * Computed signal determining if the todo is overdue.
   * @description Returns true if the todo has a due date that has passed
   * and the todo is not yet completed.
   */
  isOverdue = computed(() => {
    const todo = this.todo();
    if (!todo.dueDate || todo.completed) return false;
    return new Date(todo.dueDate).getTime() < Date.now();
  });

  /** 
   * Computed signal providing CSS class name based on todo priority.
   * @description Returns a CSS class name for styling the todo based on its priority level.
   */
  priorityClass = computed(() => {
    const priority = this.todo().priority;
    return `priority-${priority}`;
  });

  /** 
   * Computed signal providing formatted due date string.
   * @description Returns a localized date string or null if no due date is set.
   */
  dueDateFormatted = computed(() => {
    const dueDate = this.todo().dueDate;
    if (!dueDate) return null;
    return new Date(dueDate).toLocaleDateString();
  });

  /** Handles click events on the completion checkbox */
  onToggleComplete(): void {
    this.toggleComplete.emit(this.todo().id);
  }

  /** 
   * Initiates inline editing mode for the todo item.
   * @description Populates edit fields with current values and focuses the title input.
   */
  onEdit(): void {
    this.editTitle.set(this.todo().title);
    this.editDescription.set(this.todo().description || '');
    this.isEditing.set(true);
    
    // Focus the title input after the view updates
    setTimeout(() => {
      this.titleInput?.nativeElement.focus();
    });
  }

  /** 
   * Saves the edited todo and exits edit mode.
   * @description Creates an updated todo object with the edited values and emits it.
   */
  onSave(): void {
    const updatedTodo: Todo = {
      ...this.todo(),
      title: this.editTitle(),
      description: this.editDescription(),
      updatedAt: new Date()
    };
    this.editTodo.emit(updatedTodo);
    this.isEditing.set(false);
  }

  /** 
   * Cancels editing and resets edit state.
   * @description Exits edit mode without saving changes and clears edit fields.
   */
  onCancel(): void {
    this.isEditing.set(false);
    this.editTitle.set('');
    this.editDescription.set('');
  }

  /** Handles delete button clicks by emitting the todo ID */
  onDelete(): void {
    this.deleteTodo.emit(this.todo().id);
  }
}