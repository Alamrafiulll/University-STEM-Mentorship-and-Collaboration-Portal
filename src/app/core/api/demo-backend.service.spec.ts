import { describe, expect, it } from 'vitest';
import { DemoBackend } from './demo-backend.service';

describe('DemoBackend', () => {
  it('returns the preserved mentor and project catalog', () => {
    const backend = new DemoBackend();
    const catalog = backend.catalog();

    expect(catalog.mentors).toHaveLength(3);
    expect(catalog.projects).toHaveLength(3);
    expect(catalog.projects[0].available).toBe(4);
  });

  it('prevents duplicate active mentor requests', () => {
    const backend = new DemoBackend();
    const result = backend.sendMentorRequest({
      mentor_id: '1',
      interest: 'Artificial Intelligence',
      message: 'Please mentor me.'
    });

    expect(result).toContain('already connected or reviewing');
  });

  it('moves an approved mentor from pending to approved', () => {
    const backend = new DemoBackend();

    expect(backend.adminData().pending.some((mentor) => mentor.id === 8)).toBe(true);
    expect(backend.approveMentor(8)).toContain('approved');
    expect(backend.adminData().approved.some((mentor) => mentor.id === 8)).toBe(true);
  });
});
