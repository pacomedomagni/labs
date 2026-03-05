import { Component, inject, OnInit, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DialogService } from '../../../shared/services/dialogs/primary/dialog.service';
import { LabelPrinterService } from '../../../shared/services/api/labelprinter/labelprinter.service';
import { SetPrinterFormComponent, PrinterFormModel } from './set-printer-dialog/set-printer-form.component';

@Component({
  selector: 'tmx-printer-info',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './printer-info.component.html',
  styleUrl: './printer-info.component.scss'
})
export class PrinterInfoComponent implements OnInit {
  private dialogService = inject(DialogService);
  private labelPrinterService = inject(LabelPrinterService);
  private destroyRef = inject(DestroyRef);
  private readonly PRINTER_STORAGE_KEY = 'defaultPrinterName';
  private readonly NO_PRINTER_SELECTED = 'NONE';
  
  printerName = signal<string>(this.NO_PRINTER_SELECTED);
  workstationId = signal<string>('');
  availablePrinters = signal<string[]>([]);

  ngOnInit(): void {
    this.loadSavedPrinter();
    this.loadPrinterInfo();
  }

  private loadSavedPrinter(): void {
    const savedPrinter = localStorage.getItem(this.PRINTER_STORAGE_KEY);
    if (savedPrinter) {
      this.printerName.set(savedPrinter);
    }
  }

  private loadPrinterInfo(): void {
    this.labelPrinterService.getLabelPrinters()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (printers) => {
          const printerNames = printers.map(p => p.PrinterName);
          this.availablePrinters.set(printerNames);

          // Validate saved printer against available printers
          const savedPrinter = this.printerName();
          if (savedPrinter !== this.NO_PRINTER_SELECTED && !printerNames.includes(savedPrinter)) {
            // Printer from storage is no longer available, clear it
            localStorage.removeItem(this.PRINTER_STORAGE_KEY);
            this.printerName.set(this.NO_PRINTER_SELECTED);
          }
        },
        error: (error) => {
          console.error('Error loading printer info:', error);
        }
      });
  }

  setDefaultPrinter() {
    const currentPrinter = this.printerName() === this.NO_PRINTER_SELECTED ? '' : this.printerName();
    
    const dialogRef = this.dialogService.openFormDialog<typeof SetPrinterFormComponent, PrinterFormModel>({
      title: 'Set Default Printer',
      component: SetPrinterFormComponent,
      confirmText: 'SAVE',
      formModel: { selectedPrinter: currentPrinter } as PrinterFormModel,
      componentData: {
        selectedPrinter: currentPrinter,
        availablePrinters: this.availablePrinters()
      },
    });

    dialogRef.afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result: PrinterFormModel | undefined) => {
        if (result && result.selectedPrinter) {
          this.printerName.set(result.selectedPrinter);
          localStorage.setItem(this.PRINTER_STORAGE_KEY, result.selectedPrinter);
        }
      });
  }
}
