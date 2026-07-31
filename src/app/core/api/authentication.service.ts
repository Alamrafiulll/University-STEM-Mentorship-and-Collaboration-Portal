import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AuthResponse,
  LoginRequest,
  MentorRegistrationRequest,
  StudentRegistrationRequest,
  UserRole
} from '../models/authentication.model';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  private readonly http = inject(HttpClient);
  private readonly tokenKey = 'mmu-stem-demo-token';

  login(role: UserRole, request: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiBaseUrl}/auth/${role}/login`, request)
      .pipe(tap((response) => this.storeToken(response.token)));
  }

  registerStudent(request: StudentRegistrationRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiBaseUrl}/auth/student/register`, request)
      .pipe(tap((response) => this.storeToken(response.token)));
  }

  registerMentor(request: MentorRegistrationRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiBaseUrl}/auth/mentor/register`, request)
      .pipe(tap((response) => this.storeToken(response.token)));
  }

  private storeToken(token: string): void {
    sessionStorage.setItem(this.tokenKey, token);
  }
}
