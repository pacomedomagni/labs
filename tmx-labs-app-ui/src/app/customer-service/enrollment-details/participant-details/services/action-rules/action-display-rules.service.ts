import { inject, Injectable } from '@angular/core';
import {
    AccountDeviceSummary,
    AccountParticipantSummary,
} from 'src/app/shared/data/participant/resources';
import {
    DeviceExperience,
    DeviceExperienceValue,
    DeviceOrderStatus,
    DeviceOrderStatusValue,
    DeviceStatus,
    DeviceStatusValue,
} from 'src/app/shared/data/device/enums';
import { UserInfoService } from 'src/app/shared/services/user-info/user-info.service';
import { UserRoles } from 'src/app/shared/data/application/constants';
import { ParticipantStatusValue } from 'src/app/shared/data/participant/constants';
import { ParticipantStatus } from 'src/app/shared/data/participant/enums';

export interface ActionVisibilityContext {
    participant: AccountParticipantSummary;
    device: AccountDeviceSummary;
    eligibleSwapCandidatesCount: number;
}

@Injectable({
    providedIn: 'root',
})
export class ActionDisplayRulesService {
    private readonly userInfoService = inject(UserInfoService);

    /*
     * Determines if device replacement is allowed
     */
    canReplaceDevice(context: ActionVisibilityContext): boolean {
        return this.canPerformDeviceReassignment(context);
    }

    /**
     * Determines if device swapping is allowed
     */
    canSwapDevices(context: ActionVisibilityContext): boolean {
        return (
            this.canPerformDeviceReassignment(context) && context.eligibleSwapCandidatesCount > 0
        );
    }

    /**
     * Determines if device can be pinged
     */
    canPingDevice(context: ActionVisibilityContext): boolean {
        const { participant, device } = context;
        const isEnrolled = participant.participantStatusCode === 1;
        const isPlugInDevice =
            device.deviceExperienceTypeCode === DeviceExperienceValue.get(DeviceExperience.Device);
        const isAssigned = device.deviceStatusCode === DeviceStatusValue.get(DeviceStatus.Assigned);
        const hasSerial = this.normalize(device.deviceSerialNumber) !== null;
        const deviceSeqId = device.deviceSeqID ?? null;
        const hasNotBeenReturned = device.deviceReceivedDateTime == null;

        return (
            isEnrolled &&
            isPlugInDevice &&
            isAssigned &&
            hasSerial &&
            deviceSeqId !== null &&
            hasNotBeenReturned
        );
    }

    /**
     * Determines if device can be reset
     */
    canResetDevice(context: ActionVisibilityContext): boolean {
        return this.canPingDevice(context);
    }

    canManageAudio(context: ActionVisibilityContext): boolean {
        if (!this.userInfoService.getUserAccess([UserRoles.LabsAdmin])) {
            return false;
        }

        const { participant, device } = context;

        const isEnrolled = participant.participantStatusCode === ParticipantStatusValue.get(ParticipantStatus.Enrolled);
        const isPlugInDevice =
            device.deviceExperienceTypeCode === DeviceExperienceValue.get(DeviceExperience.Device);
        const isAssigned = device.deviceStatusCode === DeviceStatusValue.get(DeviceStatus.Assigned);
        const hasSerial = this.normalize(device.deviceSerialNumber) !== null;
        const hasDeviceSeqId = device.deviceSeqID != null;
        const hasNotBeenReturned = device.deviceReceivedDateTime == null;
        const hasNotBeenAbandoned = device.deviceAbandonedDateTime == null;

        return (
            isEnrolled &&
            isPlugInDevice &&
            isAssigned &&
            hasSerial &&
            hasDeviceSeqId &&
            hasNotBeenReturned &&
            hasNotBeenAbandoned
        );
    }

