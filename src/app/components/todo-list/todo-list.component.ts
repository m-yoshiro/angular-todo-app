/**
 * @fileoverview Todo list component that displays and manages the collection of todo items.
 * @description This standalone component renders the complete list of todos using Angular 20's
 * new control flow syntax (@for) and signal-based reactivity. Integrates with TodoService
 * for state management and will include TodoItem components for individual item rendering.
 */

import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TodoService } from '../../services/todo.service';
import { TodoItemComponent } from '../todo-item/todo-item.component';
import { AddTodoFormComponent } from '../add-todo-form/add-todo-form.component';
import { CreateTodoRequest } from '../../models/todo.model';

/**
 * Standalone component for displaying the complete list of todos.
 * @description Main todo listing component that uses signal-based state management
 * and Angular 20's new template syntax. Provides the foundation for todo item
 * display and will integrate with TodoItem components for individual item management.
 */
@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [CommonModule, TodoItemComponent, AddTodoFormComponent],
  templateUrl: './todo-list.component.html',
  styleUrl: './todo-list.component.scss'
})
export class TodoListComponent {
  /**
   * Injected TodoService for accessing todo data and operations
   */
  public readonly todoService = inject(TodoService);

  /**
   * Computed signal for accessing todos reactively
   */
  public readonly todos = computed(() => this.todoService.todos());

  /**
   * Computed signal for accessing todo statistics
   */
  public readonly stats = computed(() => this.todoService.stats());

  /**
   * Handles form submission from AddTodoForm component
   * @param createRequest - The todo creation request from the form
   */
  onAddTodo(createRequest: CreateTodoRequest): void {
    this.todoService.addTodo(createRequest);
  }
}