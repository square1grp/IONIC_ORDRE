import { TestBed } from '@angular/core/testing';

import { Values } from './values.service';

describe('Values', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: Values = TestBed.get(Values);
    expect(service).toBeTruthy();
  });
});
