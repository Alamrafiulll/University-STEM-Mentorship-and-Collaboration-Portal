import { describe, expect, it } from 'vitest';
import { routes } from './app.routes';

describe('application routes', () => {
  it('preserves every public navigation destination and fallback', () => {
    expect(routes.map((route) => route.path)).toEqual([
      '',
      'home',
      'stem-portal',
      'student-portal',
      'mentor-portal',
      'chatbot',
      'admin-portal',
      '**'
    ]);
  });

  it('keeps the legacy student portal redirect', () => {
    const legacyRoute = routes.find((route) => route.path === 'student-portal');

    expect(legacyRoute?.redirectTo).toBe('stem-portal');
    expect(legacyRoute?.pathMatch).toBe('full');
  });
});
