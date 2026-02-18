import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Board } from 'src/app/shared/data/bench-test/resources';
import { BenchTestBoardStatus } from 'src/app/shared/data/bench-test/enums';
import { BenchTestDeviceStatusService } from '../components/bench-test-current-board/services/bench-test-device-status.service';
import { distinctUntilChanged, filter } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
/** Service to manage the state and updates of the selected board */
export class BenchTestBoardService {
    private readonly deviceStatusService = inject(BenchTestDeviceStatusService);

    private boardUpdated = new BehaviorSubject<Board>(null);
    /** Emits when the selected board is updated */
    public boardUpdated$ = this.boardUpdated.asObservable();

    private boardCleared = new BehaviorSubject<Board>(null);
    /** Emits when the selected board is cleared */
    public boardCleared$ = this.boardCleared.asObservable();

    private _selectedBoard: WritableSignal<Board | null> = signal<Board | null>(null);
    /** The currently selected board, or null if no board is selected. */
    public readonly selectedBoard = this._selectedBoard.asReadonly();

    constructor() {
        // Subscribe to board status updates and reactively update the board
        this.deviceStatusService.boardStatus$
            .pipe(
                filter(status => status !== null),
                distinctUntilChanged()  // Only emit when the status actually changes to avoid infinite loading loop
            )
            .subscribe(status => {
                this.updateBoardStatus(status);
            });
    }

    clearBoard() {
        this._selectedBoard.set(null);
        this.boardCleared.next(this.selectedBoard());
    }

    updateSelectedBoard(board: Board | null): void {
        this._selectedBoard.set(board);
        this.boardUpdated.next(board);
    }

    incrementDeviceCount(): void {
        if (this._selectedBoard()) {
            this._selectedBoard.update(board => ({ ...board, deviceCount: board.deviceCount ? board.deviceCount + 1 : 1 }));
            this.boardUpdated.next(this._selectedBoard());
        }
    }

    decrementDeviceCount(): void {
        if (this._selectedBoard()) {
            this._selectedBoard.update(board => ({ ...board, deviceCount: board.deviceCount ? Math.max(0, board.deviceCount - 1) : 0 }));
            this.boardUpdated.next(this._selectedBoard());
        }
    }

    updateBoardStatus(status: BenchTestBoardStatus): void {
        if (this._selectedBoard()) {
            // Only update if status has actually changed
            if (this._selectedBoard().statusCode === status) {
                return;
            }
            this._selectedBoard.update(board => ({ ...board, statusCode: status }));
            this.boardUpdated.next(this._selectedBoard());
        }
    }
}
