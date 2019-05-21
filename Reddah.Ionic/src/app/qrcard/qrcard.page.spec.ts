import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QrcardPage } from './qrcard.page';

describe('QrcardPage', () => {
  let component: QrcardPage;
  let fixture: ComponentFixture<QrcardPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QrcardPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QrcardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
