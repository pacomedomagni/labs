import { AfterViewInit, Component, effect, inject, input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCard } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { DeviceLot, DeviceDetails } from 'src/app/shared/data/lot-management/resources';
import { LotManagementService } from 'src/app/shared/services/api/lot-management/lot-management.service';
import { FallbackValuePipe } from 'src/app/shared/pipes/fallback-value.pipe';
import { DeviceStatusDescription } from 'src/app/shared/data/device/constants';
import { DeviceStatusValue } from 'src/app/shared/data/device/enums';
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";

@Component({
    selector: 'tmx-device-details',
    standalone: true,
    imports: [CommonModule, MatCard, MatTableModule, MatButtonModule, FallbackValuePipe, MatPaginatorModule],
    templateUrl: './device-details.component.html',
    styleUrl: './device-details.component.scss',
})
export class DeviceDetailsComponent implements AfterViewInit {
    private lotManagementService = inject(LotManagementService);

    // Reverse lookup map for efficient status code to enum conversion
    private readonly statusCodeToEnum = new Map(
        Array.from(DeviceStatusValue.entries()).map(([k, v]) => [v, k])
    );

    deviceLot = input.required<DeviceLot>();

    displayedColumns: string[] = ['deviceId', 'deviceStatus', 'sim', 'simStatus', 'actions'];
    dataSource = new MatTableDataSource<DeviceDetails>([]);
    @ViewChild(MatPaginator) paginator!: MatPaginator;

    constructor() {
        effect(() => {
            const lot = this.deviceLot();
            if (lot?.lotSeqID && lot?.type) {
                this.loadDevices(lot.lotSeqID, lot.type);
            } else if (lot?.seqId && lot?.type) {
                this.loadDevices(lot.seqId, lot.type);
            }
        });
    }
    
    ngAfterViewInit() {
        console.log('Setting paginator for data source', this.paginator);
        this.dataSource.paginator = this.paginator;
    }

    private loadDevices(lotSeqId: number, lotType: number): void {
        this.lotManagementService.getDevicesByLot(lotSeqId, lotType).subscribe({
            next: (response) => {
                this.dataSource.data = response.devices || [];
            },
            error: (error) => {
                console.error('Error loading devices:', error);
                this.dataSource.data = [];
            },
        });
    }

    getDeviceStatus(status: number): string | null {
        const enumValue = this.statusCodeToEnum.get(status);
        return enumValue ? DeviceStatusDescription.get(enumValue) ?? null : null;
    }

    onActivate(device: DeviceDetails): void {
        console.log('Activate device:', device.deviceSerialNumber);
        // TODO: Implement activate device logic
    }

    onDeactivateDevice(device: DeviceDetails): void {
        console.log('Deactivate device:', device.deviceSerialNumber);
        // TODO: Implement deactivate device logic
    }
}
