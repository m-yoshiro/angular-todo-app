import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { By } from '@angular/platform-browser';
import { vi, expect } from 'vitest';

import { TodoFilterComponent } from './todo-filter.component';

describe('TodoFilterComponent', () => {
  let component: TodoFilterComponent;
  let fixture: ComponentFixture<TodoFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodoFilterComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(TodoFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initial state', () => {
    it('should have default currentFilter as "all"', () => {
      expect(component.currentFilter).toBe('all');
    });

    it('should have three filter options', () => {
      expect(component.filterOptions).toHaveLength(3);
      expect(component.filterOptions[0].type).toBe('all');
      expect(component.filterOptions[1].type).toBe('active');
      expect(component.filterOptions[2].type).toBe('completed');
    });

    it('should display all filter buttons', () => {
      const buttons = fixture.debugElement.queryAll(By.css('.filter-button'));
      expect(buttons).toHaveLength(3);
      expect(buttons[0].nativeElement.textContent.trim()).toBe('All');
      expect(buttons[1].nativeElement.textContent.trim()).toBe('Active');
      expect(buttons[2].nativeElement.textContent.trim()).toBe('Completed');
    });
  });

  describe('filter options configuration', () => {
    it('should have correct filter option labels', () => {
      expect(component.filterOptions[0].label).toBe('All');
      expect(component.filterOptions[1].label).toBe('Active');
      expect(component.filterOptions[2].label).toBe('Completed');
    });

    it('should have correct filter option descriptions', () => {
      expect(component.filterOptions[0].description).toBe('Show all todos regardless of completion status');
      expect(component.filterOptions[1].description).toBe('Show only incomplete todos');
      expect(component.filterOptions[2].description).toBe('Show only completed todos');
    });
  });

  describe('isActiveFilter method', () => {
    it('should return true for active filter', () => {
      component.currentFilter = 'active';
      expect(component.isActiveFilter('active')).toBe(true);
      expect(component.isActiveFilter('all')).toBe(false);
      expect(component.isActiveFilter('completed')).toBe(false);
    });

    it('should return false for inactive filters', () => {
      component.currentFilter = 'all';
      expect(component.isActiveFilter('active')).toBe(false);
      expect(component.isActiveFilter('completed')).toBe(false);
    });
  });

  describe('visual active state', () => {
    it('should apply active class to current filter button', () => {
      fixture.detectChanges();
      component.currentFilter = 'active';
      fixture.detectChanges();

      const buttons = fixture.debugElement.queryAll(By.css('.filter-button'));
      const allButton = buttons[0];
      const activeButton = buttons[1];
      const completedButton = buttons[2];

      expect(allButton.nativeElement.classList.contains('active')).toBe(false);
      expect(activeButton.nativeElement.classList.contains('active')).toBe(true);
      expect(completedButton.nativeElement.classList.contains('active')).toBe(false);
    });

    it('should update active class when currentFilter changes', () => {
      // Start with 'all'
      fixture.detectChanges();
      component.currentFilter = 'all';
      fixture.detectChanges();
      
      let buttons = fixture.debugElement.queryAll(By.css('.filter-button'));
      expect(buttons[0].nativeElement.classList.contains('active')).toBe(true);

      // Change to 'completed'
      component.currentFilter = 'completed';
      fixture.detectChanges();
      
      buttons = fixture.debugElement.queryAll(By.css('.filter-button'));
      expect(buttons[0].nativeElement.classList.contains('active')).toBe(false);
      expect(buttons[2].nativeElement.classList.contains('active')).toBe(true);
    });
  });

  describe('filter selection events', () => {
    it('should emit filterChange when onFilterSelect is called', () => {
      vi.spyOn(component.filterChange, 'emit');
      
      component.onFilterSelect('active');
      
      expect(component.filterChange.emit).toHaveBeenCalledWith('active');
    });

    it('should emit filterChange when filter button is clicked', () => {
      vi.spyOn(component.filterChange, 'emit');
      
      const buttons = fixture.debugElement.queryAll(By.css('.filter-button'));
      const activeButton = buttons[1]; // 'active' filter button
      
      activeButton.nativeElement.click();
      
      expect(component.filterChange.emit).toHaveBeenCalledWith('active');
    });

    it('should emit correct filter type for each button', () => {
      vi.spyOn(component.filterChange, 'emit');
      
      const buttons = fixture.debugElement.queryAll(By.css('.filter-button'));
      
      buttons[0].nativeElement.click(); // All
      expect(component.filterChange.emit).toHaveBeenCalledWith('all');
      
      buttons[1].nativeElement.click(); // Active
      expect(component.filterChange.emit).toHaveBeenCalledWith('active');
      
      buttons[2].nativeElement.click(); // Completed
      expect(component.filterChange.emit).toHaveBeenCalledWith('completed');
    });
  });

  describe('keyboard navigation', () => {
    it('should handle Enter key press', () => {
      vi.spyOn(component.filterChange, 'emit');
      
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      vi.spyOn(event, 'preventDefault');
      
      component.onKeyDown(event, 'active');
      
      expect(event.preventDefault).toHaveBeenCalled();
      expect(component.filterChange.emit).toHaveBeenCalledWith('active');
    });

    it('should handle Space key press', () => {
      vi.spyOn(component.filterChange, 'emit');
      
      const event = new KeyboardEvent('keydown', { key: ' ' });
      vi.spyOn(event, 'preventDefault');
      
      component.onKeyDown(event, 'completed');
      
      expect(event.preventDefault).toHaveBeenCalled();
      expect(component.filterChange.emit).toHaveBeenCalledWith('completed');
    });

    it('should not handle other key presses', () => {
      vi.spyOn(component.filterChange, 'emit');
      
      const event = new KeyboardEvent('keydown', { key: 'Tab' });
      vi.spyOn(event, 'preventDefault');
      
      component.onKeyDown(event, 'all');
      
      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(component.filterChange.emit).not.toHaveBeenCalled();
    });

    it('should handle keyboard events on filter buttons', () => {
      vi.spyOn(component, 'onKeyDown');
      
      const buttons = fixture.debugElement.queryAll(By.css('.filter-button'));
      const activeButton = buttons[1];
      
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      activeButton.nativeElement.dispatchEvent(event);
      
      expect(component.onKeyDown).toHaveBeenCalledWith(expect.any(KeyboardEvent), 'active');
    });
  });

  describe('accessibility features', () => {
    it('should have proper ARIA attributes on filter buttons', () => {
      fixture.detectChanges();
      component.currentFilter = 'active';
      fixture.detectChanges();
      
      const buttons = fixture.debugElement.queryAll(By.css('.filter-button'));
      
      // Check aria-pressed attributes
      expect(buttons[0].nativeElement.getAttribute('aria-pressed')).toBe('false');
      expect(buttons[1].nativeElement.getAttribute('aria-pressed')).toBe('true');
      expect(buttons[2].nativeElement.getAttribute('aria-pressed')).toBe('false');
    });

    it('should have aria-describedby attributes linking to descriptions', () => {
      const buttons = fixture.debugElement.queryAll(By.css('.filter-button'));
      
      expect(buttons[0].nativeElement.getAttribute('aria-describedby')).toBe('filter-all-desc');
      expect(buttons[1].nativeElement.getAttribute('aria-describedby')).toBe('filter-active-desc');
      expect(buttons[2].nativeElement.getAttribute('aria-describedby')).toBe('filter-completed-desc');
    });

    it('should have role="group" on filter container', () => {
      const container = fixture.debugElement.query(By.css('.todo-filter'));
      expect(container.nativeElement.getAttribute('role')).toBe('group');
    });

    it('should have aria-label on filter container', () => {
      const container = fixture.debugElement.query(By.css('.todo-filter'));
      expect(container.nativeElement.getAttribute('aria-label')).toBe('Todo filter options');
    });

    it('should have screen reader descriptions for each filter', () => {
      const descriptions = fixture.debugElement.queryAll(By.css('.sr-only div'));
      
      expect(descriptions).toHaveLength(3);
      expect(descriptions[0].nativeElement.id).toBe('filter-all-desc');
      expect(descriptions[1].nativeElement.id).toBe('filter-active-desc');
      expect(descriptions[2].nativeElement.id).toBe('filter-completed-desc');
      
      expect(descriptions[0].nativeElement.textContent.trim()).toBe('Show all todos regardless of completion status');
      expect(descriptions[1].nativeElement.textContent.trim()).toBe('Show only incomplete todos');
      expect(descriptions[2].nativeElement.textContent.trim()).toBe('Show only completed todos');
    });
  });

  describe('input property changes', () => {
    it('should update visual state when currentFilter input changes', () => {
      // Start with 'all'
      fixture.detectChanges();
      component.currentFilter = 'all';
      fixture.detectChanges();
      
      let buttons = fixture.debugElement.queryAll(By.css('.filter-button'));
      expect(buttons[0].nativeElement.classList.contains('active')).toBe(true);
      
      // Change to 'completed' via input property
      component.currentFilter = 'completed';
      fixture.detectChanges();
      
      buttons = fixture.debugElement.queryAll(By.css('.filter-button'));
      expect(buttons[0].nativeElement.classList.contains('active')).toBe(false);
      expect(buttons[2].nativeElement.classList.contains('active')).toBe(true);
    });

    it('should update aria-pressed attributes when currentFilter changes', () => {
      fixture.detectChanges();
      component.currentFilter = 'completed';
      fixture.detectChanges();
      
      const buttons = fixture.debugElement.queryAll(By.css('.filter-button'));
      expect(buttons[0].nativeElement.getAttribute('aria-pressed')).toBe('false');
      expect(buttons[1].nativeElement.getAttribute('aria-pressed')).toBe('false');
      expect(buttons[2].nativeElement.getAttribute('aria-pressed')).toBe('true');
    });
  });

  describe('template structure', () => {
    it('should render filter heading for screen readers', () => {
      const heading = fixture.debugElement.query(By.css('.filter-heading'));
      expect(heading).toBeTruthy();
      expect(heading.nativeElement.textContent.trim()).toBe('Filter Todos');
    });

    it('should render all filter buttons in correct order', () => {
      const buttons = fixture.debugElement.queryAll(By.css('.filter-button'));
      expect(buttons).toHaveLength(3);
      
      const buttonTexts = buttons.map(button => button.nativeElement.textContent.trim());
      expect(buttonTexts).toEqual(['All', 'Active', 'Completed']);
    });

    it('should have proper button types', () => {
      const buttons = fixture.debugElement.queryAll(By.css('.filter-button'));
      buttons.forEach(button => {
        expect(button.nativeElement.type).toBe('button');
      });
    });
  });
});