import { TestBed } from '@angular/core/testing';

import { Roadmap } from './roadmap';

describe('Roadmap', () => {
  let service: Roadmap;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Roadmap);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
