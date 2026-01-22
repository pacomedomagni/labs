import { Component, inject, OnInit } from "@angular/core";
import { MatFormField, MatLabel } from "@angular/material/form-field";
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from "@angular/forms";
import { BenchTestService } from "src/app/shared/services/api/bench-test/bench-test.service";
import { Board } from "src/app/shared/data/bench-test/resources";
import { BenchTestBaoardStatus } from "src/app/shared/data/device/enums";
import { forkJoin, of } from "rxjs";
import { map, catchError } from "rxjs/operators";

@Component({
  selector: "tmx-bench-testing-boards",
  standalone: true,
  imports: [
    FormsModule,
    MatFormField,
    MatLabel,
    MatSelectModule,
    MatButtonModule
  ],
  templateUrl: "./bench-testing-boards.component.html",
  styleUrls: ["./bench-testing-boards.component.scss"]
})
export class BenchTestingBoardsComponent implements OnInit {
  private benchTestService = inject(BenchTestService);
  
  selectedBoard: Board | null = null;
  selectedActiveBoard: Board | null = null;
  openBoards: Board[] = [];
  activeBoards: Board[] = [];

  private statusTextMap = new Map<number, string>([
    [1, BenchTestBaoardStatus.Available],
    [2, BenchTestBaoardStatus.Testing],
    [3, BenchTestBaoardStatus.Complete],
  ]);

  ngOnInit(): void {
    this.loadBoards();
  }

  getStatusText(statusCode?: number): string {
    if (!statusCode) return 'Unknown';
    return this.statusTextMap.get(statusCode) || 'Unknown';
  }

  selectBoard(board: Board): void {
    this.selectedActiveBoard = board;
  }

  private loadBoards(): void {
    this.benchTestService.getBoardsByLocation(1).subscribe({
      next: (response) => {
        const allBoards = response.boards || [];
        this.openBoards = allBoards.filter(board => board.statusCode === 1);
        
        const testingBoards = allBoards.filter(board => board.statusCode === 2);
        
        if (testingBoards.length > 0) {
          const checkRequests = testingBoards.map(board => 
            this.benchTestService.stopIfCompleteBenchTest(board.boardID!).pipe(
              map(result => ({ board, result })),
              catchError(error => {
                console.error(`Error checking board ${board.boardID}:`, error);
                return of({ board, result: null });
              })
            )
          );

          forkJoin(checkRequests).subscribe({
            next: (results) => {
              results.forEach(({ board, result }) => {
                if (result?.isComplete) {
                  board.statusCode = 3;
                }
              });
              
              this.activeBoards = allBoards.filter(board => board.statusCode !== 1);
            },
            error: (error) => {
              console.error('Error checking board completion:', error);
              this.activeBoards = allBoards.filter(board => board.statusCode !== 1);
            }
          });
        } else {
          this.activeBoards = allBoards.filter(board => board.statusCode !== 1);
        }
      },
      error: (error) => {
        console.error('Error loading boards:', error);
        this.openBoards = [];
        this.activeBoards = [];
      }
    });
  }
}
