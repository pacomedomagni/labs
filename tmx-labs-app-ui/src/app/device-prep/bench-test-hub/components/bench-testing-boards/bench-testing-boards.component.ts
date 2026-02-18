import { Component, inject, OnInit, signal, DestroyRef } from '@angular/core';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { BenchTestService } from 'src/app/shared/services/api/bench-test/bench-test.service';
import { Board } from 'src/app/shared/data/bench-test/resources';
import { forkJoin, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { BenchTestBoardStatusDescription } from 'src/app/shared/data/bench-test/constants';
import { BenchTestBoardService } from '../../services/bench-test-board.service';
import { BenchTestActionsService } from '../../services/bench-test-actions.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BenchTestBoardStatus } from 'src/app/shared/data/bench-test/enums';
import { MatTableModule } from '@angular/material/table';

@Component({
    selector: 'tmx-bench-testing-boards',
    standalone: true,
    imports: [FormsModule, MatFormField, MatLabel, MatSelectModule, MatButtonModule, MatTableModule],
    templateUrl: './bench-testing-boards.component.html',
    styleUrls: ['./bench-testing-boards.component.scss'],
})
export class BenchTestingBoardsComponent implements OnInit {
    private benchTestService = inject(BenchTestService);
    private boardService = inject(BenchTestBoardService);
    private actionsService = inject(BenchTestActionsService);
    private destroyRef = inject(DestroyRef);

    dropdownSelectedBoard: Board | null = null;
    selectedActiveBoard: Board | null = null;
    openBoards = signal<Board[]>([]);
    activeBoards = signal<Board[]>([]);
    displayedColumns = ['boardName', 'status', 'count', 'actions'];

    get canStartBenchTest() {
        return this.dropdownSelectedBoard;
    }

    ngOnInit(): void {
        this.loadBoards();

        this.boardService.boardUpdated$
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((board) => {
                this.updateActiveBoardListItem(board);
            });

        this.boardService.boardCleared$
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                this.loadBoards();
            });
    }

    getStatusText(statusCode?: number): string {
        if (!statusCode) return 'Unknown';
        return BenchTestBoardStatusDescription.get(statusCode) || 'Unknown';
    }

    selectBoard(board: Board): void {
        this.selectedActiveBoard = board;
    }

    openBenchTestInProgress(board: Board) {
        this.boardService.updateSelectedBoard(board);
    }

    startBenchtest() {
        if (this.dropdownSelectedBoard) {
            this.actionsService
                .startBenchTest(this.dropdownSelectedBoard)
                .pipe(
                    takeUntilDestroyed(this.destroyRef),
                    tap(() => {
                        this.dropdownSelectedBoard.statusCode = BenchTestBoardStatus.Loading;
                        this.boardService.updateSelectedBoard(this.dropdownSelectedBoard);
                        this.activeBoards.update((boards) => [...boards, this.dropdownSelectedBoard]);
                        this.openBoards.update((boards) =>
                            boards.filter((b) => b.boardID !== this.dropdownSelectedBoard!.boardID),
                        );
                        this.dropdownSelectedBoard = null;
                    }),
                )
                .subscribe();
        }
    }

    loadBoards(): void {
        this.benchTestService.getBoardsByLocation(1).subscribe({
            next: (response) => {
                const allBoards = response.boards || [];
                this.openBoards.set(allBoards.filter((board) => board.statusCode === BenchTestBoardStatus.Open));

                const testingBoards = allBoards.filter((board) => board.statusCode === BenchTestBoardStatus.Running);

                if (testingBoards.length > 0) {
                    const checkRequests = testingBoards.map((board) =>
                        this.benchTestService.stopIfCompleteBenchTest(board.boardID!).pipe(
                            map((result) => ({ board, result })),
                            catchError(() => {
                                return of({ board, result: null });
                            }),
                        ),
                    );

                    forkJoin(checkRequests).subscribe({
                        next: (results) => {
                            results.forEach(({ board, result }) => {
                                if (result?.isComplete) {
                                    board.statusCode = BenchTestBoardStatus.Complete;
                                }
                            });

                            this.activeBoards.set(
                                allBoards.filter((board) => board.statusCode !== BenchTestBoardStatus.Open),
                            );
                        },
                        error: (error) => {
                            console.error('Error checking board completion:', error);
                            this.activeBoards.set(
                                allBoards.filter((board) => board.statusCode !== BenchTestBoardStatus.Open),
                            );
                        },
                    });
                } else {
                    this.activeBoards.set(allBoards.filter((board) => board.statusCode !== BenchTestBoardStatus.Open));
                }
            },
            error: (error) => {
                console.error('Error loading boards:', error);
                this.openBoards.set([]);
                this.activeBoards.set([]);
            },
        });
    }

    /** Updates the active board list with the given board */
    private updateActiveBoardListItem(board: Board) {
        if (board === null) {
            return;
        }

        this.activeBoards.update((boards) =>
            boards.map((b) => (b.boardID === board.boardID ? board : b)),
        );
    }
}
