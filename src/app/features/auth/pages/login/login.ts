import { Component, AfterViewInit, ElementRef, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { animate, stagger } from 'animejs';
import { finalize } from 'rxjs';
import { AuthService, LoginPayload } from '../../services/auth.service';

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

  isSubmitting = signal(false);

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
          alert('No se pudo iniciar sesion. Verifica tus credenciales.');
        }
      });
  }
}