import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';

import { OrderListDetails, OrderDetails, AssingDeviceRequest } from '../../../data/fulfillment/resources';

@Injectable({
    providedIn: 'root'
})
export class FulfillmentService {
    private apiService = inject(ApiService);
    private readonly controller = '/Fulfillment';

    getOrderDetails(deviceOrderSeqId: number): Observable<OrderDetails> {
        return this.apiService.get<OrderDetails>({
            uri: `${this.controller}/OrderDetails?deviceOrderSeqID=${deviceOrderSeqId}`,
            });
    }

    getOrdersByStatus(deviceOrderStatusCode: number,participantGroupTypeCode: number, canOnlyViewOrdersForOwnGroup: boolean): Observable<OrderListDetails> {
        return this.apiService.get<OrderListDetails>({
            uri: `${this.controller}/OrdersByStatus?deviceOrderStatusCode=${deviceOrderStatusCode}&participantGroupTypeCode=${participantGroupTypeCode}&canOnlyViewOrdersForOwnGroup=${canOnlyViewOrdersForOwnGroup}`,

            });
    }
    
    assignDevicesToOrder(request: AssingDeviceRequest): Observable<void> {
        return this.apiService.post<void>({
            uri: `${this.controller}/AssignDevices`,
            payload: request
        });
    }

    getPendingOrderList(): Observable<OrderListDetails> {
        return this.apiService.get<OrderListDetails>({
            uri: `${this.controller}/PendingOrderList`,
        });
    }

    getProcessedOrdersCount(): Observable<number> {
        return this.apiService.get<number>({
            uri: `${this.controller}/ProcessedOrderCount`,
        });
    }
}
