import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { environment } from '../../../environments/environment';
import { AuthenticationService } from './authentication.service';

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(AuthenticationService);
    http = TestBed.inject(HttpTestingController);
    sessionStorage.clear();
  });

  afterEach(() => http.verify());

  it('sends typed student credentials to the Flask login endpoint', () => {
    service.login('student', {
      identifier: 'STU001',
      password: 'student123'
    }).subscribe((response) => expect(response.user.role).toBe('student'));

    const request = http.expectOne(`${environment.apiBaseUrl}/auth/student/login`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body.identifier).toBe('STU001');
    request.flush({
      message: 'Student login successful.',
      token: 'demo-token',
      user: {
        id: 1,
        actorId: 'STU001',
        name: 'Demo Student',
        email: 'demo.student@mmu.edu.my',
        role: 'student'
      }
    });

    expect(sessionStorage.getItem('mmu-stem-demo-token')).toBe('demo-token');
  });
});
