import { inject, Injectable } from '@angular/core';
import { Observable, switchMap, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { DeviceService } from 'src/app/shared/services/api/device/device.service';
import { DialogService } from 'src/app/shared/services/dialogs/primary/dialog.service';
import { NotificationBannerService } from 'src/app/shared/notifications/notification-banner/notification-banner.service';
import { EnrollmentDetailService } from '../enrollment-details/enrollment-details.service';
import { HelpText } from 'src/app/shared/help/metadata';
import { ParticipantDetailsFormattingService } from '../participant-details-formatting/participant-details-formatting.service';
import {
    AccountDeviceSummary,
    AccountVehicleSummary,
} from 'src/app/shared/data/participant/resources';
import {
    DeviceReturnReasonCode,
    DeviceReturnReasonCodeValue,
    DeviceStatus,
    DeviceStatusValue,
} from 'src/app/shared/data/device/enums';
import { formatLinesAsStackedHtml } from 'src/app/shared/utils/string-utils';

@Injectable({
    providedIn: 'root',
})
export class MarkDefectiveService {
    private dialogService = inject(DialogService);
    private deviceService = inject(DeviceService);
    private notificationService = inject(NotificationBannerService);
    private enrollmentDetailService = inject(EnrollmentDetailService);
    private participantDetailsFormattingService = inject(ParticipantDetailsFormattingService);

    openMarkDefectiveDialog(
        deviceSerialNumber: string,
        participantSeqId: number,
        vehicle: AccountVehicleSummary,
        nickName: string,
    ): Observable<boolean> {
        const participantDisplay = this.participantDetailsFormattingService.formatVehicleNickname(
            vehicle,
            nickName,
        );
        return this.dialogService
            .openConfirmationDialog({
                title: 'Mark Defective',
                subtitle: this.buildSubtitle(participantDisplay, deviceSerialNumber),
                helpKey: HelpText.DeviceMarkDefective,
                message: `Are you sure you want to mark this device as defective?`,
                confirmText: 'YES',
            })
            .afterClosed()
            .pipe(
                switchMap((confirmed) => {
                    if (confirmed) {
                        return this.markDeviceDefective(deviceSerialNumber, participantSeqId);
                    }
                    return of(false);
                }),
            );
    }

    private markDeviceDefective(
        deviceSerialNumber: string,
        participantSeqId: number,
    ): Observable<boolean> {
        return this.deviceService.markDefective(deviceSerialNumber, participantSeqId).pipe(
            map(() => {
                // Handle success response
                this.updateParticipantDeviceStatusAndReason(
                    participantSeqId,
                    DeviceStatus.Defective,
                    DeviceReturnReasonCode.DeviceProblem,
                );
                this.notificationService.success('Mark Defective Successful');

                return true;
            }),
            catchError(() => {
                return of(false);
            }),
        );
    }

    private updateParticipantDeviceStatusAndReason(
        participantSeqId: number,
        status: DeviceStatus,
        returnReason: DeviceReturnReasonCode,
    ): void {
        const updates: Partial<AccountDeviceSummary> = {
            deviceStatusCode: DeviceStatusValue.get(status),
            deviceReturnReasonCode: DeviceReturnReasonCodeValue.get(returnReason),
        };
        this.enrollmentDetailService.updateParticipantDevice(participantSeqId, updates);
    }

    private buildSubtitle(participantDisplay: string, deviceSerialNumber: string | null): string {
        return formatLinesAsStackedHtml([participantDisplay, deviceSerialNumber]);
    }
}
