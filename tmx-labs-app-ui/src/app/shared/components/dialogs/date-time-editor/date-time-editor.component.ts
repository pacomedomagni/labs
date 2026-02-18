import { Component, inject, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { FORM_DIALOG_CONTENT } from 'src/app/shared/components/dialogs/form-dialog/form-dialog.component';
import { DateTimeControlComponent } from '../../form-controls/date-time-control/date-time-control.component';
import { ChangeDetectorRef } from '@angular/core';

interface DateTimeEditorContent {
    model: { value: string };
    data?: { label?: string } | unknown;
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
                [model]="dateValue"
                (modelChange)="onModelChange($event)"
            ></tmx-date-time-control>
        </div>
    `,
})
export class DateTimeEditorComponent implements AfterViewInit {
    private readonly injected = inject< DateTimeEditorContent | null>(FORM_DIALOG_CONTENT, { optional: true });
    private readonly cdr = inject(ChangeDetectorRef);

    @ViewChild(DateTimeControlComponent) child?: DateTimeControlComponent;

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

    ngAfterViewInit(): void {
        const dataValue = this.injected?.data && typeof this.injected.data === 'object' ? (this.injected.data as any).value : undefined;
        const preferred = dataValue !== undefined && dataValue !== null ? (dataValue instanceof Date ? dataValue : new Date(dataValue)) : this.dateValue;
        if (this.child) {
            if (preferred instanceof Date && !Number.isNaN(preferred.getTime())) {
                this.child.model = new Date(preferred);
            }
            if (typeof this.child.syncFromModel === 'function') {
                this.child.syncFromModel();
            }
            this.cdr.detectChanges();
        }
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
