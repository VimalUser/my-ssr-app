import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DesignSelectionComponent } from './design-selection-component';

describe('DesignSelectionComponent', () => {
  let component: DesignSelectionComponent;
  let fixture: ComponentFixture<DesignSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DesignSelectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DesignSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
