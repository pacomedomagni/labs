import { AfterViewInit, Component, Input, OnInit, QueryList, ViewChild, ViewChildren, inject } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { FormsModule, NgForm, NgModel } from '@angular/forms';
import { FORM_DIALOG_CONTENT } from 'src/app/shared/components/dialogs/form-dialog/form-dialog.component';
import { DateTimeControlComponent } from 'src/app/shared/components/form-controls/date-time-control/date-time-control.component';

export interface ExcludeTripsFormModel {
    rangeStart: string;
    rangeEnd: string;
}

export interface ExcludeTripsFormData {
    mode: 'create' | 'edit';
    existingRanges: { rangeStart: string; rangeEnd: string }[];
    originalRangeStart?: string;
}

interface ExcludeTripsDialogContent {
    model: ExcludeTripsFormModel;
    data: ExcludeTripsFormData;
    form: NgForm;
    submit: () => void;
}

@Component({
    selector: 'tmx-exclude-trips-form',
    standalone: true,
    imports: [CommonModule, FormsModule, DateTimeControlComponent],
    templateUrl: './exclude-trips-form.component.html',
    styleUrls: ['./exclude-trips-form.component.scss'],
})
export class ExcludeTripsFormComponent implements OnInit, AfterViewInit {
    @Input() parentForm: NgForm | null = null;
    @Input() formModel: ExcludeTripsFormModel = {
        rangeStart: '',
        rangeEnd: '',
    };
    @Input() mode: 'create' | 'edit' = 'create';

    @ViewChildren(NgModel) controls?: QueryList<NgModel>;
    @ViewChild('rangeStartCtrl') rangeStartCtrl?: NgModel;
    @ViewChild('rangeEndCtrl') rangeEndCtrl?: NgModel;

    rangeStartDate: Date | null = null;
    rangeEndDate: Date | null = null;
    rangeStartError: string | null = null;
    rangeEndError: string | null = null;
    existingRanges: { rangeStart: string; rangeEnd: string }[] = [];
    originalRangeStart?: string;

    private readonly injectedContent = inject<ExcludeTripsDialogContent>(FORM_DIALOG_CONTENT, {
        optional: true,
    });

    ngOnInit(): void {
        if (this.injectedContent) {
            this.formModel = this.injectedContent.model ?? this.formModel;
            this.parentForm = this.parentForm ?? this.injectedContent.form;
            this.mode = this.injectedContent.data?.mode ?? this.mode;
            this.existingRanges = this.injectedContent.data?.existingRanges ?? [];
            this.originalRangeStart = this.injectedContent.data?.originalRangeStart;
        }

        this.syncDatesFromModel();
        this.validateOrderingAndOverlap();
    }

    ngAfterViewInit(): void {
        if (!this.parentForm || !this.controls) {
            return;
        }

        this.controls.forEach((control) => {
            this.parentForm?.addControl(control);
        });

        this.validateOrderingAndOverlap();
    }

    onRangeStartDateChangeModel(value: Date | null): void {
        this.rangeStartDate = value;
        this.formModel.rangeStart = this.dateToIso(value);
        this.markControlState(this.rangeStartCtrl);
        if (!this.formModel.rangeStart) {
            this.rangeStartError = 'Date is required.';
            this.setControlError(this.rangeStartCtrl, 'custom', this.rangeStartError);
        } else {
            this.rangeStartError = null;
            this.setControlError(this.rangeStartCtrl, 'custom', null);
        }
        this.validateOrderingAndOverlap();
    }

    onRangeEndDateChangeModel(value: Date | null): void {
        this.rangeEndDate = value;
        this.formModel.rangeEnd = this.dateToIso(value);
        this.rangeEndError = null;
        this.markControlState(this.rangeEndCtrl);
        this.validateOrderingAndOverlap();
    }

    private syncDatesFromModel(): void {
        this.rangeStartDate = this.isoToDate(this.formModel.rangeStart);
        this.rangeEndDate = this.isoToDate(this.formModel.rangeEnd);
    }

    private validateOrderingAndOverlap(): void {
        const endControl = this.rangeEndCtrl;

        if (!this.formModel.rangeEnd) {
            const showRequired = !!endControl?.control && (endControl.control.touched || endControl.control.dirty);
            this.rangeEndError = showRequired ? 'Date is required.' : null;
            this.setControlError(endControl, 'custom', this.rangeEndError);
            this.setControlError(endControl, 'order', null);
            this.setControlError(endControl, 'overlap', null);
            return;
        }

        if (!this.formModel.rangeStart) {
            this.rangeEndError = null;
            this.setControlError(endControl, 'order', null);
            this.setControlError(endControl, 'overlap', null);
            return;
        }

        const start = this.isoToDate(this.formModel.rangeStart);
        const end = this.isoToDate(this.formModel.rangeEnd);

        if (!start || !end) {
            return;
        }

        if (end.getTime() <= start.getTime()) {
            this.rangeEndError = 'End date must be later than start date.';
            this.setControlError(endControl, 'order', this.rangeEndError);
            return;
        }

        this.setControlError(endControl, 'order', null);

        if (this.hasOverlap(this.formModel.rangeStart, this.formModel.rangeEnd, this.originalRangeStart)) {
            this.rangeEndError = 'Selected date range overlaps with an existing exclusion.';
            this.setControlError(endControl, 'overlap', this.rangeEndError);
            return;
        }

        this.rangeEndError = null;
        this.setControlError(endControl, 'overlap', null);
        this.setControlError(endControl, 'custom', null);
    }

    private isoToDate(iso?: string): Date | null {
        if (!iso) {
            return null;
        }

        const parsed = new Date(iso);
        return Number.isNaN(parsed.getTime()) ? null : parsed;
    }

    private dateToIso(value: Date | null): string {
        if (!value) {
            return '';
        }

        return formatDate(value, "yyyy-MM-dd'T'HH:mm:ss", 'en-US');
    }

    private markControlState(control?: NgModel): void {
        if (!control?.control) {
            return;
        }

        control.control.markAsDirty();
        control.control.markAsTouched();
        control.control.updateValueAndValidity({ emitEvent: false });
    }

    private hasOverlap(rangeStart: string, rangeEnd: string, skipOriginal?: string): boolean {
        const newStart = new Date(rangeStart).getTime();
        const newEnd = new Date(rangeEnd).getTime();

        return this.existingRanges.some((existing) => {
            if (skipOriginal && existing.rangeStart === skipOriginal) {
                return false;
            }

            const existingStart = new Date(existing.rangeStart).getTime();
            const existingEnd = new Date(existing.rangeEnd).getTime();

            return newStart <= existingEnd && newEnd >= existingStart;
        });
    }

    private setControlError(control: NgModel | undefined, key: string, error: string | null): void {
        if (!control?.control) {
            return;
        }

        const errors = { ...(control.control.errors ?? {}) };
        if (error) {
            errors[key] = true;
        } else {
            delete errors[key];
        }

        control.control.setErrors(Object.keys(errors).length > 0 ? errors : null);
        control.control.updateValueAndValidity({ emitEvent: false });
    }
}