    /**
     * Determines if device can be marked as abandoned
     */
    canBeMarkedAbandoned(context: ActionVisibilityContext): boolean {
        const { device } = context;
        return (
            device.deviceExperienceTypeCode ===
                DeviceExperienceValue.get(DeviceExperience.Device) &&
            !!device.deviceSerialNumber &&
            device.deviceStatusCode !== DeviceStatusValue.get(DeviceStatus.Abandoned) &&
            device.deviceStatusCode !== DeviceStatusValue.get(DeviceStatus.Defective) &&
            device.deviceReceivedDateTime == null &&
            device.deviceAbandonedDateTime == null
        );
    }

    canFulfillDeviceOrder(context: ActionVisibilityContext): boolean {
        const enrolledStatus = ParticipantStatusValue.get(ParticipantStatus.Enrolled);
        const newStatus = DeviceOrderStatusValue.get(DeviceOrderStatus.New);

        if (
            this.userInfoService.getUserAccess([UserRoles.LabsAdmin]) &&
            context.participant.participantStatusCode === enrolledStatus &&
            context.participant.openDeviceOrder?.deviceOrderStatusCode === newStatus
        ) {
            return true;
        }
        return false;
    }

    /**
     * Determines if device can be marked as defective
     */
    canBeMarkedDefective(context: ActionVisibilityContext): boolean {
        const { device } = context;
        return (
            device.deviceExperienceTypeCode ===
                DeviceExperienceValue.get(DeviceExperience.Device) &&
            !!device.deviceSerialNumber &&
            device.deviceStatusCode !== DeviceStatusValue.get(DeviceStatus.Defective) &&
            device.deviceReceivedDateTime == null
        );
    }

    /**
     * Determines if participant can opt out
     */
    canOptOut(context: ActionVisibilityContext): boolean {
        const { participant, device } = context;

        return (
            participant.participantSeqID != null &&
            participant.participantSeqID > 0 &&
            device?.deviceExperienceTypeCode === DeviceExperienceValue.get(DeviceExperience.Device) &&
            (participant.participantStatusCode ?? null) !==
                ParticipantStatusValue.get(ParticipantStatus.OptOut)
        );
    }

    /**
     * Determines if participant can delete vehicle
     */
    canDeleteVehicle(context: ActionVisibilityContext): boolean {
        const { participant } = context;
        const device = context.device;

        if (this.userInfoService.getUserAccess([UserRoles.LabsAdmin]) && 
        ( participant.participantStatusCode != null && participant.participantStatusCode == ParticipantStatusValue.get(ParticipantStatus.OptOut)) &&
        device.deviceExperienceTypeCode ===   DeviceExperienceValue.get(DeviceExperience.Device))
        {
            return true;
        }
        return false;
    }

    /**
     * Private helper to determine if device reassignment operations are allowed
     */
    private canPerformDeviceReassignment(context: ActionVisibilityContext): boolean {
        const { participant, device } = context;

        const isEnrolled = participant.participantStatusCode === 1;
        const isPlugInDevice =
            device.deviceExperienceTypeCode === DeviceExperienceValue.get(DeviceExperience.Device);
        const isAssigned = device.deviceStatusCode === DeviceStatusValue.get(DeviceStatus.Assigned);
        const hasSerial = this.normalize(device.deviceSerialNumber) !== null;
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

    canViewTrips(context: ActionVisibilityContext): boolean {
        return (
            context.device.deviceExperienceTypeCode ===
            DeviceExperienceValue.get(DeviceExperience.Device)
        );
    }

    canExcludeTrips(context: ActionVisibilityContext): boolean {
        if (!this.userInfoService.getUserAccess([UserRoles.LabsAdmin])) {
            return false;
        }

        const { participant } = context;
        const isEnrolled = participant.participantStatusCode === ParticipantStatusValue.get(ParticipantStatus.Enrolled);
        return isEnrolled;
    }

    /**
     * Helper method to normalize string values
     */
    private normalize(value: string | null | undefined): string | null {
        if (value === null || value === undefined) {
            return null;
        }

        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : null;
    }
}
