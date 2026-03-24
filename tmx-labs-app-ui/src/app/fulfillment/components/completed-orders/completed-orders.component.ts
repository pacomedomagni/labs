import { Component, ViewChild, AfterViewInit, computed, effect, input, output, inject } from '@angular/core';
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
import { DeviceOrder, CompletedOrdersList, ProcessedByUser } from '../../../shared/data/fulfillment/resources';
import { OrderFilterService } from '../../services/order-filter.service';

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

  private orderFilterService = inject(OrderFilterService);
  private filterState = this.orderFilterService.createCompletedOrderFilterState();

  orderData = input<CompletedOrdersList | null>(null);
  searchResultStartDate = input<Date | null>(null);
  orderSelected = output<{ order: DeviceOrder; filteredOrders: DeviceOrder[] }>();

  displayedColumns: string[] = ['orderNumber', 'processedDateTime', 'shipDateTime', 'processedBy', 'state', 'deviceCount', 'devices'];
  dataSource = new MatTableDataSource<DeviceOrder>();

  // Expose filter state from service
  unappliedProcessedBy = this.filterState.unappliedProcessedBy;
  unappliedStartDate = this.filterState.unappliedStartDate;
  unappliedEndDate = this.filterState.unappliedEndDate;
  appliedProcessedBy = this.filterState.appliedProcessedBy;
  appliedStartDate = this.filterState.appliedStartDate;
  appliedEndDate = this.filterState.appliedEndDate;
  isUnappliedFilterDefault = this.filterState.isUnappliedFilterDefault;
  isAppliedFilterDefault = this.filterState.isAppliedFilterDefault;
  hasUnappliedChanges = this.filterState.hasUnappliedChanges;

  // True when the unapplied end date is before the unapplied start date
  endDateInvalid = computed(() => this.unappliedEndDate() < this.unappliedStartDate());

  // Computed: available processed-by users from API response
  availableProcessedBy = computed<ProcessedByUser[]>(() => {
    const data = this.orderData();
    return data?.processedByUsers ?? [];
  });

  // Computed: client-side filtered orders (date range + ProcessedBy)
  filteredOrders = computed(() => {
    const data = this.orderData();
    if (!data) return [];

    let result = data.orders;

    // Date range filter
    const start = this.appliedStartDate();
    const end = this.appliedEndDate();
    const startDate = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const endDate = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    result = result.filter(o => {
      if (!o.processedDateTime) return false;
      const processed = new Date(o.processedDateTime);
      const processedDate = new Date(processed.getFullYear(), processed.getMonth(), processed.getDate());
      return processedDate >= startDate && processedDate <= endDate;
    });

    // ProcessedBy filter
    const processedBy = this.appliedProcessedBy();
    if (processedBy.length > 0) {
      result = result.filter(o => processedBy.includes(o.processedByUserID));
    }

    return result;
  });

  // Computed: count after client-side filtering
  completedOrderCount = computed(() => this.filteredOrders().length);

  // Computed: display names for selected processed-by users (for print)
  selectedProcessedByNames = computed(() => {
    const selected = this.appliedProcessedBy();
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

    effect(() => {
      const date = this.searchResultStartDate();
      if (date) {
        this.unappliedStartDate.set(date);
        this.appliedStartDate.set(date);
      }
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.dataSource.sortingDataAccessor = (item: DeviceOrder, property: string) => {
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
    this.unappliedStartDate.set(date);
    if (this.unappliedEndDate() < date) {
      this.unappliedEndDate.set(date);
    }
  }

  onEndDateChange(date: Date | null): void {
    if (!date) return;
    this.unappliedEndDate.set(date);
  }

  applyFilters(): void {
    this.filterState.applyFilters();
  }

  clearFilters(): void {
    this.filterState.clearFilters();
  }

  onOrderClick(event: Event, order: DeviceOrder): void {
    event.preventDefault();
    this.orderSelected.emit({ order, filteredOrders: this.filteredOrders() });
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
      (o.deviceCount ?? 0).toString(),
      (o.deviceSerialNumbers ?? []).join('; ')
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${(cell ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    const dateStr = this.formatDateForFilename(this.appliedStartDate());
    const selectedUsers = this.appliedProcessedBy();
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
