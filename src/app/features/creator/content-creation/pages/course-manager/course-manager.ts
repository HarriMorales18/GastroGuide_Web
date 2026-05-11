import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { ToastService } from '../../../../../core/services/toast.service';
import {
  CourseCreatePayload,
  CourseCategory,
  CuisineType,
  DifficultyLevel
} from '../../../../../shared/interfaces/course';
import {
  COURSE_CATEGORY_OPTIONS,
  CUISINE_OPTIONS,
  DIFFICULTY_OPTIONS
} from '../../../../../core/constants/course-options';
import { CreatorService } from '../../../services/creator.service';

@Component({
  selector: 'app-course-manager',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './course-manager.html',
  styleUrl: './course-manager.css',
})
export class CourseManager {
  private fb = inject(FormBuilder);
  private creatorService = inject(CreatorService);
  private toastService = inject(ToastService);

  isSubmitting = signal(false);
  readonly difficultyOptions: DifficultyLevel[] = DIFFICULTY_OPTIONS;
  readonly categoryOptions: CourseCategory[] = COURSE_CATEGORY_OPTIONS;
  readonly cuisineOptions: CuisineType[] = CUISINE_OPTIONS;

  courseForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    difficultyLevel: ['BEGINNER' as DifficultyLevel, Validators.required],
    category: ['BASIC_TECHNIQUES' as CourseCategory, Validators.required],
    cuisineType: ['ITALIAN' as CuisineType, Validators.required]
  });

  onSubmit(): void {
    if (this.courseForm.invalid) {
      this.courseForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const payload = this.courseForm.getRawValue() as CourseCreatePayload;

    this.creatorService
      .createCourse(payload)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          this.toastService.showSuccess('Curso creado exitosamente.');
          this.courseForm.reset({
            title: '',
            description: '',
            difficultyLevel: 'BEGINNER',
            category: 'BASIC_TECHNIQUES',
            cuisineType: 'ITALIAN'
          });
        },
        error: () => {
          this.toastService.showError('No se pudo crear el curso. Intenta de nuevo.');
        }
      });
  }
}
