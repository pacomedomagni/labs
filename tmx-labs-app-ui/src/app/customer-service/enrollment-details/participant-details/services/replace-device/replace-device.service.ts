import { inject, Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { DeviceService } from 'src/app/shared/services/api/device/device.service';
import { DialogService } from 'src/app/shared/services/dialogs/primary/dialog.service';
import { HelpText } from 'src/app/shared/help/metadata';
import { NotificationBannerService } from 'src/app/shared/notifications/notification-banner/notification-banner.service';
import { EnrollmentDetailService } from '../enrollment-details/enrollment-details.service';
import { ParticipantDetailsFormattingService } from '../participant-details-formatting/participant-details-formatting.service';
import { AccountVehicleSummary } from 'src/app/shared/data/participant/resources';
import { formatLinesAsStackedHtml, toUpper } from 'src/app/shared/utils/string-utils';
import { ResourceMessageService } from 'src/app/shared/services/resources/resource-message.service';
import { MessageCode } from 'src/app/shared/data/application/enums';
import { Resource } from 'src/app/shared/data/application/resources';

export interface ReplaceDeviceDialogContext {
    participantSeqId: number;
    deviceSerialNumber: string;
    vehicle: AccountVehicleSummary;
    nickname: string | null | undefined;
}

interface ReplaceDeviceOutcome {
    success: boolean;
    successMessage?: string;
    errorMessage?: string;
}

@Injectable({
    providedIn: 'root',
})
export class ReplaceDeviceService {
    private readonly dialogService = inject(DialogService);
    private readonly deviceService = inject(DeviceService);
    private readonly notificationService = inject(NotificationBannerService);
    private readonly enrollmentDetailService = inject(EnrollmentDetailService);
    private readonly participantDetailsFormattingService = inject(ParticipantDetailsFormattingService);
    private readonly resourceMessageService = inject(ResourceMessageService);

    openReplaceDeviceDialog(context: ReplaceDeviceDialogContext): Observable<boolean> {
        const subtitle = this.buildSubtitle(context);
        return this.dialogService
            .openConfirmationDialog({
                title: 'Replace Device',
                subtitle,
                helpKey: HelpText.DeviceReplace,
                message: 'Are you sure you want to replace this device?',
                confirmText: 'YES',
                cancelText: 'CANCEL',
            })
            .afterClosed()
            .pipe(
                switchMap((confirmed) => {
                    if (!confirmed) {
                        return of(false);
                    }
                    return this.replaceDevice(context.participantSeqId);
                }),
            );
    }

    private replaceDevice(participantSeqId: number): Observable<boolean> {
        return this.deviceService.replaceDevice(participantSeqId).pipe(
            map((response) => this.evaluateReplaceResponse(response)),
            map((outcome) => {
                if (!outcome.success) {
                    this.notificationService.error(outcome.errorMessage ?? 'Replace Device Failed');
                    console.error('Replace device response indicated failure:', outcome.errorMessage);
                    return false;
                }

                this.notificationService.success(outcome.successMessage ?? 'Replace Device Successful');
                this.enrollmentDetailService.refreshEnrollmentDetails();
                return true;
            }),
            catchError((error) => {
                this.notificationService.error('Replace Device Failed');
                console.error('Replace device error:', error);
                return of(false);
            }),
        );
    }

    private evaluateReplaceResponse(response: Resource | null | undefined): ReplaceDeviceOutcome {
        const errorMessage = this.resourceMessageService.getFirstString(response?.messages, [
            MessageCode.ErrorDetails,
            MessageCode.Error,
            MessageCode.ErrorCode,
        ]);

        if (errorMessage) {
            return {
                success: false,
                errorMessage,
            };
        }

        const successMessage = this.resourceMessageService.getString(
            response?.messages,
            MessageCode.StatusDescription,
        );

        return {
            success: true,
            successMessage: successMessage ?? undefined,
        };
    }

    private buildSubtitle(context: ReplaceDeviceDialogContext): string {
        const lines = this.generateSubtitleLines(context);
        return formatLinesAsStackedHtml(lines);
    }

    private generateSubtitleLines(context: ReplaceDeviceDialogContext): string[] {
        const lines: string[] = [];

        const primaryDisplay = this.getPrimaryDisplay(context);
        const primaryLine = toUpper(primaryDisplay);
        if (primaryLine) {
            lines.push(primaryLine);
        }

        const serialLine = toUpper(context.deviceSerialNumber);
        if (serialLine) {
            lines.push(serialLine);
        }

        return lines;
    }

    private getPrimaryDisplay(context: ReplaceDeviceDialogContext): string | null {
        const nicknameDisplay = this.participantDetailsFormattingService.formatVehicleNickname(
            context.vehicle,
            context.nickname,
        );
        if (nicknameDisplay?.trim()) {
            return nicknameDisplay;
        }
        return this.participantDetailsFormattingService.formatVehicleYMM(context.vehicle);
    }
}
