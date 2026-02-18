/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import { BenchTestDeviceStatusService } from './bench-test-device-status.service';
import { BenchTestDeviceService } from '../../../../../shared/services/api/bench-test/bench-test-device.service';
import { NotificationBannerService } from 'src/app/shared/notifications/notification-banner/notification-banner.service';
import { BenchTestBoardDeviceStatus } from 'src/app/shared/data/bench-test/resources';
import { BenchTestDeviceStatus } from 'src/app/shared/data/bench-test/enums';

describe('BenchTestDeviceStatusService', () => {
    let service: BenchTestDeviceStatusService;
    let benchTestDeviceServiceSpy: jasmine.SpyObj<BenchTestDeviceService>;
    let notificationServiceSpy: jasmine.SpyObj<NotificationBannerService>;

    beforeEach(() => {
        benchTestDeviceServiceSpy = jasmine.createSpyObj('BenchTestDeviceService', [
            'getAllDeviceStatusesByBoard',
        ]);
        notificationServiceSpy = jasmine.createSpyObj('NotificationBannerService', ['warning']);

        TestBed.configureTestingModule({
            providers: [
                BenchTestDeviceStatusService,
                { provide: BenchTestDeviceService, useValue: benchTestDeviceServiceSpy },
                { provide: NotificationBannerService, useValue: notificationServiceSpy },
            ],
        });

        service = TestBed.inject(BenchTestDeviceStatusService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('subscribeToBenchTestCompletions', () => {
        it('should emit count when devices complete', (done) => {
            const mockStatuses: BenchTestBoardDeviceStatus[] = [
                {
                    deviceSerialNumber: 'DEVICE001',
                    benchTestStatusCode: BenchTestDeviceStatus.Completed,
                } as BenchTestBoardDeviceStatus,
                {
                    deviceSerialNumber: 'DEVICE002',
                    benchTestStatusCode: BenchTestDeviceStatus.ConfigUpdating,
                } as BenchTestBoardDeviceStatus,
                {
                    deviceSerialNumber: 'DEVICE003',
                    benchTestStatusCode: BenchTestDeviceStatus.Completed,
                } as BenchTestBoardDeviceStatus,
            ];

            // Access the private subject through the public observable
            (service as any).deviceStatusesSubject$.next(mockStatuses);

            service
                .subscribeToBenchTestCompletions(['DEVICE001', 'DEVICE002', 'DEVICE003'])
                .subscribe((count) => {
                    expect(count).toBe(2); // Only 2 completed
                    done();
                });
        });

        it('should include devices with Error status in count', (done) => {
            const mockStatuses: BenchTestBoardDeviceStatus[] = [
                {
                    deviceSerialNumber: 'DEVICE001',
                    benchTestStatusCode: BenchTestDeviceStatus.Completed,
                } as BenchTestBoardDeviceStatus,
                {
                    deviceSerialNumber: 'DEVICE002',
                    benchTestStatusCode: BenchTestDeviceStatus.Error,
                } as BenchTestBoardDeviceStatus,
            ];

            (service as any).deviceStatusesSubject$.next(mockStatuses);

            service.subscribeToBenchTestCompletions(['DEVICE001', 'DEVICE002']).subscribe((count) => {
                expect(count).toBe(2); // Both completed and error
                done();
            });
        });

        it('should include devices with FirmwareError status in count', (done) => {
            const mockStatuses: BenchTestBoardDeviceStatus[] = [
                {
                    deviceSerialNumber: 'DEVICE001',
                    benchTestStatusCode: BenchTestDeviceStatus.Completed,
                } as BenchTestBoardDeviceStatus,
                {
                    deviceSerialNumber: 'DEVICE002',
                    benchTestStatusCode: BenchTestDeviceStatus.FirmwareError,
                } as BenchTestBoardDeviceStatus,
            ];

            (service as any).deviceStatusesSubject$.next(mockStatuses);

            service.subscribeToBenchTestCompletions(['DEVICE001', 'DEVICE002']).subscribe((count) => {
                expect(count).toBe(2); // Both completed and firmware error
                done();
            });
        });

        it('should match device serial numbers case-insensitively', (done) => {
            const mockStatuses: BenchTestBoardDeviceStatus[] = [
                {
                    deviceSerialNumber: 'device001', // lowercase
                    benchTestStatusCode: BenchTestDeviceStatus.Completed,
                } as BenchTestBoardDeviceStatus,
                {
                    deviceSerialNumber: 'DEVICE002', // uppercase
                    benchTestStatusCode: BenchTestDeviceStatus.Completed,
                } as BenchTestBoardDeviceStatus,
            ];

            (service as any).deviceStatusesSubject$.next(mockStatuses);

            service
                .subscribeToBenchTestCompletions(['DEVICE001', 'device002']) // Mixed case
                .subscribe((count) => {
                    expect(count).toBe(2);
                    done();
                });
        });

        it('should only count devices in the specified lot', (done) => {
            const mockStatuses: BenchTestBoardDeviceStatus[] = [
                {
                    deviceSerialNumber: 'DEVICE001',
                    benchTestStatusCode: BenchTestDeviceStatus.Completed,
                } as BenchTestBoardDeviceStatus,
                {
                    deviceSerialNumber: 'DEVICE999',
                    benchTestStatusCode: BenchTestDeviceStatus.Completed,
                } as BenchTestBoardDeviceStatus,
            ];

            (service as any).deviceStatusesSubject$.next(mockStatuses);

            service.subscribeToBenchTestCompletions(['DEVICE001']).subscribe((count) => {
                expect(count).toBe(1); // Only DEVICE001 is in the lot
                done();
            });
        });

        it('should not emit when count is 0', (done) => {
            const mockStatuses: BenchTestBoardDeviceStatus[] = [
                {
                    deviceSerialNumber: 'DEVICE001',
                    benchTestStatusCode: BenchTestDeviceStatus.ConfigUpdating,
                } as BenchTestBoardDeviceStatus,
            ];

            (service as any).deviceStatusesSubject$.next(mockStatuses);

            const subscription = service
                .subscribeToBenchTestCompletions(['DEVICE001'])
                .subscribe(() => {
                    fail('Should not emit when count is 0');
                });

            // Wait a bit and verify no emission happened
            setTimeout(() => {
                subscription.unsubscribe();
                expect().nothing();
                done();
            }, 100);
        });

        it('should only emit when count changes (distinctUntilChanged)', (done) => {
            const mockStatuses: BenchTestBoardDeviceStatus[] = [
                {
                    deviceSerialNumber: 'DEVICE001',
                    benchTestStatusCode: BenchTestDeviceStatus.Completed,
                } as BenchTestBoardDeviceStatus,
            ];

            let emissionCount = 0;

            const subscription = service
                .subscribeToBenchTestCompletions(['DEVICE001'])
                .subscribe((count) => {
                    emissionCount++;
                    expect(count).toBe(1);
                });

            // Emit same statuses twice
            (service as any).deviceStatusesSubject$.next(mockStatuses);
            (service as any).deviceStatusesSubject$.next(mockStatuses);

            setTimeout(() => {
                expect(emissionCount).toBe(1); // Should only emit once
                subscription.unsubscribe();
                done();
            }, 100);
        });

        it('should emit again when count increases', (done) => {
            const emissions: number[] = [];

            const subscription = service
                .subscribeToBenchTestCompletions(['DEVICE001', 'DEVICE002'])
                .subscribe((count) => {
                    emissions.push(count);
                });

            // First emission: 1 device completed
            (service as any).deviceStatusesSubject$.next([
                {
                    deviceSerialNumber: 'DEVICE001',
                    benchTestStatusCode: BenchTestDeviceStatus.Completed,
                } as BenchTestBoardDeviceStatus,
            ]);

            setTimeout(() => {
                // Second emission: 2 devices completed
                (service as any).deviceStatusesSubject$.next([
                    {
                        deviceSerialNumber: 'DEVICE001',
                        benchTestStatusCode: BenchTestDeviceStatus.Completed,
                    } as BenchTestBoardDeviceStatus,
                    {
                        deviceSerialNumber: 'DEVICE002',
                        benchTestStatusCode: BenchTestDeviceStatus.Error,
                    } as BenchTestBoardDeviceStatus,
                ]);

                setTimeout(() => {
                    expect(emissions).toEqual([1, 2]);
                    subscription.unsubscribe();
                    done();
                }, 50);
            }, 50);
        });

        it('should handle empty device list', (done) => {
            const mockStatuses: BenchTestBoardDeviceStatus[] = [
                {
                    deviceSerialNumber: 'DEVICE001',
                    benchTestStatusCode: BenchTestDeviceStatus.Completed,
                } as BenchTestBoardDeviceStatus,
            ];

            (service as any).deviceStatusesSubject$.next(mockStatuses);

            const subscription = service.subscribeToBenchTestCompletions([]).subscribe(() => {
                fail('Should not emit for empty device list');
            });

            setTimeout(() => {
                subscription.unsubscribe();
                expect().nothing();
                done();
            }, 100);
        });
    });
});
