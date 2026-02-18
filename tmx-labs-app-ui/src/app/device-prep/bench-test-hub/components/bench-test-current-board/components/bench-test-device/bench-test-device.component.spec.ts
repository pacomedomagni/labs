import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { BenchTestDeviceComponent } from './bench-test-device.component';
import { BenchTestLoadingColorService } from './services/bench-test-loading-color.service';

// Test host component to test ControlValueAccessor
@Component({
    template: `
        <tmx-bench-test-device
            [formControl]="deviceControl"
            [displayStatus]="displayStatus"
            [displayLoadingPlaceholder]="displayLoadingPlaceholder"
            [loadingText]="loadingText"
            [progress]="progress"
        ></tmx-bench-test-device>
    `,
    imports: [BenchTestDeviceComponent, ReactiveFormsModule],
})
class TestHostComponent {
    deviceControl = new FormControl<string>('');
    displayStatus = true;
    displayLoadingPlaceholder = false;
    loadingText: string | null = null;
    progress = 0;
}

describe('BenchTestDeviceComponent', () => {
    let component: BenchTestDeviceComponent;
    let fixture: ComponentFixture<BenchTestDeviceComponent>;
    let mockLoadingColorService: jasmine.SpyObj<BenchTestLoadingColorService>;

    beforeEach(async () => {
        mockLoadingColorService = jasmine.createSpyObj('BenchTestLoadingColorService', [
            'getStatusColorClass',
        ]);
        mockLoadingColorService.getStatusColorClass.and.returnValue('bg-gray-300');

        await TestBed.configureTestingModule({
            imports: [BenchTestDeviceComponent, BrowserAnimationsModule],
            providers: [
                { provide: BenchTestLoadingColorService, useValue: mockLoadingColorService },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(BenchTestDeviceComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Initialization', () => {
        it('should initialize deviceControl with empty string', () => {
            expect(component.deviceControl.value).toBe('');
        });

        it('should create errorStateMatcher on init', () => {
            expect(component.errorStateMatcher).toBeDefined();
        });

        it('should get NgControl from injector on init', () => {
            expect(component.ngControl).toBeDefined();
        });
    });

    describe('ControlValueAccessor - writeValue', () => {
        it('should update deviceControl value', () => {
            component.writeValue('TEST_SERIAL');
            expect(component.deviceControl.value).toBe('TEST_SERIAL');
        });

        it('should not emit event when writing value', () => {
            const emitSpy = spyOn(component.deviceControl, 'setValue').and.callThrough();
            component.writeValue('SERIAL');
            expect(emitSpy).toHaveBeenCalledWith('SERIAL', { emitEvent: false });
        });

        it('should handle null value', () => {
            component.writeValue('SERIAL');
            component.writeValue(null);
            expect(component.deviceControl.value).toBeNull();
        });
    });

    describe('ControlValueAccessor - registerOnChange', () => {
        it('should call onChange when deviceControl value changes', fakeAsync(() => {
            const onChangeSpy = jasmine.createSpy('onChange');
            component.registerOnChange(onChangeSpy);

            component.deviceControl.setValue('NEW_VALUE');
            tick();

            expect(onChangeSpy).toHaveBeenCalledWith('NEW_VALUE');
        }));
    });

    describe('ControlValueAccessor - registerOnTouched', () => {
        it('should call onTouched when onBlur is called', () => {
            const onTouchedSpy = jasmine.createSpy('onTouched');
            component.registerOnTouched(onTouchedSpy);

            component.onBlur();

            expect(onTouchedSpy).toHaveBeenCalled();
        });
    });

    describe('ControlValueAccessor - setDisabledState', () => {
        it('should disable deviceControl when isDisabled is true', () => {
            component.setDisabledState(true);
            expect(component.deviceControl.disabled).toBeTrue();
        });

        it('should enable deviceControl when isDisabled is false', () => {
            component.setDisabledState(true);
            component.setDisabledState(false);
            expect(component.deviceControl.enabled).toBeTrue();
        });

        it('should not emit event when changing disabled state', () => {
            const disableSpy = spyOn(component.deviceControl, 'disable').and.callThrough();
            component.setDisabledState(true);
            expect(disableSpy).toHaveBeenCalledWith({ emitEvent: false });
        });
    });

    describe('getLoadingColorClass', () => {
        it('should call BenchTestLoadingColorService with loadingText', () => {
            fixture.componentRef.setInput('loadingText', 'Testing');
            fixture.detectChanges();

            const result = component.getLoadingColorClass();

            expect(mockLoadingColorService.getStatusColorClass).toHaveBeenCalledWith('Testing');
            expect(result).toBe('bg-gray-300');
        });

        it('should return empty string when service returns null', () => {
            mockLoadingColorService.getStatusColorClass.and.returnValue(null);
            fixture.componentRef.setInput('loadingText', 'Unknown');
            fixture.detectChanges();

            const result = component.getLoadingColorClass();

            expect(result).toBe('');
        });
    });

    describe('hasError', () => {
        it('should return false when ngControl is null', () => {
            component.ngControl = null;
            expect(component.hasError('required')).toBeFalse();
        });

        it('should return false when control has no errors', () => {
            if (component.ngControl?.control) {
                component.ngControl.control.setErrors(null);
                expect(component.hasError('required')).toBeFalse();
            }
        });

        it('should return false when control is untouched', () => {
            if (component.ngControl?.control) {
                component.ngControl.control.setErrors({ required: true });
                component.ngControl.control.markAsUntouched();
                expect(component.hasError('required')).toBeFalse();
            }
        });

        it('should return true when control has error and is touched', () => {
            if (component.ngControl?.control) {
                component.ngControl.control.setErrors({ required: true });
                component.ngControl.control.markAsTouched();
                expect(component.hasError('required')).toBeTrue();
            }
        });
    });

    describe('errors getter', () => {
        it('should return control errors when ngControl exists', () => {
            if (component.ngControl?.control) {
                const testErrors = { required: true };
                component.ngControl.control.setErrors(testErrors);
                expect(component.errors).toEqual(testErrors);
            }
        });

        it('should return null when control has no errors', () => {
            if (component.ngControl?.control) {
                component.ngControl.control.setErrors(null);
                expect(component.errors).toBeNull();
            }
        });
    });

    describe('Input signals', () => {
        it('should accept displayLoadingPlaceholder input', () => {
            fixture.componentRef.setInput('displayLoadingPlaceholder', true);
            fixture.detectChanges();
            expect(component.displayLoadingPlaceholder()).toBeTrue();
        });

        it('should accept displayStatus input', () => {
            fixture.componentRef.setInput('displayStatus', false);
            fixture.detectChanges();
            expect(component.displayStatus()).toBeFalse();
        });

        it('should accept loadingText input', () => {
            fixture.componentRef.setInput('loadingText', 'Loading...');
            fixture.detectChanges();
            expect(component.loadingText()).toBe('Loading...');
        });

        it('should accept progress input', () => {
            fixture.componentRef.setInput('progress', 75);
            fixture.detectChanges();
            expect(component.progress()).toBe(75);
        });
    });
});

describe('BenchTestDeviceComponent with Host', () => {
    let hostFixture: ComponentFixture<TestHostComponent>;
    let hostComponent: TestHostComponent;
    let deviceComponent: BenchTestDeviceComponent;
    let mockLoadingColorService: jasmine.SpyObj<BenchTestLoadingColorService>;

    beforeEach(async () => {
        mockLoadingColorService = jasmine.createSpyObj('BenchTestLoadingColorService', [
            'getStatusColorClass',
        ]);
        mockLoadingColorService.getStatusColorClass.and.returnValue('bg-gray-300');

        await TestBed.configureTestingModule({
            imports: [TestHostComponent, BrowserAnimationsModule],
            providers: [
                { provide: BenchTestLoadingColorService, useValue: mockLoadingColorService },
            ],
        }).compileComponents();

        hostFixture = TestBed.createComponent(TestHostComponent);
        hostComponent = hostFixture.componentInstance;
        hostFixture.detectChanges();

        deviceComponent = hostFixture.debugElement.children[0]
            .componentInstance as BenchTestDeviceComponent;
    });

    it('should sync form control value with component', fakeAsync(() => {
        hostComponent.deviceControl.setValue('HOST_SERIAL');
        hostFixture.detectChanges();
        tick();

        expect(deviceComponent.deviceControl.value).toBe('HOST_SERIAL');
    }));

    it('should propagate changes from device component to form control', fakeAsync(() => {
        deviceComponent.deviceControl.setValue('DEVICE_SERIAL');
        tick();

        expect(hostComponent.deviceControl.value).toBe('DEVICE_SERIAL');
    }));

    it('should propagate disabled state from form control', fakeAsync(() => {
        hostComponent.deviceControl.disable();
        hostFixture.detectChanges();
        tick();

        expect(deviceComponent.deviceControl.disabled).toBeTrue();
    }));

    it('should display loading bar when loadingText is provided', () => {
        hostComponent.deviceControl.setValue('SERIAL123');
        hostComponent.loadingText = 'Testing in progress';
        hostComponent.progress = 50;
        hostComponent.displayStatus = true;
        hostFixture.detectChanges();

        const compiled = hostFixture.nativeElement;
        const loadingBar = compiled.querySelector('.relative.h-8.outline');

        expect(loadingBar).toBeTruthy();
        expect(loadingBar.textContent.trim()).toContain('Testing in progress');
    });

    it('should display loading placeholder when enabled and no loadingText', () => {
        hostComponent.deviceControl.setValue('SERIAL123');
        hostComponent.displayStatus = true;
        hostComponent.displayLoadingPlaceholder = true;
        hostComponent.loadingText = null;
        hostFixture.detectChanges();

        const compiled = hostFixture.nativeElement;
        const placeholder = compiled.querySelector('.animate-pulse');

        expect(placeholder).toBeTruthy();
    });

    it('should not display loading bar when no device value', () => {
        hostComponent.deviceControl.setValue('');
        hostComponent.loadingText = 'Testing';
        hostComponent.displayStatus = true;
        hostFixture.detectChanges();

        const compiled = hostFixture.nativeElement;
        const loadingBar = compiled.querySelector('.relative.h-8.outline');

        expect(loadingBar).toBeFalsy();
    });

    it('should display error messages for validation errors', () => {
        hostComponent.deviceControl.setValue('INVALID');
        hostComponent.deviceControl.setErrors({ notFound: { message: 'Device not found' } });
        hostComponent.deviceControl.markAsTouched();
        hostFixture.detectChanges();

        const compiled = hostFixture.nativeElement;
        const errorElement = compiled.querySelector('mat-error');

        expect(errorElement).toBeTruthy();
        expect(errorElement.textContent).toContain('Device not found');
    });

    it('should apply progress percentage to loading bar width', () => {
        hostComponent.deviceControl.setValue('SERIAL123');
        hostComponent.loadingText = 'Testing';
        hostComponent.progress = 75;
        hostComponent.displayStatus = true;
        hostFixture.detectChanges();

        const compiled = hostFixture.nativeElement;
        const progressBar = compiled.querySelector('.absolute.top-0.left-0.h-full');

        expect(progressBar).toBeTruthy();
        expect(progressBar.style.width).toBe('75%');
    });
});

describe('ParentErrorStateMatcher', () => {
    let component: BenchTestDeviceComponent;
    let fixture: ComponentFixture<BenchTestDeviceComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [BenchTestDeviceComponent, BrowserAnimationsModule],
        }).compileComponents();

        fixture = TestBed.createComponent(BenchTestDeviceComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should return true when control is invalid and touched', () => {
        if (component.ngControl?.control) {
            component.ngControl.control.setErrors({ required: true });
            component.ngControl.control.markAsTouched();

            const isError = component.errorStateMatcher.isErrorState();
            expect(isError).toBeTrue();
        }
    });

    it('should return false when control is invalid but untouched', () => {
        if (component.ngControl?.control) {
            component.ngControl.control.setErrors({ required: true });
            component.ngControl.control.markAsUntouched();

            const isError = component.errorStateMatcher.isErrorState();
            expect(isError).toBeFalse();
        }
    });

    it('should return false when control is valid', () => {
        if (component.ngControl?.control) {
            component.ngControl.control.setErrors(null);
            component.ngControl.control.markAsTouched();

            const isError = component.errorStateMatcher.isErrorState();
            expect(isError).toBeFalse();
        }
    });
});
