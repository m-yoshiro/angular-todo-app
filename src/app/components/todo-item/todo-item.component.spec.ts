import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ComponentRef } from '@angular/core';
import { provideZonelessChangeDetection } from '@angular/core';
import { vi, expect } from 'vitest';
import { TodoItemComponent } from './todo-item.component';
import { Todo } from '../../models/todo.model';

describe('TodoItemComponent', () => {
  let component: TodoItemComponent;
  let fixture: ComponentFixture<TodoItemComponent>;
  let componentRef: ComponentRef<TodoItemComponent>;

  const mockTodo: Todo = {
    id: '1',
    title: 'Test Todo',
    description: 'Test Description',
    completed: false,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
    priority: 'medium',
    dueDate: new Date('2023-12-31'),
    tags: ['test', 'example']
  };

  const overdueTodo: Todo = {
    ...mockTodo,
    id: '2',
    dueDate: new Date('2022-01-01') // Past date
  };

  const completedTodo: Todo = {
    ...mockTodo,
    id: '3',
    completed: true
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodoItemComponent, FormsModule],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(TodoItemComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
  });

  it('should create', () => {
    componentRef.setInput('todo', mockTodo);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('Component Inputs and Outputs', () => {
    it('should display todo information correctly', () => {
      componentRef.setInput('todo', mockTodo);
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      expect(compiled.querySelector('.todo-title').textContent.trim()).toBe('Test Todo');
      expect(compiled.querySelector('.todo-description').textContent.trim()).toBe('Test Description');
      expect(compiled.querySelector('.todo-priority').textContent.trim()).toBe('MEDIUM');
    });

    it('should emit toggleComplete event when checkbox is clicked', () => {
      componentRef.setInput('todo', mockTodo);
      vi.spyOn(component.toggleComplete, 'emit');
      fixture.detectChanges();

      const checkbox = fixture.nativeElement.querySelector('.todo-checkbox');
      checkbox.click();

      expect(component.toggleComplete.emit).toHaveBeenCalledWith('1');
    });

    it('should emit deleteTodo event when delete button is clicked', () => {
      componentRef.setInput('todo', mockTodo);
      vi.spyOn(component.deleteTodo, 'emit');
      fixture.detectChanges();

      const deleteButton = fixture.nativeElement.querySelector('.btn-delete');
      deleteButton.click();

      expect(component.deleteTodo.emit).toHaveBeenCalledWith('1');
    });
  });

  describe('Edit Functionality', () => {
    beforeEach(() => {
      componentRef.setInput('todo', mockTodo);
      fixture.detectChanges();
    });

    it('should enter edit mode when edit button is clicked', () => {
      const editButton = fixture.nativeElement.querySelector('.btn-edit');
      editButton.click();
      fixture.detectChanges();

      expect(component.isEditing()).toBe(true);
      expect(component.editTitle()).toBe('Test Todo');
      expect(component.editDescription()).toBe('Test Description');
    });

    it('should show edit form when in edit mode', () => {
      component.onEdit();
      fixture.detectChanges();

      const editForm = fixture.nativeElement.querySelector('.todo-edit-form');
      const titleInput = fixture.nativeElement.querySelector('#edit-title');
      const descriptionTextarea = fixture.nativeElement.querySelector('#edit-description');

      expect(editForm).toBeTruthy();
      expect(titleInput).toBeTruthy();
      expect(descriptionTextarea).toBeTruthy();
    });

    it('should emit editTodo event when save button is clicked', () => {
      vi.spyOn(component.editTodo, 'emit');
      component.onEdit();
      component.editTitle.set('Updated Title');
      component.editDescription.set('Updated Description');
      fixture.detectChanges();

      const saveButton = fixture.nativeElement.querySelector('.btn-save');
      saveButton.click();

      expect(component.editTodo.emit).toHaveBeenCalledWith({
        ...mockTodo,
        title: 'Updated Title',
        description: 'Updated Description',
        updatedAt: expect.any(Date)
      });
      expect(component.isEditing()).toBe(false);
    });

    it('should cancel edit mode when cancel button is clicked', () => {
      component.onEdit();
      component.editTitle.set('Modified Title');
      fixture.detectChanges();

      const cancelButton = fixture.nativeElement.querySelector('.btn-cancel');
      cancelButton.click();

      expect(component.isEditing()).toBe(false);
      expect(component.editTitle()).toBe('');
      expect(component.editDescription()).toBe('');
    });

    it('should disable save button when title is empty', () => {
      component.onEdit();
      component.editTitle.set('');
      fixture.detectChanges();

      const saveButton = fixture.nativeElement.querySelector('.btn-save');
      expect(saveButton.disabled).toBe(true);
    });

    it('should disable edit button when todo is completed', () => {
      componentRef.setInput('todo', completedTodo);
      fixture.detectChanges();

      const editButton = fixture.nativeElement.querySelector('.btn-edit');
      expect(editButton.disabled).toBe(true);
    });
  });

  describe('Computed Properties', () => {
    it('should calculate isOverdue correctly for overdue todo', () => {
      componentRef.setInput('todo', overdueTodo);
      fixture.detectChanges();

      expect(component.isOverdue()).toBe(true);
    });

    it('should calculate isOverdue correctly for non-overdue todo', () => {
      const futureTodo = { ...mockTodo, dueDate: new Date('2099-12-31') };
      componentRef.setInput('todo', futureTodo);
      fixture.detectChanges();

      expect(component.isOverdue()).toBe(false);
    });

    it('should not be overdue if todo is completed', () => {
      const overdueCompleted = { ...overdueTodo, completed: true };
      componentRef.setInput('todo', overdueCompleted);
      fixture.detectChanges();

      expect(component.isOverdue()).toBe(false);
    });

    it('should not be overdue if no due date', () => {
      const noDueDateTodo = { ...mockTodo, dueDate: undefined };
      componentRef.setInput('todo', noDueDateTodo);
      fixture.detectChanges();

      expect(component.isOverdue()).toBe(false);
    });

    it('should return correct priority class', () => {
      componentRef.setInput('todo', mockTodo);
      fixture.detectChanges();

      expect(component.priorityClass()).toBe('priority-medium');
    });

    it('should format due date correctly', () => {
      componentRef.setInput('todo', mockTodo);
      fixture.detectChanges();

      const expected = new Date('2023-12-31').toLocaleDateString();
      expect(component.dueDateFormatted()).toBe(expected);
    });
  });

  describe('CSS Classes', () => {
    it('should apply completed class when todo is completed', () => {
      componentRef.setInput('todo', completedTodo);
      fixture.detectChanges();

      const todoItem = fixture.nativeElement.querySelector('.todo-item');
      expect(todoItem.classList.contains('completed')).toBe(true);
    });

    it('should apply overdue class when todo is overdue', () => {
      componentRef.setInput('todo', overdueTodo);
      fixture.detectChanges();

      const todoItem = fixture.nativeElement.querySelector('.todo-item');
      expect(todoItem.classList.contains('overdue')).toBe(true);
    });

    it('should apply priority class', () => {
      componentRef.setInput('todo', mockTodo);
      fixture.detectChanges();

      const todoItem = fixture.nativeElement.querySelector('.todo-item');
      expect(todoItem.classList.contains('priority-medium')).toBe(true);
    });

    it('should apply editing class when in edit mode', () => {
      componentRef.setInput('todo', mockTodo);
      component.isEditing.set(true);
      fixture.detectChanges();

      const todoItem = fixture.nativeElement.querySelector('.todo-item');
      expect(todoItem.classList.contains('editing')).toBe(true);
    });
  });

  describe('Display Elements', () => {
    it('should show tags when todo has tags', () => {
      componentRef.setInput('todo', mockTodo);
      fixture.detectChanges();

      const tags = fixture.nativeElement.querySelectorAll('.tag');
      expect(tags.length).toBe(2);
      expect(tags[0].textContent.trim()).toBe('test');
      expect(tags[1].textContent.trim()).toBe('example');
    });

    it('should not show tags section when todo has no tags', () => {
      const noTagsTodo = { ...mockTodo, tags: undefined };
      componentRef.setInput('todo', noTagsTodo);
      fixture.detectChanges();

      const tagsSection = fixture.nativeElement.querySelector('.todo-tags');
      expect(tagsSection).toBeFalsy();
    });

    it('should show due date when todo has due date', () => {
      componentRef.setInput('todo', mockTodo);
      fixture.detectChanges();

      const dueDate = fixture.nativeElement.querySelector('.todo-due-date');
      expect(dueDate).toBeTruthy();
    });

    it('should not show due date when todo has no due date', () => {
      const noDueDateTodo = { ...mockTodo, dueDate: undefined };
      componentRef.setInput('todo', noDueDateTodo);
      fixture.detectChanges();

      const dueDate = fixture.nativeElement.querySelector('.todo-due-date');
      expect(dueDate).toBeFalsy();
    });

    it('should show description when todo has description', () => {
      componentRef.setInput('todo', mockTodo);
      fixture.detectChanges();

      const description = fixture.nativeElement.querySelector('.todo-description');
      expect(description).toBeTruthy();
      expect(description.textContent.trim()).toBe('Test Description');
    });

    it('should not show description when todo has no description', () => {
      const noDescTodo = { ...mockTodo, description: undefined };
      componentRef.setInput('todo', noDescTodo);
      fixture.detectChanges();

      const description = fixture.nativeElement.querySelector('.todo-description');
      expect(description).toBeFalsy();
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria-label on action buttons', () => {
      componentRef.setInput('todo', mockTodo);
      fixture.detectChanges();

      const editButton = fixture.nativeElement.querySelector('.btn-edit');
      const deleteButton = fixture.nativeElement.querySelector('.btn-delete');

      expect(editButton.getAttribute('aria-label')).toBe('Edit todo');
      expect(deleteButton.getAttribute('aria-label')).toBe('Delete todo');
    });

    it('should have proper form labels', () => {
      componentRef.setInput('todo', mockTodo);
      component.onEdit();
      fixture.detectChanges();

      const titleLabel = fixture.nativeElement.querySelector('label[for="edit-title"]');
      const descLabel = fixture.nativeElement.querySelector('label[for="edit-description"]');

      expect(titleLabel.textContent.trim()).toBe('Title');
      expect(descLabel.textContent.trim()).toBe('Description');
    });
  });
});