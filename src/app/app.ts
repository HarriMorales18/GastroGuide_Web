import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Header } from './layout/header/header';
import { AuthService } from './features/auth/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, Header],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private authService = inject(AuthService);
  private router = inject(Router);
  protected readonly title = signal('GastroGuide_Web');
  protected readonly isAuthenticated = computed(() => this.authService.isAuthenticated());
  protected readonly hasToken = computed(() => !!this.authService.getAccessToken());
  protected readonly showHeader = signal(false);

  constructor() {
    this.updateHeaderVisibility(this.router.url || window.location.pathname);
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.updateHeaderVisibility(event.urlAfterRedirects);
      }
    });
  }

  private updateHeaderVisibility(url: string): void {
    const isProtected = url.startsWith('/creator') || url.startsWith('/admin');
    this.showHeader.set(isProtected);
  }
}
