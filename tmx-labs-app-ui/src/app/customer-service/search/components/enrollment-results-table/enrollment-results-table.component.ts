import { AfterViewInit, Component, computed, effect, ElementRef, inject, input, output, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { CustomerInfo } from 'src/app/shared/data/participant/resources';

@Component({
  selector: 'tmx-enrollment-results-table',
  imports: [MatPaginator, MatTableModule, MatButtonModule],
  templateUrl: './enrollment-results-table.component.html',
  styleUrl: './enrollment-results-table.component.scss',
})
export class EnrollmentResultsTableComponent implements AfterViewInit {
  private liveAnnouncer = inject(LiveAnnouncer);

  data = input<CustomerInfo[]>([]);
  viewParticipant = output<CustomerInfo>();

  dataSource = new MatTableDataSource<CustomerInfo>();
  displayedColumns: string[] = ['fullName', 'email', 'actions'];

  recordCount = computed(() => this.data().length);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('resultsTable') resultsTable?: ElementRef<HTMLTableElement>;

  constructor() {
    effect(() => {
      const results = this.data();
      this.dataSource.data = results;
      
      // Announce results to screen reader and set focus
      if (results.length > 0) {
        const message = `${results.length} ${results.length === 1 ? 'result' : 'results'} found. Navigate to table to review results.`;
        this.liveAnnouncer.announce(message, 'assertive').then(() => {
          // Set focus to table after announcement
          setTimeout(() => {
            this.resultsTable?.nativeElement.focus();
          }, 300);
        });
      }
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  onViewParticipant(element: CustomerInfo): void {
    this.viewParticipant.emit(element);
  }
}
