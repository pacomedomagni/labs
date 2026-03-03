import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  private readonly PRINTER_COOKIE_NAME = 'defaultPrinterName';
  
  printerName = signal<string>('NONE');
  workstationId = signal<string>('');
  availablePrinters = signal<string[]>([]);

  ngOnInit(): void {
    this.loadSavedPrinter();
    this.loadPrinterInfo();
  }

  private loadSavedPrinter(): void {
    const savedPrinter = this.getCookie(this.PRINTER_COOKIE_NAME);
    if (savedPrinter) {
      this.printerName.set(savedPrinter);
    }
  }

  private getCookie(name: string): string | null {
    const nameEQ = name + '=';
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      let trimmedCookie = cookie;
      while (trimmedCookie.charAt(0) === ' ') {
        trimmedCookie = trimmedCookie.substring(1, trimmedCookie.length);
      }
      if (trimmedCookie.indexOf(nameEQ) === 0) {
        return trimmedCookie.substring(nameEQ.length, trimmedCookie.length);
      }
    }
    return null;
  }

  private setCookie(name: string, value: string, days: number): void {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = 'expires=' + date.toUTCString();
    document.cookie = name + '=' + value + ';' + expires + ';path=/';
  }

  private deleteCookie(name: string): void {
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/';
  }

  private loadPrinterInfo(): void {
    this.labelPrinterService.getLabelPrinters().subscribe({
      next: (printers) => {
        const printerNames = printers.map(p => p.PrinterName);
        this.availablePrinters.set(printerNames);

        // Validate saved printer against available printers
        const savedPrinter = this.printerName();
        if (savedPrinter !== 'NONE' && !printerNames.includes(savedPrinter)) {
          // Printer from cookie is no longer available, clear it
          this.deleteCookie(this.PRINTER_COOKIE_NAME);
          this.printerName.set('NONE');
        }


      },
      error: (error) => {
        console.error('Error loading printer info:', error);
      }
    });
  }

  setDefaultPrinter() {
    const dialogRef = this.dialogService.openFormDialog<typeof SetPrinterFormComponent, PrinterFormModel>({
      title: 'Set Default Printer',
      component: SetPrinterFormComponent,
      confirmText: 'SAVE',
      formModel: { selectedPrinter: this.printerName() } as PrinterFormModel,
      componentData: {
        selectedPrinter: this.printerName(),
        availablePrinters: this.availablePrinters()
      },
    });

    dialogRef.afterClosed().subscribe((result: PrinterFormModel | undefined) => {
      if (result && result.selectedPrinter) {
        this.printerName.set(result.selectedPrinter);
        this.setCookie(this.PRINTER_COOKIE_NAME, result.selectedPrinter, 1095); // 3 years = 1095 days
      }
    });
  }
}
