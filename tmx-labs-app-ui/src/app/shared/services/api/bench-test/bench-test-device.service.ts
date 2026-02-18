import { inject, Injectable } from '@angular/core';
import { HttpContext } from '@angular/common/http';
import { ApiService } from '../api.service';
import { Observable } from 'rxjs';
import { SKIP_LOADING } from '../../http-interceptors/loading-interceptor';
import {
    BenchTestBoardDevice,
    BenchTestBoardDeviceCollectionResponse,
    BenchTestBoardDeviceStatusCollectionResponse,
    ValidateDeviceForBenchTestResponse,
} from 'src/app/shared/data/bench-test/resources';

@Injectable({
    providedIn: 'root',
})
export class BenchTestDeviceService {
    private readonly controller = '/BenchTestDevice';
    private api = inject(ApiService);

    validateDeviceForBenchTest(
        deviceId: string,
        boardId: number,
    ): Observable<ValidateDeviceForBenchTestResponse> {
        return this.api.post<ValidateDeviceForBenchTestResponse>({
            uri: `${this.controller}/ValidateDevice`,
            payload: { deviceId, boardId },
        });
    }

    getAllDevicesByBoard(boardId: number): Observable<BenchTestBoardDeviceCollectionResponse> {
        return this.api.get<BenchTestBoardDeviceCollectionResponse>({
            uri: `${this.controller}/GetAllDevicesByBoard/?boardId=${boardId}`,
        });
    }

    getAllDeviceStatusesByBoard(
        boardId: number,
    ): Observable<BenchTestBoardDeviceStatusCollectionResponse> {
        return this.api.get<BenchTestBoardDeviceStatusCollectionResponse>({
            uri: `${this.controller}/GetAllDeviceStatusesByBoard/?boardId=${boardId}`,
            options: {
                context: new HttpContext().set(SKIP_LOADING, true),
            },
        });
    }

    saveBenchTestDeviceToBoard(
        boardId: number,
        device: BenchTestBoardDevice,
    ): Observable<BenchTestBoardDeviceCollectionResponse> {
        return this.api.post<BenchTestBoardDeviceCollectionResponse>({
            uri: `${this.controller}/SaveDeviceToBoard`,
            payload: {
                boardId: boardId,
                device: device,
            },
        });
    }

    removeBenchTestDeviceFromBoard(
        boardId: number,
        locationOnBoard: number,
    ): Observable<BenchTestBoardDeviceCollectionResponse> {
        return this.api.delete<BenchTestBoardDeviceCollectionResponse>({
            uri: `${this.controller}/DeleteDeviceFromBoard/?boardId=${boardId}&locationOnBoard=${locationOnBoard}`,
        });
    }
}
