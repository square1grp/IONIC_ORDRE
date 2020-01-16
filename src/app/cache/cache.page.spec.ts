import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CachePage } from './cache.page';

describe('CachePage', () => {
  let component: CachePage;
  let fixture: ComponentFixture<CachePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CachePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CachePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
