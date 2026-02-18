import { CommonModule, DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTimepickerModule } from '@angular/material/timepicker';
import type { MatTimepickerSelected } from '@angular/material/timepicker';

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
})
export class DateTimeControlComponent implements OnChanges {
    @Input() model: Date | null = null;
    @Input() min: Date | null = null;
    @Input() max: Date | null = null;
    @Input() label = '';
    @Input() id = 'date-time';
    @Input() name?: string;
    @Input() isRequired = false;
    @Input() isDisabled = false;
    @Input() error: string | null = null;
    @Output() modelChange = new EventEmitter<Date | null>();

    @ViewChild('timeInputRef') timeInputRef?: ElementRef<HTMLInputElement>;

    dateValue: Date | null = null;
    timeInput = '';
    displayError = false;

    private readonly datePipe = new DatePipe('en-US');
    private initialDate: Date | null = null;
    private initialTime = '';
    private isSyncing = false;
    private currentError: string | null = null;
    private invalidTimeFormat = false;
    private invalidDateFormat = false;

    constructor(private readonly cdr: ChangeDetectorRef) {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['model'] && !this.isSyncing) {
            this.syncFromModel();
        }

        if (changes['error'] || changes['min'] || changes['max'] || changes['isRequired']) {
            this.refreshError();
        }
    }

    onDateChange(value: Date | null): void {
        this.dateValue = value ? new Date(value) : null;
        this.invalidDateFormat = this.dateValue ? Number.isNaN(this.dateValue.getTime()) : false;
        this.refreshError();
        this.updateModel();
    }

    onDateInput(event: any): void {
        const input = event.target?.value;
        if (!input || !input.trim()) {
            this.invalidDateFormat = false;
            this.refreshError();
            return;
        }

        // Check if the typed value is a valid date
        const parsed = new Date(input);
        this.invalidDateFormat = Number.isNaN(parsed.getTime());
        this.refreshError();
    }

    onDateBlur(): void {
        // Revalidate on blur
        if (this.dateValue) {
            this.invalidDateFormat = Number.isNaN(this.dateValue.getTime());
        } else {
            this.invalidDateFormat = false;
        }
        this.refreshError();
    }

    onTimeInputChange(value: any): void {
        if (value == null) {
            this.timeInput = '';
        } else if (typeof value === 'string') {
            this.timeInput = value;
        } else if (value instanceof Date) {
            this.timeInput = this.toTimeString(value);
        } else {
            this.timeInput = String(value ?? '');
        }

        // Check if time format is valid
        if (this.timeInput && this.timeInput.trim()) {
            this.invalidTimeFormat = !this.parseTime(this.timeInput.trim());
        } else {
            this.invalidTimeFormat = false;
        }

        this.refreshError();
        this.updateModel();
    }

    onTimeSelected(event: MatTimepickerSelected<Date> | Date | null): void {
        const selection = this.toDateFromSelection(event);
        this.timeInput = selection ? this.toTimeString(selection) : '';
        this.updateModel();
    }

    onTimeBlur(): void {
        const normalized = this.normalizeTimeString(this.timeInput);
        if (!normalized || normalized === this.timeInput) {
            return;
        }

        this.timeInput = normalized;
        this.updateModel();
    }

    get errorMessage(): string | null {
        return this.currentError;
    }

    syncFromModel(): void {
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
        Promise.resolve().then(() => this.syncNativeTimeInput());
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
            el.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }

    private updateModel(): void {
        if (this.isSyncing) {
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

        if (date && !time) {
            const fallbackTime = this.initialTime || '00:00:00';
            const combined = this.combine(date, fallbackTime);
            if (combined) {
                this.emitModel(combined);
            }
            return;
        }

        if (!date && time && this.initialDate) {
            const combined = this.combine(this.initialDate, time);
            if (combined) {
                this.emitModel(combined);
            }
        }
    }

    private emitModel(value: Date | null): void {
        this.isSyncing = true;
        this.model = value;
        this.modelChange.emit(value);
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
    }

    private computeErrorMessage(): string | null {
        if (this.error) {
            return this.error;
        }

        // Check for invalid format errors first
        if (this.invalidDateFormat) {
            return 'Invalid date format. Please use MM/DD/YYYY.';
        }

        if (this.invalidTimeFormat) {
            return 'Invalid time format. Please use HH:MM AM/PM.';
        }

        const value = this.model;

        if (this.min && value && this.compareDates(value, this.min) < 0) {
            return `Date must be greater than ${this.datePipe.transform(this.min, 'M/d/yyyy hh:mm:ss')}`;
        }

        if (this.max && value && this.compareDates(value, this.max) > 0) {
            return `Date must be less than ${this.datePipe.transform(this.max, 'M/d/yyyy hh:mm:ss')}`;
        }

        if (this.min && this.max && value) {
            return `Date must be between ${this.datePipe.transform(this.min, 'M/d/yyyy hh:mm:ss')} and ${this.datePipe.transform(this.max, 'M/d/yyyy hh:mm:ss')}`;
        }

        if (!value && this.isRequired) {
            return 'Date is required';
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
