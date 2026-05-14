import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';
import { CreatorService } from '../../features/creator/services/creator.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
})
export class Header implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private creatorService = inject(CreatorService);
  private currentSection = signal<'creator' | 'admin' | 'none'>('none');

  role = computed(() => this.authService.userRole());
  section = computed(() => this.currentSection());
  isMenuOpen = signal(false);
  profileImageUrl = signal<string | null>(null);

  constructor() {
    this.setSectionFromUrl(this.router.url || window.location.pathname);
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.setSectionFromUrl(event.urlAfterRedirects);
      }
    });
  }

  ngOnInit() {
    // Carga el perfil solo si el rol es CREATOR
    if (this.role() === 'CREATOR') {
      this.creatorService.getProfile().subscribe({
        next: (profile) => this.profileImageUrl.set(profile.avatarUrl),
        error: () => this.profileImageUrl.set(null)
      });
    }
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

  toggleMenu() {
    this.isMenuOpen.update(v => !v);
  }

  logout(): void {
    this.authService.logoutRemote().subscribe({
      next: () => {
        // CORRECCIÓN: Agregamos las llaves para que ambas líneas se ejecuten
        this.isMenuOpen.set(false);
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        // Por seguridad, si falla la petición remota, también cerramos el menú
        this.isMenuOpen.set(false);
        console.error('Logout error:', err);
      }
    });
  }
}