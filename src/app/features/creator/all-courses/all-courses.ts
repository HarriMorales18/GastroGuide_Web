import { CommonModule, DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CreatorService } from '../services/creator.service';
import {
  CourseCategory,
  CourseSummary,
  CourseUpdatePayload,
  CuisineType,
  DifficultyLevel,
  LessonCreatePayload,
  ModuleCreatePayload,
  ModuleUpdatePayload,
  ModuleSummary
} from '../../../shared/interfaces/course';
import {
  COURSE_CATEGORY_OPTIONS,
  CUISINE_OPTIONS,
  DIFFICULTY_OPTIONS
} from '../../../core/constants/course-options';

@Component({
  selector: 'app-all-courses',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './all-courses.html',
  styleUrl: './all-courses.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AllCourses implements OnInit {
  private fb = inject(FormBuilder);
  private creatorService = inject(CreatorService);
  private document = inject(DOCUMENT);
  private destroyRef = inject(DestroyRef);

  isLoading = signal(true);
  isSaving = signal(false);
  isSubmittingModule = signal(false);
  isSubmittingModuleUpdate = signal(false);
  isSubmittingLesson = signal(false);
  error = signal<string | null>(null);
  saveError = signal<string | null>(null);
  saveSuccess = signal<string | null>(null);
  modalError = signal<string | null>(null);
  modalSuccess = signal<string | null>(null);
  courses = signal<CourseSummary[]>([]);
  selectedCourse = signal<CourseSummary | null>(null);
  activeModal = signal<'module' | 'lesson' | 'module-update' | null>(null);
  modules = signal<ModuleSummary[]>([]);
  isLoadingModules = signal(false);
  modulesError = signal<string | null>(null);

  readonly difficultyOptions: DifficultyLevel[] = DIFFICULTY_OPTIONS;
  readonly categoryOptions: CourseCategory[] = COURSE_CATEGORY_OPTIONS;
  readonly cuisineOptions: CuisineType[] = CUISINE_OPTIONS;
  readonly lessonTypeOptions = ['VIDEO', 'LIVE', 'QUIZ', 'ARTICLE'];
  readonly resourceTypeOptions = [
    'PDF_RECIPE',
    'CHEF_NOTES',
    'IMAGE',
    'INGREDIENT_LIST',
    'EXTERNAL_LINK'
  ];

  totalCount = computed(() => this.courses().length);
  beginnerCount = computed(() => this.countByLevel('BEGINNER'));
  intermediateCount = computed(() => this.countByLevel('INTERMEDIATE'));
  advancedCount = computed(() => this.countByLevel('ADVANCED'));

  courseForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    difficultyLevel: ['BEGINNER' as DifficultyLevel, Validators.required],
    category: ['BASIC_TECHNIQUES' as CourseCategory, Validators.required],
    cuisineType: ['ITALIAN' as CuisineType, Validators.required],
    coverImageUrl: ['', [Validators.maxLength(500)]],
    tags: [''],
    language: ['']
  });

  moduleForm = this.fb.nonNullable.group({
    courseId: ['', Validators.required],
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.minLength(5)]]
  });

  moduleUpdateForm = this.fb.nonNullable.group({
    courseId: ['', Validators.required],
    moduleId: ['', Validators.required],
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.minLength(5)]]
  });

  lessonForm = this.fb.nonNullable.group({
    courseId: ['', Validators.required],
    moduleId: ['', Validators.required],
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(1000)]],
    description: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(1000)]],
    isFreePreview: [false],
    lessonType: ['VIDEO', Validators.required],
    videoUrl: ['', [Validators.maxLength(1000)]],
    resourceType: ['PDF_RECIPE', Validators.required],
    fileUrl: ['', [Validators.maxLength(1000)]]
  });

  ngOnInit(): void {
    this.loadCourses();

    this.lessonForm
      .get('courseId')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        if (!value) {
          this.modules.set([]);
          return;
        }
        this.loadModules(value);
      });

    this.moduleUpdateForm
      .get('courseId')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.modules.set([]);
        this.moduleUpdateForm.patchValue({ moduleId: '', title: '', description: '' });
        if (!value) {
          return;
        }
        this.loadModules(value);
      });

    this.moduleUpdateForm
      .get('moduleId')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        const selected = this.modules().find((module) => String(module.id) === String(value));
        if (!selected) {
          this.moduleUpdateForm.patchValue({ title: '', description: '' });
          return;
        }
        this.moduleUpdateForm.patchValue({
          title: selected.title,
          description: selected.description
        });
      });
  }

  reload(): void {
    this.loadCourses();
  }

  selectCourse(course: CourseSummary): void {
    this.selectedCourse.set(course);
    this.saveError.set(null);
    this.saveSuccess.set(null);
    this.courseForm.reset({
      title: course.title,
      description: course.description,
      difficultyLevel: course.difficultyLevel,
      category: course.category,
      cuisineType: course.cuisineType,
      coverImageUrl: course.coverImageUrl ?? '',
      tags: course.tags ?? '',
      language: course.language ?? ''
    });
  }

  clearSelection(): void {
    this.selectedCourse.set(null);
    this.saveError.set(null);
    this.saveSuccess.set(null);
    this.courseForm.reset({
      title: '',
      description: '',
      difficultyLevel: 'BEGINNER',
      category: 'BASIC_TECHNIQUES',
      cuisineType: 'ITALIAN',
      coverImageUrl: '',
      tags: '',
      language: ''
    });
  }

  updateCourse(): void {
    const selected = this.selectedCourse();
    this.saveError.set(null);
    this.saveSuccess.set(null);

    if (!selected) {
      this.saveError.set('Selecciona un curso para editar.');
      return;
    }

    if (selected.id == null || selected.id === '') {
      this.saveError.set('Este curso no tiene ID. Revisa el endpoint de resumen.');
      return;
    }

    if (this.courseForm.invalid) {
      this.courseForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const payload = this.sanitizePayload(this.courseForm.getRawValue() as CourseUpdatePayload);
    if (!payload) {
      this.isSaving.set(false);
      return;
    }

    this.creatorService
      .updateCourse(selected.id, payload)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: () => {
          this.courses.update((items) =>
            items.map((item) =>
              item.id === selected.id
                ? {
                    ...item,
                    title: payload.title,
                    description: payload.description,
                    difficultyLevel: payload.difficultyLevel,
                    category: payload.category,
                    cuisineType: payload.cuisineType,
                    coverImageUrl: payload.coverImageUrl,
                    tags: payload.tags,
                    language: payload.language
                  }
                : item
            )
          );
          this.selectedCourse.set({
            ...selected,
            ...payload
          });
          this.saveSuccess.set('Curso actualizado correctamente.');
        },
        error: () => {
          this.saveError.set('No se pudo actualizar el curso. Intenta de nuevo.');
        }
      });
  }

  openModal(type: 'module' | 'lesson' | 'module-update'): void {
    this.activeModal.set(type);
    this.modalError.set(null);
    this.modalSuccess.set(null);
    const selected = this.selectedCourse();
    const courseId = selected?.id != null ? String(selected.id) : '';
    if (type === 'module') {
      this.moduleForm.reset({
        courseId,
        title: '',
        description: ''
      });
    } else if (type === 'lesson') {
      this.lessonForm.reset({
        courseId,
        moduleId: '',
        title: '',
        description: '',
        isFreePreview: false,
        lessonType: 'VIDEO',
        videoUrl: '',
        resourceType: 'PDF_RECIPE',
        fileUrl: ''
      });
    } else {
      this.moduleUpdateForm.reset({
        courseId,
        moduleId: '',
        title: '',
        description: ''
      });
      if (courseId) {
        this.loadModules(courseId);
      }
    }
    this.scrollToModalForm();
  }

  closeModal(): void {
    this.activeModal.set(null);
  }

  submitModule(): void {
    this.modalError.set(null);
    this.modalSuccess.set(null);
    if (this.moduleForm.invalid) {
      this.moduleForm.markAllAsTouched();
      return;
    }

    this.isSubmittingModule.set(true);
    const payload = this.moduleForm.getRawValue() as ModuleCreatePayload;
    this.creatorService
      .createModule(payload)
      .pipe(finalize(() => this.isSubmittingModule.set(false)))
      .subscribe({
        next: () => {
          this.modalSuccess.set('Modulo creado correctamente.');
        },
        error: () => {
          this.modalError.set('No se pudo crear el modulo. Intenta de nuevo.');
        }
      });
  }

  submitLesson(): void {
    this.modalError.set(null);
    this.modalSuccess.set(null);
    if (this.lessonForm.invalid) {
      this.lessonForm.markAllAsTouched();
      return;
    }

    this.isSubmittingLesson.set(true);
    const { courseId: _, ...payload } = this.lessonForm.getRawValue();
    this.creatorService
      .createLesson(payload as LessonCreatePayload)
      .pipe(finalize(() => this.isSubmittingLesson.set(false)))
      .subscribe({
        next: () => {
          this.modalSuccess.set('Leccion creada correctamente.');
        },
        error: () => {
          this.modalError.set('No se pudo crear la leccion. Intenta de nuevo.');
        }
      });
  }

  submitModuleUpdate(): void {
    this.modalError.set(null);
    this.modalSuccess.set(null);
    if (this.moduleUpdateForm.invalid) {
      this.moduleUpdateForm.markAllAsTouched();
      return;
    }

    const rawValue = this.moduleUpdateForm.getRawValue();
    const payload: ModuleUpdatePayload = {
      id: this.normalizeIdForPayload(rawValue.moduleId),
      title: rawValue.title,
      description: rawValue.description
    };

    this.isSubmittingModuleUpdate.set(true);
    this.creatorService
      .updateModule(payload)
      .pipe(finalize(() => this.isSubmittingModuleUpdate.set(false)))
      .subscribe({
        next: () => {
          this.modules.update((items) =>
            items.map((item) =>
              String(item.id) === String(payload.id)
                ? { ...item, title: payload.title, description: payload.description }
                : item
            )
          );
          this.modalSuccess.set('Modulo actualizado correctamente.');
        },
        error: () => {
          this.modalError.set('No se pudo actualizar el modulo. Intenta de nuevo.');
        }
      });
  }

  trackByCourse(_: number, course: CourseSummary): string {
    return `${course.title}-${course.category}-${course.cuisineType}`;
  }

  private loadCourses(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.creatorService.getCourseSummaries().subscribe({
      next: (data) => {
        this.courses.set(this.normalizeCourses(data ?? []));
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los cursos.');
        this.isLoading.set(false);
      }
    });
  }

  private countByLevel(level: DifficultyLevel): number {
    return this.courses().filter((course) => course.difficultyLevel === level).length;
  }

  private sanitizePayload(payload: CourseUpdatePayload): CourseUpdatePayload | null {
    if (payload.coverImageUrl?.startsWith('data:')) {
      this.saveError.set('La imagen de portada debe ser una URL, no base64.');
      return null;
    }
    return payload;
  }

  private loadModules(courseId: number | string): void {
    this.isLoadingModules.set(true);
    this.modulesError.set(null);

    this.creatorService.getModulesByCourse(courseId).subscribe({
      next: (data) => {
        this.modules.set(data ?? []);
        this.isLoadingModules.set(false);
      },
      error: () => {
        this.modulesError.set('No se pudieron cargar los modulos.');
        this.isLoadingModules.set(false);
      }
    });
  }

  private scrollToModalForm(): void {
    setTimeout(() => {
      const target = this.document.getElementById('course-action-form');
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  }

  private normalizeCourses(items: CourseSummary[]): CourseSummary[] {
    return items.map((item) => ({
      ...item,
      id: this.coerceId(item.id ?? this.extractFallbackId(item)) ?? undefined
    }));
  }

  private extractFallbackId(item: CourseSummary): number | string | null {
    const fallback = (item as CourseSummary & { courseId?: unknown; idCourse?: unknown });
    return this.coerceId(fallback.courseId ?? fallback.idCourse);
  }

  private coerceId(value: unknown): number | string | null {
    if (typeof value === 'number' || typeof value === 'string') {
      return value;
    }
    return null;
  }

  private normalizeIdForPayload(value: number | string): number | string {
    if (typeof value === 'number') {
      return value;
    }
    const trimmed = value.trim();
    if (!trimmed) {
      return value;
    }
    const numeric = Number(trimmed);
    return Number.isNaN(numeric) ? value : numeric;
  }
}
