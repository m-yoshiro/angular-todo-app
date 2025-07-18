/**
 * @fileoverview Root application component using Angular 20 standalone architecture.
 * @description This is the main application component that serves as the entry point
 * for the Angular 20 todo application. Uses the new standalone component architecture
 * without NgModules, showcasing modern Angular patterns and best practices.
 */

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TodoListComponent } from './components/todo-list/todo-list.component';

/**
 * Root application component for the Angular 20 Todo application.
 * @description Serves as the main entry point and shell for the entire application.
 * Uses Angular 20's standalone component architecture, eliminating the need for NgModules.
 * Displays the main TodoListComponent which provides the complete todo management interface.
 * 
 * @example
 * ```typescript
 * // Bootstrap the application with this component
 * bootstrapApplication(App, appConfig);
 * ```
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TodoListComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  /** Application title used for display and accessibility purposes */
  protected title = 'angular-todo-app';
}
