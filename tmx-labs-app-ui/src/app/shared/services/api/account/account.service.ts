import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';
import { AccountCollectionResponse } from 'src/app/shared/data/participant/resources';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private readonly api = inject(ApiService);
  private readonly controller = '/Account';

  getAccountsByParticipantGroupSeqId(participantGroupSeqId: number): Observable<AccountCollectionResponse> {
    return this.api.get<AccountCollectionResponse>({
      uri: `${this.controller}/getAccountsByParticipantGroupSeqId?participantGroupSeqId=${participantGroupSeqId}`,
    });
  }
}
