import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { OAuthStorage } from 'angular-oauth2-oidc';
import { of } from 'rxjs';
import { ParticipantDetailsComponent } from './participant-details.component';
import {
    DeviceExperience,
    DeviceExperienceValue,
    DeviceLocation,
    DeviceLocationValue,
    DeviceReturnReasonCode,
    DeviceReturnReasonCodeValue,
    DeviceStatus,
    DeviceStatusValue,
} from 'src/app/shared/data/device/enums';
import { ParticipantNicknameService } from './services/participant-nickname/participant-nickname.service';
import { EditVehicleService } from './services/edit-vehicle/edit-vehicle.service';
import { EnrollmentScoringAlgorithmService } from './services/enrollment-scoring/enrollment-scoring-algorithm.service';
import { MarkDefectiveService } from './services/mark-defective/mark-defective.service';
import { MarkAbandonedService } from './services/mark-abandoned/mark-abandoned.service';
import { ReplaceDeviceService } from './services/replace-device/replace-device.service';
import {
    SwapDevicesService,
    SwapDevicesCandidate,
} from './services/swap-devices/swap-devices.service';
import { ParticipantDetailsFormattingService } from './services/participant-details-formatting/participant-details-formatting.service';
import { PingDeviceService } from './services/ping-device/ping-device.service';
import { ResetDeviceService } from './services/reset-device/reset-device.service';
import { OptOutService } from './services/opt-out/opt-out.service';
import { AccountSummary, AccountVehicleSummary } from 'src/app/shared/data/participant/resources';
import { provideHttpClient } from '@angular/common/http';

class ParticipantNicknameServiceStub {
    openEditNicknameDialog() {
        return of(null);
    }
}

class EditVehicleServiceStub {
    openEditVehicleDialog() {
        return of(null);
    }
}

class EnrollmentScoringAlgorithmServiceStub {
    formatScoringAlgorithm(code: number | null | undefined): string | null {
        if (code === null || code === undefined) {
            return null;
        }

        if (code === 2020) {
            return '2020 OBD2';
        }

        if (code === 2021) {
            return '2021 Mobile without Distracted Driving';
        }

        return `Algorithm ${code}`;
    }
}

class MarkDefectiveServiceStub {
    openMarkDefectiveDialog = jasmine
        .createSpy('openMarkDefectiveDialog')
        .and.returnValue(of(true));
}

class MarkAbandonedServiceStub {
    openMarkAbandonedDialog = jasmine
        .createSpy('openMarkAbandonedDialog')
        .and.returnValue(of(true));
}

class ReplaceDeviceServiceStub {
    openReplaceDeviceDialog = jasmine
        .createSpy('openReplaceDeviceDialog')
        .and.returnValue(of(true));
}

class SwapDevicesServiceStub {
    private _candidates = signal<SwapDevicesCandidate[]>([
        {
            participantSeqId: 2,
            displayName: 'Second Vehicle',
            deviceSerialNumber: 'DEV-2',
        },
    ]);

    get candidates(): SwapDevicesCandidate[] {
        return this._candidates();
    }

    set candidates(value: SwapDevicesCandidate[]) {
        this._candidates.set(value);
    }

    openSwapDevicesDialog = jasmine.createSpy('openSwapDevicesDialog').and.returnValue(of(true));

    getEligibleSwapCandidates = jasmine
        .createSpy('getEligibleSwapCandidates')
        .and.callFake(() => [...this._candidates()]);

    hasEligibleSwapCandidates = jasmine
        .createSpy('hasEligibleSwapCandidates')
        .and.callFake(() => this._candidates().length > 0);
}

class ParticipantDetailsFormattingServiceStub {
    formatVehicleNickname(vehicle: AccountVehicleSummary, nickname: string | null): string {
        if (nickname) {
            return nickname;
        }
        return `${vehicle?.year} ${vehicle?.make} ${vehicle?.model} - Vehicle`;
    }

    formatVehicleYMM(vehicle: AccountVehicleSummary): string {
        return `${vehicle?.year} ${vehicle?.make} ${vehicle?.model}`;
    }

