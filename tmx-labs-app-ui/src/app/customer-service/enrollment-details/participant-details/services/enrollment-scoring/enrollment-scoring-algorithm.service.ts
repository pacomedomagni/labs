import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { VinPicklistService } from 'src/app/shared/services/api/vin-picklist/vin-picklist.service';

@Injectable({ providedIn: 'root' })
export class EnrollmentScoringAlgorithmService {
    private readonly vinPicklistService = inject(VinPicklistService);
    private readonly descriptionsSignal = toSignal(
        this.vinPicklistService.getScoringAlgorithms().pipe(
            map((response) => {
                const map = new Map<number, string>();
                for (const algorithm of response.scoringAlgorithms ?? []) {
                    map.set(algorithm.code, algorithm.description);
                }
                return map;
            }),
            catchError(() => of(new Map<number, string>())),
            shareReplay({ bufferSize: 1, refCount: true })
        ),
        { initialValue: null as Map<number, string> | null }
    );

    formatScoringAlgorithm(code: number | null | undefined): string | null {
        if (code === null || code === undefined) {
            return null;
        }

        const descriptions = this.descriptionsSignal();
        if (!descriptions) {
            return null;
        }

        const description = descriptions.get(code);
        if (description) {
            return description;
        }

        return `Algorithm ${code}`;
    }
}
