import { computed, inject, Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { DeviceDetails } from 'src/app/shared/data/lot-management/resources';
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
    private readonly loadDevicesSubject = new Subject<{ lotSeqId: number; lotType: number }>();

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
            switchMap(({ lotSeqId, lotType }) => {
                this._isLoading.set(true);
                this._error.set(null);
                return this.lotManagementService.getDevicesByLot(lotSeqId, lotType);
            })
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
     * Load devices for a specific lot
     */
    loadDevices(lotSeqId: number, lotType: number): void {
        this.loadDevicesSubject.next({ lotSeqId, lotType });
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
