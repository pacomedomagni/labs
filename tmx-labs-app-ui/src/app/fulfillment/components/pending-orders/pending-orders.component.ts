import { Component, ViewChild, AfterViewInit, computed, effect, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DeviceOrder } from '../../../shared/data/fulfillment/resources';
import { OrderFilterService } from '../../services/order-filter.service';

@Component({
  selector: 'tmx-pending-orders',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatSelectModule,
    MatRadioModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './pending-orders.component.html',
  styleUrl: './pending-orders.component.scss'
})
export class PendingOrdersComponent implements AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private orderFilterService = inject(OrderFilterService);
  private filterState = this.orderFilterService.createPendingOrderFilterState();

  orders = input<DeviceOrder[]>([]);
  orderSelected = output<DeviceOrder>();

  displayedColumns: string[] = ['orderNumber', 'orderDate', 'state', 'deviceCount', 'deviceType', 'status'];
  dataSource = new MatTableDataSource<DeviceOrder>();

  // Expose filter state from service
  unappliedStates = this.filterState.unappliedStates;
  unappliedDeviceType = this.filterState.unappliedDeviceType;
  unappliedSnapshotVersion = this.filterState.unappliedSnapshotVersion;
  unappliedStatuses = this.filterState.unappliedStatuses;
  appliedStates = this.filterState.appliedStates;
  appliedDeviceType = this.filterState.appliedDeviceType;
  appliedSnapshotVersion = this.filterState.appliedSnapshotVersion;
  appliedStatuses = this.filterState.appliedStatuses;
  allUnappliedStatusesSelected = this.filterState.allUnappliedStatusesSelected;
  allAppliedStatusesSelected = this.filterState.allAppliedStatusesSelected;
  isUnappliedFilterDefault = this.filterState.isUnappliedFilterDefault;
  isAppliedFilterDefault = this.filterState.isAppliedFilterDefault;
  hasUnappliedChanges = this.filterState.hasUnappliedChanges;

  // Computed: available states from unfiltered data
  availableStates = computed(() => {
    const stateSet = new Set(this.orders().map(o => o.state?.trim()).filter(s => s));
    return [...stateSet].sort();
  });

  // Computed: filtered orders based on all active filters
  filteredOrders = computed(() => {
    let result = this.orders();

    // State filter
    const states = this.appliedStates();
    if (states.length > 0) {
      result = result.filter(o => states.includes(o.state?.trim()));
    }

    // Snapshot version filter
    const version = this.appliedSnapshotVersion();
    if (version !== 'all') {
      result = result.filter(o => o.snapshotVersion === version);
    }

    // Device type filter
    const deviceType = this.appliedDeviceType();
    if (deviceType !== 'all') {
      result = result.filter(o => this.matchesDeviceType(o, deviceType));
    }

    // Order status filter
    const statuses = this.appliedStatuses();
    if (statuses.length === 0) {
      result = [];
    } else if (!this.allAppliedStatusesSelected()) {
      result = result.filter(o => statuses.includes(o.deviceOrderStatusDescription));
    }

    return result;
  });

  // Computed: subheader counts
  filteredPendingCount = computed(() => this.filteredOrders().length);

  filteredDevicesNeeded = computed(() =>
    this.filteredOrders().reduce((sum, o) => sum + o.nbrDevicesNeeded, 0)
  );

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

    // Default sort: orderDate ascending (oldest first)
    this.sort.active = 'orderDate';
    this.sort.direction = 'asc';
    this.sort.sortChange.emit({ active: 'orderDate', direction: 'asc' });

    // Custom sort accessor for proper date and status sorting
    this.dataSource.sortingDataAccessor = (item: DeviceOrder, property: string) => {
      switch (property) {
        case 'orderDate': return new Date(item.orderDate).getTime();
        case 'orderNumber': return parseInt(item.orderNumber, 10);
        case 'state': return item.state;
        case 'status': return item.deviceOrderStatusDescription;
        default: return (item as any)[property];
      }
    };
  }

  isOldOrder(order: DeviceOrder): boolean {
    const orderDate = new Date(order.orderDate);
    const now = new Date();
    const diffMs = now.getTime() - orderDate.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays > 5;
  }

  applyFilters(): void {
    this.filterState.applyFilters();
  }

  clearFilters(): void {
    this.filterState.clearFilters();
  }

  onOrderClick(event: Event, order: DeviceOrder): void {
    event.preventDefault();
    this.orderSelected.emit(order);
  }

  onStatusToggle(status: string, checked: boolean): void {
    const current = this.unappliedStatuses();
    if (checked) {
      this.unappliedStatuses.set([...current, status]);
    } else {
      this.unappliedStatuses.set(current.filter(s => s !== status));
    }
  }

  onSelectAllStatuses(checked: boolean): void {
    if (checked) {
      this.unappliedStatuses.set(['Pending Assignment', 'Ready to Print']);
    } else {
      this.unappliedStatuses.set([]);
    }
  }

  private matchesDeviceType(order: DeviceOrder, filterValue: string): boolean {
    const dt = (order.deviceType ?? '').toUpperCase();
    // W8/W9 family device types: J, V, W, Y, Z
    const hasW8W9 = /[JVWYZ]/.test(dt);
    // WX family device type: X
    const hasWX = /X/.test(dt);

    switch (filterValue) {
      case 'w8w9': return hasW8W9 && !hasWX;
      case 'wx': return hasWX && !hasW8W9;
      case 'w8w9wx': return hasW8W9 && hasWX;
      default: return true;
    }
  }
}
