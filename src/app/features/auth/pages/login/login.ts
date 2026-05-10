import { Component, AfterViewInit, ElementRef, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { animate, stagger } from 'animejs';
import { finalize } from 'rxjs';
import { AuthService, LoginPayload } from '../../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent implements AfterViewInit, OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private el = inject(ElementRef);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  isSubmitting = signal(false);
  loginErrorMessage = signal<string | null>(null);

  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });


  ngOnInit(): void {
    const hasToken = this.authService.getAccessToken();
    if (!hasToken) {
      return;
    }

    this.authService.hydrateSessionFromToken();
    const role = this.authService.userRole();

    if (role === 'ADMIN') {
      this.router.navigate(['/admin/users']);
    } else if (role === 'CREATOR') {
      this.router.navigate(['/creator/courses']);
    } else {
      this.router.navigate(['/creator/courses']);
    }
  }

  ngAfterViewInit() {
    const targets = this.el.nativeElement.querySelectorAll('.anime-item');

    animate(targets, {
      translateY: [30, 0],
      opacity: [0, 1],
      delay: stagger(150),
      easing: 'easeOutCubic',
      duration: 800
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.loginErrorMessage.set(null);
    const payload = this.loginForm.getRawValue() as LoginPayload;

    this.authService
      .login(payload)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          const role = this.authService.userRole();
          if (role === 'ADMIN') {
            this.router.navigate(['/admin/users']);
          } else if (role === 'CREATOR') {
            this.router.navigate(['/creator/courses']);
          } else {
            this.router.navigate(['/creator/courses']);
          }
        },
        error: (error) => {
          console.error('Error en login:', error);
          if (this.isUnverifiedCreator(error)) {
            this.showUnverifiedAlert();
            this.loginErrorMessage.set(null);
            return;
          }

          if (this.isInvalidCredentials(error)) {
            this.toastService.showError('Credenciales incorrectas. Verifica tu correo y contrasena.');
            this.loginErrorMessage.set(null);
            return;
          }

          const message = this.resolveLoginErrorMessage(error);
          this.loginErrorMessage.set(message);
        }
      });
  }

  private isUnverifiedCreator(error: unknown): boolean {
    if (!(error instanceof HttpErrorResponse)) {
      return false;
    }

    const exception = typeof error.error?.exception === 'string' ? error.error.exception : '';
    return exception === 'DisabledException' || error.status === 403;
  }

  private showUnverifiedAlert(): void {
    void Swal.fire({
      icon: 'info',
      title: 'Aun no has sido verificado',
      text: 'Un administrador debe aprobar tu cuenta para poder iniciar sesion.',
      confirmButtonText: 'Entendido'
    });
  }

  private isInvalidCredentials(error: unknown): boolean {
    if (!(error instanceof HttpErrorResponse)) {
      return false;
    }

    return error.status === 401 || error.status === 400;
  }

  private resolveLoginErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const exception = typeof error.error?.exception === 'string' ? error.error.exception : '';
      const status = error.status;

      if (status === 401 || status === 400) {
        return 'Credenciales incorrectas. Verifica tu correo y contrasena.';
      }
    }

    return 'No se pudo iniciar sesion. Intentalo de nuevo.';
  }

}