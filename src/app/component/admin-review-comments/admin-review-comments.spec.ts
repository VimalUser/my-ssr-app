import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminReviewComments } from './admin-review-comments';

describe('AdminReviewComments', () => {
  let component: AdminReviewComments;
  let fixture: ComponentFixture<AdminReviewComments>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminReviewComments]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminReviewComments);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
