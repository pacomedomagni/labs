import { CommonModule, DatePipe } from '@angular/common';
import { AfterViewInit, Component, EventEmitter, forwardRef, Input, OnChanges, Output, SimpleChanges, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator } from '@angular/forms';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { ErrorStateMatcher, MatNativeDateModule } from '@angular/material/core';
import { MatTimepickerModule } from '@angular/material/timepicker';
import type { MatTimepickerSelected } from '@angular/material/timepicker';

export class DateErrorStateMatcher implements ErrorStateMatcher {
    constructor(private component: DateTimeControlComponent) {}

    isErrorState(): boolean {
        return this.component.invalidDateFormat;
    }
}

export class TimeErrorStateMatcher implements ErrorStateMatcher {
    constructor(private component: DateTimeControlComponent) {}

    isErrorState(): boolean {
        return this.component.invalidTimeFormat;
    }
}

@Component({
    selector: 'tmx-date-time-control',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatFormField,
        MatLabel,
        MatError,
        MatInputModule,
        MatIconModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatTimepickerModule,
    ],
    templateUrl: './date-time-control.component.html',
    styleUrls: ['./date-time-control.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => DateTimeControlComponent),
            multi: true,
        },
        {
            provide: NG_VALIDATORS,
            useExisting: forwardRef(() => DateTimeControlComponent),
            multi: true,
        },
    ],
})
export class DateTimeControlComponent implements OnChanges, AfterViewInit, ControlValueAccessor, Validator {
    @Input() model: Date | null = null;
    @Input() min: Date | null = null;
    @Input() max: Date | null = null;
    @Input() label = '';
    @Input() id = 'date-time';
    @Input() isRequired = false;
    @Input() isDisabled = false;
    @Input() error: string | null = null;
    @Output() modelChange = new EventEmitter<Date | null>();

    @ViewChild('dateInputRef') dateInputRef?: ElementRef<HTMLInputElement>;
    @ViewChild('timeInputRef') timeInputRef?: ElementRef<HTMLInputElement>;
    @ViewChild('timePicker') private timePickerRef?: any;

    dateValue: Date | null = null;
    timeInput = '';
    displayError = false;
    invalidTimeFormat = false;
    invalidDateFormat = false;

    dateErrorStateMatcher: DateErrorStateMatcher;
    timeErrorStateMatcher: TimeErrorStateMatcher;

    private readonly datePipe = new DatePipe('en-US');
    private initialDate: Date | null = null;
    private initialTime = '';
    private isSyncing = false;
    private currentError: string | null = null;
    private interacted = false;
    private lastRawDateInput = '';
    private isDateBlurring = false;
    allowTimePickerOpen = false;

    // CVA callbacks
    private onChangeFn: (value: Date | null) => void = () => {};
    private onTouchedFn: () => void = () => {};
    private onValidatorChangeFn: () => void = () => {};

    constructor(private readonly cdr: ChangeDetectorRef) {
        this.dateErrorStateMatcher = new DateErrorStateMatcher(this);
        this.timeErrorStateMatcher = new TimeErrorStateMatcher(this);
    }

    ngAfterViewInit(): void {
        this.patchTimepickerOpen();
    }

    // ControlValueAccessor implementation
    writeValue(value: Date | null): void {
        if (this.invalidDateFormat || this.invalidTimeFormat) {
            return;
        }
        this.model = value;
        this.interacted = false;
        this.syncFromModel();
    }

    registerOnChange(fn: (value: Date | null) => void): void {
        this.onChangeFn = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouchedFn = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.isDisabled = isDisabled;
    }

    // Validator implementation
    validate(): ValidationErrors | null {
        if (this.invalidDateFormat) {
            return { invalidDate: true };
        }

        if (this.invalidTimeFormat) {
            return { invalidTime: true };
        }

        // Date entered but time empty → require explicit time
        if (this.dateValue && !this.timeInput?.trim()) {
            return { timeRequired: true };
        }

        if (this.isRequired && !this.model) {
            return { required: true };
        }

        if (this.min && this.model && this.compareDates(this.model, this.min) < 0) {
            return { min: { min: this.min, actual: this.model } };
        }

        if (this.max && this.model && this.compareDates(this.model, this.max) > 0) {
            return { max: { max: this.max, actual: this.model } };
        }

        return null;
    }

    registerOnValidatorChange(fn: () => void): void {
        this.onValidatorChangeFn = fn;
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['model'] && !this.isSyncing) {
            this.syncFromModel();
        }

