import { inject, Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { DialogService } from 'src/app/shared/services/dialogs/primary/dialog.service';
import { NotificationBannerService } from 'src/app/shared/notifications/notification-banner/notification-banner.service';
import { ParticipantService } from 'src/app/shared/services/api/participant/participant.service';
import { ParticipantDetailsFormattingService } from '../participant-details-formatting/participant-details-formatting.service';
import { HelpText } from 'src/app/shared/help/metadata';
import { ResourceMessageService } from 'src/app/shared/services/resources/resource-message.service';
import { MessageCode } from 'src/app/shared/data/application/enums';
import { formatLinesAsStackedHtml } from 'src/app/shared/utils/string-utils';
import { AccountVehicleSummary } from 'src/app/shared/data/participant/resources';
import { EnrollmentDetailService } from '../enrollment-details/enrollment-details.service';


@Injectable({
    providedIn: 'root',
})
export class DeleteParticipantService {
    private readonly dialogService = inject(DialogService);
    private readonly participantService = inject(ParticipantService);
    private readonly notificationService = inject(NotificationBannerService);
    private readonly participantDetailsFormattingService = inject(ParticipantDetailsFormattingService);
    private readonly resourceMessageService = inject(ResourceMessageService);
        private readonly participantSelectionService = inject(EnrollmentDetailService);

    openDeleteParticipantDialog(
        participantSeqId: number,
        deviceSerialNumber: string | null,
        vehicle: AccountVehicleSummary,
        nickname: string | null | undefined,
    ): Observable<boolean> {
        const participantDisplay = this.participantDetailsFormattingService.formatVehicleNickname(vehicle, nickname);

        return this.dialogService
            .openConfirmationDialog({
                title: 'Delete Vehicle',
                subtitle: this.buildSubtitle(participantDisplay, deviceSerialNumber),
                message: 'Are you sure you want to delete this vehicle from your customer profile?',
                confirmText: 'YES',
                cancelText: 'CANCEL',
                helpKey: HelpText.DeleteVehicle,
            })
            .afterClosed()
            .pipe(
                switchMap((confirmed) => {
                    if (confirmed) {
                        return this.deleteParticipant(participantSeqId);
                    }
                    return of(false);
                }),
            );
    }

    private deleteParticipant(participantSeqId: number): Observable<boolean> {
        return this.participantService.deleteVehicle({
                participantSeqId: participantSeqId,
                isActive: false
            })
            .pipe(
                map((response) => {
                    const errorCode = this.resourceMessageService.getString(response?.messages, MessageCode.ErrorCode);
                    if (errorCode) {
                        const detail = this.resourceMessageService.getString(response?.messages, MessageCode.ErrorDetails);
                        this.notificationService.error(detail ?? 'Delete Vehicle Failed');
                        return false;
                    }

                    const statusMessage = this.resourceMessageService.getString(response?.messages, MessageCode.StatusDescription);
                    this.participantSelectionService.refreshEnrollmentDetails();
                    this.notificationService.success(statusMessage ?? 'Vehicle deleted successfully');
                    return true;
                }),
                catchError((error) => {
                    this.notificationService.error('Delete Vehicle Failed');
                    console.error('Vehicle delete error:', error);
                    return of(false);
                }),
            );
    }

    private buildSubtitle(participantDisplay: string, deviceSerialNumber: string | null): string {
        return formatLinesAsStackedHtml([participantDisplay, deviceSerialNumber]);
    }
}