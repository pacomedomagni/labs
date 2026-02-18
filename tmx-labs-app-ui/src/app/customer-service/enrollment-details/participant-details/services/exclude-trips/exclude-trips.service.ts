import { inject, Injectable } from '@angular/core';
import { DialogService } from 'src/app/shared/services/dialogs/primary/dialog.service';
import { ParticipantDetailsFormattingService } from '../participant-details-formatting/participant-details-formatting.service';
import { VehicleDetails } from 'src/app/shared/data/vehicle/resources';
import { HelpText } from 'src/app/shared/help/metadata';
import { formatLinesAsStackedHtml } from 'src/app/shared/utils/string-utils';
import { TableDialogComponent } from 'src/app/shared/components/dialogs/table-dialog/table-dialog.component';
import { MatDialogRef } from '@angular/material/dialog';
import { ExcludeTripsComponent } from '../../components/exclude-trips/exclude-trips.component';

@Injectable({ providedIn: 'root' })
export class ExcludeTripsService {
    private readonly dialogService = inject(DialogService);
    private readonly formattingService = inject(ParticipantDetailsFormattingService);

    openExcludeTripsDialog(participantSeqId: number, vehicle: VehicleDetails, nickname: string | null): MatDialogRef<TableDialogComponent> {
        if (!participantSeqId) {
            throw new Error('ExcludeTripsService: participantSeqId is required');
        }

        const resolvedVehicle = this.formattingService.formatVehicleNickname(vehicle, nickname) ??
            this.formattingService.formatVehicleYMM(vehicle) ??
            'Vehicle';
        const vehicleDisplay = resolvedVehicle.toUpperCase();

        const subtitle = formatLinesAsStackedHtml([vehicleDisplay]);

        return this.dialogService.openTableDialog({
            title: 'Exclude Trips',
            subtitle,
            component: ExcludeTripsComponent,
            componentData: {
                participantSeqId,
                vehicleDisplay,
            },
            confirmText: 'OK',
            cancelText: 'CANCEL',
            helpKey: HelpText.ExcludeTrips,
            hideCancelButton: false,
            width: '720px',
            maxWidth: '80vw',
            height: '520px',
            dialogContentClass: 'py-0',
        });
    }
}
