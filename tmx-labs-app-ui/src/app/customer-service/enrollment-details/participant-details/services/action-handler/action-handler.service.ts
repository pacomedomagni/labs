import { Injectable, inject, DestroyRef } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import { AccountVehicleSummary, AccountDeviceSummary } from 'src/app/shared/data/participant/resources';
import { MarkAbandonedService } from '../mark-abandoned/mark-abandoned.service';
import { MarkDefectiveService } from '../mark-defective/mark-defective.service';
import { OptOutService } from '../opt-out/opt-out.service';
import { ParticipantDetailsFormattingService } from '../participant-details-formatting/participant-details-formatting.service';
import { ParticipantNicknameService } from '../participant-nickname/participant-nickname.service';
import { EditVehicleService } from '../edit-vehicle/edit-vehicle.service';
import { PingDeviceService } from '../ping-device/ping-device.service';
import { ReplaceDeviceService } from '../replace-device/replace-device.service';
import { ResetDeviceService } from '../reset-device/reset-device.service';
import { SwapDevicesService } from '../swap-devices/swap-devices.service';
import { ActionHandlerContext } from '../../models/models';
import { NotificationBannerService } from 'src/app/shared/notifications/notification-banner/notification-banner.service';
import { MenuButtonGroupItem } from 'src/app/shared/components/menu-button-group/models/menu-button-group.models';
import { ParticipantActionItems } from '../participant-action-buttons/participant-action-buttons.service';
import { DeleteParticipantService } from '../delete-participant/delete-participant.service';
import { ViewTripsService } from '../view-trips/view-trips.service';
import { ManageAudioService } from '../manage-audio/manage-audio.service';
import { DeviceResourceExtenders } from 'src/app/shared/data/device/device-resource-extenders';
import { ExcludeTripsService } from '../exclude-trips/exclude-trips.service';

@Injectable({
    providedIn: 'root',
})
export class ActionHandlerService {
    private readonly destroyRef = inject(DestroyRef);
    private readonly markAbandonedService = inject(MarkAbandonedService);
    private readonly markDefectiveService = inject(MarkDefectiveService);
    private readonly participantDetailsFormattingService = inject(
        ParticipantDetailsFormattingService,
    );
    private readonly participantNicknameService = inject(ParticipantNicknameService);
    private readonly editVehicleService = inject(EditVehicleService);
    private readonly replaceDeviceService = inject(ReplaceDeviceService);
    private readonly swapDevicesService = inject(SwapDevicesService);
    private readonly pingDeviceService = inject(PingDeviceService);
    private readonly resetDeviceService = inject(ResetDeviceService);
    private readonly optOutService = inject(OptOutService);
    private readonly router = inject(Router);
    private readonly notificationService = inject(NotificationBannerService);
    private readonly deleteParticipantService = inject(DeleteParticipantService);
    private readonly viewTripsService = inject(ViewTripsService);
    private readonly manageAudioService = inject(ManageAudioService);
    private readonly excludeTripsService = inject(ExcludeTripsService);

    handleAction(action: MenuButtonGroupItem, context: ActionHandlerContext) {
        switch (action.id) {
            case ParticipantActionItems.EditNickname:
                this.openEditNicknameDialog(context);
                break;
            case ParticipantActionItems.EditVehicle:
                this.openEditVehicleDialog(context);
                break;
            case ParticipantActionItems.MarkAbandoned:
                this.openMarkAbandonedDialog(context);
                break;
            case ParticipantActionItems.MarkDefective:
                this.openMarkDefectiveDialog(context);
                break;
            case ParticipantActionItems.ReplaceDevice:
                this.openReplaceDeviceDialog(context);
                break;
            case ParticipantActionItems.SwapDevices:
                this.openSwapDevicesDialog(context);
                break;
            case ParticipantActionItems.PingDevice:
                this.openPingDeviceDialog(context);
                break;
            case ParticipantActionItems.ManageAudio:
                this.openManageAudioDialog(context);
                break;
            case ParticipantActionItems.ResetDevice:
                this.openResetDeviceDialog(context);
                break;
            case ParticipantActionItems.OptOutParticipant:
                this.openOptOutDialog(context);
                break;
            case ParticipantActionItems.FulfillDeviceOrder:
                this.openDeviceOrder(context);
                break;
            case ParticipantActionItems.DeleteParticipant:
                this.openDeleteParticipantDialog(context);
                break;   
            case ParticipantActionItems.ViewTrips:
                this.openViewTrips(context);
                break;
            case ParticipantActionItems.ExcludeTrips:
                this.openExcludeTrips(context);
                break;
            default:
                console.warn(`Unhandled action: ${action.id}`);
                break;
        }
    }

