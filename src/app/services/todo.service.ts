/**
 * @fileoverview Core todo management service using Angular 20 signals for reactive state management.
 * @description This service provides comprehensive todo item management with signal-based reactive state,
 * automatic statistics computation, and full CRUD operations. Built using Angular 20's new signal
 * primitives for optimal performance and reactivity without zones.
 */

import { Injectable, signal, computed } from '@angular/core';
import { Todo, CreateTodoRequest, UpdateTodoRequest, TodoStatistics } from '../models/todo.model';

/**
 * Service responsible for managing todo items and providing reactive state management.
 * @description Implements signal-based state management using Angular 20's new signal primitives.
 * Provides CRUD operations, automatic statistics computation, and reactive data access.
 * Uses readonly signals for external access while maintaining internal mutability through private signals.
 * 
 * @example
 * ```typescript
 * constructor(private todoService: TodoService) {
 *   // Access reactive todo list
 *   const todos = this.todoService.todos();
 *   
 *   // Access computed statistics
 *   const stats = this.todoService.stats();
 *   
 *   // Add new todo
 *   this.todoService.addTodo({
 *     title: 'New Task',
 *     priority: 'medium'
 *   });
 * }
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class TodoService {
  /** Private signal containing the mutable array of todos */
  private _todos = signal<Todo[]>([]);
  
  /** Readonly signal exposing the todo list for external consumption */
  readonly todos = this._todos.asReadonly();
  
  /** 
   * Computed signal providing real-time statistics about todos.
   * @description Automatically recalculates when todos change, providing
   * completion rates, priority distribution, and overdue item counts.
   */
  readonly stats = computed<TodoStatistics>(() => {
    const todos = this._todos();
    const completed = todos.filter(todo => todo.completed);
    const pending = todos.filter(todo => !todo.completed);
    const now = new Date();
    const overdue = pending.filter(todo => {
      if (!todo.dueDate) return false;
      const dueDateEndOfDay = new Date(todo.dueDate);
      dueDateEndOfDay.setHours(23, 59, 59, 999);
      return dueDateEndOfDay < now;
    });
    
    return {
      total: todos.length,
      completed: completed.length,
      pending: pending.length,
      overdue: overdue.length,
      byPriority: {
        low: todos.filter(todo => todo.priority === 'low').length,
        medium: todos.filter(todo => todo.priority === 'medium').length,
        high: todos.filter(todo => todo.priority === 'high').length
      }
    };
  });

  /**
   * Creates a new todo item and adds it to the collection.
   * @param request - The todo creation request containing title and optional metadata
   * @returns The newly created todo item with generated ID and timestamps
   */
  addTodo(request: CreateTodoRequest): Todo {
    const newTodo: Todo = {
      id: this.generateId(),
      title: request.title,
      description: request.description,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      priority: request.priority || 'medium',
      dueDate: request.dueDate,
      tags: request.tags || []
    };

    this._todos.update(todos => [...todos, newTodo]);
    return newTodo;
  }

  /**
   * Updates an existing todo item with new data.
   * @param id - The unique identifier of the todo to update
   * @param request - Partial update data containing the fields to modify
   * @returns The updated todo item or null if not found
   */
  updateTodo(id: string, request: UpdateTodoRequest): Todo | null {
    const todoIndex = this._todos().findIndex(todo => todo.id === id);
    if (todoIndex === -1) {
      return null;
    }

    this._todos.update(todos => {
      const updatedTodos = [...todos];
      updatedTodos[todoIndex] = {
        ...updatedTodos[todoIndex],
        ...request,
        updatedAt: new Date()
      };
      return updatedTodos;
    });

    return this._todos()[todoIndex];
  }

  /**
   * Toggles the completion status of a todo item.
   * @param id - The unique identifier of the todo to toggle
   * @returns The updated todo item or null if not found
   */
  toggleTodo(id: string): Todo | null {
    const todo = this.getTodoById(id);
    if (!todo) return null;
    return this.updateTodo(id, { completed: !todo.completed });
  }

  /**
   * Removes a todo item from the collection.
   * @param id - The unique identifier of the todo to delete
   * @returns True if the todo was found and deleted, false otherwise
   */
  deleteTodo(id: string): boolean {
    const initialLength = this._todos().length;
    this._todos.update(todos => todos.filter(todo => todo.id !== id));
    return this._todos().length < initialLength;
  }

  /**
   * Retrieves a specific todo item by its ID.
   * @param id - The unique identifier of the todo to find
   * @returns The todo item if found, undefined otherwise
   */
  getTodoById(id: string): Todo | undefined {
    return this._todos().find(todo => todo.id === id);
  }

  /**
   * Removes all completed todo items from the collection.
   * @description Useful for cleaning up finished tasks and maintaining a focused todo list.
   */
  clearCompleted(): void {
    this._todos.update(todos => todos.filter(todo => !todo.completed));
  }

  /**
   * Generates a unique identifier for new todo items.
   * @returns A unique string ID based on timestamp and random values
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
}