import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { ViewTripsSubtitleComponent } from './view-trips-subtitle.component';
import { TABLE_DIALOG_CONTENT } from 'src/app/shared/components/dialogs/table-dialog/table-dialog.component';

describe('ViewTripsSubtitleComponent', () => {
  let component: ViewTripsSubtitleComponent;
  let fixture: ComponentFixture<ViewTripsSubtitleComponent>;

  beforeEach(async () => {
    const mockDialogData = {
      vehicleDisplay: '2020 Toyota Camry',
      participantSeqId: 123,
      weekdayTripSummaryVisible: signal(false)
    };

    await TestBed.configureTestingModule({
      imports: [ViewTripsSubtitleComponent],
      providers: [
        { provide: TABLE_DIALOG_CONTENT, useValue: mockDialogData }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewTripsSubtitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
