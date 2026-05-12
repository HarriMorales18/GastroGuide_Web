import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CreatorService } from '../../../services/creator.service';

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
}