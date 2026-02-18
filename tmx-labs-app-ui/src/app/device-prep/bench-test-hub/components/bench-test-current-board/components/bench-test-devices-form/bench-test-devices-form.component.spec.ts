import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { OAuthStorage } from 'angular-oauth2-oidc';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';

import { BenchTestDevicesFormComponent } from './bench-test-devices-form.component';
import { BenchTestDeviceService } from 'src/app/shared/services/api/bench-test/bench-test-device.service';
import {
    BenchTestBoardDevice,
    BenchTestBoardDeviceStatus,
    Board,
} from 'src/app/shared/data/bench-test/resources';
import { BenchTestBoardStatus } from 'src/app/shared/data/bench-test/enums';
import { Component } from '@angular/core';

// Test host component to test ControlValueAccessor
@Component({
    template: `
        <tmx-bench-test-devices-form
            [formControl]="devicesControl"
            [board]="board"
            [displayStatus]="displayStatus"
            [deviceStatuses]="deviceStatuses"
        ></tmx-bench-test-devices-form>
    `,
    imports: [BenchTestDevicesFormComponent, ReactiveFormsModule],
})
class TestHostComponent {
    devicesControl = new FormControl<BenchTestBoardDevice[]>([]);
    board: Board | null = null;
    displayStatus = false;
    deviceStatuses: BenchTestBoardDeviceStatus[] = [];
}

