import { inject, Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject, Subscription, interval, of } from 'rxjs';
import { catchError, switchMap, takeUntil, map, filter, distinctUntilChanged } from 'rxjs/operators';
import { BenchTestDeviceService } from '../../../../../shared/services/api/bench-test/bench-test-device.service';
import { BenchTestBoardDeviceStatus } from 'src/app/shared/data/bench-test/resources';
import { BenchTestBoardStatus, BenchTestDeviceStatus } from 'src/app/shared/data/bench-test/enums';
import { NotificationBannerService } from 'src/app/shared/notifications/notification-banner/notification-banner.service';

@Injectable({
    providedIn: 'root',
})
export class BenchTestDeviceStatusService implements OnDestroy {
    private readonly POLLING_INTERVAL_MS = 5000;
    private readonly AUTO_STOP_TIMEOUT_MS = 600000; // 10 minutes

    private benchTestDeviceService = inject(BenchTestDeviceService);
    private notificationService = inject(NotificationBannerService);
    private boardStatusSubject$ = new BehaviorSubject<BenchTestBoardStatus>(null);
    //* Subscription to view polled boardStatus *//
    public boardStatus$: Observable<BenchTestBoardStatus> = this.boardStatusSubject$.asObservable();

    private deviceStatusesSubject$ = new BehaviorSubject<BenchTestBoardDeviceStatus[]>([]);
    //* Subscription to view polled deviceStatuses *//
    public deviceStatuses$: Observable<BenchTestBoardDeviceStatus[]> =
        this.deviceStatusesSubject$.asObservable();

    private stopPolling$ = new Subject<void>();
    private pollingSubscription: Subscription | null = null;
    private currentBoardId: number | null = null;
    private autoStopTimer: ReturnType<typeof setTimeout> | null = null;

    startPolling(boardId: number): void {
        if (this.pollingSubscription && this.currentBoardId === boardId) {
            return;
        }

        this.stopPolling();

        this.currentBoardId = boardId;

        this.fetchDeviceStatuses(boardId);

        // Set up auto-stop timer
        this.startAutoStopTimer();
        
        this.pollingSubscription = interval(this.POLLING_INTERVAL_MS)
            .pipe(
                takeUntil(this.stopPolling$),
                switchMap(() => this.benchTestDeviceService.getAllDeviceStatusesByBoard(boardId)),
                catchError(() => {
                    return of({ deviceStatuses: [], boardStatus: BenchTestBoardStatus.Unknown });
                }),
            )
            .subscribe((response) => {
                this.boardStatusSubject$.next(response.boardStatus);
                this.deviceStatusesSubject$.next(response.deviceStatuses);
            });
    }

    resetAutoStopTimer(): void {
        if(this.pollingSubscription){
            if (this.autoStopTimer) {
                clearTimeout(this.autoStopTimer);
            }
            this.startAutoStopTimer();
        }
    }

    private startAutoStopTimer(): void {
        this.autoStopTimer = setTimeout(() => {
            this.notificationService.warning(
                'Device status updates paused. Refresh page to update.',
                { duration: 0 },
            );

            this.stopPolling();
        }, this.AUTO_STOP_TIMEOUT_MS);
    }

    stopPolling(): void {
        this.stopPolling$.next();
        if (this.pollingSubscription) {
            this.pollingSubscription.unsubscribe();
            this.pollingSubscription = null;
        }
        if (this.autoStopTimer) {
            clearTimeout(this.autoStopTimer);
            this.autoStopTimer = null;
        }
        this.currentBoardId = null;
    }

    fetchDeviceStatuses(boardId: number): void {
        this.benchTestDeviceService
            .getAllDeviceStatusesByBoard(boardId)
            .pipe(
                catchError(() => {
                    return of({ deviceStatuses: [], boardStatus: BenchTestBoardStatus.Unknown });
                }),
            )
            .subscribe((response) => {
                this.deviceStatusesSubject$.next(response.deviceStatuses);
                this.boardStatusSubject$.next(response.boardStatus);
            });
    }

    /**
     * Returns an observable that emits the count of completed or errored devices
     * that are in the specified lot. Emits only when the count is greater than zero and changes.
     * @param deviceSerialNumbers - Array of device serial numbers in the lot (case-insensitive)
     * @returns Observable<number> - Count of completed/errored devices in the lot
     */
    subscribeToBenchTestCompletions(deviceSerialNumbers: string[]): Observable<number> {
        console.log('Subscribing to bench test completions for devices:', deviceSerialNumbers);
        return this.deviceStatuses$.pipe(
            map((statuses) =>
                statuses.filter(
                    (status) =>
                        deviceSerialNumbers.some(
                            (device) =>
                                device.toLowerCase() === status.deviceSerialNumber.toLowerCase(),
                        ) &&
                        (status.benchTestStatusCode === BenchTestDeviceStatus.Completed ||
                            status.benchTestStatusCode === BenchTestDeviceStatus.Error ||
                            status.benchTestStatusCode === BenchTestDeviceStatus.FirmwareError),
                ).length,
            ),
            filter((count) => count > 0),
            distinctUntilChanged(),
        );
    }

    ngOnDestroy(): void {
        this.stopPolling();
        this.deviceStatusesSubject$.complete();
        this.boardStatusSubject$.complete();
        this.stopPolling$.complete();
    }
}
