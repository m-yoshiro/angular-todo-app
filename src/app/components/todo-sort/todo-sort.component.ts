/**
 * @fileoverview TodoSort component for sorting todo items by different criteria.
 * @description Standalone component that provides sort controls (Date/Priority/Title) with order toggle using Angular 20 patterns.
 * Implements signal-based reactive sorting with accessibility features and keyboard navigation.
 */

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SortType, SortOrder } from '../../models/todo.model';

/**
 * Component for sorting todos by different criteria.
 * @description Provides sort controls for Date, Priority, and Title with
 * accessibility features including ARIA labels and keyboard navigation support.
 * Includes sort order toggle for ascending/descending sorting.
 * 
 * @example
 * ```html
 * <app-todo-sort 
 *   [currentSortKey]="todoService.sortKey()" 
 *   [currentSortOrder]="todoService.sortOrder()"
 *   (sortKeyChange)="todoService.setSortKey($event)"
 *   (sortOrderChange)="todoService.setSortOrder($event)">
 * </app-todo-sort>
 * ```
 */
@Component({
  selector: 'app-todo-sort',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './todo-sort.component.html',
  styleUrls: ['./todo-sort.component.scss']
})
export class TodoSortComponent {
  /**
   * The currently active sort key.
   * @description Used to highlight the active sort criteria in the UI.
   */
  @Input() currentSortKey: SortType = 'date';

  /**
   * The currently active sort order.
   * @description Used to display the correct sort direction indicator.
   */
  @Input() currentSortOrder: SortOrder = 'desc';

  /**
   * Event emitted when a sort key is selected.
   * @description Emits the new sort type when user selects a sort criteria.
   */
  @Output() sortKeyChange = new EventEmitter<SortType>();

  /**
   * Event emitted when sort order is toggled.
   * @description Emits the new sort order when user toggles sort direction.
   */
  @Output() sortOrderChange = new EventEmitter<SortOrder>();

  /**
   * Available sort options with display labels.
   * @description Defines the sort criteria options to display and their associated sort types.
   */
  readonly sortOptions: { type: SortType; label: string; description: string }[] = [
    { 
      type: 'date', 
      label: 'Date', 
      description: 'Sort todos by creation date' 
    },
    { 
      type: 'priority', 
      label: 'Priority', 
      description: 'Sort todos by priority level (high to low)' 
    },
    { 
      type: 'title', 
      label: 'Title', 
      description: 'Sort todos alphabetically by title' 
    }
  ];

  /**
   * Handles sort key selection and emits the change event.
   * @param sortKey - The selected sort key
   */
  onSortKeySelect(sortKey: SortType): void {
    this.sortKeyChange.emit(sortKey);
  }

  /**
   * Handles sort select change event from the DOM.
   * @param event - The change event from the select element
   */
  onSortSelectChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.onSortKeySelect(target.value as SortType);
  }

  /**
   * Handles sort order toggle and emits the change event.
   */
  onSortOrderToggle(): void {
    const newOrder: SortOrder = this.currentSortOrder === 'asc' ? 'desc' : 'asc';
    this.sortOrderChange.emit(newOrder);
  }

  /**
   * Checks if a sort key is currently active.
   * @param sortKey - The sort key to check
   * @returns True if the sort key is currently active
   */
  isActiveSortKey(sortKey: SortType): boolean {
    return this.currentSortKey === sortKey;
  }

  /**
   * Gets the appropriate icon for the current sort order.
   * @returns Unicode character for sort direction arrow
   */
  getSortOrderIcon(): string {
    return this.currentSortOrder === 'asc' ? '↑' : '↓';
  }

  /**
   * Gets the accessible label for the sort order button.
   * @returns Descriptive text for screen readers
   */
  getSortOrderLabel(): string {
    return this.currentSortOrder === 'asc' ? 'Sort descending' : 'Sort ascending';
  }

  /**
   * Handles keyboard navigation for sort buttons.
   * @param event - The keyboard event
   * @param sortKey - The sort key associated with the button
   */
  onKeyDown(event: KeyboardEvent, sortKey: SortType): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onSortKeySelect(sortKey);
    }
  }

  /**
   * Handles keyboard navigation for sort order toggle.
   * @param event - The keyboard event
   */
  onSortOrderKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onSortOrderToggle();
    }
  }
}