describe('BenchTestDevicesFormComponent', () => {
    let component: BenchTestDevicesFormComponent;
    let fixture: ComponentFixture<BenchTestDevicesFormComponent>;
    let mockBenchTestService: jasmine.SpyObj<BenchTestDeviceService>;

    const mockBoard: Board = {
        boardID: 1,
        name: 'Test Board',
        statusCode: BenchTestBoardStatus.Loading,
        userID: 'test-user',
        locationCode: 1,
    };

    const mockDevices: BenchTestBoardDevice[] = [
        { deviceSerialNumber: 'SN001', deviceLocationOnBoard: 1 },
        { deviceSerialNumber: 'SN002', deviceLocationOnBoard: 5 },
    ];

    const mockDeviceStatuses: BenchTestBoardDeviceStatus[] = [
        {
            boardID: 1,
            deviceSerialNumber: 'SN001',
            benchTestStatusCode: 1,
            description: 'Testing',
            displayPercent: 50,
        },
        {
            boardID: 1,
            deviceSerialNumber: 'SN002',
            benchTestStatusCode: 2,
            description: 'Complete',
            displayPercent: 100,
        },
    ];

    beforeEach(async () => {
        mockBenchTestService = jasmine.createSpyObj('BenchTestDeviceService', [
            'validateDeviceForBenchTest',
        ]);
        mockBenchTestService.validateDeviceForBenchTest.and.returnValue(
            of({ simActive: true, isAssigned: false })
        );

        await TestBed.configureTestingModule({
            imports: [BenchTestDevicesFormComponent],
            providers: [
                provideHttpClient(),
                {
                    provide: OAuthStorage,
                    useValue: jasmine.createSpyObj('OAuthStorage', [
                        'getItem',
                        'setItem',
                        'removeItem',
                    ]),
                },
                { provide: BenchTestDeviceService, useValue: mockBenchTestService },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(BenchTestDevicesFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Form Initialization', () => {
        it('should initialize form with 20 controls', () => {
            expect(component.devicesForm).toBeTruthy();
            expect(component.devicesForm.length).toBe(20);
        });

        it('should initialize all controls with empty strings', () => {
            component.devicesForm.controls.forEach((control) => {
                expect(control.value).toBe('');
            });
        });

        it('should set controls to update on blur', () => {
            const control = component.devicesForm.at(0);
            expect(control.updateOn).toBe('blur');
        });
    });

    describe('ControlValueAccessor - writeValue', () => {
        it('should write devices to correct positions', () => {
            component.writeValue(mockDevices);

            // Position 1 (index 0) should have SN001
            expect(component.devicesForm.at(0).value).toBe('SN001');
            // Position 5 (index 4) should have SN002
            expect(component.devicesForm.at(4).value).toBe('SN002');
            // Other positions should be empty
            expect(component.devicesForm.at(1).value).toBe('');
        });

        it('should handle null value gracefully', () => {
            component.writeValue(null as any);
            // Should not throw, form should remain unchanged
            expect(component.devicesForm.at(0).value).toBe('');
        });

        it('should handle empty array', () => {
            component.writeValue([]);
            component.devicesForm.controls.forEach((control) => {
                expect(control.value).toBe('');
            });
        });

        it('should ignore devices with missing position', () => {
            const devicesWithMissingPosition: BenchTestBoardDevice[] = [
                { deviceSerialNumber: 'SN001', deviceLocationOnBoard: null },
            ];
            component.writeValue(devicesWithMissingPosition);
            component.devicesForm.controls.forEach((control) => {
                expect(control.value).toBe('');
            });
        });
    });

    describe('ControlValueAccessor - registerOnChange', () => {
        it('should call onChange when form value changes', fakeAsync(() => {
            const onChangeSpy = jasmine.createSpy('onChange');
            component.registerOnChange(onChangeSpy);

            component.devicesForm.at(0).setValue('NEW_SERIAL');
            tick();

            expect(onChangeSpy).toHaveBeenCalled();
            const calledWith = onChangeSpy.calls.mostRecent().args[0];
            expect(calledWith).toContain(
                jasmine.objectContaining({
                    deviceSerialNumber: 'NEW_SERIAL',
                    deviceLocationOnBoard: 1,
                })
            );
        }));
    });

    describe('ControlValueAccessor - registerOnTouched', () => {
        it('should call onTouched when form value changes', fakeAsync(() => {
            const onTouchedSpy = jasmine.createSpy('onTouched');
            component.registerOnTouched(onTouchedSpy);

            component.devicesForm.at(0).setValue('SERIAL');
            tick();

            expect(onTouchedSpy).toHaveBeenCalled();
        }));
    });

    describe('ControlValueAccessor - setDisabledState', () => {
        it('should disable the form when called with true', () => {
            component.setDisabledState(true);
            expect(component.devicesForm.disabled).toBeTrue();
        });

        it('should enable the form when called with false', () => {
            component.setDisabledState(true);
            component.setDisabledState(false);
            expect(component.devicesForm.enabled).toBeTrue();
        });
    });

    describe('Validator - validate', () => {
        it('should return null when form is valid', () => {
            expect(component.validate()).toBeNull();
        });

        it('should return error when form is invalid', () => {
            // Make a control invalid by setting an error
            component.devicesForm.at(0).setErrors({ someError: true });
            expect(component.validate()).toEqual({ invalidDevices: true });
        });
    });

    describe('clear', () => {
        it('should reset all form controls', () => {
            component.writeValue(mockDevices);
            component.clear();

            component.devicesForm.controls.forEach((control) => {
                expect(control.value).toBe('');
            });
        });

        it('should call onChange with empty array', () => {
            const onChangeSpy = jasmine.createSpy('onChange');
            component.registerOnChange(onChangeSpy);

            component.clear();

            expect(onChangeSpy).toHaveBeenCalledWith([]);
        });
    });

    describe('getDeviceStatus', () => {
        it('should return status for existing device', fakeAsync(() => {
            // Set up devices in the form
            component.writeValue(mockDevices);
            tick();

            // Manually set the deviceStatuses input
            fixture.componentRef.setInput('deviceStatuses', mockDeviceStatuses);
            fixture.detectChanges();

            const status = component.getDeviceStatus(1);
            expect(status.percentage).toBe(50);
            expect(status.description).toBe('Testing');
        }));

        it('should return default status for non-existing device', () => {
            const status = component.getDeviceStatus(99);
            expect(status.percentage).toBe(0);
            expect(status.description).toBe('');
        });
    });

    describe('deviceStatusDict computed', () => {
        it('should map device statuses correctly', fakeAsync(() => {
            component.writeValue(mockDevices);
            tick();

            fixture.componentRef.setInput('deviceStatuses', mockDeviceStatuses);
            fixture.detectChanges();

            const dict = component.deviceStatusDict();

            expect(dict[1]).toEqual({ percentage: 50, description: 'Testing' });
            expect(dict[5]).toEqual({ percentage: 100, description: 'Complete' });
        }));

        it('should return empty object when no statuses', () => {
            fixture.componentRef.setInput('deviceStatuses', []);
            fixture.detectChanges();

            const dict = component.deviceStatusDict();
            expect(Object.keys(dict).length).toBe(0);
        });
    });

    describe('deviceUpdated output', () => {
        it('should emit when device becomes valid', fakeAsync(() => {
            const emitSpy = spyOn(component.deviceUpdated, 'emit');

            // Set a board to enable validation
            fixture.componentRef.setInput('board', mockBoard);
            fixture.detectChanges();
            flush();

            const control = component.devicesForm.at(0);
            
            // Set a value first  (updateOn: 'blur' so setValue doesn't trigger validation)
            control.setValue('VALID_SERIAL', { emitEvent: false });
            
            // Make the control invalid
            control.setErrors({ someError: true });
            fixture.detectChanges();
            flush();

            // Clear errors to transition to valid state
            control.setErrors(null);
            fixture.detectChanges();
            flush();

            // The emit should be called with position 1 (index 0 + 1)
            expect(emitSpy).toHaveBeenCalledWith({ position: 1 });
        }));
    });

    describe('formValueToDevices (via onChange)', () => {
        it('should filter out empty serial numbers', fakeAsync(() => {
            const onChangeSpy = jasmine.createSpy('onChange');
            component.registerOnChange(onChangeSpy);

            // Set only one device
            component.devicesForm.at(2).setValue('SN003');
            tick();

            const calledWith = onChangeSpy.calls.mostRecent().args[0] as BenchTestBoardDevice[];
            expect(calledWith.length).toBe(1);
            expect(calledWith[0].deviceSerialNumber).toBe('SN003');
            expect(calledWith[0].deviceLocationOnBoard).toBe(3); // index 2 + 1
        }));

        it('should convert 0-based index to 1-based position', fakeAsync(() => {
            const onChangeSpy = jasmine.createSpy('onChange');
            component.registerOnChange(onChangeSpy);

            component.devicesForm.at(0).setValue('FIRST');
            component.devicesForm.at(19).setValue('LAST');
            tick();

            const calledWith = onChangeSpy.calls.mostRecent().args[0] as BenchTestBoardDevice[];
            const firstDevice = calledWith.find((d) => d.deviceSerialNumber === 'FIRST');
            const lastDevice = calledWith.find((d) => d.deviceSerialNumber === 'LAST');

            expect(firstDevice?.deviceLocationOnBoard).toBe(1);
            expect(lastDevice?.deviceLocationOnBoard).toBe(20);
        }));
    });
});

describe('BenchTestDevicesFormComponent with Host', () => {
    let hostFixture: ComponentFixture<TestHostComponent>;
    let hostComponent: TestHostComponent;
    let mockBenchTestService: jasmine.SpyObj<BenchTestDeviceService>;

    beforeEach(async () => {
        mockBenchTestService = jasmine.createSpyObj('BenchTestDeviceService', [
            'validateDeviceForBenchTest',
        ]);
        mockBenchTestService.validateDeviceForBenchTest.and.returnValue(
            of({ simActive: true, isAssigned: false })
        );

        await TestBed.configureTestingModule({
            imports: [TestHostComponent],
            providers: [
                provideHttpClient(),
                {
                    provide: OAuthStorage,
                    useValue: jasmine.createSpyObj('OAuthStorage', [
                        'getItem',
                        'setItem',
                        'removeItem',
                    ]),
                },
                { provide: BenchTestDeviceService, useValue: mockBenchTestService },
            ],
        }).compileComponents();

        hostFixture = TestBed.createComponent(TestHostComponent);
        hostComponent = hostFixture.componentInstance;
        hostFixture.detectChanges();
    });

    it('should sync form control value with component', fakeAsync(() => {
        const devices: BenchTestBoardDevice[] = [
            { deviceSerialNumber: 'HOST_SN', deviceLocationOnBoard: 3 },
        ];

        hostComponent.devicesControl.setValue(devices);
        hostFixture.detectChanges();
        tick();

        // The internal form should reflect the value
        const devicesFormComponent = hostFixture.debugElement.children[0].componentInstance as BenchTestDevicesFormComponent;
        expect(devicesFormComponent.devicesForm.at(2).value).toBe('HOST_SN');
    }));

    it('should propagate disabled state from form control', fakeAsync(() => {
        hostComponent.devicesControl.disable();
        hostFixture.detectChanges();
        tick();

        const devicesFormComponent = hostFixture.debugElement.children[0].componentInstance as BenchTestDevicesFormComponent;
        expect(devicesFormComponent.devicesForm.disabled).toBeTrue();
    }));
});
