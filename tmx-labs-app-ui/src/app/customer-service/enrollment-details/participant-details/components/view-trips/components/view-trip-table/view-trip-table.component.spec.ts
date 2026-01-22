import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewTripTableComponent } from './view-trip-table.component';

describe('ViewTripTableComponent', () => {
  let component: ViewTripTableComponent;
  let fixture: ComponentFixture<ViewTripTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewTripTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewTripTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
