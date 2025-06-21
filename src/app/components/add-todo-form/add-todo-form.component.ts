import { Component, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
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
  
  priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' }
  ];
  
  todoForm = this.fb.group({
    title: ['', [Validators.required]],
    description: [''],
    priority: ['medium'],
    dueDate: ['', [this.futureDateValidator]]
  });

  private futureDateValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const inputDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (inputDate < today) {
      return { pastDate: true };
    }

    return null;
  }

  private validatePriority(priority: string | null | undefined): 'low' | 'medium' | 'high' {
    const validPriorities: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];
    return validPriorities.includes(priority as 'low' | 'medium' | 'high') ? (priority as 'low' | 'medium' | 'high') : 'medium';
  }

  onSubmit(): void {
    if (this.todoForm.valid) {
      this.isSubmitting.set(true);
      
      const formValue = this.todoForm.value;
      const createRequest: CreateTodoRequest = {
        title: formValue.title || '',
        description: formValue.description || undefined,
        priority: this.validatePriority(formValue.priority),
        dueDate: formValue.dueDate ? new Date(formValue.dueDate) : undefined
      };
      
      this.formSubmit.emit(createRequest);
      this.todoForm.reset({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: ''
      });
      this.isSubmitting.set(false);
    }
  }
}