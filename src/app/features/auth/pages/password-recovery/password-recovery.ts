import { Component, AfterViewInit, ElementRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { animate, stagger } from 'animejs';
import { finalize } from 'rxjs';
import { AuthService, PasswordRecoveryPayload } from '../../services/auth.service';

@Component({
  selector: 'app-password-recovery',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './password-recovery.html',
  styleUrls: ['./password-recovery.css']
})
export class PasswordRecoveryComponent implements AfterViewInit {
  private fb = inject(FormBuilder);
  private el = inject(ElementRef);
  private authService = inject(AuthService);

  isSubmitting = signal(false);
  isSent = signal(false);

  recoveryForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]]
  });

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
    if (this.recoveryForm.invalid) {
      this.recoveryForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const payload = this.recoveryForm.getRawValue() as PasswordRecoveryPayload;

    this.authService
      .passwordRecovery(payload)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          this.isSent.set(true);
          alert('Te enviamos un correo con el enlace de recuperacion.');
        },
        error: (error) => {
          console.error('Error en recuperacion de contrasena:', error);
          alert('No se pudo iniciar la recuperacion. Intenta de nuevo.');
        }
      });
  }

}
