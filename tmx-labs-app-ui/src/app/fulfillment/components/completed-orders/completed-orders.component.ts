import { Component, ViewChild, AfterViewInit, computed, signal, effect, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { provideNativeDateAdapter } from '@angular/material/core';
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
    MatInputModule,
    MatProgressSpinnerModule
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './completed-orders.component.html',
  styleUrl: './completed-orders.component.scss'
})
export class CompletedOrdersComponent implements AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  orderData = input<CompletedOrdersList | null>(null);
  orderSelected = output<CompletedDeviceOrder>();

  displayedColumns: string[] = ['orderNumber', 'processedDateTime', 'shipDateTime', 'processedBy', 'state', 'deviceCount', 'devices'];
  dataSource = new MatTableDataSource<CompletedDeviceOrder>();

  // Filter state signals
  selectedProcessedBy = signal<string[]>([]);
  startDate = signal<Date>(new Date());
  endDate = signal<Date>(new Date());

  // Computed: available processed-by users from API response
  availableProcessedBy = computed<ProcessedByUser[]>(() => {
    const data = this.orderData();
    return data?.processedByUsers ?? [];
  });

  // Computed: whether filters are at their default values
  isFilterDefault = computed(() => {
    const today = new Date();
    const start = this.startDate();
    const end = this.endDate();
    return this.selectedProcessedBy().length === 0
      && start.toDateString() === today.toDateString()
      && end.toDateString() === today.toDateString();
  });

  // Computed: client-side filtered orders (date range + ProcessedBy)
  filteredOrders = computed(() => {
    const data = this.orderData();
    if (!data) return [];

    let result = data.orders;

    // Date range filter
    const start = this.startDate();
    const end = this.endDate();
    const startDate = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const endDate = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    result = result.filter(o => {
      if (!o.processedDateTime) return false;
      const processed = new Date(o.processedDateTime);
      const processedDate = new Date(processed.getFullYear(), processed.getMonth(), processed.getDate());
      return processedDate >= startDate && processedDate <= endDate;
    });

    // ProcessedBy filter
    const processedBy = this.selectedProcessedBy();
    if (processedBy.length > 0) {
      result = result.filter(o => processedBy.includes(o.processedByUserID));
    }

    return result;
  });

  // Computed: count after client-side filtering
  completedOrderCount = computed(() => this.filteredOrders().length);

  // Computed: display names for selected processed-by users (for print)
  selectedProcessedByNames = computed(() => {
    const selected = this.selectedProcessedBy();
    if (selected.length === 0) return 'ALL';
    const users = this.availableProcessedBy();
    return selected
      .map(id => users.find(u => u.userID === id)?.displayName ?? id)
      .join(', ');
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

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    // Default sort: processedDateTime descending
    this.sort.active = 'processedDateTime';
    this.sort.direction = 'desc';
    this.sort.sortChange.emit({ active: 'processedDateTime', direction: 'desc' });

    this.dataSource.sortingDataAccessor = (item: CompletedDeviceOrder, property: string) => {
      switch (property) {
        case 'processedDateTime': return item.processedDateTime ? new Date(item.processedDateTime).getTime() : 0;
        case 'shipDateTime': return item.shipDateTime ? new Date(item.shipDateTime).getTime() : 0;
        case 'orderNumber': return parseInt(item.orderNumber, 10);
        default: return (item as any)[property];
      }
    };

  }

  onStartDateChange(date: Date | null): void {
    if (!date) return;
    this.startDate.set(date);
    if (this.endDate() < date) {
      this.endDate.set(date);
    }
  }

  onEndDateChange(date: Date | null): void {
    if (!date) return;
    this.endDate.set(date);
  }

  clearFilters(): void {
    const today = new Date();
    this.selectedProcessedBy.set([]);
    this.startDate.set(today);
    this.endDate.set(today);
  }

  onOrderClick(event: Event, order: CompletedDeviceOrder): void {
    event.preventDefault();
    this.orderSelected.emit(order);
  }

  downloadCsv(): void {
    const orders = this.filteredOrders();
    if (orders.length === 0) return;

    const headers = ['Order #', 'Processed Date', 'Shipped Date', 'Processed By', 'State', 'Device Count', 'Devices'];
    const rows = orders.map(o => [
      o.orderNumber,
      o.processedDateTime ? new Date(o.processedDateTime).toLocaleDateString() : '',
      o.shipDateTime ? new Date(o.shipDateTime).toLocaleDateString() : '',
      o.processedBy,
      o.state,
      o.deviceCount.toString(),
      (o.deviceSerialNumbers ?? []).join('; ')
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${(cell ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    const dateStr = this.formatDateForFilename(this.startDate());
    const selectedUsers = this.selectedProcessedBy();
    const userPart = selectedUsers.length === 1 ? selectedUsers[0] : 'ALL';

    link.href = url;
    link.download = `Orders_${dateStr}_${userPart}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  printOrders(): void {
    window.print();
  }

  private formatDateForFilename(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}${m}${d}`;
  }
}
