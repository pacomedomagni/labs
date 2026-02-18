import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EnrollmentResultsComponent } from './enrollment-results.component';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

describe('EnrollmentResultsComponent', () => {
  let component: EnrollmentResultsComponent;
  let fixture: ComponentFixture<EnrollmentResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnrollmentResultsComponent],
      providers: [
        provideNoopAnimations()
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EnrollmentResultsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});
