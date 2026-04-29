import { Component, AfterViewInit, ElementRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { animate, stagger } from 'animejs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent implements AfterViewInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private el = inject(ElementRef);

  isSubmitting = signal(false);

  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

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
    if (this.loginForm.valid) {
      this.isSubmitting.set(true);
      console.log('Login Data:', this.loginForm.getRawValue());
      
      // Simulación de respuesta del backend
      setTimeout(() => {
        this.isSubmitting.set(false);
        this.router.navigate(['/creator']);
      }, 1500);
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}