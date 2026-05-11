import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { AdminService, CreatorRequest, RequestStatus } from '../../../services/admin.service';

@Component({
  selector: 'app-user-list',
  imports: [CommonModule],
  templateUrl: './user-list.html',
  styleUrl: './user-list.css',
})
export class UserList implements OnInit {
  private adminService = inject(AdminService);

  isLoading = signal(true);
  error = signal<string | null>(null);
  requests = signal<CreatorRequest[]>([]);
  actionError = signal<string | null>(null);
  isActionBusy = signal<Record<number, boolean>>({});
  rejectingId = signal<number | null>(null);
  rejectReason = signal('');

  totalCount = computed(() => this.requests().length);
  pendingCount = computed(() => this.requests().filter((item) => item.status === 'PENDING').length);

  ngOnInit(): void {
    this.loadRequests();
  }

  reload(): void {
    this.loadRequests();
  }

  private loadRequests(): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.actionError.set(null);

    this.adminService
      .getCreatorRequests()
      .subscribe({
        next: (data) => {
          const normalized = (data ?? []).map((item) => ({
            ...item,
            reviewedAt: item.reviewedAt || null,
            notes: item.notes || null
          }));
          this.requests.set(normalized);
          this.isLoading.set(false);
        },
        error: () => {
          this.error.set('No se pudieron cargar las solicitudes.');
          this.isLoading.set(false);
        }
      });
  }

  approveRequest(item: CreatorRequest): void {
    if (this.isActionBusy()[item.id]) {
      return;
    }

    this.setBusy(item.id, true);
    this.actionError.set(null);

    this.adminService.approveCreatorRequest(item.id).subscribe({
      next: (response) => {
        this.applyStatusUpdate(item.id, response.status, null);
        this.setBusy(item.id, false);
      },
      error: () => {
        this.actionError.set('No se pudo aprobar la solicitud.');
        this.setBusy(item.id, false);
      }
    });
  }

  startReject(item: CreatorRequest): void {
    this.rejectingId.set(item.id);
    this.rejectReason.set('');
    this.actionError.set(null);
  }

  cancelReject(): void {
    this.rejectingId.set(null);
    this.rejectReason.set('');
  }

  submitReject(item: CreatorRequest): void {
    const reason = this.rejectReason().trim();
    if (!reason) {
      this.actionError.set('Ingresa un motivo de rechazo.');
      return;
    }

    if (this.isActionBusy()[item.id]) {
      return;
    }

    this.setBusy(item.id, true);
    this.actionError.set(null);

    this.adminService.rejectCreatorRequest(item.id, reason).subscribe({
      next: (response) => {
        this.applyStatusUpdate(item.id, response.status, reason);
        this.rejectingId.set(null);
        this.rejectReason.set('');
        this.setBusy(item.id, false);
      },
      error: () => {
        this.actionError.set('No se pudo rechazar la solicitud.');
        this.setBusy(item.id, false);
      }
    });
  }

  isPending(item: CreatorRequest): boolean {
    return item.status === 'PENDING';
  }

  private setBusy(id: number, value: boolean): void {
    this.isActionBusy.update((current) => ({
      ...current,
      [id]: value
    }));
  }

  private applyStatusUpdate(id: number, status: RequestStatus, notes: string | null): void {
    const now = new Date().toISOString();
    this.requests.update((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              status,
              reviewedAt: now,
              notes: notes ?? item.notes
            }
          : item
      )
    );
  }

  trackById(_: number, item: CreatorRequest): number {
    return item.id;
  }
}