    mapDeviceExperience(code: number | null | undefined): 'OBD' | 'Mobile' | 'Unknown' {
        if (code === DeviceExperienceValue.get(DeviceExperience.Device)) {
            return 'OBD';
        }

        if (code === DeviceExperienceValue.get(DeviceExperience.Mobile)) {
            return 'Mobile';
        }

        return 'Unknown';
    }

    describeDeviceStatus(code: number | null | undefined): string | null {
        if (code === null || code === undefined) {
            return null;
        }
        return `Status ${code}`;
    }

    describeParticipantStatus(code: number | null | undefined): string | null {
        if (code === null || code === undefined) {
            return null;
        }
        return `Participant Status ${code}`;
    }

    describeDeviceLocation(code: number | null | undefined): string | null {
        if (code === null || code === undefined) {
            return null;
        }
        return `Location ${code}`;
    }

    describeDeviceReturnReason(code: number | null | undefined): string | null {
        if (code === null || code === undefined) {
            return null;
        }
        return `Return Reason ${code}`;
    }
}

class PingDeviceServiceStub {
    openPingDeviceDialog = jasmine.createSpy('openPingDeviceDialog').and.returnValue(of(true));
}

class ResetDeviceServiceStub {
    openResetDeviceDialog = jasmine.createSpy('openResetDeviceDialog').and.returnValue(of(true));
}

class OptOutServiceStub {
    openOptOutDialog = jasmine.createSpy('openOptOutDialog').and.returnValue(of(true));
}

