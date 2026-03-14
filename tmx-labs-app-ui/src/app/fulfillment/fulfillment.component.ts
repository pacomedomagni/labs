import { Component, inject, OnInit, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { PendingOrdersComponent } from './components/pending-orders/pending-orders.component';
import { CompletedOrdersComponent } from './components/completed-orders/completed-orders.component';
import { PrinterInfoComponent } from './components/printer-info/printer-info.component';
import { FulfillmentService } from '../shared/services/api/fulfillment/fulfillment.services';
import { DeviceOrder, CompletedOrdersList, CompletedDeviceOrder } from '../shared/data/fulfillment/resources';
import { OrderActionsService } from './services/order-actions.service';
import { DeviceOrderReloadService } from './services/device-order-reload.service';

@Component({
  selector: 'tmx-customer-service-fulfillment',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    PendingOrdersComponent,
    CompletedOrdersComponent,
    PrinterInfoComponent
  ],
  templateUrl: './fulfillment.component.html',
  styleUrl: './fulfillment.component.scss'
})
export class CustomerServiceFulfillmentComponent implements OnInit {
  private fulfillmentService = inject(FulfillmentService);
  private orderActionsService = inject(OrderActionsService);
  private reloadService = inject(DeviceOrderReloadService);
  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // Summary statistics
  pendingOrders = signal(0);
  devicesNeeded = signal(0);
  completedToday = signal(0);
  pendingOrderData = signal<DeviceOrder[]>([]);
  allPendingOrders: DeviceOrder[] = []; // Store all orders for filtering

  // Completed orders
  completedOrderData = signal<CompletedOrdersList | null>(null);
  allCompletedOrders: CompletedOrdersList | null = null; // Store all completed orders for filtering

  selectedTab = signal(0);
  searchType = 'orderNumber';
  searchValue = '';
  searchError = '';

