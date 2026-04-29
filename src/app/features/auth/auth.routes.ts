import { Routes } from '@angular/router';
import { CreatorRegisterComponent } from './pages/creator-register/creator-register';
import { LoginComponent } from './pages/login/login';

export const AUTH_ROUTES: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: CreatorRegisterComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];