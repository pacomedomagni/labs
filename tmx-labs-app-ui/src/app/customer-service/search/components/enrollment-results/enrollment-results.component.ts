import { Component, DestroyRef, effect, inject, input, Signal, signal } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CustomerInfo, EnrollmentDetails } from '../../../../shared/data/participant/resources';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { AccountService } from '../../../../shared/services/api/account/account.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EnrollmentResultsTableComponent } from '../enrollment-results-table/enrollment-results-table.component';
import { EnrollmentDetailService } from 'src/app/customer-service/enrollment-details/participant-details/services/enrollment-details/enrollment-details.service';
import { EnrollmentDetailsComponent } from 'src/app/customer-service/enrollment-details/enrollment-details.component';

@Component({
  selector: 'tmx-enrollment-results',
  imports: [MatTableModule, MatPaginatorModule, MatButtonModule, EnrollmentResultsTableComponent, EnrollmentDetailsComponent],
  templateUrl: './enrollment-results.component.html',
  styleUrl: './enrollment-results.component.scss'
})
export class EnrollmentResultsComponent {
  destroyRef = inject(DestroyRef);
  enrollmentDetailStore = inject(EnrollmentDetailService);
  accountService = inject(AccountService);
  enrollmentDetailService = inject(EnrollmentDetailService);
  
  dataArray = input<CustomerInfo[]>();

  showDetails = signal(false);
  dataSource = new MatTableDataSource<CustomerInfo>();
  currentParticipantGroupId: number | null = null;
  enrollmentDetails: Signal<EnrollmentDetails | null> = this.enrollmentDetailStore.details;

  constructor(){
    effect(() => {
      const data = this.dataArray() || [];
      this.dataSource.data = data;
      
      if(data.length === 1){
        this.viewParticipant(data[0]);
        return;
      }
      
      this.enrollmentDetailStore.clear();
      this.showDetails.set(false);
      this.currentParticipantGroupId = null;
    });
  }

  viewParticipant(element: CustomerInfo) {
    const baseDetails: EnrollmentDetails = {
      customer: element,
      accounts: [],
    };

    this.enrollmentDetailStore.updateEnrollmentDetails(baseDetails);
    this.showDetails.set(true);
    const participantGroupSeqId = element.participantGroup?.participantGroupSeqID ?? null;
    this.currentParticipantGroupId = participantGroupSeqId;

    if (participantGroupSeqId === null) {
      return;
    }

    this.accountService
      .getAccountsByParticipantGroupSeqId(participantGroupSeqId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (this.currentParticipantGroupId !== participantGroupSeqId) {
            return;
          }
          const updatedDetails: EnrollmentDetails = {
            customer: element,
            accounts: response.accounts ?? [],
          };
          this.enrollmentDetailStore.updateEnrollmentDetails(updatedDetails);
        },
        error: () => {
          if (this.currentParticipantGroupId === participantGroupSeqId) {
            this.enrollmentDetailStore.updateEnrollmentDetails({ customer: element, accounts: [] });
          }
        },
      });
  }
}