    private openMarkDefectiveDialog(context: ActionHandlerContext): void {
        this.markDefectiveService
            .openMarkDefectiveDialog(
                context.deviceResource().deviceSerialNumber!,
                context.participantResource().participantSeqID!,
                context.vehicleResource(),
                this.resolveNickname(context),
            )
            .subscribe({
                error: (error) => {
                    console.error('Error opening mark defective dialog:', error);
                },
            });
    }

    private openMarkAbandonedDialog(context: ActionHandlerContext): void {
        this.markAbandonedService
            .openMarkAbandonedDialog(
                context.deviceResource().deviceSerialNumber!,
                context.participantResource().participantSeqID!,
                context.vehicleResource(),
                this.resolveNickname(context),
            )
            .subscribe({
                error: (error) => {
                    console.error('Error opening mark abandoned dialog:', error);
                },
            });
    }

    private openEditNicknameDialog(context: ActionHandlerContext): void {
        const nicknameContext = context.nicknameContext();
        if (!nicknameContext.participantSeqId) {
            return;
        }

        this.participantNicknameService
            .openEditNicknameDialog(nicknameContext)
            .subscribe((updatedNickname) => {
                if (updatedNickname !== null && updatedNickname !== undefined) {
                    const formattedNickname =
                        this.participantDetailsFormattingService.formatVehicleNickname(
                            context.vehicleResource(),
                            updatedNickname,
                        );
                    context.onNicknameUpdate(formattedNickname);
                }
            });
    }

    private openEditVehicleDialog(context: ActionHandlerContext): void {
        const vehicleContext = context.vehicleContext();
        if (!vehicleContext.vehicle.year || !vehicleContext.vehicle.make) {
            return;
        }

        this.editVehicleService
            .openEditVehicleDialog(vehicleContext)
            .subscribe((updatedVehicle) => {
                if (updatedVehicle !== null && updatedVehicle !== undefined) {
                    const vehicleSummary: AccountVehicleSummary = {
                        year: updatedVehicle.year,
                        make: updatedVehicle.make,
                        model: updatedVehicle.model,
                        vehicleSeqID: updatedVehicle.vehicleSeqID,
                    };
                    context.onVehicleUpdate(vehicleSummary);
                }
            });
    }

    private openReplaceDeviceDialog(context: ActionHandlerContext): void {
        const participantSeqId = context.participantResource().participantSeqID ?? null;
        const deviceSerialNumber = context.deviceResource().deviceSerialNumber ?? null;

        if (!participantSeqId || !deviceSerialNumber) {
            return;
        }

        this.replaceDeviceService
            .openReplaceDeviceDialog({
                participantSeqId,
                deviceSerialNumber,
                vehicle: context.vehicleResource(),
                nickname: this.resolveNickname(context),
            })
            .subscribe({
                error: (error) => {
                    console.error('Error opening replace device dialog:', error);
                },
            });
    }

    private openSwapDevicesDialog(context: ActionHandlerContext): void {
        const participantSeqId = context.participantResource().participantSeqID ?? null;
        const deviceSerialNumber = context.deviceResource().deviceSerialNumber ?? null;

        if (!participantSeqId || !deviceSerialNumber) {
            return;
        }

        this.swapDevicesService
            .openSwapDevicesDialog({
                participantSeqId,
                deviceSerialNumber,
                vehicle: context.vehicleResource(),
                nickname: this.resolveNickname(context),
            })
            .subscribe({
                error: (error) => {
                    console.error('Error opening swap devices dialog:', error);
                },
            });
    }

    private openPingDeviceDialog(context: ActionHandlerContext): void {
        const deviceSerialNumber = context.deviceResource().deviceSerialNumber ?? null;

        if (!deviceSerialNumber) {
            return;
        }

        this.pingDeviceService
            .openPingDeviceDialog(
                deviceSerialNumber,
                context.vehicleResource(),
                this.resolveNickname(context),
            )
            .subscribe({
                error: (error) => {
                    console.error('Error opening ping device dialog:', error);
                },
            });
    }

    private openManageAudioDialog(context: ActionHandlerContext): void {
        const deviceSerialNumber = context.deviceResource().deviceSerialNumber ?? null;
        if (!deviceSerialNumber) {
            return;
        }

        const device = context.deviceResource();
        
        // Check if device has AWSIot feature
        const features = device.features ?? [];
        const isIoT = features.includes('AWSIot');

        const vehicle = context.vehicleResource();
        const nickname = this.resolveNickname(context);

        const currentAudioStatus = this.readDeviceAudioStatus(device);

        this.manageAudioService
            .openManageAudioDialog({ deviceSerialNumber, isIoT, vehicle, nickname, currentAudioStatus })
            .subscribe({
                error: (error) => {
                    console.error('Manage audio dialog error:', error);
                },
            });
    }

