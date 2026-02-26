import { Injectable } from '@angular/core';
import { BenchTestDeviceStatus } from 'src/app/shared/data/bench-test/enums';
import { BenchTestBoardDeviceStatus } from 'src/app/shared/data/bench-test/resources';
import { DeviceDetails } from 'src/app/shared/data/lot-management/resources';

export interface DeviceCountResult {
    successCount: number;
    testedCount: number;
}

@Injectable({
    providedIn: 'root',
})
export class LotBenchtestProgressCalculationService {
    /**
     * Calculates the count of successfully tested and total tested devices
     * @param devices - Array of devices with benchTestStatusCode
     * @returns Object containing successCount and testedCount
     */
    calculateDeviceCounts(devices: BenchTestBoardDeviceStatus[] | DeviceDetails[]): DeviceCountResult {
        let successCount = 0;
        let testedCount = 0;

        devices.forEach((device) => {
            if (device.benchTestStatusCode === BenchTestDeviceStatus.Completed) {
                successCount++;
                testedCount++;
            } else if (
                device.benchTestStatusCode === BenchTestDeviceStatus.FirmwareError ||
                device.benchTestStatusCode === BenchTestDeviceStatus.Error
            ) {
                testedCount++;
            }
        });

        return { successCount, testedCount };
    }

    /**
     * Calculates the percentage of devices tested
     * @param testedCount - Number of devices tested
     * @param lotSize - Total number of devices in the lot
     * @returns Percentage tested, rounded to nearest integer
     */
    calculatePercentTested(testedCount: number, lotSize: number): number {
        return lotSize > 0 ? Math.round((testedCount / lotSize) * 100) : 0;
    }

    /**
     * Calculates the required number of devices based on percentage
     * @param requiredPercentage - Required percentage (e.g., 2 for 2%)
     * @param lotSize - Total number of devices in the lot
     * @returns Required count, rounded up
     */
    calculateRequiredCount(requiredPercentage: number, lotSize: number): number {
        return Math.ceil((requiredPercentage / 100) * lotSize);
    }
}
