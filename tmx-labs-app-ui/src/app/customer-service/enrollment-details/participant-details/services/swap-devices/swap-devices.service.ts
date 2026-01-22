import { inject, Injectable } from '@angular/core';
import { CUI_DIALOG_WIDTH } from '@pgr-cla/core-ui-components';
import { from, Observable, of } from 'rxjs';
import { catchError, map, switchMap, take, tap } from 'rxjs/operators';
import { DialogService } from 'src/app/shared/services/dialogs/primary/dialog.service';
import { NotificationBannerService } from 'src/app/shared/notifications/notification-banner/notification-banner.service';
import { EnrollmentDetailService } from '../enrollment-details/enrollment-details.service';
import { ParticipantDetailsFormattingService } from '../participant-details-formatting/participant-details-formatting.service';
import { formatLinesAsStackedHtml, toUpper } from 'src/app/shared/utils/string-utils';
import {
    AccountSummary,
    AccountVehicleSummary,
    AccountDeviceSummary,
    AccountParticipantSummary,
} from 'src/app/shared/data/participant/resources';
import { DeviceService } from 'src/app/shared/services/api/device/device.service';
import { HelpText } from 'src/app/shared/help/metadata';
import { DeviceExperience, DeviceExperienceValue, DeviceStatus, DeviceStatusValue } from 'src/app/shared/data/device/enums';
import { Resource } from 'src/app/shared/data/application/resources';
import { ResourceMessageService } from 'src/app/shared/services/resources/resource-message.service';
import { MessageCode } from 'src/app/shared/data/application/enums';

export interface SwapDevicesDialogContext {
    participantSeqId: number;
    deviceSerialNumber: string;
    vehicle: AccountVehicleSummary;
    nickname: string | null | undefined;
}

export interface SwapDevicesCandidate {
    participantSeqId: number;
    displayName: string;
    deviceSerialNumber: string;
}

export interface SwapDevicesFormModel {
    destParticipantSeqId: number | null;
}

export interface SwapDevicesDialogData {
    candidates: SwapDevicesCandidate[];
}

interface SwapDevicesOutcome {
    success: boolean;
    successMessage?: string;
    errorMessage?: string;
}

@Injectable({ providedIn: 'root' })
export class SwapDevicesService {
    private readonly dialogService = inject(DialogService);
    private readonly notificationService = inject(NotificationBannerService);
    private readonly enrollmentDetailService = inject(EnrollmentDetailService);
    private readonly participantDetailsFormattingService = inject(ParticipantDetailsFormattingService);
    private readonly deviceService = inject(DeviceService);
    private readonly resourceMessageService = inject(ResourceMessageService);

    openSwapDevicesDialog(context: SwapDevicesDialogContext): Observable<boolean> {
        const candidates = this.getEligibleSwapCandidates(context.participantSeqId);
        const subtitle = this.buildSubtitle(context);

        return from(import('../../components/swap-devices/swap-devices.component')).pipe(
            switchMap((module) => {
                const dialogRef = this.dialogService.openFormDialog<typeof module.SwapDevicesComponent, SwapDevicesFormModel>({
                    title: 'Swap Devices',
                    subtitle,
                    component: module.SwapDevicesComponent,
                    componentData: this.buildDialogData(candidates),
                    formModel: { destParticipantSeqId: null } satisfies SwapDevicesFormModel,
                    width: CUI_DIALOG_WIDTH.SMALL,
                    helpKey: HelpText.DeviceSwap,
                    confirmText: 'OK',
                    cancelText: 'CANCEL',
                });

                if (!candidates.length) {
                    setTimeout(() => this.openUnableToSwapDialog(subtitle));
                }

                return dialogRef.afterClosed().pipe(
                    take(1),
                    switchMap((result: SwapDevicesFormModel | undefined | null) => {
                        const destinationSeqId = result?.destParticipantSeqId ?? null;
                        if (!destinationSeqId) {
                            return of(false);
                        }

                        return this.swapDevices(context.participantSeqId, destinationSeqId);
                    }),
                );
            }),
            catchError((error) => {
                console.error('Error opening swap devices dialog:', error);
                return of(false);
            }),
        );
    }

    getEligibleSwapCandidates(sourceParticipantSeqId: number): SwapDevicesCandidate[] {
        return this.buildCandidates(sourceParticipantSeqId);
    }

    hasEligibleSwapCandidates(sourceParticipantSeqId: number): boolean {
        return this.getEligibleSwapCandidates(sourceParticipantSeqId).length > 0;
    }

    private buildDialogData(candidates: SwapDevicesCandidate[]): SwapDevicesDialogData {
        return {
            candidates: [...candidates],
        };
    }

