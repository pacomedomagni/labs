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

  // Completed orders
  completedOrderData = signal<CompletedOrdersList | null>(null);

  selectedTab = signal(0);

  ngOnInit() {
    this.loadData();
    // Refresh every 10 minutes
    this.refreshInterval = window.setInterval(() => {
      this.loadData();
    }, 10 * 60 * 1000);
  }

  ngOnDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private loadData() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    this.subscription = forkJoin({
      pendingOrders: this.fulfillmentService.getPendingOrderList(),
      processedCount: this.fulfillmentService.getProcessedOrdersCount(),
      completedOrders: this.fulfillmentService.getCompletedOrderList()
    }).subscribe({
      next: (result) => {
        this.pendingOrders.set(result.pendingOrders.numberOfOrders);
        this.devicesNeeded.set(result.pendingOrders.numberOfDevices);
        this.pendingOrderData.set(result.pendingOrders.deviceOrders);
        this.completedToday.set(result.processedCount);
        this.completedOrderData.set(result.completedOrders);
      },
      error: (error) => {
        console.error('Error loading fulfillment data:', error);
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
}
