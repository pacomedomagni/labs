import { AfterViewInit, Component, Input, OnInit, QueryList, ViewChild, ViewChildren, inject } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { FormsModule, NgForm, NgModel } from '@angular/forms';
import { FORM_DIALOG_CONTENT } from 'src/app/shared/components/dialogs/form-dialog/form-dialog.component';
import { DialogService } from 'src/app/shared/services/dialogs/primary/dialog.service';
import { DateTimeEditorComponent } from 'src/app/shared/components/dialogs/date-time-editor/date-time-editor.component';
import { firstValueFrom } from 'rxjs';
import { MatFormField } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

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
    imports: [CommonModule, FormsModule, MatFormField, MatInputModule, MatButtonModule, MatIconModule],
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

    rangeStartError: string | null = null;
    rangeEndError: string | null = null;
    existingRanges: { rangeStart: string; rangeEnd: string }[] = [];
    originalRangeStart?: string;
    private readonly dialogService = inject(DialogService);

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

        this.validateRangeStart();
        this.validateRangeEnd();
    }

    ngAfterViewInit(): void {
        if (!this.parentForm || !this.controls) {
            return;
        }

        this.controls.forEach((control) => {
            this.parentForm?.addControl(control);
        });

        Promise.resolve().then(() => {
            this.validateRangeStart();
            this.validateRangeEnd();
        });
    }

    async openDateTimeEditor(kind: 'start' | 'end'): Promise<void> {
        const current = kind === 'start' ? this.formModel.rangeStart : this.formModel.rangeEnd;

        const parsedDate = current ? new Date(current) : null;

        const dialogRef = this.dialogService.openFormDialog<typeof DateTimeEditorComponent, { value: string | Date | null }>( {
            title: kind === 'start' ? 'Range Start Date' : 'Range End Date',
            component: DateTimeEditorComponent,
            componentData: { label: kind === 'start' ? 'Range Start Date' : 'Range End Date', value: parsedDate },
            formModel: { value: current ?? '' },
            confirmText: 'OK',
            cancelText: 'CANCEL',
            width: '420px',
        });

        const result = await firstValueFrom(dialogRef.afterClosed());
        if (!result) {
            return;
        }

        const value = (result as { value?: string })?.value ?? '';
        if (kind === 'start') {
            this.formModel.rangeStart = value;
            this.markControlState(this.rangeStartCtrl);
            this.validateRangeStart();
            this.validateRangeEnd();
        } else {
            this.formModel.rangeEnd = value;
            this.markControlState(this.rangeEndCtrl);
            this.validateRangeEnd();
        }
    }

    openEditorFromKeyboard(event: Event, kind: 'start' | 'end'): void {
        if (event instanceof KeyboardEvent) {
            event.preventDefault();
            event.stopPropagation();
        }
        this.openDateTimeEditor(kind);
    }

    formatDisplayDate(iso?: string): string {
        if (!iso) {
            return '';
        }

        const d = this.isoToDate(iso);
        return d ? formatDate(d, "MM/dd/yyyy hh:mm a", 'en-US') : '';
    }

    shouldShowRangeStartError(): boolean {
        return !!this.rangeStartError && this.isControlInteracted(this.rangeStartCtrl);
    }

    shouldShowRangeEndError(): boolean {
        return !!this.rangeEndError && this.isControlInteracted(this.rangeEndCtrl);
    }

    private validateRangeStart(): void {
        const missing = !this.formModel.rangeStart;
        this.setControlError(this.rangeStartCtrl, 'required', missing);
        this.rangeStartError = missing ? 'Date is required.' : null;
    }

    private validateRangeEnd(): void {
        const control = this.rangeEndCtrl;
        const hasValue = !!this.formModel.rangeEnd;

        if (!hasValue) {
            this.setControlError(control, 'required', true);
            this.setControlError(control, 'order', false);
            this.setControlError(control, 'overlap', false);
            this.rangeEndError = 'Date is required.';
            return;
        }

        this.setControlError(control, 'required', false);

        const start = this.isoToDate(this.formModel.rangeStart);
        let end = this.isoToDate(this.formModel.rangeEnd);

        // Auto-adjust end date to equal start date if end is before start
        if (start && end && end.getTime() < start.getTime()) {
            this.formModel.rangeEnd = this.formModel.rangeStart;
            end = new Date(start);
        }

        // Show error and disable OK button when end <= start (including after auto-adjustment)
        if (start && end && end.getTime() <= start.getTime()) {
            this.setControlError(control, 'order', true);
            this.setControlError(control, 'overlap', false);
            this.rangeEndError = 'End date must be later than start date.';
            this.setParentFormInvalid(true);
            return;
        }

        const overlaps = start && end ? this.hasOverlap(this.formModel.rangeStart, this.formModel.rangeEnd, this.originalRangeStart) : false;
        if (overlaps) {
            this.setControlError(control, 'order', false);
            this.setControlError(control, 'overlap', true);
            this.rangeEndError = 'Selected date range overlaps with an existing exclusion.';
            this.setParentFormInvalid(true);
            return;
        }

        this.setControlError(control, 'order', false);
        this.setControlError(control, 'overlap', false);
        this.rangeEndError = null;
        this.setParentFormInvalid(false);
    }

    private setParentFormInvalid(invalid: boolean): void {
        if (!this.parentForm?.form) {
            return;
        }
        
        if (invalid) {
            this.parentForm.form.setErrors({ invalidRange: true });
            (this.parentForm.form as any).status = 'INVALID';
        } else {
            const errors = this.parentForm.form.errors;
            if (errors && 'invalidRange' in errors) {
                delete errors['invalidRange'];
                this.parentForm.form.setErrors(Object.keys(errors).length > 0 ? errors : null);
            }
        }
    }

    private isoToDate(iso?: string): Date | null {
        if (!iso) {
            return null;
        }

        const parsed = new Date(iso);
        return Number.isNaN(parsed.getTime()) ? null : parsed;
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

    private markControlState(control?: NgModel): void {
        if (!control?.control) {
            return;
        }

        control.control.markAsDirty();
        control.control.markAsTouched();
        control.control.updateValueAndValidity({ emitEvent: false });
    }

    private setControlError(control: NgModel | undefined, key: string, hasError: boolean): void {
        if (!control?.control) {
            return;
        }

        const errors = { ...(control.control.errors ?? {}) };
        if (hasError) {
            errors[key] = true;
        } else {
            delete errors[key];
        }

        control.control.setErrors(Object.keys(errors).length > 0 ? errors : null);
        control.control.markAsTouched();
        control.control.markAsDirty();
        control.control.updateValueAndValidity();
        
        if (this.parentForm?.form) {
            this.parentForm.form.updateValueAndValidity();
        }
    }

    private isControlInteracted(control?: NgModel): boolean {
        const formControl = control?.control;
        return !!formControl && (formControl.touched || formControl.dirty);
    }
}
