import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { AdminService, AdminUserSummary } from '../services/admin.service';

@Component({
  selector: 'app-list-all-users',
  imports: [CommonModule],
  templateUrl: './list-all-users.html',
  styleUrl: './list-all-users.css',
})
export class ListAllUsers implements OnInit {
  private adminService = inject(AdminService);

  isLoading = signal(true);
  error = signal<string | null>(null);
  users = signal<AdminUserSummary[]>([]);

  totalCount = computed(() => this.users().length);
  activeCount = computed(() => this.users().filter((user) => user.isActive).length);
  verifiedCount = computed(() => this.users().filter((user) => user.isVerified).length);

  ngOnInit(): void {
    this.loadUsers();
  }

  reload(): void {
    this.loadUsers();
  }

  private loadUsers(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.adminService.getAllUsers().subscribe({
      next: (data) => {
        this.users.set(data ?? []);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los usuarios.');
        this.isLoading.set(false);
      }
    });
  }

  trackByEmail(_: number, user: AdminUserSummary): string {
    return user.email;
  }
}
