import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CreatorService } from '../../../services/creator.service';

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
}