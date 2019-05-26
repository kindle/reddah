import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentTimelineComponent } from './comment.component';

describe('CommentTimelineComponent', () => {
  let component: CommentTimelineComponent;
  let fixture: ComponentFixture<CommentTimelineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommentTimelineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommentTimelineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
