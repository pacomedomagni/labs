import { AfterViewInit, Component, inject, OnInit, QueryList, ViewChildren } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { FormsModule, NgForm, NgModel } from '@angular/forms';
import { FORM_DIALOG_CONTENT } from 'src/app/shared/components/dialogs/form-dialog/form-dialog.component';
import { DateTimeControlComponent } from '../../form-controls/date-time-control/date-time-control.component';

interface DateTimeEditorContent {
    model: { value: string };
    data?: { label?: string; value?: Date | string } | unknown;
    form: NgForm;
    submit: () => void;
}

@Component({
    selector: 'tmx-date-time-editor',
    standalone: true,
    imports: [CommonModule, FormsModule, DateTimeControlComponent],
    template: `
        <div class="date-time-editor" style="margin-top:8px;">
            <tmx-date-time-control
                [label]="label"
                name="dateTimeValue"
                [isRequired]="true"
                [(ngModel)]="dateValue"
                (ngModelChange)="onModelChange($event)"
            ></tmx-date-time-control>
        </div>
    `,
})
export class DateTimeEditorComponent implements OnInit, AfterViewInit {
    private readonly injected = inject<DateTimeEditorContent | null>(FORM_DIALOG_CONTENT, { optional: true });

    @ViewChildren(NgModel) controls?: QueryList<NgModel>;

    private parentForm: NgForm | null = null;
    dateValue: Date | null = null;
    label = 'Date';

    constructor() {
        if (this.injected?.data && typeof this.injected.data === 'object' && (this.injected.data as any).label) {
            this.label = (this.injected.data as any).label;
        }

        if (this.injected?.model?.value) {
            const parsed = new Date(this.injected.model.value);
            this.dateValue = Number.isNaN(parsed.getTime()) ? null : parsed;
        }
    }

    ngOnInit(): void {
        this.parentForm = this.injected?.form ?? null;

        // Prefer data.value (Date object) over model.value (ISO string) if available
        const dataValue = this.injected?.data && typeof this.injected.data === 'object'
            ? (this.injected.data as any).value : undefined;
        if (dataValue !== undefined && dataValue !== null) {
            const preferred = dataValue instanceof Date ? dataValue : new Date(dataValue);
            if (!Number.isNaN(preferred.getTime())) {
                this.dateValue = new Date(preferred);
            }
        }
    }

    ngAfterViewInit(): void {
        if (!this.parentForm || !this.controls) {
            return;
        }

        this.controls.forEach((control) => this.parentForm?.addControl(control));
    }

    onModelChange(value: Date | null): void {
        this.dateValue = value;
        if (this.injected && this.injected.model) {
            if (!value) {
                this.injected.model.value = '';
            } else {
                this.injected.model.value = formatDate(value, "yyyy-MM-dd'T'HH:mm:ss", 'en-US');
            }
        }
    }
}