    private buildCandidates(sourceParticipantSeqId: number): SwapDevicesCandidate[] {
        const details = this.enrollmentDetailService.details();
        const accounts = details?.accounts ?? [];

        const mapped = accounts
            .map((account) => this.mapAccountToCandidate(account, sourceParticipantSeqId))
            .filter((candidate): candidate is SwapDevicesCandidate => candidate !== null);

        return mapped.sort((a, b) => a.displayName.localeCompare(b.displayName));
    }

    private mapAccountToCandidate(
        account: AccountSummary,
        sourceParticipantSeqId: number,
    ): SwapDevicesCandidate | null {
        const participant = account.participant ?? {};
        const device = account.device ?? {};
        const driver = account.driver ?? {};
        const vehicle = account.vehicle ?? {};

        const participantSeqId = participant.participantSeqID ?? null;
        if (!participantSeqId || participantSeqId === sourceParticipantSeqId) {
            return null;
        }

        if (!this.canParticipantSwapDevice(participant, device)) {
            return null;
        }

        const displayName = this.participantDetailsFormattingService.formatVehicleNickname(vehicle, driver.nickname);
        const fallbackName = this.participantDetailsFormattingService.formatVehicleYMM(vehicle);
        const resolvedName = displayName ?? fallbackName;
        if (!resolvedName) {
            return null;
        }

        const serial = toUpper(device.deviceSerialNumber);
        if (!serial) {
            return null;
        }

        return {
            participantSeqId,
            displayName: resolvedName,
            deviceSerialNumber: serial,
        };
    }

    private canParticipantSwapDevice(
        participant: AccountParticipantSummary,
        device: AccountDeviceSummary,
    ): boolean {
        const isEnrolled = participant.participantStatusCode === 1;
        const isPlugInDevice =
            device.deviceExperienceTypeCode === DeviceExperienceValue.get(DeviceExperience.Device);
        const isAssigned = device.deviceStatusCode === DeviceStatusValue.get(DeviceStatus.Assigned);
        const hasSerial = toUpper(device.deviceSerialNumber) !== null;
        const deviceSeqId = device.deviceSeqID ?? participant.deviceSeqID ?? null;
        const hasNotBeenReturned = device.deviceReceivedDateTime == null;
        const hasNotBeenAbandoned = device.deviceAbandonedDateTime == null;

        return (
            isEnrolled &&
            isPlugInDevice &&
            isAssigned &&
            hasSerial &&
            deviceSeqId !== null &&
            hasNotBeenReturned &&
            hasNotBeenAbandoned
        );
    }

    private buildSubtitle(context: SwapDevicesDialogContext): string {
        const primary = this.participantDetailsFormattingService.formatVehicleNickname(context.vehicle, context.nickname) ??
            this.participantDetailsFormattingService.formatVehicleYMM(context.vehicle);
        const upperPrimary = toUpper(primary ?? null);
        const upperSerial = toUpper(context.deviceSerialNumber);
        return formatLinesAsStackedHtml([upperPrimary, upperSerial]);
    }

    private openUnableToSwapDialog(subtitle: string): void {
        void import('../../components/swap-devices/swap-devices-unable.component').then((module) => {
            this.dialogService.openInformationDialog({
                title: 'Swap Devices',
                subtitle,
                component: module.SwapDevicesUnableComponent,
                helpKey: HelpText.DeviceSwap,
                confirmText: 'OK',
                hideCancelButton: true,
            });
        }).catch((error) => {
            console.error('Error opening swap devices unable dialog:', error);
        });
    }

    private swapDevices(sourceParticipantSeqId: number, destinationParticipantSeqId: number): Observable<boolean> {
        return this.deviceService.swapDevices(sourceParticipantSeqId, destinationParticipantSeqId).pipe(
            map((response) => this.evaluateSwapResponse(response)),
            tap((outcome) => {
                if (!outcome.success) {
                    this.notificationService.error(
                        outcome.errorMessage ?? 'Swap Devices Failed',
                    );
                    console.error('Swap devices response indicated failure:', outcome.errorMessage);
                    return;
                }

                this.notificationService.success(
                    outcome.successMessage ?? 'Swap Devices Successful',
                );
                this.enrollmentDetailService.refreshEnrollmentDetails();
            }),
            map((outcome) => outcome.success),
            catchError((error) => {
                this.notificationService.error('Swap Devices Failed');
                console.error('Swap devices error:', error);
                return of(false);
            }),
        );
    }

    private evaluateSwapResponse(response: Resource | null | undefined): SwapDevicesOutcome {
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
}
