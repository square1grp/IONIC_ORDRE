import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { View360Page } from './view360.page';

describe('View360Page', () => {
  let component: View360Page;
  let fixture: ComponentFixture<View360Page>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ View360Page ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(View360Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
