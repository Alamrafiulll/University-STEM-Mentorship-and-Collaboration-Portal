import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { App } from './app';
import { routes } from './app.routes';

describe('App reactive forms', () => {
  it('enforces the preserved required student credentials', async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)]
    }).compileComponents();

    const component = TestBed.createComponent(App).componentInstance;
    component.studentForm.setValue({ student_name: '', email: '', password: '' });

    expect(component.studentForm.invalid).toBe(true);
    expect(component.studentForm.controls.email.hasError('required')).toBe(true);
  });

  it('validates email format and mentor project team-size limits', async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)]
    }).compileComponents();

    const component = TestBed.createComponent(App).componentInstance;
    component.mentorLoginForm.controls.email.setValue('not-an-email');
    component.newProjectForm.controls.team_size.setValue(6);

    expect(component.mentorLoginForm.controls.email.hasError('email')).toBe(true);
    expect(component.newProjectForm.controls.team_size.hasError('max')).toBe(true);
  });
});
