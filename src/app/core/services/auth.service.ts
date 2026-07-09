import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, JwtSession, LoginRequest, RegisterRequest, UserResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'urbancore_token';
  private readonly apiUrl = environment.apiUrl;

  private tokenSignal = signal<string | null>(localStorage.getItem(this.tokenKey));
  readonly session = computed<JwtSession | null>(() => this.decodeToken(this.tokenSignal()));
  readonly isLoggedIn = computed(() => !!this.tokenSignal() && !this.isTokenExpired());

  constructor(private http: HttpClient, private router: Router) {}

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, request).pipe(
      tap(response => this.setToken(response.jwt))
    );
  }

  register(request: RegisterRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${this.apiUrl}/auth/register`, request);
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.tokenSignal.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this.tokenSignal();
  }

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
    this.tokenSignal.set(token);
  }

  hasPermission(permission: string): boolean {
    const session = this.session();
    return !!session?.permissions?.includes(permission);
  }

  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some(permission => this.hasPermission(permission));
  }

  hasRole(role: string): boolean {
    return this.session()?.role === role;
  }

  private isTokenExpired(): boolean {
    const exp = this.session()?.exp;
    if (!exp) return false;
    return Date.now() >= exp * 1000;
  }

  private decodeToken(token: string | null): JwtSession | null {
    if (!token) return null;
    try {
      const payload = token.split('.')[1];
      let normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
      normalized = normalized.padEnd(normalized.length + (4 - normalized.length % 4) % 4, '=');
      const json = decodeURIComponent(atob(normalized).split('').map(char =>
        '%' + ('00' + char.charCodeAt(0).toString(16)).slice(-2)
      ).join(''));
      return JSON.parse(json) as JwtSession;
    } catch {
      return null;
    }
  }
}
