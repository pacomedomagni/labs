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
    findLot(deviceSerialNumber: string): Observable<DeviceLot> {
        return this.api.get<DeviceLot>({
            uri: `${this.controller}/FindLot/${deviceSerialNumber}`,
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

    activateAllDevicesInLot(lotSeqId: number): Observable<Resource> {
        return this.api.post<Resource>({
            uri: `${this.controller}/ActivateLot`,
            payload: {
                lotSeqId: lotSeqId,
                action: DeviceActivationAction.Activate,
            },
        });
    }

    deactivateAllDevicesInLot(lotSeqId: number): Observable<Resource> {
        return this.api.post<Resource>({
            uri: `${this.controller}/ActivateLot`,
            payload: {
                lotSeqId: lotSeqId,
                action: DeviceActivationAction.Deactivate,
            },
        });
    }

    updateLotStatus(lotSeqID: number, lotType: number, status: DeviceLotStatus) : Observable<Resource> {
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
