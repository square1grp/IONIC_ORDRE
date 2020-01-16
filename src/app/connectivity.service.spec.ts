import { TestBed } from '@angular/core/testing';

import { Connectivity } from './connectivity.service';

describe('ConnectivityService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: Connectivity = TestBed.get(Connectivity);
    expect(service).toBeTruthy();
  });
});
