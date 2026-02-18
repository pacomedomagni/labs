import { inject, Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { Observable } from 'rxjs';
import {
    GetBoardsByLocationResponse,
    AddBenchTestBoardRequest,
    BenchTestBoardResponse,
    Resource,
    StopIfCompleteBenchTestResponse,
    BenchTestBoardDevice,
    Board,
} from 'src/app/shared/data/bench-test/resources';
import { VerifyBenchTestRequest, VerifyBenchTestResponse } from 'src/app/shared/data/lot-management/resources';

@Injectable({
    providedIn: 'root',
})
export class BenchTestService {
    private readonly controller = '/BenchTest';
    private api = inject(ApiService);

    addBenchTestBoard(request: AddBenchTestBoardRequest): Observable<BenchTestBoardResponse> {
        return this.api.post<BenchTestBoardResponse>({
            uri: `${this.controller}/AddBoard`,
            payload: request,
        });
    }

    updateBenchTestBoard(board: Partial<Board>): Observable<Resource> {
        return this.api.put<Resource>({
            uri: `${this.controller}/UpdateBoard`,
            payload: { board: board},
        });
    }

    deleteBenchTestBoard(boardId: number): Observable<Resource> {
        return this.api.delete<Resource>({
            uri: `${this.controller}/DeleteBoard/${boardId}`,
        });
    }

    getBenchTestBoard(boardId: number): Observable<BenchTestBoardResponse> {
        return this.api.get<BenchTestBoardResponse>({
            uri: `${this.controller}/GetBoard/${boardId}`,
        });
    }

    getBoardsByLocation(locationCode: number): Observable<GetBoardsByLocationResponse> {
        return this.api.get<GetBoardsByLocationResponse>({
            uri: `${this.controller}/GetBoardsByLocation/${locationCode}`,
        });
    }

    addBenchTest(boardId: number, devices: BenchTestBoardDevice[]): Observable<Resource> {
        return this.api.post<Resource>({
            uri: `${this.controller}/AddTest`,
            payload: {
                benchTest:{ boardId: boardId, devices: devices }
            }
        });
    }

    stopBenchTest(boardId: number): Observable<Resource> {
        return this.api.post<Resource>({
            uri: `${this.controller}/StopTest/${boardId}`,
        });
    }

    clearBenchTest(boardId: number): Observable<Resource> {
        return this.api.post<Resource>({
            uri: `${this.controller}/ClearTest/${boardId}`,
        });
    }

    stopIfCompleteBenchTest(boardId: number): Observable<StopIfCompleteBenchTestResponse> {
        return this.api.post<StopIfCompleteBenchTestResponse>({
            uri: `${this.controller}/StopIfCompleteTest/${boardId}`,
        });
    }

    verifyBenchTest(request: VerifyBenchTestRequest): Observable<VerifyBenchTestResponse> {
        return this.api.post<VerifyBenchTestResponse>({
            uri: `${this.controller}/VerifyBenchTest`,
            payload: request,
        });
    }
    
}
