import { inject, Injectable } from '@angular/core';
import { DialogService } from 'src/app/shared/services/dialogs/primary/dialog.service';
import { ViewTripsComponent } from '../../components/view-trips/view-trips.component';
import { HelpText } from 'src/app/shared/help/metadata';
import { ParticipantDetailsFormattingService } from '../participant-details-formatting/participant-details-formatting.service';
import { VehicleDetails } from 'src/app/shared/data/vehicle/resources';
import { ViewTripsSubtitleComponent } from '../../components/view-trips/components/view-trips-subtitle/view-trips-subtitle.component';
import { MatDialogRef } from '@angular/material/dialog';
import { TableDialogComponent } from 'src/app/shared/components/dialogs/table-dialog/table-dialog.component';
import { TripsService } from 'src/app/shared/services/api/trips/trips.service';
import { Observable, catchError, of, switchMap } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ViewTripsService {
    private readonly dialogService = inject(DialogService);
    private readonly formattingService = inject(ParticipantDetailsFormattingService);
    private readonly tripsService = inject(TripsService);
    
    openViewTripsDialog(participantSeqId: number | null, vehicle: VehicleDetails, nickname: string | null): Observable<MatDialogRef<TableDialogComponent>> {
        if (participantSeqId === null) {
            throw new Error('ViewTripsService: participantSeqId is null');
        }
        
        return this.tripsService.getTrips(participantSeqId).pipe(
            catchError(() => {
                return of({ tripDays: [] }); // Return object with expected structure
            }),
            switchMap((response) => {
                const trips = response.tripDays || [];
                const hasData = trips.length > 0;
                
                const dialogRef = this.dialogService.openTableDialog({
                    title: 'View Trips',
                    subtitleComponent: ViewTripsSubtitleComponent,
                    subtitleComponentData: {
                        vehicleDisplay: this.formattingService.formatVehicleNickname(vehicle, nickname),
                        weekdayTripSummaryVisible: hasData,
                        participantSeqId: participantSeqId
                    },
                    component: ViewTripsComponent,
                    helpKey: HelpText.ViewTrips,
                    confirmText: 'OK',
                    hideCancelButton: true,
                    width: hasData ? '1250px' : '800px',
                    maxWidth: '90vw',
                    height: hasData ? '825px' : '450px',
                    dialogContentClass: 'py-0',
                    componentData: {
                        trips: trips,
                        vehicleDisplay: this.formattingService.formatVehicleNickname(vehicle, nickname)
                    },
                });
                
                return of(dialogRef);
            })
        );
    }
}
