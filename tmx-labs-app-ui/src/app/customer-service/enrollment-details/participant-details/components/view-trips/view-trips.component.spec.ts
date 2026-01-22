import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ViewTripsComponent } from './view-trips.component';
import { TABLE_DIALOG_CONTENT, TABLE_DIALOG_PAGINATOR } from 'src/app/shared/components/dialogs/table-dialog/table-dialog.component';
import { TripsService } from 'src/app/shared/services/api/trips/trips.service';

describe('ViewTripsComponent', () => {
  let component: ViewTripsComponent;
  let fixture: ComponentFixture<ViewTripsComponent>;
  let mockTripsService: jasmine.SpyObj<TripsService>;

  beforeEach(async () => {
    mockTripsService = jasmine.createSpyObj('TripsService', ['getTrips']);
    mockTripsService.getTrips.and.returnValue(of({ tripDays: [] }));

    const mockDialogData = {
      participantSeqId: 123,
      vehicleDisplay: 'Test Vehicle',
      paginator: null
    };

    await TestBed.configureTestingModule({
      imports: [ViewTripsComponent],
      providers: [
        { provide: TABLE_DIALOG_CONTENT, useValue: mockDialogData },
        { provide: TABLE_DIALOG_PAGINATOR, useValue: null },
        { provide: TripsService, useValue: mockTripsService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewTripsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
