import { computed, Injectable, signal } from '@angular/core';
import { DeviceLot } from 'src/app/shared/data/lot-management/resources';

@Injectable({
    providedIn: 'root',
})
export class DeviceLotStateService {
    // State signals
    private readonly _deviceLot = signal<DeviceLot | null>(null);

    // Public readonly signal
    readonly deviceLot = this._deviceLot.asReadonly();

    // Computed signals
    readonly hasDeviceLot = computed(() => this._deviceLot() !== null);

    /**
     * Set the current device lot
     */
    setDeviceLot(lot: DeviceLot | null): void {
        this._deviceLot.set(lot);
    }

    /**
     * Clear the current device lot
     */
    clearDeviceLot(): void {
        this._deviceLot.set(null);
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
