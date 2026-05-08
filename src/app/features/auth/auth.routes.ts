import { Routes } from '@angular/router';
import { CreatorRegisterComponent } from './pages/creator-register/creator-register';
import { LoginComponent } from './pages/login/login';
import { PasswordRecoveryComponent } from './pages/password-recovery/password-recovery';
import { ResetPasswordComponent } from './pages/reset-password/reset-password';

export const AUTH_ROUTES: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'password-recovery', component: PasswordRecoveryComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'register', component: CreatorRegisterComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];