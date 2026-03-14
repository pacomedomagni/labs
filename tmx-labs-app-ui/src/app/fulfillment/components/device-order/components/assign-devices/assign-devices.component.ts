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
import { ReactiveFormsModule, FormControl, FormArray, Validators, AbstractControl } from '@angular/forms';
import { filter, take, map } from 'rxjs/operators';
import { AssignDevicesValidators } from './assign-devices.validators';
import { OrderVehicleDetails } from 'src/app/shared/data/vehicle/resources';
import { FulfillmentService } from 'src/app/shared/services/api/fulfillment/fulfillment.services';

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
    lastRowValidated = output<void>();

    private formArray = new FormArray<FormControl<string | null>>([]);
    private hasInitiallyFocused = false;
    private inputs = viewChildren<ElementRef<HTMLInputElement>>('deviceInput');

    // Expose readonly control for stepper integration
    get stepControl(): AbstractControl {
        return this.formArray;
    }

    // Reactive validity signal for cleaner parent access
    valid = toSignal(this.formArray.statusChanges.pipe(map(() => this.formArray.valid)), {
        initialValue: true
    });

    vehicleOrderDetails = computed(() => {
        return this.vehicles().map(v => v.deviceOrderDetailSeqID);
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
                            AssignDevicesValidators.uniqueDevice(this.formArray)
                        ],
                        asyncValidators: [
                            AssignDevicesValidators.validateDeviceSerialNumber(this.fulfillmentService),
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

        effect(() => {
            const inputElements = this.inputs();
            if (!this.hasInitiallyFocused && inputElements.length > 0) {
                inputElements[0].nativeElement.focus();
                this.hasInitiallyFocused = true;
            }
        });
    }

    getFormControl(index: number): FormControl<string | null> {
        return this.formArray.at(index);
    }

    handleInput(
        vehicleIndex: number,
        isLastRow = false,
    ): void {
        const control = this.getFormControl(vehicleIndex);
        const value = control.value?.trim() || '';

        // Only revalidate other controls that have the same value (to clear duplicate errors)
        const normalizedValue = value.toLowerCase();
        this.formArray.controls.forEach((c, i) => {
            if (i !== vehicleIndex && c.value?.trim().toLowerCase() === normalizedValue) {
                c.updateValueAndValidity({ emitEvent: false });
            }
        });

        // Wait for async validation to complete
        control.statusChanges
            .pipe(
                filter((status) => status !== 'PENDING'),
                take(1),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe(() => {
                if (control.valid && value) {
                    const currentVehicles = this.vehicles();
                    const updatedVehicles = currentVehicles.map((vehicle, index) =>
                        index === vehicleIndex
                            ? { ...vehicle, deviceSerialNumber: value }
                            : vehicle,
                    );
                    this.vehicles.set(updatedVehicles);

                    if (isLastRow) {
                        this.lastRowValidated.emit();
                    } else {
                        this.jumpToNextInput(vehicleIndex);
                    }
                }
            });
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
