import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';

interface OrderData {
  orderNumber: string;
  orderDate: Date;
  state: string;
  deviceCount: number;
  deviceType: string;
  status: string;
}

@Component({
  selector: 'tmx-pending-orders',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSelectModule,
    MatRadioModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatButtonModule,
    FormsModule
  ],
  templateUrl: './pending-orders.component.html',
  styleUrl: './pending-orders.component.scss'
})
export class PendingOrdersComponent {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  selectedState = '';
  selectedDeviceType = 'all';
  selectedSnapshotVersion = 'all';
  pendingAssignment = false;
  readyToPrint = false;

  displayedColumns: string[] = ['orderNumber', 'orderDate', 'state', 'deviceCount', 'deviceType', 'status'];
  
  dataSource = new MatTableDataSource<OrderData>([
    {
      orderNumber: '28303829-NEW',
      orderDate: new Date('2026-01-15T11:12:37'),
      state: 'GA',
      deviceCount: 3,
      deviceType: 'J, V, W, Y, Z (J), X (1)',
      status: 'Pending Assignment'
    },
    {
      orderNumber: '82739283-NEW',
      orderDate: new Date('2026-01-17T02:11:10'),
      state: 'CT',
      deviceCount: 1,
      deviceType: 'J, V, W, Y, Z (1)',
      status: 'Pending Assignment'
    },
    {
      orderNumber: '27153283-NEW',
      orderDate: new Date('2026-01-19T03:45:22'),
      state: 'OH',
      deviceCount: 2,
      deviceType: 'J, V, W, X, Y, Z (2)',
      status: 'Pending Assignment'
    },
    {
      orderNumber: '20386323-NEW',
      orderDate: new Date('2026-01-20T08:23:03'),
      state: 'GA',
      deviceCount: 2,
      deviceType: 'J, V, W, X, Y, Z (2)',
      status: 'Pending Assignment'
    },
    {
      orderNumber: '17262728-NEW',
      orderDate: new Date('2026-01-20T11:24:40'),
      state: 'AL',
      deviceCount: 1,
      deviceType: 'J, V, W, Y, Z (1)',
      status: 'Pending Assignment'
    },
    {
      orderNumber: '83083925-NEW',
      orderDate: new Date('2026-01-21T02:41:22'),
      state: 'CO',
      deviceCount: 1,
      deviceType: 'J, V, W, Y, Z (1)',
      status: 'Pending Assignment'
    },
    {
      orderNumber: '17297292-NEW',
      orderDate: new Date('2026-01-22T03:45:22'),
      state: 'CO',
      deviceCount: 2,
      deviceType: 'J, V, W, Y, Z (1), X (1)',
      status: 'Pending Assignment'
    },
    {
      orderNumber: '28321729-NEW',
      orderDate: new Date('2026-01-22T08:23:03'),
      state: 'OH',
      deviceCount: 1,
      deviceType: 'J, V, W, X, Y, Z (1)',
      status: 'Pending Assignment'
    },
    {
      orderNumber: '72638172-NEW',
      orderDate: new Date('2026-01-22T11:24:40'),
      state: 'GA',
      deviceCount: 1,
      deviceType: 'J, V, W, Y, Z (1)',
      status: 'Pending Assignment'
    },
    {
      orderNumber: '26380192-637283',
      orderDate: new Date('2026-01-22T12:24:00'),
      state: 'GA',
      deviceCount: 2,
      deviceType: 'J, V, W, X, Y, Z (2)',
      status: 'Ready to Print'
    }
  ]);

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  clearFilters() {
    this.selectedState = '';
    this.selectedDeviceType = 'all';
    this.selectedSnapshotVersion = 'all';
    this.pendingAssignment = false;
    this.readyToPrint = false;
  }

  getPendingCount(): string {
    return `21,791 - Devices Needed: 29,033`;
  }
}
