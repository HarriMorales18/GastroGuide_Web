import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CreatorService } from '../../../services/creator.service';
import { environment } from '../../../../../../environments/environment';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './course-detail.html',
  styleUrls: ['./course-detail.css']
})
export class CourseDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private creatorService = inject(CreatorService);

  courseData = signal<any>(null);
  isSubmitting = signal(false);
  isPublishing = signal(false);
  isVideoOpen = signal(false);
  activeVideoUrl = signal<string | null>(null);
  activeVideoTitle = signal<string | null>(null);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.creatorService.getCourseDetails(id).subscribe(data => {
        this.courseData.set(data);
      });
    }
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