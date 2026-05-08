// src/app/features/auth/services/auth.service.ts
import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap, throwError, catchError, of } from 'rxjs';
import { environment } from '../../../../environments/environment';

// Roles definidos en la documentación de GastroGuide 
export type UserRole = 'STUDENT' | 'CREATOR' | 'ADMIN';

export interface UserSession {
  id: string;
  email: string;
  role: UserRole;
  isApproved: boolean;
}

export interface CreatorRegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  identificationNumber: string;
  identificationType: string;
  nationality: string;
  avatarUrl: string;
  phoneNumber: string;
  birthDate: string;
  specialization: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface PasswordRecoveryPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

export interface AuthSessionEntity {
  id: number;
  jwtToken: string;
  refreshToken: string;
  initDate: string;
  endDate: string;
  device: string;
  operateSystem: string;
  ipOrigen: string;
  active: boolean;
}

export interface LoginResponse {
  userSessionEntity: AuthSessionEntity;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenStorageKey = 'gastro_tokens';
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

  constructor(private http: HttpClient) {
    this.checkLocalStorage();
    this.hydrateSessionFromToken();
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
    localStorage.removeItem(this.tokenStorageKey);
  }

  logoutRemote(): Observable<unknown> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.logout();
      return of(null);
    }

    return this.http
      .post(`${environment.apiBaseUrl}/api/auth/logout`, { refreshToken })
      .pipe(
        catchError(() => of(null)),
        tap(() => this.logout())
      );
  }

  createCreator(payload: CreatorRegisterPayload): Observable<unknown> {
    return this.http.post(`${environment.apiBaseUrl}/api/creator/create`, payload);
  }

  login(payload: LoginPayload): Observable<AuthSessionEntity> {
    return this.http
      .post<LoginResponse>(`${environment.apiBaseUrl}/api/auth/login`, payload)
      .pipe(
        map((response) => response.userSessionEntity),
        tap((session) => {
          this.setTokens(session);
          this.setSessionFromJwt(session.jwtToken);
        })
      );
  }

  refreshSession(): Observable<AuthSessionEntity> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http
      .post<LoginResponse>(`${environment.apiBaseUrl}/api/auth/refresh`, { refreshToken })
      .pipe(
        map((response) => response.userSessionEntity),
        tap((session) => {
          this.setTokens(session);
          this.setSessionFromJwt(session.jwtToken);
        })
      );
  }

  passwordRecovery(payload: PasswordRecoveryPayload): Observable<string> {
    return this.http.post(`${environment.apiBaseUrl}/api/auth/password-recovery`, payload, {
      responseType: 'text'
    });
  }

  resetPassword(payload: ResetPasswordPayload): Observable<string> {
    return this.http.post(`${environment.apiBaseUrl}/api/auth/reset-password`, payload, {
      responseType: 'text'
    });
  }

  getAccessToken(): string | null {
    const stored = localStorage.getItem(this.tokenStorageKey);
    if (!stored) {
      return null;
    }

    try {
      return JSON.parse(stored).jwtToken ?? null;
    } catch {
      return null;
    }
  }

  getRefreshToken(): string | null {
    const stored = localStorage.getItem(this.tokenStorageKey);
    if (!stored) {
      return null;
    }

    try {
      return JSON.parse(stored).refreshToken ?? null;
    } catch {
      return null;
    }
  }

  hydrateSessionFromToken(): void {
    const token = this.getAccessToken();
    if (token) {
      this.setSessionFromJwt(token);
    }
  }

  private setTokens(session: AuthSessionEntity): void {
    localStorage.setItem(
      this.tokenStorageKey,
      JSON.stringify({
        jwtToken: session.jwtToken,
        refreshToken: session.refreshToken
      })
    );
  }

  private setSessionFromJwt(token: string): void {
    const claims = this.parseJwt(token);
    if (!claims) {
      return;
    }


    const role = this.extractRole(claims);
    if (!role) {
      return;
    }

    const email = this.extractEmail(claims);
    const id = this.extractId(claims, email);
    const isApproved = this.extractApproval(claims, role);

    this.setUserSession({
      id,
      email,
      role,
      isApproved
    });
  }

  private parseJwt(token: string): Record<string, unknown> | null {
    const parts = token.split('.');
    if (parts.length < 2) {
      return null;
    }

    try {
      const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const decoded = atob(payload.padEnd(payload.length + (4 - (payload.length % 4)) % 4, '='));
      return JSON.parse(decoded) as Record<string, unknown>;
    } catch {
      return null;
    }
  }

  private extractRole(claims: Record<string, unknown>): UserRole | null {
    const directRole = typeof claims['role'] === 'string' ? (claims['role'] as string) : null;
    if (directRole) {
      const normalized = this.normalizeRole(directRole);
      if (normalized) {
        return normalized;
      }
    }

    const roles = claims['roles'];
    if (Array.isArray(roles)) {
      const role = roles
        .map((value) => (typeof value === 'string' ? this.normalizeRole(value) : null))
        .find((value): value is UserRole => !!value);
      return role ? role : null;
    }

    const authorities = claims['authorities'];
    if (Array.isArray(authorities)) {
      const role = authorities
        .map((value) => (typeof value === 'string' ? this.normalizeRole(value) : null))
        .find((value): value is UserRole => !!value);
      return role ? role : null;
    }

    if (typeof authorities === 'string') {
      const normalized = this.normalizeRole(authorities);
      return normalized ? normalized : null;
    }

    return null;
  }

  private extractEmail(claims: Record<string, unknown>): string {
    if (typeof claims['email'] === 'string') {
      return claims['email'] as string;
    }

    if (typeof claims['sub'] === 'string') {
      return claims['sub'] as string;
    }

    if (typeof claims['username'] === 'string') {
      return claims['username'] as string;
    }

    return '';
  }

  private extractId(claims: Record<string, unknown>, email: string): string {
    const rawId = claims['userId'] ?? claims['id'] ?? email;
    return typeof rawId === 'string' || typeof rawId === 'number' ? String(rawId) : '';
  }

  private extractApproval(claims: Record<string, unknown>, role: UserRole): boolean {
    const approved =
      claims['isApproved'] ??
      claims['approved'] ??
      claims['creatorApproved'] ??
      claims['is_verified'] ??
      claims['isVerified'];
    if (typeof approved === 'boolean') {
      return approved;
    }

    return true;
  }

  private isUserRole(value: string): value is UserRole {
    return value === 'STUDENT' || value === 'CREATOR' || value === 'ADMIN';
  }

  private normalizeRole(value: string): UserRole | null {
    const trimmed = value.replace(/^ROLE_/, '');
    return this.isUserRole(trimmed) ? trimmed : null;
  }
}