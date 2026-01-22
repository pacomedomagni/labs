import { TestBed } from "@angular/core/testing";
import { CustomerUpdateService } from "./customer-update";
import { ApiService } from "../api.service";
import { of, throwError } from "rxjs";
import { CustomerInfo, User } from "../../../data/participant/resources";
import { UpdateCustomerRequest } from "src/app/customer-service/enrollment-details/customer-details/components/customer-details-edit/customer-details-edit.models";


describe("CustomerUpdateService", () => {
  let service: CustomerUpdateService;
  let apiService: jasmine.SpyObj<ApiService>;

  const mockUser: User = {
    accessType: "standard",
    address: "123 Test St",
    city: "Test City",
    company: "Test Company",
    email: "test@example.com",
    firstName: "John",
    fullName: "John Doe",
    lastName: "Doe",
    password: "password123",
    passwordAnswer: "test",
    passwordQuestion: "test question",
    passwordResetDate: "2023-01-01",
    phoneNumber: "555-1234",
    roles: ["user"],
    state: "TX",
    uid: "test-uid",
    userName: "jdoe",
    zip: "12345",
    extenders: [],
    messages: []
  } as User;

  const mockCustomerInfo: CustomerInfo = {
    user: mockUser,
    participantGroup: null,
    pendingOrdersForCustomer: false,
    extenders: [],
    messages: []
  } as CustomerInfo;

  const mockUpdateResponse = {
    success: true,
    message: "Customer updated successfully"
  };

  beforeEach(() => {
    const apiServiceSpy = jasmine.createSpyObj("ApiService", ["put"]);

    TestBed.configureTestingModule({
      providers: [
        CustomerUpdateService,
        { provide: ApiService, useValue: apiServiceSpy }
      ]
    });

    service = TestBed.inject(CustomerUpdateService);
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("putUpdateCustomer", () => {
    it("should call api.put with correct parameters", () => {
      apiService.put.and.returnValue(of(mockUpdateResponse));

      service.putUpdateCustomer(mockCustomerInfo);

      expect(apiService.put).toHaveBeenCalledWith({
        uri: "/SupportService/UpdateCustomer/UpdateCustomer",
        payload: { customer: mockCustomerInfo } as UpdateCustomerRequest
      });
    });

    it("should return the response from the API", (done) => {
      apiService.put.and.returnValue(of(undefined));

      service.putUpdateCustomer(mockCustomerInfo).subscribe(response => {
        expect(response).toBeUndefined();
        done();
      });
    });

    it("should handle API errors", (done) => {
      const mockError = { status: 500, message: "Internal Server Error" };
      apiService.put.and.returnValue(throwError(() => mockError));

      service.putUpdateCustomer(mockCustomerInfo).subscribe({
        next: () => fail("Expected an error, but got a successful response"),
        error: (error) => {
          expect(error).toEqual(mockError);
          done();
        }
      });
    });

    it("should work with minimal customer info", () => {
      const minimalCustomer: CustomerInfo = {
        user: null,
        participantGroup: null,
        pendingOrdersForCustomer: null,
        extenders: [],
        messages: []
      } as CustomerInfo;
      apiService.put.and.returnValue(of(mockUpdateResponse));

      service.putUpdateCustomer(minimalCustomer);

      expect(apiService.put).toHaveBeenCalledWith({
        uri: "/SupportService/UpdateCustomer/UpdateCustomer",
        payload: { customer: minimalCustomer } as UpdateCustomerRequest
      });
    });

    it("should handle null customer gracefully", () => {
      const nullCustomer: CustomerInfo = null!;
      apiService.put.and.returnValue(of(mockUpdateResponse));

      service.putUpdateCustomer(nullCustomer);

      expect(apiService.put).toHaveBeenCalledWith({
        uri: "/SupportService/UpdateCustomer/UpdateCustomer",
        payload: { customer: nullCustomer } as UpdateCustomerRequest
      });
    });

    it("should preserve customer data in the request payload", () => {
      const customerWithData: CustomerInfo = {
        ...mockCustomerInfo,
        customProperty: "test value",
        anotherProperty: 123
      } as CustomerInfo;

      apiService.put.and.returnValue(of(mockUpdateResponse));

      service.putUpdateCustomer(customerWithData);

      const expectedPayload = { customer: customerWithData } as UpdateCustomerRequest;
      expect(apiService.put).toHaveBeenCalledWith({
        uri: "/SupportService/UpdateCustomer/UpdateCustomer",
        payload: expectedPayload
      });
    });
  });

  describe("service configuration", () => {
    it("should have the correct controller path", () => {
      interface TestableCustomerUpdateService {
        controller: string;
      }
      expect((service as unknown as TestableCustomerUpdateService).controller).toBe("/SupportService/UpdateCustomer");
    });

    it("should be provided in root", () => {
      const serviceMetadata = (CustomerUpdateService as any).ɵprov; // eslint-disable-line @typescript-eslint/no-explicit-any
      expect(serviceMetadata.providedIn).toBe("root");
    });

    it("should inject ApiService correctly", () => {
      interface TestableServiceWithApi {
        api: ApiService;
      }
      const serviceWithApi = service as unknown as TestableServiceWithApi;
      expect(serviceWithApi.api).toBeDefined();
      expect(serviceWithApi.api).toBe(apiService);
    });
  });

  describe("integration with ApiService", () => {
    it("should pass through API service options", () => {
      apiService.put.and.returnValue(of(mockUpdateResponse));

      service.putUpdateCustomer(mockCustomerInfo);

      const apiCall = apiService.put.calls.mostRecent();
      expect(apiCall.args[0]).toEqual({
        uri: "/SupportService/UpdateCustomer/UpdateCustomer",
        payload: { customer: mockCustomerInfo } as UpdateCustomerRequest
      });
    });

    it("should maintain the observable chain", (done) => {
      const delayedResponse = of(undefined);
      apiService.put.and.returnValue(delayedResponse);

      const result$ = service.putUpdateCustomer(mockCustomerInfo);

      expect(result$).toBeDefined();
      result$.subscribe(response => {
        expect(response).toBeUndefined();
        done();
      });
    });
  });
});