import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { LotManagementService } from 'src/app/shared/services/api/lot-management/lot-management.service';
import { BenchTestService } from 'src/app/shared/services/api/bench-test/bench-test.service';
import { NotificationBannerService } from 'src/app/shared/notifications/notification-banner/notification-banner.service';
import { DeviceLot } from 'src/app/shared/data/lot-management/resources';
import { BenchTestDeviceStatusService } from '../bench-test-current-board/services/bench-test-device-status.service';
import { switchMap, filter } from 'rxjs';
import { LotBenchtestProgressCalculationService } from './services/lot-benchtest-progress-calculation.service';

@Component({
    selector: 'tmx-lot-benchtest-progress',
    standalone: true,
    imports: [MatFormFieldModule, MatSelectModule, MatButtonModule, FormsModule],
    templateUrl: './lot-benchtest-progress.component.html',
    styleUrls: ['./lot-benchtest-progress.component.scss'],
})
export class LotBenchtestProgressComponent implements OnInit {
    private readonly destroyRef = inject(DestroyRef);
    private readonly lotManagementService = inject(LotManagementService);
    private readonly benchTestService = inject(BenchTestService);
    private readonly notificationService = inject(NotificationBannerService);
    private readonly deviceStatusService = inject(BenchTestDeviceStatusService);
    private readonly calculationService = inject(LotBenchtestProgressCalculationService);

    // Signals
    readonly deviceLots = signal<DeviceLot[]>([]);
    readonly selectedLotId = signal<number | null>(null);
    readonly lotSize = signal(0);
    readonly successCount = signal(0);
    readonly testedDevicesCount = signal(0);
    readonly isLoadingLots = signal(false);
    readonly isLoadingLotSize = signal(false);
    readonly isVerifying = signal(false);
    readonly requiredPercentage = signal(2);

    // Computed signals
    readonly selectedLot = computed(
        () => this.deviceLots().find((lot) => lot.lotSeqID === this.selectedLotId()) ?? null,
    );

    readonly requiredCount = computed(() =>
        this.calculationService.calculateRequiredCount(this.requiredPercentage(), this.lotSize()),
    );

    readonly percentTested = computed(() =>
        this.calculationService.calculatePercentTested(this.testedDevicesCount(), this.lotSize()),
    );

    readonly canVerify = computed(
        () =>
            this.selectedLot() !== null &&
            !this.isVerifying() &&
            !this.isLoadingLots() &&
            !this.isLoadingLotSize() &&
            this.percentTested() >= this.requiredPercentage(),
    );

    readonly devicesInLot = signal<string[]>([]);

    constructor() {
        // Subscribe to bench test completions, automatically switching when devices change
        toObservable(this.devicesInLot)
            .pipe(
                filter((devices) => devices.length > 0),
                switchMap((devices) =>
                    this.deviceStatusService.subscribeToBenchTestCompletions(devices),
                ),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe(() => {
                const selectedLot = this.selectedLot();
                if (selectedLot?.lotSeqID && selectedLot?.type !== undefined) {
                    this.loadLotSize(selectedLot.lotSeqID, selectedLot.type);
                }
            });
    }

    ngOnInit(): void {
        this.loadDeviceLots();
    }

    loadDeviceLots(): void {
        this.isLoadingLots.set(true);
        this.lotManagementService
            .GetLotsForMarkBenchTestComplete()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (response) => {
                    this.deviceLots.set(response.deviceLots || []);
                    this.requiredPercentage.set(response.requiredPercentage || 2);
                    this.isLoadingLots.set(false);
                },
                error: (error) => {
                    console.error('Error loading device lots:', error);
                    this.deviceLots.set([]);
                    this.isLoadingLots.set(false);
                },
            });
    }

    onLotSelected(lotSeqId: number | null): void {
        this.selectedLotId.set(lotSeqId);

        const selectedLot = this.selectedLot();
        if (selectedLot?.lotSeqID && selectedLot.type !== undefined) {
            this.loadLotSize(selectedLot.lotSeqID, selectedLot.type);
        } else {
            this.resetLotData();
        }
    }

    private resetLotData(): void {
        this.lotSize.set(0);
        this.successCount.set(0);
        this.testedDevicesCount.set(0);
    }



    loadLotSize(lotSeqId: number, lotType: number): void {
        this.isLoadingLotSize.set(true);
        this.lotManagementService
            .getDevicesByLot(lotSeqId, lotType)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (response) => {
                    this.lotSize.set(response.deviceCount || 0);

                    const { successCount, testedCount } =
                        this.calculationService.calculateDeviceCounts(response.devices || []);

                    this.devicesInLot.set(
                        response.devices?.map((device) => device.deviceSerialNumber) || [],
                    );

                    this.successCount.set(successCount);
                    this.testedDevicesCount.set(testedCount);

                    this.isLoadingLotSize.set(false);
                },
                error: (error) => {
                    console.error('Error loading lot size:', error);
                    this.resetLotData();
                    this.isLoadingLotSize.set(false);
                },
            });
    }

    markAsBenchtested(): void {
        const selectedLot = this.selectedLot();
        if (!selectedLot || !selectedLot.lotSeqID || selectedLot.type === undefined) {
            console.error('Cannot mark as benchtested: missing lot information');
            return;
        }

        this.isVerifying.set(true);
        const request = {
            lotSeqId: selectedLot.lotSeqID,
            lotType: selectedLot.type,
        };

        this.benchTestService
            .verifyBenchTest(request)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (response) => {
                    const message = `Bench test verified successfully! Total: ${response.totalDevices}, Successful: ${response.successfulUpdates}, Failed: ${response.failedUpdates}`;
                    this.notificationService.success(message);

                    // Reload the device lots list
                    this.loadDeviceLots();

                    // Reload the current lot data to refresh the counts
                    const currentLot = this.selectedLot();
                    if (currentLot?.lotSeqID && currentLot?.type !== undefined) {
                        this.loadLotSize(currentLot.lotSeqID, currentLot.type);
                    }

                    this.isVerifying.set(false);
                },
                error: (error) => {
                    console.error('Error verifying bench test:', error);
                    this.isVerifying.set(false);
                },
            });
    }
}
