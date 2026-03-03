import { AfterViewInit, Component, inject, Input, OnInit, QueryList, signal, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm, NgModel } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { FORM_DIALOG_CONTENT } from '../../../../shared/components/dialogs/form-dialog/form-dialog.component';

export interface PrinterFormModel {
  selectedPrinter: string;
}

export interface SetPrinterComponentData {
  selectedPrinter: string;
  availablePrinters?: string[];
}

@Component({
  selector: 'tmx-set-printer-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatLabel,
    MatIconModule
  ],
  templateUrl: './set-printer-form.component.html',
  styleUrl: './set-printer-form.component.scss'
})
export class SetPrinterFormComponent implements OnInit, AfterViewInit {
  @Input() printerDetails: PrinterFormModel;
  @Input() parentForm: NgForm;
  @ViewChildren(NgModel) controls: QueryList<NgModel>;

  public injectedData = inject<{ model: PrinterFormModel; form: NgForm; data: SetPrinterComponentData }>(FORM_DIALOG_CONTENT, { optional: true });

  availablePrinters = signal<string[]>([]);

  ngOnInit(): void {
    this.printerDetails = this.printerDetails || this.injectedData.model;
    this.parentForm = this.parentForm || this.injectedData.form;
    
    if (this.injectedData?.data?.availablePrinters) {
      this.availablePrinters.set(this.injectedData.data.availablePrinters);
    }
  }

  ngAfterViewInit(): void {
    this.controls.forEach((x) => this.parentForm.addControl(x));
  }
}
