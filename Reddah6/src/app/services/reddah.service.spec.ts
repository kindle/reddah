import { TestBed } from '@angular/core/testing';

import { ReddahService } from './reddah.service';

describe('ReddahService', () => {
  let service: ReddahService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReddahService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
