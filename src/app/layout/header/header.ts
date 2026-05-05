import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink],
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
})
export class Header {
  private authService = inject(AuthService);
  private router = inject(Router);
  private currentSection = signal<'creator' | 'admin' | 'none'>('none');

  role = computed(() => this.authService.userRole());
  section = computed(() => this.currentSection());

  constructor() {
    this.setSectionFromUrl(this.router.url || window.location.pathname);
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.setSectionFromUrl(event.urlAfterRedirects);
      }
    });
  }

  private setSectionFromUrl(url: string): void {
    if (url.startsWith('/admin')) {
      this.currentSection.set('admin');
    } else if (url.startsWith('/creator')) {
      this.currentSection.set('creator');
    } else {
      this.currentSection.set('none');
    }
  }

  logout(): void {
    this.authService.logoutRemote().subscribe({
      next: () => this.router.navigate(['/auth/login'])
    });
  }
}
