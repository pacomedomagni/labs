import { inject, Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { Observable } from 'rxjs';
import { 
    DeviceLot,
    GetDevicesByLotResponse,
    CheckinRequest,
    DeviceLotType,
    GetDeviceLotsInProgressResponse
} from 'src/app/shared/data/lot-management/resources';
import { Resource } from 'src/app/shared/data/application/resources';

@Injectable({
    providedIn: 'root',
})
export class LotManagementService {
    private readonly controller = '/LotManagement';
    private api = inject(ApiService);

    GetLotsForMarkBenchTestComplete(): Observable<GetDeviceLotsInProgressResponse> {
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
}
