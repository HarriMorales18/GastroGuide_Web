import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';

export const creatorGuard: CanActivateFn = (): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const role = authService.userRole();
  const isApproved = authService.isCreatorVerified();

  if (role !== 'CREATOR') {
    return router.createUrlTree(['/auth/login']);
  }

  if (!isApproved) {
    return router.createUrlTree(['/features/auth/pages/pending-approval']);
  }

  return true;
};