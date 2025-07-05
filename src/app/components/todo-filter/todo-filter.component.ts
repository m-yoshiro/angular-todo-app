/**
 * @fileoverview TodoFilter component for filtering todo items by completion status.
 * @description Standalone component that provides filter buttons (All/Active/Completed) using Angular 20 patterns.
 * Implements signal-based reactive filtering with accessibility features and keyboard navigation.
 */

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterType } from '../../models/todo.model';

/**
 * Component for filtering todos by completion status.
 * @description Provides filter buttons for All, Active, and Completed todos with
 * accessibility features including ARIA labels and keyboard navigation support.
 * 
 * @example
 * ```html
 * <app-todo-filter 
 *   [currentFilter]="todoService.currentFilter()" 
 *   (filterChange)="todoService.setFilter($event)">
 * </app-todo-filter>
 * ```
 */
@Component({
  selector: 'app-todo-filter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './todo-filter.component.html',
  styleUrls: ['./todo-filter.component.scss']
})
export class TodoFilterComponent {
  /**
   * The currently active filter type.
   * @description Used to highlight the active filter button and manage UI state.
   */
  @Input() currentFilter: FilterType = 'all';

  /**
   * Event emitted when a filter is selected.
   * @description Emits the new filter type when user clicks a filter button.
   */
  @Output() filterChange = new EventEmitter<FilterType>();

  /**
   * Available filter options with display labels.
   * @description Defines the filter buttons to display and their associated filter types.
   */
  readonly filterOptions: { type: FilterType; label: string; description: string }[] = [
    { 
      type: 'all', 
      label: 'All', 
      description: 'Show all todos regardless of completion status' 
    },
    { 
      type: 'active', 
      label: 'Active', 
      description: 'Show only incomplete todos' 
    },
    { 
      type: 'completed', 
      label: 'Completed', 
      description: 'Show only completed todos' 
    }
  ];

  /**
   * Handles filter selection and emits the change event.
   * @param filterType - The selected filter type
   */
  onFilterSelect(filterType: FilterType): void {
    this.filterChange.emit(filterType);
  }

  /**
   * Checks if a filter is currently active.
   * @param filterType - The filter type to check
   * @returns True if the filter is currently active
   */
  isActiveFilter(filterType: FilterType): boolean {
    return this.currentFilter === filterType;
  }

  /**
   * Handles keyboard navigation for filter buttons.
   * @param event - The keyboard event
   * @param filterType - The filter type associated with the button
   */
  onKeyDown(event: KeyboardEvent, filterType: FilterType): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onFilterSelect(filterType);
    }
  }
}