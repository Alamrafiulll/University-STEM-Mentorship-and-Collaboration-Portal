export type UserRole = 'student' | 'mentor' | 'admin';

export interface AuthUser {
  id: number;
  actorId: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface StudentRegistrationRequest {
  name: string;
  email: string;
  password: string;
}

export interface MentorRegistrationRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: AuthUser;
}

export interface ApiError {
  message: string;
}
