import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin, Subscription } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { PendingOrdersComponent } from './components/pending-orders/pending-orders.component';
import { CompletedOrdersComponent } from './components/completed-orders/completed-orders.component';
import { FulfillmentService } from '../shared/services/api/fulfillment/fulfillment.services';
import { DeviceOrder, CompletedOrdersList } from '../shared/data/fulfillment/resources';

@Component({
  selector: 'tmx-customer-service-fulfillment',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTabsModule,
    PendingOrdersComponent,
    CompletedOrdersComponent
  ],
  templateUrl: './fulfillment.component.html',
  styleUrl: './fulfillment.component.scss'
})
export class CustomerServiceFulfillmentComponent implements OnInit, OnDestroy {
  private fulfillmentService = inject(FulfillmentService);
  private refreshInterval?: number;
  private subscription?: Subscription;

  // Summary statistics
  pendingOrders = signal(0);
  devicesNeeded = signal(0);
  completedToday = signal(0);
  pendingOrderData = signal<DeviceOrder[]>([]);

  // Completed orders data
  completedOrderData = signal<CompletedOrdersList | null>(null);
  completedOrdersLoading = signal(false);
  private completedOrdersSubscription?: Subscription;

  selectedTab = signal(0);

  ngOnInit() {
    this.loadOrderCounts();
    // Refresh order counts every 10 minutes
    this.refreshInterval = window.setInterval(() => {
      this.loadOrderCounts();
    }, 10 * 60 * 1000);
  }

  ngOnDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.completedOrdersSubscription) {
      this.completedOrdersSubscription.unsubscribe();
    }
  }

  private loadOrderCounts() {
    // Unsubscribe from previous request if still pending
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    this.subscription = forkJoin({
      pendingOrders: this.fulfillmentService.getPendingOrderList(),
      processedCount: this.fulfillmentService.getProcessedOrdersCount()
    }).subscribe({
      next: (result) => {
        this.pendingOrders.set(result.pendingOrders.numberOfOrders);
        this.devicesNeeded.set(result.pendingOrders.numberOfDevices);
        this.pendingOrderData.set(result.pendingOrders.deviceOrders);
        this.completedToday.set(result.processedCount);
      },
      error: (error) => {
        console.error('Error loading order counts:', error);
      }
    });
  }

  onTabChange(index: number) {
    this.selectedTab.set(index);
  }

  onOrderSelected(order: DeviceOrder | { orderNumber: string }) {
    // TODO: Open Order Details modal (PBI 6478014)
    console.log('Order selected:', order.orderNumber);
  }

  loadCompletedOrders(startDate: Date, endDate: Date) {
    if (this.completedOrdersSubscription) {
      this.completedOrdersSubscription.unsubscribe();
    }

    this.completedOrdersLoading.set(true);
    const start = this.formatDate(startDate);
    const end = this.formatDate(endDate);

    this.completedOrdersSubscription = this.fulfillmentService.getCompletedOrderList(start, end).subscribe({
      next: (result) => {
        this.completedOrderData.set(result);
        this.completedOrdersLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading completed orders:', error);
        this.completedOrdersLoading.set(false);
      }
    });
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
