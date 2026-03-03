import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiService } from '../api.service';
import { LabelPrinter } from 'src/app/shared/data/fulfillment/resources';

export interface LabelPrinterInfo {
    workstationId: string;
    defaultPrinter?: string;
}

interface LabelPrinterResponse {
    printerName: string;
    ipAddress: string;
}

@Injectable({
    providedIn: 'root'
})
export class LabelPrinterService {
    private apiService = inject(ApiService);
    private readonly controller = '/Fulfillment';

    getLabelPrinterInfo(): Observable<LabelPrinterInfo> {
        return this.apiService.get<LabelPrinterInfo>({
            uri: `${this.controller}/Info`,
        });
    }

    getLabelPrinters(): Observable<LabelPrinter[]> {
        return this.apiService.get<string>({
            uri: `${this.controller}/GetLabelPrinters`,
        }).pipe(
            map(response => {
                const parsed = typeof response === 'string' ? JSON.parse(response) : response;
                return parsed.map((printer: LabelPrinterResponse) => ({
                    PrinterName: printer.printerName,
                    PrinterIP: printer.ipAddress
                }));
            })
        );
    }
}
