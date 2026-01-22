import { inject, Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { DeviceService } from 'src/app/shared/services/api/device/device.service';
import { DialogService } from 'src/app/shared/services/dialogs/primary/dialog.service';
import { NotificationBannerService } from 'src/app/shared/notifications/notification-banner/notification-banner.service';
import { ResourceMessageService } from 'src/app/shared/services/resources/resource-message.service';
import { ParticipantDetailsFormattingService } from '../participant-details-formatting/participant-details-formatting.service';
import { AccountVehicleSummary } from 'src/app/shared/data/participant/resources';
import { HelpText } from 'src/app/shared/help/metadata';
import { MessageCode } from 'src/app/shared/data/application/enums';
import { formatLinesAsStackedHtml } from 'src/app/shared/utils/string-utils';

@Injectable({
    providedIn: 'root',
})
export class ResetDeviceService {
    private readonly dialogService = inject(DialogService);
    private readonly deviceService = inject(DeviceService);
    private readonly notificationService = inject(NotificationBannerService);
    private readonly resourceMessageService = inject(ResourceMessageService);
    private readonly participantDetailsFormattingService = inject(ParticipantDetailsFormattingService);

    openResetDeviceDialog(
        deviceSerialNumber: string,
        participantSequenceId: number,
        vehicle: AccountVehicleSummary,
        nickname: string | null | undefined,
    ): Observable<boolean> {
        const participantDisplay = this.participantDetailsFormattingService.formatVehicleNickname(vehicle, nickname);

        return this.dialogService
            .openConfirmationDialog({
                title: 'Reset Device',
                subtitle: this.buildSubtitle(participantDisplay, deviceSerialNumber),
                message: 'Are you sure you want to send a reset command to this device?',
                confirmText: 'YES',
                helpKey: HelpText.RemoteReset,
            })
            .afterClosed()
            .pipe(
                switchMap((confirmed) => {
                    if (confirmed) {
                        return this.resetDevice(deviceSerialNumber, participantSequenceId);
                    }
                    return of(false);
                }),
            );
    }

    private resetDevice(deviceSerialNumber: string, participantSequenceId: number): Observable<boolean> {
        return this.deviceService.resetDevice(deviceSerialNumber, participantSequenceId).pipe(
            map((response) => {
                const errorMessage = this.resourceMessageService.getString(response?.messages, MessageCode.ErrorCode);
                if (errorMessage) {
                    return false;
                }

                const statusMessage = this.resourceMessageService.getString(response?.messages, MessageCode.StatusDescription);
                if (statusMessage) {
                    this.notificationService.success(statusMessage);
                } else {
                    this.notificationService.success('Reset Device Sent');
                }

                return true;
            }),
            catchError((error) => {
                console.error('Reset device error:', error);
                return of(false);
            }),
        );
    }

    private buildSubtitle(participantDisplay: string, deviceSerialNumber: string | null): string {
        return formatLinesAsStackedHtml([participantDisplay, deviceSerialNumber]);
    }
}