describe('EnrollmentParticipantDetailsComponent', () => {
    const createAccount = (overrides?: Partial<AccountSummary>): AccountSummary => {
        const baseAccount: AccountSummary = {
            participant: {
                participantSeqID: 1,
                participantExternalID: 'EXT-1',
                participantId: 'd47452f9-a241-4090-8bc7-55374d8b3eed',
                participantStatusCode: 1,
                participantGroupSeqID: 77,
                deviceSeqID: 9001,
                lastUpdateDateTime: null,
                scoringAlgorithmCode: 2020,
                participantCreateDateTime: null,
            },
            vehicle: {
                year: 2021,
                make: 'HONDA',
                model: 'CR-V',
                vin: null,
            },
            device: {
                deviceExperienceTypeCode: DeviceExperienceValue.get(DeviceExperience.Device) ?? 1,
                deviceSeqID: 9001,
                deviceReturnReasonCode: null,
                deviceAbandonedDateTime: null,
                deviceReceivedDateTime: null,
                deviceShipDateTime: null,
                firstContactDateTime: null,
                lastContactDateTime: null,
                lastUploadDateTime: null,
                deviceStatusCode: null,
                deviceLocationCode: null,
                deviceTypeDescription: 'Wireless H',
                deviceSerialNumber: null,
                sim: null,
                deviceManufacturer: null,
                reportedVIN: null,
            },
            driver: {
                nickname: null,
                driverExternalId: null,
            },
        };

        return {
            ...baseAccount,
            ...overrides,
            participant: {
                ...baseAccount.participant,
                ...overrides?.participant,
            },
            vehicle: {
                ...baseAccount.vehicle,
                ...overrides?.vehicle,
            },
            device: {
                ...baseAccount.device,
                ...overrides?.device,
            },
            driver: {
                ...baseAccount.driver,
                ...overrides?.driver,
            },
        };
    };

    let fixture: ComponentFixture<ParticipantDetailsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ParticipantDetailsComponent, MatIconTestingModule],
            providers: [
                { provide: ParticipantNicknameService, useClass: ParticipantNicknameServiceStub },
                { provide: EditVehicleService, useClass: EditVehicleServiceStub },
                {
                    provide: EnrollmentScoringAlgorithmService,
                    useClass: EnrollmentScoringAlgorithmServiceStub,
                },
                { provide: MarkDefectiveService, useClass: MarkDefectiveServiceStub },
                { provide: MarkAbandonedService, useClass: MarkAbandonedServiceStub },
                { provide: ReplaceDeviceService, useClass: ReplaceDeviceServiceStub },
                { provide: SwapDevicesService, useClass: SwapDevicesServiceStub },
                {
                    provide: ParticipantDetailsFormattingService,
                    useClass: ParticipantDetailsFormattingServiceStub,
                },
                { provide: PingDeviceService, useClass: PingDeviceServiceStub },
                { provide: ResetDeviceService, useClass: ResetDeviceServiceStub },
                { provide: OptOutService, useClass: OptOutServiceStub },
                {
                    provide: OAuthStorage,
                    useValue: {
                        getItem: jasmine.createSpy('getItem').and.returnValue(null),
                        setItem: jasmine.createSpy('setItem'),
                        removeItem: jasmine.createSpy('removeItem'),
                    },
                },
                provideNoopAnimations(),
                provideHttpClient(),
                provideHttpClientTesting(),
            ],
        }).compileComponents();
    });

    const setupComponent = (account: AccountSummary): ParticipantDetailsComponent => {
        fixture = TestBed.createComponent(ParticipantDetailsComponent);
        fixture.componentRef.setInput('index', 0);
        fixture.componentRef.setInput('total', 1);
        fixture.componentRef.setInput('account', account);
        fixture.detectChanges();
        return fixture.componentInstance;
    };

    it('surfaces base info rows and defaults reported VIN when device has not been assigned', () => {
        const component = setupComponent(createAccount());

        expect(component.baseInfoRows().map((row) => row.label)).toEqual([
            'Status',
            'Enrollment Date',
            'Change Date',
            'Vehicle',
            'Participant ID',
            'Scoring Algorithm',
        ]);
        const deviceRows = component.deviceInfoRows();
        expect(deviceRows.map((row) => row.label)).toEqual(['Device Type']);
        const scoringRow = component
            .baseInfoRows()
            .find((row) => row.label === 'Scoring Algorithm');
        expect(scoringRow?.value).toBe('2020 OBD2');
        expect(component.returnInfoRows()).toEqual([]);
    });

    it('surfaces edit actions within a general submenu', () => {
        const component = setupComponent(createAccount());

        const menuActions = component.menuActions();
        expect(menuActions.map((action) => action.label)).toEqual(['General']);
        const generalMenu = menuActions.find((action) => action.label === 'General');

        expect(generalMenu).toBeDefined();
        expect(generalMenu?.children?.map((child) => child.label)).toEqual([
            'Edit Nickname',
            'Edit Vehicle',
            'Opt Out',
            'View Trips'
        ]);
    });

    it('prefers nickname for header display and surfaces device fields once assigned', () => {
        const account = createAccount({
            driver: {
                nickname: 'Speedy Crossover',
                driverExternalId: null,
            },
            device: {
                deviceExperienceTypeCode: DeviceExperienceValue.get(DeviceExperience.Device) ?? 1,
                deviceSerialNumber: 'P12345678X',
                sim: '32439205832904829',
                deviceStatusCode: DeviceStatusValue.get(DeviceStatus.Assigned) ?? 3,
                deviceLocationCode: DeviceLocationValue.get(DeviceLocation.InVehicle) ?? 6,
                deviceManufacturer: 'Xirgo',
                deviceTypeDescription: 'Wireless H',
                reportedVIN: '1HGCM82633A004352',
                deviceShipDateTime: '2025-05-24T12:00:10Z',
                firstContactDateTime: '2025-05-27T16:17:10Z',
                lastContactDateTime: '2025-09-11T16:17:10Z',
                lastUploadDateTime: '2025-09-10T14:12:10Z',
            },
        });

        const component = setupComponent(account);

        expect(component.headerDisplayName()).toBe('Speedy Crossover');
        expect(component.deviceInfoRows().map((row) => row.label)).toEqual([
            'Device Serial Number',
            'SIM',
            'Device Status',
            'Device Location',
            'Device Manufacturer',
            'Device Type',
            'Device Reported VIN',
            'Device Ship Date',
            'First Contact Date',
            'Last Contact Date',
            'Last Upload Date',
        ]);
    });

    it('exposes return and abandon fields when applicable', () => {
        const account = createAccount({
            device: {
                deviceExperienceTypeCode: DeviceExperienceValue.get(DeviceExperience.Device) ?? 1,
                deviceSerialNumber: 'P12345678X',
                sim: '32439205832904829',
                deviceStatusCode: DeviceStatusValue.get(DeviceStatus.Assigned) ?? 3,
                deviceLocationCode: DeviceLocationValue.get(DeviceLocation.InVehicle) ?? 6,
                deviceManufacturer: 'Xirgo',
                deviceTypeDescription: 'Wireless H',
                reportedVIN: '1HGCM82633A004352',
                deviceReturnReasonCode:
                    DeviceReturnReasonCodeValue.get(DeviceReturnReasonCode.OptOut) ?? 1,
                deviceReceivedDateTime: '2025-09-12T09:12:10Z',
                deviceAbandonedDateTime: '2025-09-12T09:12:10Z',
            },
        });

        const component = setupComponent(account);

        expect(component.returnInfoRows().map((row) => row.label)).toEqual([
            'Return Reason',
            'Return Date',
            'Abandoned Date',
        ]);
    });

    it('surfaces mark actions when device can be abandoned or marked defective', () => {
        const account = createAccount({
            device: {
                deviceExperienceTypeCode: DeviceExperienceValue.get(DeviceExperience.Device) ?? 1,
                deviceSerialNumber: 'P12345678X',
                deviceStatusCode: DeviceStatusValue.get(DeviceStatus.Assigned) ?? 3,
                deviceReceivedDateTime: null,
                deviceAbandonedDateTime: null,
            },
        });

        const component = setupComponent(account);
        const plugInMenu = component.menuActions().find((action) => action.label === 'Plug-In');
        expect(plugInMenu?.children?.map((child) => child.label)).toEqual([
            'Swap Devices',
            'Replace Device',
            'Reset Device',
            'Mark Abandoned',
            'Mark Defective',
            'Ping Device'
        ]);
    });

    it('omits swap devices when no other eligible participants exist', () => {
        const swapService = TestBed.inject(SwapDevicesService) as unknown as SwapDevicesServiceStub;
        const previousCandidates = [...swapService.candidates];
        swapService.candidates = [];

        const account = createAccount({
            device: {
                deviceExperienceTypeCode: DeviceExperienceValue.get(DeviceExperience.Device) ?? 1,
                deviceSerialNumber: 'P12345678X',
                deviceStatusCode: DeviceStatusValue.get(DeviceStatus.Assigned) ?? 3,
            },
        });

        const component = setupComponent(account);
        const plugInMenu = component.menuActions().find((action) => action.label === 'Plug-In');
        expect(plugInMenu?.children?.map((child) => child.label)).toEqual([
            'Replace Device',
            'Reset Device',
            'Mark Abandoned',
            'Mark Defective',
            'Ping Device'
        ]);

        swapService.candidates = previousCandidates;
    });

    it('hides mark abandoned option when device already abandoned', () => {
        const account = createAccount({
            device: {
                deviceExperienceTypeCode: DeviceExperienceValue.get(DeviceExperience.Device) ?? 1,
                deviceSerialNumber: 'P12345678X',
                deviceStatusCode: DeviceStatusValue.get(DeviceStatus.Abandoned) ?? 4,
                deviceAbandonedDateTime: '2025-10-10T10:00:00Z',
            },
        });

        const component = setupComponent(account);
        const plugInMenu = component.menuActions().find((action) => action.label === 'Plug-In');
        expect(plugInMenu?.children?.map((child) => child.label)).toEqual([
            'Mark Defective'
        ]);
    });

    it('hides replace device when participant is not enrolled', () => {
        const account = createAccount({
            participant: {
                participantStatusCode: 2,
            },
            device: {
                deviceExperienceTypeCode: DeviceExperienceValue.get(DeviceExperience.Device) ?? 1,
                deviceSerialNumber: 'P12345678X',
                deviceStatusCode: DeviceStatusValue.get(DeviceStatus.Assigned) ?? 3,
            },
        });

        const component = setupComponent(account);
        const plugInMenu = component.menuActions().find((action) => action.label === 'Plug-In');
        expect(plugInMenu?.children?.map((child) => child.label)).toEqual([
            'Mark Abandoned',
            'Mark Defective'
        ]);
    });

    it('passes updated nickname to mark defective dialog', () => {
        const account = createAccount({
            driver: {
                nickname: 'Original Nick',
                driverExternalId: null,
            },
            device: {
                deviceExperienceTypeCode: DeviceExperienceValue.get(DeviceExperience.Device) ?? 1,
                deviceSerialNumber: 'P12345678X',
                deviceStatusCode: DeviceStatusValue.get(DeviceStatus.Assigned) ?? 3,
            },
        });

        const component = setupComponent(account);
        const markDefectiveService = TestBed.inject(
            MarkDefectiveService,
        ) as unknown as MarkDefectiveServiceStub;

        // any needed to access private field
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const contextSignal = (component as any).actionHandlerContext;
        contextSignal().onNicknameUpdate('Updated Nick');
        fixture.detectChanges();

        component.onActionClicked({
            id: 'mark-defective',
            label: 'Mark Defective',
            type: 'button',
            children: [],
        });

        expect(markDefectiveService.openMarkDefectiveDialog).toHaveBeenCalled();
        const args = markDefectiveService.openMarkDefectiveDialog.calls.mostRecent().args;
        expect(args[3]).toBe('Updated Nick');
    });

    it('passes updated nickname to mark abandoned dialog', () => {
        const account = createAccount({
            driver: {
                nickname: 'Original Nick',
                driverExternalId: null,
            },
            device: {
                deviceExperienceTypeCode: DeviceExperienceValue.get(DeviceExperience.Device) ?? 1,
                deviceSerialNumber: 'P12345678X',
                deviceStatusCode: DeviceStatusValue.get(DeviceStatus.Assigned) ?? 3,
                deviceAbandonedDateTime: null,
                deviceReceivedDateTime: null,
            },
        });

        const component = setupComponent(account);
        const markAbandonedService = TestBed.inject(
            MarkAbandonedService,
        ) as unknown as MarkAbandonedServiceStub;

        // any needed to access private field
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const contextSignal = (component as any).actionHandlerContext;
        contextSignal().onNicknameUpdate('Updated Nick');
        fixture.detectChanges();

        component.onActionClicked({
            id: 'mark-abandoned',
            label: 'Mark Abandoned',
            type: 'button',
            children: [],
        });

        expect(markAbandonedService.openMarkAbandonedDialog).toHaveBeenCalled();
        const args = markAbandonedService.openMarkAbandonedDialog.calls.mostRecent().args;
        expect(args[3]).toBe('Updated Nick');
    });

    it('invokes replace device service when action selected', () => {
        const account = createAccount({
            device: {
                deviceExperienceTypeCode: DeviceExperienceValue.get(DeviceExperience.Device) ?? 1,
                deviceSerialNumber: 'P12345678X',
                deviceStatusCode: DeviceStatusValue.get(DeviceStatus.Assigned) ?? 3,
            },
        });

        const component = setupComponent(account);
        const replaceService = TestBed.inject(
            ReplaceDeviceService,
        ) as unknown as ReplaceDeviceServiceStub;

        component.onActionClicked({
            id: 'replace-device',
            label: 'Replace Device',
            type: 'button',
            children: [],
        });

        expect(replaceService.openReplaceDeviceDialog).toHaveBeenCalled();
    });

    it('invokes swap devices service when action selected', () => {
        const account = createAccount({
            device: {
                deviceExperienceTypeCode: DeviceExperienceValue.get(DeviceExperience.Device) ?? 1,
                deviceSerialNumber: 'P12345678X',
                deviceStatusCode: DeviceStatusValue.get(DeviceStatus.Assigned) ?? 3,
            },
        });

        const component = setupComponent(account);
        const swapService = TestBed.inject(SwapDevicesService) as unknown as SwapDevicesServiceStub;

        component.onActionClicked({
            id: 'swap-devices',
            label: 'Swap Devices',
            type: 'button',
            children: [],
        });

        expect(swapService.openSwapDevicesDialog).toHaveBeenCalled();
    });
});
