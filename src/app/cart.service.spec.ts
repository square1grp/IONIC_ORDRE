import { TestBed } from '@angular/core/testing';

import { CartProvider } from './cart.service';

describe('CartProvider', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CartProvider = TestBed.get(CartProvider);
    expect(service).toBeTruthy();
  });
});
