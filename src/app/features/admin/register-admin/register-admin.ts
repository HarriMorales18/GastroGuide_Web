import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { AdminRegisterPayload, AdminService } from '../services/admin.service';

@Component({
  selector: 'app-register-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register-admin.html',
  styleUrls: ['./register-admin.css']
})
export class RegisterAdmin {
  private fb = inject(FormBuilder);
  private adminService = inject(AdminService);

  isSubmitting = signal(false);
  error = signal<string | null>(null);
  success = signal(false);

  adminForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    identificationNumber: ['', [Validators.required, Validators.minLength(5)]],
    identificationType: ['', Validators.required],
    nationality: ['', Validators.required],
    avatarUrl: ['', [Validators.required, Validators.pattern(/^https?:\/\//i)]],
    phoneNumber: ['', [Validators.required, Validators.minLength(7)]],
    birthDate: ['', Validators.required],
    adminId: ['', [Validators.required, Validators.minLength(3)]],
    department: ['', [Validators.required, Validators.minLength(2)]],
    assignedBy: ['', [Validators.required, Validators.minLength(3)]]
  });

  onSubmit(): void {
    if (this.adminForm.invalid) {
      this.adminForm.markAllAsTouched();
      return;
    }

    this.error.set(null);
    this.success.set(false);
    this.isSubmitting.set(true);

    const payload = this.adminForm.getRawValue() as AdminRegisterPayload;

    this.adminService
      .createAdministrator(payload)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          this.success.set(true);
          this.adminForm.reset();
        },
        error: () => {
          this.error.set('No se pudo crear el administrador.');
        }
      });
  }
}
