import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminDownloadSelection } from './admin-download-selection';

describe('AdminDownloadSelection', () => {
  let component: AdminDownloadSelection;
  let fixture: ComponentFixture<AdminDownloadSelection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminDownloadSelection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminDownloadSelection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
