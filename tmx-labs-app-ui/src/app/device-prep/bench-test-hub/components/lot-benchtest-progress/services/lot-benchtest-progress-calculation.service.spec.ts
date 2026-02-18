import { TestBed } from '@angular/core/testing';
import { LotBenchtestProgressCalculationService } from './lot-benchtest-progress-calculation.service';
import { BenchTestDeviceStatus } from 'src/app/shared/data/bench-test/enums';

describe('LotBenchtestProgressCalculationService', () => {
    let service: LotBenchtestProgressCalculationService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [LotBenchtestProgressCalculationService],
        });
        service = TestBed.inject(LotBenchtestProgressCalculationService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('calculateDeviceCounts', () => {
        it('should count completed devices as both success and tested', () => {
            const devices = [
                { benchTestStatusCode: BenchTestDeviceStatus.Completed },
                { benchTestStatusCode: BenchTestDeviceStatus.Completed },
                { benchTestStatusCode: BenchTestDeviceStatus.ConfigUpdating },
            ];

            const result = service.calculateDeviceCounts(devices);

            expect(result.successCount).toBe(2);
            expect(result.testedCount).toBe(2);
        });

        it('should count error devices as tested but not success', () => {
            const devices = [
                { benchTestStatusCode: BenchTestDeviceStatus.Error },
                { benchTestStatusCode: BenchTestDeviceStatus.FirmwareError },
                { benchTestStatusCode: BenchTestDeviceStatus.Completed },
            ];

            const result = service.calculateDeviceCounts(devices);

            expect(result.successCount).toBe(1);
            expect(result.testedCount).toBe(3);
        });

        it('should not count devices in progress', () => {
            const devices = [
                { benchTestStatusCode: BenchTestDeviceStatus.ConfigUpdating },
                { benchTestStatusCode: BenchTestDeviceStatus.Running },
            ];

            const result = service.calculateDeviceCounts(devices);

            expect(result.successCount).toBe(0);
            expect(result.testedCount).toBe(0);
        });

        it('should handle empty device array', () => {
            const result = service.calculateDeviceCounts([]);

            expect(result.successCount).toBe(0);
            expect(result.testedCount).toBe(0);
        });

        it('should handle mixed device statuses correctly', () => {
            const devices = [
                { benchTestStatusCode: BenchTestDeviceStatus.Completed },
                { benchTestStatusCode: BenchTestDeviceStatus.Error },
                { benchTestStatusCode: BenchTestDeviceStatus.FirmwareError },
                { benchTestStatusCode: BenchTestDeviceStatus.Running },
                { benchTestStatusCode: BenchTestDeviceStatus.Completed },
                { benchTestStatusCode: BenchTestDeviceStatus.ConfigUpdating },
            ];

            const result = service.calculateDeviceCounts(devices);

            expect(result.successCount).toBe(2);
            expect(result.testedCount).toBe(4); // 2 completed + 1 error + 1 firmware error
        });

        it('should only count FirmwareError status as tested', () => {
            const devices = [{ benchTestStatusCode: BenchTestDeviceStatus.FirmwareError }];

            const result = service.calculateDeviceCounts(devices);

            expect(result.successCount).toBe(0);
            expect(result.testedCount).toBe(1);
        });

        it('should only count Error status as tested', () => {
            const devices = [{ benchTestStatusCode: BenchTestDeviceStatus.Error }];

            const result = service.calculateDeviceCounts(devices);

            expect(result.successCount).toBe(0);
            expect(result.testedCount).toBe(1);
        });
    });

    describe('calculatePercentTested', () => {
        it('should calculate correct percentage', () => {
            const result = service.calculatePercentTested(50, 100);
            expect(result).toBe(50);
        });

        it('should round percentage to nearest integer', () => {
            const result = service.calculatePercentTested(33, 100);
            expect(result).toBe(33);
        });

        it('should round 0.5 up', () => {
            const result = service.calculatePercentTested(5, 10);
            expect(result).toBe(50);
        });

        it('should handle 0 lot size and return 0', () => {
            const result = service.calculatePercentTested(10, 0);
            expect(result).toBe(0);
        });

        it('should handle 0 tested count', () => {
            const result = service.calculatePercentTested(0, 100);
            expect(result).toBe(0);
        });

        it('should handle 100% tested', () => {
            const result = service.calculatePercentTested(100, 100);
            expect(result).toBe(100);
        });

        it('should handle fractional percentages correctly', () => {
            const result = service.calculatePercentTested(1, 3);
            expect(result).toBe(33); // 33.33... rounds to 33
        });

        it('should round fractional percentages correctly', () => {
            const result = service.calculatePercentTested(2, 3);
            expect(result).toBe(67); // 66.66... rounds to 67
        });

        it('should handle very small percentages', () => {
            const result = service.calculatePercentTested(1, 1000);
            expect(result).toBe(0); // 0.1% rounds to 0
        });
    });

    describe('calculateRequiredCount', () => {
        it('should calculate required count and round up', () => {
            const result = service.calculateRequiredCount(2, 100);
            expect(result).toBe(2);
        });

        it('should round up fractional results', () => {
            const result = service.calculateRequiredCount(2, 99);
            expect(result).toBe(2); // 1.98 rounds up to 2
        });

        it('should handle 0 lot size', () => {
            const result = service.calculateRequiredCount(2, 0);
            expect(result).toBe(0);
        });

        it('should handle 0 percentage', () => {
            const result = service.calculateRequiredCount(0, 100);
            expect(result).toBe(0);
        });

        it('should handle 100% requirement', () => {
            const result = service.calculateRequiredCount(100, 50);
            expect(result).toBe(50);
        });

        it('should always round up even for small fractions', () => {
            const result = service.calculateRequiredCount(1, 1000);
            expect(result).toBe(10); // 1% of 1000 = 10
        });

        it('should round up 0.01 to 1', () => {
            const result = service.calculateRequiredCount(1, 1);
            expect(result).toBe(1); // 0.01 rounds up to 1
        });

        it('should handle fractional percentage correctly', () => {
            const result = service.calculateRequiredCount(2.5, 100);
            expect(result).toBe(3); // 2.5 rounds up to 3
        });

        it('should round up even tiny fractions', () => {
            const result = service.calculateRequiredCount(1, 99);
            expect(result).toBe(1); // 0.99 rounds up to 1
        });
    });
});
