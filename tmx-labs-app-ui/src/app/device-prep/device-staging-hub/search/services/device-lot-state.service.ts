import { computed, Injectable, signal } from '@angular/core';
import { DeviceLot, DeviceLotStatus } from 'src/app/shared/data/lot-management/resources';

@Injectable({
    providedIn: 'root',
})
export class DeviceLotStateService {
    // State signals
    private readonly _deviceLot = signal<DeviceLot | null>(null);
    private readonly _deviceFilter = signal<string | null>(null);

    // Public readonly signals
    readonly deviceLot = this._deviceLot.asReadonly();

    /** Represents the current device filter. Will be populated if only one device should be shown. */
    readonly deviceFilter = this._deviceFilter.asReadonly();

    // Computed signals
    readonly hasDeviceLot = computed(() => this._deviceLot() !== null);
    readonly isDeviceSearch = computed(() => this._deviceFilter() !== null);

    readonly deviceLotStatus = computed(() => this._deviceLot()?.statusCode);

    readonly isShippedToDistributorStatus = computed(() => {
        const lotStatus = this.deviceLotStatus();
        return lotStatus ? lotStatus === DeviceLotStatus.ShippedToDistributor : false;
    });

    /**
     * Set the current device lot
     * @param lot The device lot to set as the current context
     * @param deviceFilter Optional serial number filter to apply to the device list within the lot context
     */
    setDeviceLot(lot: DeviceLot | null, deviceFilter?: string): void {
        this._deviceLot.set(lot ? { ...lot, lastUpdatedAt: Date.now() } : null);
        this._deviceFilter.set(deviceFilter ?? null);
    }

    /**
     * Clear the current device lot and search context
     */
    clearDeviceLot(): void {
        this._deviceLot.set(null);
        this._deviceFilter.set(null);
    }

    /**
     * Update a specific field on the device lot
     */
    updateDeviceLotField<K extends keyof DeviceLot>(
        fieldName: K,
        value: DeviceLot[K]
    ): void {
        const currentLot = this._deviceLot();
        if (currentLot) {
            this._deviceLot.set({
                ...currentLot,
                [fieldName]: value,
            });
        }
    }
}
