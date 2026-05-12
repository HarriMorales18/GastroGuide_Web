import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, CourseRequest } from '../../../services/admin.service';

@Component({
  selector: 'app-pending-courses',
  imports: [CommonModule],
  templateUrl: './pending-courses.html',
  styleUrls: ['./pending-courses.css']
})
export class PendingCourse implements OnInit {
  requests = signal<CourseRequest[]>([]);
  isLoading = signal(false);
  selectedRequestId = signal<number | null>(null);

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadRequests();
  }

  loadRequests() {
    this.isLoading.set(true);
    this.adminService.getCourseRequests().subscribe({
      next: (data) => {
        // Mostramos solo los que están en estado PENDING según el flujo
        this.requests.set(data.filter(r => r.status === 'PENDING'));
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  handleApprove(id: number) {
    this.adminService.approveCourseRequest(id).subscribe(() => this.loadRequests());
  }

  handleReject(id: number, reason: string) {
    if (!reason.trim()) return;
    this.adminService.rejectCourseRequest(id, reason).subscribe(() => {
      this.selectedRequestId.set(null);
      this.loadRequests();
    });
  }
}