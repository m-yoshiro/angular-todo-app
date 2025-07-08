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
import { TodoItemComponent } from '../todo-item/todo-item.component';
import { AddTodoFormComponent } from '../add-todo-form/add-todo-form.component';
import { TodoFilterComponent } from '../todo-filter/todo-filter.component';
import { TodoSortComponent } from '../todo-sort/todo-sort.component';
import { CreateTodoRequest } from '../../models/todo.model';

/**
 * Standalone component for displaying the complete list of todos with form integration.
 * @description Main todo listing component that uses signal-based state management
 * and Angular 20's new template syntax. Integrates TodoItem components for individual
 * item management and AddTodoForm component for creating new todos. Focuses on presentation
 * and event delegation, with all business logic handled by the service layer.
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
   * Computed signal for accessing sorted and filtered todos reactively
   */
  public readonly todos = computed(() => this.todoService.sortedAndFilteredTodos());

  /**
   * Computed signal for accessing todo statistics
   */
  public readonly stats = computed(() => this.todoService.stats());

  /**
   * Handles form submission from AddTodoForm component.
   * @description Delegates todo creation requests to TodoService for validation and processing.
   * All business logic, validation, and error handling are handled by the service layer.
   * @param createRequest - The todo creation request from the form
   */
  onAddTodo(createRequest: CreateTodoRequest): void {
    this.todoService.addTodoWithValidation(createRequest);
  }

  /**
   * Handles todo deletion with user confirmation.
   * @description Delegates todo deletion requests to TodoService for confirmation and processing.
   * All confirmation dialogs, business logic, and error handling are handled by the service layer.
   * @param id - The unique identifier of the todo to delete
   */
  onDeleteTodo(id: string): void {
    this.todoService.deleteTodoWithConfirmation(id);
  }

  /**
   * Handles todo completion toggle.
   * @description Delegates todo toggle requests to TodoService for safe processing.
   * All business logic, error handling, and user feedback are handled by the service layer.
   * @param id - The unique identifier of the todo to toggle
   */
  onToggleTodo(id: string): void {
    this.todoService.toggleTodoSafely(id);
  }
}