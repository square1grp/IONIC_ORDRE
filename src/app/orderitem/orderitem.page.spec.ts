import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderitemPage } from './orderitem.page';

describe('OrderitemPage', () => {
  let component: OrderitemPage;
  let fixture: ComponentFixture<OrderitemPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrderitemPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderitemPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
