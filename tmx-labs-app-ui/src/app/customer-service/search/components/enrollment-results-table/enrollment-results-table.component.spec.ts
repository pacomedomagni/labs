import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnrollmentResultsTableComponent } from './enrollment-results-table.component';

describe('EnrollmentResultsTableComponent', () => {
  let component: EnrollmentResultsTableComponent;
  let fixture: ComponentFixture<EnrollmentResultsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnrollmentResultsTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnrollmentResultsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
