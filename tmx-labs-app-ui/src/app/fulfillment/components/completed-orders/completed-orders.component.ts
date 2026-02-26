import { Component, ViewChild, AfterViewInit, OnInit, computed, signal, effect, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CompletedDeviceOrder, CompletedOrdersList, ProcessedByUser } from '../../../shared/data/fulfillment/resources';

@Component({
  selector: 'tmx-completed-orders',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatSelectModule,
    MatFormFieldModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './completed-orders.component.html',
  styleUrl: './completed-orders.component.scss'
})
export class CompletedOrdersComponent implements AfterViewInit, OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Inputs from parent
  orderData = input<CompletedOrdersList | null>(null);
  loading = input<boolean>(false);

  // Outputs to parent
  dateRangeChanged = output<{ startDate: Date; endDate: Date }>();
  orderSelected = output<CompletedDeviceOrder>();

  displayedColumns: string[] = [
    'orderNumber', 'processedDateTime', 'shipDateTime',
    'processedBy', 'state', 'deviceCount', 'devices'
  ];
  dataSource = new MatTableDataSource<CompletedDeviceOrder>();

  // Filter state signals
  selectedProcessedBy = signal<string[]>([]);
  startDate = signal<Date>(new Date());
  endDate = signal<Date>(new Date());

  // Computed: available "Processed By" options from the data
  availableProcessedBy = computed<ProcessedByUser[]>(() => {
    return this.orderData()?.processedByUsers ?? [];
  });

  // Computed: whether filters are at default values
  isFilterDefault = computed(() => {
    const today = new Date();
    const sameStart = this.isSameDay(this.startDate(), today);
    const sameEnd = this.isSameDay(this.endDate(), today);
    return this.selectedProcessedBy().length === 0 && sameStart && sameEnd;
  });

  // Computed: filtered orders (ProcessedBy filter is client-side)
  filteredOrders = computed(() => {
    let result = this.orderData()?.orders ?? [];
    const selected = this.selectedProcessedBy();
    if (selected.length > 0) {
      result = result.filter(o => selected.includes(o.processedByUserID));
    }
    return result;
  });

  // Computed: count for subheader
  completedOrderCount = computed(() => this.filteredOrders().length);

  // Computed: resolved display names for selected ProcessedBy users (for print)
  selectedProcessedByNames = computed(() => {
    const selected = this.selectedProcessedBy();
    if (selected.length === 0) return [];
    const users = this.availableProcessedBy();
    return selected.map(id => {
      const user = users.find(u => u.userID === id);
      return user ? user.displayName : id;
    });
  });

  constructor() {
    effect(() => {
      const data = this.filteredOrders();
      this.dataSource.data = data;

      if (this.paginator) {
        this.paginator.firstPage();
      }
    });
  }

  ngOnInit() {
    this.emitDateRange();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    // Default sort: processedDateTime descending (most recent first)
    this.sort.active = 'processedDateTime';
    this.sort.direction = 'desc';
    this.sort.sortChange.emit({ active: 'processedDateTime', direction: 'desc' });

    this.dataSource.sortingDataAccessor = (item: CompletedDeviceOrder, property: string) => {
      switch (property) {
        case 'processedDateTime': return item.processedDateTime ? new Date(item.processedDateTime).getTime() : 0;
        case 'shipDateTime': return item.shipDateTime ? new Date(item.shipDateTime).getTime() : 0;
        case 'orderNumber': return parseInt(item.orderNumber, 10);
        case 'processedBy': return item.processedBy?.toLowerCase() ?? '';
        case 'state': return item.state;
        default: return (item as any)[property];
      }
    };
  }

  onStartDateChange(date: Date | null) {
    if (date) {
      this.startDate.set(date);
      if (this.endDate() < date) {
        this.endDate.set(date);
      }
      this.emitDateRange();
    }
  }

  onEndDateChange(date: Date | null) {
    if (date) {
      this.endDate.set(date);
      this.emitDateRange();
    }
  }

  clearFilters() {
    const today = new Date();
    this.selectedProcessedBy.set([]);
    this.startDate.set(today);
    this.endDate.set(today);
    this.emitDateRange();
  }

  onOrderClick(event: Event, order: CompletedDeviceOrder) {
    event.preventDefault();
    this.orderSelected.emit(order);
  }

  downloadCsv() {
    const orders = this.filteredOrders();
    const start = this.startDate();
    const dateStr = `${start.getFullYear()}${String(start.getMonth() + 1).padStart(2, '0')}${String(start.getDate()).padStart(2, '0')}`;

    const selectedUsers = this.selectedProcessedBy();
    const userPart = selectedUsers.length === 1 ? selectedUsers[0] : 'ALL';
    const filename = `Orders_${dateStr}_${userPart}.csv`;

    const headers = ['Order #', 'Processed Date', 'Shipped Date', 'Processed By', 'State', 'Device Count', 'Devices'];
    const rows = orders.map(o => [
      o.orderNumber,
      o.processedDateTime ? new Date(o.processedDateTime).toLocaleString() : '',
      o.shipDateTime ? new Date(o.shipDateTime).toLocaleString() : '',
      o.processedBy,
      o.state,
      o.deviceCount.toString(),
      o.deviceSerialNumbers.join('; ')
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${(cell ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  printOrders() {
    window.print();
  }

  private emitDateRange() {
    this.dateRangeChanged.emit({
      startDate: this.startDate(),
      endDate: this.endDate()
    });
  }

  private isSameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear()
      && a.getMonth() === b.getMonth()
      && a.getDate() === b.getDate();
  }
}
