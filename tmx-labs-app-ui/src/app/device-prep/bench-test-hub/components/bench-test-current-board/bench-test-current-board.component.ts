// Angular Core
import {
    Component,
    computed,
    DestroyRef,
    effect,
    HostListener,
    inject,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { Subscription } from 'rxjs';

// Angular Forms
import { FormControl, ReactiveFormsModule } from '@angular/forms';

// Angular Material
import { MatButtonModule } from '@angular/material/button';

// Components
import { BenchTestDevicesFormComponent } from './components/bench-test-devices-form/bench-test-devices-form.component';

// Services
import { BenchTestDeviceService } from 'src/app/shared/services/api/bench-test/bench-test-device.service';
import { BenchTestDeviceStatusService } from 'src/app/device-prep/bench-test-hub/components/bench-test-current-board/services/bench-test-device-status.service';
import { NotificationBannerService } from 'src/app/shared/notifications/notification-banner/notification-banner.service';

// Data Models & Enums
import { BenchTestBoardDevice } from 'src/app/shared/data/bench-test/resources';
import { BenchTestBoardStatus } from 'src/app/shared/data/bench-test/enums';
import { BenchTestBoardStatusDescription } from 'src/app/shared/data/bench-test/constants';
import { BenchTestActionsService } from '../../services/bench-test-actions.service';
import { BenchTestBoardService } from '../../services/bench-test-board.service';

@Component({
    selector: 'tmx-bench-test-current-board',
    imports: [MatButtonModule, BenchTestDevicesFormComponent, ReactiveFormsModule],
    templateUrl: './bench-test-current-board.component.html',
    styleUrl: './bench-test-current-board.component.scss',
})
export class BenchTestCurrentBoardComponent {
    // Dependency Injection
    private readonly destroyRef = inject(DestroyRef);
    private readonly benchTestDeviceService = inject(BenchTestDeviceService);
    private readonly deviceStatusService = inject(BenchTestDeviceStatusService);
    private readonly deviceActionsService = inject(BenchTestActionsService);
    private readonly notificationService = inject(NotificationBannerService);
    private readonly boardService = inject(BenchTestBoardService);

    // Inputs & Outputs
    selectedBoard = this.boardService.selectedBoard;

    // Subscriptions
    private updateDevicesSubscription?: Subscription;

    // Form
    devices = new FormControl<BenchTestBoardDevice[]>([], { nonNullable: true });

    // Form Signals
    devicesValue = toSignal(this.devices.valueChanges, { initialValue: [] });
    devicesValidity = toSignal(this.devices.statusChanges, {
        initialValue: 'VALID',
    });

    deviceStatuses = toSignal(this.deviceStatusService.deviceStatuses$, { initialValue: [] });

    // Computed Properties - Status Display
    selectedBoardStatus = computed(() => {
        const statusCode = this.selectedBoardStatusCode();
        return BenchTestBoardStatusDescription.get(statusCode) || 'Unknown Status';
    });

    selectedBoardId = computed(() => {
        return this.selectedBoard()?.boardID;
    });

    selectedBoardStatusCode = computed(() => {
        return this.selectedBoard()?.statusCode ?? BenchTestBoardStatus.Unknown;
    });

    shouldDisplayStatus = computed(() => {
        return this.selectedBoardStatusCode() !== BenchTestBoardStatus.Unknown;
    });

    // Track boardID separately to avoid unnecessary updateDevices calls
    private boardID = computed(() => this.selectedBoard()?.boardID);

    // Computed Properties - State Checks
    isRunning = computed(() => {
        return this.selectedBoardStatusCode() === BenchTestBoardStatus.Running;
    });

    isComplete = computed(() => {
        return this.selectedBoardStatusCode() === BenchTestBoardStatus.Complete;
    });

    isLoading = computed(() => {
        return this.selectedBoardStatusCode() === BenchTestBoardStatus.Loading;
    });

    // Computed Properties - Action Availability
    canRun = computed(() => {
        return (
            this.selectedBoardStatusCode() === BenchTestBoardStatus.Loading &&
            this.devicesValue().length > 0 &&
            this.devicesValidity() === 'VALID'
        );
    });

    canClearBoard = computed(() => {
        const statusCode = this.selectedBoardStatusCode();
        return (
            (statusCode === BenchTestBoardStatus.Loading ||
                statusCode === BenchTestBoardStatus.Complete) &&
            this.devicesValue().length > 0
        );
    });

    isDisabled = computed(() => {
        return this.isRunning() || this.isComplete() || !this.selectedBoard();
    });

    // Lifecycle
    constructor() {
        // Only update devices when boardID changes
        effect(() => {
            const boardID = this.boardID();

            if (boardID) {
                this.updateDevices(boardID);
            }
        });

        // Handle polling based on board status changes
        effect(() => {
            const boardId = this.selectedBoardId();
            const status = this.selectedBoardStatusCode();

            this.deviceStatusService.reset();
            this.deviceStatusService.stopPolling();
            
            if (status === BenchTestBoardStatus.Running) {
                this.deviceStatusService.startPolling(boardId);
            } else if (status === BenchTestBoardStatus.Complete) {
                this.deviceStatusService.fetchDeviceStatuses(boardId);
            }
        });

        // Handle form control disabled state
        effect(() => {
            if (this.isDisabled()) {
                this.devices.disable();
            } else {
                this.devices.enable();
            }
        });
    }

    // Private Methods
    private updateDevices(boardId: number): void {
        // Cancel previous request to avoid race conditions
        this.updateDevicesSubscription?.unsubscribe();

        this.updateDevicesSubscription = this.benchTestDeviceService.getAllDevicesByBoard(boardId).subscribe({
            next: (response) => {
                this.devices.setValue(response.devices);
            },
            error: () => {
                this.devices.setValue([]);
            },
        });
    }

    // Public Action Methods
    @HostListener('mousemove')
    onMouseMove(): void {
        this.deviceStatusService.resetAutoStopTimer();
    }

    runTest(): void {
        const boardId = this.selectedBoard()?.boardID;
        if (!boardId) return;

        this.deviceActionsService
            .runTest(boardId, this.devices.value)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe();
    }

    stopTest(): void {
        const boardId = this.selectedBoard()?.boardID;
        if (!boardId) return;

        this.deviceActionsService
            .stopTest(boardId)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: () => {
                    this.notificationService.success('Bench test stopped successfully.');
                },
            });
    }

    clearBoard(): void {
        const boardId = this.selectedBoard()?.boardID;
        if (!boardId) return;

        this.deviceActionsService
            .clearBoard(boardId)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((success) => {
                if (success) {
                    this.devices.setValue([]);
                }
            });
    }

    onDeviceRemoved(device: { position: number }) {
        if (this.isLoading()) {
            this.removeDeviceFromBoard(device.position);
        }
    }

    onDeviceUpdated(device: { position: number }): void {
        if (this.isLoading()) {
            this.saveDeviceToBoard(device.position);
        }
    }

    removeDeviceFromBoard(devicePosition: number): void {
        const boardId = this.selectedBoard()?.boardID;
        if (!boardId) return;

        this.benchTestDeviceService
            .removeBenchTestDeviceFromBoard(boardId, devicePosition)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: () => {
                    this.boardService.decrementDeviceCount();
                }
            });
    }

    saveDeviceToBoard(devicePosition: number): void {
        const boardId = this.selectedBoard()?.boardID;
        if (!boardId) return;

        const deviceValue = this.devicesValue().find(
            (t) => t.deviceLocationOnBoard === devicePosition,
        );
        if (
            deviceValue &&
            deviceValue.deviceSerialNumber &&
            deviceValue.deviceSerialNumber.trim() !== ''
        ) {
            this.benchTestDeviceService
                .saveBenchTestDeviceToBoard(boardId, deviceValue)
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe({
                    next: () => {
                        this.boardService.incrementDeviceCount();
                    }
                });
        }
    }
}
