/**
 * @fileoverview Todo list component that displays and manages the collection of todo items.
 * @description This standalone component renders the complete list of todos using Angular 20's
 * new control flow syntax (@for) and signal-based reactivity. Integrates with TodoService
 * for state management and includes both TodoItem components for individual item rendering
 * and AddTodoForm component for creating new todos with full form integration.
 */

import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TodoService } from '../../services/todo.service';
import { ConfirmationService } from '../../services/confirmation.service';
import { TodoItemComponent } from '../todo-item/todo-item.component';
import { AddTodoFormComponent } from '../add-todo-form/add-todo-form.component';
import { TodoFilterComponent } from '../todo-filter/todo-filter.component';
import { TodoSortComponent } from '../todo-sort/todo-sort.component';
import { CreateTodoRequest } from '../../models/todo.model';

/**
 * Standalone component for displaying the complete list of todos with form integration.
 * @description Main todo listing component that uses signal-based state management
 * and Angular 20's new template syntax. Integrates TodoItem components for individual
 * item management and AddTodoForm component for creating new todos. Provides a complete
 * todo management interface with proper accessibility and error handling.
 */
@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [CommonModule, TodoItemComponent, AddTodoFormComponent, TodoFilterComponent, TodoSortComponent],
  templateUrl: './todo-list.component.html',
  styleUrl: './todo-list.component.scss'
})
export class TodoListComponent {
  /**
   * Injected TodoService for accessing todo data and operations
   */
  public readonly todoService = inject(TodoService);

  /**
   * Injected ConfirmationService for handling user confirmations
   */
  public readonly confirmationService = inject(ConfirmationService);

  /**
   * Computed signal for accessing sorted and filtered todos reactively
   */
  public readonly todos = computed(() => this.todoService.sortedAndFilteredTodos());

  /**
   * Computed signal for accessing todo statistics
   */
  public readonly stats = computed(() => this.todoService.stats());

  /**
   * Handles form submission from AddTodoForm component.
   * @description Delegates todo creation to TodoService without any business logic.
   * All validation and error handling is handled by the service layer.
   * @param createRequest - The todo creation request from the form
   */
  onAddTodo(createRequest: CreateTodoRequest): void {
    this.todoService.addTodo(createRequest);
  }

  /**
   * Handles todo deletion with user confirmation.
   * @description Delegates to ConfirmationService for user confirmation and
   * TodoService for actual deletion. No business logic or error handling in component.
   * @param id - The unique identifier of the todo to delete
   */
  async onDeleteTodo(id: string): Promise<void> {
    const confirmed = await this.confirmationService.confirmDeleteTodo();
    if (confirmed) {
      this.todoService.deleteTodo(id);
    }
  }

  /**
   * Handles todo completion toggle.
   * @description Delegates to TodoService for todo completion status toggling.
   * No business logic or error handling in component.
   * @param id - The unique identifier of the todo to toggle
   */
  onToggleTodo(id: string): void {
    this.todoService.toggleTodo(id);
  }
}