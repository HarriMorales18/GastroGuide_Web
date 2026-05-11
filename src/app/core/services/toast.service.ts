import { Injectable, inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastr = inject(ToastrService);

  showError(message: string): void {
    this.toastr.error(message, '', {
      timeOut: 3500,
      progressBar: true,
      closeButton: true
    });
  }

  showSuccess(message: string): void {
    this.toastr.success(message, '', {
      timeOut: 3000,
      progressBar: true,
      closeButton: true
    });
  }
}
