import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PostviewerPage } from './postviewer.page';

describe('PostviewerPage', () => {
  let component: PostviewerPage;
  let fixture: ComponentFixture<PostviewerPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PostviewerPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostviewerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
