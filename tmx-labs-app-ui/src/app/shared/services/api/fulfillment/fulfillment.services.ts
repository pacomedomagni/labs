import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';
import { OrderType } from '../../../data/application/enums';
import { Orders, OrdersByState, OrderDetails } from '../../../data/application/resources';

@Injectable({
    providedIn: 'root'
})
export class FulfillmentService {
    private apiService = inject(ApiService);
    private readonly controller = '/Fulfillment';

    getOrderCounts(ordersModel: Orders): Observable<Orders> {
        return this.apiService.post<Orders>({
            uri: `${this.controller}/OrderCounts`,
            payload: ordersModel
        });
    }

    getStateOrderCounts(ordersByState: OrdersByState): Observable<OrdersByState> {
        return this.apiService.post<OrdersByState>({
            uri: `${this.controller}/StateOrderCounts`,
            payload: ordersByState
        });
    }

    getNewOrders(
        orderType: OrderType,
        orderState?: string,
        orderId?: string
    ): Observable<OrderDetails[]> {
        const params: Record<string, string> = {
            orderType: orderType.toString()
        };

        if (orderState) {
            params['orderState'] = orderState;
        }

        if (orderId) {
            params['orderId'] = orderId;
        }

        return this.apiService.get<OrderDetails[]>({
            uri: `${this.controller}/NewOrders`,
            payload: params
        });
    }
}
