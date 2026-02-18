import {
    Component,
    signal,
    ViewChild,
    WritableSignal,
} from '@angular/core';
import { BenchTestingBoardsComponent } from './components/bench-testing-boards/bench-testing-boards.component';
import { LotBenchtestProgressComponent } from './components/lot-benchtest-progress/lot-benchtest-progress.component';
import { BenchTestCurrentBoardComponent } from './components/bench-test-current-board/bench-test-current-board.component';
import { Board } from 'src/app/shared/data/bench-test/resources';

@Component({
    selector: 'tmx-device-bench-test-hub',
    standalone: true,
    imports: [
        BenchTestingBoardsComponent,
        LotBenchtestProgressComponent,
        BenchTestCurrentBoardComponent,
    ],
    templateUrl: './device-bench-test-hub.component.html',
    styleUrls: ['./device-bench-test-hub.component.scss'],
})
export class TmxDeviceBenchTestHubComponent {
    @ViewChild('benchTestingBoards') benchTestingBoards!: BenchTestingBoardsComponent;

    currentBoard: WritableSignal<Board | null> = signal<Board | null>(null);

    currentBoardSelected(board: Board) {
        this.currentBoard.set(board);
    }
}
