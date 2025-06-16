import { Injectable, signal, computed } from '@angular/core';
import { Todo, CreateTodoRequest, UpdateTodoRequest, TodoStatistics } from '../models/todo.model';

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private _todos = signal<Todo[]>([]);
  
  readonly todos = this._todos.asReadonly();
  
  readonly stats = computed<TodoStatistics>(() => {
    const todos = this._todos();
    const completed = todos.filter(todo => todo.completed);
    const pending = todos.filter(todo => !todo.completed);
    const now = new Date();
    const overdue = pending.filter(todo => todo.dueDate && todo.dueDate < now);
    
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

  toggleTodo(id: string): Todo | null {
    return this.updateTodo(id, { completed: !this.getTodoById(id)?.completed });
  }

  deleteTodo(id: string): boolean {
    const initialLength = this._todos().length;
    this._todos.update(todos => todos.filter(todo => todo.id !== id));
    return this._todos().length < initialLength;
  }

  getTodoById(id: string): Todo | undefined {
    return this._todos().find(todo => todo.id === id);
  }

  clearCompleted(): void {
    this._todos.update(todos => todos.filter(todo => !todo.completed));
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}