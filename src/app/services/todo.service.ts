/**
 * @fileoverview Core todo management service using Angular 20 signals for reactive state management.
 * @description This service provides comprehensive todo item management with signal-based reactive state,
 * automatic statistics computation, and full CRUD operations. Built using Angular 20's new signal
 * primitives for optimal performance and reactivity without zones.
 */

import { Injectable, signal, computed, effect } from '@angular/core';
import { Todo, CreateTodoRequest, UpdateTodoRequest, TodoStatistics, FilterType } from '../models/todo.model';

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
  /** Local storage key for persisting todos */
  private readonly STORAGE_KEY = 'todo-app-todos';
  
  /** Private signal containing the mutable array of todos */
  private _todos = signal<Todo[]>(this.loadTodosFromStorage());
  
  /** Readonly signal exposing the todo list for external consumption */
  readonly todos = this._todos.asReadonly();
  
  /** Private signal for the current filter state */
  private _currentFilter = signal<FilterType>('all');
  
  /** Readonly signal exposing the current filter for external consumption */
  readonly currentFilter = this._currentFilter.asReadonly();
  
  /** 
   * Computed signal providing filtered todos based on current filter state.
   * @description Automatically recalculates when todos or filter changes, providing
   * reactive filtering without manual subscription management.
   */
  readonly filteredTodos = computed<Todo[]>(() => {
    const todos = this._todos();
    const filter = this._currentFilter();
    
    switch (filter) {
      case 'active':
        return todos.filter(todo => !todo.completed);
      case 'completed':
        return todos.filter(todo => todo.completed);
      case 'all':
      default:
        return todos;
    }
  });

  constructor() {
    // Set up automatic localStorage persistence using Angular 20 effects
    effect(() => {
      const todos = this._todos();
      // Use setTimeout to avoid SSR issues and ensure proper timing
      if (typeof window !== 'undefined') {
        setTimeout(() => this.saveTodosToStorage(todos), 0);
      }
    });
  }
  
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
   * Sets the current filter for displaying todos.
   * @param filter - The filter type to apply ('all', 'active', 'completed')
   */
  setFilter(filter: FilterType): void {
    this._currentFilter.set(filter);
  }

  /**
   * Shows all todos regardless of completion status.
   * @description Convenience method for setting filter to 'all'
   */
  showAll(): void {
    this.setFilter('all');
  }

  /**
   * Shows only active (incomplete) todos.
   * @description Convenience method for setting filter to 'active'
   */
  showActive(): void {
    this.setFilter('active');
  }

  /**
   * Shows only completed todos.
   * @description Convenience method for setting filter to 'completed'
   */
  showCompleted(): void {
    this.setFilter('completed');
  }

  /**
   * Generates a unique identifier for new todo items.
   * @returns A unique string ID based on timestamp and random values
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  /**
   * Loads todos from localStorage.
   * @returns Array of todos from storage or empty array if none found
   */
  private loadTodosFromStorage(): Todo[] {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined' || !window.localStorage) {
        return [];
      }

      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const todos = JSON.parse(stored) as Todo[];
      
      // Convert date strings back to Date objects
      return todos.map(todo => ({
        ...todo,
        createdAt: new Date(todo.createdAt),
        updatedAt: new Date(todo.updatedAt),
        dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined
      }));
    } catch (error) {
      console.warn('Failed to load todos from localStorage:', error);
      return [];
    }
  }

  /**
   * Saves todos to localStorage.
   * @param todos - Array of todos to save
   */
  private saveTodosToStorage(todos: Todo[]): void {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined' || !window.localStorage) {
        return;
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(todos));
    } catch (error) {
      console.warn('Failed to save todos to localStorage:', error);
    }
  }
}