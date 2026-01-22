import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DayOfWeekTripSummary, TripDetail, TripDetailsForParticipantResponse, TripDetailsGPSResponse, TripsResponse } from 'src/app/shared/data/participant/resources';
import { ApiService } from '../api.service';

@Injectable({
    providedIn: 'root',
})
export class TripsService {
    private readonly controller = '/Trips';
    private api = inject(ApiService);

    getWeekdayTripSummary(participantSeqId: number): Observable<DayOfWeekTripSummary[]> {
        return this.api.get<DayOfWeekTripSummary[]>({
            uri: `${this.controller}/GetWeekdayTripSummary?participantSeqId=${participantSeqId}`,
        });
    }

    getTrips(participantSeqId: number): Observable<TripsResponse> {
        return this.api.get<TripsResponse>({
            uri: `${this.controller}/GetTripsByParticipant?participantSeqId=${participantSeqId}`,
        });
    }

    getTripDetailsForParticipant(participantSeqId: number, startDateTime: Date, endDateTime: Date, SpeedDistanceUnit: string): Observable<TripDetailsForParticipantResponse> {
        return this.api.post<TripDetailsForParticipantResponse>({
            uri: `${this.controller}/GetTripDetailsForParticipant`,
            payload: { 
                StartDateTime: startDateTime,
                EndDateTime: endDateTime,
                SpeedDistanceUnit: SpeedDistanceUnit,
                ParticipantSequenceId: participantSeqId
            }
        });
    }

    getTripDetails(tripSeqId: number, unit:string): Observable<TripDetail[]> {
        return this.api.get<TripDetail[]>({
            uri: `${this.controller}/GetTripDetails?tripSeqId=${tripSeqId}&units=${unit}`,
        });
    }

    getTripDetailsGPS(tripSeqID: number): Observable<TripDetailsGPSResponse> {
        return this.api.get<TripDetailsGPSResponse>({
            uri: `${this.controller}/GetTripDetailsGPS?tripSeqID=${tripSeqID}`,
        });
    }
}
