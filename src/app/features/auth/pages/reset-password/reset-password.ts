import { Component, AfterViewInit, ElementRef, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { animate, stagger } from 'animejs';
import { finalize } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.css']
})
export class ResetPasswordComponent implements AfterViewInit, OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private el = inject(ElementRef);
  private authService = inject(AuthService);

  isSubmitting = signal(false);
  token = '';

  // Formulario con nueva estructura
  resetForm = this.fb.nonNullable.group({
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  ngOnInit(): void {
    // Atrapamos el token de la URL (ej: /reset-password?token=abc123...)
    const tokenFromUrl = this.route.snapshot.queryParamMap.get('token');
    if (tokenFromUrl) {
      this.token = tokenFromUrl;
    } else {
      // Opcional: Redirigir si no hay token, ya que la vista no sirve sin él
      console.warn('No se encontró un token de recuperación.');
    }
  }

  // Validador personalizado para confirmar contraseña
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');
    return password && confirmPassword && password.value !== confirmPassword.value 
      ? { passwordMismatch: true } 
      : null;
  }

  ngAfterViewInit() {
    const targets = this.el.nativeElement.querySelectorAll('.anime-item');
    animate(targets, {
      translateY: [30, 0],
      opacity: [0, 1],
      delay: stagger(140),
      easing: 'easeOutCubic',
      duration: 800
    });
  }

  onSubmit() {
    if (this.resetForm.invalid || !this.token) {
      this.resetForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    // Mapeamos al cuerpo exacto que pide tu endpoint
    const payload = {
      token: this.token,
      newPassword: this.resetForm.getRawValue().newPassword
    };

    this.authService
      .resetPassword(payload)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          this.router.navigate(['/auth/login'], { queryParams: { resetSuccess: true } });
        },
        error: (err) => {
          console.error('Error al restablecer:', err);
        }
      });
  }
}