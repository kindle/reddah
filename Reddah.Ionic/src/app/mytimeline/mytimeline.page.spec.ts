import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyTimeLinePage } from './mytimeline.page';

describe('TimeLinePage', () => {
  let component: MyTimeLinePage;
  let fixture: ComponentFixture<MyTimeLinePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MyTimeLinePage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyTimeLinePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
