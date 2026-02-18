import {
    Component,
    computed,
    DestroyRef,
    effect,
    forwardRef,
    inject,
    input,
    output,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
    ControlValueAccessor,
    FormArray,
    FormControl,
    NG_VALIDATORS,
    NG_VALUE_ACCESSOR,
    ReactiveFormsModule,
    ValidationErrors,
    Validator,
} from '@angular/forms';
import {
    BenchTestBoardDevice,
    BenchTestBoardDeviceStatus,
    Board,
} from 'src/app/shared/data/bench-test/resources';
import { BenchTestDeviceService } from 'src/app/shared/services/api/bench-test/bench-test-device.service';
import { BenchTestDeviceComponent } from '../bench-test-device/bench-test-device.component';
import { deviceValidator } from './device-validator';
import { filter, map, pairwise, startWith } from 'rxjs';

interface DeviceStatus {
    percentage: number;
    description: string;
}

@Component({
    selector: 'tmx-bench-test-devices-form',
    imports: [BenchTestDeviceComponent, ReactiveFormsModule],
    templateUrl: './bench-test-devices-form.component.html',
    styleUrl: './bench-test-devices-form.component.scss',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => BenchTestDevicesFormComponent),
            multi: true,
        },
        {
            provide: NG_VALIDATORS,
            useExisting: forwardRef(() => BenchTestDevicesFormComponent),
            multi: true,
        },
    ],
})
export class BenchTestDevicesFormComponent implements ControlValueAccessor, Validator {
    private static readonly MAX_DEVICES = 20;

    // Form
    devicesForm!: FormArray<FormControl<string>>;

    // Inputs
    public board = input<Board>(null);
    private boardId = computed(() => this.board()?.boardID);

    /** Whether or not to display the loading placeholder while awaiting status */
    public displayLoadingPlaceholder = input<boolean>(true);
    public displayStatus = input<boolean>(false);
    public deviceStatuses = input<BenchTestBoardDeviceStatus[]>([]);

    // Outputs
    /** Emits when a device is updated with a valid serial number */
    public deviceUpdated = output<{ position: number }>();
    /** Emits when a device is removed */
    public deviceRemoved = output<{ position: number }>();

    // Services
    private destroyRef = inject(DestroyRef);
    private benchTestService = inject(BenchTestDeviceService);

    public deviceStatusDict = computed<Record<number, DeviceStatus>>(() => {
        const statuses = this.deviceStatuses();
        const statusMap: Record<number, DeviceStatus> = {};
        const currentDevices = this.formValueToDevices(this.devicesForm?.value || []);
        currentDevices.forEach((device) => {
            if (
                device.deviceLocationOnBoard &&
                device.deviceLocationOnBoard >= 1 &&
                device.deviceLocationOnBoard <= 20
            ) {
                const status = statuses.find(
                    (s) => s.deviceSerialNumber === device.deviceSerialNumber,
                );
                if (status) {
                    statusMap[device.deviceLocationOnBoard] = {
                        percentage: status.displayPercent || 0,
                        description: status.description || '',
                    };
                }
            }
        });
        return statusMap;
    });

    // ControlValueAccessor
    private onChange: (value: BenchTestBoardDevice[]) => void = () => {};
    private onTouched: () => void = () => {};
    private onValidatorChange: () => void = () => {};
    private pendingValue: BenchTestBoardDevice[] | null = null;

    constructor() {
        this.initializeForm();
    }

    // Public methods
    getDeviceStatus(position: number): DeviceStatus {
        return this.deviceStatusDict()[position] || { percentage: 0, description: '' };
    }

    clear(): void {
        this.devicesForm.reset();
        this.onChange([]);
    }

    // ControlValueAccessor implementation
    writeValue(value: BenchTestBoardDevice[]): void {
        if (!value) {
            return;
        }

        // Control value accessor may set the value prior to the internal form being created
        // Save it here until it's created
        if (!this.devicesForm) {
            this.pendingValue = value;
            return;
        }

        const patchValues: string[] = new Array(BenchTestDevicesFormComponent.MAX_DEVICES).fill('');
        value.forEach((device) => {
            if (device.deviceLocationOnBoard && device.deviceSerialNumber) {
                // deviceLocationOnBoard is 1-based, array is 0-based
                const index = device.deviceLocationOnBoard - 1;
                patchValues[index] = device.deviceSerialNumber;
            }
        });

        this.devicesForm.patchValue(patchValues, { emitEvent: false });
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        if (isDisabled) {
            this.devicesForm?.disable({ emitEvent: false });
        } else {
            this.devicesForm?.enable({ emitEvent: false });
        }
    }

    // Validator implementation
    validate(): ValidationErrors | null {
        return this.devicesForm?.invalid ? { invalidDevices: true } : null;
    }

    registerOnValidatorChange(fn: () => void): void {
        this.onValidatorChange = fn;
    }

    // Private methods
    private initializeForm(): void {
        // Create form once with empty controls
        const controls: FormControl<string>[] = [];
        for (let i = 0; i < BenchTestDevicesFormComponent.MAX_DEVICES; i++) {
            controls.push(new FormControl('', { updateOn: 'blur', nonNullable: true }));
        }
        this.devicesForm = new FormArray(controls);

        // Subscribe to form changes once
        this.devicesForm.valueChanges
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((value) => {
                this.onChange(this.formValueToDevices(value));
                this.onTouched();
            });

        this.devicesForm.statusChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.onValidatorChange();
        });

        // Subscribe to each device's valid state changes once
        this.subscribeToDeviceValidation();

        // Apply pending value if set before form creation
        if (this.pendingValue) {
            this.writeValue(this.pendingValue);
            this.pendingValue = null;
        }

        // Update validators when board ID changes (not just any board property)
        let previousBoardId: number | null = null;
        effect(() => {
            const currentBoardId = this.boardId();

            // Only reset form if board ID actually changed, not if other properties changed
            if (previousBoardId !== currentBoardId) {
                this.devicesForm.reset();
                previousBoardId = currentBoardId;
            }

            const validator = currentBoardId
                ? deviceValidator(this.benchTestService, currentBoardId)
                : null;

            // Update validators for all controls
            this.devicesForm.controls.forEach((control) => {
                control.setAsyncValidators(validator ? [validator] : []);
                // control.updateValueAndValidity({ emitEvent: false });
            });
        });
    }

    /** Subscribes to status changes and emits an event when the field changes from invalid to valid and the valid state has a non-empty value */
    private subscribeToDeviceValidation(): void {
        this.devicesForm.controls.forEach((control, index) => {
            control.statusChanges
                .pipe(
                    startWith(control.status),
                    pairwise(),
                    filter(([prev, curr]) => prev !== 'VALID' && curr === 'VALID'),
                    map(() => control.value),
                    filter((value) => value !== '' && value !== null),
                    takeUntilDestroyed(this.destroyRef),
                )
                .subscribe(() => {
                    // Convert 0-based index to 1-based position
                    this.onDeviceValidated(index + 1);
                });
        });
    }

    private onDeviceValidated(position: number): void {
        this.deviceUpdated.emit({ position });
    }

    // Converts FormArray values to array of BenchTestBoardDevice for the consumer
    private formValueToDevices(formValue: string[]): BenchTestBoardDevice[] {
        return formValue
            .map((serialNumber, index) => ({
                deviceSerialNumber: serialNumber,
                // Convert 0-based index to 1-based position
                deviceLocationOnBoard: index + 1,
            }))
            .filter((device) => device.deviceSerialNumber) as BenchTestBoardDevice[];
    }
}
