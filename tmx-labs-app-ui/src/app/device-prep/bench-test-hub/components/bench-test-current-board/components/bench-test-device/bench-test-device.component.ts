import { CommonModule } from '@angular/common';
import {
    Component,
    DestroyRef,
    forwardRef,
    inject,
    Injector,
    input,
    OnInit,
    output,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
    ControlValueAccessor,
    FormControl,
    NG_VALUE_ACCESSOR,
    NgControl,
    ReactiveFormsModule,
    ValidationErrors,
} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { BenchTestLoadingColorService } from './services/bench-test-loading-color.service';

class ParentErrorStateMatcher implements ErrorStateMatcher {
    constructor(private component: BenchTestDeviceComponent) {}

    isErrorState(): boolean {
        const control = this.component.ngControl?.control;
        return !!(control?.invalid && control?.touched);
    }
}

@Component({
    selector: 'tmx-bench-test-device',
    imports: [MatInputModule, CommonModule, ReactiveFormsModule],
    templateUrl: './bench-test-device.component.html',
    styleUrl: './bench-test-device.component.scss',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => BenchTestDeviceComponent),
            multi: true,
        },
    ],
})
export class BenchTestDeviceComponent implements ControlValueAccessor, OnInit {
    private readonly injector = inject(Injector);
    private readonly destroyRef = inject(DestroyRef);
    private readonly benchTestLoadingColorService = inject(BenchTestLoadingColorService);

    deviceControl = new FormControl<string | null>('');
    ngControl: NgControl | null = null;
    errorStateMatcher!: ParentErrorStateMatcher;

    /** Whether or not to display the loading placeholder while awaiting status */
    displayLoadingPlaceholder = input<boolean>(false);
    displayStatus = input<boolean>(true);
    loadingText = input<string>(null);
    progress = input<number>(0);

    /** Emits when the user clears the field */
    textCleared = output<void>();

    private onChange: (value: string | null) => void = () => {};
    private onTouched: () => void = () => {};

    ngOnInit(): void {
        this.ngControl = this.injector.get(NgControl, null);
        this.errorStateMatcher = new ParentErrorStateMatcher(this);

        this.deviceControl.valueChanges
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((value) => {
                this.onChange(value);
                if (!value) {
                    this.textCleared.emit();
                }
            });
    }

    writeValue(value: string | null): void {
        this.deviceControl.setValue(value, { emitEvent: false });
    }

    registerOnChange(fn: (value: string | null) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        if (isDisabled) {
            this.deviceControl.disable({ emitEvent: false });
        } else {
            this.deviceControl.enable({ emitEvent: false });
        }
    }

    onBlur(): void {
        this.onTouched();
    }

    get errors(): ValidationErrors | null | undefined {
        return this.ngControl?.control?.errors;
    }

    getLoadingColorClass(): string {
        const loadingText = this.loadingText();
        return this.benchTestLoadingColorService.getStatusColorClass(loadingText) || '';
    }

    hasError(errorKey: string): boolean {
        return !!(
            this.ngControl?.control?.hasError(errorKey) && this.ngControl?.control?.touched
        );
    }
}
