import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeLinePage } from './timeline.page';

describe('TimeLinePage', () => {
  let component: TimeLinePage;
  let fixture: ComponentFixture<TimeLinePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TimeLinePage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeLinePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