  ngOnInit() {
    // Check for deviceOrderSeqId query param to auto-open Device Order modal
    const deviceOrderSeqId = this.route.snapshot.queryParams['deviceOrderSeqId'];
    
    // Initial load
    this.loadData(true, deviceOrderSeqId ? Number(deviceOrderSeqId) : undefined);
    
    // Subscribe to reload events (auto every 10 minutes + manual triggers)
    this.reloadService.reload$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.loadData(false);
      });
  }

  // TODO: Consider moving this to a state service so we can update orders in-place when actions are taken, instead of reloading the entire list after every action
  private loadData(initialLoad: boolean, autoOpenDeviceOrderSeqId?: number) {
    forkJoin({
      pendingOrders: this.fulfillmentService.getPendingOrderList(initialLoad), // Skip loading indicator only for manual triggers
      processedCount: this.fulfillmentService.getProcessedOrdersCount(initialLoad),
      completedOrders: this.fulfillmentService.getCompletedOrderList(initialLoad)
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.pendingOrders.set(result.pendingOrders.numberOfOrders);
          this.devicesNeeded.set(result.pendingOrders.numberOfDevices);
          this.allPendingOrders = result.pendingOrders.deviceOrders;
          this.pendingOrderData.set(result.pendingOrders.deviceOrders);
          this.completedToday.set(result.processedCount);
          this.allCompletedOrders = result.completedOrders;
          this.completedOrderData.set(result.completedOrders);
          
          // Auto-open Device Order modal if deviceOrderSeqId was provided
          if (autoOpenDeviceOrderSeqId) {
            const order = result.pendingOrders.deviceOrders.find(
              (o) => o.deviceOrderSeqID === autoOpenDeviceOrderSeqId
            );

            if (order) {
              this.router.navigate([], {
                relativeTo: this.route,
                queryParams: {},
                replaceUrl: true,
              });

              this.orderActionsService.openPendingDeviceOrder(order);
            } else {
              // Order not found - might be completed or invalid ID
              console.warn(`Device order with ID ${autoOpenDeviceOrderSeqId} not found in pending orders`);
              
              this.router.navigate([], {
                relativeTo: this.route,
                queryParams: {},
                replaceUrl: true,
              });
            }
          }
        },
        error: (error) => {
          console.error('Error loading fulfillment data:', error);
        }
      });
  }

  onTabChange(index: number) {
    this.selectedTab.set(index);
  }

  onPendingOrderSelected(order: DeviceOrder) {
    this.orderActionsService.openPendingDeviceOrder(order);
  }

  onCompletedOrderSelected(order: CompletedDeviceOrder) {
    this.orderActionsService.openCompletedDeviceOrder(order);
  }

  onSearchTypeChange() {
    this.searchValue = '';
    this.searchError = '';
  }

  onSearch() {
    if (!this.searchValue.trim()) {
      // If search is empty, reset to show all orders
      this.clearSearch();
      return;
    }
    
    this.searchError = '';

    if (this.searchType === 'orderNumber') {
      // const orderNumber = parseInt(this.searchValue.trim(), 10);
      
      // if (isNaN(orderNumber)) {
      //   this.searchError = 'Order number must be a valid number';
      //   return;
      // }

      this.fulfillmentService.getPendingOrderByNumber(this.searchValue.trim())
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (order) => {
            this.pendingOrderData.set([order]);
            this.completedOrderData.set(this.allCompletedOrders);
            this.selectedTab.set(0);
          },
          error: () => {
            this.fulfillmentService.getCompletedOrderByNumber(this.searchValue.trim())
              .pipe(takeUntilDestroyed(this.destroyRef))
              .subscribe({
                next: (completedOrder) => {
                  if (this.allCompletedOrders) {
                    const filteredList: CompletedOrdersList = {
                      orders: [completedOrder],
                      totalCount: 1,
                      processedByUsers: this.allCompletedOrders.processedByUsers
                    };
                    this.completedOrderData.set(filteredList);
                  }
                  this.pendingOrderData.set(this.allPendingOrders);
                  this.selectedTab.set(1);
                },
                error: () => {
                  this.searchError = 'Order Number was not found';
                  this.pendingOrderData.set(this.allPendingOrders);
                  this.completedOrderData.set(this.allCompletedOrders);
                }
              });
          }
        });
    } else if (this.searchType === 'email') {
      const emailAddress = this.searchValue.trim();

      this.fulfillmentService.getOrderByEmail(emailAddress)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (orders) => {
            if (orders && orders.length > 0) {
              this.pendingOrderData.set(orders);
              this.completedOrderData.set(this.allCompletedOrders);
              this.selectedTab.set(0);
            } else {
              this.searchError = 'Email Address was not found';
              this.pendingOrderData.set(this.allPendingOrders);
              this.completedOrderData.set(this.allCompletedOrders);
            }
          },
          error: () => {
            this.searchError = 'Email Address was not found';
            this.pendingOrderData.set(this.allPendingOrders);
            this.completedOrderData.set(this.allCompletedOrders);
          }
        });
    } else if (this.searchType === 'deviceSerial') {
      const serialNumber = this.searchValue.trim();

      this.fulfillmentService.getOrderByDeviceSerialNumber(serialNumber)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (completedOrder) => {
            if (this.allCompletedOrders) {
              const filteredList: CompletedOrdersList = {
                orders: [completedOrder],
                totalCount: 1,
                processedByUsers: this.allCompletedOrders.processedByUsers
              };
              this.completedOrderData.set(filteredList);
            }
            this.pendingOrderData.set(this.allPendingOrders);
            this.selectedTab.set(1);
          },
          error: () => {
            this.searchError = 'Device Serial Number was not found';
            this.pendingOrderData.set(this.allPendingOrders);
            this.completedOrderData.set(this.allCompletedOrders);
          }
        });
    }
  }

  clearSearch() {
    this.searchValue = '';
    this.searchError = '';
    this.pendingOrderData.set(this.allPendingOrders);
    this.completedOrderData.set(this.allCompletedOrders);
  }

  searchPattern(): string {
    if (this.searchType === 'email') {
      // Email pattern - escape backslash for dot
      return '[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}';
    }
    // Order Number or Device Serial Number - hyphen at end to avoid range issues
    return '[A-Za-z0-9_\\-]*';
  }

  searchMaxLength(): number {
    if (this.searchType === 'email') {
      return 100; // Email can be longer
    }
    return 50;
  }

  searchPlaceholder(): string {
    switch (this.searchType) {
      case 'orderNumber':
        return 'Enter order number';
      case 'email':
        return 'Enter email address';
      case 'deviceSerial':
        return 'Enter device serial number';
      default:
        return 'Enter search term';
    }
  }

  searchErrorMessage(): string {
    if (this.searchError) {
      return this.searchError;
    }
    if (this.searchType === 'email') {
      return 'Please enter a valid email address';
    }
    return 'Only letters, numbers, underscore, and hyphen allowed';
  }
}