        if (changes['error'] || changes['min'] || changes['max'] || changes['isRequired']) {
            this.refreshError();
        }
    }

    onDateChange(value: Date | null): void {
        if (this.invalidDateFormat) {
            return;
        }
        this.interacted = true;
        this.dateValue = value ? new Date(value) : null;
        if (value) {
            this.invalidDateFormat = Number.isNaN(this.dateValue!.getTime());
            this.lastRawDateInput = '';
        }
        this.refreshError();
        this.updateModel();
    }

    onDateInput(event: any): void {
        if (this.isDateBlurring) {
            return;
        }
        const input = event.target?.value;
        this.lastRawDateInput = input ?? '';
        if (!input || !input.trim()) {
            this.invalidDateFormat = false;
            this.refreshError();
            return;
        }

        const trimmed = input.trim();

        // Trigger validation at 3rd character: if length >= 3 and doesn't look
        // like a valid partial MM/DD/YYYY pattern, mark as invalid immediately
        if (trimmed.length >= 3) {
            const partialDatePattern = /^\d{1,2}\/(\d{0,2}(\/\d{0,4})?)?$/;
            if (!partialDatePattern.test(trimmed)) {
                this.invalidDateFormat = true;
                this.refreshError();
                return;
            }
        }

        // For complete-looking dates, also check actual parsability
        if (trimmed.length >= 8) {
            const parsed = new Date(trimmed);
            this.invalidDateFormat = Number.isNaN(parsed.getTime());
        } else {
            this.invalidDateFormat = false;
        }
        this.refreshError();
    }

    onDateBlur(): void {
        this.interacted = true;
        this.isDateBlurring = true;

        // Use setTimeout to restore state AFTER MatDatepickerInput finishes.
        setTimeout(() => {
            if (this.invalidDateFormat && this.lastRawDateInput) {
                const el = this.dateInputRef?.nativeElement;
                if (el) {
                    el.value = this.lastRawDateInput;
                }
            }
            this.isDateBlurring = false;
            this.refreshError();
            this.tryDetectChanges();
        });
        this.onTouchedFn();
    }

    onTimeInputChange(value: any): void {
        if (!this.isSyncing) {
            this.interacted = true;
        }

        if (value == null) {
            // MatTimepickerInput emits null when it can't parse the raw input.
            // Don't overwrite timeInput — the user is still typing.
            // Read the actual DOM value to keep timeInput in sync with what's displayed.
            const rawValue = this.timeInputRef?.nativeElement?.value ?? '';
            this.timeInput = rawValue;
        } else if (typeof value === 'string') {
            this.timeInput = value;
        } else if (value instanceof Date) {
            this.timeInput = this.toTimeString(value);
            this.invalidTimeFormat = false;
        } else {
            this.timeInput = String(value ?? '');
        }

        this.refreshError();
        this.updateModel();
    }

    onTimeInput(event: any): void {
        const input = event.target?.value;
        if (!input || !input.trim()) {
            this.invalidTimeFormat = false;
            this.refreshError();
            return;
        }

        const trimmed = input.trim();

        // Progressive validation — don't flag errors on partial input
        if (trimmed.length >= 5) {
            this.invalidTimeFormat = !this.parseTime(trimmed);
        } else if (trimmed.length >= 3) {
            const partialTimePattern = /^\d{1,2}:\d{0,2}$/;
            this.invalidTimeFormat = !partialTimePattern.test(trimmed);
        } else {
            this.invalidTimeFormat = false;
        }

        this.refreshError();
    }

    onTimeSelected(event: MatTimepickerSelected<Date> | Date | null): void {
        const selection = this.toDateFromSelection(event);
        this.timeInput = selection ? this.toTimeString(selection) : '';
        this.updateModel();
    }

    onTimeBlur(): void {
        this.interacted = true;
        const normalized = this.normalizeTimeString(this.timeInput);
        if (normalized && normalized !== this.timeInput) {
            this.timeInput = normalized;
            this.invalidTimeFormat = false;
            this.updateModel();
        } else {
            // On blur, validate the raw DOM value — if text is present but unparseable, show error
            const rawValue = this.timeInputRef?.nativeElement?.value?.trim() ?? '';
            if (rawValue) {
                this.invalidTimeFormat = !this.parseTime(rawValue);
            } else {
                this.invalidTimeFormat = false;
            }
        }
        this.refreshError();
        this.onTouchedFn();
    }

    get errorMessage(): string | null {
        return this.currentError;
    }

    syncFromModel(): void {
        this.isSyncing = true;
        const source = this.model instanceof Date && !Number.isNaN(this.model.getTime()) ? new Date(this.model) : null;

        this.dateValue = source;
        this.timeInput = source ? this.toTimeString(source) : '';
        this.initialDate = source ? new Date(source) : null;
        this.initialTime = this.timeInput;
        this.invalidDateFormat = false;
        this.invalidTimeFormat = false;
        this.refreshError();

        this.tryDetectChanges();

        this.syncNativeTimeInput();
        Promise.resolve().then(() => {
            this.syncNativeTimeInput();
            this.isSyncing = false;
        });
    }

    private tryDetectChanges(): void {
        const cd: any = this.cdr as any;
        if (cd && cd.destroyed) {
            return;
        }

        this.cdr.detectChanges();
    }

    private syncNativeTimeInput(): void {
        const el = this.timeInputRef?.nativeElement;
        if (el) {
            el.value = this.timeInput ?? '';
        }
    }

    private patchTimepickerOpen(): void {
        const picker = this.timePickerRef as any;
        if (!picker?.open) return;
        const originalOpen = picker.open.bind(picker);
        picker.open = () => {
            if (this.allowTimePickerOpen) {
                this.allowTimePickerOpen = false;
                originalOpen();
            }
        };
    }

    private updateModel(): void {
        if (this.isSyncing) {
            return;
        }

        if (this.invalidDateFormat || this.invalidTimeFormat) {
            return;
        }

        const date = this.dateValue;
        const rawTime = this.timeInput ?? '';
        const time = typeof rawTime === 'string' ? rawTime.trim() : String(rawTime).trim();

        if (!date && !time) {
            this.emitModel(null);
            return;
        }

        if (date && time) {
            const combined = this.combine(date, time);
            if (combined) {
                this.emitModel(combined);
            }
            return;
        }

        // Date entered but no time → keep model null, require explicit time
        if (date && !time) {
            this.refreshError();
            return;
        }

        // Time entered but no date → keep model null
        if (!date && time) {
            this.refreshError();
        }
    }

    private emitModel(value: Date | null): void {
        this.isSyncing = true;
        this.model = value;
        this.modelChange.emit(value);
        this.onChangeFn(value);
        this.dateValue = value ? new Date(value) : null;
        this.timeInput = value ? this.toTimeString(value) : '';
        this.initialDate = this.dateValue ? new Date(this.dateValue) : null;
        this.initialTime = this.timeInput;
        this.isSyncing = false;
        this.refreshError();
    }

    private combine(date: Date, time: string): Date | null {
        const parts = this.parseTime(time);
        if (!parts) {
            return null;
        }

        const [hours, minutes, seconds] = parts;
        const combined = new Date(date);
        combined.setHours(hours, minutes, seconds, 0);

        return Number.isNaN(combined.getTime()) ? null : combined;
    }

    private parseTime(value: string): [number, number, number] | null {
        if (!value) {
            return [0, 0, 0];
        }

        const match = value.trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/i);
        if (!match) {
            return null;
        }

        let hours = Number(match[1]);
        const minutes = Number(match[2]);
        const seconds = match[3] ? Number(match[3]) : 0;
        const meridiem = match[4]?.toUpperCase();

        if (Number.isNaN(hours) || Number.isNaN(minutes) || Number.isNaN(seconds)) {
            return null;
        }

        if (meridiem === 'AM' && hours === 12) {
            hours = 0;
        } else if (meridiem === 'PM' && hours < 12) {
            hours += 12;
        }

        if (hours > 23 || minutes > 59 || seconds > 59) {
            return null;
        }

        return [hours, minutes, seconds];
    }

    private toTimeString(source: Date): string {
        try {
            return this.datePipe.transform(source, 'hh:mm:ss a') ?? source.toTimeString().slice(0, 8);
        } catch {
            return source.toTimeString().slice(0, 8);
        }
    }

    private normalizeTimeString(value: string | null | undefined): string | null {
        const parsed = typeof value === 'string' ? this.parseTime(value) : null;
        if (!parsed) {
            return null;
        }

        const [hours, minutes, seconds] = parsed;
        const base = this.dateValue ? new Date(this.dateValue) : new Date();
        base.setHours(hours, minutes, seconds, 0);
        return this.toTimeString(base);
    }

    private toDateFromSelection(event: MatTimepickerSelected<Date> | Date | null): Date | null {
        if (!event) {
            return null;
        }

        if (event instanceof Date) {
            return event;
        }

        const potential = event.value;
        return potential instanceof Date ? potential : null;
    }

    private refreshError(): void {
        this.currentError = this.computeErrorMessage();
        this.displayError = !!this.currentError;
        this.onValidatorChangeFn();
    }

    private computeErrorMessage(): string | null {
        if (this.error) {
            return this.error;
        }

        // Format errors are shown via per-field mat-error inside mat-form-field
        if (this.invalidDateFormat || this.invalidTimeFormat) {
            return null;
        }

        // Don't show shared error messages until user has interacted.
        // validate() still returns errors → OK button stays disabled.
        if (!this.interacted) {
            return null;
        }

        const value = this.model;

        if (this.min && value && this.compareDates(value, this.min) < 0) {
            return `Date must be greater than ${this.datePipe.transform(this.min, 'M/d/yyyy hh:mm:ss')}`;
        }

        if (this.max && value && this.compareDates(value, this.max) > 0) {
            return `Date must be less than ${this.datePipe.transform(this.max, 'M/d/yyyy hh:mm:ss')}`;
        }

        return null;
    }

    private compareDates(a: Date | null, b: Date | null): number {
        if (!a || !b) {
            return 0;
        }

        const timeA = a.getTime();
        const timeB = b.getTime();

        if (timeA < timeB) {
            return -1;
        }

        if (timeA > timeB) {
            return 1;
        }

        return 0;
    }
}
