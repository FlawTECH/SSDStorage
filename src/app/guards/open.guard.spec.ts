import { TestBed, async, inject } from '@angular/core/testing';

import { OpenGuard } from './open.guard';

describe('OpenGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OpenGuard]
    });
  });

  it('should ...', inject([OpenGuard], (guard: OpenGuard) => {
    expect(guard).toBeTruthy();
  }));
});
