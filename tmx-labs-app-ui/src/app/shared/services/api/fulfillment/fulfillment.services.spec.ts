import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { FulfillmentService } from './fulfillment.services';
import { ApiService } from '../api.service';
import { OrderType } from '../../../data/application/enums';
import { Orders, OrdersByState, OrderDetails, StateOrder } from '../../../data/application/resources';

describe('FulfillmentService', () => {
  let service: FulfillmentService;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;

  const mockOrders: Orders = {
    searchOrderNumber: '',
    searchBeginDate: '',
    searchEndDate: '',
    type: OrderType.Snapshot1Only,
    openSnapshotOrders: 150,
    processedSnapshotOrders: 45,
    snapshotDevicesNeeded: 300,
    openCommercialLinesOrders: 75,
    processedCommercialLinesOrders: 20,
    commercialLinesDevicesNeeded: 150
  };

  const mockStateOrder: StateOrder = {
    state: 'OH',
    numberOfOrders: 25,
    numberOfDevices: 50,
    numberOfOldOrders: 5,
    oldestOrder: new Date('2026-01-15'),
    numberDaysForOldOrders: 28
  };

  const mockOrdersByState: OrdersByState = {
    type: OrderType.Snapshot1Only,
    stateOrders: [mockStateOrder]
  };

  const mockOrderDetails: OrderDetails[] = [
    {
      orderId: '12345',
      orderNumber: '28303829-NEW',
      orderDate: new Date('2026-01-15T11:12:37'),
      state: 'GA',
      deviceCount: 3,
      deviceType: 'J, V, W, Y, Z',
      status: 'Pending Assignment',
      vehicleInfo: '2024 Toyota Camry',
      deviceVersion: '3.0',
      shippingDetails: 'Standard Shipping'
    },
    {
      orderId: '12346',
      orderNumber: '82739283-NEW',
      orderDate: new Date('2026-01-17T02:11:10'),
      state: 'CT',
      deviceCount: 1,
      deviceType: 'J, V, W',
      status: 'Ready to Print'
    }
  ];

  beforeEach(() => {
    apiServiceSpy = jasmine.createSpyObj('ApiService', ['post', 'get']);

    TestBed.configureTestingModule({
      providers: [
        FulfillmentService,
        { provide: ApiService, useValue: apiServiceSpy }
      ]
    });

    service = TestBed.inject(FulfillmentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getOrderCounts', () => {
    it('should call ApiService.post with correct endpoint and payload', () => {
      apiServiceSpy.post.and.returnValue(of(mockOrders));

      service.getOrderCounts(mockOrders).subscribe();

      expect(apiServiceSpy.post).toHaveBeenCalledWith({
        uri: '/Fulfillment/OrderCounts',
        payload: mockOrders
      });
    });

    it('should return order counts data', (done) => {
      apiServiceSpy.post.and.returnValue(of(mockOrders));

      service.getOrderCounts(mockOrders).subscribe(result => {
        expect(result).toEqual(mockOrders);
        expect(result.openSnapshotOrders).toBe(150);
        expect(result.snapshotDevicesNeeded).toBe(300);
        expect(result.processedSnapshotOrders).toBe(45);
        done();
      });
    });

    it('should handle commercial lines orders', (done) => {
      const commercialOrders: Orders = {
        ...mockOrders,
        type: OrderType.CommercialLines,
        openCommercialLinesOrders: 75,
        commercialLinesDevicesNeeded: 150,
        processedCommercialLinesOrders: 20
      };

      apiServiceSpy.post.and.returnValue(of(commercialOrders));

      service.getOrderCounts(commercialOrders).subscribe(result => {
        expect(result.type).toBe(OrderType.CommercialLines);
        expect(result.openCommercialLinesOrders).toBe(75);
        expect(result.commercialLinesDevicesNeeded).toBe(150);
        done();
      });
    });
  });

  describe('getStateOrderCounts', () => {
    it('should call ApiService.post with correct endpoint and payload', () => {
      apiServiceSpy.post.and.returnValue(of(mockOrdersByState));

      service.getStateOrderCounts(mockOrdersByState).subscribe();

      expect(apiServiceSpy.post).toHaveBeenCalledWith({
        uri: '/Fulfillment/StateOrderCounts',
        payload: mockOrdersByState
      });
    });

    it('should return state order counts data', (done) => {
      apiServiceSpy.post.and.returnValue(of(mockOrdersByState));

      service.getStateOrderCounts(mockOrdersByState).subscribe(result => {
        expect(result).toEqual(mockOrdersByState);
        expect(result.stateOrders.length).toBe(1);
        expect(result.stateOrders[0].state).toBe('OH');
        expect(result.stateOrders[0].numberOfOrders).toBe(25);
        done();
      });
    });

    it('should handle multiple state orders', (done) => {
      const multiStateOrders: OrdersByState = {
        type: OrderType.Snapshot2Only,
        stateOrders: [
          mockStateOrder,
          { ...mockStateOrder, state: 'PA', numberOfOrders: 30 }
        ]
      };

      apiServiceSpy.post.and.returnValue(of(multiStateOrders));

      service.getStateOrderCounts(multiStateOrders).subscribe(result => {
        expect(result.stateOrders.length).toBe(2);
        expect(result.stateOrders[0].state).toBe('OH');
        expect(result.stateOrders[1].state).toBe('PA');
        done();
      });
    });
  });

  describe('getNewOrders', () => {
    it('should call ApiService.get with correct endpoint and orderType parameter', () => {
      apiServiceSpy.get.and.returnValue(of(mockOrderDetails));

      service.getNewOrders(OrderType.Snapshot1Only).subscribe();

      expect(apiServiceSpy.get).toHaveBeenCalledWith({
        uri: '/Fulfillment/NewOrders',
        payload: {
          orderType: OrderType.Snapshot1Only.toString()
        }
      });
    });

    it('should include orderState parameter when provided', () => {
      apiServiceSpy.get.and.returnValue(of(mockOrderDetails));

      service.getNewOrders(OrderType.Snapshot1Only, 'OH').subscribe();

      expect(apiServiceSpy.get).toHaveBeenCalledWith({
        uri: '/Fulfillment/NewOrders',
        payload: {
          orderType: OrderType.Snapshot1Only.toString(),
          orderState: 'OH'
        }
      });
    });

    it('should include orderId parameter when provided', () => {
      apiServiceSpy.get.and.returnValue(of(mockOrderDetails));

      service.getNewOrders(OrderType.Snapshot1Only, undefined, '12345').subscribe();

      expect(apiServiceSpy.get).toHaveBeenCalledWith({
        uri: '/Fulfillment/NewOrders',
        payload: {
          orderType: OrderType.Snapshot1Only.toString(),
          orderId: '12345'
        }
      });
    });

    it('should include both orderState and orderId when provided', () => {
      apiServiceSpy.get.and.returnValue(of(mockOrderDetails));

      service.getNewOrders(OrderType.CommercialLines, 'GA', '12345').subscribe();

      expect(apiServiceSpy.get).toHaveBeenCalledWith({
        uri: '/Fulfillment/NewOrders',
        payload: {
          orderType: OrderType.CommercialLines.toString(),
          orderState: 'GA',
          orderId: '12345'
        }
      });
    });

    it('should return list of order details', (done) => {
      apiServiceSpy.get.and.returnValue(of(mockOrderDetails));

      service.getNewOrders(OrderType.Snapshot1Only).subscribe(result => {
        expect(result).toEqual(mockOrderDetails);
        expect(result.length).toBe(2);
        expect(result[0].orderNumber).toBe('28303829-NEW');
        expect(result[0].state).toBe('GA');
        done();
      });
    });

    it('should handle empty order list', (done) => {
      apiServiceSpy.get.and.returnValue(of([]));

      service.getNewOrders(OrderType.Snapshot1Only, 'XX').subscribe(result => {
        expect(result).toEqual([]);
        expect(result.length).toBe(0);
        done();
      });
    });

    it('should handle different order types', () => {
      apiServiceSpy.get.and.returnValue(of(mockOrderDetails));

      service.getNewOrders(OrderType.CommercialLinesHeavyTruck).subscribe();

      expect(apiServiceSpy.get).toHaveBeenCalledWith({
        uri: '/Fulfillment/NewOrders',
        payload: {
          orderType: OrderType.CommercialLinesHeavyTruck.toString()
        }
      });
    });
  });
});
