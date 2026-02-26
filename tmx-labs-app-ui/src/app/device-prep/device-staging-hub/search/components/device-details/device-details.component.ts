import { AfterViewInit, Component, computed, effect, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCard } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { DeviceDetails } from 'src/app/shared/data/lot-management/resources';
import { FallbackValuePipe } from 'src/app/shared/pipes/fallback-value.pipe';
import { DeviceStatusDescription } from 'src/app/shared/data/device/constants';
import { DeviceStatusValue } from 'src/app/shared/data/device/enums';
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { DeviceDetailsStateService, DeviceLotStateService } from '../../services';
import { DeviceService } from 'src/app/shared/services/api/device/device.service';
import { NotificationBannerService } from 'src/app/shared/notifications/notification-banner/notification-banner.service';

@Component({
    selector: 'tmx-device-details',
    standalone: true,
    imports: [CommonModule, MatCard, MatTableModule, MatButtonModule, FallbackValuePipe, MatPaginatorModule],
    templateUrl: './device-details.component.html',
    styleUrl: './device-details.component.scss',
})
export class DeviceDetailsComponent implements AfterViewInit {
    private readonly deviceDetailsState = inject(DeviceDetailsStateService);
    private readonly deviceLotState = inject(DeviceLotStateService);
    private readonly deviceService = inject(DeviceService);
    private readonly notificationService = inject(NotificationBannerService);
    // Reverse lookup map for efficient status code to enum conversion
    private readonly statusCodeToEnum = new Map(
        Array.from(DeviceStatusValue.entries()).map(([k, v]) => [v, k])
    );

    // Expose service signals for template
    readonly devices = this.deviceDetailsState.devices;
    readonly isLoading = this.deviceDetailsState.isLoading;
    readonly error = this.deviceDetailsState.error;

    readonly displayedColumns: string[] = ['deviceId', 'deviceStatus', 'sim', 'simStatus', 'actions'];
    dataSource = new MatTableDataSource<DeviceDetails>([]);
    @ViewChild(MatPaginator) paginator!: MatPaginator;

    private readonly lotId = computed(() => {
        const lot = this.deviceLotState.deviceLot();
        return lot?.lotSeqID ?? lot?.seqId;
    });
    private readonly lotType = computed(() => this.deviceLotState.deviceLot()?.type);

    constructor() {
        // Effect to load devices when lot changes
        effect(() => {
            const lotId = this.lotId();
            const lotType = this.lotType();
            if (lotId && lotType) {
                this.deviceDetailsState.loadDevices(lotId, lotType);
            }
        });

        // Effect to sync devices signal to dataSource
        effect(() => {
            this.dataSource.data = this.devices();
        });
    }
    
    ngAfterViewInit() {
        this.dataSource.paginator = this.paginator;
    }

    getDeviceStatus(status: number): string | null {
        const enumValue = this.statusCodeToEnum.get(status);
        return enumValue ? DeviceStatusDescription.get(enumValue) ?? null : null;
    }

    onActivate(device: DeviceDetails): void {
        this.deviceService.activateDevice(device.deviceSerialNumber).subscribe({
            next: () => {
                this.deviceDetailsState.updateDevice({...device, isSimActive: true});
                this.notificationService.success('Activate Device Successful');
            }
        });
    }

    onDeactivateDevice(device: DeviceDetails): void {
        this.deviceService.deactivateDevice(device.deviceSerialNumber).subscribe({
            next: () => {
                this.deviceDetailsState.updateDevice({...device, isSimActive: false});
                this.notificationService.success('Deactivate Device Successful');
            }
        });
    }
}
