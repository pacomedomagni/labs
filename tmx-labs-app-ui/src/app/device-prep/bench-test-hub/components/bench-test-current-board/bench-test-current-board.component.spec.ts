import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { signal, WritableSignal } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError, Subject } from 'rxjs';

import { BenchTestCurrentBoardComponent } from './bench-test-current-board.component';
import { BenchTestDeviceService } from 'src/app/shared/services/api/bench-test/bench-test-device.service';
import { BenchTestDeviceStatusService } from './services/bench-test-device-status.service';
import { BenchTestActionsService } from '../../services/bench-test-actions.service';
import { BenchTestBoardService } from '../../services/bench-test-board.service';
import { NotificationBannerService } from 'src/app/shared/notifications/notification-banner/notification-banner.service';

import { BenchTestBoardStatus } from 'src/app/shared/data/bench-test/enums';
import { Board, BenchTestBoardDevice } from 'src/app/shared/data/bench-test/resources';

describe('BenchTestCurrentBoardComponent', () => {
    let component: BenchTestCurrentBoardComponent;
    let fixture: ComponentFixture<BenchTestCurrentBoardComponent>;
    let benchTestDeviceService: jasmine.SpyObj<BenchTestDeviceService>;
    let deviceStatusService: jasmine.SpyObj<BenchTestDeviceStatusService>;
    let deviceActionsService: jasmine.SpyObj<BenchTestActionsService>;
    let boardService: jasmine.SpyObj<BenchTestBoardService>;
    let selectedBoardSignal: WritableSignal<Board | undefined>;

    const mockBoard: Board = {
        boardID: 1,
        name: 'Test Board',
        statusCode: BenchTestBoardStatus.Loading,
        userID: 'test-user',
        locationCode: 100,
        deviceCount: 2
    };

    const mockDevices: BenchTestBoardDevice[] = [
        {
            deviceLocationOnBoard: 1,
            deviceSerialNumber: 'SN12345'
        },
        {
            deviceLocationOnBoard: 2,
            deviceSerialNumber: 'SN67890'
        }
    ];

    beforeEach(async () => {
        const deviceStatusSubject = new Subject();
        selectedBoardSignal = signal<Board | undefined>(undefined);

        const benchTestDeviceServiceSpy = jasmine.createSpyObj('BenchTestDeviceService', [
            'getAllDevicesByBoard',
            'removeBenchTestDeviceFromBoard',
            'saveBenchTestDeviceToBoard',
            'validateDeviceForBenchTest'
        ]);

        const deviceStatusServiceSpy = jasmine.createSpyObj('BenchTestDeviceStatusService', [
            'startPolling',
            'stopPolling',
            'fetchDeviceStatuses',
            'resetAutoStopTimer'
        ], {
            deviceStatuses$: deviceStatusSubject.asObservable()
        });

        const deviceActionsServiceSpy = jasmine.createSpyObj('BenchTestActionsService', [
            'runTest',
            'stopTest',
            'clearBoard'
        ]);

        const notificationServiceSpy = jasmine.createSpyObj('NotificationBannerService', [
            'success',
            'error'
        ]);

        const boardServiceSpy = jasmine.createSpyObj('BenchTestBoardService', [
            'incrementDeviceCount',
            'decrementDeviceCount'
        ], {
            selectedBoard: selectedBoardSignal
        });

        await TestBed.configureTestingModule({
            imports: [BenchTestCurrentBoardComponent, NoopAnimationsModule],
            providers: [
                { provide: BenchTestDeviceService, useValue: benchTestDeviceServiceSpy },
                { provide: BenchTestDeviceStatusService, useValue: deviceStatusServiceSpy },
                { provide: BenchTestActionsService, useValue: deviceActionsServiceSpy },
                { provide: NotificationBannerService, useValue: notificationServiceSpy },
                { provide: BenchTestBoardService, useValue: boardServiceSpy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(BenchTestCurrentBoardComponent);
        component = fixture.componentInstance;
        benchTestDeviceService = TestBed.inject(BenchTestDeviceService) as jasmine.SpyObj<BenchTestDeviceService>;
        deviceStatusService = TestBed.inject(BenchTestDeviceStatusService) as jasmine.SpyObj<BenchTestDeviceStatusService>;
        deviceActionsService = TestBed.inject(BenchTestActionsService) as jasmine.SpyObj<BenchTestActionsService>;
        boardService = TestBed.inject(BenchTestBoardService) as jasmine.SpyObj<BenchTestBoardService>;

        benchTestDeviceService.getAllDevicesByBoard.and.returnValue(of({ devices: [], resultCount: 0 }));
        benchTestDeviceService.validateDeviceForBenchTest.and.returnValue(of({ isAssigned: false, simActive: true }));
        benchTestDeviceService.saveBenchTestDeviceToBoard.and.returnValue(of({ devices: [], resultCount: 0 }));
        benchTestDeviceService.removeBenchTestDeviceFromBoard.and.returnValue(of({ devices: [], resultCount: 0 }));
    });

    describe('Component Initialization', () => {
        it('should create', () => {
            expect(component).toBeTruthy();
        });

        it('should initialize with empty devices form control', () => {
            expect(component.devices.value).toEqual([]);
        });

        it('should have valid initial form state', () => {
            expect(component.devicesValidity()).toBe('VALID');
        });

        it('should inject all required services', () => {
            expect(component['benchTestDeviceService']).toBeDefined();
            expect(component['deviceStatusService']).toBeDefined();
            expect(component['deviceActionsService']).toBeDefined();
            expect(component['notificationService']).toBeDefined();
            expect(component['boardService']).toBeDefined();
        });
    });

    describe('Computed Properties - Status Display', () => {
        beforeEach(() => {
            fixture.detectChanges();
        });

        it('should compute selectedBoardId correctly', () => {
            selectedBoardSignal.set(mockBoard);
            fixture.detectChanges();

            expect(component.selectedBoardId()).toBe(1);
        });

        it('should return undefined when no board is selected', () => {
            selectedBoardSignal.set(undefined);
            fixture.detectChanges();

            expect(component.selectedBoardId()).toBeUndefined();
        });

        it('should compute selectedBoardStatusCode correctly', () => {
            selectedBoardSignal.set(mockBoard);
            fixture.detectChanges();

            expect(component.selectedBoardStatusCode()).toBe(BenchTestBoardStatus.Loading);
        });

        it('should return Unknown status when no board is selected', () => {
            selectedBoardSignal.set(undefined);
            fixture.detectChanges();

            expect(component.selectedBoardStatusCode()).toBe(BenchTestBoardStatus.Unknown);
        });

        it('should display status when status is not Unknown', () => {
            selectedBoardSignal.set(mockBoard);
            fixture.detectChanges();

            expect(component.shouldDisplayStatus()).toBeTrue();
        });

        it('should not display status when status is Unknown', () => {
            selectedBoardSignal.set({ ...mockBoard, statusCode: BenchTestBoardStatus.Unknown });
            fixture.detectChanges();

            expect(component.shouldDisplayStatus()).toBeFalse();
        });
    });

    describe('Computed Properties - State Checks', () => {
        beforeEach(() => {
            fixture.detectChanges();
        });

        it('should identify Running status correctly', () => {
            selectedBoardSignal.set({ ...mockBoard, statusCode: BenchTestBoardStatus.Running });
            fixture.detectChanges();

            expect(component.isRunning()).toBeTrue();
            expect(component.isComplete()).toBeFalse();
            expect(component.isLoading()).toBeFalse();
        });

        it('should identify Complete status correctly', () => {
            selectedBoardSignal.set({ ...mockBoard, statusCode: BenchTestBoardStatus.Complete });
            fixture.detectChanges();

            expect(component.isComplete()).toBeTrue();
            expect(component.isRunning()).toBeFalse();
            expect(component.isLoading()).toBeFalse();
        });

        it('should identify Loading status correctly', () => {
            selectedBoardSignal.set({ ...mockBoard, statusCode: BenchTestBoardStatus.Loading });
            fixture.detectChanges();

            expect(component.isLoading()).toBeTrue();
            expect(component.isRunning()).toBeFalse();
            expect(component.isComplete()).toBeFalse();
        });
    });

    describe('Computed Properties - Action Availability', () => {
        beforeEach(() => {
            selectedBoardSignal.set(mockBoard);
            fixture.detectChanges();
        });

        it('should allow run when board is Loading with valid devices', () => {
            component.devices.setValue(mockDevices);
            fixture.detectChanges();

            expect(component.canRun()).toBeTrue();
        });

        it('should not allow run when board has no devices', () => {
            component.devices.setValue([]);
            fixture.detectChanges();

            expect(component.canRun()).toBeFalse();
        });

        it('should not allow run when board is Running', () => {
            selectedBoardSignal.set({ ...mockBoard, statusCode: BenchTestBoardStatus.Running });
            component.devices.setValue(mockDevices);
            fixture.detectChanges();

            expect(component.canRun()).toBeFalse();
        });

        it('should allow clear board when Loading with devices', () => {
            component.devices.setValue(mockDevices);
            fixture.detectChanges();

            expect(component.canClearBoard()).toBeTrue();
        });

        it('should allow clear board when Complete with devices', () => {
            selectedBoardSignal.set({ ...mockBoard, statusCode: BenchTestBoardStatus.Complete });
            component.devices.setValue(mockDevices);
            fixture.detectChanges();

            expect(component.canClearBoard()).toBeTrue();
        });

        it('should not allow clear board when no devices', () => {
            component.devices.setValue([]);
            fixture.detectChanges();

            expect(component.canClearBoard()).toBeFalse();
        });

        it('should disable form when Running', () => {
            selectedBoardSignal.set({ ...mockBoard, statusCode: BenchTestBoardStatus.Running });
            fixture.detectChanges();

            expect(component.isDisabled()).toBeTrue();
        });

        it('should disable form when Complete', () => {
            selectedBoardSignal.set({ ...mockBoard, statusCode: BenchTestBoardStatus.Complete });
            fixture.detectChanges();

            expect(component.isDisabled()).toBeTrue();
        });

        it('should disable form when no board selected', () => {
            selectedBoardSignal.set(undefined);
            fixture.detectChanges();

            expect(component.isDisabled()).toBeTrue();
        });

        it('should enable form when Loading', () => {
            selectedBoardSignal.set({ ...mockBoard, statusCode: BenchTestBoardStatus.Loading });
            fixture.detectChanges();

            expect(component.isDisabled()).toBeFalse();
        });
    });

    describe('updateDevices', () => {
        beforeEach(() => {
            fixture.detectChanges();
        });

        it('should clear devices on error', fakeAsync(() => {
            benchTestDeviceService.getAllDevicesByBoard.and.returnValue(
                throwError(() => new Error('Failed to fetch'))
            );
            component.devices.setValue(mockDevices);

            selectedBoardSignal.set(mockBoard);
            fixture.detectChanges();
            tick();

            expect(component.devices.value).toEqual([]);
        }));
    });

    describe('Polling Effects', () => {
        beforeEach(() => {
            selectedBoardSignal.set(mockBoard);
            fixture.detectChanges();
        });

        it('should start polling when status changes to Running', () => {
            selectedBoardSignal.set({ ...mockBoard, statusCode: BenchTestBoardStatus.Running });
            fixture.detectChanges();

            expect(deviceStatusService.stopPolling).toHaveBeenCalled();
            expect(deviceStatusService.startPolling).toHaveBeenCalledWith(1);
        });

        it('should fetch statuses when status changes to Complete', () => {
            selectedBoardSignal.set({ ...mockBoard, statusCode: BenchTestBoardStatus.Complete });
            fixture.detectChanges();

            expect(deviceStatusService.stopPolling).toHaveBeenCalled();
            expect(deviceStatusService.fetchDeviceStatuses).toHaveBeenCalledWith(1);
        });

        it('should only stop polling when status is Loading', () => {
            selectedBoardSignal.set({ ...mockBoard, statusCode: BenchTestBoardStatus.Loading });
            fixture.detectChanges();

            expect(deviceStatusService.stopPolling).toHaveBeenCalled();
            expect(deviceStatusService.startPolling).not.toHaveBeenCalled();
            expect(deviceStatusService.fetchDeviceStatuses).not.toHaveBeenCalled();
        });
    });

    describe('Form Control State Effects', () => {
        beforeEach(() => {
            fixture.detectChanges();
        });

        it('should disable form when board is Running', () => {
            selectedBoardSignal.set({ ...mockBoard, statusCode: BenchTestBoardStatus.Running });
            fixture.detectChanges();

            expect(component.devices.disabled).toBeTrue();
        });

        it('should disable form when board is Complete', () => {
            selectedBoardSignal.set({ ...mockBoard, statusCode: BenchTestBoardStatus.Complete });
            fixture.detectChanges();

            expect(component.devices.disabled).toBeTrue();
        });

        it('should enable form when board is Loading', () => {
            selectedBoardSignal.set({ ...mockBoard, statusCode: BenchTestBoardStatus.Loading });
            fixture.detectChanges();

            expect(component.devices.disabled).toBeFalse();
        });

        it('should disable form when no board selected', () => {
            selectedBoardSignal.set(undefined);
            fixture.detectChanges();

            expect(component.devices.disabled).toBeTrue();
        });
    });

    describe('runTest', () => {
        beforeEach(() => {
            selectedBoardSignal.set(mockBoard);
            component.devices.setValue(mockDevices);
            fixture.detectChanges();
        });

        it('should not call runTest when no board selected', () => {
            selectedBoardSignal.set(undefined);
            fixture.detectChanges();

            component.runTest();

            expect(deviceActionsService.runTest).not.toHaveBeenCalled();
        });
    });

    describe('clearBoard', () => {
        beforeEach(() => {
            selectedBoardSignal.set(mockBoard);
            component.devices.setValue(mockDevices);
            fixture.detectChanges();
        });

        it('should call clearBoard action and clear devices on success', () => {
            deviceActionsService.clearBoard.and.returnValue(of(true));

            component.clearBoard();

            expect(deviceActionsService.clearBoard).toHaveBeenCalledWith(1);
            expect(component.devices.value).toEqual([]);
        });

        it('should not call clearBoard when no board selected', () => {
            selectedBoardSignal.set(undefined);
            fixture.detectChanges();

            component.clearBoard();

            expect(deviceActionsService.clearBoard).not.toHaveBeenCalled();
        });
    });

    describe('onDeviceRemoved', () => {
        beforeEach(() => {
            selectedBoardSignal.set({ ...mockBoard, statusCode: BenchTestBoardStatus.Loading });
            fixture.detectChanges();
        });

        it('should remove device from board when in Loading state', () => {
            spyOn(component, 'removeDeviceFromBoard');

            component.onDeviceRemoved({ position: 1 });

            expect(component.removeDeviceFromBoard).toHaveBeenCalledWith(1);
        });

        it('should not remove device when not in Loading state', () => {
            selectedBoardSignal.set({ ...mockBoard, statusCode: BenchTestBoardStatus.Running });
            fixture.detectChanges();
            spyOn(component, 'removeDeviceFromBoard');

            component.onDeviceRemoved({ position: 1 });

            expect(component.removeDeviceFromBoard).not.toHaveBeenCalled();
        });
    });

    describe('onDeviceUpdated', () => {
        beforeEach(() => {
            selectedBoardSignal.set({ ...mockBoard, statusCode: BenchTestBoardStatus.Loading });
            fixture.detectChanges();
        });

        it('should save device to board when in Loading state', () => {
            spyOn(component, 'saveDeviceToBoard');

            component.onDeviceUpdated({ position: 1 });

            expect(component.saveDeviceToBoard).toHaveBeenCalledWith(1);
        });

        it('should not save device when not in Loading state', () => {
            selectedBoardSignal.set({ ...mockBoard, statusCode: BenchTestBoardStatus.Complete });
            fixture.detectChanges();
            spyOn(component, 'saveDeviceToBoard');

            component.onDeviceUpdated({ position: 1 });

            expect(component.saveDeviceToBoard).not.toHaveBeenCalled();
        });
    });

    describe('removeDeviceFromBoard', () => {
        beforeEach(() => {
            selectedBoardSignal.set(mockBoard);
            fixture.detectChanges();
        });

        it('should call remove device API', () => {
            benchTestDeviceService.removeBenchTestDeviceFromBoard.and.returnValue(of({ devices: [], resultCount: 0 }));

            component.removeDeviceFromBoard(1);

            expect(benchTestDeviceService.removeBenchTestDeviceFromBoard).toHaveBeenCalledWith(1, 1);
        });

        it('should not call API when no board selected', () => {
            selectedBoardSignal.set(undefined);
            fixture.detectChanges();

            component.removeDeviceFromBoard(1);

            expect(benchTestDeviceService.removeBenchTestDeviceFromBoard).not.toHaveBeenCalled();
        });
    });

    describe('saveDeviceToBoard', () => {
        beforeEach(() => {
            selectedBoardSignal.set(mockBoard);
            component.devices.setValue(mockDevices);
            fixture.detectChanges();
        });

        it('should not save device when no board selected', () => {
            selectedBoardSignal.set(undefined);
            fixture.detectChanges();

            component.saveDeviceToBoard(1);

            expect(benchTestDeviceService.saveBenchTestDeviceToBoard).not.toHaveBeenCalled();
        });

        it('should not save device when device not found at position', () => {
            component.saveDeviceToBoard(999);

            expect(benchTestDeviceService.saveBenchTestDeviceToBoard).not.toHaveBeenCalled();
        });

        it('should not save device with empty serial number', () => {
            const devicesWithEmpty = [
                { ...mockDevices[0], deviceSerialNumber: '' },
                mockDevices[1]
            ];
            component.devices.setValue(devicesWithEmpty);
            fixture.detectChanges();

            component.saveDeviceToBoard(1);

            expect(benchTestDeviceService.saveBenchTestDeviceToBoard).not.toHaveBeenCalled();
        });

        it('should not save device with whitespace-only serial number', () => {
            const devicesWithWhitespace = [
                { ...mockDevices[0], deviceSerialNumber: '   ' },
                mockDevices[1]
            ];
            component.devices.setValue(devicesWithWhitespace);
            fixture.detectChanges();

            component.saveDeviceToBoard(1);

            expect(benchTestDeviceService.saveBenchTestDeviceToBoard).not.toHaveBeenCalled();
        });

        it('should not increment count on error', () => {
            benchTestDeviceService.saveBenchTestDeviceToBoard.and.returnValue(
                throwError(() => new Error('Failed'))
            );

            component.saveDeviceToBoard(1);

            expect(boardService.incrementDeviceCount).not.toHaveBeenCalled();
        });
    });

    describe('onMouseMove', () => {
        it('should reset auto stop timer on mouse move', () => {
            component.onMouseMove();

            expect(deviceStatusService.resetAutoStopTimer).toHaveBeenCalled();
        });
    });

    describe('Edge Cases and Integration', () => {
        it('should handle board status transitions', () => {
            selectedBoardSignal.set({ ...mockBoard, statusCode: BenchTestBoardStatus.Loading });
            fixture.detectChanges();

            expect(component.devices.disabled).toBeFalse();

            selectedBoardSignal.set({ ...mockBoard, statusCode: BenchTestBoardStatus.Running });
            fixture.detectChanges();

            expect(component.devices.disabled).toBeTrue();
            expect(deviceStatusService.startPolling).toHaveBeenCalled();

            selectedBoardSignal.set({ ...mockBoard, statusCode: BenchTestBoardStatus.Complete });
            fixture.detectChanges();

            expect(component.devices.disabled).toBeTrue();
            expect(deviceStatusService.fetchDeviceStatuses).toHaveBeenCalled();
        });

        it('should maintain form validity across board changes', () => {
            component.devices.setValue(mockDevices);
            selectedBoardSignal.set(mockBoard);
            fixture.detectChanges();

            expect(component.devicesValidity()).toBe('VALID');

            selectedBoardSignal.set({ ...mockBoard, boardID: 2 });
            fixture.detectChanges();

            expect(component.devicesValidity()).toBe('VALID');
        });
    });
});
