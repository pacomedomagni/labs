import { TestBed } from '@angular/core/testing';
import { ParticipantDetailsFormattingService } from './participant-details-formatting.service';
import { DeviceExperience, DeviceExperienceValue, DeviceStatus, DeviceStatusValue } from 'src/app/shared/data/device/enums';

describe('ParticipantDetailsFormattingService', () => {
    let service: ParticipantDetailsFormattingService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ParticipantDetailsFormattingService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('mapDeviceExperience', () => {
        it('should return "OBD" for device experience', () => {
            const code = DeviceExperienceValue.get(DeviceExperience.Device);
            expect(service.mapDeviceExperience(code)).toBe('OBD');
        });

        it('should return "Mobile" for mobile experience', () => {
            const code = DeviceExperienceValue.get(DeviceExperience.Mobile);
            expect(service.mapDeviceExperience(code)).toBe('Mobile');
        });

        it('should return "Unknown" for invalid codes', () => {
            expect(service.mapDeviceExperience(999)).toBe('Unknown');
            expect(service.mapDeviceExperience(null)).toBe('Unknown');
            expect(service.mapDeviceExperience(undefined)).toBe('Unknown');
        });
    });

    describe('describeParticipantStatus', () => {
        it('should return formatted enrolled status', () => {
            const result = service.describeParticipantStatus(1);
            expect(result).toBe('Enrolled (1)');
        });

        it('should return formatted opt-out status', () => {
            const result = service.describeParticipantStatus(2);
            expect(result).toBe('OptOut (2)');
        });

        it('should return fallback for unknown codes', () => {
            expect(service.describeParticipantStatus(999)).toBe('999');
        });

        it('should return null for null/undefined codes', () => {
            expect(service.describeParticipantStatus(null)).toBeNull();
            expect(service.describeParticipantStatus(undefined)).toBeNull();
        });
    });

    describe('describeDeviceStatus', () => {
        it('should return formatted device status for valid codes', () => {
            const assignedCode = DeviceStatusValue.get(DeviceStatus.Assigned);
            const result = service.describeDeviceStatus(assignedCode);
            expect(result).toContain('Assigned');
            expect(result).toContain(`(${assignedCode})`);
        });

        it('should return fallback for unknown codes', () => {
            expect(service.describeDeviceStatus(999)).toBe('999');
        });

        it('should return null for null/undefined codes', () => {
            expect(service.describeDeviceStatus(null)).toBeNull();
            expect(service.describeDeviceStatus(undefined)).toBeNull();
        });
    });

    describe('vehicle formatting methods', () => {
        it('should format vehicle YMM correctly', () => {
            const vehicle = { year: 2020, make: 'Honda', model: 'Civic' };
            expect(service.formatVehicleYMM(vehicle)).toBe('2020 Honda Civic');
        });

        it('should prefer nickname over YMM', () => {
            const vehicle = { year: 2020, make: 'Honda', model: 'Civic' };
            const nickname = "Jim's Car";
            expect(service.formatVehicleNickname(vehicle, nickname)).toBe("Jim's Car");
        });

        it('should fallback to YMM when no nickname provided', () => {
            const vehicle = { year: 2020, make: 'Honda', model: 'Civic' };
            expect(service.formatVehicleNickname(vehicle, null)).toBe('2020 Honda Civic');
        });

        it('should handle incomplete vehicle data', () => {
            expect(service.formatVehicleYMM({})).toBeNull();
            expect(service.formatVehicleYMM({ year: 2020 })).toBe('2020');
        });
    });
});