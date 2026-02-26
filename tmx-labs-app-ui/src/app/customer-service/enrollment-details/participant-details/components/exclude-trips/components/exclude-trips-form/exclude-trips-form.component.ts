import { AfterViewInit, Component, Input, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { FormsModule, NgForm, NgModel, ValidationErrors } from '@angular/forms';
import { FORM_DIALOG_CONTENT } from 'src/app/shared/components/dialogs/form-dialog/form-dialog.component';
import { DialogService } from 'src/app/shared/services/dialogs/primary/dialog.service';
import { DateTimeEditorComponent } from 'src/app/shared/components/dialogs/date-time-editor/date-time-editor.component';
import { firstValueFrom } from 'rxjs';
import { MatFormField, MatError } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ErrorStateMatcher } from '@angular/material/core';
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
    imports: [CommonModule, FormsModule, MatFormField, MatError, MatInputModule, MatButtonModule, MatIconModule],
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

    @ViewChild('rangeStartCtrl') rangeStartCtrl?: NgModel;
    @ViewChild('rangeEndCtrl') rangeEndCtrl?: NgModel;

    rangeStartError: string | null = null;
    rangeEndError: string | null = null;
    private rangeStartHighlight = false;
    rangeStartErrorMatcher: ErrorStateMatcher = { isErrorState: () => this.shouldShowRangeStartError() || this.rangeStartHighlight };
    rangeEndErrorMatcher: ErrorStateMatcher = { isErrorState: () => this.shouldShowRangeEndError() };
    existingRanges: { rangeStart: string; rangeEnd: string }[] = [];
    originalRangeStart?: string;
    private rangeStartInteracted = false;
    private rangeEndInteracted = false;
    private rangeStartValidationError: ValidationErrors | null = { required: true };
    private rangeEndValidationError: ValidationErrors | null = { required: true };
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
    }

    ngAfterViewInit(): void {
        if (!this.parentForm) {
            return;
        }

        if (this.rangeStartCtrl) {
            this.parentForm.addControl(this.rangeStartCtrl);
        }
        if (this.rangeEndCtrl) {
            this.parentForm.addControl(this.rangeEndCtrl);
        }

        if (this.rangeStartCtrl?.control) {
            this.rangeStartCtrl.control.setValidators(() => this.rangeStartValidationError);
            this.rangeStartCtrl.control.updateValueAndValidity();
        }
        if (this.rangeEndCtrl?.control) {
            this.rangeEndCtrl.control.setValidators(() => this.rangeEndValidationError);
            this.rangeEndCtrl.control.updateValueAndValidity();
        }

        setTimeout(() => {
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

        // Mark as interacted regardless of OK/Cancel
        if (kind === 'start') {
            this.rangeStartInteracted = true;
        } else {
            this.rangeEndInteracted = true;
        }

        if (!result) {
            // Cancel: still validate to show "Date is required" if empty
            if (kind === 'start') {
                this.validateRangeStart();
            } else {
                this.validateRangeEnd();
            }
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
        return !!this.rangeStartError && this.rangeStartInteracted;
    }

    shouldShowRangeEndError(): boolean {
        return !!this.rangeEndError && this.rangeEndInteracted;
    }

    private validateRangeStart(): void {
        const missing = !this.formModel.rangeStart;
        this.rangeStartValidationError = missing ? { required: true } : null;
        this.rangeStartError = missing ? 'Date is required.' : null;
        this.rangeStartCtrl?.control?.updateValueAndValidity();
    }

    private validateRangeEnd(): void {
        const hasValue = !!this.formModel.rangeEnd;

        if (!hasValue) {
            this.rangeStartHighlight = false;
            this.rangeEndValidationError = { required: true };
            this.rangeEndError = 'Date is required.';
            this.rangeEndCtrl?.control?.updateValueAndValidity();
            return;
        }

        const start = this.isoToDate(this.formModel.rangeStart);
        const end = this.isoToDate(this.formModel.rangeEnd);

        if (start && end && end.getTime() <= start.getTime()) {
            this.rangeStartHighlight = false;
            this.rangeEndValidationError = { order: true };
            this.rangeEndError = 'End date must be later than start date.';
            this.rangeEndCtrl?.control?.updateValueAndValidity();
            return;
        }

        const overlaps = start && end ? this.hasOverlap(this.formModel.rangeStart, this.formModel.rangeEnd, this.originalRangeStart) : false;
        if (overlaps) {
            this.rangeStartHighlight = true;
            this.rangeStartError = 'Selected date range overlaps with an existing exclusion.';
            this.rangeEndValidationError = { overlap: true };
            this.rangeEndError = 'Selected date range overlaps with an existing exclusion.';
            this.rangeEndCtrl?.control?.updateValueAndValidity();
            return;
        }

        this.rangeStartHighlight = false;
        this.rangeStartError = null;
        this.rangeEndValidationError = null;
        this.rangeEndError = null;
        this.rangeEndCtrl?.control?.updateValueAndValidity();
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
    }
}
