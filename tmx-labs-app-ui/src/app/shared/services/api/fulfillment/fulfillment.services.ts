import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpContext } from '@angular/common/http';
import { ApiService } from '../api.service';

import { OrderListDetails, OrderDetails, AssingDeviceRequest, CompletedOrdersList, DeviceOrder, ValidateDeviceForFulfillmentRequest, ValidateDeviceForFulfillmentResponse } from '../../../data/fulfillment/resources';
import { OrderVehicleDetails } from 'src/app/shared/data/vehicle/resources';
import { SKIP_LOADING } from '../../http-interceptors/loading-interceptor';

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

    getPendingOrderList(showLoadingIndicator = true): Observable<OrderListDetails> {
        return this.apiService.get<OrderListDetails>({
            uri: `${this.controller}/PendingOrderList`,
            options: {
                context: new HttpContext().set(SKIP_LOADING, !showLoadingIndicator),
            },
        });
    }

    getProcessedOrdersCount(showLoadingIndicator = true): Observable<number> {
        return this.apiService.get<number>({
            uri: `${this.controller}/ProcessedOrderCount`,
            options: {
                context: new HttpContext().set(SKIP_LOADING, !showLoadingIndicator),
            },
        });
    }

    getCompletedOrderList(showLoadingIndicator = true): Observable<CompletedOrdersList> {
        return this.apiService.get<CompletedOrdersList>({
            uri: `${this.controller}/CompletedOrderList`,
            options: {
                context: new HttpContext().set(SKIP_LOADING, !showLoadingIndicator),
            },
        });
    }

    getPendingOrderByNumber(orderNumber: string): Observable<DeviceOrder> {
        return this.apiService.get<DeviceOrder>({
            uri: `${this.controller}/GetPendingOrderByNumber?orderNumber=${orderNumber}`,
        });
    }

    getCompletedOrderByNumber(orderNumber: string): Observable<DeviceOrder> {
        return this.apiService.get<DeviceOrder>({
            uri: `${this.controller}/GetCompletedOrderByNumber?orderNumber=${orderNumber}`,
        });
    }

    getOrderByEmail(emailAddress: string): Observable<DeviceOrder[]> {
        return this.apiService.get<DeviceOrder[]>({
            uri: `${this.controller}/GetOrderByEmail?emailAddress=${encodeURIComponent(emailAddress)}`,
        });
    }

    getOrderByDeviceSerialNumber(serialNumber: string): Observable<DeviceOrder> {
        return this.apiService.get<DeviceOrder>({
            uri: `${this.controller}/GetOrderByDeviceSerialNumber?serialNumber=${encodeURIComponent(serialNumber)}`,
        });
    }

    getDeviceOrderVehicles(deviceOrderSeqId: number): Observable<OrderVehicleDetails[]> {
        return this.apiService.get<OrderVehicleDetails[]>({
            uri: `${this.controller}/GetDeviceOrderVehicles?deviceOrderSeqID=${deviceOrderSeqId}`,
        });
    }

    validateDevice(request: ValidateDeviceForFulfillmentRequest): Observable<ValidateDeviceForFulfillmentResponse> {
        return this.apiService.post<ValidateDeviceForFulfillmentResponse>({
            uri: `${this.controller}/ValidateDevice`,
            payload: request
        });
    }

    saveDeviceAssignments(deviceOrderSeqId: number, vehicles: OrderVehicleDetails[], userId: string): Observable<void> {
        return this.apiService.post<void>({
            uri: `${this.controller}/SaveDeviceAssignments`,
            payload: {
                deviceOrderSeqId: deviceOrderSeqId,
                vehicles: vehicles,
                fulfilledByUserID: userId
            }
        });
    }

    printLabel(printer: string, deviceOrder: DeviceOrder): Observable<boolean> {
        return this.apiService.post<boolean>({
            uri: `${this.controller}/PrintLabel?printer=${encodeURIComponent(printer)}`,
            payload: deviceOrder
        });
    }

    downloadLabel(deviceOrder: DeviceOrder): Observable<Blob> {
        return this.apiService.post<Blob>({
            uri: `${this.controller}/DownloadLabel`,
            payload: deviceOrder,
            options: {
                responseType: 'blob' as 'json'
            }
        });
    }
}
