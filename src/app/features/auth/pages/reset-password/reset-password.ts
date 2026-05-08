import { Component, AfterViewInit, ElementRef, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { animate, stagger } from 'animejs';
import { finalize } from 'rxjs';
import { AuthService, ResetPasswordPayload } from '../../services/auth.service';

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
  hasToken = signal(false);

  resetForm = this.fb.nonNullable.group({
    token: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(8)]]
  });

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (token) {
      this.resetForm.controls.token.setValue(token);
      this.hasToken.set(true);
    }
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
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const payload = this.resetForm.getRawValue() as ResetPasswordPayload;

    this.authService
      .resetPassword(payload)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          alert('Contrasena restablecida. Ya puedes iniciar sesion.');
          this.router.navigate(['/auth/login']);
        },
        error: (error) => {
          console.error('Error al restablecer contrasena:', error);
          alert('No se pudo restablecer la contrasena. Verifica el token.');
        }
      });
  }
}
