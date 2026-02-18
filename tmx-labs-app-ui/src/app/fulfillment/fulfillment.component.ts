import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { PendingOrdersComponent } from './components/pending-orders/pending-orders.component';
import { CompletedOrdersComponent } from './components/completed-orders/completed-orders.component';
import { FulfillmentService } from '../shared/services/api/fulfillment/fulfillment.services';
import { Orders } from '../shared/data/application/resources';
import { OrderType } from '../shared/data/application/enums';

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
export class CustomerServiceFulfillmentComponent implements OnInit {
  private fulfillmentService = inject(FulfillmentService);

  // Summary statistics
  pendingOrders = signal(0);
  devicesNeeded = signal(0);
  completedToday = signal(0);
  
  selectedTab = signal(0);

  ngOnInit() {
    this.loadOrderCounts();
  }

  private loadOrderCounts() {
    const ordersModel: Orders = {
      searchOrderNumber: '',
      searchBeginDate: '',
      searchEndDate: '',
      type: OrderType.All,
      openSnapshotOrders: 0,
      processedSnapshotOrders: 0,
      snapshotDevicesNeeded: 0,
      openCommercialLinesOrders: 0,
      processedCommercialLinesOrders: 0,
      commercialLinesDevicesNeeded: 0
    };

    this.fulfillmentService.getOrderCounts(ordersModel).subscribe({
      next: (data: Orders) => {
        this.pendingOrders.set(data.openSnapshotOrders);
        this.devicesNeeded.set(data.snapshotDevicesNeeded);
        this.completedToday.set(data.processedSnapshotOrders);
      },
      error: (error) => {
        console.error('Error loading order counts:', error);
      }
    });
  }

  onTabChange(index: number) {
    this.selectedTab.set(index);
  }
}
