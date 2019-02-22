import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LocalePage } from './locale.page';

describe('LocalePage', () => {
  let component: LocalePage;
  let fixture: ComponentFixture<LocalePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LocalePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LocalePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
