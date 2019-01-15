import { TestBed, async, inject } from '@angular/core/testing';

import { WaitingGuard } from './waiting.guard';

describe('WaitingGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WaitingGuard]
    });
  });

  it('should ...', inject([WaitingGuard], (guard: WaitingGuard) => {
    expect(guard).toBeTruthy();
  }));
});
