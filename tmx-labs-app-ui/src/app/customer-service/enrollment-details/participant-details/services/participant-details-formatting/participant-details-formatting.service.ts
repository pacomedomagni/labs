import { Injectable } from '@angular/core';
import { AccountVehicleSummary } from 'src/app/shared/data/participant/resources';
import {
    DeviceLocationDescription,
    DeviceReturnReasonCodeDescription,
    DeviceStatusDescription,
} from 'src/app/shared/data/device/constants';
import { ParticipantStatus } from 'src/app/shared/data/participant/enums';
import {
    DeviceExperience,
    DeviceExperienceValue,
    DeviceLocationValue,
    DeviceReturnReasonCodeValue,
    DeviceStatusValue,
} from 'src/app/shared/data/device/enums';

@Injectable({
    providedIn: 'root',
})
export class ParticipantDetailsFormattingService {
    /**
     * Formats vehicle information as Year Make Model (e.g., "2020 Honda Civic") OR returns the nickname (e.g. "Jim's Truck") if provided.
     * @param vehicle - The vehicle summary containing year, make, and model
     * @param nickName - Optional nickname for the vehicle. This will always be used if provided and non-empty.
     * @returns Formatted vehicle string or nickname
     */
    formatVehicleNickname(
        vehicle: AccountVehicleSummary,
        nickname: string | null | undefined,
    ): string | null {
        if (nickname && nickname !== '') {
            return nickname;
        }
        return this.formatVehicleYMM(vehicle);
    }

    formatVehicleYMM(vehicle: AccountVehicleSummary): string | null {
        const parts = [
            vehicle.year !== undefined && vehicle.year !== null ? vehicle.year.toString() : null,
            vehicle.make ?? null,
            vehicle.model ?? null,
        ]
            .map((part) => this.normalize(part))
            .filter((part): part is string => !!part);

        if (!parts.length) {
            return null;
        }

        return parts.join(' ');
    }

        /**
     * Maps device experience code to readable format
     */
    mapDeviceExperience(code: number | null | undefined): 'OBD' | 'Mobile' | 'Unknown' {
        if (code === DeviceExperienceValue.get(DeviceExperience.Device)) {
            return 'OBD';
        }

        if (code === DeviceExperienceValue.get(DeviceExperience.Mobile)) {
            return 'Mobile';
        }

        return 'Unknown';
    }

    /**
     * Describes participant status with code and label
     */
    describeParticipantStatus(code: number | null | undefined): string | null {
        if (code === null || code === undefined) {
            return null;
        }

        const label = ParticipantStatusLabels.get(code);
        if (label) {
            return `${label} (${code})`;
        }

        return this.formatFallbackCode(code);
    }

    /**
     * Describes device return reason with description and code
     */
    describeDeviceReturnReason(code: number | null | undefined): string | null {
        if (code === null || code === undefined) {
            return null;
        }

        for (const [reason, mappedCode] of DeviceReturnReasonCodeValue.entries()) {
            if (mappedCode === code) {
                const description = DeviceReturnReasonCodeDescription.get(reason);
                return description ? `${description} (${code})` : this.formatFallbackCode(code);
            }
        }

        return this.formatFallbackCode(code);
    }

    /**
     * Describes device status with description and code
     */
    describeDeviceStatus(code: number | null | undefined): string | null {
        if (code === null || code === undefined) {
            return null;
        }

        for (const [status, mappedCode] of DeviceStatusValue.entries()) {
            if (mappedCode === code) {
                const description = DeviceStatusDescription.get(status);
                return description ? `${description} (${code})` : this.formatFallbackCode(code);
            }
        }

        return this.formatFallbackCode(code);
    }

    /**
     * Describes device location with description and code
     */
    describeDeviceLocation(code: number | null | undefined): string | null {
        if (code === null || code === undefined) {
            return null;
        }

        for (const [location, mappedCode] of DeviceLocationValue.entries()) {
            if (mappedCode === code) {
                const description = DeviceLocationDescription.get(location);
                return description ? `${description} (${code})` : this.formatFallbackCode(code);
            }
        }

        return this.formatFallbackCode(code);
    }

    /**
     * Formats a fallback code when no description is available
     */
    private formatFallbackCode(code: number | null | undefined): string | null {
        if (code === null || code === undefined) {
            return null;
        }
        return code.toString();
    }

    private normalize(value: string | null | undefined): string | null {
        if (value === null || value === undefined) {
            return null;
        }

        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : null;
    }
}

const ParticipantStatusLabels = new Map<number, string>([
    [1, ParticipantStatus.Enrolled],
    [2, ParticipantStatus.OptOut],
]);
