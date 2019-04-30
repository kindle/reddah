import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TsViewerPage } from './tsviewer.page';

describe('TsViewerPage', () => {
  let component: TsViewerPage;
  let fixture: ComponentFixture<TsViewerPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TsViewerPage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TsViewerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
