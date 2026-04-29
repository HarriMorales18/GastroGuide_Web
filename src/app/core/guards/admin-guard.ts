// src/app/core/guards/admin.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';

export const adminGuard: CanActivateFn = (): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si no está autenticado o no es ADMIN, redirigimos al login [cite: 126]
  if (authService.userRole() !== 'ADMIN') {
    return router.createUrlTree(['/auth/login']);
  }

  return true; // Acceso total a M6 
};