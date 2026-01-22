import { inject, Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { Observable } from 'rxjs';
import { AddAccountParticipantRequest, ParticipantOptOutRequest, UpdateParticipantNicknameRequest, UpdateParticipantNicknameResponse, UpdateVehicleStatusRequest } from 'src/app/shared/data/participant/resources';
import { UpdateVehicleRequest, UpdateVehicleResponse } from 'src/app/shared/data/vehicle/resources';
import { Resource } from 'src/app/shared/data/application/resources';


@Injectable({
    providedIn: 'root',
})
export class ParticipantService {
    private readonly controller = '/Participant';
    private api = inject(ApiService);

    addParticipant(vehicle: AddAccountParticipantRequest): Observable<void> {
        return this.api.post<void>({
            uri: `${this.controller}/Add`,
            payload: vehicle,
        });
    }

    updateParticipantNickname(request: UpdateParticipantNicknameRequest): Observable<UpdateParticipantNicknameResponse> {
        return this.api.put<UpdateParticipantNicknameResponse>({
            uri: `${this.controller}/updateParticipantNickname`,
            payload: request,
        });
    }

    updateVehicle(request: UpdateVehicleRequest): Observable<UpdateVehicleResponse> {
        return this.api.put<UpdateVehicleResponse>({
            uri: `${this.controller}/EditVehicle`,
            payload: request,
        });
    }

    optOut(request: ParticipantOptOutRequest): Observable<Resource> {
        return this.api.post<Resource>({
            uri: `${this.controller}/OptOut`,
            payload: request,
        });
    }

    deleteVehicle(request: UpdateVehicleStatusRequest): Observable<Resource> {
        return this.api.post<Resource>({
            uri: `${this.controller}/UpdateVehicleStatus`,
            payload: request,
        });
    }
}
 