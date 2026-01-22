import { inject, Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { DialogService } from 'src/app/shared/services/dialogs/primary/dialog.service';
import { NotificationBannerService } from 'src/app/shared/notifications/notification-banner/notification-banner.service';
import { ParticipantService } from 'src/app/shared/services/api/participant/participant.service';
import { EnrollmentDetailService } from '../enrollment-details/enrollment-details.service';
import { ParticipantDetailsFormattingService } from '../participant-details-formatting/participant-details-formatting.service';
import { AccountVehicleSummary } from 'src/app/shared/data/participant/resources';
import { HelpText } from 'src/app/shared/help/metadata';
import { ResourceMessageService } from 'src/app/shared/services/resources/resource-message.service';
import { MessageCode } from 'src/app/shared/data/application/enums';
import { formatLinesAsStackedHtml } from 'src/app/shared/utils/string-utils';

@Injectable({
    providedIn: 'root',
})
export class OptOutService {
    private readonly dialogService = inject(DialogService);
    private readonly participantService = inject(ParticipantService);
    private readonly notificationService = inject(NotificationBannerService);
    private readonly enrollmentDetailService = inject(EnrollmentDetailService);
    private readonly participantDetailsFormattingService = inject(ParticipantDetailsFormattingService);
    private readonly resourceMessageService = inject(ResourceMessageService);

    openOptOutDialog(
        participantSeqId: number,
        deviceSerialNumber: string | null,
        vehicle: AccountVehicleSummary,
        nickname: string | null | undefined,
    ): Observable<boolean> {
        const participantDisplay = this.participantDetailsFormattingService.formatVehicleNickname(vehicle, nickname);

        return this.dialogService
            .openConfirmationDialog({
                title: 'Opt Out',
                subtitle: this.buildSubtitle(participantDisplay, deviceSerialNumber),
                message: 'Are you sure you want to opt out this participant?',
                confirmText: 'YES',
                helpKey: HelpText.OptOutReasonForPlugin,
            })
            .afterClosed()
            .pipe(
                switchMap((confirmed) => {
                    if (confirmed) {
                        return this.optOutParticipant(participantSeqId, deviceSerialNumber);
                    }
                    return of(false);
                }),
            );
    }

    private optOutParticipant(participantSeqId: number, deviceSerialNumber: string | null): Observable<boolean> {
        return this.participantService
            .optOut({
                participantSequenceId: participantSeqId,
                deviceSerialNumber: deviceSerialNumber ?? undefined,
            })
            .pipe(
                map((response) => {
                    const errorCode = this.resourceMessageService.getString(response?.messages, MessageCode.ErrorCode);
                    if (errorCode) {
                        const detail = this.resourceMessageService.getString(response?.messages, MessageCode.ErrorDetails);
                        this.notificationService.error(detail ?? 'Opt Out Failed');
                        return false;
                    }

                    const statusMessage = this.resourceMessageService.getString(response?.messages, MessageCode.StatusDescription);
                    this.notificationService.success(statusMessage ?? 'Opt Out Successful');

                    this.enrollmentDetailService.refreshEnrollmentDetails();
                    return true;
                }),
                catchError((error) => {
                    this.notificationService.error('Opt Out Failed');
                    console.error('Participant opt out error:', error);
                    return of(false);
                }),
            );
    }

    private buildSubtitle(participantDisplay: string, deviceSerialNumber: string | null): string {
        return formatLinesAsStackedHtml([participantDisplay, deviceSerialNumber]);
    }

}
