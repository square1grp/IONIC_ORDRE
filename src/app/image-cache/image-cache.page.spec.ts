import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageCachePage } from './image-cache.page';

describe('ImageCachePage', () => {
  let component: ImageCachePage;
  let fixture: ComponentFixture<ImageCachePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImageCachePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageCachePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
