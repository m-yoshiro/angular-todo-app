import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { vi, expect } from 'vitest';
import { TodoSortComponent } from './todo-sort.component';

describe('TodoSortComponent', () => {
  let component: TodoSortComponent;
  let fixture: ComponentFixture<TodoSortComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodoSortComponent],
      providers: [
        provideZonelessChangeDetection()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TodoSortComponent);
    component = fixture.componentInstance;
  });

  describe('Component Creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should render without errors', () => {
      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should have default sort key as date', () => {
      expect(component.currentSortKey).toBe('date');
    });

    it('should have default sort order as desc', () => {
      expect(component.currentSortOrder).toBe('desc');
    });
  });

  describe('Sort Options', () => {
    it('should have correct sort options', () => {
      expect(component.sortOptions).toHaveLength(3);
      expect(component.sortOptions[0].type).toBe('date');
      expect(component.sortOptions[1].type).toBe('priority');
      expect(component.sortOptions[2].type).toBe('title');
    });

    it('should have descriptive labels for each sort option', () => {
      expect(component.sortOptions[0].label).toBe('Date');
      expect(component.sortOptions[1].label).toBe('Priority');
      expect(component.sortOptions[2].label).toBe('Title');
    });

    it('should have accessible descriptions for each sort option', () => {
      expect(component.sortOptions[0].description).toContain('creation date');
      expect(component.sortOptions[1].description).toContain('priority level');
      expect(component.sortOptions[2].description).toContain('alphabetically');
    });
  });

  describe('Sort Key Selection', () => {
    it('should emit sortKeyChange when onSortKeySelect is called', () => {
      const sortKeyChangeSpy = vi.spyOn(component.sortKeyChange, 'emit');
      
      component.onSortKeySelect('priority');
      
      expect(sortKeyChangeSpy).toHaveBeenCalledWith('priority');
    });

    it('should correctly identify active sort key', () => {
      component.currentSortKey = 'priority';
      
      expect(component.isActiveSortKey('priority')).toBe(true);
      expect(component.isActiveSortKey('date')).toBe(false);
      expect(component.isActiveSortKey('title')).toBe(false);
    });

    it('should handle keyboard navigation for sort key selection', () => {
      const sortKeyChangeSpy = vi.spyOn(component.sortKeyChange, 'emit');
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
      
      component.onKeyDown(enterEvent, 'title');
      expect(sortKeyChangeSpy).toHaveBeenCalledWith('title');
      
      component.onKeyDown(spaceEvent, 'priority');
      expect(sortKeyChangeSpy).toHaveBeenCalledWith('priority');
    });

    it('should ignore other keyboard events', () => {
      const sortKeyChangeSpy = vi.spyOn(component.sortKeyChange, 'emit');
      const tabEvent = new KeyboardEvent('keydown', { key: 'Tab' });
      
      component.onKeyDown(tabEvent, 'title');
      expect(sortKeyChangeSpy).not.toHaveBeenCalled();
    });
  });

  describe('Sort Order Toggle', () => {
    it('should emit sortOrderChange when onSortOrderToggle is called', () => {
      const sortOrderChangeSpy = vi.spyOn(component.sortOrderChange, 'emit');
      component.currentSortOrder = 'asc';
      
      component.onSortOrderToggle();
      
      expect(sortOrderChangeSpy).toHaveBeenCalledWith('desc');
    });

    it('should toggle from desc to asc', () => {
      const sortOrderChangeSpy = vi.spyOn(component.sortOrderChange, 'emit');
      component.currentSortOrder = 'desc';
      
      component.onSortOrderToggle();
      
      expect(sortOrderChangeSpy).toHaveBeenCalledWith('asc');
    });

    it('should toggle from asc to desc', () => {
      const sortOrderChangeSpy = vi.spyOn(component.sortOrderChange, 'emit');
      component.currentSortOrder = 'asc';
      
      component.onSortOrderToggle();
      
      expect(sortOrderChangeSpy).toHaveBeenCalledWith('desc');
    });

    it('should handle keyboard navigation for sort order toggle', () => {
      const sortOrderChangeSpy = vi.spyOn(component.sortOrderChange, 'emit');
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
      
      component.onSortOrderKeyDown(enterEvent);
      expect(sortOrderChangeSpy).toHaveBeenCalled();
      
      component.onSortOrderKeyDown(spaceEvent);
      expect(sortOrderChangeSpy).toHaveBeenCalled();
    });
  });

  describe('UI Helper Methods', () => {
    it('should return correct sort order icon', () => {
      component.currentSortOrder = 'asc';
      expect(component.getSortOrderIcon()).toBe('↑');
      
      component.currentSortOrder = 'desc';
      expect(component.getSortOrderIcon()).toBe('↓');
    });

    it('should return correct sort order label', () => {
      component.currentSortOrder = 'asc';
      expect(component.getSortOrderLabel()).toBe('Sort descending');
      
      component.currentSortOrder = 'desc';
      expect(component.getSortOrderLabel()).toBe('Sort ascending');
    });
  });

  describe('Template Rendering', () => {
    it('should display sort heading', () => {
      fixture.detectChanges();
      const heading = fixture.nativeElement.querySelector('.sort-heading');
      expect(heading).toBeTruthy();
      expect(heading.textContent.trim()).toBe('Sort Todos');
    });

    it('should render sort select with all options', () => {
      fixture.detectChanges();
      const select = fixture.nativeElement.querySelector('.sort-select');
      expect(select).toBeTruthy();
      
      const options = select.querySelectorAll('option');
      expect(options).toHaveLength(3);
      expect(options[0].value).toBe('date');
      expect(options[1].value).toBe('priority');
      expect(options[2].value).toBe('title');
    });

    it('should render sort order toggle button', () => {
      fixture.detectChanges();
      const toggleButton = fixture.nativeElement.querySelector('.sort-order-toggle');
      expect(toggleButton).toBeTruthy();
      expect(toggleButton.getAttribute('aria-label')).toBeTruthy();
    });

    it('should display current sort key in select', () => {
      fixture.detectChanges();
      
      const select = fixture.nativeElement.querySelector('.sort-select');
      expect(select.value).toBe('date'); // Default value
      
      // Test that component reflects the correct value
      expect(component.currentSortKey).toBe('date');
    });

    it('should display correct sort order icon', () => {
      fixture.detectChanges();
      
      // Default is desc, should show ↓
      let icon = fixture.nativeElement.querySelector('.sort-icon');
      expect(icon.textContent).toBe('↓');
      
      // Create new component instance for asc test
      const newFixture = TestBed.createComponent(TodoSortComponent);
      const newComponent = newFixture.componentInstance;
      newComponent.currentSortOrder = 'asc';
      newFixture.detectChanges();
      
      icon = newFixture.nativeElement.querySelector('.sort-icon');
      expect(icon.textContent).toBe('↑');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      fixture.detectChanges();
      
      const sortGroup = fixture.nativeElement.querySelector('.todo-sort');
      expect(sortGroup.getAttribute('role')).toBe('group');
      expect(sortGroup.getAttribute('aria-label')).toBe('Todo sort options');
    });

    it('should have proper labels for sort select', () => {
      fixture.detectChanges();
      
      const label = fixture.nativeElement.querySelector('.sort-label');
      expect(label).toBeTruthy();
      expect(label.getAttribute('for')).toBe('sort-select');
      
      const select = fixture.nativeElement.querySelector('.sort-select');
      expect(select.getAttribute('id')).toBe('sort-select');
    });

    it('should have screen reader descriptions', () => {
      fixture.detectChanges();
      
      const descriptions = fixture.nativeElement.querySelectorAll('.sr-only div[id]');
      expect(descriptions.length).toBeGreaterThan(0);
    });

    it('should have live status for sort changes', () => {
      fixture.detectChanges();
      
      const status = fixture.nativeElement.querySelector('[role="status"][aria-live="polite"]');
      expect(status).toBeTruthy();
    });

    it('should update sort status text', () => {
      component.currentSortKey = 'priority';
      component.currentSortOrder = 'asc';
      fixture.detectChanges();
      
      const status = fixture.nativeElement.querySelector('[data-testid="sort-status"]');
      expect(status.textContent).toContain('priority');
      expect(status.textContent).toContain('ascending');
    });
  });

  describe('Event Integration', () => {
    it('should emit sortKeyChange when select changes', () => {
      const sortKeyChangeSpy = vi.spyOn(component.sortKeyChange, 'emit');
      fixture.detectChanges();
      
      const select = fixture.nativeElement.querySelector('.sort-select');
      select.value = 'title';
      select.dispatchEvent(new Event('change'));
      
      expect(sortKeyChangeSpy).toHaveBeenCalledWith('title');
    });

    it('should emit sortOrderChange when toggle button is clicked', () => {
      const sortOrderChangeSpy = vi.spyOn(component.sortOrderChange, 'emit');
      fixture.detectChanges();
      
      const toggleButton = fixture.nativeElement.querySelector('.sort-order-toggle');
      toggleButton.click();
      
      expect(sortOrderChangeSpy).toHaveBeenCalled();
    });
  });

  describe('Input Property Changes', () => {
    it('should respond to currentSortKey changes', () => {
      // First check the default state
      fixture.detectChanges();
      expect(component.isActiveSortKey('date')).toBe(true);
      
      // Test the component's reactive behavior to input changes
      expect(component.currentSortKey).toBe('date');
      
      // Test changing the sort key through component methods
      component.currentSortKey = 'title';
      expect(component.isActiveSortKey('title')).toBe(true);
      expect(component.currentSortKey).toBe('title');
    });

    it('should respond to currentSortOrder changes', () => {
      component.currentSortOrder = 'asc';
      fixture.detectChanges();
      
      expect(component.getSortOrderIcon()).toBe('↑');
      expect(component.getSortOrderLabel()).toBe('Sort descending');
      
      const icon = fixture.nativeElement.querySelector('.sort-icon');
      expect(icon.textContent).toBe('↑');
    });
  });
});