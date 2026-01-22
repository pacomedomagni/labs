import { inject, Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { Observable } from 'rxjs';
import { CustomerInfo } from 'src/app/shared/data/participant/resources';
import { UpdateCustomerRequest } from 'src/app/customer-service/enrollment-details/customer-details/components/customer-details-edit/customer-details-edit.models';

@Injectable({
  providedIn: 'root'
})
export class CustomerUpdateService {
  private readonly controller = "/SupportService/UpdateCustomer";
  private api = inject(ApiService);
  
  public putUpdateCustomer(customer: CustomerInfo): Observable<void> {
    return this.api.put<void>({
        uri: `${this.controller}/UpdateCustomer`,
        payload: { customer } as UpdateCustomerRequest
    });
  }
}
