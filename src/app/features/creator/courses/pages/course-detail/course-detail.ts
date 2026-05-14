import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreatorService } from '../../../services/creator.service';
import { environment } from '../../../../../../environments/environment';
import { ToastService } from '../../../../../core/services/toast.service';
import { AccessModel } from '../../../../../shared/interfaces/course';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './course-detail.html',
  styleUrls: ['./course-detail.css']
})
export class CourseDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private creatorService = inject(CreatorService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);

  courseData = signal<any>(null);
  isSubmitting = signal(false);
  isPublishing = signal(false);
  isVideoOpen = signal(false);
  activeVideoUrl = signal<string | null>(null);
  activeVideoTitle = signal<string | null>(null);
  isSavingAccess = signal(false);
  accessForm!: FormGroup;

  ngOnInit() {
    this.accessForm = this.fb.group({
      accessModel: ['FREE' as AccessModel, Validators.required],
      price: [0, [Validators.min(0)]],
      freeLessonIds: [[]]
    });

    this.accessForm.get('accessModel')?.valueChanges.subscribe((value) => {
      const priceControl = this.accessForm.get('price');
      const freeLessonIdsControl = this.accessForm.get('freeLessonIds');
      if (!priceControl) return;
      if (value === 'FREE') {
        priceControl.setValue(0, { emitEvent: false });
        priceControl.clearValidators();
        freeLessonIdsControl?.setValue([], { emitEvent: false });
      } else {
        priceControl.setValidators([Validators.required, Validators.min(0)]);
        if (value === 'PAID') {
          freeLessonIdsControl?.setValue([], { emitEvent: false });
        }
      }
      priceControl.updateValueAndValidity({ emitEvent: false });
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.creatorService.getCourseDetails(id).subscribe(data => {
        this.courseData.set(data);
        this.syncAccessForm(data);
      });
    }
  }

  private syncAccessForm(data: any): void {
    const course = data?.course;
    if (!course) return;

    const accessModel = this.resolveAccessModel(course, data?.modules || []);
    const price = typeof course.price === 'number' ? course.price : 0;
    const freeLessonIds = Array.isArray(course.freeLessonIds)
      ? course.freeLessonIds
      : this.getFreeLessonIdsFromModules(data?.modules || []);

    this.accessForm.patchValue(
      {
        accessModel,
        price,
        freeLessonIds
      },
      { emitEvent: false }
    );
  }

  private resolveAccessModel(course: any, modules: Array<any>): AccessModel {
    if (course?.accessModel === 'FREE' || course?.accessModel === 'PAID' || course?.accessModel === 'FREMIUM') {
      return course.accessModel;
    }

    if (course?.isFree) {
      return 'FREE';
    }

    const freeLessonIds = Array.isArray(course?.freeLessonIds)
      ? course.freeLessonIds
      : this.getFreeLessonIdsFromModules(modules);

    return freeLessonIds.length > 0 ? 'FREMIUM' : 'PAID';
  }

  private getFreeLessonIdsFromModules(modules: Array<any>): Array<number | string> {
    const ids: Array<number | string> = [];
    modules.forEach((module) => {
      (module.lessons || []).forEach((lesson: any) => {
        if (lesson.isFreePreview && lesson.id != null) {
          ids.push(lesson.id);
        }
      });
    });
    return ids;
  }

  getAllLessons(): Array<any> {
    const modules = this.courseData()?.modules || [];
    return modules.flatMap((module: any) =>
      (module.lessons || []).map((lesson: any) => ({
        ...lesson,
        moduleTitle: module.title
      }))
    );
  }

  isLessonSelected(lessonId: number | string): boolean {
    const ids = this.accessForm.get('freeLessonIds')?.value || [];
    return ids.includes(lessonId);
  }

  toggleFreeLesson(lessonId: number | string): Array<number | string> {
    const control = this.accessForm.get('freeLessonIds');
    if (!control) return [];
    const current: Array<number | string> = control.value || [];
    let next: Array<number | string>;
    if (current.includes(lessonId)) {
      next = current.filter((id) => id !== lessonId);
    } else {
      next = [...current, lessonId];
    }
    control.setValue(next);
    return next;
  }

  saveAccess(): void {
    if (!this.courseData()?.course?.id) return;
    if (this.accessForm.invalid) return;

    const courseId = this.courseData().course.id;
    const accessModel = (this.accessForm.get('accessModel')?.value || 'FREE') as AccessModel;
    const priceValue = Number(this.accessForm.get('price')?.value || 0);
    const freeLessonIds = accessModel === 'FREMIUM'
      ? (this.accessForm.get('freeLessonIds')?.value || []).map((id: number | string) => Number(id))
      : [];

    if (accessModel === 'FREMIUM' && freeLessonIds.length === 0) {
      this.toastService.showError('Selecciona al menos una lección para el modo Fremium');
      return;
    }

    const payload = {
      accessModel,
      price: accessModel === 'FREE' ? 0 : Math.max(priceValue, 0),
      freeLessonIds
    };

    this.isSavingAccess.set(true);
    this.creatorService.updateCourseAccess(courseId, payload).subscribe({
      next: (response) => {
        this.courseData.update((data) =>
          data
            ? {
                ...data,
                course: {
                  ...data.course,
                  accessModel: response.accessModel,
                  price: response.price,
                  isFree: response.isFree,
                  freeLessonIds: response.freeLessonIds
                },
                modules: (data.modules || []).map((module: any) => ({
                  ...module,
                  lessons: (module.lessons || []).map((lesson: any) => ({
                    ...lesson,
                    isFreePreview: response.freeLessonIds.includes(lesson.id)
                  }))
                }))
              }
            : data
        );
        this.toastService.showSuccess('Acceso y precio actualizados');
        this.isSavingAccess.set(false);
      },
      error: () => {
        this.toastService.showError('No se pudo actualizar el acceso');
        this.isSavingAccess.set(false);
      }
    });
  }

  isLessonFree(lesson: any): boolean {
    const course = this.courseData()?.course;
    if (!lesson) return false;
    if (course?.accessModel === 'FREE' || course?.isFree) return true;
    if (course?.accessModel === 'PAID') return false;
    const freeIds = course?.freeLessonIds || [];
    if (Array.isArray(freeIds) && freeIds.includes(lesson.id)) return true;
    return !!lesson.isFreePreview;
  }

  onAccessBadgeClick(lesson: any, event?: Event): void {
    if (event) event.stopPropagation();
    const course = this.courseData()?.course;
    if (!course) return;

    if (course.accessModel === 'FREE' || course.isFree) {
      this.toastService.showInfo('El curso es gratuito; todas las lecciones están disponibles.');
      return;
    }

    const currentAccessModel = (this.accessForm.get('accessModel')?.value || 'PAID') as AccessModel;
    const freeIds = this.toggleFreeLesson(lesson.id);
    const nextAccessModel: AccessModel =
      currentAccessModel === 'PAID' && freeIds.length > 0
        ? 'FREMIUM'
        : currentAccessModel === 'FREMIUM' && freeIds.length === 0
          ? 'PAID'
          : currentAccessModel;

    if (nextAccessModel !== currentAccessModel) {
      this.accessForm.get('accessModel')?.setValue(nextAccessModel);
    }

    this.courseData.update((data) => {
      if (!data) return data;
      return {
        ...data,
        course: {
          ...data.course,
          accessModel: nextAccessModel,
          isFree: nextAccessModel === 'FREE',
          freeLessonIds: freeIds
        },
        modules: (data.modules || []).map((mod: any) => ({
          ...mod,
          lessons: (mod.lessons || []).map((l: any) => ({
            ...l,
            isFreePreview: freeIds.includes(l.id)
          }))
        }))
      };
    });
  }

  requestVerification() {
    const id = this.courseData().course.id;
    this.isSubmitting.set(true);
    this.creatorService.requestVerification(id).subscribe({
      next: (res) => {
        alert('Solicitud enviada con éxito');
        this.isSubmitting.set(false);
      },
      error: () => this.isSubmitting.set(false)
    });
  }

  publishCourse(): void {
    const course = this.courseData()?.course;
    if (!course?.id) {
      return;
    }

    this.isPublishing.set(true);
    this.creatorService.updateCourseState(course.id, 'PUBLISHED').subscribe({
      next: (response) => {
        this.courseData.update((data) =>
          data
            ? {
                ...data,
                course: {
                  ...data.course,
                  state: response.state ?? 'PUBLISHED'
                }
              }
            : data
        );
        this.isPublishing.set(false);
      },
      error: () => this.isPublishing.set(false)
    });
  }

  openVideo(lesson: { videoUrl?: string | null; title?: string | null }): void {
    const url = lesson?.videoUrl?.trim();
    if (!url) {
      return;
    }
    this.activeVideoUrl.set(this.resolveMediaUrl(url));
    this.activeVideoTitle.set(lesson?.title ?? 'Video del curso');
    this.isVideoOpen.set(true);
  }

  closeVideo(): void {
    this.isVideoOpen.set(false);
    this.activeVideoUrl.set(null);
    this.activeVideoTitle.set(null);
  }

  resolveCoverImage(url?: string | null): string {
    if (!url || url.trim() === '' || url === 'string') {
      return '/logo.svg';
    }

    return this.resolveMediaUrl(url);
  }

  private resolveMediaUrl(url: string): string {
    if (/^(https?:)?\/\//i.test(url) || url.startsWith('data:') || url.startsWith('blob:')) {
      return url;
    }

    const baseUrl = environment.apiBaseUrl.replace(/\/$/, '');
    const normalizedPath = url.startsWith('/') ? url : `/${url}`;
    return `${baseUrl}${normalizedPath}`;
  }
}