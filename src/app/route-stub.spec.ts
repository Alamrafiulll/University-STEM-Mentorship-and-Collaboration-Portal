import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { RouteStub } from './route-stub';

describe('RouteStub', () => {
  it('creates the router outlet marker used by the preserved shell', async () => {
    await TestBed.configureTestingModule({ imports: [RouteStub] }).compileComponents();

    const fixture = TestBed.createComponent(RouteStub);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
