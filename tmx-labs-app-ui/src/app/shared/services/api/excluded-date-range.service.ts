import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ExcludedDateRange } from 'src/app/shared/data/participant/resources';

export interface ExcludedDateRangeCreateCommand {
    participantSeqId: number;
    rangeStart: string;
    rangeEnd: string;
    description?: string | null;
}

export interface ExcludedDateRangeUpdateCommand {
    participantSeqId: number;
    rangeStart: string;
    rangeEnd: string;
    description?: string | null;
    originalRangeStart?: string | null;
}

interface ExcludedDateRangeDeleteCommand {
    participantSeqId: number;
    rangeStart: string;
}

@Injectable({ providedIn: 'root' })
export class ExcludedDateRangeService {
    private readonly controller = '/ExcludedDateRanges';
    private api = inject(ApiService);

    getExcludedDateRanges(participantSeqId: number): Observable<ExcludedDateRange[]> {
        const uri = `${this.controller}/GetByParticipant?participantSeqId=${participantSeqId}`;
        return this.api.get<ExcludedDateRange[]>({ uri });
    }

    createExcludedDateRange(participantSeqId: number, rangeStart: string, rangeEnd: string, description?: string): Observable<ExcludedDateRange> {
        const uri = `${this.controller}/Insert`;
        const payload: ExcludedDateRangeCreateCommand = {
            participantSeqId,
            rangeStart,
            rangeEnd,
            description,
        };
        return this.api.post<ExcludedDateRange>({ uri, payload });
    }

    updateExcludedDateRange(payload: ExcludedDateRangeUpdateCommand): Observable<ExcludedDateRange> {
        const uri = `${this.controller}/Update`;
        return this.api.post<ExcludedDateRange>({ uri, payload });
    }

    deleteExcludedDateRange(participantSeqId: number, rangeStartDateTime: string): Observable<void> {
        const uri = `${this.controller}/Delete`;
        const payload: ExcludedDateRangeDeleteCommand = {
            participantSeqId,
            rangeStart: rangeStartDateTime,
        };
        return this.api.post<void>({ uri, payload });
    }
}
