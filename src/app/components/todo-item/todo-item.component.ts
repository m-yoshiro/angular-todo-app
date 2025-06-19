import { Component, input, output, signal, computed, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Todo } from '../../models/todo.model';

@Component({
  selector: 'app-todo-item',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './todo-item.component.html',
  styleUrl: './todo-item.component.scss'
})
export class TodoItemComponent {
  todo = input.required<Todo>();
  
  toggleComplete = output<string>();
  editTodo = output<Todo>();
  deleteTodo = output<string>();

  isEditing = signal(false);
  editTitle = signal('');
  editDescription = signal('');

  @ViewChild('titleInput') titleInput?: ElementRef<HTMLInputElement>;

  isOverdue = computed(() => {
    const todo = this.todo();
    if (!todo.dueDate || todo.completed) return false;
    return new Date(todo.dueDate).getTime() < Date.now();
  });

  priorityClass = computed(() => {
    const priority = this.todo().priority;
    return `priority-${priority}`;
  });

  dueDateFormatted = computed(() => {
    const dueDate = this.todo().dueDate;
    if (!dueDate) return null;
    return new Date(dueDate).toLocaleDateString();
  });

  onToggleComplete(): void {
    this.toggleComplete.emit(this.todo().id);
  }

  onEdit(): void {
    this.editTitle.set(this.todo().title);
    this.editDescription.set(this.todo().description || '');
    this.isEditing.set(true);
    
    // Focus the title input after the view updates
    setTimeout(() => {
      this.titleInput?.nativeElement.focus();
    });
  }

  onSave(): void {
    const updatedTodo: Todo = {
      ...this.todo(),
      title: this.editTitle(),
      description: this.editDescription(),
      updatedAt: new Date()
    };
    this.editTodo.emit(updatedTodo);
    this.isEditing.set(false);
  }

  onCancel(): void {
    this.isEditing.set(false);
    this.editTitle.set('');
    this.editDescription.set('');
  }

  onDelete(): void {
    this.deleteTodo.emit(this.todo().id);
  }
}