import { AfterViewInit, Component, Input, OnInit, QueryList, ViewChildren, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm, NgModel } from '@angular/forms';
import { MatFormField, MatError, MatLabel } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { SwapDevicesCandidate, SwapDevicesDialogData, SwapDevicesFormModel } from '../../services/swap-devices/swap-devices.service';
import { FORM_DIALOG_CONTENT } from 'src/app/shared/components/dialogs/form-dialog/form-dialog.component';

interface SwapDevicesDialogContent {
    model: SwapDevicesFormModel;
    data: SwapDevicesDialogData;
    form: NgForm;
}

@Component({
    selector: 'tmx-swap-devices',
    standalone: true,
    imports: [CommonModule, FormsModule, MatFormField, MatLabel, MatError, MatSelectModule, MatOptionModule],
    templateUrl: './swap-devices.component.html',
    styleUrls: ['./swap-devices.component.scss'],
})
export class SwapDevicesComponent implements OnInit, AfterViewInit {
    @Input() parentForm: NgForm | null = null;
    @Input() formModel: SwapDevicesFormModel = { destParticipantSeqId: null };
    @Input() candidates: SwapDevicesCandidate[] = [];

    @ViewChildren(NgModel) controls?: QueryList<NgModel>;

    private injectedContent = inject<SwapDevicesDialogContent>(FORM_DIALOG_CONTENT, { optional: true });

    ngOnInit(): void {
        if (this.injectedContent) {
            this.formModel = this.injectedContent.model ?? this.formModel;
            this.parentForm = this.parentForm ?? this.injectedContent.form;
            this.applyDialogData(this.injectedContent.data);
        }

        this.formModel = this.formModel ?? { destParticipantSeqId: null };
    }

    ngAfterViewInit(): void {
        if (!this.parentForm || !this.controls) {
            return;
        }

        this.controls.forEach((control) => this.parentForm?.addControl(control));
    }

    get selectedCandidate(): SwapDevicesCandidate | undefined {
        const selectedId = this.formModel?.destParticipantSeqId ?? null;
        if (selectedId === null) {
            return undefined;
        }
        return this.candidates.find((candidate) => candidate.participantSeqId === selectedId);
    }

    private applyDialogData(data?: SwapDevicesDialogData): void {
        if (!data) {
            return;
        }

        this.candidates = data.candidates ?? [];
    }
}
