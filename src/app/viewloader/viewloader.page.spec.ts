import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewloaderPage } from './viewloader.page';

describe('ViewloaderPage', () => {
  let component: ViewloaderPage;
  let fixture: ComponentFixture<ViewloaderPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewloaderPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewloaderPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
