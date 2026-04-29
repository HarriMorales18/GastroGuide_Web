import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';

export const creatorGuard: CanActivateFn = (): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const role = authService.userRole();
  const isApproved = authService.isCreatorVerified();

  // 1. Validar que sea un Creador 
  if (role !== 'CREATOR') {
    return router.createUrlTree(['/auth/login']);
  }

  // 2. Validar aprobación administrativa (Regla de negocio M1 y M2) [cite: 125, 133]
  if (!isApproved) {
    // Redirigir a una página informativa del estado de su solicitud [cite: 132]
    return router.createUrlTree(['/features/auth/pages/pending-approval']);
  }

  return true; // Acceso a M2, M4 y M5 
};