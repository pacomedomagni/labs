import { inject, Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { Observable } from 'rxjs';
import {
    DeviceLot,
    GetDevicesByLotResponse,
    CheckinRequest,
    DeviceLotType,
    GetDeviceLotsInProgressResponse,
    DeviceActivationAction,
    DeviceLotStatus,
} from 'src/app/shared/data/lot-management/resources';
import { Resource } from 'src/app/shared/data/application/resources';
import { SKIP_ERROR_HANDLING } from '../../http-interceptors/error-interceptor';
import { HttpContext } from '@angular/common/http';

@Injectable({
    providedIn: 'root',
})
export class LotManagementService {
    private readonly controller = '/LotManagement';
    private api = inject(ApiService);

    getLotsForMarkBenchTestComplete(): Observable<GetDeviceLotsInProgressResponse> {
        return this.api.get<GetDeviceLotsInProgressResponse>({
            uri: `${this.controller}/GetLotsForMarkBenchTestComplete`,
        });
    }

    /** Lookup lot by device serial number */
    getLotByDeviceSerialNumber(deviceSerialNumber: string): Observable<DeviceLot> {
        return this.api.get<DeviceLot>({
            uri: `${this.controller}/GetLotByDeviceSerialNumber/${deviceSerialNumber}`,
        });
    }

    /** Lookup lot by lot name */
    getDeviceLot(lotName: string): Observable<DeviceLot> {
        return this.api.get<DeviceLot>({
            uri: `${this.controller}/GetDeviceLot/${lotName}`,
        });
    }

    getDevicesByLot(lotSeqId: number, lotType: DeviceLotType): Observable<GetDevicesByLotResponse> {
        return this.api.get<GetDevicesByLotResponse>({
            uri: `${this.controller}/GetDevicesByLot?lotSeqId=${lotSeqId}&lotType=${lotType}`,
        });
    }

    checkin(request: CheckinRequest): Observable<Resource> {
        return this.api.post<Resource>({
            uri: `${this.controller}/Checkin`,
            payload: request,
        });
    }

    activateAllDevicesInLot(lotSeqId: number, lotType: DeviceLotType, skipErrorHandling = false): Observable<Resource> {
        return this.api.post<Resource>({
            uri: `${this.controller}/ActivateLot`,
            payload: {
                lotSeqId: lotSeqId,
                lotType: lotType,
                action: DeviceActivationAction.Activate,
            },
            options: {
                context: new HttpContext().set(SKIP_ERROR_HANDLING, skipErrorHandling)
            }
        });
    }

    deactivateAllDevicesInLot(lotSeqId: number, lotType: DeviceLotType, skipErrorHandling = false): Observable<Resource> {
        return this.api.post<Resource>({
            uri: `${this.controller}/ActivateLot`,
            payload: {
                lotSeqId: lotSeqId,
                lotType: lotType,   
                action: DeviceActivationAction.Deactivate,
            },
            options: {
                context: new HttpContext().set(SKIP_ERROR_HANDLING, skipErrorHandling)
            }

        });
    }

    updateLotStatus(lotSeqID: number, lotType: DeviceLotType, status: DeviceLotStatus) : Observable<Resource> {
        return this.api.post<Resource>({
            uri: `${this.controller}/UpdateLot`,
            payload: {
                lotSeqId: lotSeqID,
                typeCode: lotType,
                statusCode: status,
            },
        });
    }
}
