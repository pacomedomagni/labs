import { inject, Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { Observable } from 'rxjs';
import {
    CustomerSearchResponse,
    GetCustsByDevSearchResponse,
} from 'src/app/shared/data/participant/resources';

@Injectable({
    providedIn: 'root',
})
export class CustomerSearchService {
    private readonly controller = '/SupportService/CustomerSearch';
    private api = inject(ApiService);

    getCustomersBySearchRequest(search: string): Observable<CustomerSearchResponse> {
        return this.api.get<CustomerSearchResponse>({
            uri: `${this.controller}/getCustomersBySearchRequest?id=${search}`,
        });
    }

    getCustomersByDeviceSearchRequest(deviceId: string): Observable<GetCustsByDevSearchResponse> {
        return this.api.get<GetCustsByDevSearchResponse>({
            uri: `${this.controller}/getCustomersByDeviceSearchRequest?deviceId=${deviceId}`,
        });
    }
}
