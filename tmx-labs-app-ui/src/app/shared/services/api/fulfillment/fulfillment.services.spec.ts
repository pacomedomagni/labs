import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { FulfillmentService } from './fulfillment.services';
import { ApiService } from '../api.service';
import { OrderListDetails, OrderDetails, AssingDeviceRequest } from '../../../data/fulfillment/resources';

describe('FulfillmentService', () => {
  let service: FulfillmentService;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;

  const mockOrderListDetails: OrderListDetails = {
    deviceOrders: [
      {
        deviceOrderSeqID: 1,
        nbrDevicesNeeded: 3,
        name: 'John Doe',
        email: 'john@example.com',
        orderNumber: 'ORD-0001',
        orderDate: '2024-01-01T00:00:00Z',
        state: 'CA',
        deviceType: 'J(2), X(1)',
        snapshotVersion: '1.0.0',
        deviceOrderStatusDescription: 'Pending Assignment'
      },
      {
        deviceOrderSeqID: 2,
        nbrDevicesNeeded: 2,
        name: 'Jane Smith',
        email: 'jane@example.com',
        orderNumber: 'ORD-0002',
        orderDate: '2024-02-01T00:00:00Z',
        state: 'NY',
        deviceType: 'X(2)',
        snapshotVersion: '1.0.0',
        deviceOrderStatusDescription: 'Ready to Print'
      }
    ],
    deviceOrderStatusCode: 1,
    numberOfOrders: 2,
    numberOfDevices: 5,
    participantGroupTypeCode: 1,
    canOnlyViewOrdersForOwnGroup: false
  };

  const mockOrderDetails: OrderDetails = {
    customerName: 'John Doe',
    email: 'john@example.com',
    fulfilledByUserID: 'user123',
    deviceOrderSeqID: 1,
    participantGroupSeqID: 10,
    devicesAssigned: false,
    hasErrors: false,
    deviceTypes: [
      { deviceTypeCode: 1, description: 'Type A' },
      { deviceTypeCode: 2, description: 'Type B' }
    ],
    mobileOSNames: ['iOS', 'Android'],
    vehicles: []
  };

  const mockAssignDeviceRequest: AssingDeviceRequest = {
    myScoreVehicle: {
      year: 2024,
      make: 'Toyota',
      model: 'Camry',
      message: '',
      deviceOrderDetailSeqID: 1,
      participantSeqID: 100,
      deviceTypeSelected: 1,
      newDeviceSerialNumber: 'SN123456',
      newDeviceRegistrationKey: 'test@example.com',
      mobileOSName: 'iOS',
      mobileDeviceModelName: 'iPhone 14',
      mobileOSVersionName: '17.0',
      mobileAppVersionName: '1.0.0'
    },
    orderDetails: mockOrderDetails
  };

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

  describe('getOrderDetails', () => {
    it('should call ApiService.get with correct endpoint and deviceOrderSeqId parameter', () => {
      apiServiceSpy.get.and.returnValue(of(mockOrderDetails));

      service.getOrderDetails(1).subscribe();

      expect(apiServiceSpy.get).toHaveBeenCalledWith({
        uri: '/Fulfillment/OrderDetails?deviceOrderSeqID=1'
      });
    });

    it('should return order details', (done) => {
      apiServiceSpy.get.and.returnValue(of(mockOrderDetails));

      service.getOrderDetails(1).subscribe(result => {
        expect(result).toEqual(mockOrderDetails);
        expect(result.customerName).toBe('John Doe');
        expect(result.email).toBe('john@example.com');
        expect(result.deviceOrderSeqID).toBe(1);
        done();
      });
    });

    it('should handle different deviceOrderSeqId values', () => {
      apiServiceSpy.get.and.returnValue(of(mockOrderDetails));

      service.getOrderDetails(12345).subscribe();

      expect(apiServiceSpy.get).toHaveBeenCalledWith({
        uri: '/Fulfillment/OrderDetails?deviceOrderSeqID=12345'
      });
    });
  });

  describe('getOrdersByStatus', () => {
    it('should call ApiService.get with correct endpoint and parameters', () => {
      apiServiceSpy.get.and.returnValue(of(mockOrderListDetails));

      service.getOrdersByStatus(1, 1, false).subscribe();

      expect(apiServiceSpy.get).toHaveBeenCalledWith({
        uri: '/Fulfillment/OrdersByStatus?deviceOrderStatusCode=1&participantGroupTypeCode=1&canOnlyViewOrdersForOwnGroup=false'
      });
    });

    it('should return order list details', (done) => {
      apiServiceSpy.get.and.returnValue(of(mockOrderListDetails));

      service.getOrdersByStatus(1, 1, false).subscribe(result => {
        expect(result).toEqual(mockOrderListDetails);
        expect(result.numberOfOrders).toBe(2);
        expect(result.numberOfDevices).toBe(5);
        expect(result.deviceOrders.length).toBe(2);
        done();
      });
    });

    it('should handle different status codes', () => {
      apiServiceSpy.get.and.returnValue(of(mockOrderListDetails));

      service.getOrdersByStatus(2, 1, false).subscribe();

      expect(apiServiceSpy.get).toHaveBeenCalledWith({
        uri: '/Fulfillment/OrdersByStatus?deviceOrderStatusCode=2&participantGroupTypeCode=1&canOnlyViewOrdersForOwnGroup=false'
      });
    });

    it('should handle canOnlyViewOrdersForOwnGroup set to true', () => {
      apiServiceSpy.get.and.returnValue(of(mockOrderListDetails));

      service.getOrdersByStatus(1, 2, true).subscribe();

      expect(apiServiceSpy.get).toHaveBeenCalledWith({
        uri: '/Fulfillment/OrdersByStatus?deviceOrderStatusCode=1&participantGroupTypeCode=2&canOnlyViewOrdersForOwnGroup=true'
      });
    });
  });

  describe('assignDevicesToOrder', () => {
    it('should call ApiService.post with correct endpoint and payload', () => {
      apiServiceSpy.post.and.returnValue(of(undefined));

      service.assignDevicesToOrder(mockAssignDeviceRequest).subscribe();

      expect(apiServiceSpy.post).toHaveBeenCalledWith({
        uri: '/Fulfillment/AssignDevices',
        payload: mockAssignDeviceRequest
      });
    });

    it('should complete successfully', (done) => {
      apiServiceSpy.post.and.returnValue(of(undefined));

      service.assignDevicesToOrder(mockAssignDeviceRequest).subscribe({
        next: () => {
          expect(true).toBe(true);
          done();
        }
      });
    });
  });

  describe('getProcessedOrdersCount', () => {
    it('should call ApiService.get with correct endpoint', () => {
      apiServiceSpy.get.and.returnValue(of(42));

      service.getProcessedOrdersCount().subscribe();

      expect(apiServiceSpy.get).toHaveBeenCalledWith({
        uri: '/Fulfillment/ProcessedOrderCount'
      });
    });

    it('should return the processed orders count', (done) => {
      const mockCount = 123;
      apiServiceSpy.get.and.returnValue(of(mockCount));

      service.getProcessedOrdersCount().subscribe(result => {
        expect(result).toBe(123);
        done();
      });
    });

    it('should handle zero count', (done) => {
      apiServiceSpy.get.and.returnValue(of(0));

      service.getProcessedOrdersCount().subscribe(result => {
        expect(result).toBe(0);
        done();
      });
    });
  });
});
