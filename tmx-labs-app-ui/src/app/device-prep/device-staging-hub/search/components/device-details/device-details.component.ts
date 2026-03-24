import {
    AfterViewInit,
    Component,
    computed,
    effect,
    inject,
    OnDestroy,
    ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCard } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { DeviceDetails } from 'src/app/shared/data/lot-management/resources';
import { FallbackValuePipe } from 'src/app/shared/pipes/fallback-value.pipe';
import { DeviceStatusDescription } from 'src/app/shared/data/device/constants';
import { DeviceStatus, DeviceStatusValue } from 'src/app/shared/data/device/enums';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { DeviceDetailsStateService, DeviceLotStateService } from '../../services';
import { DeviceService } from 'src/app/shared/services/api/device/device.service';
import { NotificationBannerService } from 'src/app/shared/notifications/notification-banner/notification-banner.service';
import { Resource } from 'src/app/shared/data/application/resources';

@Component({
    selector: 'tmx-device-details',
    standalone: true,
    imports: [
        CommonModule,
        MatCard,
        MatTableModule,
        MatButtonModule,
        FallbackValuePipe,
        MatPaginatorModule,
    ],
    templateUrl: './device-details.component.html',
    styleUrl: './device-details.component.scss',
})
export class DeviceDetailsComponent implements AfterViewInit, OnDestroy {
    private readonly deviceDetailsState = inject(DeviceDetailsStateService);
    private readonly deviceLotState = inject(DeviceLotStateService);
    private readonly deviceService = inject(DeviceService);
    private readonly notificationService = inject(NotificationBannerService);
    // Reverse lookup map for efficient status code to enum conversion
    private readonly statusCodeToEnum = new Map(
        Array.from(DeviceStatusValue.entries()).map(([k, v]) => [v, k]),
    );

    // Expose service signals for template
    readonly devices = this.deviceDetailsState.devices;
    readonly isLoading = this.deviceDetailsState.isLoading;
    readonly error = this.deviceDetailsState.error;
    readonly deviceCount = computed(() => (!this.isLoading() ? this.devices().length : null));

    readonly displayedColumns: string[] = [
        'deviceId',
        'deviceStatus',
        'sim',
        'simStatus',
        'actions',
    ];
    dataSource = new MatTableDataSource<DeviceDetails>([]);
    @ViewChild(MatPaginator) paginator!: MatPaginator;

    private readonly lotId = computed(() => {
        const lot = this.deviceLotState.deviceLot();
        return lot?.lotSeqID ?? lot?.seqId;
    });
    private readonly lotType = computed(() => this.deviceLotState.deviceLot()?.type);
    private readonly deviceFilter = computed(() => this.deviceLotState.deviceFilter());
    private readonly lotUpdatedAt = computed(() => this.deviceLotState.deviceLot()?.lastUpdatedAt);

    constructor() {
        // Effect to load devices when lot changes
        effect(() => {
            const lotId = this.lotId();
            const lotType = this.lotType();
            const deviceSerialNumber = this.deviceFilter();
            // Access lotUpdatedAt to trigger reload when lot is set with no real updates (e.g. resubmit search)
            this.lotUpdatedAt();

            if (lotId && lotType) {
                this.deviceDetailsState.loadDevices(
                    lotId,
                    lotType,
                    deviceSerialNumber ?? undefined,
                );
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
        return enumValue ? (DeviceStatusDescription.get(enumValue) ?? null) : null;
    }

    onActivate(device: DeviceDetails): void {
        this.deviceService.activateDevice(device.deviceSerialNumber, true).subscribe({
            next: () => {
                this.deviceDetailsState.updateDevice({ 
                    ...device,
                    isSimActive: true ,
                    statusCode: DeviceStatusValue.get(DeviceStatus.ReadyForPrep),
                });
                this.notificationService.success('Activate Device Successful');
            },
            error: (err: { error: Resource }) => {
                this.notificationService.error(
                    err.error?.messages?.error ?? 'Activate Device Failed',
                );
            },
        });
    }

    onDeactivateDevice(device: DeviceDetails): void {
        this.deviceService.deactivateDevice(device.deviceSerialNumber, true).subscribe({
            next: () => {
                this.deviceDetailsState.updateDevice({ 
                    ...device,
                    isSimActive: false ,
                    statusCode: DeviceStatusValue.get(DeviceStatus.ReadyForPrep)
                });
                this.notificationService.success('Deactivate Device Successful');
            },
            error: (err: { error: Resource }) => {
                this.notificationService.error(
                    err.error?.messages?.error ?? 'Deactivate Device Failed',
                );
            },
        });
    }

    ngOnDestroy(): void {
        this.deviceLotState.clearDeviceLot();
    }
}
