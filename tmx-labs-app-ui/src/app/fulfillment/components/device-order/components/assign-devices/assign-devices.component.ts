import {
    Component,
    output,
    inject,
    viewChildren,
    effect,
    ElementRef,
    model,
    computed,
    untracked,
    DestroyRef,
} from '@angular/core';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
    ReactiveFormsModule,
    FormControl,
    FormArray,
    Validators,
    AbstractControl,
} from '@angular/forms';
import { filter, take, map } from 'rxjs/operators';
import { AssignDevicesValidators } from './assign-devices.validators';
import { OrderVehicleDetails } from 'src/app/shared/data/vehicle/resources';
import { FulfillmentService } from 'src/app/shared/services/api/fulfillment/fulfillment.services';
import { Observable } from 'rxjs';

@Component({
    selector: 'tmx-assign-devices',
    standalone: true,
    imports: [CommonModule, MatInputModule, MatFormFieldModule, ReactiveFormsModule],
    templateUrl: './assign-devices.component.html',
    styleUrl: './assign-devices.component.scss',
})
export class AssignDevicesComponent {
    private fulfillmentService = inject(FulfillmentService);
    private destroyRef = inject(DestroyRef);

    vehicles = model.required<OrderVehicleDetails[]>();
    /**
     * Emits when the last row's device has been validated (true if the device was scanned in, false if manually entered).
     */
    lastRowValidated = output<boolean>();

    private formArray = new FormArray<FormControl<string | null>>([]);
    private hasInitiallyFocused = false;
    private inputs = viewChildren<ElementRef<HTMLInputElement>>('deviceInput');
    private wasScanned = false; // Track if Enter/Tab was pressed

    // Expose readonly control for stepper integration
    get stepControl(): AbstractControl {
        return this.formArray;
    }

    // Reactive validity signal for cleaner parent access
    valid = toSignal(this.formArray.statusChanges.pipe(map(() => this.formArray.valid)), {
        initialValue: true,
    });

    vehicleOrderDetails = computed(() => {
        return this.vehicles().map((v) => v.deviceOrderDetailSeqID);
    });

    constructor() {
        // Initialize controls when new list of vehicles is set
        effect(() => {
            // Trigger only when vehicle list changes, not when properties update
            this.vehicleOrderDetails();
            const vehicles = untracked(() => this.vehicles());
            const currentLength = this.formArray.length;

            // Add new controls if needed
            if (vehicles.length > currentLength) {
                for (let i = currentLength; i < vehicles.length; i++) {
                    const vehicle = vehicles[i];
                    const control = new FormControl(vehicle.deviceSerialNumber || '', {
                        validators: [
                            Validators.required,
                            Validators.minLength(3),
                            AssignDevicesValidators.uniqueDevice(this.formArray),
                        ],
                        asyncValidators: [
                            AssignDevicesValidators.validateDeviceSerialNumber(
                                this.fulfillmentService,
                            ),
                        ],
                        updateOn: 'blur',
                    });
                    this.formArray.push(control);
                }
            }
            // Remove excess controls if needed
            else if (vehicles.length < currentLength) {
                for (let i = currentLength - 1; i >= vehicles.length; i--) {
                    this.formArray.removeAt(i);
                }
            }
        });

        // Focus first input when controls are initialized
        effect(() => {
            const inputElements = this.inputs();
            if (!this.hasInitiallyFocused && inputElements.length > 0) {
                // Use setTimeout to ensure the DOM is ready before focusing
                setTimeout(() => {
                    inputElements[0].nativeElement.focus();
                }, 0);
                this.hasInitiallyFocused = true;
            }
        });
    }

    getFormControl(index: number): FormControl<string | null> {
        return this.formArray.at(index);
    }

    /** Handle Enter or Tab key press - most barcode scanners will one of these keys */
    handleBarcodeHotkey(input: HTMLInputElement): void {
        this.wasScanned = true;
        input.blur();
    }

    /** Handle manual input default blur event */
    formBlurred(vehicleIndex: number, lastRow: boolean) {
        const scanner = this.wasScanned;
        this.wasScanned = false; // Reset immediately

        const control = this.getFormControl(vehicleIndex);

        this.waitForValidation(control).subscribe((isValid) => {
            if (isValid) {
                this.updateVehicleDevice(vehicleIndex, control.value);
                if (lastRow) {
                    this.lastRowValidated.emit(scanner); // true if Enter, false if manual blur
                } else {
                    this.jumpToNextInput(vehicleIndex);
                }
            }
        });
    }

    /** Update the vehicle model with the new device serial number */
    private updateVehicleDevice(index: number, deviceSerialNumber: string | null): void {
        const vehicles = this.vehicles();
        const updatedVehicles = vehicles.map((vehicle, i) =>
            i === index ? { ...vehicle, deviceSerialNumber: deviceSerialNumber ?? '' } : vehicle,
        );
        this.vehicles.set(updatedVehicles);
    }

    /** Waits for FormControl to validate and returns if it is valid or not */
    waitForValidation(control: FormControl<string>): Observable<boolean> {
        // Wait for async validation to complete
        return control.statusChanges.pipe(
            filter((status) => status !== 'PENDING'),
            take(1),
            takeUntilDestroyed(this.destroyRef),
            map(() => control.valid),
        );
    }

    jumpToNextInput(currentIndex: number): void {
        const nextIndex = currentIndex + 1;
        const inputElements = this.inputs();

        if (nextIndex < inputElements.length) {
            // Use setTimeout to ensure the DOM is ready
            setTimeout(() => {
                inputElements[nextIndex].nativeElement.focus();
            }, 0);
        }
    }
}
