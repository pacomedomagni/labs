import { inject, Injectable } from '@angular/core';
import { map, Observable, of, switchMap, tap } from 'rxjs';
import { BenchTestBoardDevice, Board, Resource } from 'src/app/shared/data/bench-test/resources';
import { BenchTestService } from 'src/app/shared/services/api/bench-test/bench-test.service';
import { BenchTestDeviceStatusService } from '../components/bench-test-current-board/services/bench-test-device-status.service';
import { DialogService } from 'src/app/shared/services/dialogs/primary/dialog.service';
import { BenchTestBoardService } from './bench-test-board.service';
import { BenchTestBoardStatus } from 'src/app/shared/data/bench-test/enums';

@Injectable({
    providedIn: 'root',
})
export class BenchTestActionsService {
    private readonly dialogService = inject(DialogService);
    private readonly boardService = inject(BenchTestBoardService);
    private readonly activeBoardService = inject(BenchTestBoardService);
    private readonly benchTestService = inject(BenchTestService);
    private readonly deviceStatusService = inject(BenchTestDeviceStatusService);

    /** Clear the board after confirmation. If board is successfully cleared, true is emitted, otherwise false */
    clearBoard(boardId: number): Observable<boolean> {
        return this.dialogService
            .openConfirmationDialog({
                title: 'Clear Board',
                message: 'Are you sure you want to clear the board?',
                confirmText: 'Yes',
                cancelText: 'Cancel',
            })
            .afterClosed()
            .pipe(
                switchMap((confirmed) => {
                    if (confirmed) {
                        return this.benchTestService.clearBenchTest(boardId).pipe(
                            tap(() => {
                                this.boardService.clearBoard();
                            }),
                            map(() => true),
                        );
                    }
                    return of(false);
                }),
            );
    }

    /** Starts a bench test on a board and begins polling for status updates */
    runTest(boardId: number, devices: BenchTestBoardDevice[]): Observable<void> {
        return this.benchTestService.addBenchTest(boardId, devices).pipe(
            tap(() => {
                this.activeBoardService.updateBoardStatus(BenchTestBoardStatus.Running);
                this.deviceStatusService.startPolling(boardId);
            }),
            map(() => void 0),
        );
    }

    /** Stops an active test from running and updates status to complete */
    stopTest(boardId: number): Observable<void> {
        return this.benchTestService.stopBenchTest(boardId).pipe(
            tap(() => {
                this.activeBoardService.updateBoardStatus(BenchTestBoardStatus.Complete);
                this.deviceStatusService.stopPolling();
            }),
            map(() => void 0),
        );
    }

    /** Adds an open board to the list of active boards with status Loading */
    startBenchTest(board: Board): Observable<Resource> {
        return this.benchTestService.updateBenchTestBoard({
            boardID: board.boardID,
            statusCode: BenchTestBoardStatus.Running
        });
    }
}
