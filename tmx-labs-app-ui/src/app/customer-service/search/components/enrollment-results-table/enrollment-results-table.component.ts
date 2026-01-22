import { AfterViewInit, Component, effect, input, output, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CustomerInfo } from 'src/app/shared/data/participant/resources';

@Component({
  selector: 'tmx-enrollment-results-table',
  imports: [MatPaginator, MatTableModule, MatButtonModule],
  templateUrl: './enrollment-results-table.component.html',
  styleUrl: './enrollment-results-table.component.scss',
})
export class EnrollmentResultsTableComponent implements AfterViewInit {
  data = input<CustomerInfo[]>([]);
  viewParticipant = output<CustomerInfo>();

  dataSource = new MatTableDataSource<CustomerInfo>();
  displayedColumns: string[] = ['fullName', 'email', 'actions'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor() {
    effect(() => {
      this.dataSource.data = this.data();
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  onViewParticipant(element: CustomerInfo): void {
    this.viewParticipant.emit(element);
  }
}
