import { inject, Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { Observable } from 'rxjs/internal/Observable';
import { Resource } from 'src/app/shared/data/application/resources';

@Injectable({
    providedIn: 'root',
})
export class DeviceService {
    private readonly controller = '/Device';
    private api = inject(ApiService);

    activateDevice(
        deviceSerialNumber: string
    ): Observable<Resource> {
        return this.api.post<Resource>({
            uri: `${this.controller}/Activate`,
            payload: {
              deviceSerialNumber: deviceSerialNumber
            },
        });
    }

    deactivateDevice(
        deviceSerialNumber: string
    ): Observable<Resource> {
        return this.api.post<Resource>({
            uri: `${this.controller}/Deactivate`,
            payload: {
              deviceSerialNumber: deviceSerialNumber
            },
        });
    }

    markDefective(deviceSerialNumber: string, participantSequenceId: number): Observable<Resource> {
        return this.api.post<Resource>({
            uri: `${this.controller}/MarkDefective`,
            payload: {
                DeviceSerialNumber: deviceSerialNumber,
                ParticipantSequenceId: participantSequenceId,
            },
        });
    }

    markAbandoned(deviceSerialNumber: string, participantSequenceId: number): Observable<Resource> {
        return this.api.post<Resource>({
            uri: `${this.controller}/MarkAbandoned`,
            payload: {
                DeviceSerialNumber: deviceSerialNumber,
                ParticipantSequenceId: participantSequenceId,
            },
        });
    }

    replaceDevice(participantSequenceId: number): Observable<Resource> {
        return this.api.post<Resource>({
            uri: `${this.controller}/ReplaceDevice`,
            payload: {
                ParticipantSequenceId: participantSequenceId,
            },
        });
    }

    swapDevices(
        sourceParticipantSequenceId: number,
        destinationParticipantSequenceId: number,
    ): Observable<Resource> {
        return this.api.post<Resource>({
            uri: `${this.controller}/SwapDevice`,
            payload: {
                SourceParticipantSequenceId: sourceParticipantSequenceId,
                DestinationParticipantSequenceId: destinationParticipantSequenceId,
            },
        });
    }

    pingDevice(deviceSerialNumber: string): Observable<Resource> {
        return this.api.post<Resource>({
            uri: `${this.controller}/PingDevice`,
            payload: {
                DeviceSerialNumber: deviceSerialNumber,
            },
        });
    }

    resetDevice(deviceSerialNumber: string, participantSequenceId: number): Observable<Resource> {
        return this.api.post<Resource>({
            uri: `${this.controller}/ResetDevice`,
            payload: {
                DeviceSerialNumber: deviceSerialNumber,
                ParticipantSequenceId: participantSequenceId,
            },
        });
    }

    getAudioStatusAWS(deviceSerialNumber: string): Observable<Resource> {
        return this.api.get<Resource>({
            uri: `${this.controller}/GetAudioStatusAWS?deviceSerialNumber=${deviceSerialNumber}`,
        });
    }

    setAudioStatusAWS(deviceSerialNumber: string, isAudioOn: boolean): Observable<Resource> {
        return this.api.patch<Resource>({
            uri: `${this.controller}/SetAudioStatusAWS?deviceSerialNumber=${deviceSerialNumber}&isAudioOn=${isAudioOn}`,
        });
    }

    updateAudio(deviceSerialNumber: string, isAudioOn: boolean): Observable<Resource> {
        return this.api.put<Resource>({
            uri: `${this.controller}/UpdateAudio`,
            payload: { DeviceSerialNumber: deviceSerialNumber, IsAudioOn: isAudioOn },
        });
    }
}
