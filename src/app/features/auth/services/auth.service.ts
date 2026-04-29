// src/app/features/auth/services/auth.service.ts
import { Injectable, signal, computed } from '@angular/core';

// Roles definidos en la documentación de GastroGuide 
export type UserRole = 'STUDENT' | 'CREATOR' | 'ADMIN';

export interface UserSession {
  id: string;
  email: string;
  role: UserRole;
  isApproved: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Signal privado para manejar el estado del usuario
  private _currentUser = signal<UserSession | null>(null);

  // Exponemos señales computadas para los Guards
  public readonly user = computed(() => this._currentUser());
  public readonly isAuthenticated = computed(() => !!this._currentUser());
  public readonly userRole = computed(() => this._currentUser()?.role);
  
  // Verifica si el creador pasó el proceso de aprobación del Administrador [cite: 125]
  public readonly isCreatorVerified = computed(() => 
    this._currentUser()?.role === 'CREATOR' && this._currentUser()?.isApproved
  );

  constructor() {
    this.checkLocalStorage();
  }

  private checkLocalStorage() {
    const savedUser = localStorage.getItem('gastro_session');
    if (savedUser) {
      this._currentUser.set(JSON.parse(savedUser));
    }
  }

  // Método para el login real (M1: Gestión de Usuarios) [cite: 120]
  setUserSession(session: UserSession) {
    this._currentUser.set(session);
    localStorage.setItem('gastro_session', JSON.stringify(session));
  }

  logout() {
    this._currentUser.set(null);
    localStorage.removeItem('gastro_session');
  }
}