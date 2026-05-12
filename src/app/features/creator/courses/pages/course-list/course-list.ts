import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CreatorService } from '../../../services/creator.service';
import { environment } from '../../../../../../environments/environment';

@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './course-list.html',
  styleUrls: ['./course-list.css']
})
export class CourseListComponent implements OnInit {
  private creatorService = inject(CreatorService);
  private router = inject(Router);

  courses = signal<any[]>([]);
  isLoading = signal(true);

  ngOnInit() {
    this.creatorService.getCourseSummaries().subscribe({
      next: (data) => {
        this.courses.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  goToDetails(id: number) {
    this.router.navigate(['/creator/courses', id]);
  }

  resolveCoverImage(url?: string | null): string {
    if (!url || url.trim() === '' || url === 'string') {
      return '/logo.svg';
    }

    if (/^(https?:)?\/\//i.test(url) || url.startsWith('data:') || url.startsWith('blob:')) {
      return url;
    }

    const baseUrl = environment.apiBaseUrl.replace(/\/$/, '');
    const normalizedPath = url.startsWith('/') ? url : `/${url}`;
    return `${baseUrl}${normalizedPath}`;
  }
}