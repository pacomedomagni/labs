import { Injectable, Signal, computed, inject, signal } from '@angular/core';
import { AccountService } from 'src/app/shared/services/api/account/account.service';
import { take } from 'rxjs/internal/operators/take';
import { AccountDeviceSummary, AccountParticipantSummary, CustomerInfo, EnrollmentDetails } from 'src/app/shared/data/participant/resources';

@Injectable({ providedIn: 'root' })
export class EnrollmentDetailService {
  private readonly _details = signal<EnrollmentDetails | null>(null);
  accountService = inject(AccountService);

  readonly details: Signal<EnrollmentDetails | null> = computed(() => this._details());

  updateEnrollmentDetails(details: EnrollmentDetails | null): void {
    this._details.set(details);
  }

  updateParticipantDevice(
    participantSeqID: number, 
    updates: Partial<AccountDeviceSummary>
  ): void {
    const current = this._details();
    if (!current) {
      return;
    }

    const accountIndex = current.accounts.findIndex(
      t => t.participant.participantSeqID === participantSeqID
    );
    if (accountIndex === -1) {
      return;
    }

    // Create new accounts array with updated participant
    const updatedAccounts = [...current.accounts];
    updatedAccounts[accountIndex] = {
      ...updatedAccounts[accountIndex],
      device: {
        ...updatedAccounts[accountIndex].device,
        ...updates
      }
    };

    // Update the enrollment details
    const updatedDetails: EnrollmentDetails = {
      customer: current.customer,
      accounts: updatedAccounts,
    };

    this.updateEnrollmentDetails(updatedDetails);
  }

  updateParticipant(
    participantSeqID: number,
    updates: Partial<AccountParticipantSummary>
  ): void {
    const current = this._details();
    if (!current) {
      return;
    }

    const accountIndex = current.accounts.findIndex(
      t => t.participant.participantSeqID === participantSeqID
    );
    if (accountIndex === -1) {
      return;
    }

    const updatedAccounts = [...current.accounts];
    updatedAccounts[accountIndex] = {
      ...updatedAccounts[accountIndex],
      participant: {
        ...updatedAccounts[accountIndex].participant,
        ...updates,
      },
    };

    const updatedDetails: EnrollmentDetails = {
      customer: current.customer,
      accounts: updatedAccounts,
    };

    this.updateEnrollmentDetails(updatedDetails);
  }

  updateCustomerDetails(updatedCustomer: CustomerInfo): void {
    const current = this._details();
    if (!current) {
      return;
    }

    const updatedDetails: EnrollmentDetails = {
      customer: updatedCustomer,
      accounts: current.accounts,
    };
    this.updateEnrollmentDetails(updatedDetails);
  }

  refreshEnrollmentDetails(): void {
    const current = this._details();
    if (!current?.customer?.participantGroup?.participantGroupSeqID) {
      return;
    }
    const participantGroupSeqId = current.customer.participantGroup.participantGroupSeqID;

    this.accountService
      .getAccountsByParticipantGroupSeqId(participantGroupSeqId)
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          if (this._details()?.customer?.participantGroup?.participantGroupSeqID !== participantGroupSeqId) {
            return;
          }

          const updatedDetails: EnrollmentDetails = {
            customer: current.customer,
            accounts: response.accounts ?? [],
          };
          this.updateEnrollmentDetails(updatedDetails);
        },
        error: () => {
          if (this._details()?.customer?.participantGroup?.participantGroupSeqID === participantGroupSeqId) {
            this.updateEnrollmentDetails({ customer: current.customer, accounts: [] });
          }
        },
      });
  }

  clear(): void {
    this._details.set(null);
  }
}
