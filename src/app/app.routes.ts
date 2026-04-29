import { Routes } from '@angular/router';
import { creatorGuard } from './core/guards/creator-guard';
import { adminGuard } from './core/guards/admin-guard';

export const routes: Routes = [
  // Rutas públicas
  { 
    path: 'auth', 
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES) 
  },

  // Rutas protegidas para el Creador
  { 
    path: 'creator', 
    canActivate: [creatorGuard],
    loadChildren: () => import('./features/creator/creator.routes').then(m => m.CREATOR_ROUTES) 
  },

  // Rutas protegidas para el Administrador
  { 
    path: 'admin', 
    canActivate: [adminGuard],
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES) 
  },

  // Redirección por defecto
  { path: '', redirectTo: 'auth', pathMatch: 'full' },
  { path: '**', redirectTo: 'auth' }
];