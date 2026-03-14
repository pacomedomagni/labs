import { computed, inject, Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { DeviceDetails, GetDevicesByLotResponse } from 'src/app/shared/data/lot-management/resources';
import { LotManagementService } from 'src/app/shared/services/api/lot-management/lot-management.service';

@Injectable({
    providedIn: 'root',
})
export class DeviceDetailsStateService {
    private readonly lotManagementService = inject(LotManagementService);

    // State signals
    private readonly _devices = signal<DeviceDetails[]>([]);
    private readonly _isLoading = signal<boolean>(false);
    private readonly _error = signal<string | null>(null);

    // Subject for handling load requests with automatic request cancellation
    private readonly loadDevicesSubject = new Subject<{ 
        lotSeqId: number; 
        lotType: number; 
        deviceSerialNumber?: string;
    }>();

    // Public readonly signals
    readonly devices = this._devices.asReadonly();
    readonly isLoading = this._isLoading.asReadonly();
    readonly error = this._error.asReadonly();

    // Computed signals
    readonly hasDevices = computed(() => this._devices().length > 0);
    readonly deviceCount = computed(() => this._devices().length);
    readonly hasActiveSimDevices = computed(() =>
        this._devices().some((device) => device.isSimActive),
    );
    readonly hasInactiveSimDevices = computed(() =>
        this._devices().some((device) => !device.isSimActive),
    );

    constructor() {
        // Single subscription that automatically cancels previous requests using switchMap
        this.loadDevicesSubject.pipe(
            tap(() => {
                this._isLoading.set(true);
                this._error.set(null);
            }),
            switchMap(({ lotSeqId, lotType, deviceSerialNumber }) =>
                this.lotManagementService.getDevicesByLot(lotSeqId, lotType).pipe(
                    map(response => this.filterDevicesIfNeeded(response, deviceSerialNumber))
                )
            )
        ).subscribe({
            next: (response) => {
                this._devices.set(response.devices || []);
                this._isLoading.set(false);
            },
            error: () => {
                this._error.set('Failed to load devices');
                this._devices.set([]);
                this._isLoading.set(false);
            },
        });
    }

    /**
     * Filter devices to a specific serial number if provided
     */
    private filterDevicesIfNeeded(
        response: GetDevicesByLotResponse,
        deviceSerialNumber?: string
    ): GetDevicesByLotResponse {
        if (!deviceSerialNumber) {
            return response;
        }

        const filteredDevices = (response.devices || []).filter(
            device => device.deviceSerialNumber?.toLowerCase() === deviceSerialNumber.toLowerCase()
        );
        return { ...response, devices: filteredDevices };
    }

    /**
     * Load devices for a specific lot
     * @param lotSeqId - The lot sequence ID
     * @param lotType - The lot type
     * @param deviceSerialNumber - Optional: filter to only this device
     */
    loadDevices(lotSeqId: number, lotType: number, deviceSerialNumber?: string): void {
        this.loadDevicesSubject.next({ lotSeqId, lotType, deviceSerialNumber });
    }

    /**
     * Clear all devices
     */
    clearDevices(): void {
        this._devices.set([]);
        this._error.set(null);
    }

    /**
     * Update a specific device in the list
     */
    updateDevice(updatedDevice: DeviceDetails): void {
        this._devices.update((devices) =>
            devices.map((device) =>
                device.deviceSerialNumber === updatedDevice.deviceSerialNumber
                    ? updatedDevice
                    : device
            )
        );
    }

    /**
     * Update a single field for all devices in the array
     */
    updateFieldForAllDevices<K extends keyof DeviceDetails>(
        fieldName: K,
        value: DeviceDetails[K]
    ): void {
        this._devices.update((devices) =>
            devices.map((device) => ({
                ...device,
                [fieldName]: value,
            }))
        );
    }
}
