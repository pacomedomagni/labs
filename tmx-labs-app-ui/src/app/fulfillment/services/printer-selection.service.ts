import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class PrinterSelectionService {
    private readonly PRINTER_STORAGE_KEY = 'defaultPrinterName';
    readonly NO_PRINTER_SELECTED = 'NONE';

    readonly printerName = signal<string>(
        localStorage.getItem(this.PRINTER_STORAGE_KEY) ?? this.NO_PRINTER_SELECTED
    );

    setPrinter(printerName: string): void {
        localStorage.setItem(this.PRINTER_STORAGE_KEY, printerName);
        this.printerName.set(printerName);
    }

    getPrinter(): string | null {
        const name = this.printerName();
        return name === this.NO_PRINTER_SELECTED ? null : name;
    }
}
