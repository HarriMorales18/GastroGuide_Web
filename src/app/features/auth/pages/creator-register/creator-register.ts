import { Component, AfterViewInit, ElementRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { animate, stagger } from 'animejs';
import { finalize } from 'rxjs';
import { AuthService, CreatorRegisterPayload } from '../../services/auth.service';

@Component({
  selector: 'app-creator-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './creator-register.html',
  styleUrls: ['./creator-register.css']
})
export class CreatorRegisterComponent implements AfterViewInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private el = inject(ElementRef);
  private authService = inject(AuthService);

  isSubmitting = signal(false);

  registerForm = this.fb.nonNullable.group({
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
    specialization: ['', [Validators.required, Validators.minLength(5)]]
  });

  ngAfterViewInit() {
    const targets = this.el.nativeElement.querySelectorAll('.anime-item');

    animate(targets, {
      translateY: [40, 0],
      opacity: [0, 1],
      delay: stagger(100),
      easing: 'easeOutQuart',
      duration: 1000
    });
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const payload = this.registerForm.getRawValue() as CreatorRegisterPayload;

    this.authService
      .createCreator(payload)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          this.router.navigate(['/auth/login']);
          alert('Registro enviado con exito. Revisa tu correo para el siguiente paso.');
        },
        error: (error) => {
          console.error('Error al crear el creador:', error);
          alert('No se pudo completar el registro. Intenta de nuevo.');
        }
      });
  }
}