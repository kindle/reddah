import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentReplyPage } from './comment-reply.page';

describe('CommentReplyPage', () => {
  let component: CommentReplyPage;
  let fixture: ComponentFixture<CommentReplyPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CommentReplyPage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommentReplyPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
