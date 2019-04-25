import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CropPhotoPage } from './crop-photo.page';

describe('CropPhotoPage', () => {
  let component: CropPhotoPage;
  let fixture: ComponentFixture<CropPhotoPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CropPhotoPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CropPhotoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
