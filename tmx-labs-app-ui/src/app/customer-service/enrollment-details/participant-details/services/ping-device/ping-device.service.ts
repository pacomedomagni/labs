import { inject, Injectable } from '@angular/core';
import { Observable, switchMap, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { DeviceService } from 'src/app/shared/services/api/device/device.service';
import { DialogService } from 'src/app/shared/services/dialogs/primary/dialog.service';
import { NotificationBannerService } from 'src/app/shared/notifications/notification-banner/notification-banner.service';
import { ParticipantDetailsFormattingService } from '../participant-details-formatting/participant-details-formatting.service';
import { AccountVehicleSummary } from 'src/app/shared/data/participant/resources';
import { MessageCode } from 'src/app/shared/data/application/enums';
import { ResourceMessageService } from 'src/app/shared/services/resources/resource-message.service';
import { formatLinesAsStackedHtml } from 'src/app/shared/utils/string-utils';

@Injectable({
    providedIn: 'root',
})
export class PingDeviceService {
    private dialogService = inject(DialogService);
    private deviceService = inject(DeviceService);
    private notificationService = inject(NotificationBannerService);
    private resourceMessageService = inject(ResourceMessageService);
    
    private participantDetailsFormattingService = inject(ParticipantDetailsFormattingService);

    openPingDeviceDialog(
        deviceSerialNumber: string,
        vehicle: AccountVehicleSummary,
        nickName: string
    ): Observable<boolean> {
        const participantDisplay = this.participantDetailsFormattingService.formatVehicleNickname(vehicle, nickName);
        return this.dialogService
            .openConfirmationDialog({
                title: 'Ping Device',
                subtitle: this.buildSubtitle(participantDisplay, deviceSerialNumber),
                message: `Are you sure you want to ping this device?`,
                confirmText: 'YES',
            })
            .afterClosed()
            .pipe(
                switchMap((confirmed) => {
                    if (confirmed) {
                        return this.pingDevice(deviceSerialNumber);
                    }
                    return of(false);
                }),
            );
    }

    private pingDevice(
        deviceSerialNumber: string,
    ): Observable<boolean> {
        return this.deviceService.pingDevice(deviceSerialNumber).pipe(
            map(response => {
                const statusMessage = this.resourceMessageService.getString(response?.messages, MessageCode.StatusDescription);
                if (statusMessage) {
                    this.notificationService.success(statusMessage);
                }                
                const errorMessage = this.resourceMessageService.getString(response?.messages, MessageCode.Error);
                if (errorMessage) {
                    this.notificationService.error(errorMessage);
                }                
                return true;
            })
        );
    }

    private buildSubtitle(participantDisplay: string, deviceSerialNumber: string | null): string {
        return formatLinesAsStackedHtml([participantDisplay, deviceSerialNumber]);
    }
}
