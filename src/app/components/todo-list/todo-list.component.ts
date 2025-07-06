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
   * Computed signal for accessing sorted and filtered todos reactively
   */
  public readonly todos = computed(() => this.todoService.sortedAndFilteredTodos());

  /**
   * Computed signal for accessing todo statistics
   */
  public readonly stats = computed(() => this.todoService.stats());

  /**
   * Handles form submission from AddTodoForm component with error handling.
   * @description Processes todo creation requests from the AddTodoForm component,
   * validates the request data, and delegates to TodoService for actual todo creation.
   * Includes error handling for invalid requests and service failures.
   * @param createRequest - The todo creation request from the form
   * @throws {Error} When createRequest is invalid or service operation fails
   */
  onAddTodo(createRequest: CreateTodoRequest): void {
    try {
      // Validate the request has required fields
      if (!createRequest?.title?.trim()) {
        console.error('Invalid todo creation request: Title is required');
        return;
      }

      // Delegate to TodoService for actual todo creation
      this.todoService.addTodo(createRequest);
    } catch (error) {
      // Log error for debugging while maintaining user experience
      console.error('Failed to create todo:', error);
      // In a real application, you might want to show user-friendly error messages
      // or trigger error handling UI states here
    }
  }

  /**
   * Handles todo deletion with user confirmation and error handling.
   * @description Processes todo deletion requests with user confirmation dialog,
   * validates the operation, and delegates to TodoService for actual todo deletion.
   * Includes error handling for service failures and user feedback.
   * @param id - The unique identifier of the todo to delete
   */
  onDeleteTodo(id: string): void {
    try {
      // Show confirmation dialog to prevent accidental deletions
      const confirmed = confirm('Are you sure you want to delete this todo?');
      if (!confirmed) {
        return;
      }

      // Delegate to TodoService for actual todo deletion
      const success = this.todoService.deleteTodo(id);
      
      if (!success) {
        console.error('Todo not found or could not be deleted:', id);
        return;
      }
    } catch (error) {
      // Log error for debugging while maintaining user experience
      console.error('Failed to delete todo:', error);
      // In a real application, you might want to show user-friendly error messages
      // or trigger error handling UI states here
    }
  }

  /**
   * Handles todo completion toggle with error handling.
   * @description Processes todo toggle requests by delegating to TodoService
   * for actual todo completion status toggling. Includes error handling for
   * service failures and invalid todo IDs.
   * @param id - The unique identifier of the todo to toggle
   */
  onToggleTodo(id: string): void {
    try {
      // Delegate to TodoService for actual todo toggle
      const toggledTodo = this.todoService.toggleTodo(id);
      
      if (!toggledTodo) {
        console.error('Todo not found or could not be toggled:', id);
        return;
      }
    } catch (error) {
      // Log error for debugging while maintaining user experience
      console.error('Failed to toggle todo:', error);
      // In a real application, you might want to show user-friendly error messages
      // or trigger error handling UI states here
    }
  }
}