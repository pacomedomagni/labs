import { inject, Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { Observable } from 'rxjs';
import { AddAccountRequest, AddAccountResponse, ContactDetailsModel } from 'src/app/shared/data/user-management/resources';

@Injectable({
    providedIn: 'root',
})
export class CustomerServiceService {
    private readonly controller = '/UserManagement';
    private api = inject(ApiService);

    validateNewCustomer(emailAddress: string): Observable<ContactDetailsModel> {
        return this.api.post<ContactDetailsModel>({
            uri: `${this.controller}/ValidateNewCustomer`,
            payload: {
                emailAddress: emailAddress,
            },
        });
    }

    submitNewUserEnrollment(accountData: AddAccountRequest): Observable<AddAccountResponse> {
        return this.api.post<AddAccountResponse>({
            uri: `${this.controller}/AddNewAccount`,
            payload: accountData,
        });
    }
}