    private openResetDeviceDialog(context: ActionHandlerContext): void {
        const participantSeqId = context.participantResource().participantSeqID ?? null;
        const deviceSerialNumber = context.deviceResource().deviceSerialNumber ?? null;

        if (!participantSeqId || !deviceSerialNumber) {
            return;
        }

        this.resetDeviceService
            .openResetDeviceDialog(
                deviceSerialNumber,
                participantSeqId,
                context.vehicleResource(),
                this.resolveNickname(context),
            )
            .subscribe({
                error: (error) => {
                    console.error('Error opening reset device dialog:', error);
                },
            });
    }

    private openOptOutDialog(context: ActionHandlerContext): void {
        const participantSeqId = context.participantResource().participantSeqID ?? null;

        if (!participantSeqId) {
            return;
        }

        this.optOutService
            .openOptOutDialog(
                participantSeqId,
                context.deviceResource().deviceSerialNumber ?? null,
                context.vehicleResource(),
                this.resolveNickname(context),
            )
            .subscribe({
                error: (error) => {
                    console.error('Error opening opt out dialog:', error);
                },
            });
    }
    private openDeviceOrder(context: ActionHandlerContext): void {
        const deviceOrderSeqId = context.participantResource().openDeviceOrder?.deviceOrderSeqID;
        if (!deviceOrderSeqId) {
            return;
        }

        const url = this.router.serializeUrl(
            this.router.createUrlTree(['/orderfulfillment/order'], {
                queryParams: {
                    deviceOrderSeqId:
                        context.participantResource().openDeviceOrder?.deviceOrderSeqID,
                },
            }),
        );

        const newTab = window.open(url, '_blank');

        if (!newTab) {
            this.notificationService.error(
                'Unable to open device order page in a new tab. Please check your popup blocker settings.',
            );
        }
    }

    private openDeleteParticipantDialog(context: ActionHandlerContext): void {
        const participantSeqId = context.participantResource().participantSeqID ?? null;

        if (!participantSeqId) {
            return;
        }

        this.deleteParticipantService
            .openDeleteParticipantDialog(
                participantSeqId,
                context.deviceResource().deviceSerialNumber ?? null,
                context.vehicleResource(),
                context.displayNickname(),
            )
            .subscribe({
                error: (error) => {
                    console.error('Error opening delete vehicle dialog:', error);
                },
            });
    }

    private openViewTrips(context: ActionHandlerContext): void {
        const participantSeqId = context.participantResource().participantSeqID ?? null;
        this.viewTripsService
            .openViewTripsDialog(
                participantSeqId,
                context.vehicleContext().vehicle,
                context.nicknameContext().currentNickname
            )
            .pipe(
                takeUntilDestroyed(this.destroyRef),
                switchMap((dialogRef) => dialogRef.afterClosed())
            )
            .subscribe({
                next: () => {
                    context.onViewTripsClosed();
                },
            });
    }

    private openExcludeTrips(context: ActionHandlerContext): void {
        const participantSeqId = context.participantResource().participantSeqID ?? null;
        if (!participantSeqId) {
            return;
        }

        this.excludeTripsService.openExcludeTripsDialog(
            participantSeqId,
            context.vehicleContext().vehicle,
            context.nicknameContext().currentNickname,
        );
    }

    private resolveNickname(context: ActionHandlerContext): string {
        return context.displayNickname() ?? context.driverResource().nickname ?? '';
    }

    private readDeviceAudioStatus(device: AccountDeviceSummary): boolean | undefined {
        const typedDevice = device as unknown as {
            isAudioOn?: unknown;
            audioOn?: unknown;
            extenders?: unknown;
        };

        if (typeof typedDevice.isAudioOn === 'boolean') {
            return typedDevice.isAudioOn;
        }

        if (typeof typedDevice.audioOn === 'boolean') {
            return typedDevice.audioOn;
        }

        return this.extractExtenderBoolean(typedDevice.extenders, DeviceResourceExtenders.AudioStatus);
    }

    private extractExtenderBoolean(extenders: unknown, key: string): boolean | undefined {
        if (!extenders) {
            return undefined;
        }

        if (Array.isArray(extenders)) {
            for (const entry of extenders) {
                if (!entry || typeof entry !== 'object') {
                    continue;
                }

                const candidateKey = (entry as { key?: string; Key?: string }).key ?? (entry as { Key?: string }).Key;
                if (candidateKey !== key) {
                    continue;
                }

                const rawValue = (entry as { value?: unknown; Value?: unknown }).value ?? (entry as { Value?: unknown }).Value;
                if (typeof rawValue === 'boolean') {
                    return rawValue;
                }
            }

            return undefined;
        }

        if (typeof extenders === 'object') {
            const record = extenders as Record<string, unknown>;
            const candidate = record[key];
            if (typeof candidate === 'boolean') {
                return candidate;
            }
        }

        return undefined;
    }
}
