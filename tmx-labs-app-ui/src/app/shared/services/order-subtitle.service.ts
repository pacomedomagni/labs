import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class OrderSubtitleService {
    readonly orderSubtitle = signal<string>('');

    setOrderNumber(orderNumber: string): void {
        this.orderSubtitle.set(`Order #: ${orderNumber}`);
    }
}
