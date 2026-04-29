import { Component, AfterViewInit, ElementRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { animate, stagger } from 'animejs';

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

  isSubmitting = signal(false);

  registerForm = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    especialidad: ['', Validators.required],
    experiencia: ['', [Validators.required, Validators.min(1)]],
    descripcion: ['', [Validators.required, Validators.minLength(50)]]
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
    if (this.registerForm.valid) {
      this.isSubmitting.set(true);
      console.log('Registro Payload:', this.registerForm.getRawValue());
      
      setTimeout(() => {
        this.isSubmitting.set(false);
        this.router.navigate(['/auth/login']); 
        alert('Solicitud enviada con éxito. Un administrador revisará tu perfil.');
      }, 2000);
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}