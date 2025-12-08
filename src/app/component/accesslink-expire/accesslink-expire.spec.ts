import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccesslinkExpire } from './accesslink-expire';

describe('AccesslinkExpire', () => {
  let component: AccesslinkExpire;
  let fixture: ComponentFixture<AccesslinkExpire>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccesslinkExpire]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccesslinkExpire);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
