import { inject, Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { DeviceService } from 'src/app/shared/services/api/device/device.service';
import { DialogService } from 'src/app/shared/services/dialogs/primary/dialog.service';
import { NotificationBannerService } from 'src/app/shared/notifications/notification-banner/notification-banner.service';
import { HelpText } from 'src/app/shared/help/metadata';
import { formatLinesAsStackedHtml, toUpper } from 'src/app/shared/utils/string-utils';
import { EnrollmentDetailService } from '../enrollment-details/enrollment-details.service';
import { ParticipantDetailsFormattingService } from '../participant-details-formatting/participant-details-formatting.service';
import { AccountDeviceSummary, AccountVehicleSummary } from 'src/app/shared/data/participant/resources';
import {
    DeviceLocation,
    DeviceLocationValue,
    DeviceReturnReasonCode,
    DeviceReturnReasonCodeValue,
    DeviceStatus,
    DeviceStatusValue,
} from 'src/app/shared/data/device/enums';

@Injectable({
    providedIn: 'root',
})
export class MarkAbandonedService {
    private dialogService = inject(DialogService);
    private deviceService = inject(DeviceService);
    private notificationService = inject(NotificationBannerService);
    private enrollmentDetailService = inject(EnrollmentDetailService);
    private participantDetailsFormattingService = inject(ParticipantDetailsFormattingService);

    openMarkAbandonedDialog(
        deviceSerialNumber: string,
        participantSeqId: number,
        vehicle: AccountVehicleSummary,
        nickName: string | null | undefined,
    ): Observable<boolean> {
        const subtitle = this.buildSubtitle(deviceSerialNumber, vehicle, nickName);
        return this.dialogService
            .openConfirmationDialog({
                title: 'Mark Abandoned',
                subtitle,
                helpKey: HelpText.DeviceMarkAbandoned,
                message: 'Are you sure you want to mark this device as abandoned?',
                confirmText: 'YES',
                cancelText: 'CANCEL',
            })
            .afterClosed()
            .pipe(
                switchMap((confirmed) => {
                    if (confirmed) {
                        return this.markDeviceAbandoned(deviceSerialNumber, participantSeqId);
                    }
                    return of(false);
                }),
            );
    }

    private markDeviceAbandoned(
        deviceSerialNumber: string,
        participantSeqId: number,
    ): Observable<boolean> {
        return this.deviceService.markAbandoned(deviceSerialNumber, participantSeqId).pipe(
            map(() => {
                this.updateParticipantDeviceStatus(participantSeqId);
                this.notificationService.success('Mark Abandoned Successful');
                return true;
            }),
            catchError((error) => {
                this.notificationService.error('Mark Abandoned Failed');
                console.error('Mark abandoned error:', error);
                return of(false);
            }),
        );
    }

    private updateParticipantDeviceStatus(participantSeqId: number): void {
        const abandonedTimestamp = new Date().toISOString();
        const updates: Partial<AccountDeviceSummary> = {
            deviceStatusCode: DeviceStatusValue.get(DeviceStatus.Abandoned),
            deviceReturnReasonCode: DeviceReturnReasonCodeValue.get(DeviceReturnReasonCode.Abandoned),
            deviceAbandonedDateTime: abandonedTimestamp,
            deviceLocationCode: DeviceLocationValue.get(DeviceLocation.Unknown),
        };
        this.enrollmentDetailService.updateParticipantDevice(participantSeqId, updates);
    }

    private buildSubtitle(
        deviceSerialNumber: string,
        vehicle: AccountVehicleSummary,
        nickName: string | null | undefined,
    ): string {
        const lines = this.generateSubtitleLines(deviceSerialNumber, vehicle, nickName);
        return formatLinesAsStackedHtml(lines);
    }

    private generateSubtitleLines(
        deviceSerialNumber: string,
        vehicle: AccountVehicleSummary,
        nickName: string | null | undefined,
    ): string[] {
        const lines: string[] = [];

        const participantLine = toUpper(
            this.participantDetailsFormattingService.formatVehicleNickname(vehicle, nickName),
        );
        if (participantLine) {
            lines.push(participantLine);
        } else {
            const nicknameLine = toUpper(nickName);
            if (nicknameLine) {
                lines.push(nicknameLine);
            } else {
                const vehicleLine = toUpper(this.participantDetailsFormattingService.formatVehicleYMM(vehicle));
                if (vehicleLine) {
                    lines.push(vehicleLine);
                }
            }
        }

        const serialLine = toUpper(deviceSerialNumber);
        if (serialLine) {
            lines.push(serialLine);
        }

        return lines;
    }
}
