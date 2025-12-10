import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Approveorrejectalbum } from './approveorrejectalbum';

describe('Approveorrejectalbum', () => {
  let component: Approveorrejectalbum;
  let fixture: ComponentFixture<Approveorrejectalbum>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Approveorrejectalbum]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Approveorrejectalbum);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
