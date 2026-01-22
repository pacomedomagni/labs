import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EnrollmentResultsComponent } from './enrollment-results.component';
import { CustomerInfo } from '../../../../shared/data/participant/resources';
import { ComponentRef } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { AccountService } from '../../../../shared/services/api/account/account.service';
import { of } from 'rxjs';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { OAuthStorage } from 'angular-oauth2-oidc';
import { EnrollmentDetailService } from 'src/app/customer-service/enrollment-details/participant-details/services/enrollment-details/enrollment-details.service';

describe('EnrollmentResultsComponent', () => {
  let component: EnrollmentResultsComponent;
  let componentRef: ComponentRef<EnrollmentResultsComponent>;
  let fixture: ComponentFixture<EnrollmentResultsComponent>;
  let selectionService: EnrollmentDetailService;

  const mockCustomerData: CustomerInfo[] = [
    {
      user: {
        accessType: 'Standard',
        address: '123 Main St',
        city: 'Test City',
        company: 'Test Company',
        email: 'test1@example.com',
        firstName: 'John',
        fullName: 'John Doe',
        lastName: 'Doe',
        password: '',
        passwordAnswer: '',
        passwordQuestion: '',
        passwordResetDate: '',
        phoneNumber: '555-0100',
        roles: ['Customer'],
        state: 'CA',
        uid: 'uid-1',
        userName: 'johndoe',
        zip: '90001'
      },
      participantGroup: {
        participantGroupSeqID: 1,
      },
      pendingOrdersForCustomer: false
    },
    {
      user: {
        accessType: 'Standard',
        address: '456 Oak Ave',
        city: 'Test City',
        company: 'Test Company 2',
        email: 'test2@example.com',
        firstName: 'Jane',
        fullName: 'Jane Smith',
        lastName: 'Smith',
        password: '',
        passwordAnswer: '',
        passwordQuestion: '',
        passwordResetDate: '',
        phoneNumber: '555-0101',
        roles: ['Customer'],
        state: 'NY',
        uid: 'uid-2',
        userName: 'janesmith',
        zip: '10001'
      },
      participantGroup: {
        participantGroupSeqID: 2,
      },
      pendingOrdersForCustomer: true
    }
  ];

  class MockAccountService {
    getAccountsByParticipantGroupSeqId = jasmine
      .createSpy('getAccountsByParticipantGroupSeqId')
      .and.returnValue(of({ accounts: [] }));
  }

  beforeEach(async () => {
    const authStorageSpy = jasmine.createSpyObj('OAuthStorage', ['getItem', 'setItem', 'removeItem']);

    await TestBed.configureTestingModule({
      imports: [EnrollmentResultsComponent, MatButtonModule, MatPaginatorModule, MatTableModule],
      providers: [EnrollmentDetailService, { provide: AccountService, useClass: MockAccountService },
        { provide: OAuthStorage, useValue: authStorageSpy },
        provideHttpClientTesting(),
        provideHttpClient(),
        provideNoopAnimations()
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EnrollmentResultsComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    selectionService = TestBed.inject(EnrollmentDetailService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should populate dataSource when dataArray input is set', () => {
    componentRef.setInput('dataArray', mockCustomerData);
    fixture.detectChanges();

    expect(component.dataSource.data.length).toBe(2);
    expect(component.dataSource.data).toEqual(mockCustomerData);
  });

  it('should update dataSource when dataArray input changes', () => {
    componentRef.setInput('dataArray', mockCustomerData);
    fixture.detectChanges();
    expect(component.dataSource.data.length).toBe(2);

    const newData = [mockCustomerData[0]];
    componentRef.setInput('dataArray', newData);
    fixture.detectChanges();

    expect(component.dataSource.data.length).toBe(1);
    expect(component.dataSource.data).toEqual(newData);
  });

  it('should handle empty array input', () => {
    componentRef.setInput('dataArray', []);
    fixture.detectChanges();

    expect(component.dataSource.data.length).toBe(0);
    expect(component.dataSource.data).toEqual([]);
  });

  it('should handle undefined input', () => {
    componentRef.setInput('dataArray', undefined);
    fixture.detectChanges();

    expect(component.dataSource.data.length).toBe(0);
    expect(component.dataSource.data).toEqual([]);
  });

  it('should set selection and show details when viewParticipant is called', () => {
    const customer = mockCustomerData[0];

    componentRef.setInput('dataArray', mockCustomerData);
    fixture.detectChanges();

    component.viewParticipant(customer);

    const detail = selectionService.details();
    expect(detail?.customer.user?.fullName).toBe(customer.user.fullName);
    expect(component.showDetails()).toBeTrue();
  });

  it('should clear selection when data array changes', () => {
    const customer = mockCustomerData[0];

    componentRef.setInput('dataArray', mockCustomerData);
    fixture.detectChanges();

    component.viewParticipant(customer);
    expect(selectionService.details()).not.toBeNull();
    expect(component.showDetails()).toBeTrue();

    componentRef.setInput('dataArray', [...mockCustomerData]);
    fixture.detectChanges();

    expect(selectionService.details()).toBeNull();
    expect(component.showDetails()).toBeFalse();
  });

});
