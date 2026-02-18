import { Component, input, output } from '@angular/core';
import { CustomerInfo } from '../../../../shared/data/participant/resources';
import { EnrollmentResultsTableComponent } from '../enrollment-results-table/enrollment-results-table.component';

@Component({
  selector: 'tmx-enrollment-results',
  imports: [EnrollmentResultsTableComponent],
  templateUrl: './enrollment-results.component.html',
  styleUrl: './enrollment-results.component.scss'
})
export class EnrollmentResultsComponent {
  dataArray = input<CustomerInfo[]>();
  viewParticipant = output<CustomerInfo>();
}
