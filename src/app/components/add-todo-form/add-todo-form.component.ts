import { Component, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CreateTodoRequest } from '../../models/todo.model';

@Component({
  selector: 'app-add-todo-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-todo-form.component.html',
  styleUrl: './add-todo-form.component.scss'
})
export class AddTodoFormComponent {
  private fb = inject(FormBuilder);
  
  formSubmit = output<CreateTodoRequest>();
  
  isSubmitting = signal(false);
  
  todoForm = this.fb.group({
    title: ['', [Validators.required]],
    description: ['']
  });

  onSubmit(): void {
    if (this.todoForm.valid) {
      this.isSubmitting.set(true);
      
      const formValue = this.todoForm.value;
      const createRequest: CreateTodoRequest = {
        title: formValue.title || '',
        description: formValue.description || undefined
      };
      
      this.formSubmit.emit(createRequest);
      this.todoForm.reset({
        title: '',
        description: ''
      });
      this.isSubmitting.set(false);
    }
  }
}